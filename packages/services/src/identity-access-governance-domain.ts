const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";
const EXPECTED_STATE_TOKEN_PATTERN = /^[0-9a-f]{64}$/u;
const POSITIVE_DECIMAL_PATTERN = /^[1-9][0-9]*$/u;
const CONTROL_CHARACTER_PATTERN = /\p{Cc}/u;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/u;

export const IDENTITY_ACCESS_DEFAULT_PAGE_LIMIT = 25;
export const IDENTITY_ACCESS_MAX_PAGE_LIMIT = 50;
export const IDENTITY_ACCESS_REASON_MIN_CODE_POINTS = 4;
export const IDENTITY_ACCESS_REASON_MAX_CODE_POINTS = 200;
export const IDENTITY_ACCESS_SEARCH_MAX_CODE_POINTS = 64;

export type IdentityAccessGovernanceErrorCode =
  | "CONFLICT"
  | "DATA_CORRUPTION"
  | "ELEVATED_MUTATION_DEFERRED"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "REPOSITORY_UNAVAILABLE"
  | "REQUEST_ID_MISMATCH"
  | "TARGET_NOT_FOUND"
  | "UNAUTHENTICATED"
  | "UNKNOWN_REPOSITORY_ERROR";

function errorMessage(code: IdentityAccessGovernanceErrorCode): string {
  switch (code) {
    case "UNAUTHENTICATED":
      return "Authentication is required";
    case "FORBIDDEN":
      return "Identity access governance is not authorized";
    case "INVALID_INPUT":
      return "Identity access governance input is invalid";
    case "TARGET_NOT_FOUND":
      return "Identity access subject was not found";
    case "CONFLICT":
      return "Identity access governance state has changed";
    case "REQUEST_ID_MISMATCH":
      return "Identity access request does not match its original payload";
    case "ELEVATED_MUTATION_DEFERRED":
      return "Elevated identity access changes are deferred";
    case "DATA_CORRUPTION":
      return "Identity access governance data is unavailable";
    case "REPOSITORY_UNAVAILABLE":
      return "Identity access governance provider is unavailable";
    case "UNKNOWN_REPOSITORY_ERROR":
      return "Identity access governance provider failed";
  }
}

export class IdentityAccessGovernanceDomainError extends Error {
  readonly code: IdentityAccessGovernanceErrorCode;

  constructor(code: IdentityAccessGovernanceErrorCode) {
    super(errorMessage(code));
    this.code = code;
    this.name = "IdentityAccessGovernanceDomainError";
  }
}

function invalidInput(): IdentityAccessGovernanceDomainError {
  return new IdentityAccessGovernanceDomainError("INVALID_INPUT");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw invalidInput();
  return value;
}

function requireDeclaredKeys(
  value: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): void {
  const keys = Reflect.ownKeys(value);
  const declared = new Set([...required, ...optional]);
  if (
    keys.some((key) => typeof key !== "string" || !declared.has(key)) ||
    required.some((key) => !Object.hasOwn(value, key))
  ) {
    throw invalidInput();
  }
}

function codePointLength(value: string): number {
  return [...value].length;
}

function parseUuid(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw invalidInput();
  }
  const normalized = value.toLowerCase();
  if (normalized === NIL_UUID) throw invalidInput();
  return normalized;
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) throw invalidInput();
    return new Date(value.getTime());
  }
  if (typeof value !== "string" || !ISO_TIMESTAMP_PATTERN.test(value)) {
    throw invalidInput();
  }
  const result = new Date(value);
  if (!Number.isFinite(result.getTime())) throw invalidInput();
  return result;
}

function parseNullableDate(value: unknown): Date | null {
  return value === null ? null : parseDate(value);
}

function parseNullableRegistrationName(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") throw invalidInput();
  const length = codePointLength(value);
  if (
    length < 1 ||
    length > IDENTITY_ACCESS_SEARCH_MAX_CODE_POINTS ||
    CONTROL_CHARACTER_PATTERN.test(value)
  ) {
    throw invalidInput();
  }
  return value;
}

function parseAuditId(value: unknown): string {
  if (typeof value !== "string" || !POSITIVE_DECIMAL_PATTERN.test(value)) {
    throw invalidInput();
  }
  return value;
}

