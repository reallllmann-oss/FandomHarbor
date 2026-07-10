import { createTrustedAccessContext } from "@fandom-harbor/auth";
import type { ContentStore } from "@fandom-harbor/services";
import { describe, expect, it, vi } from "vitest";

import {
  createHybridReaderContentGateway,
  createReaderContentGateway,
} from "./reader-content";

vi.mock("@fandom-harbor/database", () => ({
  createSupabaseContentRepository: vi.fn(),
}));

import { createSupabaseContentRepository } from "@fandom-harbor/database";

const readerAccess = createTrustedAccessContext({
  identity: {
    id: "30000000-0000-4000-8000-000000000001",
  },
  membershipState: "active",
});

describe("reader content gateway", () => {
  it("loads published work and ordered chapter fixtures through the content service", async () => {
    const gateway = createReaderContentGateway(readerAccess);

    await expect(gateway.getWork("glass-harbor")).resolves.toMatchObject({
      chapters: [
        { position: 1, slug: "below-the-tide-line" },
        { position: 2, slug: "the-missing-catalogue" },
      ],
      work: { slug: "glass-harbor" },
    });
  });

  it("derives previous and next chapter navigation without a second data source", async () => {
    const gateway = createReaderContentGateway(readerAccess);

    await expect(
      gateway.getChapter("glass-harbor", "the-missing-catalogue"),
    ).resolves.toMatchObject({
      chapter: { position: 2 },
      nextChapter: null,
      previousChapter: { position: 1, slug: "below-the-tide-line" },
    });

    await expect(
      gateway.getChapter("glass-harbor", "below-the-tide-line"),
    ).resolves.toMatchObject({
      chapter: { position: 1 },
      nextChapter: { position: 2, slug: "the-missing-catalogue" },
      previousChapter: null,
    });
  });

  it("keeps draft chapters out of the directory, reading page and navigation", async () => {
    const gateway = createReaderContentGateway(readerAccess);
    const work = await gateway.getWork("glass-harbor");

    expect(work?.chapters.map((chapter) => chapter.slug)).toEqual([
      "below-the-tide-line",
      "the-missing-catalogue",
    ]);
    await expect(
      gateway.getChapter("glass-harbor", "the-sealed-room-draft"),
    ).resolves.toBeNull();
    await expect(
      gateway.getChapter("glass-harbor", "the-missing-catalogue"),
    ).resolves.toMatchObject({ nextChapter: null });
  });

  it("keeps draft works and their draft-only chapter sets out of Reader", async () => {
    const gateway = createReaderContentGateway(readerAccess);

    await expect(gateway.getWork("paper-moons")).resolves.toBeNull();
    await expect(gateway.getWork("unlit-margins")).resolves.toBeNull();
    await expect(gateway.listWorks()).resolves.toMatchObject([
      { slug: "glass-harbor", status: "published" },
      { slug: "radio-after-sunset", status: "published" },
    ]);
  });

  it("returns null for unknown work, chapter and article slugs", async () => {
    const gateway = createReaderContentGateway(readerAccess);

    await expect(gateway.getWork("missing")).resolves.toBeNull();
    await expect(
      gateway.getChapter("glass-harbor", "missing"),
    ).resolves.toBeNull();
    await expect(gateway.getArticle("missing")).resolves.toBeNull();
  });

  it("keeps draft articles out of Reader article reads and lists", async () => {
    const gateway = createReaderContentGateway(readerAccess);

    await expect(
      gateway.getArticle("notes-from-the-breakwater"),
    ).resolves.toBeNull();
    await expect(gateway.listArticles()).resolves.toMatchObject([
      { slug: "why-an-archive-needs-quiet", status: "published" },
    ]);
  });

  it("prefers published runtime works over fixture fallbacks and merges list output", async () => {
    const runtimeStore: ContentStore = {
      createArticle: vi.fn(),
      createChapter: vi.fn(),
      createWork: vi.fn(),
      getPublishedArticleBySlug: vi.fn(async () => null),
      getPublishedWorkBySlug: vi.fn(async (slug: string) =>
        slug === "runtime-harbor"
          ? {
              categoryId: null,
              createdAt: new Date("2026-07-01T00:00:00Z"),
              id: "runtime-work",
              publishedAt: new Date("2026-07-01T00:00:00Z"),
              slug,
              status: "published" as const,
              summary: "Runtime summary",
              title: "Runtime Harbor",
              updatedAt: new Date("2026-07-01T00:00:00Z"),
            }
          : null,
      ),
      listCategories: vi.fn(async () => []),
      listPublishedArticles: vi.fn(async () => []),
      listPublishedChapters: vi.fn(async (workId: string) =>
        workId === "runtime-work"
          ? [
              {
                content: { content: [], type: "doc" },
                contentSchemaVersion: 1,
                createdAt: new Date("2026-07-01T00:00:00Z"),
                id: "runtime-chapter",
                position: 1,
                publishedAt: new Date("2026-07-01T00:00:00Z"),
                slug: "runtime-chapter-1",
                status: "published" as const,
                title: "Runtime Chapter",
                updatedAt: new Date("2026-07-01T00:00:00Z"),
                workId,
              },
            ]
          : [],
      ),
      listPublishedWorks: vi.fn(async () => [
        {
          categoryId: null,
          createdAt: new Date("2026-07-01T00:00:00Z"),
          id: "runtime-work",
          publishedAt: new Date("2026-07-01T00:00:00Z"),
          slug: "runtime-harbor",
          status: "published" as const,
          summary: "Runtime summary",
          title: "Runtime Harbor",
          updatedAt: new Date("2026-07-01T00:00:00Z"),
        },
      ]),
      listTags: vi.fn(async () => []),
    };
    vi.mocked(createSupabaseContentRepository).mockReturnValue(runtimeStore);

    const gateway = createHybridReaderContentGateway(
      readerAccess,
      {} as never,
      {} as never,
    );

    await expect(gateway.getWork("runtime-harbor")).resolves.toMatchObject({
      chapters: [{ slug: "runtime-chapter-1" }],
      work: { slug: "runtime-harbor" },
    });
    await expect(gateway.getWork("glass-harbor")).resolves.toMatchObject({
      work: { slug: "glass-harbor" },
    });
    await expect(gateway.listWorks()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "runtime-harbor" }),
        expect.objectContaining({ slug: "glass-harbor" }),
      ]),
    );
  });

  it("prefers published runtime articles over fixture fallbacks and keeps draft articles hidden", async () => {
    const runtimeStore: ContentStore = {
      createArticle: vi.fn(),
      createChapter: vi.fn(),
      createWork: vi.fn(),
      getPublishedArticleBySlug: vi.fn(async (slug: string) =>
        slug === "runtime-article"
          ? {
              categoryId: null,
              content: { content: [], type: "doc" },
              contentSchemaVersion: 1,
              createdAt: new Date("2026-07-01T00:00:00Z"),
              id: "runtime-article",
              publishedAt: new Date("2026-07-01T00:00:00Z"),
              slug,
              status: "published" as const,
              summary: "Runtime article summary",
              title: "Runtime Article",
              updatedAt: new Date("2026-07-01T00:00:00Z"),
            }
          : null,
      ),
      getPublishedWorkBySlug: vi.fn(async () => null),
      listCategories: vi.fn(async () => []),
      listPublishedArticles: vi.fn(async () => [
        {
          categoryId: null,
          content: { content: [], type: "doc" },
          contentSchemaVersion: 1,
          createdAt: new Date("2026-07-01T00:00:00Z"),
          id: "runtime-article",
          publishedAt: new Date("2026-07-01T00:00:00Z"),
          slug: "runtime-article",
          status: "published" as const,
          summary: "Runtime article summary",
          title: "Runtime Article",
          updatedAt: new Date("2026-07-01T00:00:00Z"),
        },
      ]),
      listPublishedChapters: vi.fn(async () => []),
      listPublishedWorks: vi.fn(async () => []),
      listTags: vi.fn(async () => []),
    };
    vi.mocked(createSupabaseContentRepository).mockReturnValue(runtimeStore);

    const gateway = createHybridReaderContentGateway(
      readerAccess,
      {} as never,
      {} as never,
    );

    await expect(gateway.getArticle("runtime-article")).resolves.toMatchObject({
      slug: "runtime-article",
      status: "published",
    });
    await expect(
      gateway.getArticle("why-an-archive-needs-quiet"),
    ).resolves.toMatchObject({
      slug: "why-an-archive-needs-quiet",
      status: "published",
    });
    await expect(
      gateway.getArticle("notes-from-the-breakwater"),
    ).resolves.toBeNull();
    await expect(gateway.listArticles()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "runtime-article" }),
        expect.objectContaining({ slug: "why-an-archive-needs-quiet" }),
      ]),
    );
  });
});
