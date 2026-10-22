import type { TrustedAuthEvidence } from "@fandom-harbor/auth";

import {
  MAX_TOTP_AGE_SECONDS,
  requireFreshTotpEvidence,
  type ElevatedAccessClock,
  type ElevatedTrustedAuthEvidenceSource,
} from "./elevated-access-governance";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const FINGERPRINT_PATTERN = /^[0-9a-f]{64}$/u;
const REASON_CODE_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/u;

export const SUPER_ADMIN_EMAIL_BINDING_MIN_TTL_SECONDS = 60;
export const SUPER_ADMIN_EMAIL_BINDING_MAX_TTL_SECONDS = 60 * 60;

export type SuperAdminEmailBindingStatus =
  | "prepared"
  | "bound"
  | "current_confirmed"
  | "new_email_sent"
  | "identity_changed"
  | "recovery_required"
  | "awaiting_reauth"
  | "completed"
  | "cancelled"
  | "expired"
  | "failed";

export interface SuperAdminEmailBindingOperation {
  completedAtEpochSeconds: number | null;
  emailFingerprintBound: boolean;
  expiresAtEpochSeconds: number;
  operationId: string;
  preparedAtEpochSeconds: number;
  recoveryReasonCode: string | null;
  sessionBound: boolean;
  status: SuperAdminEmailBindingStatus;
  targetUserId: string;
}

export interface PasswordReauthenticationEvidence {
  authenticatedAtEpochSeconds: number;
  userId: string;
}

export interface PrepareSuperAdminEmailBindingCommand {
  operatorReference: string;
  targetUserId: string;
  ttlSeconds: number;
}

export interface BindSuperAdminEmailBindingCommand {
  assuranceLevel: "aal2";
  emailFingerprint: string;
  operationId: string;
  passwordVerifiedAtEpochSeconds: number;
  sessionId: string;
  targetUserId: string;
  totpAuthenticatedAtEpochSeconds: number;
}

export interface AdvanceSuperAdminEmailBindingCommand {
  emailFingerprint: string;
  expectedStatus: SuperAdminEmailBindingStatus;
  nextStatus: SuperAdminEmailBindingStatus;
  operationId: string;
  sessionId: string;
}

export interface MarkSuperAdminEmailBindingRecoveryCommand {
  emailFingerprint: string;
  operationId: string;
  reasonCode: string;
  sessionId: string;
}

export interface BeginSuperAdminEmailBindingReauthCommand {
  emailFingerprint: string;
  operationId: string;
  originalSessionId: string;
}

export interface CompleteSuperAdminEmailBindingCommand {
  assuranceLevel: "aal2";
  emailFingerprint: string;
  newSessionId: string;
  operationId: string;
  passwordReauthenticatedAtEpochSeconds: number;
  protectedAdminReadVerified: true;
  totpAuthenticatedAtEpochSeconds: number;
}

export interface TerminateSuperAdminEmailBindingCommand {
  operationId: string;
  reasonCode: string;
  terminalStatus: "cancelled" | "failed";
}

