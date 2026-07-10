export const BROWSE_PAGE_SIZE = 12;

export const browseSorts = [
  "newest",
  "oldest",
  "title-asc",
  "title-desc",
] as const;

export type BrowseSort = (typeof browseSorts)[number];

export interface BrowseWork {
  authorName: string;
  authorSlug: string;
  id: string;
  publishedAt: Date;
  slug: string;
  summary: string;
  title: string;
}

export interface BrowsePage {
  items: BrowseWork[];
  page: number;
  pageCount: number;
  pageSize: number;
  sort: BrowseSort;
  total: number;
}

export interface PublicBrowseStore {
  list(input: {
    limit: number;
    offset: number;
    sort: BrowseSort;
  }): Promise<{ items: BrowseWork[]; total: number }>;
}

export function isBrowseSort(value: string): value is BrowseSort {
  return (browseSorts as readonly string[]).includes(value);
}

export function createPublicBrowseService(store: PublicBrowseStore) {
  return {
    async listAllPublished(): Promise<BrowseWork[]> {
      const items: BrowseWork[] = [];
      let offset = 0;
      let total = 0;

      do {
        const result = await store.list({
          limit: 50,
          offset,
          sort: "newest",
        });
        total = result.total;
        items.push(...result.items);
        offset += result.items.length;
        if (result.items.length === 0) break;
      } while (offset < total);

      return items;
    },
    async list(
      input: { page?: number; sort?: BrowseSort } = {},
    ): Promise<BrowsePage> {
      const page = input.page ?? 1;
      const sort = input.sort ?? "newest";
      if (!Number.isSafeInteger(page) || page < 1) {
        throw new RangeError("Browse page must be a positive integer");
      }
      if (!isBrowseSort(sort)) throw new RangeError("Browse sort is invalid");

      const result = await store.list({
        limit: BROWSE_PAGE_SIZE,
        offset: (page - 1) * BROWSE_PAGE_SIZE,
        sort,
      });
      return {
        ...result,
        page,
        pageCount:
          result.total === 0 ? 0 : Math.ceil(result.total / BROWSE_PAGE_SIZE),
        pageSize: BROWSE_PAGE_SIZE,
        sort,
      };
    },
  };
}
