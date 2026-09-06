import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  createTrustedAccessContext,
  type ElevatedRole,
  type MembershipState,
  type TrustedAccessContext,
} from "@fandom-harbor/auth";
import { describe, expect, it, vi } from "vitest";

import {
  IdentityAccessGovernanceDomainError,
  parseIdentityAccessGovernanceAuditPage,
  parseIdentityAccessMutationResult,
  parseIdentityAccessSubjectDetail,
  parseIdentityAccessSubjectPage,
  type IdentityAccessGovernanceReadPort,
  type IdentityAccessGovernanceWritePort,
} from "./identity-access-governance-domain";
import {
  createIdentityAccessGovernanceService,
  type IdentityAccessGovernanceService,
  type IdentityAccessGovernanceServiceDependencies,
} from "./identity-access-governance-service";

const actorUserId = "10000000-0000-4000-8000-000000000001";
const targetUserId = "10000000-0000-4000-8000-000000000002";
const otherUserId = "10000000-0000-4000-8000-000000000003";
const requestId = "20000000-0000-4000-8000-000000000001";
const grantId = "30000000-0000-4000-8000-000000000001";
const stateToken = "a".repeat(64);
const changedStateToken = "b".repeat(64);
const occurredAt = "2026-08-18T00:00:00.000Z";

function accessContext(
  membershipState: MembershipState = "active",
  roles: ElevatedRole[] = ["admin"],
): TrustedAccessContext {
  return createTrustedAccessContext({
    identity: { id: actorUserId },
    membershipState,
    roles,
  });
}

function stateSnapshot() {
  return {
    activeRoleGrants: [],
    membership: { state: "active", updatedAt: occurredAt },
    targetUserId,
  };
}

function subjectDetail(isElevatedAccount = false) {
  return parseIdentityAccessSubjectDetail({
    activeRoleGrants: isElevatedAccount
      ? [
          {
            grantId,
            grantedAt: occurredAt,
            grantedBy: actorUserId,
            role: "admin",
          },
        ]
      : [],
    effectiveRoles: isElevatedAccount ? ["reader", "admin"] : ["reader"],
    expectedState: { snapshot: stateSnapshot(), token: stateToken },
    isElevatedAccount,
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
    registrationName: "Harbor Reader",
    userId: targetUserId,
  });
}

function subjectPage() {
  return parseIdentityAccessSubjectPage({
    hasMore: false,
    items: [
      {
        effectiveRoles: ["reader"],
        membershipState: "active",
        membershipUpdatedAt: occurredAt,
        profileUpdatedAt: occurredAt,
        registrationName: "Harbor Reader",
        userId: targetUserId,
      },
    ],
    nextCursor: null,
  });
}

function auditPage() {
  return parseIdentityAccessGovernanceAuditPage({
    hasMore: false,
    items: [],
    nextCursor: null,
  });
}

function mutationResult(status: "conflict" | "saved" | "unchanged") {
  if (status === "saved") {
    return parseIdentityAccessMutationResult({
      auditLogId: "1",
      changedAt: occurredAt,
      currentState: stateSnapshot(),
      requestId,
      roleGrantId: grantId,
      stateToken: changedStateToken,
      status,
      targetUserId,
    });
  }
  if (status === "conflict") {
    return parseIdentityAccessMutationResult({
      conflictReason: "expected_state_mismatch",
      currentState: stateSnapshot(),
      requestId,
      stateToken: changedStateToken,
      status,
      targetUserId,
    });
  }
  return parseIdentityAccessMutationResult({
    currentState: stateSnapshot(),
    requestId,
    stateToken,
    status,
    targetUserId,
  });
}

function readPort(): IdentityAccessGovernanceReadPort {
  return {
    getSubjectDetail: vi.fn(async () => subjectDetail()),
    listSubjectAudit: vi.fn(async () => auditPage()),
    searchSubjects: vi.fn(async () => subjectPage()),
  };
}

function writePort(): IdentityAccessGovernanceWritePort {
  return {
    grantAuthorRole: vi.fn(async () => mutationResult("saved")),
    revokeAuthorRole: vi.fn(async () => mutationResult("unchanged")),
    setOrdinaryMembershipState: vi.fn(async () => mutationResult("conflict")),
  };
}

function dependencies(
  context: TrustedAccessContext | null = accessContext(),
): IdentityAccessGovernanceServiceDependencies {
  return {
    access: { getCurrent: vi.fn(async () => context) },
    read: readPort(),
    write: writePort(),
  };
}

