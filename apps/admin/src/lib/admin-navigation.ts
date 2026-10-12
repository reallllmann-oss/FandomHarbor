import type { NavigationItem } from "@fandom-harbor/ui";

export type AdminNavigationMatch = "exact" | "segment";

export interface AdminNavigationItem extends NavigationItem {
  accessibilityLabel?: string;
  match: AdminNavigationMatch;
}

export const adminNavigationConfig = [
  {
    href: "/",
    label: "站点文案",
    match: "exact",
  },
  {
    accessibilityLabel: "身份与权限",
    href: "/access",
    label: "身份与权限",
    match: "segment",
  },
] as const satisfies readonly AdminNavigationItem[];

function pathnameFromLocation(location: string): string {
  const queryIndex = location.indexOf("?");
  const hashIndex = location.indexOf("#");
  const firstSuffixIndex = [queryIndex, hashIndex]
    .filter((index) => index >= 0)
    .reduce((first, index) => Math.min(first, index), location.length);
  const pathname = location.slice(0, firstSuffixIndex);

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname || "/";
}

export function isAdminNavigationItemActive(
  item: AdminNavigationItem,
  location: string,
): boolean {
  const pathname = pathnameFromLocation(location);

  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getActiveAdminNavigationItem(
  location: string,
): AdminNavigationItem | null {
  return (
    adminNavigationConfig.find((item) =>
      isAdminNavigationItemActive(item, location),
    ) ?? null
  );
}
