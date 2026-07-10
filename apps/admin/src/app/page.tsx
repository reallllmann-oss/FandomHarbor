import { redirect } from "next/navigation";

import { getAdminAccessContext } from "../lib/identity-access";
import { signOut } from "./auth/actions";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const access = await getAdminAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("admin:operate")) {
    redirect("/auth/sign-in?error=forbidden");
  }

  return (
    <div className="site-stack" id="foundation">
      <section className="hero-panel">
        <p className="eyebrow">Admin Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          第一版后台骨架已就位，重点先覆盖身份、访问与内容运营的入口感知。
        </h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          当前身份已通过服务端验证；后台能力继续由 active membership、Role Grant
          与 PostgreSQL RLS 双层强制。Sprint 002A
          只建立页面框架，不扩展复杂业务。
        </p>
      </section>

      <section className="info-grid">
        {[
          ["权限状态", [...access.roles].join(", ") || "无 elevated role"],
          ["Membership", access.membershipState ?? "未入站"],
          [
            "当前能力",
            access.capabilities.has("super_admin:operate")
              ? "Super Admin"
              : "Admin",
          ],
        ].map(([label, value]) => (
          <article className="stat-card" key={label}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <article className="stat-card">
          <p className="eyebrow">Operational Focus</p>
          <h2 className="mt-3 text-2xl font-semibold">后台首页雏形</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["待处理访问请求", "04", "下一阶段可接入申请队列"],
              ["最近角色变更", "02", "继续复用现有 audit 机制"],
              ["内容区状态", "Empty", "Author 面板已预留入口"],
            ].map(([label, value, detail]) => (
              <div
                className="rounded-card border border-border bg-surface-muted p-4"
                key={label}
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="stat-card">
          <p className="eyebrow">Quick Access</p>
          <h2 className="mt-3 text-2xl font-semibold">管理入口</h2>
          <div className="mt-5 space-y-3 text-sm">
            <a
              className="block rounded-card border border-border p-4 hover:bg-surface-muted"
              href="/access"
            >
              身份与权限管理
            </a>
            <div className="rounded-card border border-border p-4">
              <p className="font-medium">Author 空状态入口</p>
              <p className="mt-2 text-muted-foreground">
                与 Reader 站点分离部署；当前 Sprint 已在 Web 端提供独立 Author
                页面骨架。
              </p>
            </div>
            <div className="rounded-card border border-border p-4">
              <p className="font-medium">Reader 作品骨架</p>
              <p className="mt-2 text-muted-foreground">
                作品列表与阅读页均使用 mock data，后续再通过 Repository
                边界接入真实内容。
              </p>
            </div>
          </div>
        </article>
      </section>

      <form action={signOut}>
        <button
          className="min-h-11 rounded-control border border-border px-4"
          type="submit"
        >
          退出后台
        </button>
      </form>
    </div>
  );
}
