import { describe, expect, it } from "vitest";

import {
  IDENTITY_ACCESS_DEFAULT_PAGE_LIMIT,
  IdentityAccessExpectedStateToken,
  IdentityAccessGovernanceDomainError,
  IdentityAccessNormalizedReason,
  IdentityAccessPageLimit,
  IdentityAccessRegistrationNameQuery,
  IdentityAccessRequestId,
  IdentityAccessUserId,
  parseGrantAuthorRoleCommand,
  parseIdentityAccessAuditCursor,
  parseIdentityAccessAuditListInput,
  parseIdentityAccessGovernanceAuditPage,
  parseIdentityAccessMutationResult,
  parseIdentityAccessSearchQuery,
  parseIdentityAccessSubjectCursor,
  parseIdentityAccessSubjectDetail,
  parseIdentityAccessSubjectPage,
  parseIdentityAccessSubjectSearchInput,
  parseRevokeAuthorRoleCommand,
  parseSetOrdinaryMembershipStateCommand,
  type IdentityAccessGovernanceErrorCode,
  type IdentityAccessMutationResult,
} from "./identity-access-governance-domain";

const userId = "10000000-0000-4000-8000-000000000001";
const actorUserId = "10000000-0000-4000-8000-000000000002";
const requestId = "10000000-0000-4000-8000-000000000003";
const grantId = "10000000-0000-4000-8000-000000000004";
const expectedStateToken = "a".repeat(64);
const nextStateToken = "b".repeat(64);
const occurredAt = "2026-08-17T12:00:00.000000Z";
const errorCodes: IdentityAccessGovernanceErrorCode[] = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "INVALID_INPUT",
  "TARGET_NOT_FOUND",
  "CONFLICT",
  "REQUEST_ID_MISMATCH",
  "ELEVATED_MUTATION_DEFERRED",
  "DATA_CORRUPTION",
  "REPOSITORY_UNAVAILABLE",
  "UNKNOWN_REPOSITORY_ERROR",
];

function stateSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    activeRoleGrants: [
      {
        grantId,
        grantedAt: occurredAt,
        role: "author",
      },
    ],
    membership: {
      state: "active",
      updatedAt: occurredAt,
    },
    targetUserId: userId,
    ...overrides,
  };
}

function subjectSummary(overrides: Record<string, unknown> = {}) {
  return {
    effectiveRoles: ["reader", "author"],
    membershipState: "active",
    membershipUpdatedAt: occurredAt,
    profileUpdatedAt: occurredAt,
    registrationName: "HarborReader",
    userId,
    ...overrides,
  };
}

function subjectDetail(overrides: Record<string, unknown> = {}) {
  return {
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
      snapshot: stateSnapshot(),
      token: expectedStateToken,
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
    userId,
    ...overrides,
  };
}

function command(overrides: Record<string, unknown> = {}) {
  return {
    expectedStateToken,
    reason: "Grant ordinary Author access",
    requestId,
    targetUserId: userId,
    ...overrides,
  };
}

function mutationBase(overrides: Record<string, unknown> = {}) {
  return {
    currentState: stateSnapshot(),
    requestId,
    stateToken: nextStateToken,
    targetUserId: userId,
    ...overrides,
  };
}

