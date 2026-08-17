import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationName = "20260817104616_admin_p1_identity_access_ledger.sql";
const readMigrationName = "20260817121610_admin_p1_identity_access_reads.sql";
const writeMigrationName = "20260817125140_admin_p1_identity_access_writes.sql";

async function migration() {
  return readFile(
    resolve(process.cwd(), "../../supabase/migrations", migrationName),
    "utf8",
  );
}

async function supabaseConfig() {
  return readFile(resolve(process.cwd(), "../../supabase/config.toml"), "utf8");
}

async function readMigration() {
  return readFile(
    resolve(process.cwd(), "../../supabase/migrations", readMigrationName),
    "utf8",
  );
}

async function writeMigration() {
  return readFile(
    resolve(process.cwd(), "../../supabase/migrations", writeMigrationName),
    "utf8",
  );
}

describe("Admin P1-02A private ledger migration contract", () => {
  it("creates only the private, append-only request ledger", async () => {
    const sql = await migration();

    expect(sql).toContain(
      "create table private.identity_access_request_ledger",
    );
    expect(sql).toContain("request_id uuid primary key");
    expect(sql).toContain("actor_user_id uuid not null");
    expect(sql).toContain("target_user_id uuid not null");
    expect(sql).toContain("payload_fingerprint bytea not null");
    expect(sql).toContain("result_snapshot jsonb not null");
    expect(sql).toContain("audit_log_id bigint unique");
    expect(sql).toContain("on delete restrict");
    expect(sql).toContain("identity_access_request_id_non_nil");
    expect(sql).toContain("identity_access_request_fingerprint_sha256");
    expect(sql).toContain("pg_catalog.octet_length(payload_fingerprint) = 32");
    expect(sql).toContain(
      "result_status in ('saved', 'unchanged', 'conflict')",
    );
    expect(sql).toContain("identity_access_request_saved_audit");
    expect(sql).toContain(
      "create trigger identity_access_request_ledger_immutable",
    );
    expect(sql).not.toContain("create table public.identity_access");
  });

  it("keeps the ledger outside the Data API and application-role reach", async () => {
    const [sql, config] = await Promise.all([migration(), supabaseConfig()]);

    expect(config).toContain('schemas = ["public", "graphql_public"]');
    expect(config).not.toMatch(/^schemas\s*=\s*\[[^\]]*"private"/m);
    expect(sql).toContain(
      "alter table private.identity_access_request_ledger enable row level security;",
    );
    expect(sql).toContain(
      "revoke all on table private.identity_access_request_ledger",
    );
    expect(sql).toContain("from public, anon, authenticated, service_role;");
    expect(sql).not.toContain("create policy");
    expect(sql).not.toContain(
      "grant select on table private.identity_access_request_ledger",
    );
    expect(sql).not.toContain(
      "grant insert on table private.identity_access_request_ledger",
    );
  });

  it("limits operations to the three ordinary governance mutations", async () => {
    const sql = await migration();

    for (const operation of [
      "grant_author_role",
      "revoke_author_role",
      "set_ordinary_membership_state",
    ]) {
      expect(sql).toContain(`'${operation}'`);
    }

    expect(sql).not.toContain("grant_admin_role");
    expect(sql).not.toContain("grant_super_admin_role");
    expect(sql).not.toContain("reauth_proof");
    expect(sql).not.toContain("p_role public.elevated_role");
  });

  it("keeps every helper private, invoker, and fixed-search-path", async () => {
    const sql = await migration();
    const helpers = [
      "normalize_identity_access_reason",
      "identity_access_reason_is_valid",
      "require_identity_access_reason",
      "identity_access_expected_state_snapshot",
      "identity_access_state_token",
      "identity_access_payload_fingerprint",
      "prevent_identity_access_ledger_mutation",
      "prevent_audit_log_mutation",
    ];

    for (const helper of helpers) {
      expect(sql).toContain(`function private.${helper}`);
    }

    expect(sql.match(/security invoker/g)).toHaveLength(8);
    expect(sql.match(/set search_path = ''/g)).toHaveLength(8);
    expect(sql).not.toContain("security definer");
    expect(sql).not.toContain("grant execute");
    expect(sql).not.toContain("user_metadata");
    expect(sql).not.toContain("create or replace function public.");
  });

  it("makes all audit rows immutable without changing insert behavior", async () => {
    const sql = await migration();

    expect(sql).toContain(
      "create or replace function private.prevent_audit_log_mutation()",
    );
    expect(sql).toContain(
      "drop trigger site_copy_audit_immutable on public.audit_logs;",
    );
    expect(sql).toContain("create trigger audit_logs_immutable");
    expect(sql).toContain("before update or delete on public.audit_logs");
    expect(sql).toContain("message = 'AUDIT_LOG_IMMUTABLE'");
    expect(sql).toContain("message = 'SITE_COPY_AUDIT_IMMUTABLE'");
    expect(sql).not.toContain("before insert on public.audit_logs");
    expect(sql).not.toContain("after insert on public.audit_logs");
  });

  it("does not create a read, write, elevated, or application RPC", async () => {
    const sql = await migration();

    for (const forbidden of [
      "search_identity_access_subjects_v1",
      "get_identity_access_subject_v1",
      "list_identity_access_audit_v1",
      "grant_author_role_v2",
      "revoke_author_role_v2",
      "set_ordinary_membership_state_v2",
    ]) {
      expect(sql).not.toContain(forbidden);
    }

    expect(sql).not.toContain("grant execute on function");
    expect(sql).not.toContain("revoke_role(uuid");
    expect(sql).not.toContain("set_membership_state(uuid");
  });
});

