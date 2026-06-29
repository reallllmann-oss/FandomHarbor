import Link from "next/link";
import { redirect } from "next/navigation";

import { getWebAccessContext } from "../../lib/identity-access";
import { signOut } from "../auth/actions";

export const dynamic = "force-dynamic";

export default async function ArchiveGatePage() {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("archive:read")) redirect("/access");

  return (
    <div className="site-stack">
      <section className="reading-card">
        <p className="eyebrow">Reader Access Granted</p>
        <h1 className="mt-3 text-3xl font-semibold">欢迎进入归档入口</h1>
        <p className="mt-4 text-muted-foreground">
          当前账号已具备 Reader capability。Sprint 002A
          已接入静态作品书架和阅读页骨架，后续真实内容仍然会沿用当前 Auth 与 RLS
          边界。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-control bg-primary px-4 py-3 text-primary-foreground"
            href="/works"
          >
            进入作品列表
          </Link>
          {access.capabilities.has("work:author") ? (
            <Link
              className="rounded-control border border-border px-4 py-3"
              href="/author"
            >
              Author 入口
            </Link>
          ) : null}
        </div>
      </section>
      <form action={signOut}>
        <button
          className="min-h-11 rounded-control border border-border px-4"
          type="submit"
        >
          退出登录
        </button>
      </form>
    </div>
  );
}
