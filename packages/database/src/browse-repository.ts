import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import type {
  BrowseSort,
  BrowseWork,
  PublicBrowseStore,
} from "@fandom-harbor/services";
import { z } from "zod";

import { DatabaseAccessError } from "./access-context-repository";
import { createPublicSupabaseClient } from "./public-client";

const browseResponse = z.object({
  items: z.array(
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
  total: z.coerce.number().int().nonnegative(),
});

export interface BrowseRepositoryDataSource {
  list(input: {
    limit: number;
    offset: number;
    sort: BrowseSort;
  }): Promise<unknown>;
}

export function createBrowseRepository(
  source: BrowseRepositoryDataSource,
): PublicBrowseStore {
  return {
    async list(input) {
      const safeInput = z
        .object({
          limit: z.number().int().min(1).max(50),
          offset: z.number().int().nonnegative(),
          sort: z.enum(["newest", "oldest", "title-asc", "title-desc"]),
        })
        .parse(input);
      const row = browseResponse.parse(await source.list(safeInput));
      return {
        items: row.items.map((item): BrowseWork => ({
          authorName: item.author_name,
          authorSlug: item.author_slug,
          id: item.id,
          publishedAt: new Date(item.published_at),
          slug: item.slug,
          summary: item.summary,
          title: item.title,
        })),
        total: row.total,
      };
    },
  };
}

export function createSupabaseBrowseRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
): PublicBrowseStore {
  const client = createPublicSupabaseClient(environment);
  return createBrowseRepository({
    async list(input) {
      const { data, error } = await client.rpc("browse_public_works", {
        p_limit: input.limit,
        p_offset: input.offset,
        p_sort: input.sort,
      });
      if (error) {
        throw new DatabaseAccessError("Public browse operation failed", {
          cause: error,
        });
      }
      return data;
    },
  });
}
