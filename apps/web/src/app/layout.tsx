import { AppProviders, ReaderLayout } from "@fandom-harbor/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import Link from "next/link";

import "./globals.css";
import { createGlobalShellNavigation } from "../lib/global-shell-navigation";
import { getWebSessionSummary } from "../lib/identity-access";
import { resolveSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "../lib/seo";
import { signOut } from "./auth/actions";

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
  const session = await getWebSessionSummary();
  const navigation = createGlobalShellNavigation(
    session?.access.capabilities.has("work:author") ?? false,
  );

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <ReaderLayout
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
          </ReaderLayout>
        </AppProviders>
      </body>
    </html>
  );
}
