"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  readReaderBookmarks,
  readerBookmarkHref,
  type ReaderBookmark,
} from "../lib/reader-bookmarks";
import {
  createReaderLibrarySnapshot,
  filterReaderLibraryItems,
  type ReaderLibraryFilter,
  type ReaderLibraryItem,
} from "../lib/reader-library";
import {
  readReadingHistory,
  type ReadingHistoryEntry,
} from "../lib/reading-history";

const bookmarksUpdatedEvent = "fandom-harbor:reader-bookmarks-updated";
const historyUpdatedEvent = "fandom-harbor:reading-history-updated";

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function historyHref(entry: ReadingHistoryEntry): string {
  if (entry.kind === "work") return `/works/${entry.workSlug}`;
  if (entry.kind === "article") return `/articles/${entry.articleSlug}`;
  return `/works/${entry.workSlug}/chapters/${entry.chapterSlug}`;
}

function historyTitle(entry: ReadingHistoryEntry): string {
  if (entry.kind === "work") return entry.workTitle;
  if (entry.kind === "article") return entry.articleTitle;
  return `${entry.workTitle} · ${entry.chapterTitle}`;
}

function bookmarkTitle(bookmark: ReaderBookmark): string {
  return bookmark.kind === "article"
    ? bookmark.articleTitle
    : `${bookmark.workTitle} · ${bookmark.chapterTitle}`;
}

function itemHref(item: ReaderLibraryItem): string {
  return item.kind === "work"
    ? `/works/${item.slug}`
    : `/articles/${item.slug}`;
}

function itemActionLabel(item: ReaderLibraryItem): string {
  return item.kind === "work" ? "查看作品与目录" : "阅读文章";
}

export function ReaderLibraryClient({
  articles,
  works,
}: {
  articles: ReaderLibraryItem[];
  works: ReaderLibraryItem[];
}) {
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [filter, setFilter] = useState<ReaderLibraryFilter>("all");

  useEffect(() => {
    function synchronize() {
      const storage = getBrowserStorage();
      if (!storage) {
        setBookmarks([]);
        setHistory([]);
        setLoaded(true);
        setStorageAvailable(false);
        return;
      }

      setBookmarks(readReaderBookmarks(storage).entries);
      setHistory(readReadingHistory(storage).entries);
      setLoaded(true);
      setStorageAvailable(true);
    }

    synchronize();
    window.addEventListener(bookmarksUpdatedEvent, synchronize);
    window.addEventListener(historyUpdatedEvent, synchronize);
    window.addEventListener("storage", synchronize);
    return () => {
      window.removeEventListener(bookmarksUpdatedEvent, synchronize);
      window.removeEventListener(historyUpdatedEvent, synchronize);
      window.removeEventListener("storage", synchronize);
    };
  }, []);

  const items = useMemo(
    () => [
      ...works.map((work) => ({ ...work, kind: "work" as const })),
      ...articles.map((article) => ({ ...article, kind: "article" as const })),
    ],
    [articles, works],
  );
  const filteredItems = useMemo(
    () => filterReaderLibraryItems(items, filter, query),
    [filter, items, query],
  );
  const snapshot = useMemo(
    () => createReaderLibrarySnapshot(bookmarks, history),
    [bookmarks, history],
  );

  return (
    <div className="site-stack">
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="stat-card">
          <p className="eyebrow">Continue Reading</p>
          <h2 className="mt-2 text-xl font-semibold">继续阅读</h2>
          {loaded && snapshot.latestHistory ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                {historyTitle(snapshot.latestHistory)}
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-primary-foreground"
                href={historyHref(snapshot.latestHistory)}
              >
                回到上次阅读位置
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {loaded
                ? "还没有本地阅读记录。开始阅读后，这里会显示最近一次阅读入口。"
                : "正在读取最近阅读…"}
            </p>
          )}
        </article>

        <article className="stat-card">
          <p className="eyebrow">Local Shelf</p>
          <h2 className="mt-2 text-xl font-semibold">本地书架摘要</h2>
          {loaded ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                {storageAvailable
                  ? `共 ${snapshot.totalBookmarkCount} 个书签，最近阅读 ${snapshot.historyCount} 条记录。`
                  : "当前浏览器无法读取本地书架，但公开阅读目录仍可正常使用。"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">
                  章节书签 {snapshot.chapterBookmarkCount}
                </span>
                <span className="rounded-full border border-border px-3 py-1">
                  文章书签 {snapshot.articleBookmarkCount}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              正在读取本地书架…
            </p>
          )}
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-control border border-border px-4"
            href="/archive"
          >
            打开我的本地书架
          </Link>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Quick Return</p>
          <h2 className="mt-2 text-xl font-semibold">最近书签</h2>
          {loaded && snapshot.latestBookmark ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                {bookmarkTitle(snapshot.latestBookmark)}
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center rounded-control border border-border px-4"
                href={readerBookmarkHref(snapshot.latestBookmark)}
              >
                打开最近书签
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {loaded
                ? "还没有本地书签。可在章节页或文章页把内容加入本地书架。"
                : "正在读取书签…"}
            </p>
          )}
        </article>
      </section>

      <section
        aria-labelledby="library-browse-heading"
        className="reading-card max-w-none"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Browse</p>
            <h2
              className="mt-2 text-2xl font-semibold"
              id="library-browse-heading"
            >
              浏览已发布内容
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              只展示 published Work 与
              Article。可按内容类型切换，并按标题或摘要做本地筛选。
            </p>
          </div>
          <div className="grid gap-3 lg:min-w-[24rem]">
            <label
              className="grid gap-2 text-sm font-medium"
              htmlFor="library-search"
            >
              搜索标题或摘要
              <input
                className="min-h-11 rounded-control border border-border bg-background px-4"
                id="library-search"
                name="library-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如：Harbor、治愈、剧情"
                type="search"
                value={query}
              />
            </label>
            <div
              aria-label="内容类型筛选"
              className="flex flex-wrap gap-2"
              role="group"
            >
              {[
                ["all", "全部内容"],
                ["works", "仅作品"],
                ["articles", "仅文章"],
              ].map(([value, label]) => (
                <button
                  aria-pressed={filter === value}
                  className="min-h-11 rounded-control border border-border px-4 aria-[pressed=true]:border-primary aria-[pressed=true]:bg-surface-muted"
                  key={value}
                  onClick={() => setFilter(value as ReaderLibraryFilter)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filteredItems.length > 0 ? (
        <section
          aria-labelledby="library-results-heading"
          className="site-stack"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold" id="library-results-heading">
              当前可读内容
            </h2>
            <p className="text-sm text-muted-foreground">
              共 {filteredItems.length} 条结果
            </p>
          </div>
          <div className="book-grid">
            {filteredItems.map((item) => (
              <article className="stat-card" key={`${item.kind}:${item.id}`}>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {item.kind === "work" ? "Work" : "Article"}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
                {item.kind === "work" && item.authorName && item.authorSlug ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    作者：
                    <Link
                      className="text-primary"
                      href={`/author/${item.authorSlug}`}
                    >
                      {item.authorName}
                    </Link>
                  </p>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.summary}
                </p>
                {item.tagNames && item.tagNames.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tagNames.map((tag) => (
                      <span
                        className="rounded-full border border-border px-2 py-1 text-xs"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <Link
                  className="mt-6 inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-sm text-primary-foreground"
                  href={itemHref(item)}
                >
                  {itemActionLabel(item)}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="empty-state">
          当前筛选条件下暂无可读内容。你可以清空搜索词，或切换到其他内容类型。
        </section>
      )}
    </div>
  );
}