export class IdentityAccessUserId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static parse(value: unknown): IdentityAccessUserId {
    return new IdentityAccessUserId(parseUuid(value));
  }
}

export class IdentityAccessRequestId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static parse(value: unknown): IdentityAccessRequestId {
    return new IdentityAccessRequestId(parseUuid(value));
  }
}

export class IdentityAccessExpectedStateToken {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static parse(value: unknown): IdentityAccessExpectedStateToken {
    if (
      typeof value !== "string" ||
      !EXPECTED_STATE_TOKEN_PATTERN.test(value)
    ) {
      throw invalidInput();
    }
    return new IdentityAccessExpectedStateToken(value);
  }
}

export class IdentityAccessNormalizedReason {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static parse(value: unknown): IdentityAccessNormalizedReason {
    if (typeof value !== "string") throw invalidInput();
    const normalized = value.normalize("NFC").trim();
    const length = codePointLength(normalized);
    if (
      length < IDENTITY_ACCESS_REASON_MIN_CODE_POINTS ||
      length > IDENTITY_ACCESS_REASON_MAX_CODE_POINTS ||
      CONTROL_CHARACTER_PATTERN.test(normalized)
    ) {
      throw invalidInput();
    }
    return new IdentityAccessNormalizedReason(normalized);
  }
}

export class IdentityAccessRegistrationNameQuery {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static parse(value: unknown): IdentityAccessRegistrationNameQuery {
    if (typeof value !== "string") throw invalidInput();
    const normalized = value.normalize("NFKC").trim().toLowerCase();
    const length = codePointLength(normalized);
    if (
      length < 1 ||
      length > IDENTITY_ACCESS_SEARCH_MAX_CODE_POINTS ||
      CONTROL_CHARACTER_PATTERN.test(normalized)
    ) {
      throw invalidInput();
    }
    return new IdentityAccessRegistrationNameQuery(normalized);
  }
}

export class IdentityAccessPageLimit {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static parse(value: unknown): IdentityAccessPageLimit {
    const candidate = value ?? IDENTITY_ACCESS_DEFAULT_PAGE_LIMIT;
    if (
      typeof candidate !== "number" ||
      !Number.isSafeInteger(candidate) ||
      candidate < 1 ||
      candidate > IDENTITY_ACCESS_MAX_PAGE_LIMIT
    ) {
      throw invalidInput();
    }
    return new IdentityAccessPageLimit(candidate);
  }
}

export type IdentityAccessMembershipState =
  "active" | "pending" | "revoked" | "suspended";
export type IdentityAccessOrdinaryMembershipState =
  "active" | "revoked" | "suspended";
export type IdentityAccessActiveRole = "admin" | "author" | "super_admin";
export type IdentityAccessEffectiveRole = IdentityAccessActiveRole | "reader";

function parseMembershipState(value: unknown): IdentityAccessMembershipState {
  switch (value) {
    case "active":
    case "pending":
    case "revoked":
    case "suspended":
      return value;
    default:
      throw invalidInput();
  }
}

function parseOrdinaryMembershipState(
  value: unknown,
): IdentityAccessOrdinaryMembershipState {
  switch (value) {
    case "active":
    case "revoked":
    case "suspended":
      return value;
    default:
      throw invalidInput();
  }
}

function parseActiveRole(value: unknown): IdentityAccessActiveRole {
  switch (value) {
    case "admin":
    case "author":
    case "super_admin":
      return value;
    default:
      throw invalidInput();
  }
}

function parseEffectiveRole(value: unknown): IdentityAccessEffectiveRole {
  if (value === "reader") return value;
  return parseActiveRole(value);
}

function parseRoleList(value: unknown): IdentityAccessEffectiveRole[] {
  if (!Array.isArray(value)) throw invalidInput();
  const result = value.map(parseEffectiveRole);
  if (new Set(result).size !== result.length) throw invalidInput();
  return result;
}

export type IdentityAccessSearchQuery =
  | {
      kind: "registrationName";
      registrationName: IdentityAccessRegistrationNameQuery;
    }
  | { kind: "userId"; userId: IdentityAccessUserId };

