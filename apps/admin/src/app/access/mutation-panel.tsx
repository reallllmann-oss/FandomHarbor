"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { IdentityAccessMembershipState } from "@fandom-harbor/services";

import {
  INITIAL_ACCESS_GOVERNANCE_MUTATION_STATE,
  type AccessGovernanceMutationActionState,
  type AccessGovernanceReview,
} from "../../lib/access-governance-mutation";
import { governOrdinaryAccessAction } from "./actions";

interface AccessMutationPanelProps {
  authorActive: boolean;
  expectedStateToken: string;
  isElevatedAccount: boolean;
  membershipState: IdentityAccessMembershipState;
  registrationName: string | null;
  targetUserId: string;
}

const membershipLabels: Readonly<
  Record<IdentityAccessMembershipState, string>
> = {
  active: "Active",
  pending: "Pending",
  revoked: "Revoked",
  suspended: "Suspended",
};

function operationLabel(review: AccessGovernanceReview): string {
  switch (review.operation) {
    case "grantAuthorRole":
      return "授予 Author Role";
    case "revokeAuthorRole":
      return "撤销 Author Role";
    case "setOrdinaryMembershipState":
      return `将 Membership 设为 ${membershipLabels[review.state ?? "active"]}`;
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
        className="rounded-card border border-border bg-surface-muted p-4"
        role="status"
      >
        <p className="font-medium">
          {state.status === "saved" ? "Saved" : "Unchanged"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {state.status === "saved"
            ? "数据库已原子完成一次业务变化、Ledger 与 Audit。详情和 Audit 正在刷新。"
            : "数据库确认当前状态已符合目标；没有业务变化，也没有伪 Audit。"}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
          Request ID {state.requestId}
        </p>
      </div>
    );
  }
  if (state.status === "conflict") {
    return (
      <div
        className="rounded-card border border-destructive/50 bg-surface-muted p-4"
        role="alert"
      >
        <p className="font-medium">Conflict · 必须重新读取并复核</p>
        <p className="mt-2 text-sm text-muted-foreground">
          当前 Membership 为 {membershipLabels[state.current.membershipState]}
          ，Author 为 {state.current.authorActive ? "Active" : "Inactive"}
          。旧确认已失效，系统不会自动覆盖或重试。
        </p>
        <button
          className="mt-4 min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium"
          onClick={() => window.location.reload()}
          type="button"
        >
          刷新详情并重新 Review
        </button>
      </div>
    );
  }
  if (state.status !== "invalid" && state.status !== "error") return null;
  return (
    <div
      className="rounded-card border border-destructive/50 bg-surface-muted p-4"
      role="alert"
    >
      <p className="font-medium">
        {state.status === "invalid" ? "输入无效" : state.code}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
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
      className="rounded-card border border-border bg-surface p-5 sm:p-6"
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
      <p className="eyebrow">Review and confirm</p>
      <h3 className="mt-2 text-xl font-semibold" id="access-review-heading">
        最终确认前复核
      </h3>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">目标身份</dt>
          <dd className="mt-1 font-medium">
            {review.registrationName ?? "未设置注册名"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Public User ID</dt>
          <dd className="mt-1 break-all font-mono text-xs">
            {review.targetUserId}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">当前 Membership</dt>
          <dd className="mt-1">
            {membershipLabels[review.currentMembershipState]}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">当前 Author</dt>
          <dd className="mt-1">
            {review.authorActive ? "Active" : "Inactive"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">操作</dt>
          <dd className="mt-1 font-medium">{operationLabel(review)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Protection</dt>
          <dd className="mt-1">Ordinary account only · DB final authority</dd>
        </div>
      </dl>
      <div className="mt-5 border-t border-border pt-5">
        <p className="text-sm font-medium">规范化原因</p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
          {review.reason}
        </p>
        <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
          Request ID {review.requestId}
        </p>
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
          Expected state {review.expectedStateToken}
        </p>
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        确认后将重新验证当前 Session、active Membership、实时 Admin/Super Admin
        Role 与 admin:operate；Saved 会原子创建 Ledger 与一次 Audit。
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
    <form action={action}>
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
          className="mt-2 min-h-24 w-full rounded-control border border-border bg-background px-3 py-2"
          name="reason"
          placeholder="4–200 个 Unicode 字符；不允许换行或控制字符"
          required
          rows={3}
        />
      </label>
      <button
        className="mt-4 min-h-11 rounded-control border border-border bg-background px-4 text-sm font-medium hover:bg-surface-muted"
        type="submit"
      >
        进入 Review
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
      <section className="rounded-card border border-border bg-surface-muted p-5 sm:p-6">
        <p className="eyebrow">Protected account</p>
        <h2 className="mt-2 text-xl font-semibold">治理写入已延期</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Admin / Super Admin 账户仅可读取。Membership 与 Role
          写入需要未来独立授权的 Reauth/MFA 阶段；此处没有可执行控件或隐藏入口。
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
    <div className="site-stack">
      {activeReview ? (
        <ReviewPanel
          action={action}
          pending={pending}
          review={activeReview}
          submissionLockedRef={submissionLockedRef}
        />
      ) : state.status === "conflict" ? null : (
        <section
          className="grid gap-4 lg:grid-cols-2"
          aria-labelledby="ordinary-governance-heading"
        >
          <div className="lg:col-span-2">
            <p className="eyebrow">Ordinary governance</p>
            <h2
              className="mt-2 text-xl font-semibold"
              id="ordinary-governance-heading"
            >
              选择操作并说明原因
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              此步骤只准备 Review，不会直接写入。
            </p>
          </div>
          <article className="rounded-card border border-border bg-surface p-5">
            <h3 className="font-semibold">Membership 状态</h3>
            <MutationForm
              action={action}
              expectedStateToken={props.expectedStateToken}
              operation="setOrdinaryMembershipState"
              targetUserId={props.targetUserId}
            >
              <label className="mt-4 block text-sm font-medium">
                目标状态
                <select
                  className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
                  defaultValue={
                    props.membershipState === "pending"
                      ? "active"
                      : props.membershipState
                  }
                  name="state"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="revoked">Revoked</option>
                </select>
              </label>
            </MutationForm>
          </article>
          <article className="rounded-card border border-border bg-surface p-5">
            <h3 className="font-semibold">Author Role</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              当前：{props.authorActive ? "Active" : "Inactive"}
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
                只有 active Membership 可以授予
                Author。数据库仍会在提交时重新判定。
              </p>
            )}
          </article>
        </section>
      )}
      <ResultNotice state={state} />
    </div>
  );
}
