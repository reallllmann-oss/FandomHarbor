"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getLatestChapterForWork,
  readReadingHistory,
  recordReadingHistory,
  writeReadingHistory,
  type ChapterHistoryEntry,
  type ReadingHistoryDraft,
} from "../lib/reading-history";

const historyUpdatedEvent = "fandom-harbor:reading-history-updated";

function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function ReadingHistoryTracker({
  entry,
}: {
  entry: ReadingHistoryDraft;
}) {
  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) return;

    const next = recordReadingHistory(readReadingHistory(storage), entry);
    if (writeReadingHistory(storage, next)) {
      window.dispatchEvent(new Event(historyUpdatedEvent));
    }
  }, [entry]);

  return null;
}

export function ContinueReadingForWork({
  availableChapterSlugs,
  workSlug,
}: {
  availableChapterSlugs: string[];
  workSlug: string;
}) {
  const [chapter, setChapter] = useState<ChapterHistoryEntry | null>(null);

  useEffect(() => {
    function synchronize() {
      const storage = getBrowserStorage();
      if (!storage) {
        setChapter(null);
        return;
      }

      const latest = getLatestChapterForWork(
        readReadingHistory(storage),
        workSlug,
      );
      setChapter(
        latest && availableChapterSlugs.includes(latest.chapterSlug)
          ? latest
          : null,
      );
    }

    synchronize();
    window.addEventListener(historyUpdatedEvent, synchronize);
    window.addEventListener("storage", synchronize);
    return () => {
      window.removeEventListener(historyUpdatedEvent, synchronize);
      window.removeEventListener("storage", synchronize);
    };
  }, [availableChapterSlugs, workSlug]);

  if (!chapter) return null;

  return (
    <aside
      aria-labelledby="continue-reading-heading"
      className="work-continue-reading"
    >
      <p className="eyebrow">继续阅读</p>
      <h3 id="continue-reading-heading">继续阅读：{chapter.chapterTitle}</h3>
      <p>
        第 {chapter.chapterPosition} / {chapter.chapterCount} 章 · 阅读位置{" "}
        {chapter.progressPercent}%
      </p>
      <Link
        className="work-continue-action"
        href={`/works/${chapter.workSlug}/chapters/${chapter.chapterSlug}`}
      >
        从上次章节继续
      </Link>
    </aside>
  );
}
