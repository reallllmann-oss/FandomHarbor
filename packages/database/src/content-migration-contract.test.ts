import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

async function contentMigration() {
  return readFile(
    resolve(
      process.cwd(),
      "../../supabase/migrations/20260630100000_content_domain_foundation.sql",
    ),
    "utf8",
  );
}

async function v1TaxonomyMigration() {
  return readFile(
    resolve(
      process.cwd(),
      "../../supabase/migrations/20260701100000_v1_content_taxonomy.sql",
    ),
    "utf8",
  );
}

async function createWorkDraftMigration() {
  return readFile(
    resolve(
      process.cwd(),
      "../../supabase/migrations/20260701101000_create_author_work_draft.sql",
    ),
    "utf8",
  );
}

async function chapterBodyGrantMigration() {
  return readFile(
    resolve(
      process.cwd(),
      "../../supabase/migrations/20260701113000_chapters_body_update_grant.sql",
    ),
    "utf8",
  );
}

describe("Phase 2 content migration contract", () => {
  it("creates every content table with RLS and default privilege revocation", async () => {
    const sql = await contentMigration();

    for (const table of [
      "works",
      "chapters",
      "articles",
      "content_categories",
      "content_tags",
      "work_tags",
      "article_tags",
    ]) {
      expect(sql).toContain(`create table public.${table}`);
      expect(sql).toContain(
        `alter table public.${table} enable row level security;`,
      );
      expect(sql).toContain(
        `revoke all on public.${table} from anon, authenticated;`,
      );
    }
  });

  it("defines scoped slug uniqueness, foreign keys and content constraints", async () => {
    const sql = await contentMigration();

    for (const index of [
      "works_slug_unique",
      "articles_slug_unique",
      "content_categories_slug_unique",
      "content_tags_slug_unique",
      "chapters_work_slug_unique",
      "chapters_work_position_unique",
    ]) {
      expect(sql).toContain(`create unique index ${index}`);
    }

    expect(sql).toContain(
      "references public.profiles (user_id) on delete restrict",
    );
    expect(sql).toContain("chapters_content_object");
    expect(sql).toContain("articles_content_object");
    expect(sql).toContain("content_tags_alias_target_check");
    expect(sql).toContain("content_tags_validate_canonical_target");
    expect(sql).toContain("target.tag_type = new.tag_type");
  });

  it("reuses Phase 1 membership and role helpers for public and author policies", async () => {
    const sql = await contentMigration();

    expect(sql).toContain("select private.is_active_member(auth.uid())");
    expect(sql).toContain("private.current_user_has_role('author')");
    expect(sql).toContain("private.current_user_has_role('admin')");
    expect(sql).toContain("private.current_user_has_role('super_admin')");
    expect(sql).not.toContain("create type public.content_role");
    expect(sql).not.toContain("create table public.content_roles");
  });

  it("keeps private owner identifiers outside authenticated read grants", async () => {
    const sql = await contentMigration();
    const workSelectGrant = sql.match(
      /grant select \([^)]*\) on public\.works to authenticated;/,
    )?.[0];
    const articleSelectGrant = sql.match(
      /grant select \([^)]*\) on public\.articles to authenticated;/,
    )?.[0];

    expect(workSelectGrant).toBeDefined();
    expect(articleSelectGrant).toBeDefined();
    expect(workSelectGrant).not.toContain("owner_user_id");
    expect(articleSelectGrant).not.toContain("owner_user_id");
  });

  it("attaches automatic updated-at triggers to mutable content tables", async () => {
    const sql = await contentMigration();

    expect(
      sql.match(/execute function private\.set_updated_at\(\)/g),
    ).toHaveLength(5);
  });

  it("seeds the approved V1 taxonomy idempotently without widening tag types", async () => {
    const sql = await v1TaxonomyMigration();

    expect(sql).toContain("'小说', 'fiction'");
    expect(sql).toContain(
      "'世界观', 'worldbuilding', 'additional', 'canonical'",
    );
    expect(sql.match(/'additional', 'canonical'/g)).toHaveLength(10);
    expect(sql.match(/on conflict \(slug\) do update/g)).toHaveLength(2);
    expect(sql).not.toContain("alter table");
  });

  it("creates an authenticated atomic draft RPC with server-owned lifecycle fields", async () => {
    const sql = await createWorkDraftMigration();

    expect(sql).toContain(
      "create or replace function public.create_author_work_draft",
    );
    expect(sql).toContain("v_owner_user_id uuid := auth.uid()");
    expect(sql).toContain("private.current_user_has_role('author')");
    expect(sql).toContain("'draft'");
    expect(sql).toContain("insert into public.work_tags");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("to authenticated");
    expect(sql).toContain(
      "revoke all on function public.create_author_work_draft",
    );
    expect(sql).not.toContain("to anon");
    expect(sql).not.toContain("returning *");
    expect(sql).not.toMatch(/insert into public\.works \(\s*id,/);
  });

  it("adds the minimal chapter body update grant without changing RLS or schema", async () => {
    const sql = await chapterBodyGrantMigration();

    expect(sql).toContain("grant update (");
    expect(sql).toContain("content,");
    expect(sql).toContain("content_schema_version");
    expect(sql).toContain("on public.chapters to authenticated");
    expect(sql).not.toContain("alter table");
    expect(sql).not.toContain("create policy");
  });
});
