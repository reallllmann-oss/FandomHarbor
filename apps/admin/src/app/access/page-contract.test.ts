import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { formatAdminTimestamp } from "../../lib/admin-presentation";

async function source(pathname: string) {
  return readFile(new URL(pathname, import.meta.url), "utf8");
}

describe("P1-03 /access read-only route contract", () => {
  it("loads the controlled page data and preserves existing auth redirects", async () => {
    const page = await source("./page.tsx");

    expect(page).toContain("loadAccessGovernancePageData(await searchParams)");
    expect(page).toContain('data.status === "unauthenticated"');
    expect(page).toContain('data.status === "forbidden"');
    expect(page).toContain('"/auth/sign-in"');
    expect(page).toContain('"/auth/sign-in?error=forbidden"');
    expect(page).toContain("<AccessGovernanceView data={data} />");
  });

  it("renders loaded, empty, read-error, unavailable and loading states", async () => {
    const [page, loading] = await Promise.all([
      source("./page.tsx"),
      source("./loading.tsx"),
    ]);

    expect(page).toContain("身份与权限管理");
    expect(page).toContain("没有符合条件的身份");
    expect(page).toContain("暂无相关治理记录");
    expect(page).toContain("ReadErrorState");
    expect(page).toContain('role="alert"');
    expect(page).toContain("暂未开放的能力");
    expect(loading).toContain('role="status"');
    expect(loading).toContain("正在读取身份与权限");
  });

  it("keeps GET search while mounting only the ordinary governance panel", async () => {
    const [page, panel] = await Promise.all([
      source("./page.tsx"),
      source("./mutation-panel.tsx"),
    ]);

    expect(page).toContain('method="get"');
    expect(page).toContain('type="search"');
    expect(page).toContain('type="submit"');
    expect(page).toContain("<AccessMutationPanel");
    expect(panel).toContain("governOrdinaryAccessAction");
    expect(panel).toContain('operation="grantAuthorRole"');
    expect(panel).toContain('operation="revokeAuthorRole"');
    expect(panel).toContain('operation="setOrdinaryMembershipState"');
    expect(panel).not.toMatch(/adminRole|superAdminRole|genericRole/u);
    expect(panel).not.toContain('name="requestId"');
  });

  it("uses the exact three approved read methods without direct database access", async () => {
    const [page, data, adapter] = await Promise.all([
      source("./page.tsx"),
      source("../../lib/access-governance-data.ts"),
      source("../../lib/identity-access-governance.ts"),
    ]);

    expect(page).not.toContain("@fandom-harbor/database");
    expect(page).not.toContain("client.rpc");
    expect(data).toContain("reads.searchSubjects");
    expect(data).toContain("reads.getSubjectDetail");
    expect(data).toContain("reads.listSubjectAudit");
    expect(data).not.toMatch(
      /\.grantAuthorRole|\.revokeAuthorRole|\.setOrdinaryMembershipState/u,
    );
    expect(adapter).toContain("createIdentityAccessGovernanceService");
    expect(adapter).toContain('"getSubjectDetail"');
    expect(adapter).toContain('"listSubjectAudit"');
    expect(adapter).toContain('"searchSubjects"');
    expect(adapter).not.toContain("client.rpc");
  });

  it("renders no executable mutation controls for elevated accounts", async () => {
    const panel = await source("./mutation-panel.tsx");

    expect(panel).toContain("if (props.isElevatedAccount)");
    expect(panel).toContain("此处没有可执行控件或隐藏入口");
    expect(panel.indexOf("if (props.isElevatedAccount)")).toBeLessThan(
      panel.indexOf("<MutationForm"),
    );
  });

  it("displays only the frozen minimal governance fields", async () => {
    const page = await source("./page.tsx");

    for (const field of [
      "registrationName",
      "userId.value",
      "membership",
      "effectiveRoles",
      "activeRoleGrants",
      "expectedState.token.value",
      "isElevatedAccount",
      "isOnlyActiveSuperAdmin",
      "auditPage.items",
    ]) {
      expect(page).toContain(field);
    }
    expect(page).not.toMatch(/email|phone|password|user_metadata/iu);
  });

  it("keeps long identity values inside a shrink-safe responsive grid", async () => {
    const page = await source("./page.tsx");

    expect(page).toContain(
      "grid min-w-0 gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)]",
    );
    expect(page).not.toContain("minmax(18rem,0.8fr)");
    expect(page).toContain('className="site-stack min-w-0 max-w-full"');
    expect(page).toContain('className="min-w-0 flex-1"');
    expect(page.match(/\[overflow-wrap:anywhere\]/gu)).toHaveLength(2);
    expect(page).toContain(
      'className="mt-1 block break-all font-mono text-xs text-muted-foreground"',
    );
    expect(page).toContain("<RoleList roles={subject.effectiveRoles} />");
    expect(page).toContain("选择一个身份查看详情");
    expect(page).toContain("<DetailPanel detail={data.selectedSubject} />");
  });

  it("localizes governance states, roles, audit copy and select labels", async () => {
    const [page, panel, presentation] = await Promise.all([
      source("./page.tsx"),
      source("./mutation-panel.tsx"),
      source("../../lib/admin-presentation.ts"),
    ]);

    for (const copy of [
      "身份查询",
      "身份详情",
      "成员资格",
      "角色 / 权限状态",
      "权限操作记录",
      "操作人",
      "变更前",
      "变更后",
      "审计编号",
    ]) {
      expect(page).toContain(copy);
    }
    for (const copy of [
      "正常",
      "待审核",
      "已暂停",
      "已撤销",
      "管理员",
      "超级管理员",
      "读者",
      "作者",
    ]) {
      expect(presentation).toContain(copy);
    }
    expect(panel).toContain('<option value="active">正常</option>');
    expect(panel).toContain('<option value="suspended">已暂停</option>');
    expect(panel).toContain('<option value="revoked">已撤销</option>');
    expect(panel).toContain('state.status === "saved" ? "已保存" : "无变更"');
    expect(panel).toContain("状态冲突 · 必须重新读取并复核");
  });

  it("keeps Review identity values inside a single-column-first shrink-safe grid", async () => {
    const panel = await source("./mutation-panel.tsx");

    expect(panel).toContain(
      "grid min-w-0 gap-4 text-sm lg:grid-cols-[repeat(2,minmax(0,1fr))]",
    );
    expect(panel.match(/<div className="min-w-0">/gu)).toHaveLength(6);
    expect(panel).toContain(
      'className="mt-1 break-words font-medium [overflow-wrap:anywhere]"',
    );
    expect(panel).toContain('className="mt-1 break-all font-mono text-xs"');
    expect(panel).toContain("用户编号");
    expect(panel).not.toMatch(/(?:Public )?User ID/u);
  });

  it("keeps cards, badges and technical values inside the 390px layout contract", async () => {
    const [page, panel, editor, sharedLayout, styles] = await Promise.all([
      source("./page.tsx"),
      source("./mutation-panel.tsx"),
      source("../site-copy-editor.tsx"),
      source("../../../../../packages/ui/src/components/layouts.tsx"),
      source("../../../../../packages/ui/src/styles.css"),
    ]);

    expect(sharedLayout).toContain("data-surface={surface}");
    expect(styles).toContain('[data-surface="admin"]');
    expect(styles).toContain("overflow-x: clip");
    expect(styles).toContain('[data-surface="admin"] .site-stack');
    expect(styles).toContain(".admin-grid > *");
    expect(styles).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(styles).toContain("@media (max-width: 767px)");
    expect(page).toContain("max-w-full shrink-0 break-words");
    expect(page).toContain("whitespace-pre-wrap break-all");
    expect(panel).toContain("grid min-w-0 max-w-full gap-4 lg:grid-cols-2");
    expect(editor).toContain("grid min-w-0 max-w-full gap-6 xl:grid-cols-2");
  });

  it("localizes identity labels, capability copy and timestamps without changing values", async () => {
    const [page, panel, presentation] = await Promise.all([
      source("./page.tsx"),
      source("./mutation-panel.tsx"),
      source("../../lib/admin-presentation.ts"),
    ]);

    expect(page).toContain("完整用户编号");
    expect(page).toContain("审计编号");
    expect(page).toContain("formatAdminTimestamp");
    expect(presentation).toContain('timeZone: "Asia/Shanghai"');
    expect(presentation).toContain("北京时间");
    expect(presentation).not.toContain("协调世界时");
    expect(page).not.toMatch(/\b(?:User ID|UUID|UTC|KI-033)\b/u);
    expect(panel).toContain("请求编号");
    expect(panel).toMatch(/后台\s*操作权限/u);
    expect(panel).not.toContain("admin:operate");
  });

  it("formats every governance timestamp as Beijing time independently of the runtime TZ", () => {
    const originalTimeZone = process.env.TZ;

    try {
      for (const environmentTimeZone of [
        "UTC",
        "America/Los_Angeles",
        "Pacific/Auckland",
      ]) {
        process.env.TZ = environmentTimeZone;
        expect(formatAdminTimestamp("2026-08-25T13:57:00Z")).toBe(
          "2026-08-25 21:57（北京时间）",
        );
      }
    } finally {
      process.env.TZ = originalTimeZone;
    }
  });
});
