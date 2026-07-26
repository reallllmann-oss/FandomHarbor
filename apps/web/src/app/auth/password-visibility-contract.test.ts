import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

async function pageSource(pathname: string) {
  return readFile(new URL(pathname, import.meta.url), "utf8");
}

describe("auth password visibility contract", () => {
  it("wires the reusable password input into sign-in without changing its form contract", async () => {
    const source = await pageSource("./sign-in/page.tsx");

    expect(source).toContain(
      'import { PasswordInput } from "@fandom-harbor/ui"',
    );
    expect(source).toContain('id="sign-in-password"');
    expect(source).toContain('name="password"');
    expect(source).toContain('autoComplete="current-password"');
    expect(source).toContain("minLength={MIN_PASSWORD_LENGTH}");
    expect(source).toMatch(/<PasswordInput[\s\S]*?\srequired[\s\S]*?\/>/);
    expect(source).toContain("<form action={signIn}");
    expect(source).toContain('type="submit"');
  });

  it("keeps sign-up invitation, age, and policy requirements intact", async () => {
    const source = await pageSource("./sign-up/page.tsx");

    expect(source).toContain(
      'import { PasswordInput } from "@fandom-harbor/ui"',
    );
    expect(source).toContain('id="sign-up-password"');
    expect(source).toContain('name="password"');
    expect(source).toContain('autoComplete="new-password"');
    expect(source).toContain("minLength={MIN_PASSWORD_LENGTH}");
    expect(source).toMatch(/<PasswordInput[\s\S]*?\srequired[\s\S]*?\/>/);
    expect(source).toContain('name="invitationCode"');
    expect(source).toMatch(
      /name="invitationCode"[\s\S]*?\srequired[\s\S]*?type="password"/,
    );
    expect(source).toContain("年满 18 周岁的受邀用户");
    expect(source).toContain('href="/terms"');
    expect(source).toContain('href="/privacy"');
    expect(source).toContain('href="/content-policy"');
    expect(source).not.toContain('name="confirmPassword"');
    expect(source).toContain("<form action={signUp}");
  });
});
