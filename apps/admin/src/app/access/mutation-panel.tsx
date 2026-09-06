"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { IdentityAccessMembershipState } from "@fandom-harbor/services";

import {
  INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
  type AccessGovernanceMutationActionState,
  type AccessGovernanceReview,
} from "../../lib/access-governance-mutation";
import { ADMIN_MEMBERSHIP_LABELS } from "../../lib/admin-presentation";
import { governOrdinaryAccessAction } from "./actions";

interface AccessMutationPanelProps {
  authorActive: boolean;
  expectedStateToken: string;
  isElevatedAccount: boolean;
  membershipState: IdentityAccessMembershipState;
  registrationName: string | null;
  targetUserId: string;
}

function operationLabel(review: AccessGovernanceReview): string {
  switch (review.operation) {
    case "grantAuthorRole":
      return "授予作者权限";
    case "revokeAuthorRole":
      return "撤销作者权限";
    case "setOrdinaryMembershipState":
      return `将成员资格设为 ${ADMIN_MEMBERSHIP_LABELS[review.state ?? "active"]}`;
  }
}

function ResultNotice({
  state,
}: {
  state: AccessGovernanceMutationActionState;
}) {
  if (state.status === "idle" || state.status === "review") return null;
  if (state.status === "saved" || state.status === "unchanged") {
    return (
      <div
        className="min-w-0 max-w-full rounded-card border border-border bg-surface-muted p-4"
        role="status"
      >
        <p className="font-medium">
          {state.status === "saved" ? "已保存" : "无变更"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {state.status === "saved"
            ? "数据库已原子完成一次业务变化、请求台账与审计记录。详情和审计记录正在刷新。"
            : "数据库确认当前状态已符合目标；没有业务变化，也没有伪审计记录。"}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
          请求编号 {state.requestId}
        </p>
      </div>
    );
  }
  if (state.status === "conflict") {
    return (
      <div
        className="min-w-0 max-w-full rounded-card border border-destructive/50 bg-surface-muted p-4"
        role="alert"
      >
        <p className="font-medium">状态冲突 · 必须重新读取并复核</p>
        <p className="mt-2 text-sm text-muted-foreground">
          当前成员资格为{" "}
          {ADMIN_MEMBERSHIP_LABELS[state.current.membershipState]}
          ，作者权限为 {state.current.authorActive ? "已启用" : "未启用"}
          。旧确认已失效，系统不会自动覆盖或重试。
        </p>
        <button
          className="mt-4 min-h-11 max-w-full whitespace-normal rounded-control border border-border bg-surface px-4 text-center text-sm font-medium"
          onClick={() => window.location.reload()}
          type="button"
        >
          刷新详情并重新复核
        </button>
      </div>
    );
  }
  if (state.status !== "invalid" && state.status !== "error") return null;
  return (
    <div
      className="min-w-0 max-w-full rounded-card border border-destructive/50 bg-surface-muted p-4"
      role="alert"
    >
      <p className="font-medium">
        {state.status === "invalid" ? "输入无效" : "操作未完成"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
      {state.status === "error" ? (
        <p className="mt-2 text-xs text-muted-foreground">
          安全错误代码：{state.code}
        </p>
      ) : null}
    </div>
  );
}

function ReviewPanel({
  action,
  pending,
  review,
  submissionLockedRef,
}: {
  action: (payload: FormData) => void;
  pending: boolean;
  review: AccessGovernanceReview;
  submissionLockedRef: React.MutableRefObject<boolean>;
}) {
  return (
    <form
      action={action}
      className="min-w-0 max-w-full rounded-card border border-border bg-surface p-5 sm:p-6"
      aria-labelledby="access-review-heading"
      onSubmit={(event) => {
        const submitter = event.nativeEvent.submitter;
        if (
          submitter instanceof HTMLButtonElement &&
          submitter.value === "confirm"
        ) {
          if (submissionLockedRef.current || pending) {
            event.preventDefault();
            return;
          }
          submissionLockedRef.current = true;
        }
      }}
    >
      <p className="eyebrow">复核并确认</p>
      <h3 className="mt-2 text-xl font-semibold" id="access-review-heading">
        最终确认前复核
      </h3>
      <dl className="mt-5 grid min-w-0 gap-4 text-sm lg:grid-cols-[repeat(2,minmax(0,1fr))]">
        <div className="min-w-0">
          <dt className="text-muted-foreground">目标身份</dt>
          <dd className="mt-1 break-words font-medium [overflow-wrap:anywhere]">
            {review.registrationName ?? "未设置注册名"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">用户编号</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {review.targetUserId}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">当前成员资格</dt>
          <dd className="mt-1">
            {ADMIN_MEMBERSHIP_LABELS[review.currentMembershipState]}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">当前作者权限</dt>
          <dd className="mt-1">{review.authorActive ? "已启用" : "未启用"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">操作</dt>
          <dd className="mt-1 font-medium">{operationLabel(review)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">保护规则</dt>
          <dd className="mt-1">仅限普通账号 · 数据库为最终权威</dd>
        </div>
      </dl>
      <div className="mt-5 border-t border-border pt-5">
        <p className="text-sm font-medium">规范化原因</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
          {review.reason}
        </p>
        <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
          请求编号 {review.requestId}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
          预期状态 {review.expectedStateToken}
        </p>
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        确认后将重新验证当前会话、正常成员资格、实时管理员/超级管理员角色与后台
        操作权限；已保存会原子创建请求台账与一次审计记录。
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium"
          disabled={pending}
          name="intent"
          type="submit"
          value="cancel"
        >
          取消
        </button>
        <button
          className="min-h-11 rounded-control bg-primary px-4 text-sm font-medium text-primary-foreground"
          disabled={pending}
          name="intent"
          type="submit"
          value="confirm"
        >
          {pending ? "提交中…" : "确认并执行"}
        </button>
      </div>
    </form>
  );
}

function MutationForm({
  action,
  children,
  expectedStateToken,
  operation,
  targetUserId,
}: {
  action: (payload: FormData) => void;
  children?: React.ReactNode;
  expectedStateToken: string;
  operation: string;
  targetUserId: string;
}) {
  return (
    <form action={action} className="min-w-0 max-w-full">
      <input name="intent" type="hidden" value="review" />
      <input name="operation" type="hidden" value={operation} />
      <input name="targetUserId" type="hidden" value={targetUserId} />
      <input
        name="expectedStateToken"
        type="hidden"
        value={expectedStateToken}
      />
      {children}
      <label className="mt-4 block text-sm font-medium">
        变更原因
        <textarea
          className="mt-2 min-h-24 w-full min-w-0 max-w-full rounded-control border border-border bg-background px-3 py-2"
          name="reason"
          placeholder="4–200 个字符；不允许换行或控制字符"
          required
          rows={3}
        />
      </label>
      <button
        className="mt-4 min-h-11 rounded-control border border-border bg-background px-4 text-sm font-medium hover:bg-surface-muted"
        type="submit"
      >
        进入复核
      </button>
    </form>
  );
}

export function AccessMutationPanel(props: AccessMutationPanelProps) {
  const [state, action, pending] = useActionState(
    governOrdinaryAccessAction,
    INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
  );
  const router = useRouter();
  const refreshed = useRef<string | null>(null);
  const submissionLockedRef = useRef(false);
  useEffect(() => {
    if (!pending) submissionLockedRef.current = false;
    if (
      state.status === "saved" ||
      state.status === "unchanged" ||
      state.status === "conflict"
    ) {
      const refreshKey = state.requestId ?? state.current.stateToken;
      if (refreshed.current !== refreshKey) {
        refreshed.current = refreshKey;
        router.refresh();
      }
    }
  }, [pending, router, state]);

  if (props.isElevatedAccount) {
    return (
      <section className="min-w-0 max-w-full rounded-card border border-border bg-surface-muted p-5 sm:p-6">
        <p className="eyebrow">受保护账号</p>
        <h2 className="mt-2 text-xl font-semibold">治理写入已延期</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          管理员/超级管理员账号仅可读取。成员资格与角色写入需要未来独立授权的重新
          身份验证或多重身份验证阶段；此处没有可执行控件或隐藏入口。
        </p>
      </section>
    );
  }

  const activeReview =
    state.status === "review"
      ? state.review
      : state.status === "error"
        ? state.retryReview
        : undefined;
  return (
    <div className="site-stack min-w-0 max-w-full">
      {activeReview ? (
        <ReviewPanel
          action={action}
          pending={pending}
          review={activeReview}
          submissionLockedRef={submissionLockedRef}
        />
      ) : state.status === "conflict" ? null : (
        <section
          className="grid min-w-0 max-w-full gap-4 lg:grid-cols-2"
          aria-labelledby="ordinary-governance-heading"
        >
          <div className="min-w-0 lg:col-span-2">
            <p className="eyebrow">普通权限管理</p>
            <h2
              className="mt-2 text-xl font-semibold"
              id="ordinary-governance-heading"
            >
              选择操作并说明原因
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              此步骤只准备复核，不会直接写入。
            </p>
          </div>
          <article className="min-w-0 max-w-full rounded-card border border-border bg-surface p-5">
            <h3 className="font-semibold">成员资格状态</h3>
            <MutationForm
              action={action}
              expectedStateToken={props.expectedStateToken}
              operation="setOrdinaryMembershipState"
              targetUserId={props.targetUserId}
            >
              <label className="mt-4 block text-sm font-medium">
                目标状态
                <select
                  className="mt-2 min-h-11 w-full min-w-0 max-w-full rounded-control border border-border bg-background px-3"
                  defaultValue={
                    props.membershipState === "pending"
                      ? "active"
                      : props.membershipState
                  }
                  name="state"
                >
                  <option value="active">正常</option>
                  <option value="suspended">已暂停</option>
                  <option value="revoked">已撤销</option>
                </select>
              </label>
            </MutationForm>
          </article>
          <article className="min-w-0 max-w-full rounded-card border border-border bg-surface p-5">
            <h3 className="font-semibold">作者权限</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              当前：{props.authorActive ? "已启用" : "未启用"}
            </p>
            {props.authorActive ? (
              <MutationForm
                action={action}
                expectedStateToken={props.expectedStateToken}
                operation="revokeAuthorRole"
                targetUserId={props.targetUserId}
              />
            ) : props.membershipState === "active" ? (
              <MutationForm
                action={action}
                expectedStateToken={props.expectedStateToken}
                operation="grantAuthorRole"
                targetUserId={props.targetUserId}
              />
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                只有正常成员资格可以授予作者权限。数据库仍会在提交时重新判定。
              </p>
            )}
          </article>
        </section>
      )}
      <ResultNotice state={state} />
    </div>
  );
}
