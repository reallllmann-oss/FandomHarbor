import { describe, expect, it, vi } from "vitest";

import type {
  SuperAdminEmailBindingOperation,
  SuperAdminEmailBindingService,
} from "@fandom-harbor/services";

import {
  BindingOrchestratorError,
  createSuperAdminEmailBindingOrchestrator,
  type AuthoritativeBindingUser,
  type SuperAdminEmailBindingAuthGateway,
} from "./super-admin-email-binding-orchestrator";

const UID = "10000000-0000-4000-8000-000000000001";
const OTHER_UID = "10000000-0000-4000-8000-000000000002";
const OPERATION = "20000000-0000-4000-8000-000000000001";
const SESSION = "30000000-0000-4000-8000-000000000001";
const NEW_SESSION = "30000000-0000-4000-8000-000000000002";
const CURRENT_EMAIL = "akumie@accounts.fandom-harbor.invalid";
const NEW_EMAIL = "owner@example.com";
const NOW = 2_000_000_000;

function operation(
  status: SuperAdminEmailBindingOperation["status"],
): SuperAdminEmailBindingOperation {
  return {
    completedAtEpochSeconds: status === "completed" ? NOW : null,
    emailFingerprintBound: status !== "prepared",
    expiresAtEpochSeconds: NOW + 900,
    operationId: OPERATION,
    preparedAtEpochSeconds: NOW - 10,
    recoveryReasonCode: null,
    sessionBound: status !== "prepared",
    status,
    targetUserId: UID,
  };
}

function authoritative(email = CURRENT_EMAIL): AuthoritativeBindingUser {
  return {
    email,
    emailChangeConfirmStatus: 0,
    identities: [{ email, identityId: "identity-1", provider: "email" }],
    newEmail: null,
    userId: UID,
  };
}

function binding(
  status: SuperAdminEmailBindingOperation["status"] = "prepared",
) {
  let current = operation(status);
  const service = {
    advance: vi.fn(async (input) => {
      current = operation(input.nextStatus);
      return current;
    }),
    assertContext: vi.fn(async () => current),
    beginReauth: vi.fn(async () => {
      current = operation("awaiting_reauth");
      return current;
    }),
    bind: vi.fn(async () => {
      current = operation("bound");
      return current;
    }),
    complete: vi.fn(async () => {
      current = operation("completed");
      return current;
    }),
    get: vi.fn(async () => current),
    markRecoveryRequired: vi.fn(async () => {
      current = operation("recovery_required");
      return current;
    }),
    prepare: vi.fn(),
    terminate: vi.fn(),
  } as unknown as SuperAdminEmailBindingService;
  return service;
}

function auth() {
  let user = authoritative();
  const gateway: SuperAdminEmailBindingAuthGateway = {
    generateEmailChangeCredential: vi.fn(async ({ type }) => ({
      emailOtp: type === "email_change_current" ? "111111" : "222222",
      userId: UID,
    })),
    getUser: vi.fn(async () => user),
    revokeAllSessions: vi.fn(async () => undefined),
    verifyEmailChangeOtp: vi.fn(
      async ({ email, retainAccessTokenForGlobalRevocation }) => {
        if (email === NEW_EMAIL) user = authoritative(NEW_EMAIL);
        return {
          accessToken: retainAccessTokenForGlobalRevocation
            ? "memory-token"
            : "",
          userId: UID,
        };
      },
    ),
    verifyPassword: vi.fn(async () => ({
      authenticatedAtEpochSeconds: NOW - 2,
      userId: UID,
    })),
  };
  return gateway;
}

function orchestrator(
  input: {
    allowedTargetUserIds?: readonly string[];
    auth?: SuperAdminEmailBindingAuthGateway;
    binding?: SuperAdminEmailBindingService;
    sender?: {
      sendNewEmailOtp(input: {
        email: string;
        operationId: string;
        otp: string;
      }): Promise<void>;
    };
    sessionId?: string;
  } = {},
) {
  const authGateway = input.auth ?? auth();
  const bindingService = input.binding ?? binding();
  const sender = input.sender ?? {
    sendNewEmailOtp: vi.fn(async () => undefined),
  };
  const revokeCurrentActorSessions = vi.fn(async () => undefined);
  return {
    auth: authGateway,
    binding: bindingService,
    sender,
    revokeCurrentActorSessions,
    subject: createSuperAdminEmailBindingOrchestrator({
      allowedTargetUserIds: input.allowedTargetUserIds ?? [UID, OTHER_UID],
      auth: authGateway,
      binding: bindingService,
      emailHmacContext: "local-test-project",
      emailHmacSecret: "h".repeat(32),
      async getTrustedAuthEvidence() {
        return {
          actorUserId: UID,
          assuranceLevel: "aal2",
          authenticationMethods: [
            { authenticatedAtEpochSeconds: NOW - 3, method: "totp" },
          ],
          sessionId: input.sessionId ?? SESSION,
        };
      },
      revokeCurrentActorSessions,
      sender,
    }),
  };
}