describe("identity access foundational values", () => {
  it("parses canonical UUID values and normalizes hexadecimal case", () => {
    expect(
      IdentityAccessUserId.parse("10000000-0000-4000-8000-00000000000A").value,
    ).toBe("10000000-0000-4000-8000-00000000000a");
    expect(IdentityAccessRequestId.parse(requestId).value).toBe(requestId);
  });

  it.each([null, 42, "not-a-uuid", "00000000-0000-0000-0000-000000000000"])(
    "rejects invalid or nil UUID input %j",
    (value) => {
      expect(() => IdentityAccessUserId.parse(value)).toThrow(
        IdentityAccessGovernanceDomainError,
      );
      expect(() => IdentityAccessRequestId.parse(value)).toThrow(
        IdentityAccessGovernanceDomainError,
      );
    },
  );

  it("keeps expected-state as an opaque lowercase SHA-256 token", () => {
    expect(
      IdentityAccessExpectedStateToken.parse(expectedStateToken).value,
    ).toBe(expectedStateToken);
    expect(() =>
      IdentityAccessExpectedStateToken.parse("A".repeat(64)),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      IdentityAccessExpectedStateToken.parse("a".repeat(63)),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("normalizes registration-name search with NFKC, trim and case-fold", () => {
    expect(
      IdentityAccessRegistrationNameQuery.parse("  ＨＡＲＢＯＲ  ").value,
    ).toBe("harbor");
    expect(parseIdentityAccessSearchQuery("  ＨＡＲＢＯＲ  ")).toMatchObject({
      kind: "registrationName",
      registrationName: { value: "harbor" },
    });
  });

  it("distinguishes full User ID search from registration-name search", () => {
    expect(parseIdentityAccessSearchQuery(userId)).toMatchObject({
      kind: "userId",
      userId: { value: userId },
    });
    expect(parseIdentityAccessSearchQuery("   ")).toBeNull();
    expect(parseIdentityAccessSearchQuery(null)).toBeNull();
  });

  it("rejects registration-name controls and post-NFKC values over 64 code points", () => {
    expect(() =>
      IdentityAccessRegistrationNameQuery.parse("Harbor\u0000"),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      IdentityAccessRegistrationNameQuery.parse("界".repeat(65)),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("normalizes reason with NFC and trim", () => {
    expect(IdentityAccessNormalizedReason.parse("  e\u0301dit  ").value).toBe(
      "édit",
    );
  });

  it("enforces reason boundaries at 4 and 200 code points", () => {
    expect(IdentityAccessNormalizedReason.parse("界".repeat(4)).value).toBe(
      "界".repeat(4),
    );
    expect(IdentityAccessNormalizedReason.parse("😀".repeat(200)).value).toBe(
      "😀".repeat(200),
    );
    expect(() => IdentityAccessNormalizedReason.parse("界".repeat(3))).toThrow(
      IdentityAccessGovernanceDomainError,
    );
    expect(() =>
      IdentityAccessNormalizedReason.parse("界".repeat(201)),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it.each(["ab\ncd", "ab\rcd", "abcd\u0000"])(
    "rejects controls and line breaks in reason",
    (value) => {
      expect(() => IdentityAccessNormalizedReason.parse(value)).toThrow(
        IdentityAccessGovernanceDomainError,
      );
    },
  );

  it("defaults page limit to 25 and accepts the frozen 1–50 range", () => {
    expect(IdentityAccessPageLimit.parse(undefined).value).toBe(
      IDENTITY_ACCESS_DEFAULT_PAGE_LIMIT,
    );
    expect(IdentityAccessPageLimit.parse(1).value).toBe(1);
    expect(IdentityAccessPageLimit.parse(50).value).toBe(50);
  });

  it.each([0, 51, 1.5, Number.NaN, "25"])(
    "rejects invalid page limit %j",
    (value) => {
      expect(() => IdentityAccessPageLimit.parse(value)).toThrow(
        IdentityAccessGovernanceDomainError,
      );
    },
  );
});

describe("identity access cursors and read input", () => {
  it("parses a stable registration-name cursor", () => {
    expect(
      parseIdentityAccessSubjectCursor({
        missingRegistrationName: false,
        normalizedRegistrationName: "harborreader",
        userId,
      }),
    ).toMatchObject({
      missingRegistrationName: false,
      normalizedRegistrationName: { value: "harborreader" },
      userId: { value: userId },
    });
  });

  it("requires a null normalized name for missing-registration-name cursor", () => {
    expect(
      parseIdentityAccessSubjectCursor({
        missingRegistrationName: true,
        normalizedRegistrationName: null,
        userId,
      }),
    ).toMatchObject({ missingRegistrationName: true });
    expect(() =>
      parseIdentityAccessSubjectCursor({
        missingRegistrationName: true,
        normalizedRegistrationName: "harbor",
        userId,
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("rejects denormalized or extra subject cursor fields", () => {
    expect(() =>
      parseIdentityAccessSubjectCursor({
        missingRegistrationName: false,
        normalizedRegistrationName: "Harbor",
        userId,
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseIdentityAccessSubjectCursor({
        extra: true,
        missingRegistrationName: false,
        normalizedRegistrationName: "harbor",
        userId,
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("parses the stable Audit cursor without bigint precision loss", () => {
    expect(
      parseIdentityAccessAuditCursor({
        auditId: "9007199254740993",
        createdAt: occurredAt,
      }),
    ).toMatchObject({ auditId: "9007199254740993" });
    expect(() =>
      parseIdentityAccessAuditCursor({ auditId: 1, createdAt: occurredAt }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("normalizes bounded subject search input and rejects unknown fields", () => {
    expect(
      parseIdentityAccessSubjectSearchInput({ query: " ＨＡＲＢＯＲ " }),
    ).toMatchObject({
      cursor: null,
      limit: { value: 25 },
      query: {
        kind: "registrationName",
        registrationName: { value: "harbor" },
      },
    });
    expect(() => parseIdentityAccessSubjectSearchInput({ offset: 20 })).toThrow(
      IdentityAccessGovernanceDomainError,
    );
  });

  it("parses target Audit input with a bounded cursor", () => {
    expect(
      parseIdentityAccessAuditListInput({
        before: { auditId: "10", createdAt: occurredAt },
        limit: 50,
        targetUserId: userId,
      }),
    ).toMatchObject({
      before: { auditId: "10" },
      limit: { value: 50 },
      targetUserId: { value: userId },
    });
  });
});

describe("identity access read models", () => {
  it("strictly parses the minimal subject page", () => {
    const result = parseIdentityAccessSubjectPage({
      hasMore: true,
      items: [subjectSummary()],
      nextCursor: {
        missingRegistrationName: false,
        normalizedRegistrationName: "harborreader",
        userId,
      },
    });

    expect(result.items[0]).toMatchObject({
      effectiveRoles: ["reader", "author"],
      membershipState: "active",
      registrationName: "HarborReader",
      userId: { value: userId },
    });
    expect(result.items[0]?.membershipUpdatedAt).toBeInstanceOf(Date);
  });

  it("rejects malformed subject page state and unknown fields", () => {
    expect(() =>
      parseIdentityAccessSubjectPage({
        hasMore: true,
        items: [subjectSummary()],
        nextCursor: null,
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseIdentityAccessSubjectPage({
        hasMore: false,
        items: [subjectSummary({ email: "private@example.invalid" })],
        nextCursor: null,
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("parses desensitized detail, Membership, active grants and expected state", () => {
    const result = parseIdentityAccessSubjectDetail(subjectDetail());
    expect(result.profile).toMatchObject({
      registrationName: "HarborReader",
      userId: { value: userId },
    });
    expect(result.membership).toMatchObject({ state: "active" });
    expect(result.activeRoleGrants[0]).toMatchObject({
      grantId,
      grantedBy: { value: actorUserId },
      role: "author",
    });
    expect(result.expectedState.token.value).toBe(expectedStateToken);
  });

  it("allows elevated accounts only in the read detail model", () => {
    const elevatedGrantId = "10000000-0000-4000-8000-000000000005";
    const result = parseIdentityAccessSubjectDetail(
      subjectDetail({
        activeRoleGrants: [
          {
            grantId: elevatedGrantId,
            grantedAt: occurredAt,
            grantedBy: null,
            role: "super_admin",
          },
        ],
        effectiveRoles: ["reader", "super_admin"],
        expectedState: {
          snapshot: stateSnapshot({
            activeRoleGrants: [
              {
                grantId: elevatedGrantId,
                grantedAt: occurredAt,
                role: "super_admin",
              },
            ],
          }),
          token: expectedStateToken,
        },
        isElevatedAccount: true,
        isOnlyActiveSuperAdmin: true,
      }),
    );
    expect(result.isElevatedAccount).toBe(true);
    expect(result.activeRoleGrants[0]?.role).toBe("super_admin");
  });

  it("rejects expected-state target mismatch and sensitive extra detail", () => {
    expect(() =>
      parseIdentityAccessSubjectDetail(
        subjectDetail({
          expectedState: {
            snapshot: stateSnapshot({ targetUserId: actorUserId }),
            token: expectedStateToken,
          },
        }),
      ),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseIdentityAccessSubjectDetail(
        subjectDetail({ authMetadata: { provider: "password" } }),
      ),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("strictly parses a governance Audit page and nullable system actor", () => {
    const result = parseIdentityAccessGovernanceAuditPage({
      hasMore: false,
      items: [
        {
          action: "membership.state_changed",
          actor: null,
          after: { membershipState: "suspended" },
          auditId: "42",
          before: { membershipState: "active" },
          createdAt: occurredAt,
          reason: "Suspend ordinary account",
          result: "saved",
          targetRole: null,
          targetState: "suspended",
        },
      ],
      nextCursor: null,
    });
    expect(result.items[0]).toMatchObject({
      action: "membership.state_changed",
      actor: null,
      auditId: "42",
      result: "saved",
    });
  });

  it("rejects raw Audit metadata and malformed timestamps", () => {
    expect(() =>
      parseIdentityAccessGovernanceAuditPage({
        hasMore: false,
        items: [
          {
            action: "role.granted",
            actor: { registrationName: "Admin", userId: actorUserId },
            after: { role: "author" },
            auditId: "43",
            before: null,
            createdAt: "not-a-date",
            metadata: { requestId },
            reason: "Grant ordinary Author",
            result: "saved",
            targetRole: "author",
            targetState: null,
          },
        ],
        nextCursor: null,
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });
});

describe("ordinary governance commands", () => {
  it("parses Grant Author and Revoke Author without a role field", () => {
    expect(parseGrantAuthorRoleCommand(command())).toMatchObject({
      operation: "grantAuthorRole",
      reason: { value: "Grant ordinary Author access" },
    });
    expect(parseRevokeAuthorRoleCommand(command())).toMatchObject({
      operation: "revokeAuthorRole",
    });
  });

  it.each(["active", "suspended", "revoked"])(
    "parses ordinary Membership state %s",
    (state) => {
      expect(
        parseSetOrdinaryMembershipStateCommand(command({ state })),
      ).toMatchObject({ operation: "setOrdinaryMembershipState", state });
    },
  );

  it("rejects pending Membership and every elevated or proof injection", () => {
    expect(() =>
      parseSetOrdinaryMembershipStateCommand(command({ state: "pending" })),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseGrantAuthorRoleCommand(command({ role: "admin" })),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseRevokeAuthorRoleCommand(command({ role: "super_admin" })),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseGrantAuthorRoleCommand(command({ reauthProof: true })),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() => parseGrantAuthorRoleCommand(command({ actorUserId }))).toThrow(
      IdentityAccessGovernanceDomainError,
    );
  });
});

describe("closed mutation results and errors", () => {
  it("strictly parses Saved with one Audit reference", () => {
    expect(
      parseIdentityAccessMutationResult({
        ...mutationBase(),
        auditLogId: "51",
        changedAt: occurredAt,
        roleGrantId: grantId,
        status: "saved",
      }),
    ).toMatchObject({
      auditLogId: "51",
      roleGrantId: grantId,
      status: "saved",
    });
  });

  it("strictly parses Unchanged without Audit data", () => {
    expect(
      parseIdentityAccessMutationResult({
        ...mutationBase(),
        status: "unchanged",
      }),
    ).toMatchObject({ status: "unchanged" });
    expect(() =>
      parseIdentityAccessMutationResult({
        ...mutationBase(),
        auditLogId: "52",
        status: "unchanged",
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("strictly parses Conflict with current snapshot/token and no Audit", () => {
    const result = parseIdentityAccessMutationResult({
      ...mutationBase(),
      conflictReason: "expected_state_mismatch",
      status: "conflict",
    });
    expect(result).toMatchObject({
      conflictReason: "expected_state_mismatch",
      currentState: { targetUserId: { value: userId } },
      stateToken: { value: nextStateToken },
      status: "conflict",
    });
  });

  it("rejects unknown result, malformed current state and provider extras", () => {
    expect(() =>
      parseIdentityAccessMutationResult({
        ...mutationBase(),
        status: "pending",
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseIdentityAccessMutationResult({
        ...mutationBase({
          currentState: stateSnapshot({ targetUserId: actorUserId }),
        }),
        conflictReason: "expected_state_mismatch",
        status: "conflict",
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
    expect(() =>
      parseIdentityAccessMutationResult({
        ...mutationBase(),
        providerError: { code: "internal" },
        status: "unchanged",
      }),
    ).toThrow(IdentityAccessGovernanceDomainError);
  });

  it("supports exhaustive Saved, Unchanged and Conflict handling", () => {
    function describeResult(result: IdentityAccessMutationResult): string {
      switch (result.status) {
        case "saved":
          return `saved:${result.auditLogId}`;
        case "unchanged":
          return "unchanged";
        case "conflict":
          return `conflict:${result.conflictReason}`;
        default: {
          const unreachable: never = result;
          return unreachable;
        }
      }
    }

    expect(
      describeResult(
        parseIdentityAccessMutationResult({
          ...mutationBase(),
          status: "unchanged",
        }),
      ),
    ).toBe("unchanged");
  });

  it.each(errorCodes)("returns a fixed safe message for %s", (code) => {
    const error = new IdentityAccessGovernanceDomainError(code);
    expect(error.code).toBe(code);
    expect(error.message).not.toMatch(
      /sql|table|function|token|cookie|session|supabase|postgrest/iu,
    );
  });
});
