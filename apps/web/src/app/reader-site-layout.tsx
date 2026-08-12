import { ThemeToggle, type NavigationItem } from "@fandom-harbor/ui";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/content-policy", label: "Content Policy" },
] satisfies NavigationItem[];

export function ReaderSiteLayout({
  children,
  footerBrandNote,
  headerActions,
  navigation,
}: PropsWithChildren<{
  footerBrandNote: string;
  headerActions?: ReactNode;
  navigation: NavigationItem[];
}>) {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-surface="reader"
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
            <Link
              className="site-header-brand-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              href="/"
            >
              Fandom Harbor
            </Link>
          </div>
          <nav
            aria-label="主要导航"
            className="site-header-navigation site-header-navigation-desktop"
            data-header-region="navigation"
          >
            {navigation.map((item) => (
              <Link
                className="site-header-navigation-link rounded-control text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
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
                <Link
                  className="site-header-navigation-link rounded-control text-sm"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </header>
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <main id="main-content">{children}</main>
      </div>
      <footer className="site-footer border-t border-border px-4 py-6 text-sm text-muted-foreground">
        <div className="site-footer-layout mx-auto max-w-screen-xl">
          <span>{footerBrandNote}</span>
          <nav aria-label="公开政策" className="site-footer-navigation">
            {footerLinks.map((item) => (
              <Link
                className="site-footer-link rounded-control"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
