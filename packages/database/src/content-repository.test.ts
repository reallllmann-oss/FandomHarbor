import { describe, expect, it, vi } from "vitest";

import {
  createAuthorWorkDraftRepository,
  createContentRepository,
  createDraftWorkEditorRepository,
  type AuthorWorkDraftRepositoryDataSource,
  type ContentRepositoryDataSource,
  type DraftWorkEditorRepositoryDataSource,
} from "./content-repository";

const timestamp = "2026-06-30T00:00:00.000Z";

function source(
  overrides: Partial<ContentRepositoryDataSource> = {},
): ContentRepositoryDataSource {
  return {
    createArticle: async () => null,
    createChapter: async () => null,
    createWork: async () => null,
    getPublishedArticleBySlug: async () => null,
    getPublishedWorkBySlug: async () => null,
    listCategories: async () => [],
    listPublishedArticles: async () => [],
    listPublishedChapters: async () => [],
    listPublishedWorks: async () => [],
    listTags: async () => [],
    ...overrides,
  };
}

describe("content repository", () => {
  it("maps provider rows into provider-independent domain values", async () => {
    const repository = createContentRepository(
      source({
        listPublishedWorks: async () => [
          {
            category_id: null,
            created_at: timestamp,
            id: "10000000-0000-4000-8000-000000000001",
            published_at: timestamp,
            slug: "harbor-lights",
            status: "published",
            summary: "",
            title: "Harbor Lights",
            updated_at: timestamp,
          },
        ],
      }),
    );

    await expect(
      repository.listPublishedWorks({ limit: 20, offset: 0 }),
    ).resolves.toEqual([
      expect.objectContaining({
        createdAt: new Date(timestamp),
        publishedAt: new Date(timestamp),
        slug: "harbor-lights",
      }),
    ]);
  });

  it("fails closed when a provider returns an unknown content status", async () => {
    const repository = createContentRepository(
      source({
        listPublishedWorks: async () => [
          {
            category_id: null,
            created_at: timestamp,
            id: "10000000-0000-4000-8000-000000000001",
            published_at: timestamp,
            slug: "harbor-lights",
            status: "visible",
            summary: "",
            title: "Harbor Lights",
            updated_at: timestamp,
          },
        ],
      }),
    );

    await expect(
      repository.listPublishedWorks({ limit: 20, offset: 0 }),
    ).rejects.toThrow();
  });
});

describe("author work draft repository", () => {
  function draftSource(
    createAuthorWorkDraft: AuthorWorkDraftRepositoryDataSource["createAuthorWorkDraft"],
  ): AuthorWorkDraftRepositoryDataSource {
    return { createAuthorWorkDraft };
  }

  it("validates draft input with Zod and maps the RPC result", async () => {
    const createAuthorWorkDraft = vi.fn(async () => ({
      category_id: "21000000-0000-4000-8000-000000000001",
      created_at: timestamp,
      id: "10000000-0000-4000-8000-000000000001",
      published_at: null,
      slug: "work-10000000-0000-4000-8000-000000000001",
      status: "draft",
      summary: "Draft summary",
      title: "Harbor Draft",
      updated_at: timestamp,
    }));
    const repository = createAuthorWorkDraftRepository(
      draftSource(createAuthorWorkDraft),
    );

    await expect(
      repository.createAuthorWorkDraft({
        categoryId: "21000000-0000-4000-8000-000000000001",
        summary: "Draft summary",
        tagIds: ["22000000-0000-4000-8000-000000000001"],
        title: "Harbor Draft",
      }),
    ).resolves.toMatchObject({
      publishedAt: null,
      status: "draft",
    });
  });

  it("rejects invalid category and tag IDs before calling the data source", async () => {
    const createAuthorWorkDraft = vi.fn();
    const repository = createAuthorWorkDraftRepository(
      draftSource(createAuthorWorkDraft),
    );

    await expect(
      repository.createAuthorWorkDraft({
        categoryId: "not-a-uuid",
        summary: "",
        tagIds: ["also-not-a-uuid"],
        title: "Invalid Draft",
      }),
    ).rejects.toThrow();
    expect(createAuthorWorkDraft).not.toHaveBeenCalled();
  });
});

