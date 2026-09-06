import {
  IdentityAccessGovernanceDomainError,
  type IdentityAccessAuditCursor,
  type IdentityAccessGovernanceAuditPage,
  type IdentityAccessSubjectCursor,
  type IdentityAccessSubjectDetail,
  type IdentityAccessSubjectPage,
} from "@fandom-harbor/services";

import {
  createAdminIdentityAccessGovernanceReads,
  type AdminIdentityAccessGovernanceReads,
} from "./identity-access-governance";

const SEARCH_PAGE_LIMIT = 20;
const AUDIT_PAGE_LIMIT = 20;
const MAX_CURSOR_LENGTH = 2048;
const INVALID_CURSOR = Object.freeze({ invalidCursor: true });

export type AccessGovernanceSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type AccessGovernanceReadError =
  "invalid-request" | "subject-unavailable" | "temporarily-unavailable";

export type AccessGovernancePageData =
  | { status: "forbidden" }
  | { status: "unauthenticated" }
  | { error: AccessGovernanceReadError; status: "read-error" }
  | {
      auditPage: IdentityAccessGovernanceAuditPage | null;
      query: string;
      searchCursor: string | null;
      selectedSubject: IdentityAccessSubjectDetail | null;
      status: "ready";
      subjectPage: IdentityAccessSubjectPage;
    };

interface AccessGovernanceDataDependencies {
  createReads(): Promise<AdminIdentityAccessGovernanceReads>;
}

const defaultDependencies: AccessGovernanceDataDependencies = {
  createReads: createAdminIdentityAccessGovernanceReads,
};

function singleString(value: string | string[] | undefined): string | null {
  return typeof value === "string" ? value : null;
}

function decodeCursor(value: string | string[] | undefined): unknown {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.length > MAX_CURSOR_LENGTH) {
    return INVALID_CURSOR;
  }
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return INVALID_CURSOR;
  }
}

function errorData(error: unknown): AccessGovernancePageData {
  if (error instanceof IdentityAccessGovernanceDomainError) {
    if (error.code === "UNAUTHENTICATED") {
      return { status: "unauthenticated" };
    }
    if (error.code === "FORBIDDEN") {
      return { status: "forbidden" };
    }
    if (error.code === "INVALID_INPUT") {
      return { error: "invalid-request", status: "read-error" };
    }
    if (error.code === "TARGET_NOT_FOUND") {
      return { error: "subject-unavailable", status: "read-error" };
    }
  }
  return { error: "temporarily-unavailable", status: "read-error" };
}

export function encodeSubjectCursor(
  cursor: IdentityAccessSubjectCursor,
): string {
  return Buffer.from(
    JSON.stringify({
      missingRegistrationName: cursor.missingRegistrationName,
      normalizedRegistrationName:
        cursor.normalizedRegistrationName?.value ?? null,
      userId: cursor.userId.value,
    }),
  ).toString("base64url");
}

export function encodeAuditCursor(cursor: IdentityAccessAuditCursor): string {
  return Buffer.from(
    JSON.stringify({
      auditId: cursor.auditId,
      createdAt: cursor.createdAt.toISOString(),
    }),
  ).toString("base64url");
}

export async function loadAccessGovernancePageData(
  searchParams: AccessGovernanceSearchParams,
  dependencies: AccessGovernanceDataDependencies = defaultDependencies,
): Promise<AccessGovernancePageData> {
  const rawQuery = searchParams.q ?? null;
  const query = singleString(searchParams.q) ?? "";

  try {
    const reads = await dependencies.createReads();
    const subjectPage = await reads.searchSubjects({
      cursor: decodeCursor(searchParams.cursor),
      limit: SEARCH_PAGE_LIMIT,
      query: rawQuery,
    });
    const selectedUserId = searchParams.subject;
    if (selectedUserId === undefined) {
      return {
        auditPage: null,
        query,
        searchCursor: singleString(searchParams.cursor),
        selectedSubject: null,
        status: "ready",
        subjectPage,
      };
    }

    const selectedSubject = await reads.getSubjectDetail(selectedUserId);
    const auditPage = await reads.listSubjectAudit({
      before: decodeCursor(searchParams.auditCursor),
      limit: AUDIT_PAGE_LIMIT,
      targetUserId: selectedUserId,
    });

    return {
      auditPage,
      query,
      searchCursor: singleString(searchParams.cursor),
      selectedSubject,
      status: "ready",
      subjectPage,
    };
  } catch (error) {
    return errorData(error);
  }
}
