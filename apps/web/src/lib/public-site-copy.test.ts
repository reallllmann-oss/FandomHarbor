import { createPublicSiteCopyRepository } from "@fandom-harbor/database";
import {
  SITE_COPY_BASELINE_V1,
  type PublicSiteCopyCandidateContent,
  type PublicSiteCopyStore,
} from "@fandom-harbor/services";
import { describe, expect, it, vi } from "vitest";

import { createWebPublicSiteCopyReader } from "./public-site-copy";

function candidate(
  overrides: Partial<PublicSiteCopyCandidateContent> = {},
): PublicSiteCopyCandidateContent {
  return { ...SITE_COPY_BASELINE_V1, ...overrides };
}

function publicRow(overrides: Record<string, unknown> = {}) {
  return {
    ...SITE_COPY_BASELINE_V1,
    version: 2,
    ...overrides,
  };
}

describe("Web Public Site Copy reader", () => {
  it("returns all eight valid database fields with the database Version", async () => {
    const content = candidate({
      footer_brand_note: "A quiet harbor",
      homepage_introduction: "Stories kept with care.",
      homepage_primary_cta_label: "Browse stories",
      homepage_secondary_cta_label: "Find a story",
      homepage_title: "Harbor Library",
      navigation_archive_label: "Library",
      navigation_search_label: "Find",
      navigation_studio_label: "Write",
    });
    const store: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => ({ content, version: 7n })),
    };

    await expect(createWebPublicSiteCopyReader(store).read()).resolves.toEqual({
      content,
      version: 7n,
    });
  });

  it("falls back only one invalid field and preserves the other database fields", async () => {
    const store: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => ({
        content: candidate({
          footer_brand_note: "Database footer",
          homepage_title: "",
          navigation_search_label: "Find",
        }),
        version: 8n,
      })),
    };

    await expect(createWebPublicSiteCopyReader(store).read()).resolves.toEqual({
      content: {
        ...SITE_COPY_BASELINE_V1,
        footer_brand_note: "Database footer",
        navigation_search_label: "Find",
      },
      version: 8n,
    });
  });

  it("falls back independently for several invalid fields", async () => {
    const store: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => ({
        content: candidate({
          footer_brand_note: "Database footer",
          homepage_introduction: "Line one\nLine two",
          homepage_title: 42,
          navigation_archive_label: "Library",
          navigation_search_label: "",
        }),
        version: 9n,
      })),
    };

    const result = await createWebPublicSiteCopyReader(store).read();
    expect(result).toEqual({
      content: {
        ...SITE_COPY_BASELINE_V1,
        footer_brand_note: "Database footer",
        navigation_archive_label: "Library",
      },
      version: 9n,
    });
  });

  it("uses the complete Baseline without a fake Version for no row or read failure", async () => {
    const noRow: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => null),
    };
    const failed: PublicSiteCopyStore = {
      getCurrent: vi.fn(async () => {
        throw new Error("repository unavailable");
      }),
    };
    const fallback = { content: SITE_COPY_BASELINE_V1, version: null };

    await expect(createWebPublicSiteCopyReader(noRow).read()).resolves.toEqual(
      fallback,
    );
    await expect(createWebPublicSiteCopyReader(failed).read()).resolves.toEqual(
      fallback,
    );
  });

  it("fails closed to the full Baseline for unsafe numeric bigint transport", async () => {
    const repository = createPublicSiteCopyRepository({
      getCurrent: async () => [
        publicRow({ version: Number.MAX_SAFE_INTEGER + 1 }),
      ],
    });

    await expect(
      createWebPublicSiteCopyReader(repository).read(),
    ).resolves.toEqual({
      content: SITE_COPY_BASELINE_V1,
      version: null,
    });
  });
});
