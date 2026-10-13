import { AppProviders } from "@fandom-harbor/ui";
import { cleanup, render, screen, within } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminShell } from "./admin-shell";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);
const mockedUseSearchParams = vi.mocked(useSearchParams);

afterEach(cleanup);

function renderShell(pathname: string, query = "") {
  mockedUsePathname.mockReturnValue(pathname);
  mockedUseSearchParams.mockReturnValue(
    new URLSearchParams(query) as ReturnType<typeof useSearchParams>,
  );
  return render(
    <AppProviders>
      <AdminShell headerActions={<button type="button">账号菜单</button>}>
        <h1>页面内容</h1>
      </AdminShell>
    </AppProviders>,
  );
}

describe("AdminShell navigation presentation", () => {
  beforeEach(() => {
    mockedUsePathname.mockReset();
    mockedUseSearchParams.mockReset();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
      writable: true,
    });
  });

  it("uses the Sidebar as the only desktop primary navigation surface", () => {
    renderShell("/");

    const desktopNavigation = screen.getByRole("navigation", {
      name: "后台主要导航",
    });
    expect(
      within(desktopNavigation)
        .getByRole("link", { name: "站点文案" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.queryByRole("navigation", { name: "主要导航" })).toBeNull();
    expect(screen.getByLabelText("当前页面：站点文案")).toBeTruthy();
    expect(screen.getByRole("button", { name: "账号菜单" })).toBeTruthy();
    expect(screen.getByText("管理后台")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /返回/ })).toBeNull();
  });

  it("marks access active and uses a deterministic product back link", () => {
    renderShell("/access");

    const desktopNavigation = screen.getByRole("navigation", {
      name: "后台主要导航",
    });
    expect(
      within(desktopNavigation)
        .getByRole("link", { name: "身份与权限" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByLabelText("当前页面：身份与权限")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "返回站点文案" }).getAttribute("href"),
    ).toBe("/");
    expect(
      screen.queryByRole("navigation", { name: "移动端主要导航" }),
    ).toBeNull();
  });

  it("removes only subject from the detail back destination", () => {
    renderShell(
      "/access",
      "q=akumie&subject=subject-id&cursor=next&auditCursor=audit-next",
    );

    expect(
      screen
        .getByRole("link", { name: "返回身份与权限列表" })
        .getAttribute("href"),
    ).toBe("/access?q=akumie&cursor=next&auditCursor=audit-next");
  });

  it("does not render protected navigation or page context on sign-in", () => {
    renderShell("/auth/sign-in");

    expect(
      screen.queryByRole("navigation", { name: "后台主要导航" }),
    ).toBeNull();
    expect(
      screen.queryByRole("navigation", { name: "移动端主要导航" }),
    ).toBeNull();
    expect(screen.queryByText(/当前页面：/)).toBeNull();
    expect(screen.queryByText("管理后台")).toBeNull();
  });
});
