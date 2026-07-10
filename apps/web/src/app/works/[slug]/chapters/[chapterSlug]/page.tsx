import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReadingCanvas } from "../../../../reading-canvas";
import { ReadingDocument } from "../../../../reading-document";
import { ReadingHistoryTracker } from "../../../../reading-history-client";
import { BookmarkToggle } from "../../../../reader-shelf-client";
import { createWebIdentityAccess } from "../../../../../lib/identity-access";
import { createHybridReaderContentGateway } from "../../../../../lib/reader-content";
import { createSocialRelationshipGateway } from "../../../../../lib/social-relationships";

export const dynamic = "force-dynamic";

export default async function ChapterReadingPage({
  params,
}: {
  params: Promise<{ chapterSlug: string; slug: string }>;
}) {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("archive:read")) redirect("/access");

  const { chapterSlug, slug } = await params;
  const readingData = await createHybridReaderContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getChapter(slug, chapterSlug);
  if (!readingData) notFound();

  const { chapter, chapters, nextChapter, previousChapter, work } = readingData;
  const [author] = await createSocialRelationshipGateway(
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getPublishedWorkAuthors([work.slug]);
  const chapterCount = chapters.length;

  return (
    <div className="site-stack">
      <ReadingHistoryTracker
        entry={{
          authorName: author?.displayName,
          authorSlug: author?.authorSlug,
          chapterCount,
          chapterPosition: chapter.position,
          chapterSlug: chapter.slug,
          chapterTitle: chapter.title,
          kind: "chapter",
          workSlug: work.slug,
          workTitle: work.title,
        }}
      />
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/works">
          阅读目录
        </Link>
        <span aria-hidden="true"> / </span>
        <Link className="text-primary" href={`/works/${work.slug}`}>
          {work.title}
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{chapter.title}</span>
      </nav>

      <div className="chapter-position-bar">
        <span>
          第 <strong>{chapter.position}</strong> / {chapterCount} 章
        </span>
        <a className="chapter-directory-link" href="#chapter-directory">
          查看章节目录 ↓
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="text-sm text-primary" href="/archive">
          ← 我的本地书架
        </Link>
        <BookmarkToggle
          bookmark={{
            authorName: author?.displayName,
            authorSlug: author?.authorSlug,
            chapterPosition: chapter.position,
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            kind: "chapter",
            workSlug: work.slug,
            workTitle: work.title,
          }}
        />
      </div>

      <ReadingCanvas>
        <article className="reader-document">
          <header className="mx-auto mb-10 max-w-[var(--reader-measure)] border-b border-border pb-7 text-center">
            <p className="eyebrow">Chapter {chapter.position}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {chapter.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">{work.title}</p>
            {author ? (
              <p className="mt-2 text-sm text-muted-foreground">
                作者：
                <Link
                  className="text-primary"
                  href={`/author/${author.authorSlug}`}
                >
                  {author.displayName}
                </Link>
              </p>
            ) : null}
          </header>
          <ReadingDocument document={chapter.content} />
        </article>
      </ReadingCanvas>

      <nav aria-label="章节导航" className="chapter-navigation">
        {previousChapter ? (
          <Link
            className="chapter-navigation-card"
            href={`/works/${work.slug}/chapters/${previousChapter.slug}`}
            rel="prev"
          >
            <span className="chapter-navigation-label">← 上一章</span>
            <span className="chapter-navigation-title">
              {previousChapter.title}
            </span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="chapter-navigation-card chapter-navigation-card-disabled"
          >
            <span className="chapter-navigation-label">← 上一章</span>
            <span className="chapter-navigation-title">暂无，已经是第一章</span>
          </span>
        )}
        {nextChapter ? (
          <Link
            className="chapter-navigation-card chapter-navigation-card-next"
            href={`/works/${work.slug}/chapters/${nextChapter.slug}`}
            rel="next"
          >
            <span className="chapter-navigation-label">下一章 →</span>
            <span className="chapter-navigation-title">
              {nextChapter.title}
            </span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="chapter-navigation-card chapter-navigation-card-disabled chapter-navigation-card-next"
          >
            <span className="chapter-navigation-label">下一章 →</span>
            <span className="chapter-navigation-title">
              暂无，已经是最后一章
            </span>
          </span>
        )}
      </nav>

      <details className="chapter-directory" id="chapter-directory" open>
        <summary>
          章节目录
          <span className="chapter-directory-count">共 {chapterCount} 章</span>
        </summary>
        <ol className="mt-3 grid gap-2 border-t border-border pt-3">
          {chapters.map((entry) => (
            <li key={entry.id}>
              <Link
                aria-current={entry.id === chapter.id ? "page" : undefined}
                className="chapter-directory-entry"
                href={`/works/${work.slug}/chapters/${entry.slug}`}
              >
                {entry.position}. {entry.title}
                {entry.id === chapter.id ? (
                  <span className="chapter-current-marker">当前章节</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
