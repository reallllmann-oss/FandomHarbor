import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { describe, expect, it, vi } from "vitest";

import {
  createAdminSiteCopyService,
  createPublicSiteCopyService,
  diffSiteCopy,
  normalizeSiteCopyField,
  normalizeSiteCopyReason,
  parseAdminSiteCopySaveInput,
  parseSiteCopyContent,
  parseSiteCopyRequestId,
  SITE_COPY_BASELINE_V1,
  SITE_COPY_FIELD_IDS,
  SITE_COPY_FIELD_LIMITS,
  SITE_COPY_SYSTEM_REQUEST_ID,
  SiteCopyDomainError,
  type AdminSiteCopySnapshot,
  type AdminSiteCopyStore,
  type PublicSiteCopyCandidateContent,
  type PublicSiteCopyStore,
} from "./site-copy-domain";

const revisionId = "10000000-0000-4000-8000-000000000001";
const requestId = "10000000-0000-4000-8000-000000000002";

function candidate(
  overrides: Partial<PublicSiteCopyCandidateContent> = {},
): PublicSiteCopyCandidateContent {
  return { ...SITE_COPY_BASELINE_V1, ...overrides };
}

function snapshot(): AdminSiteCopySnapshot {
  return {
    auditLogId: 1n,
    content: { ...SITE_COPY_BASELINE_V1 },
    lastActorUserId: null,
    lastChangeReason: "DATA-01 site copy baseline initialization",
    revisionId,
    updatedAt: new Date("2026-07-30T12:00:00.000Z"),
    version: 1n,
  };
}

function context(
  membershipState: "active" | "revoked" | "suspended" = "active",
  roles: ("admin" | "author" | "super_admin")[] = [],
) {
  return createTrustedAccessContext({
    identity: { id: "20000000-0000-4000-8000-000000000001" },
    membershipState,
    roles,
  });
}

