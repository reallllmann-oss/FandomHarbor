import type { TrustedAccessContext } from "@fandom-harbor/auth";

export type ContentStatus = "archived" | "draft" | "published";
export type ContentTagType =
  "additional" | "character" | "fandom" | "relationship";
export type ContentTagGovernanceState =
  "alias" | "canonical" | "deprecated" | "pending";

export type JsonValue =
  boolean | null | number | string | JsonValue[] | { [key: string]: JsonValue };
export type ContentDocument = Readonly<Record<string, JsonValue>>;

export interface Work {
  categoryId: string | null;
  createdAt: Date;
  id: string;
  publishedAt: Date | null;
  slug: string;
  status: ContentStatus;
  summary: string;
  title: string;
  updatedAt: Date;
}

export interface Chapter {
  content: ContentDocument;
  contentSchemaVersion: number;
  createdAt: Date;
  id: string;
  position: number;
  publishedAt: Date | null;
  slug: string;
  status: ContentStatus;
  title: string;
  updatedAt: Date;
  workId: string;
}

export interface Article {
  categoryId: string | null;
  content: ContentDocument;
  contentSchemaVersion: number;
  createdAt: Date;
  id: string;
  publishedAt: Date | null;
  slug: string;
  status: ContentStatus;
  summary: string;
  title: string;
  updatedAt: Date;
}

export interface ContentCategory {
  description: string | null;
  id: string;
  name: string;
  slug: string;
}

export interface ContentTag {
  canonicalTagId: string | null;
  description: string | null;
  governanceState: ContentTagGovernanceState;
  id: string;
  name: string;
  slug: string;
  tagType: ContentTagType;
}

export interface ContentPageInput {
  limit: number;
  offset: number;
}

export interface StudioContentPageInput extends ContentPageInput {
  ownerUserId: string;
}

export interface StudioWorkDetailInput {
  ownerUserId: string;
  workId: string;
}

export interface StudioArticleDetailInput {
  articleId: string;
  ownerUserId: string;
}

export interface StudioWorkDetail {
  chapters: Chapter[];
  work: Work;
}

export interface StudioArticleDetail {
  article: Article;
  categoryName: string | null;
  relatedWorkTitle: string | null;
  tagNames: string[];
}

export interface DraftWorkEditorData {
  category: ContentCategory | null;
  chapters: Chapter[];
  tags: ContentTag[];
  work: Work;
}

export interface DraftWorkEditorStore {
  getDraftWorkEditor(workId: string): Promise<DraftWorkEditorData | null>;
  publishWorkChapters?(
    input: PublishWorkChaptersInput,
  ): Promise<DraftWorkEditorData | null>;
  saveDraftWorkBody(
    input: SaveDraftWorkBodyInput,
  ): Promise<SaveDraftWorkBodyResult | null>;
  saveWorkChapter?(
    input: SaveWorkChapterInput,
  ): Promise<SaveDraftWorkBodyResult | null>;
  saveWorkTags?(input: SaveWorkTagsInput): Promise<ContentTag[] | null>;
  publishDraftWork(
    input: PublishDraftWorkInput,
  ): Promise<PublishDraftWorkResult | null>;
}

export interface SaveWorkChapterInput {
  body: ContentDocument;
  bodyPlainText: string;
  chapterId: string | null;
  title: string;
  workId: string;
}

export interface SaveWorkTagsInput {
  tagNames: string[];
  workId: string;
}

export interface PublishWorkChaptersInput {
  chapterIds: string[];
  workId: string;
}

export interface SaveDraftWorkBodyInput {
  body: ContentDocument;
  bodyPlainText: string;
  workId: string;
}

export interface SaveDraftWorkBodyResult {
  chapter: Chapter;
  created: boolean;
}

export interface PublishDraftWorkInput {
  body: ContentDocument;
  bodyPlainText: string;
  workId: string;
}

export interface PublishDraftWorkResult {
  chapter: Chapter;
  work: Work;
}

