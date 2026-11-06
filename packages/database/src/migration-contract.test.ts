import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

async function migration(name: string) {
  return readFile(
    resolve(process.cwd(), "../../supabase/migrations", name),
    "utf8",
  );
}

async function migrationNames() {
  return readdir(resolve(process.cwd(), "../../supabase/migrations"));
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

  it("atomically admits password registrations by registration name and invitation", async () => {
    const sql = await migration(
      "20260702090000_registration_name_invitation_signup.sql",
    );

    expect(sql).toContain("add column registration_name text");
    expect(sql).toContain(
      "create unique index profiles_registration_name_unique",
    );
    expect(sql).toContain("on public.profiles (lower(registration_name))");
    expect(sql).toContain("function private.register_identity_from_invitation");
    expect(sql).toContain("after insert on auth.users");
    expect(sql).toContain("insert into public.memberships");
    expect(sql).toContain("insert into public.invitation_redemptions");
    expect(sql).toContain("for update");
    expect(sql).not.toContain("verified email required");
  });

  it("classifies registration invitation failures without exposing invitation rows", async () => {
    const sql = await migration(
      "20260702120000_registration_invitation_status.sql",
    );

    expect(sql).toContain("function public.registration_invitation_status");
    expect(sql).toContain("when i.revoked_at is not null then 'revoked'");
    expect(sql).toContain(
      "when i.expires_at <= statement_timestamp() then 'expired'",
    );
    expect(sql).toContain("when i.use_count >= i.max_uses then 'exhausted'");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("to anon, authenticated");
  });

  it("preserves the original non-null invitation collision contract", async () => {
    const sql = await migration("20260629211000_invitation_workflows.sql");
    expect(sql).toContain("function public.create_invitation");
    expect(sql).toContain("returning id into v_invitation_id");
    expect(sql).toContain("return v_invitation_id");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).not.toContain("on conflict (code_hash) do nothing");
    expect(await migrationNames()).not.toContain(
      "20260727150707_standardize_invitation_code_collision_handling.sql",
    );
  });
});

describe("V1 Package B1 trusted registration migration contract", () => {
  it("keeps trusted email registration additive and disabled by default", async () => {
    const sql = await migration(
      "20261013170940_v1_email_identity_reservations.sql",
    );

    expect(sql).toContain("default 'legacy'");
    expect(sql).toContain("'email_required'");
    expect(sql).toContain("create table private.registration_attempts");
    expect(sql).toContain("create table private.invitation_reservations");
    expect(sql).toContain("create table private.login_name_claims");
    expect(sql).toContain("interval '2 hours'");
    expect(sql).toContain("for update");
  });

  it("uses a server-only prepare RPC and a least-privilege Auth Hook", async () => {
    const sql = await migration(
      "20261013170940_v1_email_identity_reservations.sql",
    );

    expect(sql).toContain("function public.prepare_email_registration");
    expect(sql).toContain("extensions.gen_random_bytes(32)");
    expect(sql).toContain("expected_auth_user_id uuid not null unique");
    expect(sql).toContain(
      "function private.registration_auth_email_binding_hash",
    );
    expect(sql).toContain(
      "revoke all on function private.registration_auth_email_binding_hash(text, uuid)",
    );
    expect(sql).toContain(
      "function private.before_user_created_email_registration",
    );
    expect(sql).toContain("to supabase_auth_admin");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("from public, anon, authenticated, service_role;");
    expect(sql).not.toContain(
      "grant execute on function public.prepare_email_registration(text, text, text, uuid, text)\n  to anon",
    );
    expect(sql).not.toContain(
      "grant select on private.registration_attempts to supabase_auth_admin",
    );
    expect(sql).not.toContain(
      "grant select on private.invitation_reservations to supabase_auth_admin",
    );
  });

  it("creates pending membership before atomic email-confirm activation", async () => {
    const sql = await migration(
      "20261013170940_v1_email_identity_reservations.sql",
    );

    expect(sql).toContain("values (new.id, 'pending', null)");
    expect(sql).toContain("function private.activate_email_registration_at");
    expect(sql).toContain("after update of email_confirmed_at on auth.users");
    expect(sql).toContain("insert into public.invitation_redemptions");
    expect(sql).toContain("set use_count = use_count + 1");
    expect(sql).toContain("set state = 'active'");
  });

  it("binds server-created Auth users without transporting proof metadata", async () => {
    const sql = await migration(
      "20261013170940_v1_email_identity_reservations.sql",
    );

    expect(sql).toContain("before insert on auth.users");
    expect(sql).toContain("where ra.expected_auth_user_id = new.id");
    expect(sql).toContain(
      "private.registration_auth_email_binding_hash(new.email, new.id)",
    );
    expect(sql).toContain("'_fh_registration_attempt'");
    expect(sql).toContain("'_fh_registration_proof'");
    expect(sql).not.toContain(
      "function private.strip_email_registration_transport_metadata",
    );
    expect(sql).not.toContain("before update on auth.users");
    expect(sql).not.toContain("attempt_proof text not null");
  });
});

