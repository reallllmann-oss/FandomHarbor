import { describe, expect, it, vi } from "vitest";

import {
  GRANT_SUPER_ADMIN_OPERATION,
  IdentityAccessExpectedStateToken,
  IdentityAccessNormalizedReason,
  IdentityAccessRequestId,
  IdentityAccessUserId,
  type ConsumeElevatedIntentCommand,
  type IssueElevatedIntentCommand,
} from "@fandom-harbor/services";

import { createElevatedAccessDatabaseAdapters } from "./elevated-access-governance-repository";

const actorUserId = "11000000-0000-4000-8000-000000000001";
const targetUserId = "21000000-0000-4000-8000-000000000001";
const sessionId = "31000000-0000-4000-8000-000000000001";
const requestId = "41000000-0000-4000-8000-000000000001";
const intentId = "51000000-0000-4000-8000-000000000001";
const stateToken = "a".repeat(64);
const fingerprint = "b".repeat(64);
const reason = "Commission the exact synthetic recovery administrator";

function intentRecord() {
  return {
    actorAuthorizationReference: "adr-024:test:v1",
    actorSessionId: sessionId,
    actorUserId,
    challengeNotBeforeEpochSeconds: 1_900_000_000,
    consumedAtEpochSeconds: null,
    desiredRole: "super_admin",
    expectedStateToken: stateToken,
    expiresAtEpochSeconds: 1_900_000_300,
    intentId,
    issuedAtEpochSeconds: 1_900_000_000,
    normalizedReason: reason,
    operation: GRANT_SUPER_ADMIN_OPERATION,
    payloadFingerprint: fingerprint,
    priorTotpAuthenticatedAtEpochSeconds: 1_899_999_900,
    requestId,
    targetUserId,
  };
}

function mutationRecord() {
  return {
    currentState: {
      activeRoleGrants: [],
      membership: {
        state: "active",
        updatedAt: "2026-09-20T00:00:00Z",
      },
      targetUserId,
    },
    requestId,
    stateToken,
    status: "unchanged",
    targetUserId,
  };
}

function commands() {
  const common = {
    actorAuthorizationReference: "adr-024:test:v1",
    actorSessionId: sessionId,
    actorUserId: IdentityAccessUserId.parse(actorUserId),
    expectedStateToken: IdentityAccessExpectedStateToken.parse(stateToken),
    normalizedReason: IdentityAccessNormalizedReason.parse(reason),
    operation: GRANT_SUPER_ADMIN_OPERATION,
    payloadFingerprint: fingerprint,
    requestId: IdentityAccessRequestId.parse(requestId),
    targetUserId: IdentityAccessUserId.parse(targetUserId),
  };
  const issue: IssueElevatedIntentCommand = {
    ...common,
    priorTotpAuthenticatedAtEpochSeconds: 1_899_999_900,
  };
  const consume: ConsumeElevatedIntentCommand = {
    ...common,
    confirmedTotpAuthenticatedAtEpochSeconds: 1_900_000_050,
    intentId,
  };
  return { consume, issue };
}

function fixture() {
  const source = {
    confirmIntent: vi.fn(async (): Promise<unknown> => ({
      result: mutationRecord(),
      status: "result",
    })),
    getIntent: vi.fn(async (): Promise<unknown> => intentRecord()),
    getPolicy: vi.fn(async (): Promise<unknown> => ({
      actorAuthorizationReference: "adr-024:test:v1",
      authorizedActorUserId: actorUserId,
      exactTargetUserId: targetUserId,
    })),
    issueIntent: vi.fn(async (): Promise<unknown> => ({
      intent: intentRecord(),
      status: "issued",
    })),
  };
  return { adapters: createElevatedAccessDatabaseAdapters(source), source };
}

describe("Option B private database adapters", () => {
  it("maps the exact policy and strict intent records", async () => {
    const current = fixture();
    const command = commands();
    await expect(
      current.adapters.policy.getGrantSuperAdminPolicy(),
    ).resolves.toEqual({
      actorAuthorizationReference: "adr-024:test:v1",
      authorizedActorUserId: actorUserId,
      exactTargetUserId: targetUserId,
    });
    await expect(
      current.adapters.intents.issueGrantSuperAdminIntent(command.issue),
    ).resolves.toMatchObject({ status: "issued" });
    await expect(
      current.adapters.intents.getIntent(intentId),
    ).resolves.toMatchObject({ intentId, operation: "grant_super_admin" });
    await expect(
      current.adapters.intents.consumeGrantSuperAdminIntent(command.consume),
    ).resolves.toMatchObject({ status: "result" });
  });

  it("sends no client actor, session, role, target, or MFA authority", async () => {
    const current = fixture();
    const command = commands();
    await current.adapters.intents.issueGrantSuperAdminIntent(command.issue);
    await current.adapters.intents.consumeGrantSuperAdminIntent(
      command.consume,
    );
    expect(current.source.issueIntent).toHaveBeenCalledWith({
      p_expected_state_token: stateToken,
      p_payload_fingerprint: fingerprint,
      p_reason: reason,
      p_request_id: requestId,
    });
    expect(current.source.confirmIntent).toHaveBeenCalledWith({
      p_expected_state_token: stateToken,
      p_intent_id: intentId,
      p_payload_fingerprint: fingerprint,
      p_reason: reason,
      p_request_id: requestId,
    });
  });

  it("fails closed on extra fields and malformed identifiers", async () => {
    const current = fixture();
    current.source.getIntent.mockResolvedValueOnce({
      ...intentRecord(),
      rawJwt: "forbidden",
    });
    await expect(
      current.adapters.intents.getIntent(intentId),
    ).rejects.toMatchObject({ code: "INTERNAL_FAILURE" });
    await expect(
      current.adapters.intents.getIntent("not-a-uuid"),
    ).rejects.toMatchObject({ code: "INTERNAL_FAILURE" });
  });

  it("preserves stable database failures without provider leakage", async () => {
    const current = fixture();
    current.source.issueIntent.mockRejectedValueOnce({
      code: "42501",
      details: "private.elevated_access_intents",
      hint: "internal",
      message: "UNAUTHORIZED_ACTOR",
    });
    await expect(
      current.adapters.intents.issueGrantSuperAdminIntent(commands().issue),
    ).rejects.toEqual(
      expect.objectContaining({
        code: "UNAUTHORIZED_ACTOR",
        message: "The actor is not authorized for this operation",
      }),
    );
  });

  it("rejects unknown provider responses and error objects", async () => {
    const current = fixture();
    current.source.confirmIntent.mockResolvedValueOnce({ status: "saved" });
    await expect(
      current.adapters.intents.consumeGrantSuperAdminIntent(commands().consume),
    ).rejects.toMatchObject({ code: "INTERNAL_FAILURE" });
    current.source.getPolicy.mockRejectedValueOnce({
      code: "XX000",
      message: "private relation leaked",
    });
    await expect(
      current.adapters.policy.getGrantSuperAdminPolicy(),
    ).rejects.toMatchObject({ code: "INTERNAL_FAILURE" });
  });
});
