import type { TrustedAuthEvidence } from "@fandom-harbor/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createElevatedAccessGovernanceService,
  elevatedAccessClientError,
  grantSuperAdminPayloadFingerprint,
  GRANT_SUPER_ADMIN_OPERATION,
  MAX_TOTP_AGE_SECONDS,
  requireFreshTotpEvidence,
  validateElevatedIntentForConsumption,
  type ConsumeElevatedIntentCommand,
  type ElevatedAccessGovernanceServiceDependencies,
  type ElevatedIntent,
  type ElevatedIntentPort,
  type IssueElevatedIntentCommand,
} from "./elevated-access-governance";
import {
  IdentityAccessExpectedStateToken,
  IdentityAccessNormalizedReason,
  IdentityAccessRequestId,
  IdentityAccessUserId,
  parseIdentityAccessMutationResult,
} from "./identity-access-governance-domain";

const actorUserId = "10000000-0000-4000-8000-000000000001";
const otherActorUserId = "10000000-0000-4000-8000-000000000002";
const targetUserId = "20000000-0000-4000-8000-000000000001";
const otherTargetUserId = "20000000-0000-4000-8000-000000000002";
const sessionId = "30000000-0000-4000-8000-000000000001";
const otherSessionId = "30000000-0000-4000-8000-000000000002";
const requestId = "40000000-0000-4000-8000-000000000001";
const intentId = "50000000-0000-4000-8000-000000000001";
const expectedStateToken = "a".repeat(64);
const reason = "Commission the exact recovery administrator";
const authorizationReference = "commissioning-policy-v1";
const issuedAt = 1_900_000_500;

function authEvidence(
  overrides: Partial<TrustedAuthEvidence> = {},
): TrustedAuthEvidence {
  return {
    actorUserId,
    assuranceLevel: "aal2",
    authenticationMethods: [
      { authenticatedAtEpochSeconds: issuedAt - 60, method: "password" },
      { authenticatedAtEpochSeconds: issuedAt - 30, method: "totp" },
    ],
    sessionId,
    ...overrides,
  };
}

function request(overrides: Record<string, unknown> = {}) {
  return {
    expectedStateToken,
    operation: GRANT_SUPER_ADMIN_OPERATION,
    reason,
    requestId,
    targetUserId,
    ...overrides,
  };
}

function confirmation(overrides: Record<string, unknown> = {}) {
  return { ...request(), intentId, ...overrides };
}

function mutationResult() {
  return parseIdentityAccessMutationResult({
    currentState: {
      activeRoleGrants: [],
      membership: {
        state: "active",
        updatedAt: "2026-09-20T00:00:00Z",
      },
      targetUserId,
    },
    requestId,
    stateToken: expectedStateToken,
    status: "unchanged",
    targetUserId,
  });
}

function intentFrom(command: IssueElevatedIntentCommand): ElevatedIntent {
  return {
    ...command,
    consumedAtEpochSeconds: null,
    desiredRole: "super_admin",
    intentId,
  };
}

function fixture() {
  let evidence: TrustedAuthEvidence | null = authEvidence();
  let now = issuedAt;
  let currentIntent: ElevatedIntent | null = null;
  const intents: ElevatedIntentPort = {
    consumeGrantSuperAdminIntent: vi.fn(async () => ({
      result: mutationResult(),
      status: "result" as const,
    })),
    getIntent: vi.fn(async () => currentIntent),
    issueGrantSuperAdminIntent: vi.fn(async (command) => {
      currentIntent = intentFrom(command);
      return { intent: currentIntent, status: "issued" as const };
    }),
  };
  const dependencies: ElevatedAccessGovernanceServiceDependencies = {
    auth: { getTrustedAuthEvidence: vi.fn(async () => evidence) },
    clock: { now: () => new Date(now * 1_000) },
    intents,
    policy: {
      getGrantSuperAdminPolicy: vi.fn(async () => ({
        actorAuthorizationReference: authorizationReference,
        authorizedActorUserId: actorUserId,
        exactTargetUserId: targetUserId,
      })),
    },
  };
  return {
    dependencies,
    getIntent: () => currentIntent,
    intents,
    service: createElevatedAccessGovernanceService(dependencies),
    setEvidence: (value: TrustedAuthEvidence | null) => {
      evidence = value;
    },
    setIntent: (value: ElevatedIntent | null) => {
      currentIntent = value;
    },
    setNow: (value: number) => {
      now = value;
    },
  };
}

