import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { CurrentAccountIdentityFor } from "@fandom-harbor/auth";
import { usePathname } from "next/navigation";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { selectWebCurrentIdentity, WebAccountMenu } from "./web-account-menu";

vi.mock("./auth/actions", () => ({ signOut: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const mockedUsePathname = vi.mocked(usePathname);
const readerIdentity: CurrentAccountIdentityFor<"reader"> = {
  displayRole: "作者",
  registrationName: "akumie-with-a-long-registration-name",
  surface: "reader",
};
const authorIdentity: CurrentAccountIdentityFor<"author"> = {
  displayRole: "作者",
  registrationName: "akumie-with-a-long-registration-name",
  surface: "author",
};

afterEach(cleanup);

describe("WebAccountMenu", () => {
  it("selects the surface-safe identity without exposing Admin privilege", () => {
    expect(
      selectWebCurrentIdentity("/archive", {
        authorIdentity,
        readerIdentity,
      }),
    ).toBe(readerIdentity);
    expect(
      selectWebCurrentIdentity("/studio/works", {
        authorIdentity,
        readerIdentity,
      }),
    ).toBe(authorIdentity);
    expect(JSON.stringify({ authorIdentity, readerIdentity })).not.toContain(
      "超级管理员",
    );
  });

  it.each([
    { pathname: "/archive", surface: "Reader" },
    { pathname: "/studio", surface: "Author Studio" },
  ])("renders one canonical account menu on $surface", ({ pathname }) => {
    mockedUsePathname.mockReturnValue(pathname);
    render(createElement(WebAccountMenu, { authorIdentity, readerIdentity }));

    const trigger = screen.getByRole("button", {
      name: `账号：${readerIdentity.registrationName}，作者`,
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).not.toBeNull();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: "账号菜单" })).toBeTruthy();
    expect(screen.getAllByText(readerIdentity.registrationName)).toHaveLength(
      2,
    );
    expect(screen.getAllByRole("button", { name: "退出登录" })).toHaveLength(1);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "退出登录" }),
    );
  });

  it("closes on Escape and returns focus to its trigger", () => {
    mockedUsePathname.mockReturnValue("/archive");
    render(createElement(WebAccountMenu, { authorIdentity, readerIdentity }));
    const trigger = screen.getByRole("button", {
      name: `账号：${readerIdentity.registrationName}，作者`,
    });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("region", { name: "账号菜单" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("fails closed without inventing a display role", () => {
    mockedUsePathname.mockReturnValue("/studio");
    render(
      createElement(WebAccountMenu, {
        authorIdentity: null,
        readerIdentity,
      }),
    );
    const trigger = screen.getByRole("button", {
      name: "账号：信息不可用",
    });
    fireEvent.click(trigger);
    expect(screen.getByText("账号信息不可用")).toBeTruthy();
    expect(screen.queryByText("读者")).toBeNull();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeTruthy();
  });
});