export function parseIdentityAccessSearchQuery(
  value: unknown,
): IdentityAccessSearchQuery | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw invalidInput();
  const normalized = value.normalize("NFKC").trim();
  if (normalized.length === 0) return null;
  if (UUID_PATTERN.test(normalized)) {
    return { kind: "userId", userId: IdentityAccessUserId.parse(normalized) };
  }
  return {
    kind: "registrationName",
    registrationName: IdentityAccessRegistrationNameQuery.parse(normalized),
  };
}

export interface IdentityAccessSubjectCursor {
  missingRegistrationName: boolean;
  normalizedRegistrationName: IdentityAccessRegistrationNameQuery | null;
  userId: IdentityAccessUserId;
}

export interface IdentityAccessAuditCursor {
  auditId: string;
  createdAt: Date;
}

export function parseIdentityAccessSubjectCursor(
  value: unknown,
): IdentityAccessSubjectCursor | null {
  if (value === null || value === undefined) return null;
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "missingRegistrationName",
    "normalizedRegistrationName",
    "userId",
  ]);
  if (typeof record.missingRegistrationName !== "boolean") {
    throw invalidInput();
  }
  const userId = IdentityAccessUserId.parse(record.userId);
  if (record.missingRegistrationName) {
    if (record.normalizedRegistrationName !== null) throw invalidInput();
    return {
      missingRegistrationName: true,
      normalizedRegistrationName: null,
      userId,
    };
  }
  const registrationName = IdentityAccessRegistrationNameQuery.parse(
    record.normalizedRegistrationName,
  );
  if (record.normalizedRegistrationName !== registrationName.value) {
    throw invalidInput();
  }
  return {
    missingRegistrationName: false,
    normalizedRegistrationName: registrationName,
    userId,
  };
}

export function parseIdentityAccessAuditCursor(
  value: unknown,
): IdentityAccessAuditCursor | null {
  if (value === null || value === undefined) return null;
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["auditId", "createdAt"]);
  return {
    auditId: parseAuditId(record.auditId),
    createdAt: parseDate(record.createdAt),
  };
}

export interface IdentityAccessSubjectSearchInput {
  cursor: IdentityAccessSubjectCursor | null;
  limit: IdentityAccessPageLimit;
  query: IdentityAccessSearchQuery | null;
}

export interface IdentityAccessAuditListInput {
  before: IdentityAccessAuditCursor | null;
  limit: IdentityAccessPageLimit;
  targetUserId: IdentityAccessUserId;
}

export function parseIdentityAccessSubjectSearchInput(
  value: unknown,
): IdentityAccessSubjectSearchInput {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [], ["cursor", "limit", "query"]);
  return {
    cursor: parseIdentityAccessSubjectCursor(record.cursor),
    limit: IdentityAccessPageLimit.parse(record.limit),
    query: parseIdentityAccessSearchQuery(record.query),
  };
}

export function parseIdentityAccessAuditListInput(
  value: unknown,
): IdentityAccessAuditListInput {
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["targetUserId"], ["before", "limit"]);
  return {
    before: parseIdentityAccessAuditCursor(record.before),
    limit: IdentityAccessPageLimit.parse(record.limit),
    targetUserId: IdentityAccessUserId.parse(record.targetUserId),
  };
}

export interface IdentityAccessSubjectSummary {
  effectiveRoles: IdentityAccessEffectiveRole[];
  membershipState: IdentityAccessMembershipState;
  membershipUpdatedAt: Date;
  profileUpdatedAt: Date;
  registrationName: string | null;
  userId: IdentityAccessUserId;
}

export interface IdentityAccessDesensitizedProfile {
  createdAt: Date;
  registrationName: string | null;
  updatedAt: Date;
  userId: IdentityAccessUserId;
}

export interface IdentityAccessMembershipSummary {
  admittedAt: Date | null;
  revokedAt: Date | null;
  state: IdentityAccessMembershipState;
  suspendedAt: Date | null;
  updatedAt: Date;
}

export interface IdentityAccessActiveRoleGrantSummary {
  grantId: string;
  grantedAt: Date;
  grantedBy: IdentityAccessUserId | null;
  role: IdentityAccessActiveRole;
}

