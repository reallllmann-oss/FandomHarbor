import Link from "next/link";
import { redirect } from "next/navigation";

import { createWebIdentityAccess } from "../../../../lib/identity-access";
import { createStudioWorkDraftGateway } from "../../../../lib/studio-work-drafts";
import { WorkFormShell } from "./work-form-shell";

export const dynamic = "force-dynamic";

export default async function CreateWorkPage() {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");
  const { categories, tags } = await createStudioWorkDraftGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  ).listFormMetadata();

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
        <span aria-current="page">新建作品</span>
      </nav>

      <header className="reading-card max-w-none">
        <p className="eyebrow">Create Work</p>
        <h1 className="mt-2 text-3xl font-semibold">新建作品</h1>
        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          作品可以保存为草稿。发布与封面上传仍未开放。
        </p>
      </header>

      <WorkFormShell categories={categories} tags={tags} />
    </div>
  );
}
