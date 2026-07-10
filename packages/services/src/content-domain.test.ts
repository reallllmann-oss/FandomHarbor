import {
  createTrustedAccessContext,
  type TrustedIdentity,
} from "@fandom-harbor/auth";
import { describe, expect, it, vi } from "vitest";

import {
  ContentAuthorizationError,
  createContentService,
  createDraftWorkEditorService,
  createStudioContentService,
  createWorkDraftService,
  type SaveDraftWorkBodyInput,
  type AuthorWorkDraftStore,
  type ContentStore,
  type DraftWorkEditorStore,
  type StudioContentStore,
} from "./content-domain";

const identity: TrustedIdentity = {
  id: "00000000-0000-4000-8000-000000000001",
};

function store(): ContentStore {
  return {
    createArticle: vi.fn(),
    createChapter: vi.fn(),
    createWork: vi.fn(async (input) => ({
      categoryId: input.categoryId ?? null,
      createdAt: new Date("2026-06-30T00:00:00Z"),
      id: "work-id",
      publishedAt: null,
      slug: input.slug,
      status: "draft" as const,
      summary: input.summary ?? "",
      title: input.title,
      updatedAt: new Date("2026-06-30T00:00:00Z"),
    })),
    getPublishedArticleBySlug: vi.fn(),
    getPublishedWorkBySlug: vi.fn(),
    listCategories: vi.fn(async () => []),
    listPublishedArticles: vi.fn(async () => []),
    listPublishedChapters: vi.fn(async () => []),
    listPublishedWorks: vi.fn(async () => []),
    listTags: vi.fn(async () => []),
  };
}

describe("content service", () => {
  it("injects trusted author ownership instead of accepting it from input", async () => {
    const contentStore = store();
    const service = createContentService(contentStore);
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });

    await service.createWork(context, {
      slug: "harbor-lights",
      title: "Harbor Lights",
    });

    expect(contentStore.createWork).toHaveBeenCalledWith({
      ownerUserId: identity.id,
      slug: "harbor-lights",
      title: "Harbor Lights",
    });
  });

  it("denies content reads without active archive membership", async () => {
    const service = createContentService(store());
    const context = createTrustedAccessContext({
      identity,
      membershipState: "suspended",
      roles: ["author"],
    });

    await expect(service.listPublishedWorks(context)).rejects.toBeInstanceOf(
      ContentAuthorizationError,
    );
  });

  it("bounds catalog pagination before calling the repository", async () => {
    const contentStore = store();
    const service = createContentService(contentStore);
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(
      service.listPublishedWorks(context, { limit: 101 }),
    ).rejects.toBeInstanceOf(RangeError);
    expect(contentStore.listPublishedWorks).not.toHaveBeenCalled();
  });
});

describe("work draft service", () => {
  function draftStore(): AuthorWorkDraftStore {
    return {
      createAuthorWorkDraft: vi.fn(async (input) => ({
        categoryId: input.categoryId,
        createdAt: new Date("2026-07-01T00:00:00Z"),
        id: "10000000-0000-4000-8000-000000000001",
        publishedAt: null,
        slug: "work-10000000-0000-4000-8000-000000000001",
        status: "draft" as const,
        summary: input.summary,
        title: input.title,
        updatedAt: new Date("2026-07-01T00:00:00Z"),
      })),
    };
  }

  it("allows an Author to create a draft without accepting owner or status input", async () => {
    const contentStore = draftStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });
    const input = {
      categoryId: "21000000-0000-4000-8000-000000000001",
      summary: "Draft summary",
      tagIds: ["22000000-0000-4000-8000-000000000001"],
      title: "Harbor Draft",
    };

    await expect(
      createWorkDraftService(contentStore).createWorkDraft(context, input),
    ).resolves.toMatchObject({
      publishedAt: null,
      status: "draft",
    });
    expect(contentStore.createAuthorWorkDraft).toHaveBeenCalledWith(input);
  });

  it("denies a non-Author before the draft repository is called", async () => {
    const contentStore = draftStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(
      createWorkDraftService(contentStore).createWorkDraft(context, {
        categoryId: null,
        summary: "",
        tagIds: [],
        title: "Denied Draft",
      }),
    ).rejects.toBeInstanceOf(ContentAuthorizationError);
    expect(contentStore.createAuthorWorkDraft).not.toHaveBeenCalled();
  });
});