export interface IdentityAccessExpectedRoleGrantSummary {
  grantId: string;
  grantedAt: Date;
  role: IdentityAccessActiveRole;
}

export interface IdentityAccessStateSnapshot {
  activeRoleGrants: IdentityAccessExpectedRoleGrantSummary[];
  membership: {
    state: IdentityAccessMembershipState;
    updatedAt: Date;
  };
  targetUserId: IdentityAccessUserId;
}

export interface IdentityAccessExpectedState {
  snapshot: IdentityAccessStateSnapshot;
  token: IdentityAccessExpectedStateToken;
}

export interface IdentityAccessSubjectDetail {
  activeRoleGrants: IdentityAccessActiveRoleGrantSummary[];
  effectiveRoles: IdentityAccessEffectiveRole[];
  expectedState: IdentityAccessExpectedState;
  isElevatedAccount: boolean;
  isOnlyActiveSuperAdmin: boolean;
  membership: IdentityAccessMembershipSummary;
  profile: IdentityAccessDesensitizedProfile;
}

function parseActiveRoleGrant(
  value: unknown,
): IdentityAccessActiveRoleGrantSummary {
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["grantId", "grantedAt", "grantedBy", "role"]);
  return {
    grantId: parseUuid(record.grantId),
    grantedAt: parseDate(record.grantedAt),
    grantedBy:
      record.grantedBy === null
        ? null
        : IdentityAccessUserId.parse(record.grantedBy),
    role: parseActiveRole(record.role),
  };
}

function parseExpectedRoleGrant(
  value: unknown,
): IdentityAccessExpectedRoleGrantSummary {
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["grantId", "grantedAt", "role"]);
  return {
    grantId: parseUuid(record.grantId),
    grantedAt: parseDate(record.grantedAt),
    role: parseActiveRole(record.role),
  };
}

export function parseIdentityAccessStateSnapshot(
  value: unknown,
): IdentityAccessStateSnapshot {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "activeRoleGrants",
    "membership",
    "targetUserId",
  ]);
  if (!Array.isArray(record.activeRoleGrants)) throw invalidInput();
  const membership = requireRecord(record.membership);
  requireDeclaredKeys(membership, ["state", "updatedAt"]);
  return {
    activeRoleGrants: record.activeRoleGrants.map(parseExpectedRoleGrant),
    membership: {
      state: parseMembershipState(membership.state),
      updatedAt: parseDate(membership.updatedAt),
    },
    targetUserId: IdentityAccessUserId.parse(record.targetUserId),
  };
}

function parseExpectedState(value: unknown): IdentityAccessExpectedState {
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["snapshot", "token"]);
  return {
    snapshot: parseIdentityAccessStateSnapshot(record.snapshot),
    token: IdentityAccessExpectedStateToken.parse(record.token),
  };
}

export function parseIdentityAccessSubjectSummary(
  value: unknown,
): IdentityAccessSubjectSummary {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "effectiveRoles",
    "membershipState",
    "membershipUpdatedAt",
    "profileUpdatedAt",
    "registrationName",
    "userId",
  ]);
  return {
    effectiveRoles: parseRoleList(record.effectiveRoles),
    membershipState: parseMembershipState(record.membershipState),
    membershipUpdatedAt: parseDate(record.membershipUpdatedAt),
    profileUpdatedAt: parseDate(record.profileUpdatedAt),
    registrationName: parseNullableRegistrationName(record.registrationName),
    userId: IdentityAccessUserId.parse(record.userId),
  };
}

export interface IdentityAccessSubjectPage {
  hasMore: boolean;
  items: IdentityAccessSubjectSummary[];
  nextCursor: IdentityAccessSubjectCursor | null;
}

export function parseIdentityAccessSubjectPage(
  value: unknown,
): IdentityAccessSubjectPage {
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["hasMore", "items", "nextCursor"]);
  if (!Array.isArray(record.items) || typeof record.hasMore !== "boolean") {
    throw invalidInput();
  }
  const nextCursor = parseIdentityAccessSubjectCursor(record.nextCursor);
  if (record.hasMore !== (nextCursor !== null)) throw invalidInput();
  return {
    hasMore: record.hasMore,
    items: record.items.map(parseIdentityAccessSubjectSummary),
    nextCursor,
  };
}

