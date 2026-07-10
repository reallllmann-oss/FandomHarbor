import type { ReaderBookmark } from "./reader-bookmarks";
import type { ReadingHistoryEntry } from "./reading-history";

export interface ReaderLibraryItem {
  authorName?: string;
  authorSlug?: string;
  id: string;
  kind: "article" | "work";
  slug: string;
  summary: string;
  tagNames?: string[];
  title: string;
}

export type ReaderLibraryFilter = "all" | "articles" | "works";

export interface ReaderLibrarySnapshot {
  articleBookmarkCount: number;
  chapterBookmarkCount: number;
  historyCount: number;
  latestBookmark: ReaderBookmark | null;
  latestHistory: ReadingHistoryEntry | null;
  totalBookmarkCount: number;
}

function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function matchesQuery(item: ReaderLibraryItem, query: string): boolean {
  if (!query) return true;

  const haystack = normalizeSearchText(
    `${item.title} ${item.summary} ${item.authorName ?? ""}`,
  );
  return haystack.includes(query);
}

export function filterReaderLibraryItems(
  items: ReaderLibraryItem[],
  filter: ReaderLibraryFilter,
  query: string,
): ReaderLibraryItem[] {
  const normalizedQuery = normalizeSearchText(query);

  return items.filter((item) => {
    if (filter !== "all" && item.kind !== filter.slice(0, -1)) return false;
    return matchesQuery(item, normalizedQuery);
  });
}

export function createReaderLibrarySnapshot(
  bookmarks: ReaderBookmark[],
  history: ReadingHistoryEntry[],
): ReaderLibrarySnapshot {
  const articleBookmarkCount = bookmarks.filter(
    (bookmark) => bookmark.kind === "article",
  ).length;
  const chapterBookmarkCount = bookmarks.filter(
    (bookmark) => bookmark.kind === "chapter",
  ).length;

  return {
    articleBookmarkCount,
    chapterBookmarkCount,
    historyCount: history.length,
    latestBookmark: bookmarks[0] ?? null,
    latestHistory: history[0] ?? null,
    totalBookmarkCount: bookmarks.length,
  };
}
