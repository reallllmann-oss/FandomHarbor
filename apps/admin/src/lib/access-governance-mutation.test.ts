import { createTrustedAccessContext } from "@fandom-harbor/auth";
import {
  createIdentityAccessGovernanceService,
  IdentityAccessGovernanceDomainError,
  parseIdentityAccessGovernanceAuditPage,
  parseIdentityAccessMutationResult,
  parseIdentityAccessSubjectDetail,
  parseIdentityAccessSubjectPage,
  type IdentityAccessGovernanceService,
} from "@fandom-harbor/services";
import { describe, expect, it, vi } from "vitest";

import {
  executeAccessGovernanceMutation,
  INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
  type AccessGovernanceReview,
  type AccessGovernanceMutationActionState,
  type AccessGovernanceMutationDependencies,
} from "./access-governance-mutation";

const targetUserId = "10000000-0000-4000-8000-000000000001";
const requestId = "20000000-0000-4000-8000-000000000001";
const token = "a".repeat(64);
const nextToken = "b".repeat(64);
const occurredAt = "2026-08-19T00:00:00.000Z";

function detail(elevated = false) {
  return parseIdentityAccessSubjectDetail({
    activeRoleGrants: elevated
      ? [
          {
            grantId: "30000000-0000-4000-8000-000000000001",
            grantedAt: occurredAt,
            grantedBy: null,
            role: "admin",
          },
        ]
      : [],
    effectiveRoles: elevated ? ["reader", "admin"] : ["reader"],
    expectedState: {
      snapshot: {
        activeRoleGrants: elevated
          ? [
              {
                grantId: "30000000-0000-4000-8000-000000000001",
                grantedAt: occurredAt,
                role: "admin",
              },
            ]
          : [],
        membership: { state: "active", updatedAt: occurredAt },
        targetUserId,
      },
      token,
    },
    isElevatedAccount: elevated,
    isOnlyActiveSuperAdmin: false,
    membership: {
      admittedAt: occurredAt,
      revokedAt: null,
      state: "active",
      suspendedAt: null,
      updatedAt: occurredAt,
    },
    profileCreatedAt: occurredAt,
    profileUpdatedAt: occurredAt,
    registrationName: "HarborReader",
    userId: targetUserId,
  });
}

function result(status: "saved" | "unchanged" | "conflict") {
  const base = {
    currentState: {
      activeRoleGrants: [],
      membership: { state: "active", updatedAt: occurredAt },
      targetUserId,
    },
    requestId,
    stateToken: nextToken,
    targetUserId,
  };
  if (status === "saved") {
    return parseIdentityAccessMutationResult({
      ...base,
      auditLogId: "42",
      changedAt: occurredAt,
      roleGrantId: "30000000-0000-4000-8000-000000000002",
      status,
    });
  }
  if (status === "conflict") {
    return parseIdentityAccessMutationResult({
      ...base,
      conflictReason: "expected_state_mismatch",
      status,
    });
  }
  return parseIdentityAccessMutationResult({ ...base, status });
}

function service(): IdentityAccessGovernanceService {
  return {
    getSubjectDetail: vi.fn(async () => detail()),
    grantAuthorRole: vi.fn(async () => result("saved")),
    listSubjectAudit: vi.fn(async () =>
      parseIdentityAccessGovernanceAuditPage({
        hasMore: false,
        items: [],
        nextCursor: null,
      }),
    ),
    revokeAuthorRole: vi.fn(async () => result("unchanged")),
    searchSubjects: vi.fn(async () =>
      parseIdentityAccessSubjectPage({
        hasMore: false,
        items: [],
        nextCursor: null,
      }),
    ),
    setOrdinaryMembershipState: vi.fn(async () => result("conflict")),
  };
}

function dependencies(
  current: IdentityAccessGovernanceService,
): AccessGovernanceMutationDependencies {
  return {
    createRequestId: vi.fn(() => requestId),
    createService: vi.fn(async () => current),
    refresh: vi.fn(),
  };
}

function composedService() {
  const access = {
    getCurrent: vi.fn(async () =>
      createTrustedAccessContext({
        identity: { id: "90000000-0000-4000-8000-000000000001" },
        membershipState: "active",
        roles: ["admin"],
      }),
    ),
  };
  const read = {
    getSubjectDetail: vi.fn(async () => detail()),
    listSubjectAudit: vi.fn(async () =>
      parseIdentityAccessGovernanceAuditPage({
        hasMore: false,
        items: [],
        nextCursor: null,
      }),
    ),
    searchSubjects: vi.fn(async () =>
      parseIdentityAccessSubjectPage({
        hasMore: false,
        items: [],
        nextCursor: null,
      }),
    ),
  };
  const write = {
    grantAuthorRole: vi.fn(async () => result("saved")),
    revokeAuthorRole: vi.fn(async () => result("unchanged")),
    setOrdinaryMembershipState: vi.fn(async () => result("saved")),
  };
  return {
    access,
    read,
    service: createIdentityAccessGovernanceService({ access, read, write }),
    write,
  };
}

