import { beforeEach, describe, expect, it } from "vitest";

import {
  EMPTY_READER_BOOKMARKS,
  hasReaderBookmark,
  parseReaderBookmarks,
  readReaderBookmarks,
  READER_BOOKMARKS_LIMIT,
  READER_BOOKMARKS_STORAGE_KEY,
  readerBookmarkHref,
  toggleReaderBookmark,
  writeReaderBookmarks,
} from "./reader-bookmarks";

const chapterBookmark = {
  chapterPosition: 1,
  chapterSlug: "below-the-tide-line",
  chapterTitle: "第一章：潮线以下",
  kind: "chapter",
  workSlug: "glass-harbor",
  workTitle: "Glass Harbor",
} as const;

describe("reader bookmarks", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds and removes a chapter bookmark while exposing current state", () => {
    const added = toggleReaderBookmark(
      EMPTY_READER_BOOKMARKS,
      chapterBookmark,
      "2026-06-30T01:00:00.000Z",
    );
    expect(hasReaderBookmark(added, chapterBookmark)).toBe(true);
    expect(added.entries[0]).toMatchObject({
      bookmarkedAt: "2026-06-30T01:00:00.000Z",
      kind: "chapter",
    });

    const removed = toggleReaderBookmark(added, chapterBookmark);
    expect(hasReaderBookmark(removed, chapterBookmark)).toBe(false);
    expect(removed.entries).toHaveLength(0);
  });

  it("supports article bookmarks and stable shelf hrefs", () => {
    const added = toggleReaderBookmark(
      EMPTY_READER_BOOKMARKS,
      {
        articleSlug: "why-an-archive-needs-quiet",
        articleTitle: "为什么归档需要安静",
        kind: "article",
      },
      "2026-06-30T02:00:00.000Z",
    );

    expect(readerBookmarkHref(added.entries[0]!)).toBe(
      "/articles/why-an-archive-needs-quiet",
    );
    expect(
      readerBookmarkHref(
        toggleReaderBookmark(EMPTY_READER_BOOKMARKS, chapterBookmark)
          .entries[0]!,
      ),
    ).toBe("/works/glass-harbor/chapters/below-the-tide-line");
  });

  it("round-trips through the versioned localStorage key", () => {
    const bookmarks = toggleReaderBookmark(
      EMPTY_READER_BOOKMARKS,
      chapterBookmark,
      "2026-06-30T01:00:00.000Z",
    );

    expect(writeReaderBookmarks(window.localStorage, bookmarks)).toBe(true);
    expect(window.localStorage.getItem(READER_BOOKMARKS_STORAGE_KEY)).not.toBe(
      null,
    );
    expect(readReaderBookmarks(window.localStorage)).toEqual(bookmarks);
  });

  it("discards damaged values and handles blocked Storage", () => {
    expect(parseReaderBookmarks("not-json")).toEqual(EMPTY_READER_BOOKMARKS);
    expect(
      parseReaderBookmarks(
        JSON.stringify({ entries: [{ kind: "chapter" }], version: 1 }),
      ),
    ).toEqual(EMPTY_READER_BOOKMARKS);
    expect(
      parseReaderBookmarks(
        JSON.stringify({
          entries: [
            {
              articleSlug: "../missing",
              articleTitle: "失效文章",
              bookmarkedAt: "2026-06-30T01:00:00.000Z",
              kind: "article",
            },
          ],
          version: 1,
        }),
      ),
    ).toEqual(EMPTY_READER_BOOKMARKS);
    expect(
      readReaderBookmarks({
        getItem() {
          throw new Error("blocked");
        },
        setItem() {},
      }),
    ).toEqual(EMPTY_READER_BOOKMARKS);
    expect(
      writeReaderBookmarks(
        {
          getItem() {
            return null;
          },
          setItem() {
            throw new Error("blocked");
          },
        },
        EMPTY_READER_BOOKMARKS,
      ),
    ).toBe(false);
  });

  it("keeps only the most recent bounded set", () => {
    let bookmarks = EMPTY_READER_BOOKMARKS;
    for (let index = 0; index < READER_BOOKMARKS_LIMIT + 5; index += 1) {
      bookmarks = toggleReaderBookmark(
        bookmarks,
        {
          articleSlug: `article-${index}`,
          articleTitle: `Article ${index}`,
          kind: "article",
        },
        new Date(Date.UTC(2026, 5, 30, 0, index)).toISOString(),
      );
    }

    expect(bookmarks.entries).toHaveLength(READER_BOOKMARKS_LIMIT);
    expect(bookmarks.entries[0]).toMatchObject({ articleSlug: "article-104" });
  });
});
