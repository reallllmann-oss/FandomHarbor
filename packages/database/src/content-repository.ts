import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import type {
  Article,
  AuthorWorkDraftStore,
  Chapter,
  ContentCategory,
  ContentPageInput,
  ContentStore,
  ContentTag,
  CreateArticleStoreInput,
  CreateChapterStoreInput,
  CreateWorkStoreInput,
  CreateWorkDraftInput,
  DraftWorkEditorData,
  DraftWorkEditorStore,
  PublishDraftWorkInput,
  PublishDraftWorkResult,
  PublishWorkChaptersInput,
  SaveDraftWorkBodyInput,
  SaveDraftWorkBodyResult,
  SaveWorkChapterInput,
  SaveWorkTagsInput,
  StudioContentStore,
  StudioArticleDetailInput,
  StudioContentPageInput,
  StudioWorkDetailInput,
  Work,
} from "@fandom-harbor/services";
import { z } from "zod";

import { DatabaseAccessError } from "./access-context-repository";
import { createServerSupabaseClient } from "./server-client";

const uuid = z.string().uuid();
const timestamp = z.string().datetime({ offset: true });
const nullableTimestamp = timestamp.nullable();
const status = z.enum(["archived", "draft", "published"]);
const contentDocument = z.record(z.string(), z.json());

const workRow = z.object({
  category_id: uuid.nullable(),
  created_at: timestamp,
  id: uuid,
  published_at: nullableTimestamp,
  slug: z.string(),
  status,
  summary: z.string(),
  title: z.string(),
  updated_at: timestamp,
});

const chapterRow = z.object({
  content: contentDocument,
  content_schema_version: z.number().int().positive(),
  created_at: timestamp,
  id: uuid,
  position: z.number().int().positive(),
  published_at: nullableTimestamp,
  slug: z.string(),
  status,
  title: z.string(),
  updated_at: timestamp,
  work_id: uuid,
});

const articleRow = workRow.extend({
  content: contentDocument,
  content_schema_version: z.number().int().positive(),
});

const categoryRow = z.object({
  description: z.string().nullable(),
  id: uuid,
  name: z.string(),
  slug: z.string(),
});

const tagRow = z.object({
  canonical_tag_id: uuid.nullable(),
  description: z.string().nullable(),
  governance_state: z.enum(["alias", "canonical", "deprecated", "pending"]),
  id: uuid,
  name: z.string(),
  slug: z.string(),
  tag_type: z.enum(["additional", "character", "fandom", "relationship"]),
});

const createWorkDraftInput = z
  .object({
    categoryId: uuid.nullable(),
    summary: z.string().max(5000),
    tagIds: z.array(uuid).max(100),
    title: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .refine((value) => !/[\u0000-\u001f\u007f]/u.test(value)),
  })
  .strict();

const draftWorkEditorRow = z.object({
  category: categoryRow.nullable(),
  chapters: z.array(chapterRow),
  tags: z.array(tagRow),
  work: workRow,
});

const saveDraftWorkBodyInput = z
  .object({
    body: contentDocument,
    bodyPlainText: z.string(),
    workId: uuid,
  })
  .strict();

const saveDraftWorkBodyRow = z.object({
  chapter: chapterRow,
  created: z.boolean(),
});

const publishDraftWorkInput = z
  .object({
    body: contentDocument,
    bodyPlainText: z.string(),
    workId: uuid,
  })
  .strict();

const publishDraftWorkRow = z.object({
  chapter: chapterRow,
  work: workRow,
});
const saveWorkChapterInput = z.object({
  body: contentDocument,
  bodyPlainText: z.string(),
  chapterId: uuid.nullable(),
  title: z.string().trim().min(1).max(300),
  workId: uuid,
});
const saveWorkTagsInput = z.object({
  tagNames: z.array(z.string().trim().min(1).max(80)).max(20),
  workId: uuid,
});
const publishWorkChaptersInput = z.object({
  chapterIds: z.array(uuid).min(1).max(100),
  workId: uuid,
});

const WORK_COLUMNS =
  "id,category_id,title,slug,summary,status,published_at,created_at,updated_at";
const CHAPTER_COLUMNS =
  "id,work_id,position,title,slug,status,content,content_schema_version,published_at,created_at,updated_at";
const ARTICLE_COLUMNS =
  "id,category_id,title,slug,summary,status,content,content_schema_version,published_at,created_at,updated_at";
