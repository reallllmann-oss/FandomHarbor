import {
  SuperAdminEmailBindingError,
  type AdvanceSuperAdminEmailBindingCommand,
  type BeginSuperAdminEmailBindingReauthCommand,
  type BindSuperAdminEmailBindingCommand,
  type CompleteSuperAdminEmailBindingCommand,
  type MarkSuperAdminEmailBindingRecoveryCommand,
  type PrepareSuperAdminEmailBindingCommand,
  type SuperAdminEmailBindingOperation,
  type SuperAdminEmailBindingPort,
  type SuperAdminEmailBindingStatus,
  type TerminateSuperAdminEmailBindingCommand,
} from "@fandom-harbor/services";

interface SuperAdminEmailBindingDataSource {
  advance(parameters: Record<string, unknown>): Promise<unknown>;
  assertContext(parameters: Record<string, unknown>): Promise<unknown>;
  beginReauth(parameters: Record<string, unknown>): Promise<unknown>;
  bind(parameters: Record<string, unknown>): Promise<unknown>;
  complete(parameters: Record<string, unknown>): Promise<unknown>;
  get(parameters: Record<string, unknown>): Promise<unknown>;
  getAllowedTargets(): Promise<unknown>;
  markRecoveryRequired(parameters: Record<string, unknown>): Promise<unknown>;
  prepare(parameters: Record<string, unknown>): Promise<unknown>;
  terminate(parameters: Record<string, unknown>): Promise<unknown>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const STATUSES = new Set<SuperAdminEmailBindingStatus>([
  "prepared",
  "bound",
  "current_confirmed",
  "new_email_sent",
  "identity_changed",
  "recovery_required",
  "awaiting_reauth",
  "completed",
  "cancelled",
  "expired",
  "failed",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function internal(): SuperAdminEmailBindingError {
  return new SuperAdminEmailBindingError("INTERNAL_FAILURE");
}

function exactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
) {
  const keys = Reflect.ownKeys(value);
  if (
    keys.some((key) => typeof key !== "string" || !expected.includes(key)) ||
    expected.some((key) => !Object.hasOwn(value, key))
  ) {
    throw internal();
  }
}

function uuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw internal();
  return value.toLowerCase();
}

function epoch(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw internal();
  return value as number;
}

function parseOperation(value: unknown): SuperAdminEmailBindingOperation {
  if (!isRecord(value)) throw internal();
  exactKeys(value, [
    "completedAtEpochSeconds",
    "emailFingerprintBound",
    "expiresAtEpochSeconds",
    "operationId",
    "preparedAtEpochSeconds",
    "recoveryReasonCode",
    "sessionBound",
    "status",
    "targetUserId",
  ]);
  if (
    typeof value.status !== "string" ||
    !STATUSES.has(value.status as SuperAdminEmailBindingStatus) ||
    typeof value.sessionBound !== "boolean" ||
    typeof value.emailFingerprintBound !== "boolean" ||
    (value.recoveryReasonCode !== null &&
      typeof value.recoveryReasonCode !== "string") ||
    (value.completedAtEpochSeconds !== null &&
      !Number.isSafeInteger(value.completedAtEpochSeconds))
  ) {
    throw internal();
  }
  return Object.freeze({
    completedAtEpochSeconds:
      value.completedAtEpochSeconds === null
        ? null
        : epoch(value.completedAtEpochSeconds),
    emailFingerprintBound: value.emailFingerprintBound,
    expiresAtEpochSeconds: epoch(value.expiresAtEpochSeconds),
    operationId: uuid(value.operationId),
    preparedAtEpochSeconds: epoch(value.preparedAtEpochSeconds),
    recoveryReasonCode: value.recoveryReasonCode,
    sessionBound: value.sessionBound,
    status: value.status as SuperAdminEmailBindingStatus,
    targetUserId: uuid(value.targetUserId),
  });
}

function iso(epochSeconds: number): string {
  if (!Number.isSafeInteger(epochSeconds) || epochSeconds < 0) throw internal();
  return new Date(epochSeconds * 1_000).toISOString();
}

async function parsed(
  request: Promise<unknown>,
): Promise<SuperAdminEmailBindingOperation> {
  return parseOperation(await request);
}

export function createSuperAdminEmailBindingRepository(
  source: SuperAdminEmailBindingDataSource,
): SuperAdminEmailBindingPort {
  return {
    advance(command: AdvanceSuperAdminEmailBindingCommand) {
      return parsed(
        source.advance({
          p_email_fingerprint: command.emailFingerprint,
          p_expected_status: command.expectedStatus,
          p_next_status: command.nextStatus,
          p_operation_id: command.operationId,
          p_session_id: command.sessionId,
        }),
      );
    },
    assertContext(command) {
      return parsed(
        source.assertContext({
          p_email_fingerprint: command.emailFingerprint,
          p_expected_status: command.expectedStatus,
          p_operation_id: command.operationId,
          p_session_id: command.sessionId,
        }),
      );
    },
    beginReauth(command: BeginSuperAdminEmailBindingReauthCommand) {
      return parsed(
        source.beginReauth({
          p_email_fingerprint: command.emailFingerprint,
          p_operation_id: command.operationId,
          p_original_session_id: command.originalSessionId,
        }),
      );
    },
    bind(command: BindSuperAdminEmailBindingCommand) {
      return parsed(
        source.bind({
          p_assurance_level: command.assuranceLevel,
          p_email_fingerprint: command.emailFingerprint,
          p_operation_id: command.operationId,
          p_password_verified_at: iso(command.passwordVerifiedAtEpochSeconds),
          p_session_id: command.sessionId,
          p_target_user_id: command.targetUserId,
          p_totp_authenticated_at: iso(command.totpAuthenticatedAtEpochSeconds),
        }),
      );
    },
    complete(command: CompleteSuperAdminEmailBindingCommand) {
      return parsed(
        source.complete({
          p_assurance_level: command.assuranceLevel,
          p_email_fingerprint: command.emailFingerprint,
          p_new_session_id: command.newSessionId,
          p_operation_id: command.operationId,
          p_password_reauthenticated_at: iso(
            command.passwordReauthenticatedAtEpochSeconds,
          ),
          p_protected_admin_read_verified: command.protectedAdminReadVerified,
          p_totp_authenticated_at: iso(command.totpAuthenticatedAtEpochSeconds),
        }),
      );
    },
    get(operationId: string) {
      return parsed(source.get({ p_operation_id: operationId }));
    },
    async getAllowedTargetUserIds() {
      const value = await source.getAllowedTargets();
      if (!Array.isArray(value)) throw internal();
      return Object.freeze(value.map(uuid));
    },
    markRecoveryRequired(command: MarkSuperAdminEmailBindingRecoveryCommand) {
      return parsed(
        source.markRecoveryRequired({
          p_email_fingerprint: command.emailFingerprint,
          p_operation_id: command.operationId,
          p_reason_code: command.reasonCode,
          p_session_id: command.sessionId,
        }),
      );
    },
    prepare(command: PrepareSuperAdminEmailBindingCommand) {
      return parsed(
        source.prepare({
          p_operator_reference: command.operatorReference,
          p_target_user_id: command.targetUserId,
          p_ttl_seconds: command.ttlSeconds,
        }),
      );
    },
    terminate(command: TerminateSuperAdminEmailBindingCommand) {
      return parsed(
        source.terminate({
          p_operation_id: command.operationId,
          p_reason_code: command.reasonCode,
          p_terminal_status: command.terminalStatus,
        }),
      );
    },
  };
}

export type { SuperAdminEmailBindingDataSource };
