import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getWebAccessContext } from "../../../lib/identity-access";
import { mockWorks } from "../../../lib/mock-content";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return mockWorks.map((work) => ({ slug: work.slug }));
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("archive:read")) redirect("/access");

  const { slug } = await params;
  const work = mockWorks.find((entry) => entry.slug === slug);
  if (!work) notFound();

  return (
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <p className="eyebrow">{work.fandom}</p>
        <h1 className="mt-3 text-4xl font-semibold">{work.title}</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{work.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span>{work.pairing}</span>
          <span>{work.rating}</span>
          <span>{work.status}</span>
          <span>{work.updatedAt}</span>
        </div>
      </section>

      <section className="book-grid">
        {work.chapters.map((chapter) => (
          <article className="stat-card" key={chapter.id}>
            <p className="text-sm text-muted-foreground">
              {chapter.wordCount.toLocaleString("zh-CN")} 字
            </p>
            <h2 className="mt-3 text-xl font-semibold">{chapter.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {chapter.excerpt}
            </p>
          </article>
        ))}
      </section>

      <article className="reading-surface">
        <p className="eyebrow">静态阅读页预览</p>
        <div className="reading-prose mt-6 text-base">
          <p>{work.chapters[0]?.excerpt}</p>
          <p>
            港口城市总在夜里显得更诚实一些。灯一盏一盏沿着岸线亮起，像有人把迟到的星图重新摊开，
            每一个未被说出的决定都因此拥有了形状。
          </p>
          <p>
            他们站在同一张长桌两端，之间是尚未编目的纸页、盐痕和时间。谁都知道真正需要整理的
            从来不只是档案，而是那些被搁置太久、却仍然会反复回潮的关系。
          </p>
        </div>
      </article>

      <div className="flex flex-wrap gap-3">
        <Link className="rounded-control border border-border px-4 py-3" href="/works">
          返回作品列表
        </Link>
        <Link className="rounded-control border border-border px-4 py-3" href="/archive">
          返回 Reader 入口
        </Link>
      </div>
    </div>
  );
}
