import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

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

    expect(page).toContain("Identity &amp; Access Governance");
    expect(page).toContain("没有符合条件的身份");
    expect(page).toContain("暂无相关治理记录");
    expect(page).toContain("ReadErrorState");
    expect(page).toContain('role="alert"');
    expect(page).toContain("Deferred capabilities");
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
});
