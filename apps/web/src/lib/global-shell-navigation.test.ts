import { describe, expect, it } from "vitest";

import { createGlobalShellNavigation } from "./global-shell-navigation";

describe("createGlobalShellNavigation", () => {
  it("只向访客与 Reader 提供公共发现入口", () => {
    expect(createGlobalShellNavigation(false)).toEqual([
      { href: "/archive", label: "Archive" },
      { href: "/search", label: "Search" },
    ]);
  });

  it("只在具有作者能力时加入 Studio 入口", () => {
    expect(createGlobalShellNavigation(true)).toEqual([
      { href: "/archive", label: "Archive" },
      { href: "/search", label: "Search" },
      { href: "/studio", label: "Studio" },
    ]);
  });
});
