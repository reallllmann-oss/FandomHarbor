import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";

export interface NavigationItem {
  href: string;
  label: string;
}

interface SharedLayoutProps extends PropsWithChildren {
  description: string;
  headerActions?: ReactNode;
  navigation: NavigationItem[];
  sidebar?: ReactNode;
  surface: "reader" | "admin" | "docs";
  title: string;
}

export function SharedLayout({
  children,
  description,
  headerActions,
  navigation,
  sidebar,
  surface,
  title,
}: SharedLayoutProps) {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-surface={surface}
    >
      <a
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-control bg-primary px-4 py-2 text-primary-foreground focus:translate-y-0"
        href="#main-content"
      >
        跳到主要内容
      </a>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-16 max-w-screen-xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="truncate font-semibold">{title}</p>
            <p className="truncate text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <nav
              aria-label="主要导航"
              className="hidden items-center gap-1 md:flex"
            >
              {navigation.map((item) => (
                <a
                  className="rounded-control px-3 py-2 text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <ThemeToggle />
            {headerActions}
          </div>
        </div>
      </header>
      <div
        className={cn(
          "mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8",
          sidebar && "admin-grid",
        )}
      >
        {sidebar ? <aside aria-label="管理导航">{sidebar}</aside> : null}
        <main id="main-content">{children}</main>
      </div>
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Fandom Harbor · 私域作品归档
      </footer>
    </div>
  );
}

export function ReaderLayout({
  children,
  headerActions,
}: PropsWithChildren<{ headerActions?: ReactNode }>) {
  return (
    <SharedLayout
      description="阅读优先的私域作品归档"
      headerActions={headerActions}
      navigation={[
        { href: "/", label: "首页" },
        { href: "/search", label: "搜索" },
        { href: "/works", label: "作品" },
        { href: "/archive", label: "Archive" },
        { href: "/author", label: "Author 入口" },
      ]}
      surface="reader"
      title="Fandom Harbor"
    >
      {children}
    </SharedLayout>
  );
}

export function AdminLayout({ children }: PropsWithChildren) {
  const navigation = [
    { href: "/", label: "概览" },
    { href: "/access", label: "身份与权限" },
  ];

  return (
    <SharedLayout
      description="安全、可审计的管理工作区"
      navigation={navigation}
      sidebar={
        <nav aria-label="后台分区" className="space-y-2">
          {navigation.map((item) => (
            <a
              className="block rounded-control px-3 py-2 text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>
      }
      surface="admin"
      title="Fandom Harbor Admin"
    >
      {children}
    </SharedLayout>
  );
}

export function DocsLayout({ children }: PropsWithChildren) {
  return (
    <SharedLayout
      description="只读项目文档浏览入口"
      navigation={[{ href: "/", label: "文档首页" }]}
      surface="docs"
      title="Fandom Harbor Docs"
    >
      {children}
    </SharedLayout>
  );
}
