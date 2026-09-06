import { redirect } from "next/navigation";

import {
  formatSiteCopyVersion,
  loadAdminHomeData,
} from "../lib/admin-home-data";
import { signOut } from "./auth/actions";
import { SiteCopyEditor } from "./site-copy-editor";

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
    <div className="site-stack min-w-0 max-w-full">
      <section className="hero-panel min-w-0 max-w-full">
        <div className="flex flex-wrap items-center gap-3">
          <p className="eyebrow">站点文案</p>
          <span className="max-w-full break-words rounded-full border border-border bg-surface px-3 py-1 text-center text-xs font-medium text-muted-foreground whitespace-normal">
            受控编辑
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          站点文案
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          这里读取并编辑当前数据库中生效的八项公开站点文案。所有变更必须先复核，
          再由数据库完成原子保存、审计与并发检查。
        </p>
      </section>

      <section aria-label="当前状态" className="info-grid min-w-0 max-w-full">
        <article className="stat-card min-w-0 max-w-full">
          <p className="text-sm text-muted-foreground">数据库版本</p>
          <p className="mt-2 break-all font-mono text-xl font-semibold">
            {formatSiteCopyVersion(snapshot.version)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            来自当前站点文案修订记录
          </p>
        </article>
        <article className="stat-card min-w-0 max-w-full">
          <p className="text-sm text-muted-foreground">访问权限</p>
          <p className="mt-2 text-xl font-semibold">
            {access.capabilities.has("super_admin:operate")
              ? "超级管理员"
              : "管理员"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            正常成员资格 · 后台操作权限
          </p>
        </article>
        <article className="stat-card min-w-0 max-w-full">
          <p className="text-sm text-muted-foreground">操作状态</p>
          <p className="mt-2 text-xl font-semibold">复核后原子保存</p>
          <p className="mt-2 text-sm text-muted-foreground">
            不提供草稿、定时发布、历史恢复或回滚
          </p>
        </article>
      </section>

      <SiteCopyEditor
        initialContent={snapshot.content}
        initialRevisionId={snapshot.revisionId}
        initialVersion={formatSiteCopyVersion(snapshot.version)}
      />

      <section className="min-w-0 max-w-full rounded-card border border-border bg-surface-muted p-5 sm:p-6">
        <p className="eyebrow">已锁定边界</p>
        <h2 className="mt-2 text-xl font-semibold">本阶段保持锁定</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          行动按钮目标链接、导航路径与固定顺序、导航数量与可见性、
          创作中心权限条件，以及页脚法务链接均不属于站点文案数据。此页面不会改变
          现有身份验证、权限或身份与权限页面行为。
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
              退出登录
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
