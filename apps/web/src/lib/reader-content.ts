import type {
  AuthCookieStore,
  TrustedAccessContext,
} from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseContentRepository } from "@fandom-harbor/database";
import {
  createContentService,
  type Article,
  type Chapter,
  type ContentStore,
  type ContentTag,
  type Work,
} from "@fandom-harbor/services";

import { readerFixtureStore } from "./reader-content-fixtures";

export interface WorkReadingData {
  chapters: Chapter[];
  tags: ContentTag[];
  work: Work;
}

export interface ChapterReadingData extends WorkReadingData {
  chapter: Chapter;
  nextChapter: Chapter | null;
  previousChapter: Chapter | null;
}

export interface ReaderContentGateway {
  getArticle(slug: string): Promise<Article | null>;
  getChapter(
    workSlug: string,
    chapterSlug: string,
  ): Promise<ChapterReadingData | null>;
  getWork(slug: string): Promise<WorkReadingData | null>;
  listArticles(): Promise<Article[]>;
  listWorks(): Promise<Work[]>;
}

export function createReaderContentGateway(
  access: TrustedAccessContext,
  store: ContentStore = readerFixtureStore,
): ReaderContentGateway {
  const service = createContentService(store);

  async function getWork(slug: string): Promise<WorkReadingData | null> {
    const work = await service.getPublishedWorkBySlug(access, slug);
    if (!work) return null;

    const [chapters, tags] = await Promise.all([
      service.listPublishedChapters(access, work.id),
      service.listWorkTags(access, work.id),
    ]);
    return { chapters, tags, work };
  }

  return {
    getArticle(slug) {
      return service.getPublishedArticleBySlug(access, slug);
    },
    async getChapter(workSlug, chapterSlug) {
      const readingData = await getWork(workSlug);
      if (!readingData) return null;

      const chapterIndex = readingData.chapters.findIndex(
        (chapter) => chapter.slug === chapterSlug,
      );
      if (chapterIndex < 0) return null;

      return {
        ...readingData,
        chapter: readingData.chapters[chapterIndex]!,
        nextChapter: readingData.chapters[chapterIndex + 1] ?? null,
        previousChapter: readingData.chapters[chapterIndex - 1] ?? null,
      };
    },
    getWork,
    listArticles() {
      return service.listPublishedArticles(access, { limit: 20, offset: 0 });
    },
    listWorks() {
      return service.listPublishedWorks(access, { limit: 20, offset: 0 });
    },
  };
}

export function createHybridReaderContentGateway(
  access: TrustedAccessContext,
  runtime: PublicRuntimeConfig,
  cookies: AuthCookieStore,
): ReaderContentGateway {
  const fixtureGateway = createReaderContentGateway(access, readerFixtureStore);
  const runtimeGateway = createReaderContentGateway(
    access,
    createSupabaseContentRepository(runtime, cookies),
  );

  return {
    async getArticle(slug) {
      return (
        (await runtimeGateway.getArticle(slug)) ??
        fixtureGateway.getArticle(slug)
      );
    },
    async getChapter(workSlug, chapterSlug) {
      return (
        (await runtimeGateway.getChapter(workSlug, chapterSlug)) ??
        fixtureGateway.getChapter(workSlug, chapterSlug)
      );
    },
    async getWork(slug) {
      return (
        (await runtimeGateway.getWork(slug)) ?? fixtureGateway.getWork(slug)
      );
    },
    async listArticles() {
      const merged = [
        ...(await runtimeGateway.listArticles()),
        ...(await fixtureGateway.listArticles()),
      ];
      return Array.from(
        new Map(merged.map((article) => [article.slug, article])).values(),
      ).sort(
        (left, right) =>
          right.publishedAt!.getTime() - left.publishedAt!.getTime(),
      );
    },
    async listWorks() {
      const merged = [
        ...(await runtimeGateway.listWorks()),
        ...(await fixtureGateway.listWorks()),
      ];
      return Array.from(
        new Map(merged.map((work) => [work.slug, work])).values(),
      ).sort(
        (left, right) =>
          right.publishedAt!.getTime() - left.publishedAt!.getTime(),
      );
    },
  };
}
