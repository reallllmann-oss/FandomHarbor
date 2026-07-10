import { AppProviders, ReaderLayout } from "@fandom-harbor/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import Link from "next/link";

import "./globals.css";
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
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <ReaderLayout
            headerActions={
              session ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="hidden max-w-32 truncate sm:inline">
                    {session.displayName}
                  </span>
                  {session.access.capabilities.has("work:author") ? (
                    <Link className="rounded-control px-3 py-2" href="/studio">
                      Studio
                    </Link>
                  ) : null}
                  <form action={signOut}>
                    <button className="rounded-control px-3 py-2" type="submit">
                      退出
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm">
                  <Link
                    className="rounded-control px-3 py-2"
                    href="/auth/sign-in"
                  >
                    登录
                  </Link>
                  <Link
                    className="rounded-control px-3 py-2"
                    href="/auth/sign-up"
                  >
                    注册
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