describe("Admin P1-02B read RPC migration contract", () => {
  it("creates exactly the three frozen read RPC names and signatures", async () => {
    const sql = await readMigration();

    for (const signature of [
      "public.search_identity_access_subjects_v1(\n  p_query text default null,\n  p_cursor jsonb default null,\n  p_limit integer default 25\n)",
      "public.get_identity_access_subject_v1(\n  p_user_id uuid\n)",
      "public.list_identity_access_audit_v1(\n  p_user_id uuid,\n  p_before jsonb default null,\n  p_limit integer default 25\n)",
    ]) {
      expect(sql).toContain(`function ${signature}`);
    }

    expect(sql.match(/create or replace function public\./g)).toHaveLength(3);
    expect(sql).not.toContain("grant_author_role_v2");
    expect(sql).not.toContain("revoke_author_role_v2");
    expect(sql).not.toContain("set_ordinary_membership_state_v2");
  });

  it("freezes the ADR-023 invoker-definer-invoker authority modes", async () => {
    const sql = await readMigration();
    const search = sql.slice(
      sql.indexOf("function public.search_identity_access_subjects_v1"),
      sql.indexOf("function public.get_identity_access_subject_v1"),
    );
    const detail = sql.slice(
      sql.indexOf("function public.get_identity_access_subject_v1"),
      sql.indexOf("function public.list_identity_access_audit_v1"),
    );
    const audit = sql.slice(
      sql.indexOf("function public.list_identity_access_audit_v1"),
    );

    expect(search).toContain("security invoker");
    expect(search).not.toContain("security definer");
    expect(detail).toContain("security definer");
    expect(detail).not.toContain("security invoker");
    expect(audit).toContain("security invoker");
    expect(audit).not.toContain("security definer");
    expect(sql.match(/\nstable\n/g)).toHaveLength(3);
    expect(sql.match(/set search_path = ''/g)).toHaveLength(3);
  });

  it("keeps the detail definer live-authorized, helper-backed, and read-only", async () => {
    const sql = await readMigration();
    const detail = sql.slice(
      sql.indexOf("function public.get_identity_access_subject_v1"),
      sql.indexOf("function public.list_identity_access_audit_v1"),
    );

    expect(detail.indexOf("v_actor_user_id uuid := auth.uid()")).toBeLessThan(
      detail.indexOf("from public.profiles p"),
    );
    expect(
      detail.indexOf("private.has_role('admin', v_actor_user_id)"),
    ).toBeLessThan(detail.indexOf("from public.profiles p"));
    expect(detail).toContain(
      "private.identity_access_expected_state_snapshot(p.user_id)",
    );
    expect(detail).toContain("private.identity_access_state_token(p.user_id)");
    expect(detail).not.toMatch(/\b(?:insert|update|delete)\b/i);
    expect(detail).not.toMatch(/\n\s*execute\s+/i);
    expect(detail).not.toContain("private.write_audit");
    expect(detail).not.toContain("identity_access_request_ledger");
    expect(detail).not.toContain("extensions.digest");
  });

  it("bounds search and audit with deterministic keyset cursors", async () => {
    const sql = await readMigration();

    expect(sql).toContain("v_limit not between 1 and 50");
    expect(sql).toContain("limit v_limit + 1");
    expect(sql).toContain("p.registration_name is null asc");
    expect(sql).toContain("p.user_id asc");
    expect(sql).toContain("order by audit.created_at desc, audit.id desc");
    expect(sql).toContain(
      "pg_catalog.\"normalize\"(p.registration_name, 'NFKC')",
    );
    expect(sql).not.toMatch(/\boffset\b/i);
  });

  it("uses exact function grants without exposing private helpers", async () => {
    const sql = await readMigration();

    expect(
      sql.match(/from public, anon, authenticated, service_role;/g),
    ).toHaveLength(3);
    expect(sql.match(/\)\s+to authenticated;/g)).toHaveLength(3);
    expect(sql).not.toMatch(/grant execute on function private\./);
    expect(sql).not.toMatch(/grant .* on (?:table )?public\./);
    expect(sql).not.toContain("create policy");
    expect(sql).not.toContain("alter table");
    expect(sql).not.toContain("user_metadata");
  });

  it("returns only frozen projections without Auth, ledger, or raw Audit metadata", async () => {
    const sql = await readMigration();

    for (const forbidden of [
      "auth.users",
      "encrypted_password",
      "raw_user_meta_data",
      "raw_app_meta_data",
      "payload_fingerprint",
      "request_id",
      "identity_access_request_ledger",
    ]) {
      expect(sql).not.toContain(forbidden);
    }

    expect(sql).not.toContain("'metadata', audit.metadata");
    expect(sql).toContain("audit.metadata ->> 'from'");
    expect(sql).toContain("audit.metadata ->> 'to'");
  });
});

