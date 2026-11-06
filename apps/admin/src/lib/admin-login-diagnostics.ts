export type AdminLoginStage =
  | "REGISTRATION_VALIDATION"
  | "SERVER_CONFIGURATION"
  | "NAME_UID_RPC"
  | "AUTH_USER_LOOKUP"
  | "RESOLVED_UID_CHECK"
  | "PASSWORD_AUTHENTICATION"
  | "SESSION_UID_CHECK"
  | "ADMIN_ACCESS_CHECK";

export interface AdminLoginDiagnostic {
  stage: AdminLoginStage;
  http_status: number | null;
  error_code: string;
}
const SAFE_CODES = new Set([
  "OK",
  "INVALID_INPUT",
  "INVALID_SERVER_KEY_FORMAT",
  "CONFIGURATION",
  "TRANSPORT_ERROR",
  "MALFORMED_RESPONSE",
  "PROVIDER_REJECTED",
  "UID_MISMATCH",
  "UNKNOWN_NAME",
  "FORBIDDEN",
  "UNCLASSIFIED_ERROR",
  "INVALID_API_KEY",
  "INVALID_CREDENTIALS",
  "PGRST301",
  "PGRST302",
  "PGRST303",
  "PGRST202",
  "42501",
  "invalid_api_key",
  "invalid_credentials",
  "email_not_confirmed",
  "user_banned",
  "over_request_rate_limit",
  "bad_jwt",
  "not_admin",
  "user_not_found",
  "session_not_found",
]);

export function safeAdminLoginCode(value: unknown): string {
  return typeof value === "string" && SAFE_CODES.has(value)
    ? value
    : "UNCLASSIFIED_ERROR";
}

export class AdminLoginStageError extends Error {
  readonly diagnostic: AdminLoginDiagnostic;
  constructor(
    stage: AdminLoginStage,
    httpStatus: number | null,
    errorCode: string,
  ) {
    super("Admin login could not be completed");
    this.diagnostic = {
      stage,
      http_status: httpStatus,
      error_code: safeAdminLoginCode(errorCode),
    };
  }
}

export function reportAdminLoginDiagnostic(diagnostic: AdminLoginDiagnostic) {
  console.info({
    stage: diagnostic.stage,
    http_status:
      typeof diagnostic.http_status === "number" &&
      Number.isInteger(diagnostic.http_status) &&
      diagnostic.http_status >= 100 &&
      diagnostic.http_status <= 599
        ? diagnostic.http_status
        : null,
    error_code: safeAdminLoginCode(diagnostic.error_code),
  });
}
