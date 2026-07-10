import Link from "next/link";
import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../../lib/identity-access";
import { createStudioContentGateway } from "../../../lib/studio-content";
import { StudioEmptyListState } from "../studio-states";

export const dynamic = "force-dynamic";

const statusLabels = {
  archived: "已归档",
  draft: "草稿",
  published: "已发布",
} as const;

export default async function StudioArticlesPage() {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("work:author")) redirect("/archive");

  const articles = await createStudioContentGateway(access).listArticles();

  return (
    <div className="site-stack">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/studio">
          Studio
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">文章管理</span>
      </nav>

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Articles</p>
          <h1 className="mt-2 text-3xl font-semibold">文章管理</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            独立文章与作品分开管理，继续复用 002A Article 领域类型。
          </p>
        </div>
        <button
          className="min-h-11 rounded-control bg-primary px-4 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          disabled
          title="创建文章将在后续 Step 开放"
          type="button"
        >
          创建文章（后续开放）
        </button>
      </section>

      {articles.length > 0 ? (
        <ul aria-label="文章列表" className="grid gap-3">
          {articles.map((article) => (
            <li className="stat-card" key={article.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{article.title}</h2>
                    <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                      {statusLabels[article.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    /{article.slug} · 更新于{" "}
                    {article.updatedAt.toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="min-h-11 rounded-control border border-border px-4 py-2 text-sm text-primary"
                    href={`/studio/articles/${article.id}`}
                  >
                    查看详情
                  </Link>
                  <button
                    className="min-h-11 rounded-control border border-border px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    disabled
                    title="文章编辑将在后续 Step 开放"
                    type="button"
                  >
                    编辑（占位）
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <StudioEmptyListState
          createLabel="创建文章"
          description="当前作者还没有文章。创建流程开放后，新文章会出现在这里。"
          heading="还没有文章"
          headingId="articles-empty-heading"
        />
      )}
    </div>
  );
}
