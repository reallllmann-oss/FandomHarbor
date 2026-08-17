import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  IdentityAccessGovernanceDomainError,
  IdentityAccessUserId,
  parseGrantAuthorRoleCommand,
  parseIdentityAccessAuditListInput,
  parseIdentityAccessSubjectSearchInput,
  parseRevokeAuthorRoleCommand,
  parseSetOrdinaryMembershipStateCommand,
} from "@fandom-harbor/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createIdentityAccessGovernanceRepository,
  createSupabaseIdentityAccessGovernanceRepository,
  mapIdentityAccessGovernanceRpcError,
} from "./identity-access-governance-repository";

const mocks = vi.hoisted(() => ({
  serverRpc: vi.fn(),
}));

vi.mock("./server-client", () => ({
  createServerSupabaseClient: () => ({ rpc: mocks.serverRpc }),
}));

const targetUserId = "10000000-0000-4000-8000-000000000001";
const otherUserId = "10000000-0000-4000-8000-000000000002";
const actorUserId = "10000000-0000-4000-8000-000000000003";
const requestId = "20000000-0000-4000-8000-000000000001";
const otherRequestId = "20000000-0000-4000-8000-000000000002";
const grantId = "30000000-0000-4000-8000-000000000001";
const token = "a".repeat(64);
const changedToken = "b".repeat(64);
const time = "2026-08-17T10:00:00.000Z";
const laterTime = "2026-08-17T11:00:00.000Z";

function stateSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    activeRoleGrants: [],
    membership: { state: "active", updatedAt: time },
    targetUserId,
    ...overrides,
  };
}

function subjectSummary(overrides: Record<string, unknown> = {}) {
  return {
    effectiveRoles: ["reader"],
    membershipState: "active",
    membershipUpdatedAt: time,
    profileUpdatedAt: time,
    registrationName: "harbor reader",
    userId: targetUserId,
    ...overrides,
  };
}

function subjectPage(overrides: Record<string, unknown> = {}) {
  return {
    hasMore: false,
    items: [subjectSummary()],
    nextCursor: null,
    ...overrides,
  };
}

function subjectDetail(overrides: Record<string, unknown> = {}) {
  return {
    activeRoleGrants: [],
    effectiveRoles: ["reader"],
    expectedState: { snapshot: stateSnapshot(), token },
    isElevatedAccount: false,
    isOnlyActiveSuperAdmin: false,
    membership: {
      admittedAt: time,
      revokedAt: null,
      state: "active",
      suspendedAt: null,
      updatedAt: time,
    },
    profileCreatedAt: time,
    profileUpdatedAt: time,
    registrationName: "harbor reader",
    userId: targetUserId,
    ...overrides,
  };
}

function auditPage(overrides: Record<string, unknown> = {}) {
  return {
    hasMore: false,
    items: [
      {
        action: "membership.state_changed",
        actor: { registrationName: "harbor admin", userId: actorUserId },
        after: { membershipState: "active" },
        auditId: "42",
        before: { membershipState: "suspended" },
        createdAt: laterTime,
        reason: "Restore ordinary access",
        result: "saved",
        targetRole: null,
        targetState: "active",
      },
    ],
    nextCursor: null,
    ...overrides,
  };
}

function savedResult(overrides: Record<string, unknown> = {}) {
  return {
    auditLogId: "43",
    changedAt: laterTime,
    currentState: stateSnapshot(),
    requestId,
    roleGrantId: grantId,
    stateToken: changedToken,
    status: "saved",
    targetUserId,
    ...overrides,
  };
}

function unchangedResult(overrides: Record<string, unknown> = {}) {
  return {
    currentState: stateSnapshot(),
    requestId,
    stateToken: token,
    status: "unchanged",
    targetUserId,
    ...overrides,
  };
}

function conflictResult(overrides: Record<string, unknown> = {}) {
  return {
    conflictReason: "expected_state_mismatch",
    currentState: stateSnapshot(),
    requestId,
    stateToken: changedToken,
    status: "conflict",
    targetUserId,
    ...overrides,
  };
}

function createSource() {
  return {
    getSubject: vi.fn(async (): Promise<unknown> => subjectDetail()),
    grantAuthorRole: vi.fn(async (): Promise<unknown> => savedResult()),
    listAudit: vi.fn(async (): Promise<unknown> => auditPage()),
    revokeAuthorRole: vi.fn(async (): Promise<unknown> => unchangedResult()),
    searchSubjects: vi.fn(async (): Promise<unknown> => subjectPage()),
    setOrdinaryMembershipState: vi.fn(async (): Promise<unknown> =>
      conflictResult(),
    ),
  };
}

function grantCommand() {
  return parseGrantAuthorRoleCommand({
    expectedStateToken: token,
    reason: "Grant Author access",
    requestId,
    targetUserId,
  });
}

