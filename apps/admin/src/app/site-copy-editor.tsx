"use client";

import type { SiteCopyContent, SiteCopyFieldId } from "@fandom-harbor/services";
import { useActionState, useMemo, useRef, useState } from "react";

import {
  completedBaseline,
  prepareSiteCopyReview,
  resultMatchesIntent,
  type SiteCopyEditorBaseline,
  type SiteCopyReviewErrors,
  type SiteCopyReviewIntent,
} from "../lib/site-copy-editor-state";
import { ADMIN_SITE_COPY_GROUPS } from "../lib/site-copy-fields";
import {
  INITIAL_SITE_COPY_SAVE_STATE,
  type SiteCopySaveActionState,
} from "../lib/site-copy-save-contract";
import { saveSiteCopyAction } from "./site-copy/actions";

interface SiteCopyEditorProps {
  initialContent: SiteCopyContent;
  initialRevisionId: string;
  initialVersion: string;
}

const inputClass =
  "mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

const fieldLabels = {} as Record<SiteCopyFieldId, string>;
for (const group of ADMIN_SITE_COPY_GROUPS) {
  for (const [field, label] of group.fields) {
    fieldLabels[field] = label;
  }
}

function codePointLength(value: string): number {
  return [...value.normalize("NFC").replace(/^ +| +$/gu, "")].length;
}

function ResultPanel({
  intent,
  onContinue,
  onEdit,
  onReload,
  result,
}: {
  intent: SiteCopyReviewIntent;
  onContinue: () => void;
  onEdit: () => void;
  onReload: () => void;
  result: SiteCopySaveActionState;
}) {
  if (result.status === "saved") {
    return (
      <section
        className="rounded-card border border-primary/40 bg-surface-muted p-5"
        role="status"
      >
        <p className="eyebrow">Saved</p>
        <h3 className="mt-2 text-xl font-semibold">站点文案已原子保存</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          新数据库 Version 为{" "}
          <span className="font-mono text-foreground">{result.version}</span>
          。数据库同时创建了不可编辑的 Audit #{
            result.auditLogId
          }，记录时间为 {new Date(result.updatedAt).toLocaleString("zh-CN")}。
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          {result.changedFields.map((field) => (
            <li key={field}>{fieldLabels[field]}</li>
          ))}
        </ul>
        <button
          className="mt-5 min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
          onClick={onContinue}
          type="button"
        >
          继续编辑
        </button>
      </section>
    );
  }

  if (result.status === "unchanged") {
    return (
      <section
        className="rounded-card border border-border bg-surface-muted p-5"
        role="status"
      >
        <p className="eyebrow">Unchanged</p>
        <h3 className="mt-2 text-xl font-semibold">没有实际变化</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          数据库确认规范化后的内容与当前 Version {result.version}
          相同，因此没有创建新 Revision 或 Audit。
        </p>
        <button
          className="mt-5 min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium"
          onClick={onContinue}
          type="button"
        >
          返回编辑
        </button>
      </section>
    );
  }

  if (result.status === "conflict") {
    return (
      <section
        className="rounded-card border border-destructive/50 bg-surface-muted p-5"
        role="alert"
      >
        <p className="eyebrow">Conflict</p>
        <h3 className="mt-2 text-xl font-semibold">数据已被其他会话更新</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          当前数据库已是 Version{" "}
          <span className="font-mono text-foreground">
            {result.currentVersion}
          </span>
          。你的八字段输入和变更说明仍保留；系统没有覆盖新版本，也不会自动重试。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium"
            onClick={onEdit}
            type="button"
          >
            返回编辑并保留输入
          </button>
          <button
            className="min-h-11 rounded-control border border-destructive px-4 text-sm font-medium text-destructive"
            onClick={onReload}
            type="button"
          >
            重新读取并放弃本地输入
          </button>
        </div>
      </section>
    );
  }

  if (result.status === "error") {
    return (
      <section
        className="rounded-card border border-destructive/50 bg-surface-muted p-5"
        role="alert"
      >
        <p className="eyebrow">Save failed</p>
        <h3 className="mt-2 text-xl font-semibold">保存未完成</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {result.message}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          安全错误代码：{result.code}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium"
            onClick={onEdit}
            type="button"
          >
            返回编辑并保留输入
          </button>
          <p className="self-center text-sm text-muted-foreground">
            直接再次保存会复用 Request ID {intent.requestId}。
          </p>
        </div>
      </section>
    );
  }

  return null;
}

function HiddenSaveFields({ intent }: { intent: SiteCopyReviewIntent }) {
  return (
    <>
      <input name="baseVersion" type="hidden" value={intent.baseVersion} />
      <input
        name="baseRevisionId"
        type="hidden"
        value={intent.baseRevisionId}
      />
      <input name="requestId" type="hidden" value={intent.requestId} />
      <input name="reason" type="hidden" value={intent.reason} />
      {Object.entries(intent.content).map(([field, value]) => (
        <input key={field} name={field} type="hidden" value={value} />
      ))}
    </>
  );
}

