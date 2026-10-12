"use client";

import { AdminLayout } from "@fandom-harbor/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type PropsWithChildren, type ReactNode } from "react";

import {
  adminNavigationConfig,
  getAdminMobileBackHref,
  getActiveAdminNavigationItem,
} from "../lib/admin-navigation";

function MobileLeadingContent({ backHref }: { backHref: string | null }) {
  return backHref ? (
    <a
      aria-label={backHref === "/" ? "返回站点文案" : "返回身份与权限列表"}
      className="admin-mobile-back rounded-control"
      href={backHref}
    >
      <span aria-hidden="true">←</span>
      <span>返回</span>
    </a>
  ) : (
    <span className="admin-mobile-product-context">管理后台</span>
  );
}

function QueryAwareMobileLeading({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const location = query ? `${pathname}?${query}` : pathname;

  return <MobileLeadingContent backHref={getAdminMobileBackHref(location)} />;
}

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
      mobileLeading={
        <Suspense
          fallback={
            <MobileLeadingContent backHref={getAdminMobileBackHref(pathname)} />
          }
        >
          <QueryAwareMobileLeading pathname={pathname} />
        </Suspense>
      }
      navigation={adminNavigationConfig}
      pageContext={activeItem?.label}
      showNavigation={activeItem !== null}
    >
      {children}
    </AdminLayout>
  );
}
