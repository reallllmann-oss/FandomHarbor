import { readFile } from "node:fs/promises";

import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { describe, expect, it } from "vitest";

import { shouldShowAdminHeaderAction } from "../lib/admin-presentation";

async function source(pathname: string) {
  return readFile(new URL(pathname, import.meta.url), "utf8");
}

function accessFor(role: "admin" | "author" | "reader" | "super_admin") {
  return createTrustedAccessContext({
    identity: { id: "20000000-0000-4000-8000-000000000011" },
    membershipState: "active",
    roles: role === "reader" ? [] : [role],
  });
}

describe("Admin authenticated header actions", () => {
  it.each(["admin", "super_admin"] as const)(
    "shows the action to an active %s",
    (role) => {
      expect(shouldShowAdminHeaderAction(accessFor(role))).toBe(true);
    },
  );

  it.each(["reader", "author"] as const)(
    "does not expose the action to an active %s",
    (role) => {
      expect(shouldShowAdminHeaderAction(accessFor(role))).toBe(false);
    },
  );

  it("does not expose the action without a trusted access context", () => {
    expect(shouldShowAdminHeaderAction(null)).toBe(false);
  });

  it("uses the existing sign-out action and fails closed on access errors", async () => {
    const header = await source("./admin-header-actions.tsx");

    expect(header).toContain("await getAdminAccessContext()");
    expect(header).toContain("shouldShowAdminHeaderAction(access)");
    expect(header).toContain("catch");
    expect(header).toContain("return null");
    expect(header).toContain("<form action={signOut}");
    expect(header).toContain("退出登录");
    expect(header).toContain("退出");
  });

  it("mounts the action in the global Header after the theme control", async () => {
    const [header, layout, sharedLayout, styles] = await Promise.all([
      source("./admin-header-actions.tsx"),
      source("./layout.tsx"),
      source("../../../../packages/ui/src/components/layouts.tsx"),
      source("../../../../packages/ui/src/styles.css"),
    ]);

    expect(layout).toContain(
      "<AdminLayout headerActions={<AdminHeaderActions />}>",
    );
    expect(sharedLayout).toContain('className="site-header-utilities"');
    expect(sharedLayout.indexOf("<ThemeToggle />")).toBeLessThan(
      sharedLayout.indexOf("{headerActions}"),
    );
    expect(sharedLayout).toContain("data-surface={surface}");
    expect(styles).toContain('[data-surface="admin"] .site-header-layout > *');
    expect(styles).toContain(
      '[data-surface="admin"] .site-header-utilities > *',
    );
    expect(styles).toContain("max-width: 100%");
    expect(styles).toContain("min-width: 0");
    expect(header).toContain(
      'className="site-header-account-action max-w-full',
    );
  });
});