const CATEGORY_COLUMNS = "id,name,slug,description";
const TAG_COLUMNS =
  "id,name,slug,tag_type,governance_state,canonical_tag_id,description";

function date(value: string) {
  return new Date(value);
}

function nullableDate(value: string | null) {
  return value === null ? null : date(value);
}

function mapWork(input: unknown): Work {
  const row = workRow.parse(input);
  return {
    categoryId: row.category_id,
    createdAt: date(row.created_at),
    id: row.id,
    publishedAt: nullableDate(row.published_at),
    slug: row.slug,
    status: row.status,
    summary: row.summary,
    title: row.title,
    updatedAt: date(row.updated_at),
  };
}

function mapChapter(input: unknown): Chapter {
  const row = chapterRow.parse(input);
  return {
    content: row.content,
    contentSchemaVersion: row.content_schema_version,
    createdAt: date(row.created_at),
    id: row.id,
    position: row.position,
    publishedAt: nullableDate(row.published_at),
    slug: row.slug,
    status: row.status,
    title: row.title,
    updatedAt: date(row.updated_at),
    workId: row.work_id,
  };
}

function mapArticle(input: unknown): Article {
  const row = articleRow.parse(input);
  return {
    categoryId: row.category_id,
    content: row.content,
    contentSchemaVersion: row.content_schema_version,
    createdAt: date(row.created_at),
    id: row.id,
    publishedAt: nullableDate(row.published_at),
    slug: row.slug,
    status: row.status,
    summary: row.summary,
    title: row.title,
    updatedAt: date(row.updated_at),
  };
}

