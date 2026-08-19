import type {
  IdentityAccessGovernanceAuditChange,
  IdentityAccessGovernanceAuditSummary,
  IdentityAccessMembershipState,
  IdentityAccessSubjectDetail,
  IdentityAccessSubjectSummary,
} from "@fandom-harbor/services";
import { redirect } from "next/navigation";

import {
  encodeAuditCursor,
  encodeSubjectCursor,
  loadAccessGovernancePageData,
  type AccessGovernancePageData,
  type AccessGovernanceReadError,
  type AccessGovernanceSearchParams,
} from "../../lib/access-governance-data";

export const dynamic = "force-dynamic";

type RenderableAccessGovernancePageData = Exclude<
  AccessGovernancePageData,
  { status: "forbidden" | "unauthenticated" }
>;

const membershipLabels: Readonly<
  Record<IdentityAccessMembershipState, string>
> = {
  active: "Active",
  pending: "Pending",
  revoked: "Revoked",
  suspended: "Suspended",
};

const readErrorCopy: Readonly<
  Record<AccessGovernanceReadError, { description: string; title: string }>
> = {
  "invalid-request": {
    description: "查询或分页信息无效。请清除当前条件后重新查询。",
    title: "无法读取这组查询条件",
  },
  "subject-unavailable": {
    description: "该身份当前不存在或无法通过治理读取合同展示。",
    title: "身份详情不可用",
  },
  "temporarily-unavailable": {
    description: "受控读取链路暂时不可用。没有执行任何权限写入，请稍后重试。",
    title: "身份治理数据暂时不可用",
  },
};

