import Link from "next/link";
import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../lib/identity-access";
import { mockWorks } from "../../lib/mock-content";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("archive:read")) redirect("/access");

  return (
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <p className="eyebrow">Reader Shelf</p>
        <h1 className="mt-3 text-3xl font-semibold">作品列表雏形</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          当前页面使用 mock data
          展示第一版目录层级、卡片信息密度与阅读入口。后续接入数据库时，仍通过现有
          Session、Access Context 与 Repository 边界提供真实数据。
        </p>
      </section>

      <section className="book-grid">
        {mockWorks.map((work) => (
          <article className="stat-card" key={work.slug}>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{work.fandom}</span>
              <span>{work.pairing}</span>
              <span>{work.rating}</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{work.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {work.summary}
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">章节</dt>
                <dd className="mt-1 font-medium">{work.chapters.length}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">阅读时长</dt>
                <dd className="mt-1 font-medium">{work.readingMinutes} 分钟</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">最后更新</dt>
                <dd className="mt-1 font-medium">{work.updatedAt}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {work.tags.map((tag) => (
                <span
                  className="rounded-full border border-border px-2 py-1"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              className="mt-6 inline-flex rounded-control bg-primary px-4 py-3 text-sm text-primary-foreground"
              href={`/works/${work.slug}`}
            >
              进入阅读页
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