function mapCategory(input: unknown): ContentCategory {
  const row = categoryRow.parse(input);
  return {
    description: row.description,
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

function mapTag(input: unknown): ContentTag {
  const row = tagRow.parse(input);
  return {
    canonicalTagId: row.canonical_tag_id,
    description: row.description,
    governanceState: row.governance_state,
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagType: row.tag_type,
  };
}

export interface ContentRepositoryDataSource {
  createArticle(input: CreateArticleStoreInput): Promise<unknown>;
  createChapter(input: CreateChapterStoreInput): Promise<unknown>;
  createWork(input: CreateWorkStoreInput): Promise<unknown>;
  getPublishedArticleBySlug(slug: string): Promise<unknown>;
  getPublishedWorkBySlug(slug: string): Promise<unknown>;
  listCategories(): Promise<unknown>;
  listPublishedArticles(input: ContentPageInput): Promise<unknown>;
  listPublishedChapters(workId: string): Promise<unknown>;
  listPublishedWorks(input: ContentPageInput): Promise<unknown>;
  listWorkTags?(workId: string): Promise<unknown>;
  listTags(): Promise<unknown>;
}

export interface AuthorWorkDraftRepositoryDataSource {
  createAuthorWorkDraft(input: CreateWorkDraftInput): Promise<unknown>;
}

export interface DraftWorkEditorRepositoryDataSource {
  getDraftWorkEditor(workId: string): Promise<unknown>;
  publishDraftWork(input: PublishDraftWorkInput): Promise<unknown>;
  publishWorkChapters?(input: PublishWorkChaptersInput): Promise<unknown>;
  saveDraftWorkBody(input: SaveDraftWorkBodyInput): Promise<unknown>;
  saveWorkChapter?(input: SaveWorkChapterInput): Promise<unknown>;
  saveWorkTags?(input: SaveWorkTagsInput): Promise<unknown>;
}

export function createAuthorWorkDraftRepository(
  source: AuthorWorkDraftRepositoryDataSource,
): AuthorWorkDraftStore {
  return {
    async createAuthorWorkDraft(input) {
      const validated = createWorkDraftInput.parse(input);
      return mapWork(await source.createAuthorWorkDraft(validated));
    },
  };
}

export function createDraftWorkEditorRepository(
  source: DraftWorkEditorRepositoryDataSource,
): DraftWorkEditorStore {
  return {
    async getDraftWorkEditor(workId) {
      const input = uuid.parse(workId);
      const result = await source.getDraftWorkEditor(input);
      if (result === null) return null;

      const row = draftWorkEditorRow.parse(result);
      return {
        category: row.category === null ? null : mapCategory(row.category),
        chapters: row.chapters.map(mapChapter),
        tags: row.tags.map(mapTag),
        work: mapWork(row.work),
      } satisfies DraftWorkEditorData;
    },
    async saveDraftWorkBody(input) {
      const validated = saveDraftWorkBodyInput.parse(input);
      const result = await source.saveDraftWorkBody(validated);
      if (result === null) return null;

      const row = saveDraftWorkBodyRow.parse(result);
      return {
        chapter: mapChapter(row.chapter),
        created: row.created,
      } satisfies SaveDraftWorkBodyResult;
    },
    async publishDraftWork(input) {
      const validated = publishDraftWorkInput.parse(input);
      const result = await source.publishDraftWork(validated);
      if (result === null) return null;

      const row = publishDraftWorkRow.parse(result);
      return {
        chapter: mapChapter(row.chapter),
        work: mapWork(row.work),
      } satisfies PublishDraftWorkResult;
    },
    async publishWorkChapters(input) {
      const validated = publishWorkChaptersInput.parse(input);
      if (!source.publishWorkChapters) {
        throw new Error("Chapter publication management is unavailable");
      }
      const result = await source.publishWorkChapters(validated);
      if (result === null) return null;
      const row = draftWorkEditorRow.parse(result);
      return {
        category: row.category === null ? null : mapCategory(row.category),
        chapters: row.chapters.map(mapChapter),
        tags: row.tags.map(mapTag),
        work: mapWork(row.work),
      };
    },
    async saveWorkChapter(input) {
      const validated = saveWorkChapterInput.parse(input);
      if (!source.saveWorkChapter) {
        throw new Error("Chapter management is unavailable");
      }
      const result = await source.saveWorkChapter(validated);
      if (result === null) return null;
      const row = saveDraftWorkBodyRow.parse(result);
      return { chapter: mapChapter(row.chapter), created: row.created };
    },
    async saveWorkTags(input) {
      const validated = saveWorkTagsInput.parse(input);
      if (!source.saveWorkTags) {
        throw new Error("Tag management is unavailable");
      }
      const result = await source.saveWorkTags(validated);
      if (result === null) return null;
      return z.array(tagRow).parse(result).map(mapTag);
    },
  };
}

export function createContentRepository(
  source: ContentRepositoryDataSource,
): ContentStore {
  return {
    async createArticle(input) {
      return mapArticle(await source.createArticle(input));
    },
    async createChapter(input) {
      return mapChapter(await source.createChapter(input));
    },
    async createWork(input) {
      return mapWork(await source.createWork(input));
    },
    async getPublishedArticleBySlug(slug) {
      const row = await source.getPublishedArticleBySlug(slug);
      return row === null ? null : mapArticle(row);
    },
    async getPublishedWorkBySlug(slug) {
      const row = await source.getPublishedWorkBySlug(slug);
      return row === null ? null : mapWork(row);
    },
    async listCategories() {
      return z
        .array(categoryRow)
        .parse(await source.listCategories())
        .map(mapCategory);
    },
    async listPublishedArticles(input) {
      return z
        .array(articleRow)
        .parse(await source.listPublishedArticles(input))
        .map(mapArticle);
    },
    async listPublishedChapters(workId) {
      return z
        .array(chapterRow)
        .parse(await source.listPublishedChapters(workId))
        .map(mapChapter);
    },
    async listPublishedWorks(input) {
      return z
        .array(workRow)
        .parse(await source.listPublishedWorks(input))
        .map(mapWork);
    },
    async listWorkTags(workId) {
      if (!source.listWorkTags) return [];
      return z
        .array(tagRow)
        .parse(await source.listWorkTags(uuid.parse(workId)))
        .map(mapTag);
    },
    async listTags() {
      return z
        .array(tagRow)
        .parse(await source.listTags())
        .map(mapTag);
    },
  };
}

export function createSupabaseContentRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): ContentStore {
  const client = createServerSupabaseClient(environment, cookies);

  async function result(
    operation: string,
    request: PromiseLike<{ data: unknown; error: unknown }>,
  ): Promise<unknown> {
    const { data, error } = await request;
    if (error) {
      throw new DatabaseAccessError(`Content operation failed: ${operation}`, {
        cause: error,
      });
    }
    return data;
  }

  return createContentRepository({
    createArticle(input) {
      return result(
        "createArticle",
        client
          .from("articles")
          .insert({
            category_id: input.categoryId ?? null,
            content: input.content,
            content_schema_version: input.contentSchemaVersion,
            owner_user_id: input.ownerUserId,
            slug: input.slug,
            summary: input.summary ?? "",
            title: input.title,
          })
          .select(ARTICLE_COLUMNS)
          .single(),
      );
    },
    createChapter(input) {
      return result(
        "createChapter",
        client
          .from("chapters")
          .insert({
            content: input.content,
            content_schema_version: input.contentSchemaVersion,
            position: input.position,
            slug: input.slug,
            title: input.title,
            work_id: input.workId,
          })
          .select(CHAPTER_COLUMNS)
          .single(),
      );
    },
    createWork(input) {
      return result(
        "createWork",
        client
          .from("works")
          .insert({
            category_id: input.categoryId ?? null,
            owner_user_id: input.ownerUserId,
            slug: input.slug,
            summary: input.summary ?? "",
            title: input.title,
          })
          .select(WORK_COLUMNS)
          .single(),
      );
    },
    getPublishedArticleBySlug(slug) {
      return result(
        "getPublishedArticleBySlug",
        client
          .from("articles")
          .select(ARTICLE_COLUMNS)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle(),
      );
    },
    getPublishedWorkBySlug(slug) {
      return result(
        "getPublishedWorkBySlug",
        client
          .from("works")
          .select(WORK_COLUMNS)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle(),
      );
    },
    listCategories() {
      return result(
        "listCategories",
        client
          .from("content_categories")
          .select(CATEGORY_COLUMNS)
          .order("name"),
      );
    },
    listPublishedArticles({ limit, offset }) {
      return result(
        "listPublishedArticles",
        client
          .from("articles")
          .select(ARTICLE_COLUMNS)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .range(offset, offset + limit - 1),
      );
    },
    listPublishedChapters(workId) {
      return result(
        "listPublishedChapters",
        client
          .from("chapters")
          .select(CHAPTER_COLUMNS)
          .eq("work_id", workId)
          .eq("status", "published")
          .order("position"),
      );
    },
    listPublishedWorks({ limit, offset }) {
      return result(
        "listPublishedWorks",
        client
          .from("works")
          .select(WORK_COLUMNS)
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .range(offset, offset + limit - 1),
      );
    },
    async listWorkTags(workId) {
      const links = z
        .array(z.object({ tag_id: uuid }))
        .parse(
          await result(
            "listWorkTags.links",
            client.from("work_tags").select("tag_id").eq("work_id", workId),
          ),
        );
      return links.length === 0
        ? []
        : result(
            "listWorkTags.tags",
            client
              .from("content_tags")
              .select(TAG_COLUMNS)
              .in(
                "id",
                links.map((link) => link.tag_id),
              )
              .neq("governance_state", "deprecated")
              .order("name"),
          );
    },
    listTags() {
      return result(
        "listTags",
        client
          .from("content_tags")
          .select(TAG_COLUMNS)
          .neq("governance_state", "deprecated")
          .order("name"),
      );
    },
  });
}

export function createSupabaseAuthorWorkDraftRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): AuthorWorkDraftStore {
  const client = createServerSupabaseClient(environment, cookies);

  return createAuthorWorkDraftRepository({
    async createAuthorWorkDraft(input) {
      const { data, error } = await client
        .rpc("create_author_work_draft", {
          p_category_id: input.categoryId,
          p_summary: input.summary,
          p_tag_ids: input.tagIds,
          p_title: input.title,
        })
        .single();

      if (error) {
        throw new DatabaseAccessError(
          "Content operation failed: createAuthorWorkDraft",
          { cause: error },
        );
      }

      return data;
    },
  });
}

export function createSupabaseDraftWorkEditorRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): DraftWorkEditorStore {
  const client = createServerSupabaseClient(environment, cookies);

  async function result(
    operation: string,
    request: PromiseLike<{ data: unknown; error: unknown }>,
  ) {
    const { data, error } = await request;
    if (error) {
      throw new DatabaseAccessError(`Content operation failed: ${operation}`, {
        cause: error,
      });
    }
    return data;
  }

  async function loadEditor(workId: string) {
    return result(
      "get_my_studio_work",
      client.rpc("get_my_studio_work", { p_work_id: workId }),
    );
  }

  async function getManagedWork(workId: string) {
    const editor = await loadEditor(workId);
    return editor === null ? null : draftWorkEditorRow.parse(editor).work;
  }

  async function getPrimaryChapter(workId: string) {
    return result(
      "draftWork.primaryChapter",
      client
        .from("chapters")
        .select(CHAPTER_COLUMNS)
        .eq("work_id", workId)
        .order("position")
        .limit(1)
        .maybeSingle(),
    );
  }

  return createDraftWorkEditorRepository({
    async getDraftWorkEditor(workId) {
      return loadEditor(workId);
    },
    async saveDraftWorkBody(input) {
      const work = await getManagedWork(input.workId);
      if (work === null) return null;

      const currentChapter = await getPrimaryChapter(input.workId);

      if (currentChapter === null) {
        const chapter = await result(
          "saveDraftWorkBody.createChapter",
          client
            .from("chapters")
            .insert({
              content: input.body,
              content_schema_version: 1,
              position: 1,
              published_at: null,
              slug: "chapter-1",
              status: "draft",
              title: "第一章",
              work_id: input.workId,
            })
            .select(CHAPTER_COLUMNS)
            .single(),
        );

        return { chapter, created: true };
      }

      const parsedChapter = chapterRow.parse(currentChapter);
      const chapter = await result(
        "saveDraftWorkBody.updateChapter",
        client
          .from("chapters")
          .update({
            content: input.body,
            content_schema_version: parsedChapter.content_schema_version,
          })
          .eq("id", parsedChapter.id)
          .select(CHAPTER_COLUMNS)
          .single(),
      );

      return { chapter, created: false };
    },
    async publishDraftWork(input) {
      const work = await getManagedWork(input.workId);
      if (work === null) return null;

      const currentChapter = await getPrimaryChapter(input.workId);
      const publishedAt = new Date().toISOString();

      let chapter;
      if (currentChapter === null) {
        chapter = await result(
          "publishDraftWork.createChapter",
          client
            .from("chapters")
            .insert({
              content: input.body,
              content_schema_version: 1,
              position: 1,
              published_at: publishedAt,
              slug: "chapter-1",
              status: "published",
              title: "第一章",
              work_id: input.workId,
            })
            .select(CHAPTER_COLUMNS)
            .single(),
        );
      } else {
        const parsedChapter = chapterRow.parse(currentChapter);
        chapter = await result(
          "publishDraftWork.updateChapter",
          client
            .from("chapters")
            .update({
              content: input.body,
              content_schema_version: parsedChapter.content_schema_version,
              published_at: parsedChapter.published_at ?? publishedAt,
              status: "published",
            })
            .eq("id", parsedChapter.id)
            .select(CHAPTER_COLUMNS)
            .single(),
        );
      }

      const publishedWork = await result(
        "publishDraftWork.updateWork",
        client
          .from("works")
          .update({
            published_at: publishedAt,
            status: "published",
          })
          .eq("id", input.workId)
          .select(WORK_COLUMNS)
          .single(),
      );

      return {
        chapter,
        work: publishedWork,
      };
    },
    async saveWorkChapter(input) {
      const work = await getManagedWork(input.workId);
      if (work === null) return null;

      if (input.chapterId === null) {
        const existing = z
          .array(chapterRow)
          .parse(
            await result(
              "saveWorkChapter.list",
              client
                .from("chapters")
                .select(CHAPTER_COLUMNS)
                .eq("work_id", input.workId)
                .order("position"),
            ),
          );
        const position = (existing.at(-1)?.position ?? 0) + 1;
        const chapter = await result(
          "saveWorkChapter.create",
          client
            .from("chapters")
            .insert({
              content: input.body,
              content_schema_version: 1,
              position,
              published_at: null,
              slug: `chapter-${position}`,
              status: "draft",
              title: input.title,
              work_id: input.workId,
            })
            .select(CHAPTER_COLUMNS)
            .single(),
        );
        return { chapter, created: true };
      }

      const chapter = await result(
        "saveWorkChapter.update",
        client
          .from("chapters")
          .update({ content: input.body, title: input.title })
          .eq("id", input.chapterId)
          .eq("work_id", input.workId)
          .select(CHAPTER_COLUMNS)
          .maybeSingle(),
      );
      return chapter === null ? null : { chapter, created: false };
    },
    async saveWorkTags(input) {
      const work = await getManagedWork(input.workId);
      if (work === null) return null;

      const available = z
        .array(tagRow)
        .parse(
          await result(
            "saveWorkTags.available",
            client
              .from("content_tags")
              .select(TAG_COLUMNS)
              .neq("governance_state", "deprecated"),
          ),
        );
      const byName = new Map(
        available.map((tag) => [tag.name.toLocaleLowerCase(), tag]),
      );
      const selected = [];
      for (const name of input.tagNames) {
        const existing = byName.get(name.toLocaleLowerCase());
        if (existing) {
          selected.push(existing);
          continue;
        }
        const created = tagRow.parse(
          await result(
            "saveWorkTags.create",
            client
              .from("content_tags")
              .insert({
                canonical_tag_id: null,
                description: null,
                governance_state: "pending",
                name,
                slug: `custom-${crypto.randomUUID()}`,
                tag_type: "additional",
              })
              .select(TAG_COLUMNS)
              .single(),
          ),
        );
        byName.set(name.toLocaleLowerCase(), created);
        selected.push(created);
      }

      await result(
        "saveWorkTags.clear",
        client.from("work_tags").delete().eq("work_id", input.workId),
      );
      if (selected.length > 0) {
        await result(
          "saveWorkTags.attach",
          client.from("work_tags").insert(
            selected.map((tag) => ({
              tag_id: tag.id,
              work_id: input.workId,
            })),
          ),
        );
      }
      return selected;
    },
    async publishWorkChapters(input) {
      const work = await getManagedWork(input.workId);
      if (work === null) return null;
      const chapters = z
        .array(chapterRow)
        .parse(
          await result(
            "publishWorkChapters.list",
            client
              .from("chapters")
              .select(CHAPTER_COLUMNS)
              .eq("work_id", input.workId)
              .order("position"),
          ),
        );
      const selected = new Set(input.chapterIds);
      if (
        selected.size !== input.chapterIds.length ||
        input.chapterIds.some(
          (id) => !chapters.some((chapter) => chapter.id === id),
        )
      ) {
        throw new DatabaseAccessError("Invalid chapter publication selection");
      }
      const publishedAt = new Date().toISOString();
      for (const chapter of chapters) {
        const shouldPublish = selected.has(chapter.id);
        await result(
          "publishWorkChapters.chapter",
          client
            .from("chapters")
            .update({
              published_at: shouldPublish
                ? (chapter.published_at ?? publishedAt)
                : null,
              status: shouldPublish ? "published" : "draft",
            })
            .eq("id", chapter.id),
        );
      }
      await result(
        "publishWorkChapters.work",
        client
          .from("works")
          .update({
            published_at: workRow.parse(work).published_at ?? publishedAt,
            status: "published",
          })
          .eq("id", input.workId),
      );
      return loadEditor(input.workId);
    },
  });
}