describe("draft Work editor repository", () => {
  const workId = "10000000-0000-4000-8000-000000000001";

  it("maps owner-scoped draft metadata, tags and chapter content", async () => {
    const source: DraftWorkEditorRepositoryDataSource = {
      getDraftWorkEditor: vi.fn(async () => ({
        category: {
          description: null,
          id: "21000000-0000-4000-8000-000000000001",
          name: "小说",
          slug: "fiction",
        },
        chapters: [
          {
            content: { content: [], type: "doc" },
            content_schema_version: 1,
            created_at: timestamp,
            id: "11000000-0000-4000-8000-000000000001",
            position: 1,
            published_at: null,
            slug: "chapter-one",
            status: "draft",
            title: "第一章",
            updated_at: timestamp,
            work_id: workId,
          },
        ],
        tags: [
          {
            canonical_tag_id: null,
            description: null,
            governance_state: "canonical",
            id: "22000000-0000-4000-8000-000000000001",
            name: "Harbor",
            slug: "harbor",
            tag_type: "additional",
          },
        ],
        work: {
          category_id: "21000000-0000-4000-8000-000000000001",
          created_at: timestamp,
          id: workId,
          published_at: null,
          slug: "work-draft",
          status: "draft",
          summary: "Draft summary",
          title: "Draft Work",
          updated_at: timestamp,
        },
      })),
      publishDraftWork: vi.fn(async () => null),
      saveDraftWorkBody: vi.fn(async () => null),
    };

    await expect(
      createDraftWorkEditorRepository(source).getDraftWorkEditor(workId),
    ).resolves.toMatchObject({
      category: { name: "小说" },
      chapters: [{ status: "draft", title: "第一章" }],
      tags: [{ name: "Harbor" }],
      work: { status: "draft", title: "Draft Work" },
    });
  });

  it("returns Not Found data for an unknown or non-owner draft", async () => {
    const source: DraftWorkEditorRepositoryDataSource = {
      getDraftWorkEditor: vi.fn(async () => null),
      publishDraftWork: vi.fn(async () => null),
      saveDraftWorkBody: vi.fn(async () => null),
    };

    await expect(
      createDraftWorkEditorRepository(source).getDraftWorkEditor(workId),
    ).resolves.toBeNull();
  });

  it("rejects an invalid URL identifier before querying the provider", async () => {
    const getDraftWorkEditor = vi.fn();

    await expect(
      createDraftWorkEditorRepository({
        getDraftWorkEditor,
        publishDraftWork: vi.fn(async () => null),
        saveDraftWorkBody: vi.fn(async () => null),
      }).getDraftWorkEditor("not-a-uuid"),
    ).rejects.toThrow();
    expect(getDraftWorkEditor).not.toHaveBeenCalled();
  });

  it("creates the first chapter when saving a draft body without existing chapters", async () => {
    const source: DraftWorkEditorRepositoryDataSource = {
      getDraftWorkEditor: vi.fn(async () => null),
      publishDraftWork: vi.fn(async () => null),
      saveDraftWorkBody: vi.fn(async () => ({
        chapter: {
          content: { content: [], type: "doc" },
          content_schema_version: 1,
          created_at: timestamp,
          id: "11000000-0000-4000-8000-000000000002",
          position: 1,
          published_at: null,
          slug: "chapter-1",
          status: "draft",
          title: "第一章",
          updated_at: timestamp,
          work_id: workId,
        },
        created: true,
      })),
    };

    await expect(
      createDraftWorkEditorRepository(source).saveDraftWorkBody({
        body: { content: [], type: "doc" },
        bodyPlainText: "第一段",
        workId,
      }),
    ).resolves.toMatchObject({
      chapter: { position: 1, slug: "chapter-1", title: "第一章" },
      created: true,
    });
  });

  it("updates the same chapter when saving a draft body for an existing first chapter", async () => {
    const saveDraftWorkBody = vi.fn(async () => ({
      chapter: {
        content: { content: [], type: "doc" },
        content_schema_version: 1,
        created_at: timestamp,
        id: "11000000-0000-4000-8000-000000000001",
        position: 1,
        published_at: null,
        slug: "chapter-one",
        status: "draft",
        title: "第一章",
        updated_at: timestamp,
        work_id: workId,
      },
      created: false,
    }));

    await expect(
      createDraftWorkEditorRepository({
        getDraftWorkEditor: vi.fn(async () => null),
        publishDraftWork: vi.fn(async () => null),
        saveDraftWorkBody,
      }).saveDraftWorkBody({
        body: { content: [], type: "doc" },
        bodyPlainText: "更新正文",
        workId,
      }),
    ).resolves.toMatchObject({
      chapter: { id: "11000000-0000-4000-8000-000000000001" },
      created: false,
    });
    expect(saveDraftWorkBody).toHaveBeenCalledWith({
      body: { content: [], type: "doc" },
      bodyPlainText: "更新正文",
      workId,
    });
  });

  it("rejects an invalid work identifier before saving draft content", async () => {
    const saveDraftWorkBody = vi.fn();

    await expect(
      createDraftWorkEditorRepository({
        getDraftWorkEditor: vi.fn(async () => null),
        publishDraftWork: vi.fn(async () => null),
        saveDraftWorkBody,
      }).saveDraftWorkBody({
        body: { content: [], type: "doc" },
        bodyPlainText: "",
        workId: "not-a-uuid",
      }),
    ).rejects.toThrow();
    expect(saveDraftWorkBody).not.toHaveBeenCalled();
  });

  it("maps a publish result into provider-independent work and chapter values", async () => {
    const publishDraftWork = vi.fn(async () => ({
      chapter: {
        content: { content: [], type: "doc" },
        content_schema_version: 1,
        created_at: timestamp,
        id: "11000000-0000-4000-8000-000000000003",
        position: 1,
        published_at: timestamp,
        slug: "chapter-1",
        status: "published",
        title: "第一章",
        updated_at: timestamp,
        work_id: workId,
      },
      work: {
        category_id: null,
        created_at: timestamp,
        id: workId,
        published_at: timestamp,
        slug: "harbor-draft",
        status: "published",
        summary: "Published summary",
        title: "Harbor Draft",
        updated_at: timestamp,
      },
    }));

    await expect(
      createDraftWorkEditorRepository({
        getDraftWorkEditor: vi.fn(async () => null),
        publishDraftWork,
        saveDraftWorkBody: vi.fn(async () => null),
      }).publishDraftWork({
        body: { content: [], type: "doc" },
        bodyPlainText: "准备发布",
        workId,
      }),
    ).resolves.toMatchObject({
      chapter: { publishedAt: new Date(timestamp), status: "published" },
      work: { publishedAt: new Date(timestamp), status: "published" },
    });
  });
});
