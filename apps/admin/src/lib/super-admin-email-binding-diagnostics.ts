import "server-only";

export type BindingEntryStage =
  | "PREVIEW_BOUNDARY"
  | "SERVER_CONFIGURATION"
  | "TARGETS_READ"
  | "TARGET_SET"
  | "OPERATION_READ"
  | "LEDGER_RPC"
  | "ENTRY_READ";
export type BindingEntryCode =
  | "OK"
  | "BOUNDARY_REJECTED"
  | "CONFIGURATION_REJECTED"
  | "EMAIL_HMAC_REJECTED"
  | "SENDER_KEY_REJECTED"
  | "SERVER_KEY_REJECTED"
  | "PUBLIC_AUTH_CONFIGURATION_REJECTED"
  | "NODE_ENV_REJECTED"
  | "FEATURE_GATE_REJECTED"
  | "TRANSPORT_ERROR"
  | "PROVIDER_REJECTED"
  | "MALFORMED_RESPONSE"
  | "TARGET_SET_MISMATCH"
  | "UNCLASSIFIED_ERROR";
export interface BindingEntryDiagnostic {
  stage: BindingEntryStage;
  http_status: number | null;
  error_code: BindingEntryCode;
}

export class BindingEntryStageError extends Error {
  constructor(public readonly diagnostic: BindingEntryDiagnostic) {
    super(diagnostic.error_code);
  }
}

export function reportBindingEntryFailure(error: unknown) {
  // Never log an upstream error, message, cause, response body, or credential.
  const row: BindingEntryDiagnostic =
    error instanceof BindingEntryStageError
      ? error.diagnostic
      : {
          stage: "ENTRY_READ",
          http_status: null,
          error_code: "UNCLASSIFIED_ERROR",
        };
  console.error("[b3_sa_entry]", {
    stage: row.stage,
    http_status: row.http_status,
    error_code: row.error_code,
  });
}
