import { readFile } from "node:fs/promises";

import { SITE_COPY_FIELD_IDS } from "@fandom-harbor/services";
import { describe, expect, it } from "vitest";

import { formatAdminTimestamp } from "../lib/admin-presentation";
import { ADMIN_SITE_COPY_GROUPS } from "../lib/site-copy-fields";

async function source(pathname: string) {
  return readFile(new URL(pathname, import.meta.url), "utf8");
}

describe("ADMIN-02 Site Copy UI source contract", () => {
  it("renders edit controls only from the exact eight-field definition", async () => {
    const editor = await source("./site-copy-editor.tsx");
    const fields = ADMIN_SITE_COPY_GROUPS.flatMap((group) =>
      group.fields.map(([field]) => field),
    );

    expect(fields).toEqual(SITE_COPY_FIELD_IDS);
    expect(new Set(fields).size).toBe(8);
    expect(editor).toContain("ADMIN_SITE_COPY_GROUPS.map");
    expect(editor).toContain("group.fields.map");
    expect(editor).toContain("name={field}");
    expect(editor).not.toMatch(
      /name=["'](?:navigation_order|navigation_path|navigation_visibility|studio_capability|primary_cta_path|secondary_cta_path|footer_legal_links)["']/u,
    );
  });

  it("requires Review Changes before the Server Action form", async () => {
    const editor = await source("./site-copy-editor.tsx");

    expect(editor).toContain("复核变更");
    expect(editor).toContain("保存前复核");
    expect(editor).toContain("prepareSiteCopyReview");
    expect(editor).toContain("action={saveAction}");
    expect(editor.indexOf("复核变更")).toBeLessThan(
      editor.indexOf("action={saveAction}"),
    );
  });

  it("guards duplicate submit and exposes a pending state", async () => {
    const editor = await source("./site-copy-editor.tsx");

    expect(editor).toContain("submissionLocked.current");
    expect(editor).toContain("event.preventDefault()");
    expect(editor).toContain("disabled={pending}");
    expect(editor).toContain("保存中…");
    expect(editor).toContain("请勿关闭页面或重复提交");
  });

  it("preserves local input for Error and Conflict and confirms destructive reload", async () => {
    const editor = await source("./site-copy-editor.tsx");

    expect(editor).toContain("你的八字段输入和变更说明仍保留");
    expect(editor).toContain("返回编辑并保留输入");
    expect(editor).toContain("window.confirm");
    expect(editor).toContain("重新读取会丢弃当前八字段输入和变更说明");
    expect(editor).toContain("不会自动重试");
    expect(editor).toContain("旧基线不能再次提交");
    expect(editor).toContain("disabled={conflictVersion !== null}");
  });

  it("uses the accepted Server Action authorization and Domain save boundaries", async () => {
    const action = await source("./site-copy/actions.ts");
    const executor = await source("../lib/site-copy-save.ts");
    const adapter = await source("../lib/site-copy.ts");

    expect(action).toContain('"use server"');
    expect(action).toContain("executeSiteCopySave(formData)");
    expect(executor).toContain("requireSiteCopyAdmin(access)");
    expect(executor.indexOf("requireSiteCopyAdmin(access)")).toBeLessThan(
      executor.indexOf("dependencies.save(access, input)"),
    );
    expect(adapter).toContain("createAdminSiteCopyService(repository)");
    expect(adapter).toContain(".save(access, input)");
    expect(executor).not.toContain("client.rpc");
    expect(action).not.toContain("client.rpc");
  });

  it("uses Chinese presentation copy without changing technical values", async () => {
    const [editor, fields, page] = await Promise.all([
      source("./site-copy-editor.tsx"),
      source("../lib/site-copy-fields.ts"),
      source("./page.tsx"),
    ]);

    for (const copy of ["已保存", "无变更", "状态冲突", "保存失败"]) {
      expect(editor).toContain(copy);
    }
    for (const copy of ["首页", "导航", "页脚"]) {
      expect(fields).toContain(copy);
    }
    expect(page).toContain("超级管理员");
    expect(page).toContain("管理员");
    expect(editor).toContain('.normalize("NFC")');
    expect(editor).toContain("统一字符规范化");
    expect(editor).toContain("请求编号");
    expect(editor).not.toContain("个 Unicode 字符");
    expect(editor).not.toContain("请求 ID");
  });

  it("keeps editor and Review cards shrink-safe on narrow viewports", async () => {
    const editor = await source("./site-copy-editor.tsx");

    expect(editor).toContain("w-full min-w-0 max-w-full");
    expect(editor).toContain("grid min-w-0 max-w-full gap-6 xl:grid-cols-2");
    expect(editor).toContain("grid min-w-0 gap-4 lg:grid-cols-2");
    expect(
      editor.match(/min-w-0 max-w-full rounded-card/gu)?.length,
    ).toBeGreaterThan(5);
  });

  it("uses the shared Chinese time-zone formatter for saved results", async () => {
    const editor = await source("./site-copy-editor.tsx");
    const rendered = formatAdminTimestamp("2026-08-25T13:57:00Z");

    expect(editor).toContain("formatAdminTimestamp(result.updatedAt)");
    expect(editor).not.toContain('toLocaleString("zh-CN")');
    expect(rendered).toBe("2026-08-25 21:57（北京时间）");
    expect(rendered).not.toMatch(/\b(?:UTC|GMT)\b/u);
  });
});