describe("draft Work editor service", () => {
  function editorStore(): DraftWorkEditorStore {
    return {
      getDraftWorkEditor: vi.fn(async () => null),
      publishDraftWork: vi.fn(async () => null),
      saveDraftWorkBody: vi.fn(async () => null),
    };
  }

  it("allows an Author to request a draft through the owner-scoped store", async () => {
    const contentStore = editorStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });

    await createDraftWorkEditorService(contentStore).getDraftWorkEditor(
      context,
      "10000000-0000-4000-8000-000000000001",
    );

    expect(contentStore.getDraftWorkEditor).toHaveBeenCalledWith(
      "10000000-0000-4000-8000-000000000001",
    );
  });

  it("denies a non-Author before reading draft content", async () => {
    const contentStore = editorStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(
      createDraftWorkEditorService(contentStore).getDraftWorkEditor(
        context,
        "10000000-0000-4000-8000-000000000001",
      ),
    ).rejects.toBeInstanceOf(ContentAuthorizationError);
    expect(contentStore.getDraftWorkEditor).not.toHaveBeenCalled();
  });

  it("allows an Author to save draft body content through the owner-scoped store", async () => {
    const contentStore = editorStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });
    const input: SaveDraftWorkBodyInput = {
      body: { content: [], type: "doc" },
      bodyPlainText: "第一段",
      workId: "10000000-0000-4000-8000-000000000001",
    };

    await createDraftWorkEditorService(contentStore).saveDraftWorkBody(
      context,
      input,
    );

    expect(contentStore.saveDraftWorkBody).toHaveBeenCalledWith(input);
  });

  it("denies a non-Author before saving draft body content", async () => {
    const contentStore = editorStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(
      createDraftWorkEditorService(contentStore).saveDraftWorkBody(context, {
        body: { content: [], type: "doc" },
        bodyPlainText: "",
        workId: "10000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(ContentAuthorizationError);
    expect(contentStore.saveDraftWorkBody).not.toHaveBeenCalled();
  });

  it("allows an Author to publish a draft through the same owner-scoped store", async () => {
    const contentStore = editorStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });
    const input = {
      body: { content: [], type: "doc" },
      bodyPlainText: "准备发布",
      workId: "10000000-0000-4000-8000-000000000001",
    };

    await createDraftWorkEditorService(contentStore).publishDraftWork(
      context,
      input,
    );

    expect(contentStore.publishDraftWork).toHaveBeenCalledWith(input);
  });

  it("denies a non-Author before publishing draft content", async () => {
    const contentStore = editorStore();
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(
      createDraftWorkEditorService(contentStore).publishDraftWork(context, {
        body: { content: [], type: "doc" },
        bodyPlainText: "nope",
        workId: "10000000-0000-4000-8000-000000000001",
      }),
    ).rejects.toBeInstanceOf(ContentAuthorizationError);
    expect(contentStore.publishDraftWork).not.toHaveBeenCalled();
  });
});

describe("studio content service", () => {
  function studioStore(): StudioContentStore {
    return {
      getArticle: vi.fn(async () => null),
      getWork: vi.fn(async () => null),
      listArticles: vi.fn(async () => []),
      listWorks: vi.fn(async () => []),
    };
  }

  it("injects the trusted author identity into Studio list queries", async () => {
    const contentStore = studioStore();
    const service = createStudioContentService(contentStore);
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });

    await service.listWorks(context, { limit: 25 });

    expect(contentStore.listWorks).toHaveBeenCalledWith({
      limit: 25,
      offset: 0,
      ownerUserId: identity.id,
    });
  });

  it("injects the trusted author identity into Studio detail queries", async () => {
    const contentStore = studioStore();
    const service = createStudioContentService(contentStore);
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });

    await service.getArticle(context, "article-id");
    await service.getWork(context, "work-id");

    expect(contentStore.getArticle).toHaveBeenCalledWith({
      articleId: "article-id",
      ownerUserId: identity.id,
    });
    expect(contentStore.getWork).toHaveBeenCalledWith({
      ownerUserId: identity.id,
      workId: "work-id",
    });
  });

  it("denies Studio lists without the existing author capability", async () => {
    const service = createStudioContentService(studioStore());
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(service.listArticles(context)).rejects.toBeInstanceOf(
      ContentAuthorizationError,
    );
    await expect(
      service.getArticle(context, "article-id"),
    ).rejects.toBeInstanceOf(ContentAuthorizationError);
    await expect(service.getWork(context, "work-id")).rejects.toBeInstanceOf(
      ContentAuthorizationError,
    );
  });
});