export interface CreateWorkStoreInput {
  categoryId?: string | null;
  ownerUserId: string;
  slug: string;
  summary?: string;
  title: string;
}

export interface CreateWorkDraftInput {
  categoryId: string | null;
  summary: string;
  tagIds: string[];
  title: string;
}

export interface AuthorWorkDraftStore {
  createAuthorWorkDraft(input: CreateWorkDraftInput): Promise<Work>;
}

export interface CreateChapterStoreInput {
  content: ContentDocument;
  contentSchemaVersion: number;
  position: number;
  slug: string;
  title: string;
  workId: string;
}

export interface CreateArticleStoreInput {
  categoryId?: string | null;
  content: ContentDocument;
  contentSchemaVersion: number;
  ownerUserId: string;
  slug: string;
  summary?: string;
  title: string;
}

export interface ContentStore {
  createArticle(input: CreateArticleStoreInput): Promise<Article>;
  createChapter(input: CreateChapterStoreInput): Promise<Chapter>;
  createWork(input: CreateWorkStoreInput): Promise<Work>;
  getPublishedArticleBySlug(slug: string): Promise<Article | null>;
  getPublishedWorkBySlug(slug: string): Promise<Work | null>;
  listCategories(): Promise<ContentCategory[]>;
  listPublishedArticles(input: ContentPageInput): Promise<Article[]>;
  listPublishedChapters(workId: string): Promise<Chapter[]>;
  listPublishedWorks(input: ContentPageInput): Promise<Work[]>;
  listWorkTags?(workId: string): Promise<ContentTag[]>;
  listTags(): Promise<ContentTag[]>;
}

export interface StudioContentStore {
  getArticle(
    input: StudioArticleDetailInput,
  ): Promise<StudioArticleDetail | null>;
  getWork(input: StudioWorkDetailInput): Promise<StudioWorkDetail | null>;
  listArticles(input: StudioContentPageInput): Promise<Article[]>;
  listWorks(input: StudioContentPageInput): Promise<Work[]>;
}

export class ContentAuthorizationError extends Error {
  constructor(message = "Content operation is not authorized") {
    super(message);
    this.name = "ContentAuthorizationError";
  }
}

function requireCapability(
  context: TrustedAccessContext,
  capability: "archive:read" | "work:author",
) {
  if (!context.capabilities.has(capability)) {
    throw new ContentAuthorizationError();
  }
}

function page(input: Partial<ContentPageInput>): ContentPageInput {
  const limit = input.limit ?? 20;
  const offset = input.offset ?? 0;

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new RangeError("Content page limit must be between 1 and 100");
  }
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new RangeError("Content page offset must be a non-negative integer");
  }

  return { limit, offset };
}

export function createContentService(store: ContentStore) {
  return {
    async createArticle(
      context: TrustedAccessContext,
      input: Omit<CreateArticleStoreInput, "ownerUserId">,
    ) {
      requireCapability(context, "work:author");
      return store.createArticle({
        ...input,
        ownerUserId: context.identity.id,
      });
    },

    async createChapter(
      context: TrustedAccessContext,
      input: CreateChapterStoreInput,
    ) {
      requireCapability(context, "work:author");
      return store.createChapter(input);
    },

    async createWork(
      context: TrustedAccessContext,
      input: Omit<CreateWorkStoreInput, "ownerUserId">,
    ) {
      requireCapability(context, "work:author");
      return store.createWork({ ...input, ownerUserId: context.identity.id });
    },

    async getPublishedArticleBySlug(
      context: TrustedAccessContext,
      slug: string,
    ) {
      requireCapability(context, "archive:read");
      return store.getPublishedArticleBySlug(slug);
    },

    async getPublishedWorkBySlug(context: TrustedAccessContext, slug: string) {
      requireCapability(context, "archive:read");
      return store.getPublishedWorkBySlug(slug);
    },

    async listCategories(context: TrustedAccessContext) {
      requireCapability(context, "archive:read");
      return store.listCategories();
    },

    async listPublishedArticles(
      context: TrustedAccessContext,
      input: Partial<ContentPageInput> = {},
    ) {
      requireCapability(context, "archive:read");
      return store.listPublishedArticles(page(input));
    },

    async listPublishedChapters(context: TrustedAccessContext, workId: string) {
      requireCapability(context, "archive:read");
      return store.listPublishedChapters(workId);
    },

    async listPublishedWorks(
      context: TrustedAccessContext,
      input: Partial<ContentPageInput> = {},
    ) {
      requireCapability(context, "archive:read");
      return store.listPublishedWorks(page(input));
    },

    async listWorkTags(context: TrustedAccessContext, workId: string) {
      requireCapability(context, "archive:read");
      return store.listWorkTags ? store.listWorkTags(workId) : [];
    },

    async listTags(context: TrustedAccessContext) {
      requireCapability(context, "archive:read");
      return store.listTags();
    },
  };
}