describe("V1 Preview SECURITY DEFINER ACL closure", () => {
  it("removes anonymous execution only from authenticated workflows", async () => {
    const sql = await migration(
      "20261015152535_tighten_security_definer_rpc_acl.sql",
    );

    for (const signature of [
      "public.create_invitation(\n  text,\n  integer,\n  timestamp with time zone\n)",
      "public.redeem_invitation(text)",
      "public.revoke_invitation(uuid, text)",
      "public.follow_author(uuid)",
      "public.unfollow_author(uuid)",
      "public.get_my_invitation_relationships()",
      "public.get_admin_site_copy()",
    ]) {
      expect(sql).toContain(`revoke execute on function ${signature}`);
    }

    expect(sql).toContain("public.save_site_copy(");
    expect(sql.match(/from public, anon;/g)).toHaveLength(8);
    expect(sql.match(/to authenticated;/g)).toHaveLength(8);
    expect(sql).not.toContain("to service_role;");

    for (const publicRpc of [
      "browse_public_works",
      "get_public_author_profile",
      "get_public_site_copy",
      "get_published_work_authors",
      "registration_invitation_status",
      "search_public_catalog",
      "validate_registration_invitation",
    ]) {
      expect(sql).not.toContain(`public.${publicRpc}(`);
    }
  });
});

describe("Mission 3B social relationship migration contract", () => {
  it("keeps public author data narrow and direct table access closed", async () => {
    const sql = await migration(
      "20260702150000_social_relationship_foundation.sql",
    );

    expect(sql).toContain("create table public.author_profiles");
    expect(sql).toContain("create table public.author_follows");
    expect(sql).toContain("primary key (follower_user_id, author_user_id)");
    expect(sql).toContain("constraint author_follows_not_self");
    expect(sql).toContain(
      "alter table public.author_profiles enable row level security",
    );
    expect(sql).toContain(
      "revoke all on public.author_profiles from anon, authenticated",
    );
    expect(sql).toContain(
      "revoke all on public.author_follows from anon, authenticated",
    );
  });

  it("exposes only the approved author, follow, and invitation RPCs", async () => {
    const sql = await migration(
      "20260702150000_social_relationship_foundation.sql",
    );

    for (const routine of [
      "get_public_author_profile",
      "follow_author",
      "unfollow_author",
      "get_my_invitation_relationships",
    ]) {
      expect(sql).toContain(`function public.${routine}`);
    }
    expect(sql.match(/security definer/g)?.length).toBeGreaterThanOrEqual(5);
    expect(sql.match(/set search_path = ''/g)?.length).toBeGreaterThanOrEqual(
      5,
    );
    expect(sql).toContain("w.status = 'published'");
    expect(sql).toContain("on conflict do nothing");
    expect(sql).toContain("to anon, authenticated");
    expect(sql).not.toContain("grant select on public.author_follows");
  });
});

describe("Phase 3 acceptance public work author migration contract", () => {
  it("maps only published works to narrow public author fields", async () => {
    const sql = await migration(
      "20260703090000_published_work_public_authors.sql",
    );

    expect(sql).toContain(
      "function public.get_published_work_authors(p_work_slugs text[])",
    );
    expect(sql).toContain("returns table");
    expect(sql).toContain("work_slug text");
    expect(sql).toContain("author_slug text");
    expect(sql).toContain("display_name text");
    expect(sql).toContain("w.status = 'published'");
    expect(sql).toContain("rg.role = 'author'");
    expect(sql).toContain("rg.revoked_at is null");
    expect(sql).toContain("m.state = 'active'");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("to anon, authenticated");
    expect(sql).not.toContain("owner_user_id text");
    expect(sql).not.toContain("registration_name");
    expect(sql).not.toContain("alter table");
    expect(sql).not.toContain("create policy");
  });
});

