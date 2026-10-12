"use client";

import { AdminLayout } from "@fandom-harbor/ui";
import { usePathname } from "next/navigation";
import type { PropsWithChildren, ReactNode } from "react";

import {
  adminNavigationConfig,
  getActiveAdminNavigationItem,
} from "../lib/admin-navigation";

export function AdminShell({
  children,
  headerActions,
}: PropsWithChildren<{ headerActions?: ReactNode }>) {
  const pathname = usePathname();
  const activeItem = getActiveAdminNavigationItem(pathname);

  return (
    <AdminLayout
      activeNavigationHref={activeItem?.href}
      headerActions={headerActions}
      navigation={adminNavigationConfig}
      pageContext={activeItem?.label}
      showNavigation={activeItem !== null}
    >
      {children}
    </AdminLayout>
  );
}
