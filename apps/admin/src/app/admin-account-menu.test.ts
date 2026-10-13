import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, Fragment } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAccountMenu } from "./admin-account-menu";

vi.mock("./auth/actions", () => ({
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

afterEach(cleanup);

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      matches: false,
      media: query,
      removeEventListener: vi.fn(),
    })),
    writable: true,
  });
});

const identity = {
  displayRole: "超级管理员" as const,
  registrationName: "akumie-with-a-long-registration-name",
  surface: "admin" as const,
};

function accountMenu() {
  return createElement(AdminAccountMenu, { identity });
}

describe("AdminAccountMenu", () => {
  it("renders a compact identity trigger with accessible disclosure state", () => {
    render(accountMenu());

    const trigger = screen.getByRole("button", {
      name: `账号：${identity.registrationName}，超级管理员`,
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).not.toBeNull();
    expect(screen.getByText(identity.registrationName)).not.toBeNull();
    expect(screen.getByText("超级管理员")).not.toBeNull();
    expect(screen.queryByRole("region", { name: "账号菜单" })).toBeNull();
  });

  it("opens and closes from the trigger while rendering the canonical logout", () => {
    render(accountMenu());

    const trigger = screen.getByRole("button", {
      name: `账号：${identity.registrationName}，超级管理员`,
    });
    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: "账号菜单" })).not.toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "退出登录" }),
    );
    expect(screen.getAllByText(identity.registrationName)).toHaveLength(2);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region", { name: "账号菜单" })).toBeNull();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(accountMenu());

    const trigger = screen.getByRole("button", {
      name: `账号：${identity.registrationName}，超级管理员`,
    });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("region", { name: "账号菜单" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when the pointer moves outside the account surface", () => {
    render(
      createElement(
        Fragment,
        null,
        accountMenu(),
        createElement("button", { type: "button" }, "外部操作"),
      ),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: `账号：${identity.registrationName}，超级管理员`,
      }),
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "外部操作" }));

    expect(screen.queryByRole("region", { name: "账号菜单" })).toBeNull();
  });
});
