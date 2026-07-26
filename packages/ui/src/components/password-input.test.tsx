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
        <label htmlFor="confirmation-password">确认密码</label>
        <PasswordInput id="confirmation-password" name="confirmPassword" />
      </>,
    );

    const primary = screen.getByLabelText("密码") as HTMLInputElement;
    const confirmation = screen.getByLabelText("确认密码") as HTMLInputElement;
    const showButtons = screen.getAllByRole("button", { name: "显示密码" });
    const [showPrimary, showConfirmation] = showButtons;

    expect(showButtons).toHaveLength(2);
    if (!showPrimary || !showConfirmation) {
      throw new Error("Expected two password visibility controls");
    }
    fireEvent.click(showConfirmation);

    expect(primary.type).toBe("password");
    expect(confirmation.type).toBe("text");

    fireEvent.click(showPrimary);

    expect(primary.type).toBe("text");
    expect(confirmation.type).toBe("text");
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
