import { describe, expect, it } from "vitest";

import {
  adminNavigationConfig,
  getActiveAdminNavigationItem,
} from "./admin-navigation";

describe("Admin navigation config", () => {
  it("contains only the two real Admin routes with canonical labels", () => {
    expect(adminNavigationConfig).toEqual([
      { href: "/", label: "站点文案", match: "exact" },
      {
        accessibilityLabel: "身份与权限",
        href: "/access",
        label: "身份与权限",
        match: "segment",
      },
    ]);
  });

  it("does not contain duplicate href values", () => {
    const hrefs = adminNavigationConfig.map(({ href }) => href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it.each([
    ["/", "/", "站点文案"],
    ["/access", "/access", "身份与权限"],
    ["/access?q=akumie", "/access", "身份与权限"],
    ["/access?subject=subject-id", "/access", "身份与权限"],
    ["/access/?q=akumie#detail", "/access", "身份与权限"],
  ])("matches %s to %s", (location, href, label) => {
    expect(getActiveAdminNavigationItem(location)).toMatchObject({
      href,
      label,
    });
  });

  it.each(["/auth/sign-in", "/accessibility", "/missing"])(
    "does not activate an unrelated route: %s",
    (location) => {
      expect(getActiveAdminNavigationItem(location)).toBeNull();
    },
  );
});
