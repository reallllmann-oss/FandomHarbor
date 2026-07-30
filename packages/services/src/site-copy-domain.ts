import type { TrustedAccessContext } from "@fandom-harbor/auth";

export const SITE_COPY_FIELD_IDS = [
  "homepage_title",
  "homepage_introduction",
  "homepage_primary_cta_label",
  "homepage_secondary_cta_label",
  "navigation_archive_label",
  "navigation_search_label",
  "navigation_studio_label",
  "footer_brand_note",
] as const;

export type SiteCopyFieldId = (typeof SITE_COPY_FIELD_IDS)[number];

export interface SiteCopyContent {
  footer_brand_note: string;
  homepage_introduction: string;
  homepage_primary_cta_label: string;
  homepage_secondary_cta_label: string;
  homepage_title: string;
  navigation_archive_label: string;
  navigation_search_label: string;
  navigation_studio_label: string;
}

export interface PublicSiteCopyCandidateContent {
  footer_brand_note: unknown;
  homepage_introduction: unknown;
  homepage_primary_cta_label: unknown;
  homepage_secondary_cta_label: unknown;
  homepage_title: unknown;
  navigation_archive_label: unknown;
  navigation_search_label: unknown;
  navigation_studio_label: unknown;
}

export const SITE_COPY_BASELINE_V1 = Object.freeze({
  footer_brand_note: "Fandom Harbor · 私域作品归档",
  homepage_introduction:
    "一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。",
  homepage_primary_cta_label: "浏览公开作品",
  homepage_secondary_cta_label: "查找作品与作者",
  homepage_title: "Fandom Harbor",
  navigation_archive_label: "Archive",
  navigation_search_label: "Search",
  navigation_studio_label: "Studio",
}) satisfies Readonly<SiteCopyContent>;

export const SITE_COPY_SYSTEM_REQUEST_ID =
  "00000000-0000-0000-0000-000000000000";

export const SITE_COPY_FIELD_LIMITS = Object.freeze({
  footer_brand_note: { max: 80, min: 1 },
  homepage_introduction: { max: 180, min: 1 },
  homepage_primary_cta_label: { max: 18, min: 1 },
  homepage_secondary_cta_label: { max: 18, min: 1 },
  homepage_title: { max: 40, min: 1 },
  navigation_archive_label: { max: 12, min: 1 },
  navigation_search_label: { max: 12, min: 1 },
  navigation_studio_label: { max: 12, min: 1 },
}) satisfies Readonly<
  Record<SiteCopyFieldId, Readonly<{ max: number; min: number }>>
>;

export type SiteCopyErrorCode =
  | "DATA_CORRUPTION"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "REPOSITORY_UNAVAILABLE"
  | "UNAUTHENTICATED"
  | "UNKNOWN_REPOSITORY_ERROR";

export class SiteCopyDomainError extends Error {
  readonly code: SiteCopyErrorCode;

  constructor(code: SiteCopyErrorCode, message = "Site copy operation failed") {
    super(message);
    this.code = code;
    this.name = "SiteCopyDomainError";
  }
}

export interface PublicSiteCopyStoreRecord {
  content: PublicSiteCopyCandidateContent;
  version: bigint;
}

export interface PublicSiteCopyStore {
  getCurrent(): Promise<PublicSiteCopyStoreRecord | null>;
}

export interface PublicSiteCopySnapshot {
  content: SiteCopyContent;
  version: bigint | null;
}

export interface AdminSiteCopySnapshot {
  auditLogId: bigint;
  content: SiteCopyContent;
  lastActorUserId: string | null;
  lastChangeReason: string;
  revisionId: string;
  updatedAt: Date;
  version: bigint;
}

export interface AdminSiteCopySaveInput {
  baseRevisionId: string;
  baseVersion: bigint;
  content: SiteCopyContent;
  reason: string;
  requestId: string;
}

export interface SavedSiteCopyResult {
  auditLogId: bigint;
  changedFields: SiteCopyFieldId[];
  revisionId: string;
  status: "saved";
  updatedAt: Date;
  version: bigint;
}