async function expectCode(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ code });
}

describe("AAL2 and fresh trusted TOTP evidence", () => {
  it("accepts aal2 with a fresh TOTP method", () => {
    expect(requireFreshTotpEvidence(authEvidence(), issuedAt)).toEqual({
      ageSeconds: 30,
      authenticatedAtEpochSeconds: issuedAt - 30,
    });
  });

  it("accepts the exact five-minute boundary", () => {
    const evidence = authEvidence({
      authenticationMethods: [
        {
          authenticatedAtEpochSeconds: issuedAt - MAX_TOTP_AGE_SECONDS,
          method: "totp",
        },
      ],
    });
    expect(requireFreshTotpEvidence(evidence, issuedAt).ageSeconds).toBe(
      MAX_TOTP_AGE_SECONDS,
    );
  });

  it.each([
    ["aal1", authEvidence({ assuranceLevel: "aal1" }), "AAL2_REQUIRED"],
    ["no session", null, "AUTHENTICATION_REQUIRED"],
    [
      "aal2 without TOTP",
      authEvidence({
        authenticationMethods: [
          { authenticatedAtEpochSeconds: issuedAt, method: "password" },
        ],
      }),
      "FRESH_TOTP_REQUIRED",
    ],
    [
      "stale TOTP",
      authEvidence({
        authenticationMethods: [
          {
            authenticatedAtEpochSeconds: issuedAt - MAX_TOTP_AGE_SECONDS - 1,
            method: "totp",
          },
        ],
      }),
      "STALE_TOTP",
    ],
    [
      "future TOTP timestamp",
      authEvidence({
        authenticationMethods: [
          { authenticatedAtEpochSeconds: issuedAt + 1, method: "totp" },
        ],
      }),
      "INVALID_AUTH_EVIDENCE",
    ],
  ])("rejects %s", (_label, evidence, code) => {
    expect(() => requireFreshTotpEvidence(evidence, issuedAt)).toThrow(
      expect.objectContaining({ code }),
    );
  });

  it("selects the latest qualifying object-form TOTP entry", () => {
    const evidence = authEvidence({
      authenticationMethods: [
        { authenticatedAtEpochSeconds: issuedAt - 200, method: "totp" },
        { authenticatedAtEpochSeconds: issuedAt - 20, method: "totp" },
        { authenticatedAtEpochSeconds: issuedAt - 1, method: "password" },
      ],
    });
    expect(
      requireFreshTotpEvidence(evidence, issuedAt).authenticatedAtEpochSeconds,
    ).toBe(issuedAt - 20);
  });
});

describe("exact elevated intent issuance contract", () => {
  it("issues only grant_super_admin for the exact policy actor and target", async () => {
    const current = fixture();
    const result = await current.service.issueGrantSuperAdminIntent(request());

    expect(result).toMatchObject({
      actorAuthorizationReference: authorizationReference,
      actorSessionId: sessionId,
      desiredRole: "super_admin",
      intentId,
      operation: GRANT_SUPER_ADMIN_OPERATION,
      targetUserId: { value: targetUserId },
    });
    expect(current.intents.issueGrantSuperAdminIntent).toHaveBeenCalledOnce();
  });

  it.each(["grant_admin", "revoke_super_admin", "delete_user", "change_role"])(
    "rejects unknown operation %s",
    async (operation) => {
      const current = fixture();
      await expectCode(
        current.service.issueGrantSuperAdminIntent(request({ operation })),
        "INVALID_OPERATION",
      );
      expect(current.intents.issueGrantSuperAdminIntent).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["missing target", { targetUserId: undefined }],
    ["malformed target", { targetUserId: "not-a-uuid" }],
    ["substituted target", { targetUserId: otherTargetUserId }],
  ])("rejects %s", async (_label, override) => {
    const current = fixture();
    await expectCode(
      current.service.issueGrantSuperAdminIntent(request(override)),
      "INVALID_TARGET",
    );
    expect(current.intents.issueGrantSuperAdminIntent).not.toHaveBeenCalled();
  });

  it.each([
    ["missing requestId", { requestId: undefined }],
    ["malformed requestId", { requestId: "not-a-uuid" }],
  ])("rejects %s", async (_label, override) => {
    const current = fixture();
    await expectCode(
      current.service.issueGrantSuperAdminIntent(request(override)),
      "INVALID_REQUEST",
    );
  });

  it("rejects an authenticated but unauthorized actor", async () => {
    const current = fixture();
    current.setEvidence(authEvidence({ actorUserId: otherActorUserId }));
    await expectCode(
      current.service.issueGrantSuperAdminIntent(request()),
      "UNAUTHORIZED_ACTOR",
    );
  });

  it.each([
    ["actorUserId", otherActorUserId],
    ["aal", "aal2"],
    ["amr", [{ method: "totp", timestamp: issuedAt }]],
    ["mfaTimestamp", issuedAt],
    ["sessionId", sessionId],
  ])("rejects client-supplied trusted field %s", async (field, value) => {
    const current = fixture();
    await expectCode(
      current.service.issueGrantSuperAdminIntent(request({ [field]: value })),
      "INVALID_AUTH_EVIDENCE",
    );
    expect(
      current.dependencies.auth.getTrustedAuthEvidence,
    ).not.toHaveBeenCalled();
  });

  it("maps the shared-ledger same-request changed-payload result", async () => {
    const current = fixture();
    vi.mocked(current.intents.issueGrantSuperAdminIntent).mockResolvedValueOnce(
      {
        status: "request_id_conflict",
      },
    );
    await expectCode(
      current.service.issueGrantSuperAdminIntent(request()),
      "REQUEST_ID_CONFLICT",
    );
  });
});

