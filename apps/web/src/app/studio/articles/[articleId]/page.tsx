import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getWebAccessContext } from "../../../../lib/identity-access";
import { createStudioContentGateway } from "../../../../lib/studio-content";
import { articleStudioActions } from "../../studio-state-contract";
import {
  DisabledStudioActions,
  StudioDetailNavigation,
} from "../../studio-states";

export const dynamic = "force-dynamic";

const statusLabels = {
  archived: "已归档",
  draft: "草稿",
  published: "已发布",
} as const;

interface StudioArticleDetailPageProps {
  params: Promise<{ articleId: string }>;
}

function formatDate(value: Date) {
  return value.toLocaleDateString("zh-CN");
}

export default async function StudioArticleDetailPage({
  params,
}: StudioArticleDetailPageProps) {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("work:author")) redirect("/archive");

  const { articleId } = await params;
  const detail = await createStudioContentGateway(access).getArticle(articleId);
  if (!detail) notFound();

  const { article, categoryName, relatedWorkTitle, tagNames } = detail;

  return (
    <div className="site-stack">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/studio">
          Studio
        </Link>
        <span aria-hidden="true"> / </span>
        <Link className="text-primary" href="/studio/articles">
          文章管理
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{article.title}</span>
      </nav>

      <section className="reading-card max-w-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Article Detail</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">{article.title}</h1>
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {statusLabels[article.status]}
              </span>
            </div>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              {article.summary || "该文章尚未填写摘要。"}
            </p>
          </div>
          <StudioDetailNavigation
            listHref="/studio/articles"
            listLabel="返回文章列表"
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">所属作品</dt>
            <dd className="mt-1 font-semibold">
              {relatedWorkTitle ?? "独立文章"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">分类</dt>
            <dd className="mt-1 font-semibold">
              {categoryName ?? "未设置分类"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">创建时间</dt>
            <dd className="mt-1 font-semibold">
              {formatDate(article.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">最近更新</dt>
            <dd className="mt-1 font-semibold">
              {formatDate(article.updatedAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-muted-foreground">标签</h2>
          {tagNames.length > 0 ? (
            <ul aria-label="文章标签" className="mt-2 flex flex-wrap gap-2">
              {tagNames.map((tagName) => (
                <li
                  className="rounded-full border border-border px-2 py-1 text-xs"
                  key={tagName}
                >
                  {tagName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              当前 fixture 暂无文章标签。
            </p>
          )}
        </div>
      </section>

      <DisabledStudioActions
        actions={articleStudioActions}
        description="当前只提供只读详情，以下操作将在后续获得独立授权后开放。"
        heading="文章操作"
        headingId="article-actions-heading"
      />
    </div>
  );
}
