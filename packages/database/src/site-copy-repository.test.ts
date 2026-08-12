import {
  createPublicSiteCopyService,
  SITE_COPY_BASELINE_V1,
  SiteCopyDomainError,
  type AdminSiteCopySaveInput,
} from "@fandom-harbor/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAdminSiteCopyRepository,
  createPublicSiteCopyRepository,
  createSupabaseAdminSiteCopyRepository,
  createSupabasePublicSiteCopyRepository,
  mapSiteCopyRpcError,
  parseSiteCopyBigintTransport,
  parseSiteCopyDatabaseTime,
} from "./site-copy-repository";

const mocks = vi.hoisted(() => ({
  publicRpc: vi.fn(),
  serverRpc: vi.fn(),
}));

vi.mock("./public-client", () => ({
  createPublicSupabaseClient: () => ({ rpc: mocks.publicRpc }),
}));

vi.mock("./server-client", () => ({
  createServerSupabaseClient: () => ({ rpc: mocks.serverRpc }),
}));

const revisionId = "10000000-0000-4000-8000-000000000001";
const requestId = "10000000-0000-4000-8000-000000000002";
const updatedAt = "2026-07-30T12:00:00.000Z";

function publicRow(overrides: Record<string, unknown> = {}) {
  return {
    footer_brand_note: SITE_COPY_BASELINE_V1.footer_brand_note,
    homepage_introduction: SITE_COPY_BASELINE_V1.homepage_introduction,
    homepage_primary_cta_label:
      SITE_COPY_BASELINE_V1.homepage_primary_cta_label,
    homepage_secondary_cta_label:
      SITE_COPY_BASELINE_V1.homepage_secondary_cta_label,
    homepage_title: SITE_COPY_BASELINE_V1.homepage_title,
    navigation_archive_label: SITE_COPY_BASELINE_V1.navigation_archive_label,
    navigation_search_label: SITE_COPY_BASELINE_V1.navigation_search_label,
    navigation_studio_label: SITE_COPY_BASELINE_V1.navigation_studio_label,
    version: 1,
    ...overrides,
  };
}

function adminRow(overrides: Record<string, unknown> = {}) {
  return {
    ...publicRow(),
    audit_log_id: 1,
    last_actor_user_id: null,
    last_change_reason: "DATA-01 site copy baseline initialization",
    revision_id: revisionId,
    updated_at: updatedAt,
    ...overrides,
  };
}

function saveInput(
  overrides: Partial<AdminSiteCopySaveInput> = {},
): AdminSiteCopySaveInput {
  return {
    baseRevisionId: revisionId,
    baseVersion: 1n,
    content: { ...SITE_COPY_BASELINE_V1, homepage_title: "Harbor Library" },
    reason: "Update homepage title",
    requestId,
    ...overrides,
  };
}

describe("lossless Site Copy bigint transport", () => {
  it.each([
    [0, 0n],
    [42, 42n],
    [Number.MAX_SAFE_INTEGER, BigInt(Number.MAX_SAFE_INTEGER)],
    ["0", 0n],
    ["9007199254740992", 9_007_199_254_740_992n],
    [
      "1234567890123456789012345678901234567890",
      1_234_567_890_123_456_789_012_345_678_901_234_567_890n,
    ],
  ])("parses %p without precision loss", (transport, expected) => {
    expect(parseSiteCopyBigintTransport(transport)).toBe(expected);
  });

  it.each([
    Number.MAX_SAFE_INTEGER + 1,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    "",
    " ",
    "-1",
    "+1",
    "1.5",
    "1e3",
    "0x10",
    "abc",
    "01",
  ])("rejects unsafe or non-canonical transport %p", (transport) => {
    expect(() => parseSiteCopyBigintTransport(transport)).toThrow(
      SiteCopyDomainError,
    );
    try {
      parseSiteCopyBigintTransport(transport);
    } catch (error) {
      expect(error).toMatchObject({ code: "DATA_CORRUPTION" });
    }
  });

  it("does not use Number(), parseInt() or parseFloat() for string parsing", () => {
    const implementation = parseSiteCopyBigintTransport.toString();
    expect(implementation).not.toContain("Number(value)");
    expect(implementation).not.toContain("parseInt");
    expect(implementation).not.toContain("parseFloat");
  });
});