describe("B3-SA2 server-only binding orchestrator", () => {
  it("generates both native arms before confirming current and sends only new email_otp", async () => {
    const events: string[] = [];
    const gateway = auth();
    vi.mocked(gateway.generateEmailChangeCredential).mockImplementation(
      async ({ type }) => {
        events.push(type);
        return {
          emailOtp: type === "email_change_current" ? "111111" : "222222",
          userId: UID,
        };
      },
    );
    vi.mocked(gateway.verifyEmailChangeOtp).mockImplementation(
      async ({ email }) => {
        events.push(`verify:${email}`);
        return { accessToken: "", userId: UID };
      },
    );
    const sender = {
      sendNewEmailOtp: vi.fn(async ({ otp }) => {
        events.push(`send:${otp}`);
      }),
    };
    const target = orchestrator({ auth: gateway, sender });

    await target.subject.start({
      operationId: OPERATION,
      password: "correct-password",
      targetEmail: NEW_EMAIL,
    });

    expect(events).toEqual([
      "email_change_current",
      "email_change_new",
      `verify:${CURRENT_EMAIL}`,
      "send:222222",
    ]);
    expect(sender.sendNewEmailOtp).not.toHaveBeenCalledWith(
      expect.objectContaining({ otp: "111111" }),
    );
  });

  it("rejects password evidence for a different Auth UID before generating arms", async () => {
    const gateway = auth();
    vi.mocked(gateway.verifyPassword).mockResolvedValue({
      authenticatedAtEpochSeconds: NOW,
      userId: OTHER_UID,
    });
    const target = orchestrator({ auth: gateway });
    await expect(
      target.subject.start({
        operationId: OPERATION,
        password: "password",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "IDENTITY_MISMATCH" });
    expect(gateway.generateEmailChangeCredential).not.toHaveBeenCalled();
  });

  it("rejects an Operation outside the environment-specific UID allowlist", async () => {
    const target = orchestrator({ allowedTargetUserIds: [OTHER_UID] });
    await expect(
      target.subject.getRedactedOperation(OPERATION),
    ).rejects.toMatchObject({ code: "IDENTITY_MISMATCH" });
  });

  it("moves to recovery_required when generation becomes ambiguous", async () => {
    const gateway = auth();
    vi.mocked(gateway.generateEmailChangeCredential).mockRejectedValue(
      new Error("connection reset"),
    );
    const target = orchestrator({ auth: gateway });
    await expect(
      target.subject.start({
        operationId: OPERATION,
        password: "password",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(target.binding.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({ reasonCode: "ARM_GENERATION_UNCERTAIN" }),
    );
  });

  it("moves to recovery_required when the migration-only sender fails", async () => {
    const target = orchestrator({
      sender: {
        sendNewEmailOtp: vi.fn(async () => Promise.reject(new Error("down"))),
      },
    });
    await expect(
      target.subject.start({
        operationId: OPERATION,
        password: "password",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(target.binding.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({ reasonCode: "NEW_ARM_DELIVERY_FAILED" }),
    );
  });

  it("moves to recovery when current-arm Auth succeeds but its ledger advance fails", async () => {
    const service = binding("prepared");
    vi.mocked(service.advance).mockRejectedValueOnce(
      new Error("database unavailable"),
    );
    const target = orchestrator({ binding: service });
    await expect(
      target.subject.start({
        operationId: OPERATION,
        password: "password",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(service.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({
        reasonCode: "LEDGER_ADVANCE_AFTER_CURRENT_CONFIRMATION",
      }),
    );
  });

  it("moves to recovery when delivery succeeds but its ledger advance fails", async () => {
    const service = binding("prepared");
    vi.mocked(service.advance)
      .mockResolvedValueOnce(operation("current_confirmed"))
      .mockRejectedValueOnce(new Error("database unavailable"));
    const target = orchestrator({ binding: service });
    await expect(
      target.subject.start({
        operationId: OPERATION,
        password: "password",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(service.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({
        reasonCode: "LEDGER_ADVANCE_AFTER_NEW_ARM_DELIVERY",
      }),
    );
  });

  it("rejects a changed target email through the bound HMAC context", async () => {
    const service = binding("new_email_sent");
    vi.mocked(service.assertContext).mockRejectedValue(
      new Error("INVALID_BINDING_CONTEXT"),
    );
    const target = orchestrator({ binding: service });
    await expect(
      target.subject.verifyNewEmail({
        operationId: OPERATION,
        otp: "222222",
        targetEmail: "replacement@example.com",
      }),
    ).rejects.toThrow("INVALID_BINDING_CONTEXT");
  });

  it("does not advance when a new-arm OTP is expired or replayed", async () => {
    const gateway = auth();
    vi.mocked(gateway.verifyEmailChangeOtp).mockRejectedValue(
      new Error("expired"),
    );
    const service = binding("new_email_sent");
    const target = orchestrator({ auth: gateway, binding: service });
    await expect(
      target.subject.verifyNewEmail({
        operationId: OPERATION,
        otp: "222222",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "OTP_REJECTED" });
    expect(service.advance).not.toHaveBeenCalled();
  });

  it("reconciles an uncertain OTP response only after authoritative identity success", async () => {
    const gateway = auth();
    vi.mocked(gateway.verifyEmailChangeOtp).mockRejectedValue(
      new Error("connection reset"),
    );
    vi.mocked(gateway.getUser).mockResolvedValue(authoritative(NEW_EMAIL));
    const service = binding("new_email_sent");
    const target = orchestrator({ auth: gateway, binding: service });
    await target.subject.verifyNewEmail({
      operationId: OPERATION,
      otp: "222222",
      targetEmail: NEW_EMAIL,
    });
    expect(service.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({ reasonCode: "OTP_RESULT_UNCERTAIN" }),
    );
    expect(target.revokeCurrentActorSessions).toHaveBeenCalledOnce();
    expect(service.beginReauth).toHaveBeenCalledOnce();
  });

  it("fails closed into recovery when an uncertain OTP cannot be authoritatively read", async () => {
    const gateway = auth();
    vi.mocked(gateway.verifyEmailChangeOtp).mockRejectedValue(
      new Error("connection reset"),
    );
    vi.mocked(gateway.getUser).mockRejectedValue(new Error("auth unavailable"));
    const service = binding("new_email_sent");
    const target = orchestrator({ auth: gateway, binding: service });
    await expect(
      target.subject.verifyNewEmail({
        operationId: OPERATION,
        otp: "222222",
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "RECOVERY_REQUIRED" });
    expect(service.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({ reasonCode: "OTP_AUTHORITY_UNAVAILABLE" }),
    );
    expect(service.advance).not.toHaveBeenCalled();
  });

  it("reconciles Auth success through recovery when the normal ledger advance loses its session", async () => {
    const service = binding("new_email_sent");
    vi.mocked(service.advance)
      .mockRejectedValueOnce(new Error("session gone"))
      .mockResolvedValueOnce(operation("identity_changed"));
    const target = orchestrator({ binding: service });
    await target.subject.verifyNewEmail({
      operationId: OPERATION,
      otp: "222222",
      targetEmail: NEW_EMAIL,
    });
    expect(service.markRecoveryRequired).toHaveBeenCalledWith(
      expect.objectContaining({
        reasonCode: "LEDGER_ADVANCE_AFTER_AUTH_SUCCESS",
      }),
    );
    expect(service.beginReauth).toHaveBeenCalledOnce();
  });

  it("globally revokes sessions before entering awaiting_reauth", async () => {
    const target = orchestrator({ binding: binding("new_email_sent") });
    await target.subject.verifyNewEmail({
      operationId: OPERATION,
      otp: "222222",
      targetEmail: NEW_EMAIL,
    });
    expect(target.auth.revokeAllSessions).toHaveBeenCalledWith("memory-token");
    expect(target.binding.beginReauth).toHaveBeenCalledOnce();
  });

  it("requires a different post-revocation session through the ledger completion contract", async () => {
    const service = binding("awaiting_reauth");
    const gateway = auth();
    vi.mocked(gateway.getUser).mockResolvedValue(authoritative(NEW_EMAIL));
    const target = orchestrator({
      auth: gateway,
      binding: service,
      sessionId: NEW_SESSION,
    });
    await target.subject.complete({
      operationId: OPERATION,
      password: "correct-password",
      protectedAdminReadVerified: true,
      targetEmail: NEW_EMAIL,
    });
    expect(service.complete).toHaveBeenCalledWith(
      expect.objectContaining({ protectedAdminReadVerified: true }),
    );
  });

  it("refuses completion when the authoritative identity is not the new email", async () => {
    const target = orchestrator({ binding: binding("awaiting_reauth") });
    await expect(
      target.subject.complete({
        operationId: OPERATION,
        password: "password",
        protectedAdminReadVerified: true,
        targetEmail: NEW_EMAIL,
      }),
    ).rejects.toMatchObject({ code: "IDENTITY_MISMATCH" });
  });

  it("never returns passwords, OTPs, access tokens, or raw email in operation status", async () => {
    const target = orchestrator();
    const result = await target.subject.getRedactedOperation(OPERATION);
    expect(result).toEqual(operation("prepared"));
    expect(JSON.stringify(result)).not.toMatch(/password|otp|token|@/iu);
  });

  it("uses safe typed errors for orchestration failures", () => {
    expect(new BindingOrchestratorError("INVALID_REQUEST").message).toBe(
      "INVALID_REQUEST",
    );
  });
});
