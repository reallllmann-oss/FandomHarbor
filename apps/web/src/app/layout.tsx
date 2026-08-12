import { AppProviders } from "@fandom-harbor/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import Link from "next/link";

import "./globals.css";
import { createGlobalShellNavigation } from "../lib/global-shell-navigation";
import { getWebSessionSummary } from "../lib/identity-access";
import { readWebPublicSiteCopy } from "../lib/public-site-copy";
import { resolveSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";
import { signOut } from "./auth/actions";
import { ReaderSiteLayout } from "./reader-site-layout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(resolveSiteUrl()),
  openGraph: {
    description: SITE_DESCRIPTION,
    locale: "zh_CN",
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: "website",
    url: "/",
  },
  robots: { follow: true, index: true },
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const [session, siteCopy] = await Promise.all([
    getWebSessionSummary(),
    readWebPublicSiteCopy(),
  ]);
  const navigation = createGlobalShellNavigation(
    session?.access.capabilities.has("work:author") ?? false,
    {
      archive: siteCopy.content.navigation_archive_label,
      search: siteCopy.content.navigation_search_label,
      studio: siteCopy.content.navigation_studio_label,
    },
  );

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <ReaderSiteLayout
            footerBrandNote={siteCopy.content.footer_brand_note}
            navigation={navigation}
            headerActions={
              session ? (
                <div className="site-header-account text-sm">
                  <span className="site-header-account-name">
                    {session.displayName}
                  </span>
                  <form action={signOut}>
                    <button
                      className="site-header-account-action rounded-control"
                      type="submit"
                    >
                      退出
                    </button>
                  </form>
                </div>
              ) : (
                <div className="site-header-account text-sm">
                  <Link
                    className="site-header-account-action rounded-control"
                    href="/auth/sign-in"
                  >
                    登录
                  </Link>
                </div>
              )
            }
          >
            {children}
          </ReaderSiteLayout>
        </AppProviders>
      </body>
    </html>
  );
}
