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

function WorkRecovery({ compact = false }: { compact?: boolean }) {
  const links = (
    <>
      <Link className="work-secondary-action" href="/archive">
        浏览作品档案
      </Link>
      <Link className="work-text-action" href="/search">
        搜索作品或作者
      </Link>
      <Link className="work-text-action" href="/works">
        返回阅读目录
      </Link>
    </>
  );

  if (compact) {
    return (
      <nav aria-label="无章节恢复路径" className="work-recovery-links">
        {links}
      </nav>
    );
  }

  return (
    <nav aria-label="作品详情恢复路径" className="work-recovery">
      <div className="work-recovery-copy">
        <p className="eyebrow">继续发现</p>
        <h2>在阅读之外保留下一条路径</h2>
        <p>返回公共作品档案，主动搜索，或回到你的阅读目录。</p>
      </div>
      <div className="work-recovery-links">{links}</div>
    </nav>
  );
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
  const publishedDate = work.publishedAt?.toLocaleDateString("zh-CN", {
    timeZone: "UTC",
  });
  const updatedDate = work.updatedAt.toLocaleDateString("zh-CN", {
    timeZone: "UTC",
  });

  return (
    <div className="work-detail-shell">
      <ReadingHistoryTracker
        entry={{
          authorName: author?.displayName,
          authorSlug: author?.authorSlug,
          kind: "work",
          workSlug: work.slug,
          workTitle: work.title,
        }}
      />

      <nav aria-label="面包屑" className="work-breadcrumb">
        <Link href="/works">阅读目录</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{work.title}</span>
      </nav>

      <header className="work-orientation">
        <p className="eyebrow">作品详情</p>
        <h1>{work.title}</h1>
        <p className="work-orientation-copy">
          先了解故事与公开章节，再决定从哪里进入阅读。
        </p>
      </header>

      <section aria-labelledby="work-premise-heading" className="work-premise">
        <div className="work-section-heading">
          <p className="eyebrow">故事简介</p>
          <h2 id="work-premise-heading">关于这部作品</h2>
        </div>
        <p className="work-summary">
          {work.summary || "这部作品暂未留下简介。"}
        </p>
      </section>

      <section aria-label="作者与公开发布信息" className="work-context">
        <div className="work-author-context">
          <p className="work-context-label">作者归属</p>
          {author ? (
            <Link
              className="work-author-link"
              href={`/author/${author.authorSlug}`}
            >
              {author.displayName}
            </Link>
          ) : (
            <p className="work-context-value">暂未提供公开作者资料</p>
          )}
        </div>

        <dl className="work-published-context">
          <div>
            <dt>公开章节</dt>
            <dd>{chapters.length}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>已发布</dd>
          </div>
          {publishedDate ? (
            <div>
              <dt>发布</dt>
              <dd>{publishedDate}</dd>
            </div>
          ) : null}
          <div>
            <dt>更新</dt>
            <dd>{updatedDate}</dd>
          </div>
        </dl>

        {tags.length > 0 ? (
          <div className="work-tags-context">
            <p className="work-context-label">作品标签</p>
            <ul aria-label="作品标签" className="work-tag-list">
              {tags.map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section
        aria-labelledby="work-reading-heading"
        className="work-reading-decision"
      >
        <div className="work-reading-heading">
          <div>
            <p className="eyebrow">阅读路径</p>
            <h2 id="work-reading-heading">从合适的位置进入故事</h2>
          </div>
          <p>有阅读记录时可从上次章节继续；也可以重新从第一章开始。</p>
        </div>

        <ContinueReadingForWork
          availableChapterSlugs={chapters.map((chapter) => chapter.slug)}
          workSlug={work.slug}
        />

        {firstChapter ? (
          <div className="work-reading-actions">
            <Link
              className="work-primary-action"
              href={`/works/${work.slug}/chapters/${firstChapter.slug}`}
            >
              从第一章开始
            </Link>
            <a
              className="work-secondary-action"
              href={`/works/${work.slug}/download`}
            >
              下载 TXT
            </a>
          </div>
        ) : (
          <p className="work-reading-unavailable">
            当前没有可进入的公开章节。你仍可查看作品信息，或从下方继续发现其他作品。
          </p>
        )}
      </section>

      <section aria-labelledby="chapter-list-heading" className="work-chapters">
        <div className="work-chapter-heading">
          <div>
            <p className="eyebrow">章节概览</p>
            <h2 id="chapter-list-heading">公开章节</h2>
          </div>
          <p>{chapters.length} 个可读章节</p>
        </div>
        {chapters.length > 0 ? (
          <ol className="work-chapter-list">
            {chapters.map((chapter) => (
              <li className="work-chapter" key={chapter.id}>
                <Link
                  className="work-chapter-entry"
                  href={`/works/${work.slug}/chapters/${chapter.slug}`}
                >
                  <span className="work-chapter-position">
                    第 {chapter.position} 章
                  </span>
                  <span className="work-chapter-title">{chapter.title}</span>
                  <span aria-hidden="true" className="work-chapter-arrow">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="work-chapter-empty">
            <h3>尚无可读章节</h3>
            <p>
              这部作品目前没有公开章节。草稿与未发布内容不会出现在这里，你可以继续浏览其他公开作品。
            </p>
            <WorkRecovery compact />
          </div>
        )}
      </section>

      {chapters.length > 0 ? <WorkRecovery /> : null}
    </div>
  );
}
