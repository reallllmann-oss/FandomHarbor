import {
  IdentityAccessGovernanceDomainError,
  parseIdentityAccessGovernanceAuditPage,
  parseIdentityAccessSubjectDetail,
  parseIdentityAccessSubjectPage,
} from "@fandom-harbor/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminIdentityAccessGovernanceReads } from "./identity-access-governance";
import {
  encodeAuditCursor,
  encodeSubjectCursor,
  loadAccessGovernancePageData,
} from "./access-governance-data";

const targetUserId = "10000000-0000-4000-8000-000000000001";
const actorUserId = "10000000-0000-4000-8000-000000000002";
const grantId = "10000000-0000-4000-8000-000000000003";
const occurredAt = "2026-08-18T12:00:00.000Z";

const subjectPage = parseIdentityAccessSubjectPage({
  hasMore: false,
  items: [
    {
      effectiveRoles: ["reader", "author"],
      membershipState: "active",
      membershipUpdatedAt: occurredAt,
      profileUpdatedAt: occurredAt,
      registrationName: "HarborReader",
      userId: targetUserId,
    },
  ],
  nextCursor: null,
});

const subjectDetail = parseIdentityAccessSubjectDetail({
  activeRoleGrants: [
    {
      grantId,
      grantedAt: occurredAt,
      grantedBy: actorUserId,
      role: "author",
    },
  ],
  effectiveRoles: ["reader", "author"],
  expectedState: {
    snapshot: {
      activeRoleGrants: [{ grantId, grantedAt: occurredAt, role: "author" }],
      membership: { state: "active", updatedAt: occurredAt },
      targetUserId,
    },
    token: "a".repeat(64),
  },
  isElevatedAccount: false,
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

const auditPage = parseIdentityAccessGovernanceAuditPage({
  hasMore: false,
  items: [
    {
      action: "role.granted",
      actor: { registrationName: "HarborAdmin", userId: actorUserId },
      after: { role: "author" },
      auditId: "42",
      before: null,
      createdAt: occurredAt,
      reason: "Grant ordinary Author access",
      result: "saved",
      targetRole: "author",
      targetState: null,
    },
  ],
  nextCursor: null,
});

function createReads(): AdminIdentityAccessGovernanceReads {
  return {
    getSubjectDetail: vi.fn(async () => subjectDetail),
    listSubjectAudit: vi.fn(async () => auditPage),
    searchSubjects: vi.fn(async () => subjectPage),
  };
}

describe("P1-03 access governance page data", () => {
  let reads: AdminIdentityAccessGovernanceReads;

  beforeEach(() => {
    reads = createReads();
  });

  it("uses only the search Service for the initial directory read", async () => {
    await expect(
      loadAccessGovernancePageData(
        { q: " HarborReader " },
        { createReads: vi.fn(async () => reads) },
      ),
    ).resolves.toEqual({
      auditPage: null,
      query: " HarborReader ",
      searchCursor: null,
      selectedSubject: null,
      status: "ready",
      subjectPage,
    });

    expect(reads.searchSubjects).toHaveBeenCalledOnce();
    expect(reads.searchSubjects).toHaveBeenCalledWith({
      cursor: null,
      limit: 20,
      query: " HarborReader ",
    });
    expect(reads.getSubjectDetail).not.toHaveBeenCalled();
    expect(reads.listSubjectAudit).not.toHaveBeenCalled();
  });

  it("calls each of the three approved read Service methods once for a selected subject", async () => {
    const result = await loadAccessGovernancePageData(
      { q: "harbor", subject: targetUserId },
      { createReads: vi.fn(async () => reads) },
    );

    expect(result).toMatchObject({
      auditPage,
      selectedSubject: subjectDetail,
      status: "ready",
      subjectPage,
    });
    expect(reads.searchSubjects).toHaveBeenCalledOnce();
    expect(reads.getSubjectDetail).toHaveBeenCalledOnce();
    expect(reads.getSubjectDetail).toHaveBeenCalledWith(targetUserId);
    expect(reads.listSubjectAudit).toHaveBeenCalledOnce();
    expect(reads.listSubjectAudit).toHaveBeenCalledWith({
      before: null,
      limit: 20,
      targetUserId,
    });
  });

  it.each([
    ["UNAUTHENTICATED", "unauthenticated"],
    ["FORBIDDEN", "forbidden"],
  ] as const)(
    "maps %s without attempting detail or Audit reads",
    async (code, status) => {
      vi.mocked(reads.searchSubjects).mockRejectedValue(
        new IdentityAccessGovernanceDomainError(code),
      );

      await expect(
        loadAccessGovernancePageData(
          { subject: targetUserId },
          { createReads: vi.fn(async () => reads) },
        ),
      ).resolves.toEqual({ status });
      expect(reads.getSubjectDetail).not.toHaveBeenCalled();
      expect(reads.listSubjectAudit).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["INVALID_INPUT", "invalid-request"],
    ["TARGET_NOT_FOUND", "subject-unavailable"],
    ["REPOSITORY_UNAVAILABLE", "temporarily-unavailable"],
  ] as const)("maps %s to a safe read error", async (code, error) => {
    vi.mocked(reads.searchSubjects).mockRejectedValue(
      new IdentityAccessGovernanceDomainError(code),
    );

    await expect(
      loadAccessGovernancePageData(
        {},
        { createReads: vi.fn(async () => reads) },
      ),
    ).resolves.toEqual({ error, status: "read-error" });
  });

  it("does not request Audit when the selected detail is unavailable", async () => {
    vi.mocked(reads.getSubjectDetail).mockRejectedValue(
      new IdentityAccessGovernanceDomainError("TARGET_NOT_FOUND"),
    );

    await expect(
      loadAccessGovernancePageData(
        { subject: targetUserId },
        { createReads: vi.fn(async () => reads) },
      ),
    ).resolves.toEqual({
      error: "subject-unavailable",
      status: "read-error",
    });
    expect(reads.listSubjectAudit).not.toHaveBeenCalled();
  });

  it("cleans unknown composition failures to the fixed unavailable state", async () => {
    await expect(
      loadAccessGovernancePageData(
        {},
        {
          createReads: vi.fn(async () => {
            throw new Error("provider details must not escape");
          }),
        },
      ),
    ).resolves.toEqual({
      error: "temporarily-unavailable",
      status: "read-error",
    });
  });

  it("forwards opaque stable cursors without recreating state logic", async () => {
    const searchCursor = {
      missingRegistrationName: false,
      normalizedRegistrationName: { value: "harborreader" },
      userId: { value: targetUserId },
    };
    const auditCursor = {
      auditId: "42",
      createdAt: new Date(occurredAt),
    };
    const encodedSearch = encodeSubjectCursor(searchCursor);
    const encodedAudit = encodeAuditCursor(auditCursor);

    await loadAccessGovernancePageData(
      {
        auditCursor: encodedAudit,
        cursor: encodedSearch,
        subject: targetUserId,
      },
      { createReads: vi.fn(async () => reads) },
    );

    expect(reads.searchSubjects).toHaveBeenCalledWith({
      cursor: {
        missingRegistrationName: false,
        normalizedRegistrationName: "harborreader",
        userId: targetUserId,
      },
      limit: 20,
      query: null,
    });
    expect(reads.listSubjectAudit).toHaveBeenCalledWith({
      before: { auditId: "42", createdAt: occurredAt },
      limit: 20,
      targetUserId,
    });
  });

  it("fails closed on malformed cursor transport", async () => {
    vi.mocked(reads.searchSubjects).mockImplementation(async (input) => {
      const cursor = Reflect.get(input as object, "cursor");
      if (
        typeof cursor === "object" &&
        cursor !== null &&
        Reflect.get(cursor, "invalidCursor") === true
      ) {
        throw new IdentityAccessGovernanceDomainError("INVALID_INPUT");
      }
      return subjectPage;
    });

    await expect(
      loadAccessGovernancePageData(
        { cursor: "not-base64-json" },
        { createReads: vi.fn(async () => reads) },
      ),
    ).resolves.toEqual({
      error: "invalid-request",
      status: "read-error",
    });
  });
});