export function createWorkDraftService(store: AuthorWorkDraftStore) {
  return {
    async createWorkDraft(
      context: TrustedAccessContext,
      input: CreateWorkDraftInput,
    ) {
      requireCapability(context, "work:author");
      return store.createAuthorWorkDraft(input);
    },
  };
}

export function createDraftWorkEditorService(store: DraftWorkEditorStore) {
  return {
    async getDraftWorkEditor(context: TrustedAccessContext, workId: string) {
      requireCapability(context, "work:author");
      return store.getDraftWorkEditor(workId);
    },

    async saveDraftWorkBody(
      context: TrustedAccessContext,
      input: SaveDraftWorkBodyInput,
    ) {
      requireCapability(context, "work:author");
      return store.saveDraftWorkBody(input);
    },

    async publishDraftWork(
      context: TrustedAccessContext,
      input: PublishDraftWorkInput,
    ) {
      requireCapability(context, "work:author");
      return store.publishDraftWork(input);
    },
    async publishWorkChapters(
      context: TrustedAccessContext,
      input: PublishWorkChaptersInput,
    ) {
      requireCapability(context, "work:author");
      if (!store.publishWorkChapters) {
        throw new Error("Chapter publication management is unavailable");
      }
      return store.publishWorkChapters(input);
    },
    async saveWorkChapter(
      context: TrustedAccessContext,
      input: SaveWorkChapterInput,
    ) {
      requireCapability(context, "work:author");
      if (!store.saveWorkChapter) {
        throw new Error("Chapter management is unavailable");
      }
      return store.saveWorkChapter(input);
    },
    async saveWorkTags(
      context: TrustedAccessContext,
      input: SaveWorkTagsInput,
    ) {
      requireCapability(context, "work:author");
      if (!store.saveWorkTags) {
        throw new Error("Tag management is unavailable");
      }
      return store.saveWorkTags(input);
    },
  };
}

export function createStudioContentService(store: StudioContentStore) {
  return {
    async getArticle(context: TrustedAccessContext, articleId: string) {
      requireCapability(context, "work:author");
      return store.getArticle({
        articleId,
        ownerUserId: context.identity.id,
      });
    },

    async getWork(context: TrustedAccessContext, workId: string) {
      requireCapability(context, "work:author");
      return store.getWork({
        ownerUserId: context.identity.id,
        workId,
      });
    },

    async listArticles(
      context: TrustedAccessContext,
      input: Partial<ContentPageInput> = {},
    ) {
      requireCapability(context, "work:author");
      return store.listArticles({
        ...page(input),
        ownerUserId: context.identity.id,
      });
    },

    async listWorks(
      context: TrustedAccessContext,
      input: Partial<ContentPageInput> = {},
    ) {
      requireCapability(context, "work:author");
      return store.listWorks({
        ...page(input),
        ownerUserId: context.identity.id,
      });
    },
  };
}
