export const READING_HISTORY_STORAGE_KEY = "fandom-harbor.reading-history.v1";
export const READING_HISTORY_LIMIT = 30;

interface ReadingHistoryBase {
  authorName?: string;
  authorSlug?: string;
  lastReadAt: string;
}

export interface WorkHistoryEntry extends ReadingHistoryBase {
  kind: "work";
  workSlug: string;
  workTitle: string;
}

export interface ChapterHistoryEntry extends ReadingHistoryBase {
  chapterCount: number;
  chapterPosition: number;
  chapterSlug: string;
  chapterTitle: string;
  kind: "chapter";
  progressPercent: number;
  workSlug: string;
  workTitle: string;
}

export interface ArticleHistoryEntry extends ReadingHistoryBase {
  articleSlug: string;
  articleTitle: string;
  kind: "article";
}

export type ReadingHistoryEntry =
  ArticleHistoryEntry | ChapterHistoryEntry | WorkHistoryEntry;

export type ReadingHistoryDraft =
  | Omit<ArticleHistoryEntry, "lastReadAt">
  | Omit<ChapterHistoryEntry, "lastReadAt" | "progressPercent">
  | Omit<WorkHistoryEntry, "lastReadAt">;

export interface ReadingHistoryState {
  entries: ReadingHistoryEntry[];
  version: 1;
}

interface ReadingHistoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const EMPTY_READING_HISTORY: ReadingHistoryState = {
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

function normalizeEntry(value: unknown): ReadingHistoryEntry | null {
  if (!isRecord(value) || !isValidDate(value.lastReadAt)) return null;

  if (
    value.kind === "work" &&
    isValidSlug(value.workSlug) &&
    isNonEmptyString(value.workTitle)
  ) {
    return {
      ...(isValidSlug(value.authorSlug) && isNonEmptyString(value.authorName)
        ? { authorName: value.authorName, authorSlug: value.authorSlug }
        : {}),
      kind: "work",
      lastReadAt: value.lastReadAt,
      workSlug: value.workSlug,
      workTitle: value.workTitle,
    };
  }

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
      kind: "article",
      lastReadAt: value.lastReadAt,
    };
  }

  if (
    value.kind === "chapter" &&
    isValidSlug(value.workSlug) &&
    isNonEmptyString(value.workTitle) &&
    isValidSlug(value.chapterSlug) &&
    isNonEmptyString(value.chapterTitle) &&
    Number.isInteger(value.chapterPosition) &&
    Number.isInteger(value.chapterCount) &&
    (value.chapterPosition as number) > 0 &&
    (value.chapterCount as number) >= (value.chapterPosition as number)
  ) {
    const chapterPosition = value.chapterPosition as number;
    const chapterCount = value.chapterCount as number;
    return {
      chapterCount,
      chapterPosition,
      chapterSlug: value.chapterSlug,
      chapterTitle: value.chapterTitle,
      kind: "chapter",
      lastReadAt: value.lastReadAt,
      progressPercent: Math.round((chapterPosition / chapterCount) * 100),
      workSlug: value.workSlug,
      workTitle: value.workTitle,
    };
  }

  return null;
}

function entryIdentity(entry: ReadingHistoryEntry): string {
  if (entry.kind === "work") return `work:${entry.workSlug}`;
  if (entry.kind === "article") return `article:${entry.articleSlug}`;
  return `chapter:${entry.workSlug}:${entry.chapterSlug}`;
}

function sortAndLimit(entries: ReadingHistoryEntry[]): ReadingHistoryEntry[] {
  return entries
    .sort(
      (left, right) =>
        Date.parse(right.lastReadAt) - Date.parse(left.lastReadAt),
    )
    .slice(0, READING_HISTORY_LIMIT);
}

export function parseReadingHistory(
  serialized: string | null,
): ReadingHistoryState {
  if (!serialized) return EMPTY_READING_HISTORY;

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (
      !isRecord(parsed) ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.entries)
    ) {
      return EMPTY_READING_HISTORY;
    }

    return {
      entries: sortAndLimit(
        parsed.entries
          .map(normalizeEntry)
          .filter((entry): entry is ReadingHistoryEntry => entry !== null),
      ),
      version: 1,
    };
  } catch {
    return EMPTY_READING_HISTORY;
  }
}

export function readReadingHistory(
  storage: ReadingHistoryStorage,
): ReadingHistoryState {
  try {
    return parseReadingHistory(storage.getItem(READING_HISTORY_STORAGE_KEY));
  } catch {
    return EMPTY_READING_HISTORY;
  }
}

export function writeReadingHistory(
  storage: ReadingHistoryStorage,
  history: ReadingHistoryState,
): boolean {
  try {
    storage.setItem(READING_HISTORY_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

export function recordReadingHistory(
  history: ReadingHistoryState,
  draft: ReadingHistoryDraft,
  lastReadAt = new Date().toISOString(),
): ReadingHistoryState {
  const entry = normalizeEntry({ ...draft, lastReadAt });
  if (!entry) return history;

  const identity = entryIdentity(entry);
  return {
    entries: sortAndLimit([
      entry,
      ...history.entries.filter(
        (candidate) => entryIdentity(candidate) !== identity,
      ),
    ]),
    version: 1,
  };
}

export function getLatestChapterForWork(
  history: ReadingHistoryState,
  workSlug: string,
): ChapterHistoryEntry | null {
  return (
    history.entries.find(
      (entry): entry is ChapterHistoryEntry =>
        entry.kind === "chapter" && entry.workSlug === workSlug,
    ) ?? null
  );
}