describe("public Site Copy repository", () => {
  it("maps the actual RPC row and normalizes version to bigint", async () => {
    const repository = createPublicSiteCopyRepository({
      getCurrent: async () => [publicRow({ version: "9007199254740992" })],
    });

    await expect(repository.getCurrent()).resolves.toEqual({
      content: SITE_COPY_BASELINE_V1,
      version: 9_007_199_254_740_992n,
    });
  });

  it("returns null for the actual empty set response", async () => {
    const repository = createPublicSiteCopyRepository({
      getCurrent: async () => [],
    });
    await expect(repository.getCurrent()).resolves.toBeNull();
  });

  it("preserves independent field candidates for Service fallback", async () => {
    const repository = createPublicSiteCopyRepository({
      getCurrent: async () => [
        publicRow({
          footer_brand_note: "Database footer",
          homepage_title: 42,
        }),
      ],
    });

    await expect(
      createPublicSiteCopyService(repository).read(),
    ).resolves.toEqual({
      content: {
        ...SITE_COPY_BASELINE_V1,
        footer_brand_note: "Database footer",
      },
      version: 1n,
    });
  });

  it("rejects unsafe bigint transport and falls back without a fake version", async () => {
    const repository = createPublicSiteCopyRepository({
      getCurrent: async () => [
        publicRow({ version: Number.MAX_SAFE_INTEGER + 1 }),
      ],
    });

    await expect(repository.getCurrent()).rejects.toMatchObject({
      code: "DATA_CORRUPTION",
    });
    await expect(
      createPublicSiteCopyService(repository).read(),
    ).resolves.toEqual({
      content: SITE_COPY_BASELINE_V1,
      version: null,
    });
  });

  it("rejects missing fields, multiple rows and internal Audit fields", async () => {
    const missing: Record<string, unknown> = publicRow();
    Reflect.deleteProperty(missing, "homepage_title");

    for (const raw of [
      [missing],
      [publicRow(), publicRow()],
      [publicRow({ audit_log_id: 1 })],
    ]) {
      await expect(
        createPublicSiteCopyRepository({
          getCurrent: async () => raw,
        }).getCurrent(),
      ).rejects.toMatchObject({ code: "DATA_CORRUPTION" });
    }
  });
});

describe("Admin Site Copy repository", () => {
  it("strictly maps Version 1 and Audit context to Domain values", async () => {
    const repository = createAdminSiteCopyRepository({
      getCurrent: async () => [
        adminRow({
          audit_log_id: "9007199254740992",
          version: "9007199254740993",
        }),
      ],
      save: async () => null,
    });

    await expect(repository.getCurrent()).resolves.toEqual({
      auditLogId: 9_007_199_254_740_992n,
      content: SITE_COPY_BASELINE_V1,
      lastActorUserId: null,
      lastChangeReason: "DATA-01 site copy baseline initialization",
      revisionId,
      updatedAt: new Date(updatedAt),
      version: 9_007_199_254_740_993n,
    });
  });

  it.each([
    { homepage_title: " Fandom Harbor" },
    { homepage_title: "" },
    { last_change_reason: "bad" },
    { revision_id: "not-a-uuid" },
    { updated_at: "not-a-time" },
    { audit_log_id: -1 },
    { version: Number.MAX_SAFE_INTEGER + 1 },
  ])("fails closed for corrupt Admin data %p", async (override) => {
    const repository = createAdminSiteCopyRepository({
      getCurrent: async () => [adminRow(override)],
      save: async () => null,
    });
    await expect(repository.getCurrent()).rejects.toMatchObject({
      code: "DATA_CORRUPTION",
    });
  });

  it("maps Saved and preserves the database IDs, bigint and time", async () => {
    const source = {
      getCurrent: async () => [adminRow()],
      save: vi.fn(async () => ({
        audit_log_id: "9007199254740992",
        changed_fields: ["homepage_title"],
        revision_id: "10000000-0000-4000-8000-000000000003",
        status: "saved",
        updated_at: "2026-07-30T13:00:00.000Z",
        version: "9007199254740993",
      })),
    };
    const repository = createAdminSiteCopyRepository(source);

    await expect(repository.save(saveInput())).resolves.toEqual({
      auditLogId: 9_007_199_254_740_992n,
      changedFields: ["homepage_title"],
      revisionId: "10000000-0000-4000-8000-000000000003",
      status: "saved",
      updatedAt: new Date("2026-07-30T13:00:00.000Z"),
      version: 9_007_199_254_740_993n,
    });
  });

  it("serializes an arbitrarily large baseVersion directly to decimal text", async () => {
    const source = {
      getCurrent: async () => [adminRow()],
      save: vi.fn(async () => ({
        revision_id: revisionId,
        status: "unchanged",
        version: "123456789012345678901234567890",
      })),
    };
    const repository = createAdminSiteCopyRepository(source);

    await repository.save(
      saveInput({ baseVersion: 123_456_789_012_345_678_901_234_567_890n }),
    );
    expect(source.save).toHaveBeenCalledWith(
      expect.objectContaining({
        p_base_version: "123456789012345678901234567890",
      }),
    );
  });

  it("maps Unchanged and Conflict without fabricating Audit IDs", async () => {
    const unchanged = createAdminSiteCopyRepository({
      getCurrent: async () => [adminRow()],
      save: async () => ({
        revision_id: revisionId,
        status: "unchanged",
        version: 1,
      }),
    });
    await expect(unchanged.save(saveInput())).resolves.toEqual({
      revisionId,
      status: "unchanged",
      version: 1n,
    });

    const conflict = createAdminSiteCopyRepository({
      getCurrent: async () => [adminRow()],
      save: async () => ({
        current_revision_id: revisionId,
        current_version: 2,
        status: "conflict",
      }),
    });
    await expect(conflict.save(saveInput())).resolves.toEqual({
      currentRevisionId: revisionId,
      currentVersion: 2n,
      status: "conflict",
    });
  });

  it("returns the same database result for a repeated request id", async () => {
    const result = {
      audit_log_id: 2,
      changed_fields: ["homepage_title"],
      revision_id: "10000000-0000-4000-8000-000000000003",
      status: "saved",
      updated_at: "2026-07-30T13:00:00.000Z",
      version: 2,
    };
    const repository = createAdminSiteCopyRepository({
      getCurrent: async () => [adminRow()],
      save: async () => result,
    });

    const first = await repository.save(saveInput());
    const retry = await repository.save(saveInput());
    expect(retry).toEqual(first);
  });
});