describe("canonical elevated payload fingerprint", () => {
  const payload = {
    actorUserId: IdentityAccessUserId.parse(actorUserId),
    expectedStateToken:
      IdentityAccessExpectedStateToken.parse(expectedStateToken),
    normalizedReason: IdentityAccessNormalizedReason.parse(reason),
    operation: GRANT_SUPER_ADMIN_OPERATION,
    targetUserId: IdentityAccessUserId.parse(targetUserId),
  };

  it("is a deterministic SHA-256 hex fingerprint", async () => {
    const first = await grantSuperAdminPayloadFingerprint(payload);
    const second = await grantSuperAdminPayloadFingerprint({ ...payload });
    expect(first).toMatch(/^[0-9a-f]{64}$/u);
    expect(second).toBe(first);
  });

  it.each([
    ["actor", { actorUserId: IdentityAccessUserId.parse(otherActorUserId) }],
    ["target", { targetUserId: IdentityAccessUserId.parse(otherTargetUserId) }],
    [
      "expected state",
      {
        expectedStateToken: IdentityAccessExpectedStateToken.parse(
          "b".repeat(64),
        ),
      },
    ],
    [
      "normalized reason",
      {
        normalizedReason: IdentityAccessNormalizedReason.parse(
          "A different approved reason",
        ),
      },
    ],
  ])("changes when %s changes", async (_label, override) => {
    await expect(
      grantSuperAdminPayloadFingerprint({ ...payload, ...override }),
    ).resolves.not.toBe(await grantSuperAdminPayloadFingerprint(payload));
  });
});