export function SiteCopyEditor({
  initialContent,
  initialRevisionId,
  initialVersion,
}: SiteCopyEditorProps) {
  const [baseline, setBaseline] = useState<SiteCopyEditorBaseline>({
    content: initialContent,
    revisionId: initialRevisionId,
    version: initialVersion,
  });
  const [draft, setDraft] = useState<SiteCopyContent>(initialContent);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<SiteCopyReviewErrors>({
    fields: {},
  });
  const [intent, setIntent] = useState<SiteCopyReviewIntent | null>(null);
  const [conflictVersion, setConflictVersion] = useState<string | null>(null);
  const [saveState, saveAction, pending] = useActionState(
    saveSiteCopyAction,
    INITIAL_SITE_COPY_SAVE_STATE,
  );
  const submissionLocked = useRef(false);
  const activeResult = useMemo(
    () =>
      resultMatchesIntent(intent, saveState)
        ? saveState
        : INITIAL_SITE_COPY_SAVE_STATE,
    [intent, saveState],
  );

  function updateField(field: SiteCopyFieldId, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      fields: { ...current.fields, [field]: undefined },
    }));
  }

  function beginReview() {
    if (conflictVersion !== null) return;
    const preparation = prepareSiteCopyReview({
      baseline,
      draft,
      reason,
    });
    if (preparation.status === "invalid") {
      setErrors(preparation.errors);
      return;
    }

    setErrors({ fields: {} });
    submissionLocked.current = false;
    setIntent(preparation.intent);
  }

  function returnToEdit() {
    if (pending) return;
    if (activeResult.status === "conflict") {
      setConflictVersion(activeResult.currentVersion);
    }
    submissionLocked.current = false;
    setIntent(null);
  }

  function continueEditing() {
    if (intent) {
      const completed = completedBaseline(intent, activeResult);
      if (completed) {
        setBaseline({
          content: completed.content,
          revisionId: completed.revisionId,
          version: completed.version,
        });
        setDraft(completed.content);
        setReason("");
        setConflictVersion(null);
      }
    }
    submissionLocked.current = false;
    setIntent(null);
  }

  function reloadAfterConflict() {
    if (
      window.confirm("重新读取会丢弃当前八字段输入和变更说明。确定继续吗？")
    ) {
      window.location.reload();
    }
  }

  if (!intent) {
    return (
      <section aria-labelledby="site-copy-editor-heading">
        <div className="mb-5">
          <p className="eyebrow">Edit</p>
          <h2
            className="mt-2 text-2xl font-semibold"
            id="site-copy-editor-heading"
          >
            编辑当前站点文案
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            当前基线为数据库 Version {baseline.version}
            。输入会先经过规范化与变更复核，不会在此步骤直接保存。
          </p>
        </div>

        {conflictVersion !== null ? (
          <section
            className="mb-6 rounded-card border border-destructive/50 bg-surface-muted p-5"
            role="alert"
          >
            <h3 className="font-semibold">仍需重新读取数据库 Version</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              数据库已更新到 Version {conflictVersion}
              。你的输入仍保留供检查或复制，但旧基线不能再次提交。
            </p>
            <button
              className="mt-4 min-h-11 rounded-control border border-destructive px-4 text-sm font-medium text-destructive"
              onClick={reloadAfterConflict}
              type="button"
            >
              重新读取并放弃本地输入
            </button>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          {ADMIN_SITE_COPY_GROUPS.map((group) => (
            <article
              className={[
                "rounded-card border border-border bg-surface p-5 sm:p-6",
                group.title === "Footer" ? "xl:col-span-2" : "",
              ].join(" ")}
              key={group.title}
            >
              <h3 className="text-xl font-semibold">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {group.description}
              </p>
              <div className="mt-5 space-y-5">
                {group.fields.map(([field, label]) => {
                  const multiline =
                    field === "homepage_introduction" ||
                    field === "footer_brand_note";
                  const fieldId = `site-copy-${field}`;
                  const value = draft[field];
                  const describedBy = errors.fields[field]
                    ? `${fieldId}-count ${fieldId}-error`
                    : `${fieldId}-count`;

                  return (
                    <label
                      className="block text-sm font-medium"
                      htmlFor={fieldId}
                      key={field}
                    >
                      {label}
                      {multiline ? (
                        <textarea
                          aria-describedby={describedBy}
                          aria-invalid={Boolean(errors.fields[field])}
                          className={inputClass}
                          id={fieldId}
                          name={field}
                          onChange={(event) =>
                            updateField(field, event.target.value)
                          }
                          rows={field === "homepage_introduction" ? 5 : 3}
                          value={value}
                        />
                      ) : (
                        <input
                          aria-describedby={describedBy}
                          aria-invalid={Boolean(errors.fields[field])}
                          className={inputClass}
                          id={fieldId}
                          name={field}
                          onChange={(event) =>
                            updateField(field, event.target.value)
                          }
                          type="text"
                          value={value}
                        />
                      )}
                      <span
                        className="mt-1 block text-xs font-normal text-muted-foreground"
                        id={`${fieldId}-count`}
                      >
                        {codePointLength(value)} 个 Unicode 字符
                      </span>
                      {errors.fields[field] ? (
                        <span
                          className="mt-1 block text-sm font-normal text-destructive"
                          id={`${fieldId}-error`}
                          role="alert"
                        >
                          {errors.fields[field]}
                        </span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-card border border-border bg-surface p-5 sm:p-6">
          <label
            className="block text-sm font-medium"
            htmlFor="site-copy-reason"
          >
            变更说明
            <textarea
              aria-describedby={
                errors.reason
                  ? "site-copy-reason-count site-copy-reason-error"
                  : "site-copy-reason-count"
              }
              aria-invalid={Boolean(errors.reason)}
              className={inputClass}
              id="site-copy-reason"
              name="reason"
              onChange={(event) => {
                setReason(event.target.value);
                setErrors((current) => ({
                  ...current,
                  reason: undefined,
                }));
              }}
              placeholder="说明本次调整的目的，4–200 个 Unicode 字符"
              rows={4}
              value={reason}
            />
            <span
              className="mt-1 block text-xs font-normal text-muted-foreground"
              id="site-copy-reason-count"
            >
              {codePointLength(reason)} / 200 个 Unicode 字符
            </span>
            {errors.reason ? (
              <span
                className="mt-1 block text-sm font-normal text-destructive"
                id="site-copy-reason-error"
                role="alert"
              >
                {errors.reason}
              </span>
            ) : null}
          </label>
          <button
            className="mt-5 min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
            disabled={conflictVersion !== null}
            onClick={beginReview}
            type="button"
          >
            复核变更
          </button>
        </section>
      </section>
    );
  }

  return (
    <section aria-labelledby="site-copy-review-heading">
      <div className="mb-5">
        <p className="eyebrow">Review changes</p>
        <h2
          className="mt-2 text-2xl font-semibold"
          id="site-copy-review-heading"
        >
          保存前复核
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          复核基于 NFC、首尾空白移除后的值。Request ID{" "}
          <span className="break-all font-mono">{intent.requestId}</span>{" "}
          会在相同 payload 的安全重试中保持不变。
        </p>
      </div>

      <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <h3 className="text-xl font-semibold">实际变化</h3>
        {intent.changedFields.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            规范化后没有字段变化。提交后数据库将返回 Unchanged，不会创建 Audit。
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {intent.changedFields.map((field) => (
              <article
                className="rounded-card border border-border bg-surface-muted p-4"
                key={field}
              >
                <h4 className="font-medium">{fieldLabels[field]}</h4>
                <dl className="mt-3 grid gap-4 lg:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">当前值</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                      {baseline.content[field]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">保存后</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                      {intent.content[field]}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-sm font-medium">变更说明</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {intent.reason}
          </p>
        </div>
      </section>

      <form
        action={saveAction}
        className="mt-6 rounded-card border border-border bg-surface-muted p-5 sm:p-6"
        onSubmit={(event) => {
          if (submissionLocked.current || pending) {
            event.preventDefault();
            return;
          }
          submissionLocked.current = true;
        }}
      >
        <HiddenSaveFields intent={intent} />
        <p className="text-sm leading-6 text-muted-foreground">
          保存将以 Version {intent.baseVersion} 和当前 Revision
          为乐观并发基线，由数据库原子写入内容、Revision、Audit 与 Current
          Pointer。
        </p>
        {activeResult.status === "saved" ||
        activeResult.status === "unchanged" ? null : (
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
              onClick={returnToEdit}
              type="button"
            >
              返回编辑
            </button>
            {activeResult.status === "conflict" ? null : (
              <button
                className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pending}
                onClick={() => {
                  if (activeResult.status === "error") {
                    submissionLocked.current = false;
                  }
                }}
                type="submit"
              >
                {pending
                  ? "保存中…"
                  : activeResult.status === "error"
                    ? "使用同一 Request ID 重试"
                    : intent.changedFields.length === 0
                      ? "确认无变化"
                      : "确认并保存"}
              </button>
            )}
          </div>
        )}
        {pending ? (
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            正在原子保存，请勿关闭页面或重复提交。
          </p>
        ) : null}
      </form>

      {activeResult.status === "idle" ? null : (
        <div className="mt-6">
          <ResultPanel
            intent={intent}
            onContinue={continueEditing}
            onEdit={returnToEdit}
            onReload={reloadAfterConflict}
            result={activeResult}
          />
        </div>
      )}
    </section>
  );
}
