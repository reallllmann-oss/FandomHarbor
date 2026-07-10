export const READER_BOOKMARKS_STORAGE_KEY = "fandom-harbor.reader-bookmarks.v1";
export const READER_BOOKMARKS_LIMIT = 100;

interface BookmarkBase {
  authorName?: string;
  authorSlug?: string;
  bookmarkedAt: string;
}

export interface ChapterBookmark extends BookmarkBase {
  chapterPosition: number;
  chapterSlug: string;
  chapterTitle: string;
  kind: "chapter";
  workSlug: string;
  workTitle: string;
}

export interface ArticleBookmark extends BookmarkBase {
  articleSlug: string;
  articleTitle: string;
  kind: "article";
}

export type ReaderBookmark = ArticleBookmark | ChapterBookmark;
export type ReaderBookmarkDraft =
  Omit<ArticleBookmark, "bookmarkedAt"> | Omit<ChapterBookmark, "bookmarkedAt">;

export interface ReaderBookmarksState {
  entries: ReaderBookmark[];
  version: 1;
}

interface BookmarkStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const EMPTY_READER_BOOKMARKS: ReaderBookmarksState = {
  entries: [],
  version: 1,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidSlug(value: unknown): value is string {
  return isNonEmptyString(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isValidDate(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function normalizeBookmark(value: unknown): ReaderBookmark | null {
  if (!isRecord(value) || !isValidDate(value.bookmarkedAt)) return null;

  if (
    value.kind === "article" &&
    isValidSlug(value.articleSlug) &&
    isNonEmptyString(value.articleTitle)
  ) {
    return {
      ...(isValidSlug(value.authorSlug) && isNonEmptyString(value.authorName)
        ? { authorName: value.authorName, authorSlug: value.authorSlug }
        : {}),
      articleSlug: value.articleSlug,
      articleTitle: value.articleTitle,
      bookmarkedAt: value.bookmarkedAt,
      kind: "article",
    };
  }

  if (
    value.kind === "chapter" &&
    isValidSlug(value.workSlug) &&
    isNonEmptyString(value.workTitle) &&
    isValidSlug(value.chapterSlug) &&
    isNonEmptyString(value.chapterTitle) &&
    Number.isInteger(value.chapterPosition) &&
    (value.chapterPosition as number) > 0
  ) {
    return {
      bookmarkedAt: value.bookmarkedAt,
      chapterPosition: value.chapterPosition as number,
      chapterSlug: value.chapterSlug,
      chapterTitle: value.chapterTitle,
      kind: "chapter",
      workSlug: value.workSlug,
      workTitle: value.workTitle,
    };
  }

  return null;
}

function bookmarkIdentity(bookmark: ReaderBookmark | ReaderBookmarkDraft) {
  return bookmark.kind === "article"
    ? `article:${bookmark.articleSlug}`
    : `chapter:${bookmark.workSlug}:${bookmark.chapterSlug}`;
}

function sortAndLimit(entries: ReaderBookmark[]): ReaderBookmark[] {
  return entries
    .sort(
      (left, right) =>
        Date.parse(right.bookmarkedAt) - Date.parse(left.bookmarkedAt),
    )
    .slice(0, READER_BOOKMARKS_LIMIT);
}

export function parseReaderBookmarks(
  serialized: string | null,
): ReaderBookmarksState {
  if (!serialized) return EMPTY_READER_BOOKMARKS;

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.entries)
    ) {
      return EMPTY_READER_BOOKMARKS;
    }

    return {
      entries: sortAndLimit(
        parsed.entries
          .map(normalizeBookmark)
          .filter((entry): entry is ReaderBookmark => entry !== null),
      ),
      version: 1,
    };
  } catch {
    return EMPTY_READER_BOOKMARKS;
  }
}

export function readReaderBookmarks(
  storage: BookmarkStorage,
): ReaderBookmarksState {
  try {
    return parseReaderBookmarks(storage.getItem(READER_BOOKMARKS_STORAGE_KEY));
  } catch {
    return EMPTY_READER_BOOKMARKS;
  }
}

export function writeReaderBookmarks(
  storage: BookmarkStorage,
  bookmarks: ReaderBookmarksState,
): boolean {
  try {
    storage.setItem(READER_BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    return true;
  } catch {
    return false;
  }
}

export function hasReaderBookmark(
  bookmarks: ReaderBookmarksState,
  draft: ReaderBookmarkDraft,
): boolean {
  const identity = bookmarkIdentity(draft);
  return bookmarks.entries.some(
    (entry) => bookmarkIdentity(entry) === identity,
  );
}

export function toggleReaderBookmark(
  bookmarks: ReaderBookmarksState,
  draft: ReaderBookmarkDraft,
  bookmarkedAt = new Date().toISOString(),
): ReaderBookmarksState {
  const identity = bookmarkIdentity(draft);
  if (hasReaderBookmark(bookmarks, draft)) {
    return {
      entries: bookmarks.entries.filter(
        (entry) => bookmarkIdentity(entry) !== identity,
      ),
      version: 1,
    };
  }

  const bookmark = normalizeBookmark({ ...draft, bookmarkedAt });
  if (!bookmark) return bookmarks;
  return {
    entries: sortAndLimit([bookmark, ...bookmarks.entries]),
    version: 1,
  };
}

export function readerBookmarkHref(bookmark: ReaderBookmark): string {
  return bookmark.kind === "article"
    ? `/articles/${bookmark.articleSlug}`
    : `/works/${bookmark.workSlug}/chapters/${bookmark.chapterSlug}`;
}
