import { redirect } from "next/navigation";

import { createWebIdentityAccess } from "../../lib/identity-access";
import { createHybridReaderContentGateway } from "../../lib/reader-content";
import { createSocialRelationshipGateway } from "../../lib/social-relationships";
import { ReaderLibraryClient } from "../reader-library-client";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("archive:read")) redirect("/access");

  const reader = createHybridReaderContentGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  );
  const [works, articles] = await Promise.all([
    reader.listWorks(),
    reader.listArticles(),
  ]);
  const authors = await createSocialRelationshipGateway(
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getPublishedWorkAuthors(works.map((work) => work.slug));
  const authorsByWork = new Map(
    authors.map((author) => [author.workSlug, author]),
  );
  const workDetails = await Promise.all(
    works.map((work) => reader.getWork(work.slug)),
  );
  const tagsByWork = new Map(
    workDetails
      .filter((detail) => detail !== null)
      .map((detail) => [detail.work.slug, detail.tags.map((tag) => tag.name)]),
  );

  return (
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <p className="eyebrow">Reader Library</p>
        <h1 className="mt-3 text-3xl font-semibold">阅读目录</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          当前通过统一 Reader Gateway 合并已发布数据库内容与 fixture
          内容，只暴露 published
          资源。这里同时作为公开阅读目录与本地书架的总入口。
        </p>
      </section>
      <ReaderLibraryClient
        articles={articles.map((article) => ({
          id: article.id,
          kind: "article" as const,
          slug: article.slug,
          summary: article.summary,
          title: article.title,
        }))}
        works={works.map((work) => ({
          authorName: authorsByWork.get(work.slug)?.displayName,
          authorSlug: authorsByWork.get(work.slug)?.authorSlug,
          id: work.id,
          kind: "work" as const,
          slug: work.slug,
          summary: work.summary,
          tagNames: tagsByWork.get(work.slug) ?? [],
          title: work.title,
        }))}
      />
    </div>
  );
}
