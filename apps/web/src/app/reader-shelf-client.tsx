"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  readReaderBookmarks,
  readerBookmarkHref,
  toggleReaderBookmark,
  writeReaderBookmarks,
  hasReaderBookmark,
  type ReaderBookmark,
  type ReaderBookmarkDraft,
} from "../lib/reader-bookmarks";
import {
  readReadingHistory,
  type ReadingHistoryEntry,
} from "../lib/reading-history";

const bookmarksUpdatedEvent = "fandom-harbor:reader-bookmarks-updated";

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

function bookmarkDraftTitle(bookmark: ReaderBookmarkDraft): string {
  return bookmark.kind === "article"
    ? bookmark.articleTitle
    : `${bookmark.workTitle} · ${bookmark.chapterTitle}`;
}

export function BookmarkToggle({
  bookmark,
}: {
  bookmark: ReaderBookmarkDraft;
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    function synchronize() {
      const storage = getBrowserStorage();
      if (!storage) {
        setBookmarked(false);
        setStorageAvailable(false);
        return;
      }
      setStorageAvailable(true);
      setBookmarked(hasReaderBookmark(readReaderBookmarks(storage), bookmark));
    }

    synchronize();
    window.addEventListener(bookmarksUpdatedEvent, synchronize);
    window.addEventListener("storage", synchronize);
    return () => {
      window.removeEventListener(bookmarksUpdatedEvent, synchronize);
      window.removeEventListener("storage", synchronize);
    };
  }, [bookmark]);

  function toggle() {
    const storage = getBrowserStorage();
    if (!storage) {
      setStorageAvailable(false);
      return;
    }

    const next = toggleReaderBookmark(readReaderBookmarks(storage), bookmark);
    if (!writeReaderBookmarks(storage, next)) {
      setStorageAvailable(false);
      return;
    }

    setBookmarked(hasReaderBookmark(next, bookmark));
    window.dispatchEvent(new Event(bookmarksUpdatedEvent));
  }

  return (
    <div>
      <button
        aria-label={
          storageAvailable
            ? bookmarked
              ? `取消“${bookmarkDraftTitle(bookmark)}”的书签`
              : `为“${bookmarkDraftTitle(bookmark)}”添加书签`
            : `无法为“${bookmarkDraftTitle(bookmark)}”保存书签：本地存储不可用`
        }
        aria-pressed={bookmarked}
        className="min-h-11 rounded-control border border-border px-4 font-medium aria-[pressed=true]:border-primary aria-[pressed=true]:bg-surface-muted"
        disabled={!storageAvailable}
        onClick={toggle}
        type="button"
      >
        {storageAvailable
          ? bookmarked
            ? "已添加书签 · 点击取消"
            : "添加到本地书架"
          : "本地存储不可用"}
      </button>
      <span aria-live="polite" className="sr-only" role="status">
        {storageAvailable
          ? bookmarked
            ? "当前内容已添加书签"
            : "当前内容尚未添加书签"
          : "本地书签不可用"}
      </span>
    </div>
  );
}

export function ReaderShelf() {
  const [bookmarks, setBookmarks] = useState<ReaderBookmark[]>([]);
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

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

      setStorageAvailable(true);
      setBookmarks(readReaderBookmarks(storage).entries);
      setHistory(readReadingHistory(storage).entries.slice(0, 10));
      setLoaded(true);
    }

    synchronize();
    window.addEventListener(bookmarksUpdatedEvent, synchronize);
    window.addEventListener("storage", synchronize);
    return () => {
      window.removeEventListener(bookmarksUpdatedEvent, synchronize);
      window.removeEventListener("storage", synchronize);
    };
  }, []);

  if (!loaded) {
    return (
      <p aria-live="polite" className="empty-state" role="status">
        正在读取本地书架…
      </p>
    );
  }

  if (!storageAvailable) {
    return (
      <p aria-live="polite" className="empty-state" role="status">
        当前浏览器无法使用本地存储。书架已安全回退，不影响作品阅读。
      </p>
    );
  }

  return (
    <div className="site-stack">
      <section aria-labelledby="bookmark-shelf-heading" className="site-stack">
        <div>
          <p className="eyebrow">Bookmarks</p>
          <h2
            className="mt-2 text-2xl font-semibold"
            id="bookmark-shelf-heading"
          >
            我的书签
          </h2>
        </div>
        {bookmarks.length > 0 ? (
          <ul className="grid gap-3">
            {bookmarks.map((bookmark) => (
              <li className="stat-card" key={readerBookmarkHref(bookmark)}>
                <Link
                  aria-label={`打开书签：${bookmarkTitle(bookmark)}`}
                  className="block min-h-11 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href={readerBookmarkHref(bookmark)}
                >
                  <span className="text-xs text-muted-foreground">
                    {bookmark.kind === "chapter"
                      ? `章节 · Chapter ${bookmark.chapterPosition}`
                      : "独立文章"}
                  </span>
                  <span className="mt-1 block font-semibold">
                    {bookmarkTitle(bookmark)}
                  </span>
                </Link>
                {bookmark.authorName && bookmark.authorSlug ? (
                  <Link
                    className="mt-2 inline-block text-sm text-primary"
                    href={`/author/${bookmark.authorSlug}`}
                  >
                    作者：{bookmark.authorName}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            暂无本地书签。可在章节或文章阅读页添加。
          </p>
        )}
      </section>

      <section aria-labelledby="recent-reading-heading" className="site-stack">
        <div>
          <p className="eyebrow">Recent Reading</p>
          <h2
            className="mt-2 text-2xl font-semibold"
            id="recent-reading-heading"
          >
            最近阅读
          </h2>
        </div>
        {history.length > 0 ? (
          <ul className="grid gap-3">
            {history.map((entry) => (
              <li
                className="stat-card"
                key={`${entry.kind}:${historyHref(entry)}`}
              >
                <Link
                  aria-label={`继续阅读：${historyTitle(entry)}`}
                  className="block min-h-11 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href={historyHref(entry)}
                >
                  <span className="text-xs text-muted-foreground">
                    {entry.kind === "chapter"
                      ? `阅读位置 ${entry.progressPercent}%`
                      : entry.kind === "article"
                        ? "独立文章"
                        : "作品详情"}
                  </span>
                  <span className="mt-1 block font-semibold">
                    {historyTitle(entry)}
                  </span>
                </Link>
                {entry.authorName && entry.authorSlug ? (
                  <Link
                    className="mt-2 inline-block text-sm text-primary"
                    href={`/author/${entry.authorSlug}`}
                  >
                    作者：{entry.authorName}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">暂无本地阅读记录。</p>
        )}
      </section>
    </div>
  );
}
