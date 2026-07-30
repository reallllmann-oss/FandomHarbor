import { redirect } from "next/navigation";

import {
  ADMIN_SITE_COPY_GROUPS,
  formatSiteCopyVersion,
  loadAdminHomeData,
} from "../lib/admin-home-data";
import { signOut } from "./auth/actions";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const data = await loadAdminHomeData();
  if (data.status !== "ready") {
    redirect(
      data.status === "unauthenticated"
        ? "/auth/sign-in"
        : "/auth/sign-in?error=forbidden",
    );
  }
  const { access, snapshot } = data;

  return (
    <div className="site-stack">
      <section className="hero-panel">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">Site Copy</p>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            只读
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          站点文案
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          这里展示当前数据库中生效的八项公开站点文案。ADMIN-01
          只建立可信的读取界面，不提供编辑、保存或发布操作。
        </p>
      </section>

      <section aria-label="当前状态" className="info-grid">
        <article className="stat-card">
          <p className="text-sm text-muted-foreground">数据库 Version</p>
          <p className="mt-2 break-all font-mono text-xl font-semibold">
            {formatSiteCopyVersion(snapshot.version)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            来自当前 Site Copy Revision
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm text-muted-foreground">访问权限</p>
          <p className="mt-2 text-xl font-semibold">
            {access.capabilities.has("super_admin:operate")
              ? "Super Admin"
              : "Admin"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            active membership · admin:operate
          </p>
        </article>
        <article className="stat-card">
          <p className="text-sm text-muted-foreground">操作状态</p>
          <p className="mt-2 text-xl font-semibold">编辑与发布尚未开放</p>
          <p className="mt-2 text-sm text-muted-foreground">
            当前页面不会提交任何站点文案变更
          </p>
        </article>
      </section>

      <section aria-labelledby="current-copy-heading">
        <div className="mb-5">
          <p className="eyebrow">Current values</p>
          <h2 className="mt-2 text-2xl font-semibold" id="current-copy-heading">
            当前生效内容
          </h2>
        </div>
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
              <dl className="mt-5 divide-y divide-border border-y border-border">
                {group.fields.map(([field, label]) => (
                  <div className="py-4" key={field}>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-2 whitespace-pre-wrap break-words text-base leading-7">
                      {snapshot.content[field]}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-border bg-surface-muted p-5 sm:p-6">
        <p className="eyebrow">Locked boundaries</p>
        <h2 className="mt-2 text-xl font-semibold">本阶段保持锁定</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          CTA 目标链接、导航路径与固定顺序、导航数量与可见性、Studio capability
          条件，以及 Footer 法务链接均不属于 Site Copy 数据。此页面不会改变现有
          Auth、权限或 /access 行为。
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a
            className="inline-flex min-h-11 items-center rounded-control border border-border bg-surface px-4 text-sm font-medium hover:bg-background"
            href="/access"
          >
            前往身份与权限
          </a>
          <form action={signOut}>
            <button
              className="min-h-11 rounded-control border border-border bg-surface px-4 text-sm font-medium"
              type="submit"
            >
              退出后台
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
