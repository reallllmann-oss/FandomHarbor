import { describe, expect, it, vi } from "vitest";

import {
  createSuperAdminEmailBindingService,
  SuperAdminEmailBindingError,
  type SuperAdminEmailBindingOperation,
  type SuperAdminEmailBindingPort,
} from "./super-admin-email-binding";

const AKUMIE = "10000000-0000-4000-8000-000000000001";
const PHASE2 = "10000000-0000-4000-8000-000000000002";
const OTHER = "10000000-0000-4000-8000-000000000003";
const OPERATION = "20000000-0000-4000-8000-000000000001";
const SESSION = "30000000-0000-4000-8000-000000000001";
const NEW_SESSION = "30000000-0000-4000-8000-000000000002";
const NOW = 2_000_000_000;
const EMAIL_FINGERPRINT = "a".repeat(64);

function operation(
  status: SuperAdminEmailBindingOperation["status"] = "prepared",
): SuperAdminEmailBindingOperation {
  return {
    completedAtEpochSeconds: null,
    emailFingerprintBound: status !== "prepared",
    expiresAtEpochSeconds: NOW + 600,
    operationId: OPERATION,
    preparedAtEpochSeconds: NOW - 1,
    recoveryReasonCode: null,
    sessionBound: status !== "prepared",
    status,
    targetUserId: AKUMIE,
  };
}

function port(): SuperAdminEmailBindingPort {
  return {
    advance: vi.fn(async () => operation("current_confirmed")),
    assertContext: vi.fn(async () => operation("new_email_sent")),
    beginReauth: vi.fn(async () => operation("awaiting_reauth")),
    bind: vi.fn(async () => operation("bound")),
    complete: vi.fn(async () => operation("completed")),
    get: vi.fn(async () => operation()),
    getAllowedTargetUserIds: vi.fn(async () => [AKUMIE, PHASE2]),
    markRecoveryRequired: vi.fn(async () => operation("recovery_required")),
    prepare: vi.fn(async () => operation()),
    terminate: vi.fn(async () => operation("cancelled")),
  };
}

function service(
  operations: SuperAdminEmailBindingPort,
  overrides: Partial<{
    actorUserId: string;
    assuranceLevel: "aal1" | "aal2";
    sessionId: string;
    totpAt: number;
  }> = {},
) {
  return createSuperAdminEmailBindingService({
    auth: {
      async getTrustedAuthEvidence() {
        return {
          actorUserId: overrides.actorUserId ?? AKUMIE,
          assuranceLevel: overrides.assuranceLevel ?? "aal2",
          authenticationMethods: [
            {
              authenticatedAtEpochSeconds: overrides.totpAt ?? NOW - 10,
              method: "totp",
            },
          ],
          sessionId: overrides.sessionId ?? SESSION,
        };
      },
    },
    clock: { now: () => new Date(NOW * 1_000) },
    operations,
  });
}

function password(userId = AKUMIE, authenticatedAtEpochSeconds = NOW - 5) {
  return { authenticatedAtEpochSeconds, userId };
}

