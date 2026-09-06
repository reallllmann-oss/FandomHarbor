import { AdminLayout, AppProviders } from "@fandom-harbor/ui";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { AdminHeaderActions } from "./admin-header-actions";
import "./globals.css";

export const metadata: Metadata = {
  description: "Fandom Harbor 安静、可审计的站点管理工作区。",
  title: "Fandom Harbor 管理后台",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>
          <AdminLayout headerActions={<AdminHeaderActions />}>
            {children}
          </AdminLayout>
        </AppProviders>
      </body>
    </html>
  );
}