export interface UnchangedSiteCopyResult {
  revisionId: string;
  status: "unchanged";
  version: bigint;
}

export interface ConflictSiteCopyResult {
  currentRevisionId: string;
  currentVersion: bigint;
  status: "conflict";
}

export type AdminSiteCopySaveResult =
  ConflictSiteCopyResult | SavedSiteCopyResult | UnchangedSiteCopyResult;

export interface AdminSiteCopyStore {
  getCurrent(): Promise<AdminSiteCopySnapshot | null>;
  save(input: AdminSiteCopySaveInput): Promise<AdminSiteCopySaveResult>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
const CONTROL_CHARACTER_PATTERN = /\p{Cc}/u;

function inputError(message: string): SiteCopyDomainError {
  return new SiteCopyDomainError("INVALID_INPUT", message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
  label: string,
) {
  const actual = Reflect.ownKeys(value);
  if (
    actual.length !== expected.length ||
    actual.some((key) => typeof key !== "string" || !expected.includes(key))
  ) {
    throw inputError(`${label} must contain only its declared fields`);
  }
}

function trimDatabaseSpaces(value: string): string {
  return value.replace(/^ +| +$/gu, "");
}

export function siteCopyCodePointLength(value: string): number {
  return [...value].length;
}

export function normalizeSiteCopyField(
  field: SiteCopyFieldId,
  value: unknown,
): string {
  if (typeof value !== "string") {
    throw inputError(`${field} must be a string`);
  }

  const normalized = trimDatabaseSpaces(value.normalize("NFC"));
  const limit = SITE_COPY_FIELD_LIMITS[field];
  const length = siteCopyCodePointLength(normalized);

  if (
    length < limit.min ||
    length > limit.max ||
    CONTROL_CHARACTER_PATTERN.test(normalized)
  ) {
    throw inputError(`${field} is invalid`);
  }

  return normalized;
}

export function normalizeSiteCopyReason(value: unknown): string {
  if (typeof value !== "string") {
    throw inputError("reason must be a string");
  }

  const normalized = trimDatabaseSpaces(value.normalize("NFC"));
  const length = siteCopyCodePointLength(normalized);
  if (
    length < 4 ||
    length > 200 ||
    CONTROL_CHARACTER_PATTERN.test(normalized)
  ) {
    throw inputError("reason is invalid");
  }

  return normalized;
}

export function parseSiteCopyContent(value: unknown): SiteCopyContent {
  if (!isRecord(value)) {
    throw inputError("content must be an object");
  }
  requireExactKeys(value, SITE_COPY_FIELD_IDS, "content");

  return {
    footer_brand_note: normalizeSiteCopyField(
      "footer_brand_note",
      value.footer_brand_note,
    ),
    homepage_introduction: normalizeSiteCopyField(
      "homepage_introduction",
      value.homepage_introduction,
    ),
    homepage_primary_cta_label: normalizeSiteCopyField(
      "homepage_primary_cta_label",
      value.homepage_primary_cta_label,
    ),
    homepage_secondary_cta_label: normalizeSiteCopyField(
      "homepage_secondary_cta_label",
      value.homepage_secondary_cta_label,
    ),
    homepage_title: normalizeSiteCopyField(
      "homepage_title",
      value.homepage_title,
    ),
    navigation_archive_label: normalizeSiteCopyField(
      "navigation_archive_label",
      value.navigation_archive_label,
    ),
    navigation_search_label: normalizeSiteCopyField(
      "navigation_search_label",
      value.navigation_search_label,
    ),
    navigation_studio_label: normalizeSiteCopyField(
      "navigation_studio_label",
      value.navigation_studio_label,
    ),
  };
}

export function parseSiteCopyUuid(value: unknown, label = "id"): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw inputError(`${label} must be a UUID`);
  }
  return value.toLowerCase();
}

export function parseSiteCopyRequestId(value: unknown): string {
  const requestId = parseSiteCopyUuid(value, "requestId");
  if (requestId === SITE_COPY_SYSTEM_REQUEST_ID) {
    throw inputError("requestId is reserved");
  }
  return requestId;
}

