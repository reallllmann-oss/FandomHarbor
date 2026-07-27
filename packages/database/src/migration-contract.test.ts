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

  it("returns a nullable collision result without changing invitation state", async () => {
    const sql = await migration(
      "20260727150707_standardize_invitation_code_collision_handling.sql",
    );

    expect(sql).toContain("function public.create_invitation");
    expect(sql).toContain("on conflict (code_hash) do nothing");
    expect(sql).toContain("if v_invitation_id is null then");
    expect(sql).toContain("return null;");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).not.toContain("update public.invitations");
    expect(sql).not.toContain("delete from public.invitations");
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
