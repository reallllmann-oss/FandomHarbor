import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import {
  normalizeSiteCopyReason,
  parseAdminSiteCopySaveInput,
  parseSiteCopyContent,
  SITE_COPY_FIELD_IDS,
  SiteCopyDomainError,
  type AdminSiteCopySaveResult,
  type AdminSiteCopySnapshot,
  type AdminSiteCopyStore,
  type PublicSiteCopyCandidateContent,
  type PublicSiteCopyStore,
  type SiteCopyContent,
  type SiteCopyFieldId,
} from "@fandom-harbor/services";
import { z } from "zod";

import { createPublicSupabaseClient } from "./public-client";
import { createServerSupabaseClient } from "./server-client";

const canonicalUnsignedInteger = /^(0|[1-9][0-9]*)$/u;
const uuid = z.string().uuid();
const timestamp = z.string().datetime({ offset: true });
const requiredUnknown = z
  .unknown()
  .refine((value) => value !== undefined, "field is required");
const siteCopyFieldId = z.enum(SITE_COPY_FIELD_IDS);

const publicSiteCopyRow = z
  .object({
    footer_brand_note: requiredUnknown,
    homepage_introduction: requiredUnknown,
    homepage_primary_cta_label: requiredUnknown,
    homepage_secondary_cta_label: requiredUnknown,
    homepage_title: requiredUnknown,
    navigation_archive_label: requiredUnknown,
    navigation_search_label: requiredUnknown,
    navigation_studio_label: requiredUnknown,
    version: z.unknown(),
  })
  .strict();

const adminSiteCopyRow = z
  .object({
    audit_log_id: z.unknown(),
    footer_brand_note: z.string(),
    homepage_introduction: z.string(),
    homepage_primary_cta_label: z.string(),
    homepage_secondary_cta_label: z.string(),
    homepage_title: z.string(),
    last_actor_user_id: uuid.nullable(),
    last_change_reason: z.string(),
    navigation_archive_label: z.string(),
    navigation_search_label: z.string(),
    navigation_studio_label: z.string(),
    revision_id: uuid,
    updated_at: timestamp,
    version: z.unknown(),
  })
  .strict();

const savedSiteCopyResponse = z
  .object({
    audit_log_id: z.unknown(),
    changed_fields: z.array(siteCopyFieldId),
    revision_id: uuid,
    status: z.literal("saved"),
    updated_at: timestamp,
    version: z.unknown(),
  })
  .strict();

const unchangedSiteCopyResponse = z
  .object({
    revision_id: uuid,
    status: z.literal("unchanged"),
    version: z.unknown(),
  })
  .strict();

const conflictSiteCopyResponse = z
  .object({
    current_revision_id: uuid,
    current_version: z.unknown(),
    status: z.literal("conflict"),
  })
  .strict();

const saveSiteCopyResponse = z.discriminatedUnion("status", [
  savedSiteCopyResponse,
  unchangedSiteCopyResponse,
  conflictSiteCopyResponse,
]);

export interface PublicSiteCopyRepositoryDataSource {
  getCurrent(): Promise<unknown>;
}

export interface SiteCopySaveRpcParameters {
  p_base_revision_id: string;
  p_base_version: string;
  p_footer_brand_note: string;
  p_homepage_introduction: string;
  p_homepage_primary_cta_label: string;
  p_homepage_secondary_cta_label: string;
  p_homepage_title: string;
  p_navigation_archive_label: string;
  p_navigation_search_label: string;
  p_navigation_studio_label: string;
  p_reason: string;
  p_request_id: string;
}

export interface AdminSiteCopyRepositoryDataSource {
  getCurrent(): Promise<unknown>;
  save(parameters: SiteCopySaveRpcParameters): Promise<unknown>;
}

function dataCorruption(): SiteCopyDomainError {
  return new SiteCopyDomainError(
    "DATA_CORRUPTION",
    "Site copy data is invalid",
  );
}

export function parseSiteCopyBigintTransport(value: unknown): bigint {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw dataCorruption();
    return BigInt(value);
  }

  if (typeof value === "string" && canonicalUnsignedInteger.test(value)) {
    return BigInt(value);
  }

  throw dataCorruption();
}

