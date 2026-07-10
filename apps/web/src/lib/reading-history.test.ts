import { beforeEach, describe, expect, it } from "vitest";

import {
  EMPTY_READING_HISTORY,
  getLatestChapterForWork,
  parseReadingHistory,
  readReadingHistory,
  READING_HISTORY_LIMIT,
  READING_HISTORY_STORAGE_KEY,
  recordReadingHistory,
  writeReadingHistory,
} from "./reading-history";

const firstChapter = {
  chapterCount: 2,
  chapterPosition: 1,
  chapterSlug: "below-the-tide-line",
  chapterTitle: "第一章：潮线以下",
  kind: "chapter",
  workSlug: "glass-harbor",
  workTitle: "Glass Harbor",
} as const;

describe("reading history", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("records work, chapter and article entries with time and progress", () => {
    let history = recordReadingHistory(
      EMPTY_READING_HISTORY,
      { kind: "work", workSlug: "glass-harbor", workTitle: "Glass Harbor" },
      "2026-06-30T01:00:00.000Z",
    );
    history = recordReadingHistory(
      history,
      firstChapter,
      "2026-06-30T02:00:00.000Z",
    );
    history = recordReadingHistory(
      history,
      {
        articleSlug: "why-an-archive-needs-quiet",
        articleTitle: "为什么归档需要安静",
        kind: "article",
      },
      "2026-06-30T03:00:00.000Z",
    );

    expect(history.entries).toMatchObject([
      { kind: "article", lastReadAt: "2026-06-30T03:00:00.000Z" },
      {
        chapterPosition: 1,
        kind: "chapter",
        lastReadAt: "2026-06-30T02:00:00.000Z",
        progressPercent: 50,
      },
      { kind: "work", lastReadAt: "2026-06-30T01:00:00.000Z" },
    ]);
  });

  it("updates an existing item and returns the latest chapter for one work", () => {
    const initial = recordReadingHistory(
      EMPTY_READING_HISTORY,
      firstChapter,
      "2026-06-30T01:00:00.000Z",
    );
    const updated = recordReadingHistory(
      initial,
      firstChapter,
      "2026-06-30T04:00:00.000Z",
    );

    expect(updated.entries).toHaveLength(1);
    expect(getLatestChapterForWork(updated, "glass-harbor")).toMatchObject({
      chapterSlug: "below-the-tide-line",
      lastReadAt: "2026-06-30T04:00:00.000Z",
    });
    expect(getLatestChapterForWork(updated, "missing")).toBeNull();
  });

  it("round-trips through the versioned localStorage key", () => {
    const history = recordReadingHistory(
      EMPTY_READING_HISTORY,
      firstChapter,
      "2026-06-30T02:00:00.000Z",
    );

    expect(writeReadingHistory(window.localStorage, history)).toBe(true);
    expect(window.localStorage.getItem(READING_HISTORY_STORAGE_KEY)).not.toBe(
      null,
    );
    expect(readReadingHistory(window.localStorage)).toEqual(history);
  });

  it("discards corrupt entries and safely handles blocked storage", () => {
    expect(parseReadingHistory("not-json")).toEqual(EMPTY_READING_HISTORY);
    expect(
      parseReadingHistory(
        JSON.stringify({ entries: [{ kind: "chapter" }], version: 1 }),
      ),
    ).toEqual(EMPTY_READING_HISTORY);
    expect(
      parseReadingHistory(
        JSON.stringify({
          entries: [
            {
              articleSlug: "javascript:alert-1",
              articleTitle: "失效文章",
              kind: "article",
              lastReadAt: "2026-06-30T01:00:00.000Z",
            },
          ],
          version: 1,
        }),
      ),
    ).toEqual(EMPTY_READING_HISTORY);
    expect(
      readReadingHistory({
        getItem() {
          throw new Error("blocked");
        },
        setItem() {},
      }),
    ).toEqual(EMPTY_READING_HISTORY);
    expect(
      writeReadingHistory(
        {
          getItem() {
            return null;
          },
          setItem() {
            throw new Error("blocked");
          },
        },
        EMPTY_READING_HISTORY,
      ),
    ).toBe(false);
  });

  it("bounds retained history", () => {
    let history = EMPTY_READING_HISTORY;
    for (let index = 0; index < READING_HISTORY_LIMIT + 5; index += 1) {
      history = recordReadingHistory(
        history,
        {
          articleSlug: `article-${index}`,
          articleTitle: `Article ${index}`,
          kind: "article",
        },
        new Date(Date.UTC(2026, 5, 30, 0, index)).toISOString(),
      );
    }

    expect(history.entries).toHaveLength(READING_HISTORY_LIMIT);
    expect(history.entries[0]).toMatchObject({ articleSlug: "article-34" });
  });
});