describe("Site Copy RPC adapters and errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["22023", "INVALID_INPUT"],
    ["28000", "UNAUTHENTICATED"],
    ["42501", "FORBIDDEN"],
    ["55000", "DATA_CORRUPTION"],
    ["PGRST202", "REPOSITORY_UNAVAILABLE"],
    ["XX999", "UNKNOWN_REPOSITORY_ERROR"],
  ])("maps stable RPC code %s to %s", (rpcCode, domainCode) => {
    expect(mapSiteCopyRpcError({ code: rpcCode })).toMatchObject({
      code: domainCode,
    });
  });

  it("maps a transport failure without exposing its raw object", () => {
    const raw = new Error("private transport detail");
    const mapped = mapSiteCopyRpcError(raw);
    expect(mapped.code).toBe("REPOSITORY_UNAVAILABLE");
    expect(mapped.message).not.toContain("private");
    expect(mapped).not.toHaveProperty("cause");
  });

  it("calls the Public RPC and returns only the Domain store contract", async () => {
    mocks.publicRpc.mockResolvedValue({
      data: [publicRow()],
      error: null,
    });
    const repository = createSupabasePublicSiteCopyRepository({});

    await expect(repository.getCurrent()).resolves.toMatchObject({
      version: 1n,
    });
    expect(mocks.publicRpc).toHaveBeenCalledWith("get_public_site_copy");
  });

  it("calls Admin Read and Save RPCs with lossless parameters", async () => {
    mocks.serverRpc
      .mockResolvedValueOnce({ data: [adminRow()], error: null })
      .mockResolvedValueOnce({
        data: {
          revision_id: revisionId,
          status: "unchanged",
          version: 1,
        },
        error: null,
      });
    const repository = createSupabaseAdminSiteCopyRepository(
      {},
      { getAll: () => [], setAll: () => undefined },
    );

    await repository.getCurrent();
    await repository.save(saveInput());
    expect(mocks.serverRpc).toHaveBeenNthCalledWith(1, "get_admin_site_copy");
    expect(mocks.serverRpc).toHaveBeenNthCalledWith(
      2,
      "save_site_copy",
      expect.objectContaining({
        p_base_revision_id: revisionId,
        p_base_version: "1",
        p_request_id: requestId,
      }),
    );
  });

  it("maps a reused request id with a different payload to INVALID_INPUT", async () => {
    mocks.serverRpc.mockResolvedValue({
      data: null,
      error: {
        code: "22023",
        details: "field=request_id",
        hint: null,
        message: "INVALID_INPUT",
      },
    });
    const repository = createSupabaseAdminSiteCopyRepository(
      {},
      { getAll: () => [], setAll: () => undefined },
    );

    await expect(repository.save(saveInput())).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
  });
});

describe("strict database time", () => {
  it("accepts an offset timestamp and rejects malformed values", () => {
    expect(parseSiteCopyDatabaseTime(updatedAt)).toEqual(new Date(updatedAt));
    expect(() => parseSiteCopyDatabaseTime("2026-07-30")).toThrow(
      SiteCopyDomainError,
    );
  });
});
