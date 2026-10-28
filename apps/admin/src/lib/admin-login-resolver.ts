import "server-only";

import {
  isValidRegistrationName,
  normalizeRegistrationName,
} from "@fandom-harbor/auth";
import { z } from "zod";

const configSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});
const userIdSchema = z.uuid().nullable();
const userSchema = z.object({ id: z.uuid(), email: z.email() });
const DECOY_USER_ID = "00000000-0000-0000-0000-000000000000";

function unavailable() {
  // Never expose an Auth response, email, credential or account-existence hint.
  return new Error("Admin login could not be completed");
}

async function json(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw unavailable();
  }
}

export function createAdminLoginResolver(
  environment: Record<string, string | undefined> = process.env,
  transport: typeof fetch = fetch,
) {
  const parsed = configSchema.safeParse(environment);
  if (!parsed.success) throw unavailable();
  const config = parsed.data;
  const url = config.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/u, "");
  const headers = {
    apikey: config.SUPABASE_SECRET_KEY,
    authorization: `Bearer ${config.SUPABASE_SECRET_KEY}`,
    "content-type": "application/json",
  };

  return {
    async resolve(registrationName: string) {
      const normalized = normalizeRegistrationName(registrationName);
      if (!isValidRegistrationName(normalized)) return null;
      // Reuse B2's canonical name registry, then read the current Auth email.
      // This supports both legacy .invalid identities and in-place email changes.
      const response = await transport(
        `${url}/rest/v1/rpc/resolve_login_name_user_id`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ p_registration_name: normalized }),
          cache: "no-store",
          redirect: "error",
        },
      );
      const userId = userIdSchema.safeParse(await json(response));
      if (!response.ok || !userId.success) throw unavailable();

      const userResponse = await transport(
        `${url}/auth/v1/admin/users/${userId.data ?? DECOY_USER_ID}`,
        { headers, cache: "no-store", redirect: "error" },
      );
      if (userId.data === null) {
        // Match the existing Web broker's decoy read without authenticating an
        // invented legacy email when there is no authoritative name claim.
        await userResponse.body?.cancel();
        return null;
      }
      const user = userSchema.safeParse(await json(userResponse));
      if (!userResponse.ok || !user.success || user.data.id !== userId.data) {
        throw unavailable();
      }
      return { userId: user.data.id, email: user.data.email.toLowerCase() };
    },
  };
}