export function createSupabaseStudioContentRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): StudioContentStore {
  const client = createServerSupabaseClient(environment, cookies);

  async function result(
    operation: string,
    request: PromiseLike<{ data: unknown; error: unknown }>,
  ): Promise<unknown> {
    const { data, error } = await request;
    if (error) {
      throw new DatabaseAccessError(`Content operation failed: ${operation}`, {
        cause: error,
      });
    }
    return data;
  }

  return {
    async getArticle(input: StudioArticleDetailInput) {
      const article = await result(
        "studio.getArticle",
        client
          .from("articles")
          .select(ARTICLE_COLUMNS)
          .eq("id", input.articleId)
          .eq("owner_user_id", input.ownerUserId)
          .maybeSingle(),
      );
      if (article === null) return null;
      const parsed = articleRow.parse(article);
      const category =
        parsed.category_id === null
          ? null
          : await result(
              "studio.getArticle.category",
              client
                .from("content_categories")
                .select("name")
                .eq("id", parsed.category_id)
                .maybeSingle(),
            );
      return {
        article: mapArticle(article),
        categoryName:
          z.object({ name: z.string() }).nullable().parse(category)?.name ??
          null,
        relatedWorkTitle: null,
        tagNames: [],
      };
    },
    async getWork(input: StudioWorkDetailInput) {
      const detail = await result(
        "studio.getWork",
        client.rpc("get_my_studio_work", { p_work_id: input.workId }),
      );
      if (detail === null) return null;
      const parsed = draftWorkEditorRow.parse(detail);
      return {
        chapters: parsed.chapters.map(mapChapter),
        work: mapWork(parsed.work),
      };
    },
    async listArticles(input: StudioContentPageInput) {
      return z
        .array(articleRow)
        .parse(
          await result(
            "studio.listArticles",
            client
              .from("articles")
              .select(ARTICLE_COLUMNS)
              .eq("owner_user_id", input.ownerUserId)
              .order("updated_at", { ascending: false })
              .range(input.offset, input.offset + input.limit - 1),
          ),
        )
        .map(mapArticle);
    },
    async listWorks(input: StudioContentPageInput) {
      return z
        .array(workRow)
        .parse(
          await result(
            "studio.listWorks",
            client.rpc("list_my_studio_works", {
              p_limit: input.limit,
              p_offset: input.offset,
            }),
          ),
        )
        .map(mapWork);
    },
  };
}
