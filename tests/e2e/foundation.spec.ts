import { expect, test } from "@playwright/test";

test("reader foundation renders", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Fandom Harbor",
  );
  await expect(page.getByRole("link", { name: "跳到主要内容" })).toBeAttached();
});

test("admin foundation renders", async ({ page }) => {
  await page.goto("http://127.0.0.1:3001");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "管理后台基础框架",
  );
});

test("documentation foundation renders", async ({ page }) => {
  await page.goto("http://127.0.0.1:3002");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "项目文档浏览入口",
  );
});
