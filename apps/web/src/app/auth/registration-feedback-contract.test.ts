import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const authDirectory = path.resolve(process.cwd(), "src/app/auth");

describe("registration feedback and cookie contract", () => {
  it("uses neutral anti-enumeration copy instead of claiming mail delivery", async () => {
    const source = await readFile(
      path.join(authDirectory, "verify-email/page.tsx"),
      "utf8",
    );

    expect(source).toContain("注册请求已处理");
    expect(source).toContain("如果该邮箱符合注册条件");
    expect(source).not.toContain("验证码已发送到你的注册邮箱");
    expect(source).toContain('href="/auth/sign-in"');
    expect(source).toContain('href="/auth/forgot-password"');
  });

  it("scopes registration cookies consistently and clears the same path", async () => {
    const source = await readFile(
      path.join(authDirectory, "actions.ts"),
      "utf8",
    );

    expect(source).toContain(
      'cookieStore.delete({ name: REGISTRATION_ATTEMPT_COOKIE, path: "/auth" })',
    );
    expect(source).toMatch(/path: "\/auth",\s+sameSite: "lax",\s+secure:/);
    expect(source).not.toMatch(
      /REGISTRATION_ATTEMPT_COOKIE[\s\S]{0,500}domain:/,
    );
  });
});
