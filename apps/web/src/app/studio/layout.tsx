import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { getWebAccessContext } from "../../lib/identity-access";
import { privatePageMetadata } from "../../lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = privatePageMetadata("Author Studio");

const studioNavigation = [
  { href: "/studio", label: "Studio 首页" },
  { href: "/studio/works", label: "作品管理" },
  { href: "/studio/articles", label: "文章管理" },
] as const;

export default async function StudioLayout({ children }: PropsWithChildren) {
  const access = await getWebAccessContext();
  if (!access) redirect("/auth/sign-in");
  if (!access.capabilities.has("work:author")) redirect("/archive");

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="h-fit rounded-card border border-border bg-surface p-4 lg:sticky lg:top-6">
        <Link
          className="block rounded-control px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          href="/studio"
        >
          <span className="eyebrow">Author</span>
          <span className="mt-1 block text-lg font-semibold">Studio</span>
        </Link>
        <nav
          aria-label="Studio 导航"
          className="mt-4 grid grid-cols-3 gap-1 lg:grid-cols-1"
        >
          {studioNavigation.map((item) => (
            <Link
              className="min-h-11 rounded-control px-3 py-2 text-sm font-medium hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 site-stack">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface px-5 py-4">
          <div>
            <p className="font-semibold">Author Studio</p>
            <p className="mt-1 text-sm text-muted-foreground">
              作品与文章的统一管理入口
            </p>
          </div>
          <div className="flex flex-wrap gap-1 text-sm">
            <Link
              className="inline-flex min-h-11 items-center rounded-control px-2 text-primary"
              href="/author/invitations"
            >
              邀请码管理
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-control px-2 text-primary"
              href="/works"
            >
              返回 Reader
            </Link>
          </div>
        </header>

        <div className="min-w-0 site-stack">{children}</div>
      </div>
    </div>
  );
}
