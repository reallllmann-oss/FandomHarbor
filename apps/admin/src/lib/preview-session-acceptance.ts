import type { TrustedAuthEvidence } from "@fandom-harbor/auth";
import { z } from "zod";

const TARGETS: Readonly<Record<string, string>> = Object.freeze({
  "cb1e6693-876d-4c4c-8153-3d0fbac6da17": "Phase2RemoteInviter",
  "5fa18bad-6a32-41c3-87e3-e761b00ef8f1": "akumie",
});
// Require a new password login for this acceptance window, without embedding
// the preserved H2 Session identifiers or any credential in the codebase.
const LOGIN_NOT_BEFORE = Date.parse("2026-10-28T00:00:00+08:00") / 1000;
const PREVIEW_REF = "bniqsjnjqesnpcfkpqcz";
const BRANCH = "codex/v1-package-b0-auth-architecture";

export function previewSessionEnvironmentAllowed(
  env: Record<string, string | undefined>,
) {
  const ids = env.B3_SA_ALLOWED_TARGET_UIDS?.split(",").map((id) =>
    id.trim().toLowerCase(),
  );
  return (
    env.VERCEL === "1" &&
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_TARGET_ENV === "preview" &&
    env.B3_SA_DEPLOYMENT_TARGET === "preview" &&
    Boolean(env.VERCEL_PROJECT_ID) &&
    env.VERCEL_PROJECT_ID === env.B3_SA_EXPECTED_VERCEL_PROJECT_ID &&
    env.VERCEL_GIT_COMMIT_REF === BRANCH &&
    env.B3_SA_EXPECTED_GIT_BRANCH === BRANCH &&
    env.B3_SA_EXPECTED_SUPABASE_PROJECT_REF === PREVIEW_REF &&
    env.NEXT_PUBLIC_SUPABASE_URL === `https://${PREVIEW_REF}.supabase.co` &&
    ids?.length === 2 &&
    new Set(ids).size === 2 &&
    ids.every((id) => Object.hasOwn(TARGETS, id))
  );
  // Deliberately independent of B3_SA_EMAIL_BINDING_ENABLED.
}

export type PreviewSessionErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NEW_LOGIN_REQUIRED"
  | "SESSION_MISMATCH"
  | "MFA_REJECTED"
  | "AUTH_UNAVAILABLE"
  | "LOGOUT_UNCONFIRMED";
export class PreviewSessionError extends Error {
  constructor(public readonly code: PreviewSessionErrorCode) {
    super(code);
  }
}
export interface PreviewTotpFactor {
  id: string;
}
export interface PreviewSessionGateway {
  current(): Promise<TrustedAuthEvidence | null>;
  readAccess(
    userId: string,
  ): Promise<{ activeMember: boolean; superAdmin: boolean }>;
  listVerifiedTotp(): Promise<readonly PreviewTotpFactor[]>;
  verifyTotp(factorId: string, code: string): Promise<void>;
  protectedSelfRead(userId: string, registrationName: string): Promise<void>;
  signOutLocal(): Promise<void>;
}

export function createPreviewSessionAcceptance(
  gateway: PreviewSessionGateway,
  now = () => Math.floor(Date.now() / 1000),
) {
  async function actor(expectedSessionId?: string) {
    const evidence = await gateway.current();
    if (!evidence) throw new PreviewSessionError("UNAUTHENTICATED");
    if (!Object.hasOwn(TARGETS, evidence.actorUserId))
      throw new PreviewSessionError("FORBIDDEN");
    if (
      !evidence.authenticationMethods.some(
        (m) =>
          m.method === "password" &&
          m.authenticatedAtEpochSeconds >= LOGIN_NOT_BEFORE &&
          m.authenticatedAtEpochSeconds <= now(),
      )
    )
      throw new PreviewSessionError("NEW_LOGIN_REQUIRED");
    if (
      expectedSessionId !== undefined &&
      evidence.sessionId !== expectedSessionId
    )
      throw new PreviewSessionError("SESSION_MISMATCH");
    return evidence;
  }
  async function authorized(expectedSessionId?: string) {
    const evidence = await actor(expectedSessionId);
    const access = await gateway.readAccess(evidence.actorUserId);
    if (!access.activeMember || !access.superAdmin)
      throw new PreviewSessionError("FORBIDDEN");
    return evidence;
  }
  function fresh(evidence: TrustedAuthEvidence) {
    const timestamp = Math.max(
      -1,
      ...evidence.authenticationMethods
        .filter((m) => m.method === "totp")
        .map((m) => m.authenticatedAtEpochSeconds),
    );
    return (
      evidence.assuranceLevel === "aal2" &&
      timestamp >= now() - 300 &&
      timestamp <= now()
    );
  }
  async function factors() {
    const list = await gateway.listVerifiedTotp();
    if (
      list.length !== 2 ||
      new Set(list.map((f) => f.id)).size !== 2 ||
      list.some((f) => !z.uuid().safeParse(f.id).success)
    )
      throw new PreviewSessionError("AUTH_UNAVAILABLE");
    return list;
  }
  return {
    async snapshot() {
      const evidence = await authorized();
      const verifiedFactors = await factors();
      const mfaVerified = fresh(evidence);
      if (mfaVerified)
        await gateway.protectedSelfRead(
          evidence.actorUserId,
          TARGETS[evidence.actorUserId]!,
        );
      return {
        userId: evidence.actorUserId,
        sessionId: evidence.sessionId,
        registrationName: TARGETS[evidence.actorUserId]!,
        assuranceLevel: evidence.assuranceLevel,
        factors: verifiedFactors,
        mfaVerified,
        protectedReadVerified: mfaVerified,
      };
    },
    async verify(expectedSessionId: string, factorId: string, code: string) {
      const before = await authorized(expectedSessionId);
      if (
        !/^\d{6}$/u.test(code) ||
        !(await factors()).some((f) => f.id === factorId)
      )
        throw new PreviewSessionError("MFA_REJECTED");
      const startedAt = now();
      await gateway.verifyTotp(factorId, code);
      const after = await authorized(expectedSessionId);
      if (
        after.actorUserId !== before.actorUserId ||
        !fresh(after) ||
        !after.authenticationMethods.some(
          (m) =>
            m.method === "totp" && m.authenticatedAtEpochSeconds >= startedAt,
        )
      )
        throw new PreviewSessionError("MFA_REJECTED");
      await gateway.protectedSelfRead(
        after.actorUserId,
        TARGETS[after.actorUserId]!,
      );
    },
    async logout(expectedSessionId: string) {
      await actor(expectedSessionId);
      // The gateway must confirm revocation at Auth, not just delete cookies.
      await gateway.signOutLocal();
    },
  };
}
