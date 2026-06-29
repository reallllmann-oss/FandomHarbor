import Link from "next/link";
import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../lib/identity-access";

export const dynamic = "force-dynamic";

export default async function AuthorHomePage() {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("work:author")) redirect("/archive");

  return (
    <div className="site-stack">
      <section className="reading-card max-w-none">
        <p className="eyebrow">Author Workspace</p>
        <h1 className="mt-3 text-3xl font-semibold">内容管理入口空状态</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          当前 Sprint 只先固定作者工作区入口、信息层级与空状态文案。后续文章创建、
          草稿管理、封面上传和 Storage provider 接入，都将继续沿用 Phase 1
          的身份与存储边界。
        </p>
      </section>

      <section className="empty-state">
        <h2 className="text-2xl font-semibold">还没有可管理的作品</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
          下一阶段会在这里放置作品列表、草稿状态、封面资源位和发布动作。目前只保留作者入口与邀请管理跳板，
          避免在内容 schema 未确认前过早绑定真实业务流。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-control bg-primary px-4 py-3 text-primary-foreground"
            href="/author/invitations"
          >
            前往邀请码管理
          </Link>
          <Link className="rounded-control border border-border px-4 py-3" href="/works">
            查看 Reader 书架
          </Link>
        </div>
      </section>
    </div>
  );
}
