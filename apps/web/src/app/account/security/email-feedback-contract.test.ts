import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const securityPage = path.resolve(
  process.cwd(),
  "src/app/account/security/page.tsx",
);

describe("account security email feedback contract", () => {
  it("describes an accepted email-change request without claiming delivery", async () => {
    const source = await readFile(securityPage, "utf8");

    expect(source).toContain("邮箱变更请求已受理");
    expect(source).toContain("如果邮件正常发送");
    expect(source).not.toContain("邮箱变更验证已发送");
  });

  it("distinguishes one-side confirmation from a completed email change", async () => {
    const source = await readFile(securityPage, "utf8");

    expect(source).toContain("当前邮箱已验证，请继续完成另一封邮件中的验证码。");
    expect(source).toContain("邮箱变更成功，新邮箱已生效。");
    expect(source).toContain("email-change-status-unknown");
    expect(source).toMatch(/email-change-pending[\s\S]{0,500}role="status"/);
    expect(source).toMatch(/email-change-complete[\s\S]{0,500}role="status"/);
  });
});
