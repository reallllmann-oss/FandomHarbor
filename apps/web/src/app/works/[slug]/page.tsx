import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  ContinueReadingForWork,
  ReadingHistoryTracker,
} from "../../reading-history-client";
import { createWebIdentityAccess } from "../../../lib/identity-access";
import { createPublicSearchGateway } from "../../../lib/public-search";
import { createHybridReaderContentGateway } from "../../../lib/reader-content";
import { pageMetadata, privatePageMetadata } from "../../../lib/seo";
import { createSocialRelationshipGateway } from "../../../lib/social-relationships";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const results = await createPublicSearchGateway(
    readPublicRuntimeConfig(),
  ).search(slug);
  const work = results.works.find((candidate) => candidate.slug === slug);
  if (!work) return privatePageMetadata("作品未找到");

  return pageMetadata({
    description: work.summary || `${work.title}，作者 ${work.authorName}。`,
    pathname: `/works/${encodeURIComponent(work.slug)}`,
    title: work.title,
    type: "article",
  });
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("archive:read")) redirect("/access");

  const { slug } = await params;
  const readingData = await createHybridReaderContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getWork(slug);
  if (!readingData) notFound();

  const { chapters, tags, work } = readingData;
  const [author] = await createSocialRelationshipGateway(
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getPublishedWorkAuthors([work.slug]);
  const firstChapter = chapters[0];

  return (
    <div className="site-stack">
      <ReadingHistoryTracker
        entry={{
          authorName: author?.displayName,
          authorSlug: author?.authorSlug,
          kind: "work",
          workSlug: work.slug,
          workTitle: work.title,
        }}
      />
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/works">
          阅读目录
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{work.title}</span>
      </nav>

      <section className="reading-card max-w-none">
        <p className="eyebrow">Work</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          {work.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
          {work.summary}
        </p>
        {author ? (
          <p className="mt-4 text-sm text-muted-foreground">
            作者：
            <Link
              className="text-primary"
              href={`/author/${author.authorSlug}`}
            >
              {author.displayName}
            </Link>
          </p>
        ) : null}
        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="作品标签">
            {tags.map((tag) => (
              <span
                className="rounded-full border border-border px-2 py-1 text-xs"
                key={tag.id}
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
        <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">章节</dt>
            <dd className="mt-1 font-medium">{chapters.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">状态</dt>
            <dd className="mt-1 font-medium">已发布</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">更新</dt>
            <dd className="mt-1 font-medium">
              {work.updatedAt.toLocaleDateString("zh-CN")}
            </dd>
          </div>
        </dl>
        <ContinueReadingForWork
          availableChapterSlugs={chapters.map((chapter) => chapter.slug)}
          workSlug={work.slug}
        />
        {firstChapter ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center rounded-control bg-primary px-5 text-primary-foreground"
              href={`/works/${work.slug}/chapters/${firstChapter.slug}`}
            >
              开始阅读
            </Link>
            <a
              className="inline-flex min-h-11 items-center rounded-control border border-border px-5"
              href={`/works/${work.slug}/download`}
            >
              下载 TXT
            </a>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="chapter-list-heading" className="site-stack">
        <div>
          <p className="eyebrow">Contents</p>
          <h2 className="mt-2 text-2xl font-semibold" id="chapter-list-heading">
            章节目录
          </h2>
        </div>
        {chapters.length > 0 ? (
          <ol className="grid gap-3">
            {chapters.map((chapter) => (
              <li className="stat-card" key={chapter.id}>
                <Link
                  className="flex min-h-11 items-center justify-between gap-4 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href={`/works/${work.slug}/chapters/${chapter.slug}`}
                >
                  <span>
                    <span className="text-xs text-muted-foreground">
                      Chapter {chapter.position}
                    </span>
                    <span className="mt-1 block text-lg font-semibold">
                      {chapter.title}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-primary">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-state">这部作品暂时没有已发布章节。</p>
        )}
      </section>
    </div>
  );
}
