import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("P1-04B Server Action boundary", () => {
  it("uses only the governance Service and server-owned request ID", async () => {
    const pathname = process.cwd().endsWith("/apps/admin")
      ? "src/app/access/actions.ts"
      : "apps/admin/src/app/access/actions.ts";
    const source = await readFile(resolve(process.cwd(), pathname), "utf8");

    expect(source).toContain("createAdminIdentityAccessGovernance");
    expect(source).toContain("crypto.randomUUID()");
    expect(source).toContain('revalidatePath("/access")');
    expect(source).not.toContain("@fandom-harbor/database");
    expect(source).not.toContain(".rpc(");
    expect(source).not.toMatch(/createAdminIdentityAccess\(\)/u);
    expect(source).not.toMatch(/grantRole|revokeRole|setMembershipState/u);
  });
});