const searchInput = { limit: 25, query: "  HARBOR READER  " };
const auditInput = { limit: 25, targetUserId };
const grantInput = {
  expectedStateToken: stateToken,
  reason: "  Grant Cafe\u0301 Author  ",
  requestId,
  targetUserId,
};
const revokeInput = {
  expectedStateToken: stateToken,
  reason: "  Revoke Author access  ",
  requestId,
  targetUserId,
};
const membershipInput = {
  expectedStateToken: stateToken,
  reason: "  Suspend ordinary access  ",
  requestId,
  state: "suspended",
  targetUserId,
};

type OperationCase = readonly [
  string,
  (service: IdentityAccessGovernanceService) => Promise<unknown>,
];

const operationCases: OperationCase[] = [
  ["search", (service) => service.searchSubjects(searchInput)],
  ["detail", (service) => service.getSubjectDetail(targetUserId)],
  ["audit", (service) => service.listSubjectAudit(auditInput)],
  ["grant Author", (service) => service.grantAuthorRole(grantInput)],
  ["revoke Author", (service) => service.revokeAuthorRole(revokeInput)],
  [
    "ordinary Membership",
    (service) => service.setOrdinaryMembershipState(membershipInput),
  ],
];

function expectPortsUntouched(
  current: IdentityAccessGovernanceServiceDependencies,
): void {
  expect(current.read.getSubjectDetail).not.toHaveBeenCalled();
  expect(current.read.listSubjectAudit).not.toHaveBeenCalled();
  expect(current.read.searchSubjects).not.toHaveBeenCalled();
  expect(current.write.grantAuthorRole).not.toHaveBeenCalled();
  expect(current.write.revokeAuthorRole).not.toHaveBeenCalled();
  expect(current.write.setOrdinaryMembershipState).not.toHaveBeenCalled();
}