export function parseIdentityAccessSubjectDetail(
  value: unknown,
): IdentityAccessSubjectDetail {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "activeRoleGrants",
    "effectiveRoles",
    "expectedState",
    "isElevatedAccount",
    "isOnlyActiveSuperAdmin",
    "membership",
    "profileCreatedAt",
    "profileUpdatedAt",
    "registrationName",
    "userId",
  ]);
  if (
    !Array.isArray(record.activeRoleGrants) ||
    typeof record.isElevatedAccount !== "boolean" ||
    typeof record.isOnlyActiveSuperAdmin !== "boolean"
  ) {
    throw invalidInput();
  }
  const userId = IdentityAccessUserId.parse(record.userId);
  const membership = requireRecord(record.membership);
  requireDeclaredKeys(membership, [
    "admittedAt",
    "revokedAt",
    "state",
    "suspendedAt",
    "updatedAt",
  ]);
  const expectedState = parseExpectedState(record.expectedState);
  if (expectedState.snapshot.targetUserId.value !== userId.value) {
    throw invalidInput();
  }
  return {
    activeRoleGrants: record.activeRoleGrants.map(parseActiveRoleGrant),
    effectiveRoles: parseRoleList(record.effectiveRoles),
    expectedState,
    isElevatedAccount: record.isElevatedAccount,
    isOnlyActiveSuperAdmin: record.isOnlyActiveSuperAdmin,
    membership: {
      admittedAt: parseNullableDate(membership.admittedAt),
      revokedAt: parseNullableDate(membership.revokedAt),
      state: parseMembershipState(membership.state),
      suspendedAt: parseNullableDate(membership.suspendedAt),
      updatedAt: parseDate(membership.updatedAt),
    },
    profile: {
      createdAt: parseDate(record.profileCreatedAt),
      registrationName: parseNullableRegistrationName(record.registrationName),
      updatedAt: parseDate(record.profileUpdatedAt),
      userId,
    },
  };
}

export type IdentityAccessGovernanceAuditAction =
  | "membership.state_changed"
  | "role.bootstrap_super_admin"
  | "role.granted"
  | "role.revoked";

export type IdentityAccessGovernanceAuditChange =
  | { membershipState: IdentityAccessMembershipState }
  | { role: IdentityAccessActiveRole };

export interface IdentityAccessGovernanceAuditActor {
  registrationName: string | null;
  userId: IdentityAccessUserId;
}

export interface IdentityAccessGovernanceAuditSummary {
  action: IdentityAccessGovernanceAuditAction;
  actor: IdentityAccessGovernanceAuditActor | null;
  after: IdentityAccessGovernanceAuditChange | null;
  auditId: string;
  before: IdentityAccessGovernanceAuditChange | null;
  createdAt: Date;
  reason: string;
  result: "saved";
  targetRole: IdentityAccessActiveRole | null;
  targetState: IdentityAccessMembershipState | null;
}

function parseAuditAction(value: unknown): IdentityAccessGovernanceAuditAction {
  switch (value) {
    case "membership.state_changed":
    case "role.bootstrap_super_admin":
    case "role.granted":
    case "role.revoked":
      return value;
    default:
      throw invalidInput();
  }
}

function parseAuditChange(
  value: unknown,
): IdentityAccessGovernanceAuditChange | null {
  if (value === null) return null;
  const record = requireRecord(value);
  if (Object.hasOwn(record, "membershipState")) {
    requireDeclaredKeys(record, ["membershipState"]);
    return { membershipState: parseMembershipState(record.membershipState) };
  }
  requireDeclaredKeys(record, ["role"]);
  return { role: parseActiveRole(record.role) };
}

function parseAuditActor(
  value: unknown,
): IdentityAccessGovernanceAuditActor | null {
  if (value === null) return null;
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["registrationName", "userId"]);
  return {
    registrationName: parseNullableRegistrationName(record.registrationName),
    userId: IdentityAccessUserId.parse(record.userId),
  };
}

function parseAuditReason(value: unknown): string {
  if (typeof value !== "string") throw invalidInput();
  const length = codePointLength(value);
  if (length < 1 || length > 1000 || CONTROL_CHARACTER_PATTERN.test(value)) {
    throw invalidInput();
  }
  return value;
}