describe("site copy exact content contract", () => {
  it("accepts exactly the frozen eight fields", () => {
    expect(parseSiteCopyContent(SITE_COPY_BASELINE_V1)).toEqual(
      SITE_COPY_BASELINE_V1,
    );
    expect(SITE_COPY_FIELD_IDS).toHaveLength(8);
  });

  it("rejects every missing field and any extra field", () => {
    for (const field of SITE_COPY_FIELD_IDS) {
      const value = { ...SITE_COPY_BASELINE_V1 };
      delete (value as Record<string, unknown>)[field];
      expect(() => parseSiteCopyContent(value)).toThrow(SiteCopyDomainError);
    }

    expect(() =>
      parseSiteCopyContent({
        ...SITE_COPY_BASELINE_V1,
        navigation_order: ["Archive", "Search", "Studio"],
      }),
    ).toThrow(SiteCopyDomainError);
  });

  it("keeps the Domain baseline byte-for-byte aligned with DATA-01", () => {
    expect(SITE_COPY_BASELINE_V1).toEqual({
      footer_brand_note: "Fandom Harbor · 私域作品归档",
      homepage_introduction:
        "一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。",
      homepage_primary_cta_label: "浏览公开作品",
      homepage_secondary_cta_label: "查找作品与作者",
      homepage_title: "Fandom Harbor",
      navigation_archive_label: "Archive",
      navigation_search_label: "Search",
      navigation_studio_label: "Studio",
    });
  });

  it("normalizes NFC and database spaces before counting code points", () => {
    expect(
      normalizeSiteCopyField("homepage_title", "  Cafe\u0301 Harbor  "),
    ).toBe("Café Harbor");
    expect(normalizeSiteCopyField("homepage_title", "😀".repeat(40))).toBe(
      "😀".repeat(40),
    );
    expect(() =>
      normalizeSiteCopyField("homepage_title", "😀".repeat(41)),
    ).toThrow(SiteCopyDomainError);
  });

  it.each(SITE_COPY_FIELD_IDS)(
    "enforces the DB-01 code-point limit for %s",
    (field) => {
      const { max } = SITE_COPY_FIELD_LIMITS[field];
      expect(normalizeSiteCopyField(field, "界".repeat(max))).toBe(
        "界".repeat(max),
      );
      expect(() => normalizeSiteCopyField(field, "")).toThrow(
        SiteCopyDomainError,
      );
      expect(() => normalizeSiteCopyField(field, "界".repeat(max + 1))).toThrow(
        SiteCopyDomainError,
      );
    },
  );

  it("rejects field controls and newlines", () => {
    expect(() =>
      normalizeSiteCopyField("homepage_title", "Harbor\u0000"),
    ).toThrow(SiteCopyDomainError);
    expect(() =>
      normalizeSiteCopyField("homepage_title", "Harbor\nLight"),
    ).toThrow(SiteCopyDomainError);
  });

  it("enforces the normalized reason boundaries 3, 4, 200 and 201", () => {
    expect(() => normalizeSiteCopyReason("界".repeat(3))).toThrow(
      SiteCopyDomainError,
    );
    expect(normalizeSiteCopyReason(`  ${"界".repeat(4)}  `)).toBe(
      "界".repeat(4),
    );
    expect(normalizeSiteCopyReason("  e\u0301abc  ")).toBe("éabc");
    expect(normalizeSiteCopyReason("界".repeat(200))).toBe("界".repeat(200));
    expect(() => normalizeSiteCopyReason("界".repeat(201))).toThrow(
      SiteCopyDomainError,
    );
    expect(() => normalizeSiteCopyReason("ab\ncd")).toThrow(
      SiteCopyDomainError,
    );
  });

  it("rejects a nil or malformed Admin request id", () => {
    expect(parseSiteCopyRequestId(requestId)).toBe(requestId);
    expect(() => parseSiteCopyRequestId(SITE_COPY_SYSTEM_REQUEST_ID)).toThrow(
      SiteCopyDomainError,
    );
    expect(() => parseSiteCopyRequestId("not-a-uuid")).toThrow(
      SiteCopyDomainError,
    );
  });

  it("computes only real normalized changes", () => {
    expect(
      diffSiteCopy(SITE_COPY_BASELINE_V1, {
        ...SITE_COPY_BASELINE_V1,
        homepage_title: "  Fandom Harbor  ",
      }),
    ).toEqual([]);
    expect(
      diffSiteCopy(SITE_COPY_BASELINE_V1, {
        ...SITE_COPY_BASELINE_V1,
        footer_brand_note: "A quieter harbor",
        homepage_title: "Harbor",
      }),
    ).toEqual(["homepage_title", "footer_brand_note"]);
  });
});

describe("public site copy service", () => {
  it("maps one normal database snapshot", async () => {
    const store: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => ({
        content: candidate({ homepage_title: "Harbor Library" }),
        version: 2n,
      })),
    };

    await expect(createPublicSiteCopyService(store).read()).resolves.toEqual({
      content: { ...SITE_COPY_BASELINE_V1, homepage_title: "Harbor Library" },
      version: 2n,
    });
  });

  it("falls back only invalid fields while preserving valid database fields", async () => {
    const store: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => ({
        content: candidate({
          footer_brand_note: "Database footer",
          homepage_title: "",
        }),
        version: 3n,
      })),
    };

    const result = await createPublicSiteCopyService(store).read();
    expect(result).toEqual({
      content: {
        ...SITE_COPY_BASELINE_V1,
        footer_brand_note: "Database footer",
      },
      version: 3n,
    });
  });

  it("falls back independently for multiple invalid fields", async () => {
    const store: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => ({
        content: candidate({
          footer_brand_note: "Footer from DB",
          homepage_introduction: "Line one\nLine two",
          homepage_title: 42,
          navigation_search_label: "Find",
        }),
        version: 4n,
      })),
    };

    const result = await createPublicSiteCopyService(store).read();
    expect(result.content.footer_brand_note).toBe("Footer from DB");
    expect(result.content.navigation_search_label).toBe("Find");
    expect(result.content.homepage_title).toBe(
      SITE_COPY_BASELINE_V1.homepage_title,
    );
    expect(result.content.homepage_introduction).toBe(
      SITE_COPY_BASELINE_V1.homepage_introduction,
    );
  });

  it("uses the full baseline without a fabricated version for no row or failure", async () => {
    const noRow: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => null),
    };
    const failed: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => {
        throw new SiteCopyDomainError("DATA_CORRUPTION");
      }),
    };

    const expected = { content: SITE_COPY_BASELINE_V1, version: null };
    await expect(createPublicSiteCopyService(noRow).read()).resolves.toEqual(
      expected,
    );
    await expect(createPublicSiteCopyService(failed).read()).resolves.toEqual(
      expected,
    );
  });
});

