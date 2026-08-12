import { describe, expect, it } from "vitest";

import { createGlobalShellNavigation } from "./global-shell-navigation";

const labels = {
  archive: "作品归档",
  search: "寻找作品",
  studio: "创作室",
};

describe("createGlobalShellNavigation", () => {
  it("只向访客与 Reader 提供固定顺序和路径的公共发现入口", () => {
    expect(createGlobalShellNavigation(false, labels)).toEqual([
      { href: "/archive", label: "作品归档" },
      { href: "/search", label: "寻找作品" },
    ]);
  });

  it("只在具有既有作者能力时按固定位置加入 Studio 入口", () => {
    expect(createGlobalShellNavigation(true, labels)).toEqual([
      { href: "/archive", label: "作品归档" },
      { href: "/search", label: "寻找作品" },
      { href: "/studio", label: "创作室" },
    ]);
  });
});
