import { AppProviders, ReaderLayout } from "@fandom-harbor/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import "./globals.css";

export const metadata: Metadata = {
  description: "阅读优先的邀请制作品归档平台。",
  title: "Fandom Harbor",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <ReaderLayout>{children}</ReaderLayout>
        </AppProviders>
      </body>
    </html>
  );
}