describe("Super Admin email binding domain service", () => {
  it("prepares only an exact P1-07C-bound UID with a parameterized TTL", async () => {
    const operations = port();
    await service(operations).prepare({
      operatorReference: "po-approved:b3-sa1",
      targetUserId: AKUMIE,
      ttlSeconds: 900,
    });

    expect(operations.prepare).toHaveBeenCalledWith({
      operatorReference: "po-approved:b3-sa1",
      targetUserId: AKUMIE,
      ttlSeconds: 900,
    });
  });

  it("loads only an exact operation identifier", async () => {
    const operations = port();
    await service(operations).get(OPERATION);
    expect(operations.get).toHaveBeenCalledWith(OPERATION);
  });

  it("asserts the bound session and email fingerprint without exposing either", async () => {
    const operations = port();
    await service(operations).assertContext({
      emailFingerprint: EMAIL_FINGERPRINT,
      expectedStatus: "new_email_sent",
      operationId: OPERATION,
      sessionId: SESSION,
    });
    expect(operations.assertContext).toHaveBeenCalledWith({
      emailFingerprint: EMAIL_FINGERPRINT,
      expectedStatus: "new_email_sent",
      operationId: OPERATION,
      sessionId: SESSION,
    });
  });

  it("rejects a third Super Admin even if the caller supplies a valid UUID", async () => {
    await expect(
      service(port()).prepare({
        operatorReference: "po-approved:b3-sa1",
        targetUserId: OTHER,
        ttlSeconds: 900,
      }),
    ).rejects.toMatchObject({ code: "INVALID_TARGET" });
  });

  it("binds UID, session and fingerprint only after fresh password and TOTP", async () => {
    const operations = port();
    await service(operations).bind({
      emailFingerprint: EMAIL_FINGERPRINT,
      operationId: OPERATION,
      passwordEvidence: password(),
      targetUserId: AKUMIE,
    });

    expect(operations.bind).toHaveBeenCalledWith({
      assuranceLevel: "aal2",
      emailFingerprint: EMAIL_FINGERPRINT,
      operationId: OPERATION,
      passwordVerifiedAtEpochSeconds: NOW - 5,
      sessionId: SESSION,
      targetUserId: AKUMIE,
      totpAuthenticatedAtEpochSeconds: NOW - 10,
    });
  });

  it("rejects AAL1 before the ledger bind", async () => {
    const operations = port();
    await expect(
      service(operations, { assuranceLevel: "aal1" }).bind({
        emailFingerprint: EMAIL_FINGERPRINT,
        operationId: OPERATION,
        passwordEvidence: password(),
        targetUserId: AKUMIE,
      }),
    ).rejects.toMatchObject({ code: "AAL2_REQUIRED" });
    expect(operations.bind).not.toHaveBeenCalled();
  });

  it("rejects stale TOTP and stale password evidence", async () => {
    const staleTotp = service(port(), {
      totpAt: NOW - 301,
    });
    await expect(
      staleTotp.bind({
        emailFingerprint: EMAIL_FINGERPRINT,
        operationId: OPERATION,
        passwordEvidence: password(),
        targetUserId: AKUMIE,
      }),
    ).rejects.toMatchObject({ code: "STALE_TOTP" });

    await expect(
      service(port()).bind({
        emailFingerprint: EMAIL_FINGERPRINT,
        operationId: OPERATION,
        passwordEvidence: password(AKUMIE, NOW - 301),
        targetUserId: AKUMIE,
      }),
    ).rejects.toMatchObject({ code: "STALE_PASSWORD" });
  });

  it("rejects password evidence for a different UID", async () => {
    await expect(
      service(port()).bind({
        emailFingerprint: EMAIL_FINGERPRINT,
        operationId: OPERATION,
        passwordEvidence: password(PHASE2),
        targetUserId: AKUMIE,
      }),
    ).rejects.toMatchObject({ code: "INVALID_AUTH_EVIDENCE" });
  });

  it("records ambiguous external success as recovery_required", async () => {
    const operations = port();
    await service(operations).markRecoveryRequired({
      emailFingerprint: EMAIL_FINGERPRINT,
      operationId: OPERATION,
      reasonCode: "GOTRUE_RESULT_UNCERTAIN",
      sessionId: SESSION,
    });
    expect(operations.markRecoveryRequired).toHaveBeenCalledOnce();
  });

  it("completes only with a new AAL2 session, fresh password/TOTP and protected read", async () => {
    const operations = port();
    await service(operations, { sessionId: NEW_SESSION }).complete({
      emailFingerprint: EMAIL_FINGERPRINT,
      operationId: OPERATION,
      passwordEvidence: password(),
      protectedAdminReadVerified: true,
    });

    expect(operations.complete).toHaveBeenCalledWith({
      assuranceLevel: "aal2",
      emailFingerprint: EMAIL_FINGERPRINT,
      newSessionId: NEW_SESSION,
      operationId: OPERATION,
      passwordReauthenticatedAtEpochSeconds: NOW - 5,
      protectedAdminReadVerified: true,
      totpAuthenticatedAtEpochSeconds: NOW - 10,
    });
  });

  it("does not call completion when protected Admin read is missing", async () => {
    const operations = port();
    await expect(
      service(operations, { sessionId: NEW_SESSION }).complete({
        emailFingerprint: EMAIL_FINGERPRINT,
        operationId: OPERATION,
        passwordEvidence: password(),
        protectedAdminReadVerified: false,
      }),
    ).rejects.toBeInstanceOf(SuperAdminEmailBindingError);
    expect(operations.complete).not.toHaveBeenCalled();
  });
});
