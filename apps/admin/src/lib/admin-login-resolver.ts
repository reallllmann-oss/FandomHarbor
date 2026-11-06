import "server-only";

import {
  isValidRegistrationName,
  normalizeRegistrationName,
} from "@fandom-harbor/auth";
import { z } from "zod";
import {
  AdminLoginStageError,
  reportAdminLoginDiagnostic,
  safeAdminLoginCode,
  type AdminLoginDiagnostic,
  type AdminLoginStage,
} from "./admin-login-diagnostics";
import { previewSessionEnvironmentAllowed } from "./preview-session-acceptance";

const configSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().regex(/^sb_secret_[A-Za-z0-9_-]{20,}$/u),
});
const userIdSchema = z.uuid().nullable();
const userSchema = z.object({ id: z.uuid(), email: z.email() });
const DECOY_USER_ID = "00000000-0000-0000-0000-000000000000";

async function json(
  response: Response,
  stage: AdminLoginStage,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new AdminLoginStageError(
      stage,
      response.status,
      "MALFORMED_RESPONSE",
    );
  }
}

export function createAdminLoginResolver(
  environment: Record<string, string | undefined> = process.env,
  transport: typeof fetch = fetch,
  report: (value: AdminLoginDiagnostic) => void = reportAdminLoginDiagnostic,
) {
  const parsed = configSchema.safeParse(environment);
  if (!parsed.success)
    throw new AdminLoginStageError(
      "SERVER_CONFIGURATION",
      null,
      typeof environment.SUPABASE_SECRET_KEY === "string" &&
        !/^sb_secret_[A-Za-z0-9_-]{20,}$/u.test(environment.SUPABASE_SECRET_KEY)
        ? "INVALID_SERVER_KEY_FORMAT"
        : "CONFIGURATION",
    );
  const config = parsed.data;
  const url = config.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/u, "");
  const headers = {
    apikey: config.SUPABASE_SECRET_KEY,
    "content-type": "application/json",
  };
  async function request(
    stage: AdminLoginStage,
    path: string,
    init: RequestInit = {},
  ) {
    let response: Response;
    try {
      response = await transport(`${url}${path}`, {
        ...init,
        headers,
        cache: "no-store",
        redirect: "error",
      });
    } catch {
      throw new AdminLoginStageError(stage, null, "TRANSPORT_ERROR");
    }
    const body = await json(response, stage);
    if (!response.ok) {
      const code =
        body !== null && typeof body === "object" && "code" in body
          ? safeAdminLoginCode(body.code)
          : body !== null &&
              typeof body === "object" &&
              "message" in body &&
              body.message === "Invalid API key"
            ? "INVALID_API_KEY"
            : "PROVIDER_REJECTED";
      throw new AdminLoginStageError(stage, response.status, code);
    }
    return { body, status: response.status };
  }

  return {
    async resolve(registrationName: string) {
      const normalized = normalizeRegistrationName(registrationName);
      if (!isValidRegistrationName(normalized)) return null;
      // Reuse B2's canonical name registry, then read the current Auth email.
      // This supports both legacy .invalid identities and in-place email changes.
      const response = await request(
        "NAME_UID_RPC",
        "/rest/v1/rpc/resolve_login_name_user_id",
        {
          method: "POST",
          body: JSON.stringify({ p_registration_name: normalized }),
        },
      );
      const userId = userIdSchema.safeParse(response.body);
      if (!userId.success)
        throw new AdminLoginStageError(
          "NAME_UID_RPC",
          response.status,
          "MALFORMED_RESPONSE",
        );
      report({
        stage: "NAME_UID_RPC",
        http_status: response.status,
        error_code: "OK",
      });

      if (userId.data === null) {
        // Match the existing Web broker's decoy read without authenticating an
        // invented legacy email when there is no authoritative name claim.
        try {
          const decoy = await transport(
            `${url}/auth/v1/admin/users/${DECOY_USER_ID}`,
            { headers, cache: "no-store", redirect: "error" },
          );
          await decoy.body?.cancel();
        } catch {
          throw new AdminLoginStageError(
            "AUTH_USER_LOOKUP",
            null,
            "TRANSPORT_ERROR",
          );
        }
        return null;
      }
      const userResponse = await request(
        "AUTH_USER_LOOKUP",
        `/auth/v1/admin/users/${userId.data}`,
      );
      const user = userSchema.safeParse(userResponse.body);
      if (!user.success)
        throw new AdminLoginStageError(
          "AUTH_USER_LOOKUP",
          userResponse.status,
          "MALFORMED_RESPONSE",
        );
      if (user.data.id !== userId.data)
        throw new AdminLoginStageError(
          "AUTH_USER_LOOKUP",
          userResponse.status,
          "UID_MISMATCH",
        );
      report({
        stage: "AUTH_USER_LOOKUP",
        http_status: userResponse.status,
        error_code: "OK",
      });
      return { userId: user.data.id, email: user.data.email.toLowerCase() };
    },
  };
}

export async function runAdminPreviewLoginPreflight(
  environment: Record<string, string | undefined> = process.env,
) {
  const rows: AdminLoginDiagnostic[] = [];
  try {
    if (!previewSessionEnvironmentAllowed(environment))
      throw new AdminLoginStageError("SERVER_CONFIGURATION", null, "FORBIDDEN");
    const resolver = createAdminLoginResolver(environment, fetch, (row) => {
      rows.push(row);
      reportAdminLoginDiagnostic(row);
    });
    const resolved = await resolver.resolve("Phase2RemoteInviter");
    if (!resolved)
      throw new AdminLoginStageError(
        "RESOLVED_UID_CHECK",
        null,
        "UNKNOWN_NAME",
      );
    if (resolved.userId !== "cb1e6693-876d-4c4c-8153-3d0fbac6da17")
      throw new AdminLoginStageError(
        "RESOLVED_UID_CHECK",
        null,
        "UID_MISMATCH",
      );
    rows.push({
      stage: "RESOLVED_UID_CHECK",
      http_status: null,
      error_code: "OK",
    });
    return { passed: true, rows };
  } catch (error) {
    const row =
      error instanceof AdminLoginStageError
        ? error.diagnostic
        : {
            stage: "SERVER_CONFIGURATION" as const,
            http_status: null,
            error_code: "UNCLASSIFIED_ERROR",
          };
    reportAdminLoginDiagnostic(row);
    rows.push(row);
    return { passed: false, rows };
  }
}
