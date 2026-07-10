"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";

import { submitDraftEditor, type SaveDraftBodyActionState } from "./actions";

const textareaClassName =
  "mt-2 min-h-[28rem] w-full resize-y rounded-control border border-border bg-surface px-4 py-3 leading-7 text-foreground outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus";

interface DraftBodyFormProps {
  initialBody: string;
  saved: boolean;
  workId: string;
}

export function DraftBodyForm({
  initialBody,
  saved,
  workId,
}: DraftBodyFormProps) {
  const [body, setBody] = useState(initialBody);
  const [intent, setIntent] = useState<"publish" | "save">("save");
  const [actionState, action, pending] = useActionState<
    SaveDraftBodyActionState,
    FormData
  >(submitDraftEditor, {});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (pending) event.preventDefault();
  }

  return (
    <form action={action} className="site-stack" onSubmit={handleSubmit}>
      <input name="workId" type="hidden" value={workId} />

      <section
        aria-labelledby="draft-body-heading"
        className="reading-card max-w-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold" id="draft-body-heading">
            正文
          </h2>
          <p aria-label="正文字数" className="text-sm text-muted-foreground">
            {body.length} 字
          </p>
        </div>
        <label className="mt-5 block font-medium" htmlFor="draft-body">
          草稿正文
        </label>
        <textarea
          aria-describedby="draft-body-help"
          className={textareaClassName}
          id="draft-body"
          name="body"
          onChange={(event) => setBody(event.target.value)}
          placeholder="从这里开始写正文。点击“保存正文”后才会写入当前 draft。"
          value={body}
        />
        <p className="mt-2 text-sm text-muted-foreground" id="draft-body-help">
          仅保存当前 draft 的首个 Chapter，不会改变作品状态，也不会触发发布。
        </p>
      </section>

      {saved ? (
        <p
          aria-live="polite"
          className="rounded-control border border-border bg-surface p-4 text-sm text-foreground"
        >
          正文草稿已保存。
        </p>
      ) : null}

      {actionState.error ? (
        <p
          aria-live="assertive"
          className="rounded-control border border-destructive/40 bg-surface p-4 text-sm text-destructive"
          role="alert"
        >
          {actionState.error}
        </p>
      ) : null}

      <aside
        aria-label="草稿编辑操作"
        className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 shadow-lg"
      >
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="text-primary" href="/studio/works">
            返回作品列表
          </Link>
          <Link className="text-primary" href="/studio">
            返回 Studio
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            name="intent"
            onClick={() => setIntent("save")}
            type="submit"
            value="save"
          >
            {pending && intent === "save" ? "保存中…" : "保存正文"}
          </button>
          <button
            className="min-h-11 rounded-control border border-border px-4 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
            name="intent"
            onClick={() => setIntent("publish")}
            type="submit"
            value="publish"
          >
            {pending && intent === "publish" ? "发布中…" : "发布到 Reader"}
          </button>
        </div>
      </aside>
    </form>
  );
}