export function parseSiteCopyDatabaseTime(value: unknown): Date {
  const parsed = timestamp.safeParse(value);
  if (!parsed.success) throw dataCorruption();
  const result = new Date(parsed.data);
  if (!Number.isFinite(result.getTime())) throw dataCorruption();
  return result;
}

function parseCanonicalContent(value: unknown): SiteCopyContent {
  let content: SiteCopyContent;
  try {
    content = parseSiteCopyContent(value);
  } catch {
    throw dataCorruption();
  }

  if (
    typeof value !== "object" ||
    value === null ||
    SITE_COPY_FIELD_IDS.some(
      (field) =>
        content[field] !== (value as Record<SiteCopyFieldId, unknown>)[field],
    )
  ) {
    throw dataCorruption();
  }

  return content;
}

function parseCanonicalReason(value: string): string {
  try {
    const reason = normalizeSiteCopyReason(value);
    if (reason !== value) throw dataCorruption();
    return reason;
  } catch (error) {
    if (
      error instanceof SiteCopyDomainError &&
      error.code === "DATA_CORRUPTION"
    ) {
      throw error;
    }
    throw dataCorruption();
  }
}

function parseStrict<T>(parser: () => T): T {
  try {
    return parser();
  } catch (error) {
    if (error instanceof SiteCopyDomainError) throw error;
    throw dataCorruption();
  }
}

function requirePositive(value: bigint): bigint {
  if (value < 1n) throw dataCorruption();
  return value;
}

function contentFromRow(
  row: Omit<
    z.infer<typeof adminSiteCopyRow>,
    | "audit_log_id"
    | "last_actor_user_id"
    | "last_change_reason"
    | "revision_id"
    | "updated_at"
    | "version"
  >,
): SiteCopyContent {
  return {
    footer_brand_note: row.footer_brand_note,
    homepage_introduction: row.homepage_introduction,
    homepage_primary_cta_label: row.homepage_primary_cta_label,
    homepage_secondary_cta_label: row.homepage_secondary_cta_label,
    homepage_title: row.homepage_title,
    navigation_archive_label: row.navigation_archive_label,
    navigation_search_label: row.navigation_search_label,
    navigation_studio_label: row.navigation_studio_label,
  };
}

export function createPublicSiteCopyRepository(
  source: PublicSiteCopyRepositoryDataSource,
): PublicSiteCopyStore {
  return {
    async getCurrent() {
      const raw = await source.getCurrent();
      return parseStrict(() => {
        const rows = z.array(publicSiteCopyRow).max(1).parse(raw);
        if (rows.length === 0) return null;
        const row = rows[0];
        if (!row) throw dataCorruption();
        return {
          content: {
            footer_brand_note: row.footer_brand_note,
            homepage_introduction: row.homepage_introduction,
            homepage_primary_cta_label: row.homepage_primary_cta_label,
            homepage_secondary_cta_label: row.homepage_secondary_cta_label,
            homepage_title: row.homepage_title,
            navigation_archive_label: row.navigation_archive_label,
            navigation_search_label: row.navigation_search_label,
            navigation_studio_label: row.navigation_studio_label,
          } satisfies PublicSiteCopyCandidateContent,
          version: requirePositive(parseSiteCopyBigintTransport(row.version)),
        };
      });
    },
  };
}

