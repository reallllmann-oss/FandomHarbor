import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import {
  isValidRegistrationName,
  normalizeRegistrationName,
} from "@fandom-harbor/auth";
import { z } from "zod";

const configSchema = z.object({
  AUTH_RATE_LIMIT_SECRET: z.string().min(32),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
});

const uuidResultSchema = z.uuid().nullable();
const adminUserSchema = z.object({
  email: z.string().pipe(z.email()),
  id: z.uuid(),
});
const PASSWORD_RECOVERY_GRANT_VERSION = "v1";
export const PASSWORD_RECOVERY_GRANT_TTL_SECONDS = 10 * 60;
const UNKNOWN_LOGIN_DECOY_USER_ID = "00000000-0000-4000-8000-000000000000";

export class ServerAuthSecurityError extends Error {
  constructor(
    public readonly code:
      "CONFIGURATION" | "RATE_LIMITED" | "REQUEST_REJECTED" | "UNAVAILABLE",
  ) {
    super("Authentication request could not be completed");
    this.name = "ServerAuthSecurityError";
  }
}

type FetchImplementation = typeof fetch;

function serviceHeaders(secretKey: string) {
  return {
    apikey: secretKey,
    authorization: `Bearer ${secretKey}`,
    "content-type": "application/json",
  };
}

async function responseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createServerAuthSecurityBroker(
  environment: Record<string, string | undefined>,
  transport: FetchImplementation = fetch,
) {
  const parsed = configSchema.safeParse(environment);
  if (!parsed.success) throw new ServerAuthSecurityError("CONFIGURATION");
  const config = parsed.data;
  const headers = serviceHeaders(config.SUPABASE_SECRET_KEY);

  function subjectHash(scope: string, subject: string) {
    return createHmac("sha256", config.AUTH_RATE_LIMIT_SECRET)
      .update(scope)
      .update("\0")
      .update(subject)
      .digest("hex");
  }

  function recoveryGrantSignature(userId: string, expiresAt: number) {
    return createHmac("sha256", config.AUTH_RATE_LIMIT_SECRET)
      .update("password-recovery")
      .update("\0")
      .update(PASSWORD_RECOVERY_GRANT_VERSION)
      .update("\0")
      .update(userId)
      .update("\0")
      .update(String(expiresAt))
      .digest("hex");
  }

  async function rpc(name: string, body: Record<string, unknown>) {
    return transport(`${config.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  return {
    issuePasswordRecoveryGrant(userId: string, now = Date.now()) {
      const parsedUserId = z.uuid().safeParse(userId);
      if (!parsedUserId.success) {
        throw new ServerAuthSecurityError("REQUEST_REJECTED");
      }
      const expiresAt =
        Math.floor(now / 1000) + PASSWORD_RECOVERY_GRANT_TTL_SECONDS;
      const signature = recoveryGrantSignature(parsedUserId.data, expiresAt);
      return `${PASSWORD_RECOVERY_GRANT_VERSION}.${parsedUserId.data}.${expiresAt}.${signature}`;
    },

    verifyPasswordRecoveryGrant(
      grant: string | undefined,
      userId: string,
      now = Date.now(),
    ) {
      if (!grant) return false;
      const [version, grantUserId, expiresAtValue, signature, ...extra] =
        grant.split(".");
      const expiresAt = Number(expiresAtValue);
      if (
        extra.length > 0 ||
        version !== PASSWORD_RECOVERY_GRANT_VERSION ||
        grantUserId !== userId ||
        !z.uuid().safeParse(grantUserId).success ||
        !Number.isSafeInteger(expiresAt) ||
        expiresAt < Math.floor(now / 1000) ||
        expiresAt >
          Math.floor(now / 1000) + PASSWORD_RECOVERY_GRANT_TTL_SECONDS ||
        !signature
      ) {
        return false;
      }
      const expected = recoveryGrantSignature(grantUserId, expiresAt);
      const actualBytes = Buffer.from(signature, "utf8");
      const expectedBytes = Buffer.from(expected, "utf8");
      return (
        actualBytes.length === expectedBytes.length &&
        timingSafeEqual(actualBytes, expectedBytes)
      );
    },

    async consumeRateLimit(
      scope: string,
      subject: string,
      limit: number,
      windowSeconds: number,
    ) {
      const response = await rpc("consume_auth_rate_limit", {
        p_limit: limit,
        p_scope: scope,
        p_subject_hash: subjectHash(scope, subject),
        p_window_seconds: windowSeconds,
      });
      const allowed = z.boolean().safeParse(await responseJson(response));
      if (!response.ok || !allowed.success) {
        throw new ServerAuthSecurityError("UNAVAILABLE");
      }
      if (!allowed.data) throw new ServerAuthSecurityError("RATE_LIMITED");
    },

    async getRegistrationMode() {
      const response = await rpc("get_registration_mode", {});
      const mode = z
        .enum(["email_required", "legacy"])
        .safeParse(await responseJson(response));
      if (!response.ok || !mode.success) {
        throw new ServerAuthSecurityError("UNAVAILABLE");
      }
      return mode.data;
    },

    async resolveLoginName(registrationName: string) {
      const normalized = normalizeRegistrationName(registrationName);
      if (!isValidRegistrationName(normalized)) return null;
      const response = await rpc("resolve_login_name_user_id", {
        p_registration_name: normalized,
      });
      const userId = uuidResultSchema.safeParse(await responseJson(response));
      if (!response.ok || !userId.success) {
        throw new ServerAuthSecurityError("UNAVAILABLE");
      }
      if (!userId.data) {
        const decoyResponse = await transport(
          `${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${UNKNOWN_LOGIN_DECOY_USER_ID}`,
          { headers },
        );
        await responseJson(decoyResponse);
        return null;
      }

      const userResponse = await transport(
        `${config.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId.data}`,
        { headers },
      );
      const user = adminUserSchema.safeParse(await responseJson(userResponse));
      if (!userResponse.ok || !user.success || user.data.id !== userId.data) {
        throw new ServerAuthSecurityError("UNAVAILABLE");
      }
      return {
        email: user.data.email.toLowerCase(),
        isLegacyEmail: user.data.email
          .toLowerCase()
          .endsWith("@accounts.fandom-harbor.invalid"),
        userId: user.data.id,
      };
    },
  };
}

export function createWebServerAuthSecurityBroker() {
  return createServerAuthSecurityBroker({
    AUTH_RATE_LIMIT_SECRET: process.env.AUTH_RATE_LIMIT_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });
}