describe("Phase 3 Studio owner read RPC migration contract", () => {
  it("keeps Studio reads authenticated, owner-scoped and free of owner output", async () => {
    const sql = await migration("20260703100000_studio_owner_read_rpcs.sql");

    expect(sql).toContain("function public.list_my_studio_works");
    expect(sql).toContain("function public.get_my_studio_work");
    expect(sql.match(/w\.owner_user_id = auth\.uid\(\)/g)).toHaveLength(2);
    expect(
      sql.match(/private\.is_active_member\(auth\.uid\(\)\)/g),
    ).toHaveLength(2);
    expect(
      sql.match(/private\.has_role\('author', auth\.uid\(\)\)/g),
    ).toHaveLength(2);
    expect(sql).toContain("w.status in ('draft', 'published')");
    expect(sql).toContain("to authenticated");
    expect(sql).not.toContain("to anon;");
    expect(sql).not.toContain("'owner_user_id'");
    expect(sql).not.toContain("alter table");
    expect(sql).not.toContain("create policy");
  });
});

describe("V1 Package B2 server auth boundary migration contract", () => {
  it("keeps login resolution, attempt context, and rate limits server-only", async () => {
    const sql = await migration(
      "20261014112425_b2_auth_flow_server_boundaries.sql",
    );

    expect(sql).toContain("create table private.auth_rate_limits");
    expect(sql).toContain(
      "alter table private.auth_rate_limits enable row level security",
    );
    expect(sql).toContain("function public.registration_context_by_proof");
    expect(sql).toContain("function public.resolve_login_name_user_id");
    expect(sql).toContain("function public.consume_auth_rate_limit");
    expect(sql.match(/security definer/g)).toHaveLength(4);
    expect(sql.match(/set search_path = ''/g)).toHaveLength(4);
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("to anon;");
    expect(sql).not.toContain("to authenticated;");
    expect(sql).not.toContain("email text");
  });

  it("makes attempt resumption exact-match, non-terminal, and service-only", async () => {
    const sql = await migration(
      "20261016165027_tighten_registration_attempt_resume_context.sql",
    );

    expect(sql).toContain("function public.registration_resume_context");
    expect(sql.match(/security definer/g)).toHaveLength(2);
    expect(sql.match(/set search_path = ''/g)).toHaveLength(2);
    expect(sql).toContain("ra.status = 'auth_created'");
    expect(sql).toContain("ra.auth_user_id = ra.expected_auth_user_id");
    expect(sql).toContain("ir.expires_at > statement_timestamp()");
    expect(sql).toContain("i.revoked_at is null");
    expect(sql).toContain("u.email_confirmed_at is null");
    expect(sql).toContain("u.confirmed_at is null");
    expect(sql).toContain("u.banned_until");
    expect(sql).toContain("ra.email_binding_hash");
    expect(sql).toContain("ra.login_name_key");
    expect(sql).toContain("i.code_hash = p_code_hash");
    expect(sql).toContain("m.state = 'pending'");
    expect(sql).toContain("not exists (");
    expect(sql).toContain("from public.invitation_redemptions");
    expect(sql.match(/to service_role;/g)).toHaveLength(2);
    expect(sql).not.toContain("to anon;");
    expect(sql).not.toContain("to authenticated;");
    expect(sql).not.toMatch(/\binsert\s+into\b/i);
    expect(sql).not.toMatch(/\bupdate\s+(?:public|private|auth)\./i);
    expect(sql).not.toMatch(/\bdelete\s+from\b/i);
  });

  it("stores only application-HMAC rate-limit subjects", async () => {
    const sql = await migration(
      "20261014112425_b2_auth_flow_server_boundaries.sql",
    );

    expect(sql).toContain("subject_hash text not null");
    expect(sql).toContain("subject_hash ~ '^[0-9a-f]{64}$'");
    expect(sql).not.toContain("ip_address");
    expect(sql).not.toContain(
      "create table private.auth_rate_limits (\n  registration_name",
    );
  });
});