describe("Admin P1-02C execute-closed write RPC migration contract", () => {
  it("creates only the three frozen ordinary write signatures", async () => {
    const sql = await writeMigration();

    for (const signature of [
      "public.grant_author_role_v2(\n  p_request_id uuid,\n  p_target_user_id uuid,\n  p_expected_state_token text,\n  p_reason text\n)",
      "public.revoke_author_role_v2(\n  p_request_id uuid,\n  p_target_user_id uuid,\n  p_expected_state_token text,\n  p_reason text\n)",
      "public.set_ordinary_membership_state_v2(\n  p_request_id uuid,\n  p_target_user_id uuid,\n  p_state public.membership_state,\n  p_expected_state_token text,\n  p_reason text\n)",
    ]) {
      expect(sql).toContain(`function ${signature}`);
    }

    expect(sql.match(/create or replace function public\./g)).toHaveLength(3);
    expect(sql).not.toContain("p_role public.elevated_role");
    expect(sql).not.toContain("reauth");
    expect(sql).not.toContain("grant_admin_role");
    expect(sql).not.toContain("grant_super_admin_role");
  });

  it("keeps every application execute grant closed", async () => {
    const sql = await writeMigration();

    expect(sql.match(/security definer/g)).toHaveLength(3);
    expect(sql.match(/set search_path = ''/g)).toHaveLength(4);
    expect(
      sql.match(/from public, anon, authenticated, service_role;/g),
    ).toHaveLength(4);
    expect(sql).not.toMatch(/grant execute/i);
    expect(sql).not.toMatch(/grant .* on (?:table )?public\./i);
    expect(sql).not.toContain("create policy");
    expect(sql).not.toContain("alter table");
  });

  it("reuses the P1-02A reason, fingerprint, snapshot, and token authorities", async () => {
    const sql = await writeMigration();

    expect(sql).toContain("private.require_identity_access_reason(p_reason)");
    expect(sql).toContain("private.identity_access_payload_fingerprint(");
    expect(sql).toContain(
      "private.identity_access_expected_state_snapshot(\n    p_target_user_id",
    );
    expect(sql).toContain(
      "private.identity_access_state_token(\n    p_target_user_id",
    );
    expect(sql).not.toContain("extensions.digest");
    expect(sql).not.toContain("activeRoleGrants', coalesce");
    expect(sql).not.toContain(
      "create table private.identity_access_request_ledger",
    );
  });

  it("freezes request, global, final-super-admin, target, and state lock order", async () => {
    const sql = await writeMigration();
    const requestLock = sql.indexOf("fandom-harbor:identity-access-request:");
    const ledgerLookup = sql.indexOf(
      "from private.identity_access_request_ledger ledger",
    );
    const globalLock = sql.indexOf("fandom-harbor:identity-access-governance");
    const superAdminLock = sql.indexOf("fandom-harbor:super-admin-role");
    const targetLock = sql.indexOf("for update of membership");
    const elevatedBoundary = sql.indexOf("ELEVATED_MUTATION_DEFERRED");
    const stateToken = sql.indexOf(
      "v_current_state_token := private.identity_access_state_token",
    );

    expect(requestLock).toBeGreaterThan(0);
    expect(requestLock).toBeLessThan(ledgerLookup);
    expect(ledgerLookup).toBeLessThan(globalLock);
    expect(globalLock).toBeLessThan(superAdminLock);
    expect(superAdminLock).toBeLessThan(targetLock);
    expect(targetLock).toBeLessThan(elevatedBoundary);
    expect(elevatedBoundary).toBeLessThan(stateToken);
    expect(
      sql.match(/private\.has_role\('admin', v_actor_user_id\)/g),
    ).toHaveLength(3);
  });

  it("closes replay, mismatch, result, audit, and ledger atomic semantics", async () => {
    const sql = await writeMigration();

    expect(sql).toContain("return v_existing_result;");
    expect(sql).toContain("detail = 'REQUEST_ID_MISMATCH'");
    for (const status of ["saved", "unchanged", "conflict"]) {
      expect(sql).toContain(`'status', '${status}'`);
    }
    expect(sql).toContain("private.write_audit(");
    expect(sql).toContain("insert into private.identity_access_request_ledger");
    expect(sql).toContain("'role.granted'");
    expect(sql).toContain("'role.revoked'");
    expect(sql).toContain("'membership.state_changed'");
    expect(sql).toContain("'target_membership_not_active'");
    expect(sql).toContain("'expected_state_mismatch'");
    expect(sql).not.toMatch(/\bcommit\b/i);
    expect(sql).not.toMatch(/\brollback\b/i);
    expect(sql).not.toMatch(/\bexecute\s+(?:format|immediate)/i);
  });

  it("does not alter legacy writes, read RPCs, tables, policies, or application code", async () => {
    const sql = await writeMigration();

    expect(sql).not.toContain("function public.grant_role(");
    expect(sql).not.toContain("function public.revoke_role(");
    expect(sql).not.toContain("function public.set_membership_state(");
    expect(sql).not.toContain("search_identity_access_subjects_v1");
    expect(sql).not.toContain("get_identity_access_subject_v1");
    expect(sql).not.toContain("list_identity_access_audit_v1");
    expect(sql).not.toContain("user_metadata");
    expect(sql).not.toContain("auth.users");
  });
});
