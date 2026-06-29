import { AppProviders, DocsLayout } from "@fandom-harbor/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "./globals.css";

export const metadata: Metadata = {
  description: "Fandom Harbor 只读项目文档浏览入口。",
  title: "Fandom Harbor Docs",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <DocsLayout>{children}</DocsLayout>
        </AppProviders>
      </body>
    </html>
  );
}
