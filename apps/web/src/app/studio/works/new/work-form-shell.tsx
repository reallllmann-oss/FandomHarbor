"use client";

import type { ContentCategory, ContentTag } from "@fandom-harbor/services";
import { useActionState, useState, type FormEvent } from "react";

import { StudioFormActionBar } from "../../studio-form-action-bar";
import { createWorkStudioActions } from "../../studio-state-contract";
import { createWorkDraft, type CreateWorkDraftActionState } from "./actions";
import {
  EMPTY_WORK_FORM_VALUES,
  validateWorkForm,
  WORK_DESCRIPTION_MAX_LENGTH,
  WORK_TITLE_MAX_LENGTH,
  type WorkFormValues,
} from "./work-form-validation";

interface WorkFormShellProps {
  categories: readonly ContentCategory[];
  tags: readonly ContentTag[];
}

type TouchedFields = Partial<Record<"description" | "title", boolean>>;

const inputClassName =
  "mt-2 min-h-11 w-full rounded-control border border-border bg-surface px-3 py-2 text-foreground outline-none transition hover:border-primary/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-focus aria-[invalid=true]:border-destructive";

export function WorkFormShell({ categories, tags }: WorkFormShellProps) {
  const [values, setValues] = useState<WorkFormValues>(EMPTY_WORK_FORM_VALUES);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [actionState, action, pending] = useActionState<
    CreateWorkDraftActionState,
    FormData
  >(createWorkDraft, {});
  const errors = validateWorkForm(values);
  const hasErrors = Object.keys(errors).length > 0;

  function update<Key extends keyof WorkFormValues>(
    key: Key,
    value: WorkFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tag: string) {
    update(
      "tags",
      values.tags.includes(tag)
        ? values.tags.filter((candidate) => candidate !== tag)
        : [...values.tags, tag],
    );
  }

  function validateSubmission(event: FormEvent<HTMLFormElement>) {
    if (hasErrors) {
      event.preventDefault();
      setTouched({ description: true, title: true });
    }
  }

  function clearForm() {
    setValues(EMPTY_WORK_FORM_VALUES);
    setTouched({});
  }

  return (
    <form
      action={action}
      className="site-stack"
      noValidate
      onSubmit={validateSubmission}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section
          aria-labelledby="work-basics-heading"
          className="reading-card max-w-none"
        >
          <p className="eyebrow">Work Basics</p>
          <h2 className="mt-2 text-2xl font-semibold" id="work-basics-heading">
            作品信息
          </h2>

          <div className="mt-6 grid gap-6">
            <div>
              <label className="font-medium" htmlFor="work-title">
                作品标题 <span aria-hidden="true">*</span>
              </label>
              <input
                aria-describedby="work-title-help work-title-error"
                aria-invalid={Boolean(touched.title && errors.title)}
                autoComplete="off"
                className={inputClassName}
                id="work-title"
                maxLength={WORK_TITLE_MAX_LENGTH + 1}
                name="title"
                onBlur={() =>
                  setTouched((current) => ({ ...current, title: true }))
                }
                onChange={(event) => update("title", event.target.value)}
                placeholder="输入作品标题"
                type="text"
                value={values.title}
              />
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <p id="work-title-help">
                  必填，1–{WORK_TITLE_MAX_LENGTH} 个字符
                </p>
                <p aria-label="标题字数">
                  {values.title.length} / {WORK_TITLE_MAX_LENGTH}
                </p>
              </div>
              <p
                aria-live="polite"
                className="mt-2 text-sm text-destructive"
                id="work-title-error"
              >
                {touched.title ? errors.title : null}
              </p>
            </div>

            <div>
              <label className="font-medium" htmlFor="work-description">
                作品简介
              </label>
              <textarea
                aria-describedby="work-description-help work-description-error"
                aria-invalid={Boolean(
                  touched.description && errors.description,
                )}
                className={`${inputClassName} min-h-40 resize-y`}
                id="work-description"
                maxLength={WORK_DESCRIPTION_MAX_LENGTH + 1}
                name="summary"
                onBlur={() =>
                  setTouched((current) => ({ ...current, description: true }))
                }
                onChange={(event) => update("description", event.target.value)}
                placeholder="简要介绍作品内容、氛围或创作背景"
                value={values.description}
              />
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <p id="work-description-help">
                  最多 {WORK_DESCRIPTION_MAX_LENGTH} 个字符
                </p>
                <p aria-label="简介字数">
                  {values.description.length} / {WORK_DESCRIPTION_MAX_LENGTH}
                </p>
              </div>
              <p
                aria-live="polite"
                className="mt-2 text-sm text-destructive"
                id="work-description-error"
              >
                {touched.description ? errors.description : null}
              </p>
            </div>

            <div>
              <label className="font-medium" htmlFor="work-category">
                分类
              </label>
              <select
                className={inputClassName}
                id="work-category"
                name="categoryId"
                onChange={(event) => update("category", event.target.value)}
                value={values.category}
              >
                <option value="">暂不选择</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                分类来自内容数据库。
              </p>
            </div>

            <fieldset>
              <legend className="font-medium">标签</legend>
              <p className="mt-2 text-xs text-muted-foreground">
                可选择多个当前有效标签。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-border px-3 py-2 hover:border-primary focus-within:ring-2 focus-within:ring-focus"
                    key={tag.id}
                  >
                    <input
                      checked={values.tags.includes(tag.id)}
                      name="tagIds"
                      onChange={() => toggleTag(tag.id)}
                      type="checkbox"
                      value={tag.id}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <aside className="site-stack">
          <section aria-labelledby="cover-heading" className="stat-card">
            <p className="eyebrow">Cover</p>
            <h2 className="mt-2 text-lg font-semibold" id="cover-heading">
              封面占位
            </h2>
            <div className="mt-4 grid aspect-[2/3] place-items-center rounded-card border border-dashed border-border bg-surface-muted p-5 text-center text-sm text-muted-foreground">
              封面上传将在后续独立 Sprint 开放
            </div>
          </section>

          <section aria-labelledby="shell-status-heading" className="stat-card">
            <h2 className="text-lg font-semibold" id="shell-status-heading">
              草稿保存状态
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              只有点击“保存草稿”并收到成功响应后才会写入数据库。发布仍未开放。
            </p>
            <button
              className="mt-4 min-h-11 rounded-control border border-border px-4 text-sm hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={clearForm}
              type="button"
            >
              清空表单
            </button>
          </section>
        </aside>
      </div>

      {actionState.error ? (
        <p
          aria-live="assertive"
          className="rounded-control border border-destructive/40 bg-surface p-4 text-sm text-destructive"
          role="alert"
        >
          {actionState.error}
        </p>
      ) : null}

      <StudioFormActionBar
        actions={createWorkStudioActions}
        backHref="/studio/works"
        backLabel="返回作品列表"
        submitActionLabel="保存草稿"
        submitDisabled={hasErrors}
        submitPending={pending}
      />
    </form>
  );
}
