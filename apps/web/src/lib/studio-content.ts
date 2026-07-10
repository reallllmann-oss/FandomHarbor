import type { TrustedAccessContext } from "@fandom-harbor/auth";
import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseStudioContentRepository } from "@fandom-harbor/database";
import {
  createStudioContentService,
  type Article,
  type StudioArticleDetail,
  type StudioContentStore,
  type StudioWorkDetail,
  type Work,
} from "@fandom-harbor/services";

import {
  fixtureArticles,
  fixtureChapters,
  fixtureWorks,
} from "./reader-content-fixtures";

const studioFixtureOwnerUserId = "30000000-0000-4000-8000-000000000002";

const categoryNamesById = new Map([
  ["31000000-0000-4000-8000-000000000001", "连载作品"],
  ["31000000-0000-4000-8000-000000000002", "创作随笔"],
]);

export interface StudioContentGateway {
  getArticle(articleId: string): Promise<StudioArticleDetail | null>;
  getWork(workId: string): Promise<StudioWorkDetail | null>;
  listArticles(): Promise<Article[]>;
  listWorks(): Promise<Work[]>;
}

export const studioFixtureStore: StudioContentStore = {
  async getArticle({ articleId, ownerUserId }) {
    if (ownerUserId !== studioFixtureOwnerUserId) return null;

    const article = fixtureArticles.find(
      (candidate) => candidate.id === articleId,
    );
    if (!article) return null;

    return {
      article,
      categoryName:
        article.categoryId === null
          ? null
          : (categoryNamesById.get(article.categoryId) ?? null),
      relatedWorkTitle: null,
      tagNames: [],
    };
  },
  async getWork({ ownerUserId, workId }) {
    if (ownerUserId !== studioFixtureOwnerUserId) return null;

    const work = fixtureWorks.find((candidate) => candidate.id === workId);
    if (!work) return null;

    return {
      chapters: fixtureChapters
        .filter((chapter) => chapter.workId === work.id)
        .toSorted((left, right) => left.position - right.position),
      work,
    };
  },
  async listArticles({ limit, offset, ownerUserId }) {
    if (ownerUserId !== studioFixtureOwnerUserId) return [];

    return fixtureArticles
      .toSorted(
        (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
      )
      .slice(offset, offset + limit);
  },
  async listWorks({ limit, offset, ownerUserId }) {
    if (ownerUserId !== studioFixtureOwnerUserId) return [];

    return fixtureWorks
      .toSorted(
        (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
      )
      .slice(offset, offset + limit);
  },
};

export function createStudioContentGateway(
  access: TrustedAccessContext,
  store: StudioContentStore = studioFixtureStore,
): StudioContentGateway {
  const service = createStudioContentService(store);

  return {
    getArticle(articleId) {
      return service.getArticle(access, articleId);
    },
    getWork(workId) {
      return service.getWork(access, workId);
    },
    listArticles() {
      return service.listArticles(access, { limit: 100, offset: 0 });
    },
    listWorks() {
      return service.listWorks(access, { limit: 100, offset: 0 });
    },
  };
}

export function createRuntimeStudioContentGateway(
  access: TrustedAccessContext,
  runtime: PublicRuntimeConfig,
  cookies: AuthCookieStore,
) {
  return createStudioContentGateway(
    access,
    createSupabaseStudioContentRepository(runtime, cookies),
  );
}