function revokeCommand() {
  return parseRevokeAuthorRoleCommand({
    expectedStateToken: token,
    reason: "Revoke Author access",
    requestId,
    targetUserId,
  });
}

function membershipCommand() {
  return parseSetOrdinaryMembershipStateCommand({
    expectedStateToken: token,
    reason: "Suspend ordinary access",
    requestId,
    state: "suspended",
    targetUserId,
  });
}

function rpcRequest(data: unknown, error: unknown = null) {
  const response = Promise.resolve({ data, error });
  const request = {
    retry: vi.fn(),
    then: response.then.bind(response),
  };
  request.retry.mockReturnValue(request);
  return request;
}

describe("strict Identity Access read Repository", () => {
  it("maps normalized search and stable cursor parameters", async () => {
    const source = createSource();
    source.searchSubjects.mockResolvedValue(
      subjectPage({
        hasMore: true,
        nextCursor: {
          missingRegistrationName: false,
          normalizedRegistrationName: "harbor reader",
          userId: targetUserId,
        },
      }),
    );
    const repository = createIdentityAccessGovernanceRepository(source);
    const input = parseIdentityAccessSubjectSearchInput({
      cursor: {
        missingRegistrationName: false,
        normalizedRegistrationName: "first reader",
        userId: otherUserId,
      },
      limit: 1,
      query: "  HARBOR READER  ",
    });

    await expect(repository.searchSubjects(input)).resolves.toMatchObject({
      hasMore: true,
      items: [{ membershipUpdatedAt: new Date(time) }],
      nextCursor: {
        normalizedRegistrationName: { value: "harbor reader" },
        userId: { value: targetUserId },
      },
    });
    expect(source.searchSubjects).toHaveBeenCalledOnce();
    expect(source.searchSubjects).toHaveBeenCalledWith({
      p_cursor: {
        missingRegistrationName: false,
        normalizedRegistrationName: "first reader",
        userId: otherUserId,
      },
      p_limit: 1,
      p_query: "harbor reader",
    });
  });

  it("maps a full UUID search and bounded browse without query", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    await repository.searchSubjects(
      parseIdentityAccessSubjectSearchInput({ query: targetUserId }),
    );
    await repository.searchSubjects(parseIdentityAccessSubjectSearchInput({}));

    expect(source.searchSubjects).toHaveBeenNthCalledWith(1, {
      p_cursor: null,
      p_limit: 25,
      p_query: targetUserId,
    });
    expect(source.searchSubjects).toHaveBeenNthCalledWith(2, {
      p_cursor: null,
      p_limit: 25,
      p_query: null,
    });
  });

  it("maps detail only when provider and requested user IDs agree", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    await expect(
      repository.getSubjectDetail(IdentityAccessUserId.parse(targetUserId)),
    ).resolves.toMatchObject({
      expectedState: { token: { value: token } },
      profile: { userId: { value: targetUserId } },
    });
    expect(source.getSubject).toHaveBeenCalledWith({
      p_user_id: targetUserId,
    });

    source.getSubject.mockResolvedValue(subjectDetail({ userId: otherUserId }));
    await expect(
      repository.getSubjectDetail(IdentityAccessUserId.parse(targetUserId)),
    ).rejects.toMatchObject({ code: "DATA_CORRUPTION" });
  });

  it("maps Audit keyset pagination without bigint precision loss", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);
    const input = parseIdentityAccessAuditListInput({
      before: { auditId: "9007199254740993", createdAt: laterTime },
      limit: 2,
      targetUserId,
    });

    await expect(repository.listSubjectAudit(input)).resolves.toMatchObject({
      items: [
        {
          auditId: "42",
          createdAt: new Date(laterTime),
          result: "saved",
        },
      ],
    });
    expect(source.listAudit).toHaveBeenCalledWith({
      p_before: {
        auditId: "9007199254740993",
        createdAt: laterTime,
      },
      p_limit: 2,
      p_user_id: targetUserId,
    });
  });

  it("fails closed for null, extra, malformed and over-limit read data", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);
    const searchInput = parseIdentityAccessSubjectSearchInput({ limit: 1 });

    for (const value of [
      null,
      subjectPage({ secret: "provider metadata" }),
      subjectPage({ items: [subjectSummary({ userId: "not-a-uuid" })] }),
      subjectPage({ items: [subjectSummary(), subjectSummary()] }),
    ]) {
      source.searchSubjects.mockResolvedValueOnce(value);
      await expect(
        repository.searchSubjects(searchInput),
      ).rejects.toMatchObject({
        code: "DATA_CORRUPTION",
      });
    }
  });
});

