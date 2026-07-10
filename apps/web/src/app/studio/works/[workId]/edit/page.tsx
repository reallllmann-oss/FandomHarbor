import { z } from "zod";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { contentDocumentToPlainText } from "../../../../../lib/content-document-text";
import { createWebIdentityAccess } from "../../../../../lib/identity-access";
import { createStudioDraftEditorGateway } from "../../../../../lib/studio-draft-editor";
import { WorkManagementForms } from "./work-management-forms";

export const dynamic = "force-dynamic";

interface DraftWorkEditorPageProps {
  params: Promise<{ workId: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function DraftWorkEditorPage({
  params,
  searchParams,
}: DraftWorkEditorPageProps) {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");

  const parsedWorkId = z.uuid().safeParse((await params).workId);
  if (!parsedWorkId.success) notFound();

  const detail = await createStudioDraftEditorGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).getDraft(parsedWorkId.data);
  if (!detail) notFound();

  const status = (await searchParams).status;

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
        <span aria-current="page">编辑草稿</span>
      </nav>

      <header className="reading-card max-w-none">
        <p className="eyebrow">Work & Chapter Manager</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{detail.work.title}</h1>
          <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
            {detail.work.status === "published" ? "已发布" : "草稿"}
          </span>
        </div>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          管理作品标签、章节标题、章节正文与公开章节选择。
        </p>
      </header>

      <section
        aria-labelledby="work-metadata-heading"
        className="reading-card max-w-none"
      >
        <h2 className="text-xl font-semibold" id="work-metadata-heading">
          基础信息
        </h2>
        <dl className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">简介</dt>
            <dd className="mt-1">{detail.work.summary || "尚未填写简介"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">分类</dt>
            <dd className="mt-1">{detail.category?.name ?? "未分类"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">章节数量</dt>
            <dd className="mt-1">{detail.chapters.length}</dd>
          </div>
        </dl>
      </section>

      {status ? (
        <p
          className="rounded-control border border-primary/30 bg-surface p-4 text-sm"
          role="status"
        >
          {status === "chapter-saved"
            ? "章节已保存。"
            : status === "tags-saved"
              ? "标签已保存。"
              : status === "published"
                ? "所选章节已发布，未选章节保持为草稿。"
                : "更改已保存。"}
        </p>
      ) : null}

      <WorkManagementForms
        chapters={detail.chapters.map((chapter) => ({
          ...chapter,
          body: contentDocumentToPlainText(chapter.content),
        }))}
        tagNames={detail.tags.map((tag) => tag.name)}
        workId={detail.work.id}
      />
    </div>
  );
}