export function parseIdentityAccessGovernanceAuditSummary(
  value: unknown,
): IdentityAccessGovernanceAuditSummary {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "action",
    "actor",
    "after",
    "auditId",
    "before",
    "createdAt",
    "reason",
    "result",
    "targetRole",
    "targetState",
  ]);
  if (record.result !== "saved") throw invalidInput();
  return {
    action: parseAuditAction(record.action),
    actor: parseAuditActor(record.actor),
    after: parseAuditChange(record.after),
    auditId: parseAuditId(record.auditId),
    before: parseAuditChange(record.before),
    createdAt: parseDate(record.createdAt),
    reason: parseAuditReason(record.reason),
    result: "saved",
    targetRole:
      record.targetRole === null ? null : parseActiveRole(record.targetRole),
    targetState:
      record.targetState === null
        ? null
        : parseMembershipState(record.targetState),
  };
}

export interface IdentityAccessGovernanceAuditPage {
  hasMore: boolean;
  items: IdentityAccessGovernanceAuditSummary[];
  nextCursor: IdentityAccessAuditCursor | null;
}

export function parseIdentityAccessGovernanceAuditPage(
  value: unknown,
): IdentityAccessGovernanceAuditPage {
  const record = requireRecord(value);
  requireDeclaredKeys(record, ["hasMore", "items", "nextCursor"]);
  if (!Array.isArray(record.items) || typeof record.hasMore !== "boolean") {
    throw invalidInput();
  }
  const nextCursor = parseIdentityAccessAuditCursor(record.nextCursor);
  if (record.hasMore !== (nextCursor !== null)) throw invalidInput();
  return {
    hasMore: record.hasMore,
    items: record.items.map(parseIdentityAccessGovernanceAuditSummary),
    nextCursor,
  };
}

interface IdentityAccessOrdinaryCommandBase {
  expectedStateToken: IdentityAccessExpectedStateToken;
  reason: IdentityAccessNormalizedReason;
  requestId: IdentityAccessRequestId;
  targetUserId: IdentityAccessUserId;
}

export interface GrantAuthorRoleCommand extends IdentityAccessOrdinaryCommandBase {
  operation: "grantAuthorRole";
}

export interface RevokeAuthorRoleCommand extends IdentityAccessOrdinaryCommandBase {
  operation: "revokeAuthorRole";
}

export interface SetOrdinaryMembershipStateCommand extends IdentityAccessOrdinaryCommandBase {
  operation: "setOrdinaryMembershipState";
  state: IdentityAccessOrdinaryMembershipState;
}

function parseOrdinaryCommandBase(
  record: Record<string, unknown>,
): IdentityAccessOrdinaryCommandBase {
  return {
    expectedStateToken: IdentityAccessExpectedStateToken.parse(
      record.expectedStateToken,
    ),
    reason: IdentityAccessNormalizedReason.parse(record.reason),
    requestId: IdentityAccessRequestId.parse(record.requestId),
    targetUserId: IdentityAccessUserId.parse(record.targetUserId),
  };
}

export function parseGrantAuthorRoleCommand(
  value: unknown,
): GrantAuthorRoleCommand {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "expectedStateToken",
    "reason",
    "requestId",
    "targetUserId",
  ]);
  return { ...parseOrdinaryCommandBase(record), operation: "grantAuthorRole" };
}

export function parseRevokeAuthorRoleCommand(
  value: unknown,
): RevokeAuthorRoleCommand {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "expectedStateToken",
    "reason",
    "requestId",
    "targetUserId",
  ]);
  return { ...parseOrdinaryCommandBase(record), operation: "revokeAuthorRole" };
}

export function parseSetOrdinaryMembershipStateCommand(
  value: unknown,
): SetOrdinaryMembershipStateCommand {
  const record = requireRecord(value);
  requireDeclaredKeys(record, [
    "expectedStateToken",
    "reason",
    "requestId",
    "state",
    "targetUserId",
  ]);
  return {
    ...parseOrdinaryCommandBase(record),
    operation: "setOrdinaryMembershipState",
    state: parseOrdinaryMembershipState(record.state),
  };
}