describe("strict Identity Access ordinary mutation Repository", () => {
  it("maps Grant Author parameters and Saved", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    await expect(
      repository.grantAuthorRole(grantCommand()),
    ).resolves.toMatchObject({
      auditLogId: "43",
      changedAt: new Date(laterTime),
      requestId: { value: requestId },
      roleGrantId: grantId,
      status: "saved",
    });
    expect(source.grantAuthorRole).toHaveBeenCalledWith({
      p_expected_state_token: token,
      p_reason: "Grant Author access",
      p_request_id: requestId,
      p_target_user_id: targetUserId,
    });
  });

  it("maps Revoke Author parameters and Unchanged", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    await expect(
      repository.revokeAuthorRole(revokeCommand()),
    ).resolves.toMatchObject({ status: "unchanged" });
    expect(source.revokeAuthorRole).toHaveBeenCalledWith({
      p_expected_state_token: token,
      p_reason: "Revoke Author access",
      p_request_id: requestId,
      p_target_user_id: targetUserId,
    });
  });

  it("maps ordinary Membership parameters and preserves Conflict review state", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    await expect(
      repository.setOrdinaryMembershipState(membershipCommand()),
    ).resolves.toMatchObject({
      conflictReason: "expected_state_mismatch",
      currentState: { targetUserId: { value: targetUserId } },
      stateToken: { value: changedToken },
      status: "conflict",
    });
    expect(source.setOrdinaryMembershipState).toHaveBeenCalledWith({
      p_expected_state_token: token,
      p_reason: "Suspend ordinary access",
      p_request_id: requestId,
      p_state: "suspended",
      p_target_user_id: targetUserId,
    });
  });

  it("rejects mismatched IDs and operation-inconsistent Saved shapes", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    source.grantAuthorRole.mockResolvedValueOnce(
      savedResult({ requestId: otherRequestId }),
    );
    await expect(
      repository.grantAuthorRole(grantCommand()),
    ).rejects.toMatchObject({
      code: "DATA_CORRUPTION",
    });

    source.grantAuthorRole.mockResolvedValueOnce(
      savedResult({ roleGrantId: undefined }),
    );
    await expect(
      repository.grantAuthorRole(grantCommand()),
    ).rejects.toMatchObject({
      code: "DATA_CORRUPTION",
    });

    source.setOrdinaryMembershipState.mockResolvedValueOnce(savedResult());
    await expect(
      repository.setOrdinaryMembershipState(membershipCommand()),
    ).rejects.toMatchObject({ code: "DATA_CORRUPTION" });
  });

  it("fails closed for null, extra and unknown mutation results", async () => {
    const source = createSource();
    const repository = createIdentityAccessGovernanceRepository(source);

    for (const value of [
      null,
      unchangedResult({ providerSecret: "not allowed" }),
      unchangedResult({ status: "pending" }),
    ]) {
      source.revokeAuthorRole.mockResolvedValueOnce(value);
      await expect(
        repository.revokeAuthorRole(revokeCommand()),
      ).rejects.toMatchObject({ code: "DATA_CORRUPTION" });
    }
  });

  it("does not retry a failed mutation inside the Repository", async () => {
    const source = createSource();
    source.grantAuthorRole.mockRejectedValue({ code: "PGRST003" });
    const repository = createIdentityAccessGovernanceRepository(source);

    await expect(
      repository.grantAuthorRole(grantCommand()),
    ).rejects.toMatchObject({
      code: "REPOSITORY_UNAVAILABLE",
    });
    expect(source.grantAuthorRole).toHaveBeenCalledOnce();
  });
});

describe("allowlisted provider error cleaning", () => {
  it.each([
    [{ code: "28000" }, "UNAUTHENTICATED"],
    [{ code: "42501" }, "FORBIDDEN"],
    [
      { code: "42501", details: "ELEVATED_MUTATION_DEFERRED" },
      "ELEVATED_MUTATION_DEFERRED",
    ],
    [{ code: "22023" }, "INVALID_INPUT"],
    [{ code: "22023", details: "REQUEST_ID_MISMATCH" }, "REQUEST_ID_MISMATCH"],
    [{ code: "P0002" }, "TARGET_NOT_FOUND"],
    [{ code: "PGRST003" }, "REPOSITORY_UNAVAILABLE"],
    [{ code: "XX999" }, "UNKNOWN_REPOSITORY_ERROR"],
    [new Error("private network detail"), "REPOSITORY_UNAVAILABLE"],
  ])("maps %p to %s", (providerError, expectedCode) => {
    expect(mapIdentityAccessGovernanceRpcError(providerError)).toMatchObject({
      code: expectedCode,
    });
  });

  it("does not branch on natural-language messages or leak raw provider data", () => {
    const raw = {
      code: "42501",
      details: "table=private.identity_access_request_ledger",
      hint: "secret token cookie session",
      message: "password and SQLSTATE provider detail",
    };
    const mapped = mapIdentityAccessGovernanceRpcError(raw);

    expect(mapped).toBeInstanceOf(IdentityAccessGovernanceDomainError);
    expect(mapped.code).toBe("FORBIDDEN");
    expect(mapped.message).toBe("Identity access governance is not authorized");
    expect(mapped.message).not.toMatch(
      /password|token|cookie|session|SQLSTATE|private|ledger/iu,
    );
    expect(mapped).not.toHaveProperty("cause");
    expect(mapped).not.toHaveProperty("details");
  });
});

