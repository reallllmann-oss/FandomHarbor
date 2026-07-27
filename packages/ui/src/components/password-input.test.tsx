import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PasswordInput } from "./password-input";

afterEach(cleanup);

describe("PasswordInput", () => {
  it("toggles visibility without changing the value or submitting its form", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <label htmlFor="account-password">密码</label>
        <PasswordInput
          autoComplete="current-password"
          id="account-password"
          minLength={8}
          name="password"
          required
        />
        <button type="submit">提交</button>
      </form>,
    );

    const input = screen.getByLabelText("密码") as HTMLInputElement;
    const showButton = screen.getByRole("button", {
      name: "显示密码",
    }) as HTMLButtonElement;

    fireEvent.change(input, { target: { value: "local-test-value" } });

    expect(input.type).toBe("password");
    expect(input.name).toBe("password");
    expect(input.id).toBe("account-password");
    expect(input.autocomplete).toBe("current-password");
    expect(input.required).toBe(true);
    expect(showButton.type).toBe("button");
    expect(showButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(showButton);

    expect(input.type).toBe("text");
    expect(input.value).toBe("local-test-value");
    expect(onSubmit).not.toHaveBeenCalled();

    const hideButton = screen.getByRole("button", {
      name: "隐藏密码",
    }) as HTMLButtonElement;
    expect(hideButton.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(hideButton);

    expect(input.type).toBe("password");
    expect(input.value).toBe("local-test-value");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps multiple password fields independently controlled", () => {
    render(
      <>
        <label htmlFor="primary-password">密码</label>
        <PasswordInput id="primary-password" name="password" />
        <label htmlFor="invitation-code">邀请码</label>
        <PasswordInput
          autoComplete="off"
          hideLabel="隐藏邀请码"
          id="invitation-code"
          name="invitationCode"
          required
          showLabel="显示邀请码"
        />
      </>,
    );

    const primary = screen.getByLabelText("密码") as HTMLInputElement;
    const invitation = screen.getByLabelText("邀请码") as HTMLInputElement;
    const showPrimary = screen.getByRole("button", { name: "显示密码" });
    const showInvitation = screen.getByRole("button", {
      name: "显示邀请码",
    });

    fireEvent.change(primary, { target: { value: "local-password-value" } });
    fireEvent.change(invitation, {
      target: { value: "local-invitation-value" },
    });

    fireEvent.click(showPrimary);
    expect(primary.type).toBe("text");
    expect(invitation.type).toBe("password");

    fireEvent.click(showInvitation);
    expect(primary.type).toBe("text");
    expect(invitation.type).toBe("text");
    expect(primary.value).toBe("local-password-value");
    expect(invitation.value).toBe("local-invitation-value");

    fireEvent.click(screen.getByRole("button", { name: "隐藏密码" }));
    expect(primary.type).toBe("password");
    expect(invitation.type).toBe("text");

    fireEvent.click(screen.getByRole("button", { name: "隐藏邀请码" }));
    expect(primary.type).toBe("password");
    expect(invitation.type).toBe("password");
  });

  it("uses invitation labels and preserves its form contract while toggling", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
    });

    render(
      <form onSubmit={onSubmit}>
        <label htmlFor="invitation-code-contract">邀请码</label>
        <PasswordInput
          autoComplete="off"
          hideLabel="隐藏邀请码"
          id="invitation-code-contract"
          name="invitationCode"
          required
          showLabel="显示邀请码"
        />
      </form>,
    );

    const input = screen.getByLabelText("邀请码") as HTMLInputElement;
    const showButton = screen.getByRole("button", {
      name: "显示邀请码",
    }) as HTMLButtonElement;

    fireEvent.change(input, { target: { value: "local-invitation-value" } });

    expect(input.type).toBe("password");
    expect(input.id).toBe("invitation-code-contract");
    expect(input.name).toBe("invitationCode");
    expect(input.required).toBe(true);
    expect(input.autocomplete).toBe("off");
    expect(showButton.type).toBe("button");
    expect(showButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(showButton);

    expect(input.type).toBe("text");
    expect(input.value).toBe("local-invitation-value");
    expect(onSubmit).not.toHaveBeenCalled();

    const hideButton = screen.getByRole("button", {
      name: "隐藏邀请码",
    }) as HTMLButtonElement;
    expect(hideButton.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(hideButton);

    expect(input.type).toBe("password");
    expect(input.value).toBe("local-invitation-value");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the visibility control with a disabled input", () => {
    render(
      <>
        <label htmlFor="disabled-password">密码</label>
        <PasswordInput disabled id="disabled-password" name="password" />
      </>,
    );

    const input = screen.getByLabelText("密码") as HTMLInputElement;
    const button = screen.getByRole("button", {
      name: "显示密码",
    }) as HTMLButtonElement;

    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });
});
