import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";

export interface NavigationItem {
  href: string;
  label: string;
}

interface SharedLayoutProps extends PropsWithChildren {
  footerLinks?: NavigationItem[];
  headerActions?: ReactNode;
  navigation: NavigationItem[];
  sidebar?: ReactNode;
  surface: "reader" | "admin" | "docs";
  title: string;
}

export function SharedLayout({
  children,
  footerLinks,
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
        <div className="site-header-layout mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="site-header-brand" data-header-region="brand">
            <a
              className="site-header-brand-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href="/"
            >
              {title}
            </a>
          </div>
          <nav
            aria-label="主要导航"
            className="site-header-navigation site-header-navigation-desktop"
            data-header-region="navigation"
          >
            {navigation.map((item) => (
              <a
                className="site-header-navigation-link rounded-control text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div
            aria-label="显示与账号"
            className="site-header-utilities"
            data-header-region="utility-account"
            role="group"
          >
            <ThemeToggle />
            {headerActions}
          </div>
          <details className="site-header-mobile-navigation">
            <summary className="site-header-mobile-navigation-trigger rounded-control text-sm">
              浏览站点
            </summary>
            <nav
              aria-label="移动端主要导航"
              className="site-header-mobile-navigation-links"
            >
              {navigation.map((item) => (
                <a
                  className="site-header-navigation-link rounded-control text-sm"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
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
      <footer className="site-footer border-t border-border px-4 py-6 text-sm text-muted-foreground">
        <div className="site-footer-layout mx-auto max-w-screen-xl">
          <span>Fandom Harbor · 私域作品归档</span>
          {footerLinks?.length ? (
            <nav aria-label="公开政策" className="site-footer-navigation">
              {footerLinks.map((item) => (
                <a
                  className="site-footer-link rounded-control"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

export function ReaderLayout({
  children,
  headerActions,
  navigation,
}: PropsWithChildren<{
  headerActions?: ReactNode;
  navigation?: NavigationItem[];
}>) {
  return (
    <SharedLayout
      footerLinks={[
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
        { href: "/content-policy", label: "Content Policy" },
      ]}
      headerActions={headerActions}
      navigation={
        navigation ?? [
          { href: "/archive", label: "Archive" },
          { href: "/search", label: "Search" },
        ]
      }
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
      title="Fandom Harbor"
    >
      {children}
    </SharedLayout>
  );
}

export function DocsLayout({ children }: PropsWithChildren) {
  return (
    <SharedLayout
      navigation={[{ href: "/", label: "文档首页" }]}
      surface="docs"
      title="Fandom Harbor"
    >
      {children}
    </SharedLayout>
  );
}
