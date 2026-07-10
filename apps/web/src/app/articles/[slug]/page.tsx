import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReadingCanvas } from "../../reading-canvas";
import { ReadingDocument } from "../../reading-document";
import { ReadingHistoryTracker } from "../../reading-history-client";
import { BookmarkToggle } from "../../reader-shelf-client";
import { createWebIdentityAccess } from "../../../lib/identity-access";
import { createHybridReaderContentGateway } from "../../../lib/reader-content";

export const dynamic = "force-dynamic";

export default async function ArticleReadingPage({
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
  const article = await createHybridReaderContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getArticle(slug);
  if (!article) notFound();

  return (
    <div className="site-stack">
      <ReadingHistoryTracker
        entry={{
          articleSlug: article.slug,
          articleTitle: article.title,
          kind: "article",
        }}
      />
      <nav aria-label="面包屑" className="text-sm text-muted-foreground">
        <Link className="text-primary" href="/works">
          阅读目录
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{article.title}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="text-sm text-primary" href="/archive">
          ← 我的本地书架
        </Link>
        <BookmarkToggle
          bookmark={{
            articleSlug: article.slug,
            articleTitle: article.title,
            kind: "article",
          }}
        />
      </div>

      <ReadingCanvas>
        <article className="reader-document">
          <header className="mx-auto mb-10 max-w-[var(--reader-measure)] border-b border-border pb-7 text-center">
            <p className="eyebrow">Article</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {article.summary}
            </p>
          </header>
          <ReadingDocument document={article.content} />
        </article>
      </ReadingCanvas>

      <Link className="text-sm text-primary" href="/works">
        ← 返回阅读目录
      </Link>
    </div>
  );
}
