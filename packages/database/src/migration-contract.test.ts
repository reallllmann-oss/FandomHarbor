import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

async function migration(name: string) {
  return readFile(
    resolve(process.cwd(), "../../supabase/migrations", name),
    "utf8",
  );
}

describe("Phase 1C migration contract", () => {
  it("enables RLS for every exposed identity table", async () => {
    const sql = await migration(
      "20260629210000_identity_access_foundation.sql",
    );

    for (const table of [
      "profiles",
      "memberships",
      "role_grants",
      "invitations",
      "invitation_redemptions",
      "audit_logs",
    ]) {
      expect(sql).toContain(
        `alter table public.${table} enable row level security;`,
      );
      expect(sql).toContain(
        `revoke all on public.${table} from anon, authenticated;`,
      );
    }
  });

  it("keeps privileged workflows security-definer with fixed search paths", async () => {
    const sql = [
      await migration("20260629211000_invitation_workflows.sql"),
      await migration("20260629212000_membership_role_workflows.sql"),
    ].join("\n");

    for (const routine of [
      "create_invitation",
      "redeem_invitation",
      "revoke_invitation",
      "grant_role",
      "revoke_role",
      "set_membership_state",
      "bootstrap_super_admin",
    ]) {
      expect(sql).toContain(
        `function public.${routine}`.replace(
          "public.bootstrap",
          "private.bootstrap",
        ),
      );
    }

    expect(sql.match(/security definer/g)?.length).toBeGreaterThanOrEqual(7);
    expect(sql.match(/set search_path = ''/g)?.length).toBeGreaterThanOrEqual(
      7,
    );
  });

  it("keeps parameterized helpers private and serializes super-admin changes", async () => {
    const foundation = await migration(
      "20260629210000_identity_access_foundation.sql",
    );
    const workflows = await migration(
      "20260629212000_membership_role_workflows.sql",
    );

    expect(foundation).not.toContain(
      "grant execute on function private.is_active_member(uuid) to authenticated",
    );
    expect(foundation).not.toContain(
      "grant execute on function private.has_role(public.elevated_role, uuid) to authenticated",
    );
    expect(foundation).toContain(
      "grant execute on function private.current_user_has_role(public.elevated_role) to authenticated",
    );
    expect(
      workflows.match(/pg_advisory_xact_lock/g)?.length,
    ).toBeGreaterThanOrEqual(4);
  });
});
