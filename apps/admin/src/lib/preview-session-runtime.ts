import "server-only";

import { trustedAuthEvidenceFromVerifiedClaims } from "@fandom-harbor/auth";
import { createServerSupabaseClient } from "@fandom-harbor/database";
import { z } from "zod";

import { createAdminIdentityAccess } from "./identity-access";
import {
  createPreviewSessionAcceptance,
  PreviewSessionError,
  previewSessionEnvironmentAllowed,
  type PreviewSessionGateway,
} from "./preview-session-acceptance";

type Client = ReturnType<typeof createServerSupabaseClient>;
type Access = Awaited<
  ReturnType<typeof createAdminIdentityAccess>
>["accessRepository"];
const selfReadSchema = z.object({
  userId: z.uuid(),
  registrationName: z.string(),
  membership: z.object({ state: z.literal("active") }),
  effectiveRoles: z.array(z.string()),
});

export function createPreviewSessionGateway(
  client: Client,
  access: Access,
): PreviewSessionGateway {
  return {
    async current() {
      // Network-authenticated getUser checks the GoTrue Session still exists;
      // getClaims alone would only establish JWT authenticity.
      const user = await client.auth.getUser();
      if (user.error || !user.data.user) return null;
      const claims = await client.auth.getClaims();
      if (claims.error || !claims.data)
        throw new PreviewSessionError("AUTH_UNAVAILABLE");
      const evidence = trustedAuthEvidenceFromVerifiedClaims(
        claims.data.claims,
      );
      const aal = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        aal.error ||
        aal.data.currentLevel !== evidence.assuranceLevel ||
        user.data.user.id !== evidence.actorUserId
      )
        throw new PreviewSessionError("AUTH_UNAVAILABLE");
      return evidence;
    },
    async readAccess(userId) {
      const result = await access.getForIdentity({ id: userId });
      if (result.identity.id !== userId)
        throw new PreviewSessionError("FORBIDDEN");
      return {
        activeMember: result.membershipState === "active",
        superAdmin: result.capabilities.has("super_admin:operate"),
      };
    },
    async listVerifiedTotp() {
      const { data, error } = await client.auth.mfa.listFactors();
      if (error || !data) throw new PreviewSessionError("AUTH_UNAVAILABLE");
      return data.totp
        .filter((f) => f.status === "verified")
        .map((f) => ({ id: f.id }));
    },
    async verifyTotp(factorId, code) {
      const { error } = await client.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (error) throw new PreviewSessionError("MFA_REJECTED");
    },
    async protectedSelfRead(userId, registrationName) {
      const { data, error } = await client.rpc(
        "get_identity_access_subject_v1",
        { p_user_id: userId },
      );
      const parsed = selfReadSchema.safeParse(data);
      if (
        error ||
        !parsed.success ||
        parsed.data.userId !== userId ||
        parsed.data.registrationName !== registrationName ||
        !parsed.data.effectiveRoles.includes("super_admin")
      )
        throw new PreviewSessionError("FORBIDDEN");
    },
    async signOutLocal() {
      const session = await client.auth.getSession();
      const token = session.data.session?.access_token;
      if (session.error || !token)
        throw new PreviewSessionError("LOGOUT_UNCONFIRMED");
      const result = await client.auth.signOut({ scope: "local" });
      if (result.error) throw new PreviewSessionError("LOGOUT_UNCONFIRMED");
      // Token is server-memory-only. GoTrue v2.197.0 requireAuthentication
      // rejects a deleted session_id even while this JWT has not expired.
      const probe = await client.auth.getUser(token);
      if (probe.data.user || probe.error?.code !== "session_not_found")
        throw new PreviewSessionError("LOGOUT_UNCONFIRMED");
    },
  };
}

export async function createPreviewSessionRuntime(
  environment: Record<string, string | undefined> = process.env,
) {
  if (!previewSessionEnvironmentAllowed(environment))
    throw new PreviewSessionError("FORBIDDEN");
  const access = await createAdminIdentityAccess();
  const client = createServerSupabaseClient(
    access.runtime,
    access.cookieAdapter,
  );
  return createPreviewSessionAcceptance(
    createPreviewSessionGateway(client, access.accessRepository),
  );
}
