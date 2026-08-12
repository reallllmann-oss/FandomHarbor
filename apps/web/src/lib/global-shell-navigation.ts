import type { NavigationItem } from "@fandom-harbor/ui";

interface GlobalShellNavigationLabels {
  archive: string;
  search: string;
  studio: string;
}

export function createGlobalShellNavigation(
  canAccessStudio: boolean,
  labels: GlobalShellNavigationLabels,
): NavigationItem[] {
  const readerNavigation = [
    { href: "/archive", label: labels.archive },
    { href: "/search", label: labels.search },
  ] satisfies NavigationItem[];
  const studioNavigation = {
    href: "/studio",
    label: labels.studio,
  } satisfies NavigationItem;

  return canAccessStudio
    ? [...readerNavigation, studioNavigation]
    : [...readerNavigation];
}
