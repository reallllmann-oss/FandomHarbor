import { describe, expect, it, vi } from "vitest";

import { createSuperAdminEmailBindingRepository } from "./super-admin-email-binding-repository";

const UID = "10000000-0000-4000-8000-000000000001";
const OPERATION = "20000000-0000-4000-8000-000000000001";
const SESSION = "30000000-0000-4000-8000-000000000001";

function snapshot() {
  return {
    completedAtEpochSeconds: null,
    emailFingerprintBound: false,
    expiresAtEpochSeconds: 2_000_000_600,
    operationId: OPERATION,
    preparedAtEpochSeconds: 2_000_000_000,
    recoveryReasonCode: null,
    sessionBound: false,
    status: "prepared",
    targetUserId: UID,
  };
}

function source() {
  return {
    advance: vi.fn(async () => snapshot()),
    assertContext: vi.fn(async () => snapshot()),
    beginReauth: vi.fn(async () => snapshot()),
    bind: vi.fn(async () => snapshot()),
    complete: vi.fn(async () => snapshot()),
    get: vi.fn(async () => snapshot()),
    getAllowedTargets: vi.fn(async () => [UID]),
    markRecoveryRequired: vi.fn(async () => snapshot()),
    prepare: vi.fn(async () => snapshot()),
    terminate: vi.fn(async () => snapshot()),
  };
}

describe("Super Admin email binding repository", () => {
  it("maps the prepare command to the service-role-only RPC contract", async () => {
    const dataSource = source();
    const repository = createSuperAdminEmailBindingRepository(dataSource);
    await repository.prepare({
      operatorReference: "po-approved:b3-sa1",
      targetUserId: UID,
      ttlSeconds: 900,
    });

    expect(dataSource.prepare).toHaveBeenCalledWith({
      p_operator_reference: "po-approved:b3-sa1",
      p_target_user_id: UID,
      p_ttl_seconds: 900,
    });
  });

  it("maps bind timestamps without exposing password, OTP or email", async () => {
    const dataSource = source();
    const repository = createSuperAdminEmailBindingRepository(dataSource);
    await repository.bind({
      assuranceLevel: "aal2",
      emailFingerprint: "a".repeat(64),
      operationId: OPERATION,
      passwordVerifiedAtEpochSeconds: 2_000_000_001,
      sessionId: SESSION,
      targetUserId: UID,
      totpAuthenticatedAtEpochSeconds: 2_000_000_002,
    });

    expect(dataSource.bind).toHaveBeenCalledWith({
      p_assurance_level: "aal2",
      p_email_fingerprint: "a".repeat(64),
      p_operation_id: OPERATION,
      p_password_verified_at: "2033-05-18T03:33:21.000Z",
      p_session_id: SESSION,
      p_target_user_id: UID,
      p_totp_authenticated_at: "2033-05-18T03:33:22.000Z",
    });
  });

  it("maps a service-only operation lookup without widening the snapshot", async () => {
    const dataSource = source();
    const result =
      await createSuperAdminEmailBindingRepository(dataSource).get(OPERATION);
    expect(dataSource.get).toHaveBeenCalledWith({ p_operation_id: OPERATION });
    expect(result).toEqual(snapshot());
  });

  it("maps the live bound-context assertion", async () => {
    const dataSource = source();
    await createSuperAdminEmailBindingRepository(dataSource).assertContext({
      emailFingerprint: "a".repeat(64),
      expectedStatus: "new_email_sent",
      operationId: OPERATION,
      sessionId: SESSION,
    });
    expect(dataSource.assertContext).toHaveBeenCalledWith({
      p_email_fingerprint: "a".repeat(64),
      p_expected_status: "new_email_sent",
      p_operation_id: OPERATION,
      p_session_id: SESSION,
    });
  });

  it("keeps the bound email fingerprint immutable during completion", async () => {
    const dataSource = source();
    await createSuperAdminEmailBindingRepository(dataSource).complete({
      assuranceLevel: "aal2",
      emailFingerprint: "b".repeat(64),
      newSessionId: SESSION,
      operationId: OPERATION,
      passwordReauthenticatedAtEpochSeconds: 2_000_000_001,
      protectedAdminReadVerified: true,
      totpAuthenticatedAtEpochSeconds: 2_000_000_002,
    });
    expect(dataSource.complete).toHaveBeenCalledWith(
      expect.objectContaining({ p_email_fingerprint: "b".repeat(64) }),
    );
  });

  it("rejects an RPC snapshot with unexpected fields", async () => {
    const dataSource = source();
    dataSource.prepare.mockResolvedValue({
      ...snapshot(),
      rawEmail: "hidden",
    } as ReturnType<typeof snapshot>);
    await expect(
      createSuperAdminEmailBindingRepository(dataSource).prepare({
        operatorReference: "po-approved:b3-sa1",
        targetUserId: UID,
        ttlSeconds: 900,
      }),
    ).rejects.toMatchObject({ code: "INTERNAL_FAILURE" });
  });

  it("parses only exact UUIDs from the database allowlist", async () => {
    const dataSource = source();
    const result =
      await createSuperAdminEmailBindingRepository(
        dataSource,
      ).getAllowedTargetUserIds();
    expect(result).toEqual([UID]);

    dataSource.getAllowedTargets.mockResolvedValue(["not-a-uuid"]);
    await expect(
      createSuperAdminEmailBindingRepository(
        dataSource,
      ).getAllowedTargetUserIds(),
    ).rejects.toMatchObject({ code: "INTERNAL_FAILURE" });
  });
});
