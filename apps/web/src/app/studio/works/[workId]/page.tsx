import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createWebIdentityAccess } from "../../../../lib/identity-access";
import { createRuntimeStudioContentGateway } from "../../../../lib/studio-content";
import { StudioDetailNavigation } from "../../studio-states";

export const dynamic = "force-dynamic";

const statusLabels = {
  archived: "已归档",
  draft: "草稿",
  published: "已发布",
} as const;

interface StudioWorkDetailPageProps {
  params: Promise<{ workId: string }>;
}

function formatDate(value: Date) {
  return value.toLocaleDateString("zh-CN");
}

export default async function StudioWorkDetailPage({
  params,
}: StudioWorkDetailPageProps) {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");

  const { workId } = await params;
  const detail = await createRuntimeStudioContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getWork(workId);
  if (!detail) notFound();

  const { chapters, work } = detail;
  const hasOnlyDraftChapters =
    chapters.length > 0 &&
    chapters.every((chapter) => chapter.status === "draft");

  return (
    <div className="site-stack">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/studio">
          Studio
        </Link>
        <span aria-hidden="true"> / </span>
        <Link className="text-primary" href="/studio/works">
          作品管理
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{work.title}</span>
      </nav>

      <section className="reading-card max-w-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Work Detail</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold">{work.title}</h1>
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {statusLabels[work.status]}
              </span>
            </div>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              {work.summary || "该作品尚未填写简介。"}
            </p>
          </div>
          <StudioDetailNavigation
            listHref="/studio/works"
            listLabel="返回作品列表"
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-muted-foreground">章节数量</dt>
            <dd className="mt-1 font-semibold">{chapters.length}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">创建时间</dt>
            <dd className="mt-1 font-semibold">{formatDate(work.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">最近更新</dt>
            <dd className="mt-1 font-semibold">{formatDate(work.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="reading-card max-w-none">
        <h2 className="text-xl font-semibold">作品操作</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-primary-foreground"
            href={`/studio/works/${work.id}/edit`}
          >
            管理章节、标签与发布
          </Link>
          {work.status === "published" ? (
            <Link
              className="inline-flex min-h-11 items-center rounded-control border border-border px-4"
              href={`/works/${work.slug}`}
            >
              Reader 查看
            </Link>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="chapters-heading" className="site-stack">
        <div>
          <p className="eyebrow">Chapters</p>
          <h2 className="mt-2 text-2xl font-semibold" id="chapters-heading">
            章节列表
          </h2>
        </div>

        {hasOnlyDraftChapters ? (
          <p className="rounded-control border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
            该作品的章节目前全部为草稿，仅在 Studio 可见，Reader
            暂无可阅读章节。
          </p>
        ) : null}

        {chapters.length > 0 ? (
          <ol aria-label="作者章节列表" className="grid gap-3">
            {chapters.map((chapter) => (
              <li className="stat-card" key={chapter.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      第 {chapter.position} 章
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">
                      {chapter.title}
                    </h3>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1 text-xs">
                      {statusLabels[chapter.status]}
                    </span>
                    <p className="mt-2">
                      更新于 {formatDate(chapter.updatedAt)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="empty-state" role="status">
            <h3 className="text-lg font-semibold">这个作品还没有章节</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              当前没有可展示的章节；可进入管理页新建第一章。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