describe("session-bound one-time intent runtime contract", () => {
  let current: ReturnType<typeof fixture>;

  beforeEach(async () => {
    current = fixture();
    await current.service.issueGrantSuperAdminIntent(request());
    current.setNow(issuedAt + 60);
    current.setEvidence(
      authEvidence({
        authenticationMethods: [
          {
            authenticatedAtEpochSeconds: issuedAt + 30,
            method: "totp",
          },
        ],
      }),
    );
  });

  it("allows the same actor and same session into the adapter consume boundary", async () => {
    await expect(
      current.service.confirmGrantSuperAdminIntent(confirmation()),
    ).resolves.toMatchObject({ status: "unchanged" });
    expect(current.intents.consumeGrantSuperAdminIntent).toHaveBeenCalledOnce();
  });

  it("rejects the same actor in a different session", async () => {
    current.setEvidence(authEvidence({ sessionId: otherSessionId }));
    await expectCode(
      current.service.confirmGrantSuperAdminIntent(confirmation()),
      "INVALID_SESSION",
    );
    expect(current.intents.consumeGrantSuperAdminIntent).not.toHaveBeenCalled();
  });

  it("rejects a different actor even if a forged request field copies the session", async () => {
    current.setEvidence(
      authEvidence({ actorUserId: otherActorUserId, sessionId }),
    );
    await expectCode(
      current.service.confirmGrantSuperAdminIntent(
        confirmation({ actorUserId, sessionId }),
      ),
      "INVALID_AUTH_EVIDENCE",
    );
    expect(current.intents.consumeGrantSuperAdminIntent).not.toHaveBeenCalled();
  });

  it.each([
    ["intent id", { intentId: "50000000-0000-4000-8000-000000000002" }],
    ["target", { targetUserId: otherTargetUserId }],
    ["expected state", { expectedStateToken: "b".repeat(64) }],
    ["reason", { reason: "A changed commissioning reason" }],
    ["request id", { requestId: "40000000-0000-4000-8000-000000000002" }],
  ])("rejects mismatched %s", async (_label, override) => {
    await expectCode(
      current.service.confirmGrantSuperAdminIntent(confirmation(override)),
      _label === "target" ? "INVALID_TARGET" : "INTENT_MISMATCH",
    );
    expect(current.intents.consumeGrantSuperAdminIntent).not.toHaveBeenCalled();
  });

  it("rejects an intent at the first second after expiry", async () => {
    current.setNow(issuedAt + MAX_TOTP_AGE_SECONDS + 1);
    current.setEvidence(
      authEvidence({
        authenticationMethods: [
          {
            authenticatedAtEpochSeconds: issuedAt + MAX_TOTP_AGE_SECONDS,
            method: "totp",
          },
        ],
      }),
    );
    await expectCode(
      current.service.confirmGrantSuperAdminIntent(confirmation()),
      "INTENT_EXPIRED",
    );
  });

  it("rejects an already consumed intent", async () => {
    const intent = current.getIntent();
    if (!intent) throw new Error("test setup did not issue an intent");
    current.setIntent({ ...intent, consumedAtEpochSeconds: issuedAt + 40 });
    await expectCode(
      current.service.confirmGrantSuperAdminIntent(confirmation()),
      "INTENT_CONSUMED",
    );
  });

  it("requires the confirmation TOTP to follow the frozen prior evidence", async () => {
    current.setEvidence(
      authEvidence({
        authenticationMethods: [
          { authenticatedAtEpochSeconds: issuedAt - 30, method: "totp" },
        ],
      }),
    );
    await expectCode(
      current.service.confirmGrantSuperAdminIntent(confirmation()),
      "FRESH_TOTP_REQUIRED",
    );
  });

  it.each([
    ["intent_consumed", "INTENT_CONSUMED"],
    ["intent_expired", "INTENT_EXPIRED"],
    ["intent_mismatch", "INTENT_MISMATCH"],
    ["request_id_conflict", "REQUEST_ID_CONFLICT"],
    ["expected_state_conflict", "EXPECTED_STATE_CONFLICT"],
  ] as const)(
    "maps adapter %s without treating it as success",
    async (status, code) => {
      vi.mocked(
        current.intents.consumeGrantSuperAdminIntent,
      ).mockResolvedValueOnce({
        status,
      });
      await expectCode(
        current.service.confirmGrantSuperAdminIntent(confirmation()),
        code,
      );
    },
  );

  it("exposes only a stable safe client error", () => {
    const result = elevatedAccessClientError(new Error("private table detail"));
    expect(result).toEqual({
      code: "INTERNAL_FAILURE",
      message: "The elevated access operation is unavailable",
    });
    expect(JSON.stringify(result)).not.toContain("private table detail");
  });

  it("the pure validator rejects a changed payload fingerprint", () => {
    const intent = current.getIntent();
    if (!intent) throw new Error("test setup did not issue an intent");
    const command: ConsumeElevatedIntentCommand = {
      actorAuthorizationReference: authorizationReference,
      actorSessionId: sessionId,
      actorUserId: IdentityAccessUserId.parse(actorUserId),
      confirmedTotpAuthenticatedAtEpochSeconds: issuedAt + 30,
      expectedStateToken:
        IdentityAccessExpectedStateToken.parse(expectedStateToken),
      intentId,
      normalizedReason: IdentityAccessNormalizedReason.parse(reason),
      operation: GRANT_SUPER_ADMIN_OPERATION,
      payloadFingerprint: "b".repeat(64),
      requestId: IdentityAccessRequestId.parse(requestId),
      targetUserId: IdentityAccessUserId.parse(targetUserId),
    };
    expect(() =>
      validateElevatedIntentForConsumption({
        confirmation: command,
        currentEpochSeconds: issuedAt + 60,
        intent,
        trustedAuthEvidence: authEvidence({
          authenticationMethods: [
            { authenticatedAtEpochSeconds: issuedAt + 30, method: "totp" },
          ],
        }),
      }),
    ).toThrow(expect.objectContaining({ code: "INTENT_MISMATCH" }));
  });
});
