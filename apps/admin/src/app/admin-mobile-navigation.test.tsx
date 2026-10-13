import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { usePathname } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminMobileNavigation } from "./admin-mobile-navigation";

vi.mock("./auth/actions", () => ({ signOut: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);
const identity = {
  displayRole: "超级管理员" as const,
  registrationName: "akumie-with-a-long-registration-name",
  surface: "admin" as const,
};

function renderMobileNavigation(pathname = "/access") {
  mockedUsePathname.mockReturnValue(pathname);
  return render(
    <div data-surface="admin">
      <a href="#main-content">跳到主要内容</a>
      <header>
        <div data-header-region="brand">Brand</div>
        <div data-header-region="mobile-leading">Back</div>
        <div data-header-region="page-context">Context</div>
        <div className="site-header-utilities">
          <button type="button">Theme</button>
          <AdminMobileNavigation identity={identity} />
        </div>
      </header>
      <main id="main-content">Main</main>
      <footer className="site-footer">Footer</footer>
    </div>,
  );
}

function trigger() {
  return screen.getByRole("button", {
    name: `打开管理导航，当前账号：${identity.registrationName}，超级管理员`,
  });
}

describe("AdminMobileNavigation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        matches: true,
        media: query,
        removeEventListener: vi.fn(),
      })),
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("opens one modal drawer with canonical navigation, identity, and logout", () => {
    renderMobileNavigation();
    const menuTrigger = trigger();
    fireEvent.click(menuTrigger);

    const dialog = screen.getByRole("dialog", { name: "管理导航和账号" });
    const navigation = within(dialog).getByRole("navigation", {
      name: "移动端后台主要导航",
    });
    expect(menuTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(
      within(dialog).getByRole("button", { name: "关闭管理导航" }),
    );
    expect(
      within(navigation)
        .getByRole("link", { name: "身份与权限" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(within(dialog).getByText(identity.registrationName)).toBeTruthy();
    expect(within(dialog).getByText("超级管理员")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "退出登录" })).toHaveLength(1);
  });

  it("closes from backdrop and Escape and returns focus to the trigger", () => {
    renderMobileNavigation();
    let menuTrigger = trigger();
    fireEvent.click(menuTrigger);
    expect(screen.queryByRole("button", { name: "关闭导航遮罩" })).toBeNull();
    fireEvent.click(
      document.querySelector<HTMLButtonElement>(
        ".admin-mobile-navigation-backdrop",
      )!,
    );
    expect(screen.queryByRole("dialog", { name: "管理导航和账号" })).toBeNull();
    expect(document.activeElement).toBe(menuTrigger);

    menuTrigger = trigger();
    fireEvent.click(menuTrigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "管理导航和账号" })).toBeNull();
    expect(document.activeElement).toBe(menuTrigger);
  });

  it("traps focus and restores body interaction state", () => {
    renderMobileNavigation();
    const menuTrigger = trigger();
    const skipLink = screen.getByRole("link", { name: "跳到主要内容" });
    fireEvent.click(menuTrigger);

    const close = screen.getByRole("button", { name: "关闭管理导航" });
    const logout = screen.getByRole("button", { name: "退出登录" });
    expect(document.body.style.overflow).toBe("hidden");
    expect(menuTrigger.inert).toBe(true);
    expect(skipLink.inert).toBe(true);
    expect(document.querySelector<HTMLElement>("#main-content")?.inert).toBe(
      true,
    );

    logout.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(logout);

    fireEvent.click(close);
    expect(document.body.style.overflow).toBe("");
    expect(menuTrigger.inert).toBe(false);
    expect(document.querySelector<HTMLElement>("#main-content")?.inert).toBe(
      false,
    );
  });

  it("closes after choosing a navigation destination", () => {
    renderMobileNavigation();
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("link", { name: "站点文案" }));
    expect(screen.queryByRole("dialog", { name: "管理导航和账号" })).toBeNull();
  });
});
