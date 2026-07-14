import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ReadingCanvas,
  ReadingDisclosure,
  ReadingInteractionProvider,
} from "../../../../reading-canvas";
import { ReadingDocument } from "../../../../reading-document";
import { ReadingHistoryTracker } from "../../../../reading-history-client";
import {
  ChapterHeader,
  ReadingContentRegion,
  ReadingContextRegion,
  ReadingContinuationRegion,
  ReadingPageLayout,
} from "../../../../reading-layout";
import { BookmarkToggle } from "../../../../reader-shelf-client";
import { createWebIdentityAccess } from "../../../../../lib/identity-access";
import { createHybridReaderContentGateway } from "../../../../../lib/reader-content";
import { createSocialRelationshipGateway } from "../../../../../lib/social-relationships";

export const dynamic = "force-dynamic";

interface ChapterLinkEntry {
  slug: string;
  title: string;
}

interface ChapterDirectoryEntry extends ChapterLinkEntry {
  id: string;
  position: number;
}

function ChapterSequenceNavigation({
  compact = false,
  nextChapter,
  previousChapter,
  workSlug,
}: {
  compact?: boolean;
  nextChapter: ChapterLinkEntry | null;
  previousChapter: ChapterLinkEntry | null;
  workSlug: string;
}) {
  return (
    <nav
      aria-label={compact ? "阅读菜单章节导航" : "章节导航"}
      className={`chapter-navigation${compact ? " chapter-navigation-compact" : ""}`}
    >
      {previousChapter ? (
        <Link
          className="chapter-navigation-card"
          href={`/works/${workSlug}/chapters/${previousChapter.slug}`}
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
          href={`/works/${workSlug}/chapters/${nextChapter.slug}`}
          rel="next"
        >
          <span className="chapter-navigation-label">下一章 →</span>
          <span className="chapter-navigation-title">{nextChapter.title}</span>
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="chapter-navigation-card chapter-navigation-card-disabled chapter-navigation-card-next"
        >
          <span className="chapter-navigation-label">下一章 →</span>
          <span className="chapter-navigation-title">暂无，已经是最后一章</span>
        </span>
      )}
    </nav>
  );
}

function ChapterDirectoryList({
  chapters,
  currentChapterId,
  workSlug,
}: {
  chapters: ChapterDirectoryEntry[];
  currentChapterId: string;
  workSlug: string;
}) {
  return (
    <ol className="chapter-directory-list">
      {chapters.map((entry) => (
        <li key={entry.id}>
          <Link
            aria-current={entry.id === currentChapterId ? "page" : undefined}
            className="chapter-directory-entry"
            href={`/works/${workSlug}/chapters/${entry.slug}`}
          >
            {entry.position}. {entry.title}
            {entry.id === currentChapterId ? (
              <span className="chapter-current-marker">当前章节</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ol>
  );
}

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
    <ReadingInteractionProvider>
      <ReadingPageLayout>
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
        <ReadingContextRegion>
          <div className="reading-mobile-navigation">
            <Link className="reading-return-work" href={`/works/${work.slug}`}>
              <span aria-hidden="true">←</span>
              <span className="reading-return-work-label">
                返回 {work.title}
              </span>
            </Link>
            <ReadingDisclosure
              className="reading-navigation-menu"
              closeLabel="关闭导航并返回阅读"
              expandedLabel="收起导航与章节"
              panel="navigation"
              panelClassName="reading-navigation-panel"
              triggerLabel="导航与章节"
            >
              <nav
                aria-label="阅读页面出口"
                className="reading-exit-navigation"
              >
                <Link href="/">首页</Link>
                <Link href="/archive">Archive / 发现</Link>
                <Link href="/archive#local-shelf-title">Library / 书架</Link>
                <Link href="/search">Search</Link>
              </nav>
              <p className="reading-navigation-position">
                第 <strong>{chapter.position}</strong> / {chapterCount} 章
              </p>
              <ChapterSequenceNavigation
                compact
                nextChapter={nextChapter}
                previousChapter={previousChapter}
                workSlug={work.slug}
              />
              <ChapterDirectoryList
                chapters={chapters}
                currentChapterId={chapter.id}
                workSlug={work.slug}
              />
            </ReadingDisclosure>
          </div>

          <div className="reading-desktop-context">
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
          </div>

          <div className="reading-support-row">
            <Link
              className="reading-desktop-shelf-link text-sm text-primary"
              href="/archive#local-shelf-title"
            >
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
        </ReadingContextRegion>

        <ReadingContentRegion>
          <ReadingCanvas>
            <article
              aria-labelledby="reading-chapter-title"
              className="reader-document"
            >
              <ChapterHeader
                author={
                  author ? (
                    <Link
                      className="text-primary"
                      href={`/author/${author.authorSlug}`}
                    >
                      {author.displayName}
                    </Link>
                  ) : undefined
                }
                chapterLabel={`Chapter ${chapter.position}`}
                title={chapter.title}
                workTitle={work.title}
              />
              <ReadingDocument document={chapter.content} />
            </article>
          </ReadingCanvas>
        </ReadingContentRegion>

        <ReadingContinuationRegion>
          <p className="chapter-end-marker">
            {nextChapter ? "本章完 · 继续下一章" : "本章完 · 故事暂至此处"}
          </p>
          <ChapterSequenceNavigation
            nextChapter={nextChapter}
            previousChapter={previousChapter}
            workSlug={work.slug}
          />

          <ReadingDisclosure
            className="chapter-directory"
            closeLabel="关闭目录并返回章节延续"
            expandedLabel="收起章节目录"
            panel="chapter-directory"
            panelClassName="chapter-directory-panel"
            triggerLabel="章节目录"
            triggerMeta={`共 ${chapterCount} 章`}
          >
            <ChapterDirectoryList
              chapters={chapters}
              currentChapterId={chapter.id}
              workSlug={work.slug}
            />
          </ReadingDisclosure>
        </ReadingContinuationRegion>
      </ReadingPageLayout>
    </ReadingInteractionProvider>
  );
}