describe("Identity Access Governance live-access Service", () => {
  it.each(["admin", "super_admin"] as const)(
    "executes a fresh live-access check for all six use cases as active %s",
    async (role) => {
      const current = dependencies(accessContext("active", [role]));
      const service = createIdentityAccessGovernanceService(current);

      for (const [, invoke] of operationCases) await invoke(service);

      expect(current.access.getCurrent).toHaveBeenCalledTimes(6);
      expect(current.read.searchSubjects).toHaveBeenCalledOnce();
      expect(current.read.listSubjectAudit).toHaveBeenCalledOnce();
      expect(current.read.getSubjectDetail).toHaveBeenCalledTimes(4);
      expect(current.write.grantAuthorRole).toHaveBeenCalledOnce();
      expect(current.write.revokeAuthorRole).toHaveBeenCalledOnce();
      expect(current.write.setOrdinaryMembershipState).toHaveBeenCalledOnce();
    },
  );

  it.each(operationCases)(
    "rejects unauthenticated %s before every Port",
    async (_name, invoke) => {
      const current = dependencies(null);
      await expect(
        invoke(createIdentityAccessGovernanceService(current)),
      ).rejects.toMatchObject({ code: "UNAUTHENTICATED" });
      expect(current.access.getCurrent).toHaveBeenCalledOnce();
      expectPortsUntouched(current);
    },
  );

  const deniedContexts = [
    ["Reader", accessContext("active", [])],
    ["Author", accessContext("active", ["author"])],
    ["pending Admin", accessContext("pending", ["admin"])],
    ["suspended Admin", accessContext("suspended", ["admin"])],
    ["revoked Super Admin", accessContext("revoked", ["super_admin"])],
  ] as const;

  it.each(
    deniedContexts.flatMap(([actor, context]) =>
      operationCases.map(
        ([operation, invoke]) => [actor, context, operation, invoke] as const,
      ),
    ),
  )(
    "denies %s for %s before every Port",
    async (_actor, context, _operation, invoke) => {
      const current = dependencies(context);
      await expect(
        invoke(createIdentityAccessGovernanceService(current)),
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
      expect(current.access.getCurrent).toHaveBeenCalledOnce();
      expectPortsUntouched(current);
    },
  );

  it.each([
    [
      "search",
      { limit: 0 },
      (service: IdentityAccessGovernanceService, value: unknown) =>
        service.searchSubjects(value),
    ],
    [
      "detail",
      "not-a-uuid",
      (service: IdentityAccessGovernanceService, value: unknown) =>
        service.getSubjectDetail(value),
    ],
    [
      "audit",
      { targetUserId: "not-a-uuid" },
      (service: IdentityAccessGovernanceService, value: unknown) =>
        service.listSubjectAudit(value),
    ],
    [
      "grant",
      { ...grantInput, reason: "bad" },
      (service: IdentityAccessGovernanceService, value: unknown) =>
        service.grantAuthorRole(value),
    ],
    [
      "revoke",
      { ...revokeInput, requestId: "not-a-uuid" },
      (service: IdentityAccessGovernanceService, value: unknown) =>
        service.revokeAuthorRole(value),
    ],
    [
      "Membership",
      { ...membershipInput, state: "pending" },
      (service: IdentityAccessGovernanceService, value: unknown) =>
        service.setOrdinaryMembershipState(value),
    ],
  ] as const)(
    "validates invalid %s input before live access",
    async (_name, value, invoke) => {
      const current = dependencies();
      await expect(
        invoke(createIdentityAccessGovernanceService(current), value),
      ).rejects.toMatchObject({ code: "INVALID_INPUT" });
      expect(current.access.getCurrent).not.toHaveBeenCalled();
      expectPortsUntouched(current);
    },
  );

  it("normalizes search input and calls no mutation Port", async () => {
    const current = dependencies();
    const result =
      await createIdentityAccessGovernanceService(current).searchSubjects(
        searchInput,
      );

    expect(result).toEqual(subjectPage());
    expect(current.read.searchSubjects).toHaveBeenCalledWith({
      cursor: null,
      limit: { value: 25 },
      query: {
        kind: "registrationName",
        registrationName: { value: "harbor reader" },
      },
    });
    expect(current.write.grantAuthorRole).not.toHaveBeenCalled();
    expect(current.write.revokeAuthorRole).not.toHaveBeenCalled();
    expect(current.write.setOrdinaryMembershipState).not.toHaveBeenCalled();
  });

  it("passes normalized reason and unchanged request identity to Grant Author once", async () => {
    const current = dependencies();
    const result =
      await createIdentityAccessGovernanceService(current).grantAuthorRole(
        grantInput,
      );

    expect(result.status).toBe("saved");
    expect(current.read.getSubjectDetail).toHaveBeenCalledOnce();
    expect(current.write.grantAuthorRole).toHaveBeenCalledOnce();
    expect(current.write.grantAuthorRole).toHaveBeenCalledWith({
      expectedStateToken: { value: stateToken },
      operation: "grantAuthorRole",
      reason: { value: "Grant Café Author" },
      requestId: { value: requestId },
      targetUserId: { value: targetUserId },
    });
  });

  it("passes Revoke Author through exactly once as Unchanged", async () => {
    const current = dependencies();
    const result =
      await createIdentityAccessGovernanceService(current).revokeAuthorRole(
        revokeInput,
      );

    expect(result.status).toBe("unchanged");
    expect(current.write.revokeAuthorRole).toHaveBeenCalledOnce();
    expect(current.write.grantAuthorRole).not.toHaveBeenCalled();
    expect(current.write.setOrdinaryMembershipState).not.toHaveBeenCalled();
  });

  it("preserves Membership Conflict snapshot/token without retrying", async () => {
    const current = dependencies();
    const result =
      await createIdentityAccessGovernanceService(
        current,
      ).setOrdinaryMembershipState(membershipInput);

    expect(result).toMatchObject({
      currentState: { targetUserId: { value: targetUserId } },
      stateToken: { value: changedStateToken },
      status: "conflict",
    });
    expect(current.write.setOrdinaryMembershipState).toHaveBeenCalledOnce();
    expect(current.write.setOrdinaryMembershipState).toHaveBeenCalledWith({
      expectedStateToken: { value: stateToken },
      operation: "setOrdinaryMembershipState",
      reason: { value: "Suspend ordinary access" },
      requestId: { value: requestId },
      state: "suspended",
      targetUserId: { value: targetUserId },
    });
  });

  it.each([
    [
      "grant",
      (service: IdentityAccessGovernanceService) =>
        service.grantAuthorRole(grantInput),
      "grantAuthorRole",
    ],
    [
      "revoke",
      (service: IdentityAccessGovernanceService) =>
        service.revokeAuthorRole(revokeInput),
      "revokeAuthorRole",
    ],
    [
      "Membership",
      (service: IdentityAccessGovernanceService) =>
        service.setOrdinaryMembershipState(membershipInput),
      "setOrdinaryMembershipState",
    ],
  ] as const)(
    "rejects elevated target before %s mutation",
    async (_name, invoke, method) => {
      const current = dependencies();
      vi.mocked(current.read.getSubjectDetail).mockResolvedValue(
        subjectDetail(true),
      );

      await expect(
        invoke(createIdentityAccessGovernanceService(current)),
      ).rejects.toMatchObject({ code: "ELEVATED_MUTATION_DEFERRED" });
      expect(current.read.getSubjectDetail).toHaveBeenCalledOnce();
      expect(current.write[method]).not.toHaveBeenCalled();
    },
  );

  it("keeps the database authoritative when target elevation changes after precheck", async () => {
    const current = dependencies();
    vi.mocked(current.write.grantAuthorRole).mockRejectedValue(
      new IdentityAccessGovernanceDomainError("ELEVATED_MUTATION_DEFERRED"),
    );

    await expect(
      createIdentityAccessGovernanceService(current).grantAuthorRole(
        grantInput,
      ),
    ).rejects.toMatchObject({ code: "ELEVATED_MUTATION_DEFERRED" });
    expect(current.write.grantAuthorRole).toHaveBeenCalledOnce();
  });

  it("does not cache live access between explicit requestId replays", async () => {
    const current = dependencies();
    const service = createIdentityAccessGovernanceService(current);

    await service.grantAuthorRole(grantInput);
    await service.grantAuthorRole(grantInput);

    expect(current.access.getCurrent).toHaveBeenCalledTimes(2);
    expect(current.write.grantAuthorRole).toHaveBeenCalledTimes(2);
    expect(vi.mocked(current.write.grantAuthorRole).mock.calls[0]?.[0]).toEqual(
      vi.mocked(current.write.grantAuthorRole).mock.calls[1]?.[0],
    );
  });

  it("preserves stable provider-neutral Port errors", async () => {
    const current = dependencies();
    const controlled = new IdentityAccessGovernanceDomainError(
      "REPOSITORY_UNAVAILABLE",
    );
    vi.mocked(current.read.searchSubjects).mockRejectedValue(controlled);

    await expect(
      createIdentityAccessGovernanceService(current).searchSubjects(
        searchInput,
      ),
    ).rejects.toBe(controlled);
  });

  it("cleans unknown Port failures without retaining provider metadata", async () => {
    const current = dependencies();
    vi.mocked(current.read.searchSubjects).mockRejectedValue({
      code: "PGRST301",
      message: "rpc profiles token=secret",
    });

    const failure = await createIdentityAccessGovernanceService(current)
      .searchSubjects(searchInput)
      .catch((error: unknown) => error);

    expect(failure).toEqual(
      new IdentityAccessGovernanceDomainError("UNKNOWN_REPOSITORY_ERROR"),
    );
    expect(JSON.stringify(failure)).not.toMatch(
      /PGRST|rpc|profiles|token|secret/iu,
    );
  });

  it("cleans unknown live-access checker failures before every Port", async () => {
    const current = dependencies();
    vi.mocked(current.access.getCurrent).mockRejectedValue(
      new Error("session cookie provider detail"),
    );

    await expect(
      createIdentityAccessGovernanceService(current).getSubjectDetail(
        targetUserId,
      ),
    ).rejects.toMatchObject({ code: "UNKNOWN_REPOSITORY_ERROR" });
    expectPortsUntouched(current);
  });

  it("exposes no provider, framework, RPC, wire or elevated mutation surface", async () => {
    const packageRoot = process.cwd().endsWith("packages/services")
      ? process.cwd()
      : resolve(process.cwd(), "packages/services");
    const source = await readFile(
      resolve(packageRoot, "src/identity-access-governance-service.ts"),
      "utf8",
    );

    expect(source).not.toMatch(
      /supabase|postgrest|next\/|react|@fandom-harbor\/database|client\.rpc|p_[a-z]|grantAdmin|revokeAdmin|grantSuperAdmin|revokeSuperAdmin|retry|user_metadata/iu,
    );
    expect(source).not.toMatch(/as unknown as|:\s*any\b/gu);
    expect(source.match(/getCurrent\(\)/gu)).toHaveLength(2);
    expect(source).toContain("ELEVATED_MUTATION_DEFERRED");
    expect(source).not.toContain(otherUserId);
  });
});
