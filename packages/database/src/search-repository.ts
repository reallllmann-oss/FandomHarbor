import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import type {
  PublicSearchStore,
  SearchAuthorResult,
  SearchWorkResult,
} from "@fandom-harbor/services";
import { z } from "zod";

import { DatabaseAccessError } from "./access-context-repository";
import { createPublicSupabaseClient } from "./public-client";

const searchResponse = z.object({
  authors: z.array(
    z.object({
      bio: z.string(),
      display_name: z.string(),
      published_work_count: z.coerce.number().int().nonnegative(),
      slug: z.string(),
    }),
  ),
  works: z.array(
    z.object({
      author_name: z.string(),
      author_slug: z.string(),
      id: z.string().uuid(),
      published_at: z.string().datetime({ offset: true }),
      slug: z.string(),
      summary: z.string(),
      title: z.string(),
    }),
  ),
});

export interface SearchRepositoryDataSource {
  search(query: string, limit: number): Promise<unknown>;
}

export function createSearchRepository(
  source: SearchRepositoryDataSource,
): PublicSearchStore {
  return {
    async search(query, limit) {
      const safeQuery = z.string().trim().min(1).max(80).parse(query);
      const safeLimit = z.number().int().min(1).max(50).parse(limit);
      const row = searchResponse.parse(
        await source.search(safeQuery, safeLimit),
      );
      return {
        authors: row.authors.map((author): SearchAuthorResult => ({
          bio: author.bio,
          displayName: author.display_name,
          publishedWorkCount: author.published_work_count,
          slug: author.slug,
        })),
        works: row.works.map((work): SearchWorkResult => ({
          authorName: work.author_name,
          authorSlug: work.author_slug,
          id: work.id,
          publishedAt: new Date(work.published_at),
          slug: work.slug,
          summary: work.summary,
          title: work.title,
        })),
      };
    },
  };
}

export function createSupabaseSearchRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
): PublicSearchStore {
  const client = createPublicSupabaseClient(environment);
  return createSearchRepository({
    async search(query, limit) {
      const { data, error } = await client.rpc("search_public_catalog", {
        p_limit: limit,
        p_query: query,
      });
      if (error) {
        throw new DatabaseAccessError("Public search operation failed", {
          cause: error,
        });
      }
      return data;
    },
  });
}