export type IdentityAccessConflictReason =
  "expected_state_mismatch" | "target_membership_not_active";

interface IdentityAccessMutationResultBase {
  currentState: IdentityAccessStateSnapshot;
  requestId: IdentityAccessRequestId;
  stateToken: IdentityAccessExpectedStateToken;
  targetUserId: IdentityAccessUserId;
}

export interface SavedIdentityAccessMutationResult extends IdentityAccessMutationResultBase {
  auditLogId: string;
  changedAt: Date;
  roleGrantId?: string;
  status: "saved";
}

export interface UnchangedIdentityAccessMutationResult extends IdentityAccessMutationResultBase {
  status: "unchanged";
}

export interface ConflictIdentityAccessMutationResult extends IdentityAccessMutationResultBase {
  conflictReason: IdentityAccessConflictReason;
  status: "conflict";
}

export type IdentityAccessMutationResult =
  | ConflictIdentityAccessMutationResult
  | SavedIdentityAccessMutationResult
  | UnchangedIdentityAccessMutationResult;

function parseConflictReason(value: unknown): IdentityAccessConflictReason {
  switch (value) {
    case "expected_state_mismatch":
    case "target_membership_not_active":
      return value;
    default:
      throw invalidInput();
  }
}

function parseMutationResultBase(
  record: Record<string, unknown>,
): IdentityAccessMutationResultBase {
  const requestId = IdentityAccessRequestId.parse(record.requestId);
  const targetUserId = IdentityAccessUserId.parse(record.targetUserId);
  const currentState = parseIdentityAccessStateSnapshot(record.currentState);
  if (currentState.targetUserId.value !== targetUserId.value) {
    throw invalidInput();
  }
  return {
    currentState,
    requestId,
    stateToken: IdentityAccessExpectedStateToken.parse(record.stateToken),
    targetUserId,
  };
}

export function parseIdentityAccessMutationResult(
  value: unknown,
): IdentityAccessMutationResult {
  const record = requireRecord(value);
  switch (record.status) {
    case "saved": {
      requireDeclaredKeys(
        record,
        [
          "auditLogId",
          "changedAt",
          "currentState",
          "requestId",
          "stateToken",
          "status",
          "targetUserId",
        ],
        ["roleGrantId"],
      );
      const result: SavedIdentityAccessMutationResult = {
        ...parseMutationResultBase(record),
        auditLogId: parseAuditId(record.auditLogId),
        changedAt: parseDate(record.changedAt),
        status: "saved",
      };
      if (Object.hasOwn(record, "roleGrantId")) {
        result.roleGrantId = parseUuid(record.roleGrantId);
      }
      return result;
    }
    case "unchanged":
      requireDeclaredKeys(record, [
        "currentState",
        "requestId",
        "stateToken",
        "status",
        "targetUserId",
      ]);
      return { ...parseMutationResultBase(record), status: "unchanged" };
    case "conflict":
      requireDeclaredKeys(record, [
        "conflictReason",
        "currentState",
        "requestId",
        "stateToken",
        "status",
        "targetUserId",
      ]);
      return {
        ...parseMutationResultBase(record),
        conflictReason: parseConflictReason(record.conflictReason),
        status: "conflict",
      };
    default:
      throw invalidInput();
  }
}

export interface IdentityAccessGovernanceReadPort {
  getSubjectDetail(
    userId: IdentityAccessUserId,
  ): Promise<IdentityAccessSubjectDetail>;
  listSubjectAudit(
    input: IdentityAccessAuditListInput,
  ): Promise<IdentityAccessGovernanceAuditPage>;
  searchSubjects(
    input: IdentityAccessSubjectSearchInput,
  ): Promise<IdentityAccessSubjectPage>;
}

export interface IdentityAccessGovernanceWritePort {
  grantAuthorRole(
    command: GrantAuthorRoleCommand,
  ): Promise<IdentityAccessMutationResult>;
  revokeAuthorRole(
    command: RevokeAuthorRoleCommand,
  ): Promise<IdentityAccessMutationResult>;
  setOrdinaryMembershipState(
    command: SetOrdinaryMembershipStateCommand,
  ): Promise<IdentityAccessMutationResult>;
}