describe("admin site copy service", () => {
  function store(): AdminSiteCopyStore {
    return {
      getCurrent: vi.fn(async () => snapshot()),
      save: vi.fn(async () => ({
        auditLogId: 2n,
        changedFields: ["homepage_title" as const],
        revisionId: "10000000-0000-4000-8000-000000000003",
        status: "saved" as const,
        updatedAt: new Date("2026-07-30T13:00:00.000Z"),
        version: 2n,
      })),
    };
  }

  it.each([
    ["Admin", context("active", ["admin"])],
    ["Super Admin", context("active", ["super_admin"])],
  ])("allows an active %s before calling the store", async (_label, access) => {
    await expect(
      createAdminSiteCopyService(store()).read(access),
    ).resolves.toEqual(snapshot());
  });

  it.each([
    ["anon", null],
    ["Reader", context()],
    ["Author", context("active", ["author"])],
    ["suspended Admin", context("suspended", ["admin"])],
    ["revoked Super Admin", context("revoked", ["super_admin"])],
  ])("denies %s before repository access", async (_label, access) => {
    const source = store();
    await expect(
      createAdminSiteCopyService(source).read(access),
    ).rejects.toBeInstanceOf(SiteCopyDomainError);
    expect(source.getCurrent).not.toHaveBeenCalled();
  });

  it("normalizes and validates the complete save input before saving", async () => {
    const source = store();
    const result = await createAdminSiteCopyService(source).save(
      context("active", ["admin"]),
      {
        baseRevisionId: revisionId,
        baseVersion: 1n,
        content: {
          ...SITE_COPY_BASELINE_V1,
          homepage_title: "  Cafe\u0301 Harbor  ",
        },
        reason: "  Edit homepage title  ",
        requestId,
      },
    );

    expect(result.status).toBe("saved");
    expect(source.save).toHaveBeenCalledWith({
      baseRevisionId: revisionId,
      baseVersion: 1n,
      content: {
        ...SITE_COPY_BASELINE_V1,
        homepage_title: "Café Harbor",
      },
      reason: "Edit homepage title",
      requestId,
    });
  });

  it("rejects malformed, nil and unsafe save identity input", () => {
    const input = {
      baseRevisionId: revisionId,
      baseVersion: 1n,
      content: SITE_COPY_BASELINE_V1,
      reason: "Valid reason",
      requestId,
    };

    expect(parseAdminSiteCopySaveInput(input)).toMatchObject(input);
    expect(() =>
      parseAdminSiteCopySaveInput({
        ...input,
        requestId: SITE_COPY_SYSTEM_REQUEST_ID,
      }),
    ).toThrow(SiteCopyDomainError);
    expect(() =>
      parseAdminSiteCopySaveInput({
        ...input,
        baseRevisionId: "not-a-uuid",
      }),
    ).toThrow(SiteCopyDomainError);
    expect(() =>
      parseAdminSiteCopySaveInput({ ...input, baseVersion: 1 }),
    ).toThrow(SiteCopyDomainError);
  });

  it("does not hide missing or failed Admin data behind the baseline", async () => {
    const missing = store();
    vi.mocked(missing.getCurrent).mockResolvedValue(null);
    await expect(
      createAdminSiteCopyService(missing).read(context("active", ["admin"])),
    ).rejects.toMatchObject({ code: "DATA_CORRUPTION" });

    const failed = store();
    vi.mocked(failed.getCurrent).mockRejectedValue(new Error("transport"));
    await expect(
      createAdminSiteCopyService(failed).read(context("active", ["admin"])),
    ).rejects.toMatchObject({ code: "REPOSITORY_UNAVAILABLE" });
  });
});