function formatTimestamp(value: Date): string {
  return `${value.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

function displayRegistrationName(value: string | null): string {
  return value ?? "未设置注册名";
}

function accessHref(input: {
  auditCursor?: string;
  query?: string;
  searchCursor?: string;
  subject?: string;
}): string {
  const params = new URLSearchParams();
  if (input.query) params.set("q", input.query);
  if (input.searchCursor) params.set("cursor", input.searchCursor);
  if (input.subject) params.set("subject", input.subject);
  if (input.auditCursor) params.set("auditCursor", input.auditCursor);
  const query = params.toString();
  return query ? `/access?${query}` : "/access";
}

function MembershipBadge({ state }: { state: IdentityAccessMembershipState }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium">
      {membershipLabels[state]}
    </span>
  );
}

function RoleList({ roles }: { roles: readonly string[] }) {
  if (roles.length === 0) {
    return <span className="text-sm text-muted-foreground">Reader</span>;
  }
  return (
    <span className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <span
          className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium capitalize"
          key={role}
        >
          {role.replace("_", " ")}
        </span>
      ))}
    </span>
  );
}

function SubjectSummary({
  query,
  searchCursor,
  subject,
}: {
  query: string;
  searchCursor: string | null;
  subject: IdentityAccessSubjectSummary;
}) {
  return (
    <li>
      <a
        className="block rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        href={accessHref({
          query,
          searchCursor: searchCursor ?? undefined,
          subject: subject.userId.value,
        })}
      >
        <span className="flex flex-wrap items-start justify-between gap-3">
          <span>
            <span className="block font-semibold">
              {displayRegistrationName(subject.registrationName)}
            </span>
            <span className="mt-1 block break-all font-mono text-xs text-muted-foreground">
              {subject.userId.value}
            </span>
          </span>
          <MembershipBadge state={subject.membershipState} />
        </span>
        <span className="mt-4 block">
          <RoleList roles={subject.effectiveRoles} />
        </span>
        <span className="mt-3 block text-xs text-muted-foreground">
          Membership 更新于 {formatTimestamp(subject.membershipUpdatedAt)}
        </span>
      </a>
    </li>
  );
}

function DetailPanel({ detail }: { detail: IdentityAccessSubjectDetail }) {
  return (
    <section aria-labelledby="identity-detail-heading" className="site-stack">
      <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Identity / account summary</p>
            <h2
              className="mt-2 text-2xl font-semibold"
              id="identity-detail-heading"
            >
              {displayRegistrationName(detail.profile.registrationName)}
            </h2>
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
              {detail.profile.userId.value}
            </p>
          </div>
          <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium">
            只读
          </span>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Profile 创建
            </dt>
            <dd className="mt-1 text-sm">
              {formatTimestamp(detail.profile.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Profile 更新
            </dt>
            <dd className="mt-1 text-sm">
              {formatTimestamp(detail.profile.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="stat-card">
          <p className="eyebrow">Membership</p>
          <div className="mt-3">
            <MembershipBadge state={detail.membership.state} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">最近更新</dt>
              <dd className="mt-1">
                {formatTimestamp(detail.membership.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Admitted</dt>
              <dd className="mt-1">
                {detail.membership.admittedAt
                  ? formatTimestamp(detail.membership.admittedAt)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Suspended / revoked</dt>
              <dd className="mt-1">
                {detail.membership.suspendedAt
                  ? formatTimestamp(detail.membership.suspendedAt)
                  : detail.membership.revokedAt
                    ? formatTimestamp(detail.membership.revokedAt)
                    : "—"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Role / governance status</p>
          <div className="mt-3">
            <RoleList roles={detail.effectiveRoles} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Elevated account</dt>
              <dd className="mt-1 font-medium">
                {detail.isElevatedAccount ? "是 · 写入延期" : "否"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Only active Super Admin</dt>
              <dd className="mt-1 font-medium">
                {detail.isOnlyActiveSuperAdmin ? "是 · 数据库保护" : "否"}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <article className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <p className="eyebrow">Active role grants</p>
        {detail.activeRoleGrants.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            当前没有 active Role Grant；有效访问角色为 Reader。
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {detail.activeRoleGrants.map((grant) => (
              <li
                className="grid gap-2 py-4 sm:grid-cols-2"
                key={grant.grantId}
              >
                <div>
                  <p className="font-medium capitalize">
                    {grant.role.replace("_", " ")}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                    {grant.grantId}
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p>{formatTimestamp(grant.grantedAt)}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    授予者：{grant.grantedBy?.value ?? "系统"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-card border border-border bg-surface-muted p-5 sm:p-6">
        <p className="eyebrow">Expected state</p>
        <p className="mt-3 text-sm text-muted-foreground">
          数据库生成的只读状态指纹。P1-03 不使用它提交任何变更。
        </p>
        <code className="mt-3 block overflow-x-auto rounded-control border border-border bg-background p-3 text-xs">
          {detail.expectedState.token.value}
        </code>
      </article>
    </section>
  );
}

function describeChange(change: IdentityAccessGovernanceAuditChange | null) {
  if (change === null) return "—";
  if ("membershipState" in change) {
    return `Membership: ${membershipLabels[change.membershipState]}`;
  }
  return `Role: ${change.role.replace("_", " ")}`;
}

function auditActionLabel(
  action: IdentityAccessGovernanceAuditSummary["action"],
): string {
  switch (action) {
    case "membership.state_changed":
      return "Membership state changed";
    case "role.bootstrap_super_admin":
      return "Bootstrap Super Admin";
    case "role.granted":
      return "Role granted";
    case "role.revoked":
      return "Role revoked";
  }
}

function AuditPanel({
  data,
}: {
  data: Extract<AccessGovernancePageData, { status: "ready" }>;
}) {
  if (!data.selectedSubject || !data.auditPage) return null;
  const targetUserId = data.selectedSubject.profile.userId.value;

  return (
    <section
      aria-labelledby="governance-audit-heading"
      className="rounded-card border border-border bg-surface p-5 sm:p-6"
    >
      <p className="eyebrow">Governance audit</p>
      <h2 className="mt-2 text-xl font-semibold" id="governance-audit-heading">
        最近治理记录
      </h2>
      {data.auditPage.items.length === 0 ? (
        <div className="empty-state mt-5">
          <p className="font-medium">暂无相关治理记录</p>
          <p className="mt-2 text-sm text-muted-foreground">
            当前读取范围内没有 Membership 或 Role 治理 Audit。
          </p>
        </div>
      ) : (
        <ol className="mt-5 divide-y divide-border">
          {data.auditPage.items.map((event) => (
            <li className="py-5" key={event.auditId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {auditActionLabel(event.action)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.reason}
                  </p>
                </div>
                <time
                  className="text-xs text-muted-foreground"
                  dateTime={event.createdAt.toISOString()}
                >
                  {formatTimestamp(event.createdAt)}
                </time>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Actor</dt>
                  <dd className="mt-1 break-all">
                    {event.actor
                      ? `${displayRegistrationName(event.actor.registrationName)} · ${event.actor.userId.value}`
                      : "系统"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Before</dt>
                  <dd className="mt-1">{describeChange(event.before)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">After</dt>
                  <dd className="mt-1">{describeChange(event.after)}</dd>
                </div>
              </dl>
              <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
                Audit {event.auditId}
              </p>
            </li>
          ))}
        </ol>
      )}
      {data.auditPage.nextCursor ? (
        <a
          className="mt-5 inline-flex min-h-11 items-center rounded-control border border-border bg-background px-4 text-sm font-medium hover:bg-surface-muted"
          href={accessHref({
            auditCursor: encodeAuditCursor(data.auditPage.nextCursor),
            query: data.query,
            searchCursor: data.searchCursor ?? undefined,
            subject: targetUserId,
          })}
        >
          查看更早记录
        </a>
      ) : null}
    </section>
  );
}

function ReadErrorState({ error }: { error: AccessGovernanceReadError }) {
  const copy = readErrorCopy[error];
  return (
    <section className="empty-state" role="alert">
      <p className="eyebrow">Read error</p>
      <h1 className="mt-3 text-2xl font-semibold">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {copy.description}
      </p>
      <a
        className="mt-5 inline-flex min-h-11 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium hover:bg-background"
        href="/access"
      >
        返回身份目录
      </a>
    </section>
  );
}

export function AccessGovernanceView({
  data,
}: {
  data: RenderableAccessGovernancePageData;
}) {
  if (data.status === "read-error") {
    return <ReadErrorState error={data.error} />;
  }

  return (
    <div className="site-stack">
      <section className="hero-panel">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">Identity &amp; Access Governance</p>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            只读目录
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          身份与权限
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          查询脱敏身份、Membership、有效 Role
          与相关治理记录。每次读取都会重新验证当前后台访问权限。
        </p>
      </section>

      <section
        aria-labelledby="identity-search-heading"
        className="rounded-card border border-border bg-surface p-5 sm:p-6"
      >
        <p className="eyebrow">Directory search</p>
        <h2 className="mt-2 text-xl font-semibold" id="identity-search-heading">
          查找身份
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          使用注册名或完整 User ID。结果按稳定顺序分页，每页最多 20 项。
        </p>
        <form className="mt-5 flex flex-col gap-3 sm:flex-row" method="get">
          <label className="flex-1 text-sm font-medium">
            注册名或完整 User ID
            <input
              className="mt-2 min-h-11 w-full rounded-control border border-border bg-background px-3"
              defaultValue={data.query}
              maxLength={160}
              name="q"
              placeholder="例如 harboradmin 或完整 UUID"
              type="search"
            />
          </label>
          <button
            className="min-h-11 self-end rounded-control bg-primary px-5 text-sm font-medium text-primary-foreground"
            type="submit"
          >
            查询
          </button>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
        <section aria-labelledby="identity-results-heading">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Subjects</p>
              <h2
                className="mt-2 text-xl font-semibold"
                id="identity-results-heading"
              >
                查询结果
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {data.subjectPage.items.length} 项
            </span>
          </div>

          {data.subjectPage.items.length === 0 ? (
            <div className="empty-state mt-4">
              <p className="font-medium">没有符合条件的身份</p>
              <p className="mt-2 text-sm text-muted-foreground">
                请检查注册名或使用完整 User ID；没有读取或修改任何账户状态。
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-3">
              {data.subjectPage.items.map((subject) => (
                <SubjectSummary
                  key={subject.userId.value}
                  query={data.query}
                  searchCursor={data.searchCursor}
                  subject={subject}
                />
              ))}
            </ul>
          )}

          {data.subjectPage.nextCursor ? (
            <a
              className="mt-4 inline-flex min-h-11 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
              href={accessHref({
                query: data.query,
                searchCursor: encodeSubjectCursor(data.subjectPage.nextCursor),
              })}
            >
              查看下一页
            </a>
          ) : null}
        </section>

        {data.selectedSubject ? (
          <DetailPanel detail={data.selectedSubject} />
        ) : (
          <section className="empty-state" aria-label="身份详情">
            <p className="eyebrow">Subject detail</p>
            <h2 className="mt-3 text-xl font-semibold">选择一个身份查看详情</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              详情仅展示冻结合同中的脱敏身份、Membership、有效
              Role、状态指纹与保护标记。
            </p>
          </section>
        )}
      </div>

      <AuditPanel data={data} />

      <section className="rounded-card border border-border bg-surface-muted p-5 sm:p-6">
        <p className="eyebrow">Unavailable capabilities</p>
        <h2 className="mt-2 text-xl font-semibold">治理写入尚未开放</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          P1-03 不提供 Membership 变更、Author Role 授予或撤销，也不提供 Admin /
          Super Admin 或 elevated-account 写入。普通写入仍等待 P1-04
          独立授权；elevated 写入继续受 KI-033 延期边界保护。
        </p>
      </section>
    </div>
  );
}

export default async function AccessAdministrationPage({
  searchParams,
}: {
  searchParams: Promise<AccessGovernanceSearchParams>;
}) {
  const data = await loadAccessGovernancePageData(await searchParams);
  if (data.status === "unauthenticated" || data.status === "forbidden") {
    redirect(
      data.status === "unauthenticated"
        ? "/auth/sign-in"
        : "/auth/sign-in?error=forbidden",
    );
  }
  return <AccessGovernanceView data={data} />;
}