export function createAdminSiteCopyRepository(
  source: AdminSiteCopyRepositoryDataSource,
): AdminSiteCopyStore {
  return {
    async getCurrent() {
      const raw = await source.getCurrent();
      return parseStrict((): AdminSiteCopySnapshot | null => {
        const rows = z.array(adminSiteCopyRow).max(1).parse(raw);
        if (rows.length === 0) return null;
        const row = rows[0];
        if (!row) throw dataCorruption();
        const content = parseCanonicalContent(contentFromRow(row));
        return {
          auditLogId: parseSiteCopyBigintTransport(row.audit_log_id),
          content,
          lastActorUserId: row.last_actor_user_id,
          lastChangeReason: parseCanonicalReason(row.last_change_reason),
          revisionId: row.revision_id,
          updatedAt: parseSiteCopyDatabaseTime(row.updated_at),
          version: requirePositive(parseSiteCopyBigintTransport(row.version)),
        } satisfies AdminSiteCopySnapshot;
      });
    },

    async save(input) {
      const normalized = parseAdminSiteCopySaveInput(input);
      const raw = await source.save({
        p_base_revision_id: normalized.baseRevisionId,
        p_base_version: normalized.baseVersion.toString(10),
        p_footer_brand_note: normalized.content.footer_brand_note,
        p_homepage_introduction: normalized.content.homepage_introduction,
        p_homepage_primary_cta_label:
          normalized.content.homepage_primary_cta_label,
        p_homepage_secondary_cta_label:
          normalized.content.homepage_secondary_cta_label,
        p_homepage_title: normalized.content.homepage_title,
        p_navigation_archive_label: normalized.content.navigation_archive_label,
        p_navigation_search_label: normalized.content.navigation_search_label,
        p_navigation_studio_label: normalized.content.navigation_studio_label,
        p_reason: normalized.reason,
        p_request_id: normalized.requestId,
      });

      return parseStrict((): AdminSiteCopySaveResult => {
        const result = saveSiteCopyResponse.parse(raw);
        if (result.status === "conflict") {
          return {
            currentRevisionId: result.current_revision_id,
            currentVersion: requirePositive(
              parseSiteCopyBigintTransport(result.current_version),
            ),
            status: "conflict",
          };
        }
        if (result.status === "unchanged") {
          return {
            revisionId: result.revision_id,
            status: "unchanged",
            version: requirePositive(
              parseSiteCopyBigintTransport(result.version),
            ),
          };
        }

        if (
          new Set(result.changed_fields).size !== result.changed_fields.length
        ) {
          throw dataCorruption();
        }
        return {
          auditLogId: parseSiteCopyBigintTransport(result.audit_log_id),
          changedFields: result.changed_fields,
          revisionId: result.revision_id,
          status: "saved",
          updatedAt: parseSiteCopyDatabaseTime(result.updated_at),
          version: requirePositive(
            parseSiteCopyBigintTransport(result.version),
          ),
        };
      });
    },
  };
}

function rpcErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return null;
}

export function mapSiteCopyRpcError(error: unknown): SiteCopyDomainError {
  const code = rpcErrorCode(error);
  if (code === "22023") {
    return new SiteCopyDomainError(
      "INVALID_INPUT",
      "Site copy input is invalid",
    );
  }
  if (code === "28000") {
    return new SiteCopyDomainError(
      "UNAUTHENTICATED",
      "Authentication is required",
    );
  }
  if (code === "42501") {
    return new SiteCopyDomainError(
      "FORBIDDEN",
      "Site copy operation is not authorized",
    );
  }
  if (code === "55000") {
    return dataCorruption();
  }
  if (code?.startsWith("PGRST")) {
    return new SiteCopyDomainError(
      "REPOSITORY_UNAVAILABLE",
      "Site copy repository is unavailable",
    );
  }
  if (code !== null) {
    return new SiteCopyDomainError(
      "UNKNOWN_REPOSITORY_ERROR",
      "Site copy repository returned an unknown error",
    );
  }
  return new SiteCopyDomainError(
    "REPOSITORY_UNAVAILABLE",
    "Site copy repository is unavailable",
  );
}

async function rpcData(
  request: PromiseLike<{ data: unknown; error: unknown }>,
): Promise<unknown> {
  try {
    const { data, error } = await request;
    if (error) throw mapSiteCopyRpcError(error);
    return data;
  } catch (error) {
    if (error instanceof SiteCopyDomainError) throw error;
    throw mapSiteCopyRpcError(error);
  }
}

export function createSupabasePublicSiteCopyRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
): PublicSiteCopyStore {
  const client = createPublicSupabaseClient(environment);
  return createPublicSiteCopyRepository({
    getCurrent() {
      return rpcData(client.rpc("get_public_site_copy"));
    },
  });
}

export function createSupabaseAdminSiteCopyRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): AdminSiteCopyStore {
  const client = createServerSupabaseClient(environment, cookies);
  return createAdminSiteCopyRepository({
    getCurrent() {
      return rpcData(client.rpc("get_admin_site_copy"));
    },
    save(parameters) {
      return rpcData(client.rpc("save_site_copy", parameters));
    },
  });
}