export function diffSiteCopy(
  before: unknown,
  after: unknown,
): SiteCopyFieldId[] {
  const normalizedBefore = parseSiteCopyContent(before);
  const normalizedAfter = parseSiteCopyContent(after);
  return SITE_COPY_FIELD_IDS.filter(
    (field) => normalizedBefore[field] !== normalizedAfter[field],
  );
}

export function parseAdminSiteCopySaveInput(
  value: unknown,
): AdminSiteCopySaveInput {
  if (!isRecord(value)) {
    throw inputError("save input must be an object");
  }
  requireExactKeys(
    value,
    ["baseVersion", "baseRevisionId", "requestId", "content", "reason"],
    "save input",
  );
  if (typeof value.baseVersion !== "bigint" || value.baseVersion < 1n) {
    throw inputError("baseVersion must be a positive bigint");
  }

  return {
    baseRevisionId: parseSiteCopyUuid(value.baseRevisionId, "baseRevisionId"),
    baseVersion: value.baseVersion,
    content: parseSiteCopyContent(value.content),
    reason: normalizeSiteCopyReason(value.reason),
    requestId: parseSiteCopyRequestId(value.requestId),
  };
}

export function requireSiteCopyAdmin(
  context: TrustedAccessContext | null,
): asserts context is TrustedAccessContext {
  if (context === null) {
    throw new SiteCopyDomainError(
      "UNAUTHENTICATED",
      "Authentication is required",
    );
  }
  if (!context.capabilities.has("admin:operate")) {
    throw new SiteCopyDomainError(
      "FORBIDDEN",
      "Site copy operation is not authorized",
    );
  }
}

function baselineSnapshot(): PublicSiteCopySnapshot {
  return {
    content: { ...SITE_COPY_BASELINE_V1 },
    version: null,
  };
}

function fallbackPublicContent(
  content: PublicSiteCopyCandidateContent,
): SiteCopyContent {
  const result = { ...SITE_COPY_BASELINE_V1 } as SiteCopyContent;

  for (const field of SITE_COPY_FIELD_IDS) {
    try {
      result[field] = normalizeSiteCopyField(field, content[field]);
    } catch {
      result[field] = SITE_COPY_BASELINE_V1[field];
    }
  }

  return result;
}

async function strictAdminOperation<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof SiteCopyDomainError) throw error;
    throw new SiteCopyDomainError(
      "REPOSITORY_UNAVAILABLE",
      "Site copy repository is unavailable",
    );
  }
}

export function createPublicSiteCopyService(store: PublicSiteCopyStore) {
  return {
    async read(): Promise<PublicSiteCopySnapshot> {
      try {
        const record = await store.getCurrent();
        if (record === null) return baselineSnapshot();
        return {
          content: fallbackPublicContent(record.content),
          version: record.version,
        };
      } catch {
        return baselineSnapshot();
      }
    },
  };
}

export function createAdminSiteCopyService(store: AdminSiteCopyStore) {
  return {
    async read(
      context: TrustedAccessContext | null,
    ): Promise<AdminSiteCopySnapshot> {
      requireSiteCopyAdmin(context);
      const snapshot = await strictAdminOperation(() => store.getCurrent());
      if (snapshot === null) {
        throw new SiteCopyDomainError(
          "DATA_CORRUPTION",
          "Admin site copy is unavailable",
        );
      }
      return snapshot;
    },

    async save(
      context: TrustedAccessContext | null,
      input: AdminSiteCopySaveInput,
    ): Promise<AdminSiteCopySaveResult> {
      requireSiteCopyAdmin(context);
      const normalized = parseAdminSiteCopySaveInput(input);
      const current = await strictAdminOperation(() => store.getCurrent());
      if (current === null) {
        throw new SiteCopyDomainError(
          "DATA_CORRUPTION",
          "Admin site copy is unavailable",
        );
      }

      diffSiteCopy(current.content, normalized.content);
      return strictAdminOperation(() => store.save(normalized));
    },
  };
}
