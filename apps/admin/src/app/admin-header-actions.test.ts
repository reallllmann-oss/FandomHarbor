import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

async function source(pathname: string) {
  return readFile(new URL(pathname, import.meta.url), "utf8");
}

describe("Admin authenticated header actions", () => {
  it("uses the trusted current identity and fails closed on access errors", async () => {
    const header = await source("./admin-header-actions.tsx");

    expect(header).toContain("await getAdminCurrentIdentity()");
    expect(header).toContain("catch");
    expect(header).toContain("return null");
    expect(header).toContain("<AdminMobileNavigation identity={identity} />");
  });

  it("mounts the action in the global Header after the theme control", async () => {
    const [header, layout, sharedLayout, styles] = await Promise.all([
      source("./admin-header-actions.tsx"),
      source("./layout.tsx"),
      source("../../../../packages/ui/src/components/layouts.tsx"),
      source("../../../../packages/ui/src/styles.css"),
    ]);

    expect(layout).toContain(
      "<AdminShell headerActions={<AdminHeaderActions />}>",
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
    expect(header).toContain("AdminMobileNavigation");
  });

  it("keeps the sign-in route free of account-menu identity or logout UI", async () => {
    const [shell, signInPage] = await Promise.all([
      source("./admin-shell.tsx"),
      source("./auth/sign-in/page.tsx"),
    ]);

    expect(signInPage).not.toContain("AdminAccountMenu");
    expect(signInPage).not.toContain("退出登录");
    expect(shell).toContain("usePathname()");
    expect(shell).not.toContain("capabilities");
    expect(shell).not.toContain("getAdminAccessContext");
    expect(shell).not.toContain("getAdminCurrentIdentity");
  });
});
