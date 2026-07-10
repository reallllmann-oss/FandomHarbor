import Link from "next/link";
import { redirect } from "next/navigation";

import { createWebIdentityAccess } from "../../../lib/identity-access";
import { createRuntimeStudioContentGateway } from "../../../lib/studio-content";
import { StudioEmptyListState } from "../studio-states";

export const dynamic = "force-dynamic";

const statusLabels = {
  archived: "已归档",
  draft: "草稿",
  published: "已发布",
} as const;

interface StudioWorksPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function StudioWorksPage({
  searchParams,
}: StudioWorksPageProps) {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");

  const status = (await searchParams).status;
  const works = await createRuntimeStudioContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).listWorks();

  return (
    <div className="site-stack">
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/studio">
          Studio
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">作品管理</span>
      </nav>

      {status === "draft-created" ? (
        <p
          className="rounded-control border border-primary/30 bg-surface p-4 text-sm"
          role="status"
        >
          草稿已真实保存，可从下方列表继续编辑。
        </p>
      ) : null}

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Works</p>
          <h1 className="mt-2 text-3xl font-semibold">作品管理</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            同时展示当前作者的草稿与已发布作品。
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-control bg-primary px-4 text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          href="/studio/works/new"
        >
          新建作品
        </Link>
      </section>

      {works.length > 0 ? (
        <ul aria-label="作品列表" className="grid gap-3">
          {works.map((work) => (
            <li className="stat-card" key={work.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{work.title}</h2>
                    <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                      {statusLabels[work.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    /{work.slug} · 更新于{" "}
                    {work.updatedAt.toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex min-h-11 items-center rounded-control border border-border px-4 text-sm text-primary"
                    href={`/studio/works/${work.id}`}
                  >
                    查看详情
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center rounded-control border border-border px-4 text-sm text-primary"
                    href={`/studio/works/${work.id}/edit`}
                  >
                    {work.status === "draft" ? "继续编辑与发布" : "管理章节"}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <StudioEmptyListState
          createLabel="创建作品"
          createHref="/studio/works/new"
          description="当前作者还没有作品。创建流程开放后，新作品会出现在这里。"
          heading="还没有作品"
          headingId="works-empty-heading"
        />
      )}
    </div>
  );
}
