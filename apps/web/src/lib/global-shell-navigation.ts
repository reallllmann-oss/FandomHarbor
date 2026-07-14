import type { NavigationItem } from "@fandom-harbor/ui";

const readerNavigation = [
  { href: "/archive", label: "Archive" },
  { href: "/search", label: "Search" },
] satisfies NavigationItem[];

const studioNavigation = {
  href: "/studio",
  label: "Studio",
} satisfies NavigationItem;

export function createGlobalShellNavigation(
  canAccessStudio: boolean,
): NavigationItem[] {
  return canAccessStudio
    ? [...readerNavigation, studioNavigation]
    : [...readerNavigation];
}
