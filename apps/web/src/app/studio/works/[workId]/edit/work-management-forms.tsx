"use client";

import type { Chapter } from "@fandom-harbor/services";
import { useActionState } from "react";

import {
  publishWorkChapters,
  saveWorkChapter,
  saveWorkTags,
  type StudioEditorActionState,
} from "./actions";

const fieldClass =
  "mt-2 w-full rounded-control border border-border bg-surface px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-focus";

function ActionError({ state }: { state: StudioEditorActionState }) {
  return state.error ? (
    <p className="mt-3 text-sm text-destructive" role="alert">
      {state.error}
    </p>
  ) : null;
}

export function WorkManagementForms({
  chapters,
  tagNames,
  workId,
}: {
  chapters: Array<Chapter & { body: string }>;
  tagNames: string[];
  workId: string;
}) {
  const [tagState, tagAction, tagPending] = useActionState(saveWorkTags, {});
  const [newState, newAction, newPending] = useActionState(saveWorkChapter, {});
  const [publishState, publishAction, publishPending] = useActionState(
    publishWorkChapters,
    {},
  );

  return (
    <div className="site-stack">
      <form action={tagAction} className="reading-card max-w-none">
        <input name="workId" type="hidden" value={workId} />
        <h2 className="text-xl font-semibold">作品标签</h2>
        <label className="mt-4 block font-medium" htmlFor="work-tags">
          标签（使用逗号分隔）
        </label>
        <input
          className={fieldClass}
          defaultValue={tagNames.join("，")}
          id="work-tags"
          name="tags"
          placeholder="剧情，治愈，自定义标签"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          可新增、移除或替换标签；空标签和重复标签会被过滤。
        </p>
        <button
          className="mt-4 min-h-11 rounded-control bg-primary px-4 text-primary-foreground disabled:opacity-60"
          disabled={tagPending}
          type="submit"
        >
          {tagPending ? "保存中…" : "保存标签"}
        </button>
        <ActionError state={tagState} />
      </form>

      <section className="site-stack" aria-labelledby="chapter-manager-heading">
        <div>
          <p className="eyebrow">Chapter Manager</p>
          <h2
            className="mt-2 text-2xl font-semibold"
            id="chapter-manager-heading"
          >
            章节管理
          </h2>
        </div>
        {chapters.map((chapter) => (
          <ChapterEditor chapter={chapter} key={chapter.id} workId={workId} />
        ))}
      </section>

      <form action={newAction} className="reading-card max-w-none">
        <input name="workId" type="hidden" value={workId} />
        <input name="chapterId" type="hidden" value="" />
        <h2 className="text-xl font-semibold">新建章节</h2>
        <label className="mt-4 block font-medium" htmlFor="new-chapter-title">
          章节标题
        </label>
        <input
          className={fieldClass}
          id="new-chapter-title"
          name="title"
          required
        />
        <label className="mt-4 block font-medium" htmlFor="new-chapter-body">
          章节正文
        </label>
        <textarea
          className={`${fieldClass} min-h-48`}
          id="new-chapter-body"
          name="body"
        />
        <button
          className="mt-4 min-h-11 rounded-control bg-primary px-4 text-primary-foreground disabled:opacity-60"
          disabled={newPending}
          type="submit"
        >
          {newPending ? "创建中…" : "保存章节草稿"}
        </button>
        <ActionError state={newState} />
      </form>

      <form action={publishAction} className="reading-card max-w-none">
        <input name="workId" type="hidden" value={workId} />
        <h2 className="text-xl font-semibold">选择发布章节</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          勾选随作品公开的章节；未勾选章节保持或转为草稿，仅在 Studio 可见。
        </p>
        <div className="mt-4 grid gap-3">
          {chapters.map((chapter) => (
            <label
              className="flex min-h-11 items-center gap-3"
              key={chapter.id}
            >
              <input
                defaultChecked={chapter.status === "published"}
                name="chapterIds"
                type="checkbox"
                value={chapter.id}
              />
              <span>
                第 {chapter.position} 章：{chapter.title}
              </span>
            </label>
          ))}
        </div>
        <button
          className="mt-4 min-h-11 rounded-control bg-primary px-4 text-primary-foreground disabled:opacity-60"
          disabled={publishPending || chapters.length === 0}
          type="submit"
        >
          {publishPending ? "发布中…" : "发布所选章节"}
        </button>
        <ActionError state={publishState} />
      </form>
    </div>
  );
}

function ChapterEditor({
  chapter,
  workId,
}: {
  chapter: Chapter & { body: string };
  workId: string;
}) {
  const [state, action, pending] = useActionState(saveWorkChapter, {});
  return (
    <form action={action} className="reading-card max-w-none">
      <input name="workId" type="hidden" value={workId} />
      <input name="chapterId" type="hidden" value={chapter.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">第 {chapter.position} 章</h3>
        <span className="rounded-full border border-border px-2 py-1 text-xs">
          {chapter.status === "published" ? "已发布" : "草稿"}
        </span>
      </div>
      <label className="mt-4 block font-medium" htmlFor={`title-${chapter.id}`}>
        章节标题
      </label>
      <input
        className={fieldClass}
        defaultValue={chapter.title}
        id={`title-${chapter.id}`}
        name="title"
        required
      />
      <label className="mt-4 block font-medium" htmlFor={`body-${chapter.id}`}>
        章节正文
      </label>
      <textarea
        className={`${fieldClass} min-h-64`}
        defaultValue={chapter.body}
        id={`body-${chapter.id}`}
        name="body"
      />
      <button
        className="mt-4 min-h-11 rounded-control border border-border px-4 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "保存中…" : "保存章节"}
      </button>
      <ActionError state={state} />
    </form>
  );
}
