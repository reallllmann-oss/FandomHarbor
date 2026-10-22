import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "../../supabase/migrations/20261020113458_super_admin_email_binding_operations.sql",
  ),
  "utf8",
);

describe("B3-SA1 migration contract", () => {
  it("is additive and does not modify P1-07C grants or Auth users", () => {
    expect(migration).toContain(
      "create table private.super_admin_email_binding_operations",
    );
    expect(migration).not.toMatch(
      /\b(?:alter|drop)\s+table\s+public\.role_grants\b/iu,
    );
    expect(migration).not.toMatch(
      /\b(?:insert|update|delete)\s+(?:into\s+|from\s+)?auth\.users\b/iu,
    );
    expect(migration).not.toContain(
      "alter table private.elevated_commissioning_policy",
    );
  });

  it("derives the exact two-account allowlist from the bound P1-07C policy", () => {
    expect(migration).toContain("private.elevated_commissioning_policy");
    expect(migration).toContain("p_user_id = policy.actor_user_id");
    expect(migration).toContain("p_user_id = policy.target_user_id");
    expect(migration).toContain("membership.state = 'active'");
    expect(migration).toContain("grant_row.role = 'super_admin'");
    expect(migration).toContain("factor.status::text = 'verified'");
  });

  it("locks every public RPC to service_role and keeps private tables closed", () => {
    const publicFunctions = migration.match(
      /create or replace function public\.[a-z0-9_]+/giu,
    );
    const grants = migration.match(/grant execute on function public\./giu);
    expect(publicFunctions).toHaveLength(10);
    expect(grants).toHaveLength(10);
    expect(migration.match(/to service_role;/gu)).toHaveLength(10);
    expect(migration).toContain(
      "from public, anon, authenticated, service_role;",
    );
    expect(migration).not.toMatch(
      /grant\s+(?:select|insert|update|delete)\s+on/iu,
    );
  });

  it("permits only one active migration globally, not one per target", () => {
    expect(migration).toContain(
      "create unique index super_admin_email_binding_one_active_globally",
    );
    expect(migration).toContain(
      "on private.super_admin_email_binding_operations ((true))",
    );
    expect(migration).toContain(
      "'fandom-harbor:super-admin-email-binding:global'",
    );
  });

  it("requires immutable binding evidence and an independent reauthentication", () => {
    expect(migration).toContain("and bound_session_id is null");
    expect(migration).toContain("and email_fingerprint is null");
    expect(migration).toContain(
      "p_new_session_id = v_operation.bound_session_id",
    );
    expect(migration).toContain(
      "p_protected_admin_read_verified is distinct from true",
    );
    expect(migration).toContain("status = 'awaiting_reauth'");
    expect(migration).toContain("message = 'INVALID_BINDING_CONTEXT'");
    expect(migration).toContain("p_email_fingerprint text");
    expect(migration).toContain("terminal_status = 'expired'");
  });

  it("stores only a keyed email fingerprint and redacted audit fields", () => {
    expect(migration).toContain("email_fingerprint bytea");
    expect(migration).not.toMatch(
      /^\s*(?:target_email|new_email|otp|password)\s+text\b/imu,
    );
    expect(migration).toContain("private.super_admin_email_binding_audit");
  });
});
