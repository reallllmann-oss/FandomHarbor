import { describe, expect, it } from "vitest";

import {
  createReaderLibrarySnapshot,
  filterReaderLibraryItems,
  type ReaderLibraryItem,
} from "./reader-library";

const items: ReaderLibraryItem[] = [
  {
    id: "work-1",
    kind: "work",
    slug: "star-tide",
    summary: "A quiet harbor mystery.",
    title: "Star Tide",
  },
  {
    id: "article-1",
    kind: "article",
    slug: "harbor-notes",
    summary: "Publishing notes from the archive.",
    title: "Harbor Notes",
  },
];

describe("filterReaderLibraryItems", () => {
  it("returns all items when filter and query are empty", () => {
    expect(filterReaderLibraryItems(items, "all", "")).toEqual(items);
  });

  it("filters by content kind", () => {
    expect(filterReaderLibraryItems(items, "works", "")).toEqual([items[0]]);
    expect(filterReaderLibraryItems(items, "articles", "")).toEqual([items[1]]);
  });

  it("filters by normalized text query across title and summary", () => {
    expect(filterReaderLibraryItems(items, "all", " harbor ")).toEqual(items);
    expect(filterReaderLibraryItems(items, "all", "mystery")).toEqual([
      items[0],
    ]);
  });

  it("returns an empty list when no item matches", () => {
    expect(filterReaderLibraryItems(items, "all", "nonexistent")).toEqual([]);
  });
});

describe("createReaderLibrarySnapshot", () => {
  it("derives bookmark and history counts from the newest-first arrays", () => {
    const snapshot = createReaderLibrarySnapshot(
      [
        {
          articleSlug: "harbor-notes",
          articleTitle: "Harbor Notes",
          bookmarkedAt: "2026-07-01T12:00:00.000Z",
          kind: "article",
        },
        {
          bookmarkedAt: "2026-07-01T11:00:00.000Z",
          chapterPosition: 1,
          chapterSlug: "opening-tide",
          chapterTitle: "Opening Tide",
          kind: "chapter",
          workSlug: "star-tide",
          workTitle: "Star Tide",
        },
      ],
      [
        {
          chapterCount: 3,
          chapterPosition: 2,
          chapterSlug: "lanterns",
          chapterTitle: "Lanterns",
          kind: "chapter",
          lastReadAt: "2026-07-01T12:30:00.000Z",
          progressPercent: 67,
          workSlug: "star-tide",
          workTitle: "Star Tide",
        },
      ],
    );

    expect(snapshot).toMatchObject({
      articleBookmarkCount: 1,
      chapterBookmarkCount: 1,
      historyCount: 1,
      totalBookmarkCount: 2,
    });
    expect(snapshot.latestBookmark?.kind).toBe("article");
    expect(snapshot.latestHistory?.kind).toBe("chapter");
  });
});