describe("Supabase RPC transport boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls exactly six frozen RPCs and disables retries on every mutation", async () => {
    const requests = [
      rpcRequest(subjectPage()),
      rpcRequest(subjectDetail()),
      rpcRequest(auditPage()),
      rpcRequest(savedResult()),
      rpcRequest(unchangedResult()),
      rpcRequest(conflictResult()),
    ];
    for (const request of requests)
      mocks.serverRpc.mockReturnValueOnce(request);

    const repository = createSupabaseIdentityAccessGovernanceRepository(
      {},
      { getAll: () => [], setAll: () => undefined },
    );
    await repository.searchSubjects(parseIdentityAccessSubjectSearchInput({}));
    await repository.getSubjectDetail(IdentityAccessUserId.parse(targetUserId));
    await repository.listSubjectAudit(
      parseIdentityAccessAuditListInput({ targetUserId }),
    );
    await repository.grantAuthorRole(grantCommand());
    await repository.revokeAuthorRole(revokeCommand());
    await repository.setOrdinaryMembershipState(membershipCommand());

    expect(mocks.serverRpc.mock.calls.map(([name]) => name)).toEqual([
      "search_identity_access_subjects_v1",
      "get_identity_access_subject_v1",
      "list_identity_access_audit_v1",
      "grant_author_role_v2",
      "revoke_author_role_v2",
      "set_ordinary_membership_state_v2",
    ]);
    expect(mocks.serverRpc).toHaveBeenNthCalledWith(
      1,
      "search_identity_access_subjects_v1",
      { p_cursor: null, p_limit: 25, p_query: null },
    );
    expect(mocks.serverRpc).toHaveBeenNthCalledWith(
      2,
      "get_identity_access_subject_v1",
      { p_user_id: targetUserId },
    );
    expect(mocks.serverRpc).toHaveBeenNthCalledWith(
      3,
      "list_identity_access_audit_v1",
      { p_before: null, p_limit: 25, p_user_id: targetUserId },
    );
    expect(requests[0]?.retry).not.toHaveBeenCalled();
    expect(requests[1]?.retry).not.toHaveBeenCalled();
    expect(requests[2]?.retry).not.toHaveBeenCalled();
    expect(requests[3]?.retry).toHaveBeenCalledOnce();
    expect(requests[3]?.retry).toHaveBeenCalledWith(false);
    expect(requests[4]?.retry).toHaveBeenCalledWith(false);
    expect(requests[5]?.retry).toHaveBeenCalledWith(false);
  });

  it("cleans an RPC error returned in the data/error pair", async () => {
    mocks.serverRpc.mockReturnValue(
      rpcRequest(null, {
        code: "22023",
        details: "REQUEST_ID_MISMATCH",
        message: "raw payload detail",
      }),
    );
    const repository = createSupabaseIdentityAccessGovernanceRepository(
      {},
      { getAll: () => [], setAll: () => undefined },
    );

    await expect(
      repository.grantAuthorRole(grantCommand()),
    ).rejects.toMatchObject({
      code: "REQUEST_ID_MISMATCH",
      message: "Identity access request does not match its original payload",
    });
    expect(mocks.serverRpc).toHaveBeenCalledOnce();
  });

  it("contains no direct table access, private helper or legacy fallback", async () => {
    const packageRoot = process.cwd().endsWith("packages/database")
      ? process.cwd()
      : resolve(process.cwd(), "packages/database");
    const source = await readFile(
      resolve(packageRoot, "src/identity-access-governance-repository.ts"),
      "utf8",
    );
    const rpcNames = [...source.matchAll(/client\.rpc\("([^"]+)"/gu)]
      .map((match) => match[1])
      .sort();

    expect(rpcNames).toEqual(
      [
        "get_identity_access_subject_v1",
        "grant_author_role_v2",
        "list_identity_access_audit_v1",
        "revoke_author_role_v2",
        "search_identity_access_subjects_v1",
        "set_ordinary_membership_state_v2",
      ].sort(),
    );
    expect(source).not.toContain(".from(");
    expect(source).not.toMatch(
      /private\.|grant_role|revoke_role|set_membership_state/gu,
    );
    expect(source.match(/\.retry\(false\)/gu)).toHaveLength(3);
  });
});