export interface SuperAdminEmailBindingPort {
  advance(
    command: AdvanceSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  assertContext(
    command: Pick<
      AdvanceSuperAdminEmailBindingCommand,
      "emailFingerprint" | "expectedStatus" | "operationId" | "sessionId"
    >,
  ): Promise<SuperAdminEmailBindingOperation>;
  beginReauth(
    command: BeginSuperAdminEmailBindingReauthCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  bind(
    command: BindSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  complete(
    command: CompleteSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  get(operationId: string): Promise<SuperAdminEmailBindingOperation>;
  getAllowedTargetUserIds(): Promise<readonly string[]>;
  markRecoveryRequired(
    command: MarkSuperAdminEmailBindingRecoveryCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  prepare(
    command: PrepareSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  terminate(
    command: TerminateSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
}

export type SuperAdminEmailBindingErrorCode =
  | "AAL2_REQUIRED"
  | "AUTHENTICATION_REQUIRED"
  | "FRESH_PASSWORD_REQUIRED"
  | "FRESH_TOTP_REQUIRED"
  | "INVALID_AUTH_EVIDENCE"
  | "INVALID_REQUEST"
  | "INVALID_TARGET"
  | "INTERNAL_FAILURE"
  | "STALE_PASSWORD"
  | "STALE_TOTP";

export class SuperAdminEmailBindingError extends Error {
  constructor(public readonly code: SuperAdminEmailBindingErrorCode) {
    super(code);
    this.name = "SuperAdminEmailBindingError";
  }
}

export interface SuperAdminEmailBindingServiceDependencies {
  auth: ElevatedTrustedAuthEvidenceSource;
  clock: ElevatedAccessClock;
  operations: SuperAdminEmailBindingPort;
}

export interface SuperAdminEmailBindingService {
  advance(
    input: AdvanceSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  assertContext(
    input: Pick<
      AdvanceSuperAdminEmailBindingCommand,
      "emailFingerprint" | "expectedStatus" | "operationId" | "sessionId"
    >,
  ): Promise<SuperAdminEmailBindingOperation>;
  beginReauth(
    input: BeginSuperAdminEmailBindingReauthCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  bind(input: {
    emailFingerprint: string;
    operationId: string;
    passwordEvidence: PasswordReauthenticationEvidence;
    targetUserId: string;
  }): Promise<SuperAdminEmailBindingOperation>;
  complete(input: {
    emailFingerprint: string;
    operationId: string;
    passwordEvidence: PasswordReauthenticationEvidence;
    protectedAdminReadVerified: boolean;
  }): Promise<SuperAdminEmailBindingOperation>;
  get(operationId: string): Promise<SuperAdminEmailBindingOperation>;
  markRecoveryRequired(
    input: MarkSuperAdminEmailBindingRecoveryCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  prepare(
    input: PrepareSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
  terminate(
    input: TerminateSuperAdminEmailBindingCommand,
  ): Promise<SuperAdminEmailBindingOperation>;
}

function invalid(code: SuperAdminEmailBindingErrorCode) {
  return new SuperAdminEmailBindingError(code);
}

function uuid(value: string): string {
  if (!UUID_PATTERN.test(value)) throw invalid("INVALID_REQUEST");
  return value.toLowerCase();
}

function fingerprint(value: string): string {
  if (!FINGERPRINT_PATTERN.test(value)) throw invalid("INVALID_REQUEST");
  return value;
}

function reasonCode(value: string): string {
  if (!REASON_CODE_PATTERN.test(value)) throw invalid("INVALID_REQUEST");
  return value;
}

function nowEpochSeconds(clock: ElevatedAccessClock): number {
  const value = Math.floor(clock.now().getTime() / 1_000);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw invalid("INTERNAL_FAILURE");
  }
  return value;
}

function freshPassword(
  evidence: PasswordReauthenticationEvidence,
  expectedUserId: string,
  now: number,
): number {
  const userId = uuid(evidence.userId);
  const timestamp = evidence.authenticatedAtEpochSeconds;
  if (userId !== expectedUserId) throw invalid("INVALID_AUTH_EVIDENCE");
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > now) {
    throw invalid("INVALID_AUTH_EVIDENCE");
  }
  if (now - timestamp > MAX_TOTP_AGE_SECONDS) {
    throw invalid("STALE_PASSWORD");
  }
  return timestamp;
}

function authForTarget(
  evidence: TrustedAuthEvidence | null,
  expectedUserId: string,
  now: number,
) {
  if (evidence === null) throw invalid("AUTHENTICATION_REQUIRED");
  if (uuid(evidence.actorUserId) !== expectedUserId) {
    throw invalid("INVALID_AUTH_EVIDENCE");
  }
  try {
    const totp = requireFreshTotpEvidence(evidence, now);
    return {
      sessionId: uuid(evidence.sessionId),
      totpAuthenticatedAtEpochSeconds: totp.authenticatedAtEpochSeconds,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      typeof error.code === "string" &&
      [
        "AAL2_REQUIRED",
        "AUTHENTICATION_REQUIRED",
        "FRESH_TOTP_REQUIRED",
        "INVALID_AUTH_EVIDENCE",
        "STALE_TOTP",
      ].includes(error.code)
    ) {
      throw invalid(error.code as SuperAdminEmailBindingErrorCode);
    }
    throw invalid("INVALID_AUTH_EVIDENCE");
  }
}

export function createSuperAdminEmailBindingService(
  dependencies: SuperAdminEmailBindingServiceDependencies,
): SuperAdminEmailBindingService {
  return {
    advance(input) {
      return dependencies.operations.advance({
        ...input,
        emailFingerprint: fingerprint(input.emailFingerprint),
        operationId: uuid(input.operationId),
        sessionId: uuid(input.sessionId),
      });
    },
    assertContext(input) {
      return dependencies.operations.assertContext({
        ...input,
        emailFingerprint: fingerprint(input.emailFingerprint),
        operationId: uuid(input.operationId),
        sessionId: uuid(input.sessionId),
      });
    },
    beginReauth(input) {
      return dependencies.operations.beginReauth({
        emailFingerprint: fingerprint(input.emailFingerprint),
        operationId: uuid(input.operationId),
        originalSessionId: uuid(input.originalSessionId),
      });
    },
    async bind(input) {
      const targetUserId = uuid(input.targetUserId);
      const now = nowEpochSeconds(dependencies.clock);
      const allowed = await dependencies.operations.getAllowedTargetUserIds();
      if (!allowed.map((entry) => uuid(entry)).includes(targetUserId)) {
        throw invalid("INVALID_TARGET");
      }
      const evidence = authForTarget(
        await dependencies.auth.getTrustedAuthEvidence(),
        targetUserId,
        now,
      );
      const passwordVerifiedAtEpochSeconds = freshPassword(
        input.passwordEvidence,
        targetUserId,
        now,
      );
      return dependencies.operations.bind({
        assuranceLevel: "aal2",
        emailFingerprint: fingerprint(input.emailFingerprint),
        operationId: uuid(input.operationId),
        passwordVerifiedAtEpochSeconds,
        sessionId: evidence.sessionId,
        targetUserId,
        totpAuthenticatedAtEpochSeconds:
          evidence.totpAuthenticatedAtEpochSeconds,
      });
    },
    async complete(input) {
      const now = nowEpochSeconds(dependencies.clock);
      const auth = await dependencies.auth.getTrustedAuthEvidence();
      if (auth === null) throw invalid("AUTHENTICATION_REQUIRED");
      const userId = uuid(auth.actorUserId);
      const evidence = authForTarget(auth, userId, now);
      const passwordReauthenticatedAtEpochSeconds = freshPassword(
        input.passwordEvidence,
        userId,
        now,
      );
      if (input.protectedAdminReadVerified !== true) {
        throw invalid("INVALID_AUTH_EVIDENCE");
      }
      return dependencies.operations.complete({
        assuranceLevel: "aal2",
        emailFingerprint: fingerprint(input.emailFingerprint),
        newSessionId: evidence.sessionId,
        operationId: uuid(input.operationId),
        passwordReauthenticatedAtEpochSeconds,
        protectedAdminReadVerified: true,
        totpAuthenticatedAtEpochSeconds:
          evidence.totpAuthenticatedAtEpochSeconds,
      });
    },
    get(operationId) {
      return dependencies.operations.get(uuid(operationId));
    },
    markRecoveryRequired(input) {
      return dependencies.operations.markRecoveryRequired({
        emailFingerprint: fingerprint(input.emailFingerprint),
        operationId: uuid(input.operationId),
        reasonCode: reasonCode(input.reasonCode),
        sessionId: uuid(input.sessionId),
      });
    },
    async prepare(input) {
      const targetUserId = uuid(input.targetUserId);
      if (
        !Number.isSafeInteger(input.ttlSeconds) ||
        input.ttlSeconds < SUPER_ADMIN_EMAIL_BINDING_MIN_TTL_SECONDS ||
        input.ttlSeconds > SUPER_ADMIN_EMAIL_BINDING_MAX_TTL_SECONDS ||
        input.operatorReference.trim() !== input.operatorReference ||
        input.operatorReference.length < 1 ||
        input.operatorReference.length > 200
      ) {
        throw invalid("INVALID_REQUEST");
      }
      const allowed = await dependencies.operations.getAllowedTargetUserIds();
      if (!allowed.map((entry) => uuid(entry)).includes(targetUserId)) {
        throw invalid("INVALID_TARGET");
      }
      return dependencies.operations.prepare({ ...input, targetUserId });
    },
    terminate(input) {
      return dependencies.operations.terminate({
        operationId: uuid(input.operationId),
        reasonCode: reasonCode(input.reasonCode),
        terminalStatus: input.terminalStatus,
      });
    },
  };
}
