export const MAX_SEARCH_QUERY_LENGTH = 80;

export interface SearchAuthorResult {
  bio: string;
  displayName: string;
  publishedWorkCount: number;
  slug: string;
}

export interface SearchWorkResult {
  authorName: string;
  authorSlug: string;
  id: string;
  publishedAt: Date;
  slug: string;
  summary: string;
  title: string;
}

export interface SearchResults {
  authors: SearchAuthorResult[];
  query: string;
  works: SearchWorkResult[];
}

export interface PublicSearchStore {
  search(query: string, limit: number): Promise<Omit<SearchResults, "query">>;
}

export function normalizeSearchQuery(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ");
}

export function createPublicSearchService(store: PublicSearchStore) {
  return {
    async search(value: string): Promise<SearchResults> {
      const query = normalizeSearchQuery(value);
      if (query.length === 0) return { authors: [], query, works: [] };
      if (query.length > MAX_SEARCH_QUERY_LENGTH) {
        throw new RangeError(
          `Search query must not exceed ${MAX_SEARCH_QUERY_LENGTH} characters`,
        );
      }
      if (/\p{Cc}/u.test(query)) {
        throw new TypeError("Search query contains control characters");
      }
      return { ...(await store.search(query, 20)), query };
    },
  };
}