function reviewForm(operation = "grantAuthorRole") {
  const form = new FormData();
  form.set("intent", "review");
  form.set("operation", operation);
  form.set("targetUserId", targetUserId);
  form.set("expectedStateToken", token);
  form.set("reason", "  Grant Cafe\u0301 Author  ");
  return form;
}

function confirmForm() {
  const form = new FormData();
  form.set("intent", "confirm");
  return form;
}

function preparedReview(
  operation: AccessGovernanceReview["operation"],
  overrides: Partial<AccessGovernanceReview> = {},
): AccessGovernanceMutationActionState {
  return {
    review: {
      authorActive: operation === "revokeAuthorRole",
      currentMembershipState: "active",
      expectedStateToken: token,
      operation,
      reason: "Govern ordinary access safely",
      registrationName: "HarborReader",
      requestId,
      ...(operation === "setOrdinaryMembershipState"
        ? { state: "suspended" as const }
        : {}),
      targetUserId,
      ...overrides,
    },
    status: "review",
  };
}

describe("P1-04B access governance Action state", () => {
  it("passes raw Membership input through the Service parser exactly once", async () => {
    const composed = composedService();
    const deps = dependencies(composed.service);
    const form = reviewForm("setOrdinaryMembershipState");
    form.set("state", "suspended");
    const review = await executeAccessGovernanceMutation(
      INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
      form,
      deps,
    );
    vi.clearAllMocks();

    await expect(
      executeAccessGovernanceMutation(review, confirmForm(), deps),
    ).resolves.toMatchObject({ requestId, status: "saved" });
    expect(composed.access.getCurrent).toHaveBeenCalledOnce();
    expect(composed.read.getSubjectDetail).toHaveBeenCalledOnce();
    expect(composed.write.setOrdinaryMembershipState).toHaveBeenCalledOnce();
    expect(composed.write.setOrdinaryMembershipState).toHaveBeenCalledWith({
      expectedStateToken: { value: token },
      operation: "setOrdinaryMembershipState",
      reason: { value: "Grant Café Author" },
      requestId: { value: requestId },
      state: "suspended",
      targetUserId: { value: targetUserId },
    });
  });

  it.each([
    ["Grant Author", "grantAuthorRole", "saved"],
    ["Revoke Author", "revokeAuthorRole", "unchanged"],
  ] as const)(
    "passes raw %s input through the Service parser exactly once",
    async (_name, operation, status) => {
      const composed = composedService();
      const deps = dependencies(composed.service);

      await expect(
        executeAccessGovernanceMutation(
          preparedReview(operation),
          confirmForm(),
          deps,
        ),
      ).resolves.toMatchObject({ requestId, status });
      expect(composed.access.getCurrent).toHaveBeenCalledOnce();
      expect(composed.read.getSubjectDetail).toHaveBeenCalledOnce();
      expect(composed.write[operation]).toHaveBeenCalledOnce();
      expect(composed.write[operation]).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedStateToken: { value: token },
          operation,
          reason: { value: "Govern ordinary access safely" },
          requestId: { value: requestId },
          targetUserId: { value: targetUserId },
        }),
      );
    },
  );

  it.each([
    ["reason", { reason: "bad" }],
    ["requestId", { requestId: "not-a-uuid" }],
    ["expected-state", { expectedStateToken: "not-a-token" }],
  ] as const)(
    "keeps invalid raw %s input at the canonical Service parser",
    async (_name, overrides) => {
      const composed = composedService();
      const deps = dependencies(composed.service);

      await expect(
        executeAccessGovernanceMutation(
          preparedReview("grantAuthorRole", overrides),
          confirmForm(),
          deps,
        ),
      ).resolves.toMatchObject({ code: "INVALID_INPUT", status: "error" });
      expect(composed.access.getCurrent).not.toHaveBeenCalled();
      expect(composed.read.getSubjectDetail).not.toHaveBeenCalled();
      expect(composed.write.grantAuthorRole).not.toHaveBeenCalled();
    },
  );

  it("prepares a normalized ordinary Review without invoking a mutation", async () => {
    const current = service();
    const deps = dependencies(current);
    const state = await executeAccessGovernanceMutation(
      INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
      reviewForm(),
      deps,
    );

    expect(state).toMatchObject({
      review: {
        operation: "grantAuthorRole",
        reason: "Grant Café Author",
        requestId,
        targetUserId,
      },
      status: "review",
    });
    expect(current.getSubjectDetail).toHaveBeenCalledOnce();
    expect(current.grantAuthorRole).not.toHaveBeenCalled();
    expect(deps.createRequestId).toHaveBeenCalledOnce();
  });

  it("confirms exactly one mutation and refreshes Detail/Audit", async () => {
    const current = service();
    const deps = dependencies(current);
    const review = await executeAccessGovernanceMutation(
      INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
      reviewForm(),
      deps,
    );
    const saved = await executeAccessGovernanceMutation(
      review,
      confirmForm(),
      deps,
    );

    expect(saved).toMatchObject({
      auditLogId: "42",
      requestId,
      status: "saved",
    });
    expect(current.grantAuthorRole).toHaveBeenCalledOnce();
    expect(current.grantAuthorRole).toHaveBeenCalledWith(
      expect.objectContaining({ requestId }),
    );
    expect(deps.refresh).toHaveBeenCalledOnce();
  });

  it("keeps the same requestId for an explicit safe retry and never auto-retries", async () => {
    const current = service();
    vi.mocked(current.grantAuthorRole).mockRejectedValueOnce(
      new IdentityAccessGovernanceDomainError("REPOSITORY_UNAVAILABLE"),
    );
    const deps = dependencies(current);
    const review = await executeAccessGovernanceMutation(
      INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
      reviewForm(),
      deps,
    );
    const failed = await executeAccessGovernanceMutation(
      review,
      confirmForm(),
      deps,
    );
    expect(failed).toMatchObject({
      code: "REPOSITORY_UNAVAILABLE",
      retryReview: { requestId },
      status: "error",
    });
    expect(current.grantAuthorRole).toHaveBeenCalledOnce();

    await executeAccessGovernanceMutation(failed, confirmForm(), deps);
    expect(current.grantAuthorRole).toHaveBeenCalledTimes(2);
    expect(current.grantAuthorRole).toHaveBeenLastCalledWith(
      expect.objectContaining({ requestId }),
    );
  });

  it("returns Conflict current state and performs no second mutation", async () => {
    const current = service();
    const deps = dependencies(current);
    const form = reviewForm("setOrdinaryMembershipState");
    form.set("state", "suspended");
    const review = await executeAccessGovernanceMutation(
      INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
      form,
      deps,
    );
    const conflict = await executeAccessGovernanceMutation(
      review,
      confirmForm(),
      deps,
    );

    expect(conflict).toMatchObject({
      conflictReason: "expected_state_mismatch",
      current: { stateToken: nextToken },
      status: "conflict",
    });
    expect(current.setOrdinaryMembershipState).toHaveBeenCalledOnce();
  });

  it("preserves Unchanged and calls revoke at most once", async () => {
    const current = service();
    const deps = dependencies(current);
    const review: AccessGovernanceMutationActionState = {
      review: {
        authorActive: true,
        currentMembershipState: "active",
        expectedStateToken: token,
        operation: "revokeAuthorRole",
        reason: "Revoke ordinary Author",
        registrationName: "HarborReader",
        requestId,
        targetUserId,
      },
      status: "review",
    };

    await expect(
      executeAccessGovernanceMutation(review, confirmForm(), deps),
    ).resolves.toMatchObject({ requestId, status: "unchanged" });
    expect(current.revokeAuthorRole).toHaveBeenCalledOnce();
    expect(current.grantAuthorRole).not.toHaveBeenCalled();
  });

  it("rejects elevated targets before requestId creation and mutation", async () => {
    const current = service();
    vi.mocked(current.getSubjectDetail).mockResolvedValue(detail(true));
    const deps = dependencies(current);
    await expect(
      executeAccessGovernanceMutation(
        INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
        reviewForm(),
        deps,
      ),
    ).resolves.toMatchObject({
      code: "ELEVATED_MUTATION_DEFERRED",
      status: "error",
    });
    expect(deps.createRequestId).not.toHaveBeenCalled();
    expect(current.grantAuthorRole).not.toHaveBeenCalled();
  });

  it("cancel and malformed input perform zero mutation calls", async () => {
    const current = service();
    const deps = dependencies(current);
    const cancel = new FormData();
    cancel.set("intent", "cancel");
    await executeAccessGovernanceMutation(
      { message: "x", status: "invalid" },
      cancel,
      deps,
    );
    const malformed = reviewForm("admin");
    await executeAccessGovernanceMutation(
      INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
      malformed,
      deps,
    );
    expect(current.grantAuthorRole).not.toHaveBeenCalled();
    expect(current.revokeAuthorRole).not.toHaveBeenCalled();
    expect(current.setOrdinaryMembershipState).not.toHaveBeenCalled();
  });

  it("rejects an invalid reason before Service creation", async () => {
    const current = service();
    const deps = dependencies(current);
    const form = reviewForm();
    form.set("reason", "bad");

    await expect(
      executeAccessGovernanceMutation(
        INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
        form,
        deps,
      ),
    ).resolves.toMatchObject({ code: "INVALID_INPUT", status: "error" });
    expect(deps.createService).not.toHaveBeenCalled();
  });

  it.each(["UNAUTHENTICATED", "FORBIDDEN"] as const)(
    "preserves safe %s access errors and performs no mutation",
    async (code) => {
      const current = service();
      vi.mocked(current.getSubjectDetail).mockRejectedValue(
        new IdentityAccessGovernanceDomainError(code),
      );
      const deps = dependencies(current);
      await expect(
        executeAccessGovernanceMutation(
          INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
          reviewForm(),
          deps,
        ),
      ).resolves.toMatchObject({ code, status: "error" });
      expect(current.grantAuthorRole).not.toHaveBeenCalled();
    },
  );
});
