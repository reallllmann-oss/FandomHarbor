import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";

export interface NavigationItem {
  accessibilityLabel?: string;
  href: string;
  label: string;
}

interface SharedLayoutProps extends PropsWithChildren {
  activeNavigationHref?: string;
  footerLinks?: NavigationItem[];
  headerActions?: ReactNode;
  headerContext?: ReactNode;
  mobileLeading?: ReactNode;
  navigation: readonly NavigationItem[];
  showDesktopNavigation?: boolean;
  showMobileNavigation?: boolean;
  sidebar?: ReactNode;
  surface: "reader" | "admin" | "docs";
  title: string;
}

export function SharedLayout({
  activeNavigationHref,
  children,
  footerLinks,
  headerActions,
  headerContext,
  mobileLeading,
  navigation,
  showDesktopNavigation = true,
  showMobileNavigation = true,
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
          {mobileLeading ? (
            <div
              className="site-header-mobile-leading"
              data-header-region="mobile-leading"
            >
              {mobileLeading}
            </div>
          ) : null}
          {showDesktopNavigation ? (
            <nav
              aria-label="主要导航"
              className="site-header-navigation site-header-navigation-desktop"
              data-header-region="navigation"
            >
              {navigation.map((item) => (
                <a
                  aria-label={item.accessibilityLabel}
                  aria-current={
                    activeNavigationHref === item.href ? "page" : undefined
                  }
                  className="site-header-navigation-link rounded-control text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : (
            <div
              className="site-header-context"
              data-header-region="page-context"
            >
              {headerContext}
            </div>
          )}
          <div
            aria-label="显示与账号"
            className="site-header-utilities"
            data-header-region="utility-account"
            role="group"
          >
            <ThemeToggle />
            {headerActions}
          </div>
          {showMobileNavigation && navigation.length > 0 ? (
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
                    aria-label={item.accessibilityLabel}
                    aria-current={
                      activeNavigationHref === item.href ? "page" : undefined
                    }
                    className="site-header-navigation-link rounded-control text-sm"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </details>
          ) : null}
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
  navigation?: readonly NavigationItem[];
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

export function AdminLayout({
  activeNavigationHref,
  children,
  headerActions,
  mobileLeading,
  navigation,
  pageContext,
  showNavigation = true,
}: PropsWithChildren<{
  activeNavigationHref?: string;
  headerActions?: ReactNode;
  mobileLeading?: ReactNode;
  navigation: readonly NavigationItem[];
  pageContext?: string;
  showNavigation?: boolean;
}>) {
  return (
    <SharedLayout
      activeNavigationHref={activeNavigationHref}
      headerActions={headerActions}
      headerContext={
        pageContext ? (
          <p aria-label={`当前页面：${pageContext}`}>
            <span className="site-header-context-prefix">当前页面：</span>
            <strong>{pageContext}</strong>
          </p>
        ) : null
      }
      mobileLeading={pageContext ? mobileLeading : undefined}
      navigation={navigation}
      showDesktopNavigation={false}
      showMobileNavigation={false}
      sidebar={
        showNavigation ? (
          <nav aria-label="后台主要导航" className="admin-primary-navigation">
            {navigation.map((item) => (
              <a
                aria-label={item.accessibilityLabel}
                aria-current={
                  activeNavigationHref === item.href ? "page" : undefined
                }
                className="admin-primary-navigation-link rounded-control text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : undefined
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
