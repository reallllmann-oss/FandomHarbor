create or replace function private.current_user_is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_active_member(auth.uid());
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.statement_timestamp();
  return new;
end;
$$;

create or replace function private.current_user_can_manage_content_owner(
  p_owner_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_owner_user_id = auth.uid()
    and private.has_role('author', auth.uid())
  )
  or private.has_role('admin', auth.uid())
  or private.has_role('super_admin', auth.uid());
$$;

revoke all on function private.current_user_is_active_member() from public;
revoke all on function private.set_updated_at() from public;
revoke all on function private.current_user_can_manage_content_owner(uuid) from public;
grant execute on function private.current_user_is_active_member() to authenticated;
grant execute on function private.current_user_can_manage_content_owner(uuid) to authenticated;

create table public.content_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint content_categories_name_length check (
    char_length(btrim(name)) between 1 and 120
  ),
  constraint content_categories_slug_format check (
    char_length(slug) between 1 and 120
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint content_categories_description_length check (
    description is null or char_length(description) <= 2000
  ),
  constraint content_categories_timestamp_order check (updated_at >= created_at)
);

create unique index content_categories_slug_unique
  on public.content_categories (slug);

create table public.content_tags (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  slug text not null,
  tag_type text not null,
  governance_state text not null default 'pending',
  canonical_tag_id uuid references public.content_tags (id) on delete restrict,
  description text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint content_tags_name_length check (
    char_length(btrim(name)) between 1 and 160
  ),
  constraint content_tags_slug_format check (
    char_length(slug) between 1 and 160
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint content_tags_type_check check (
    tag_type in ('fandom', 'relationship', 'character', 'additional')
  ),
  constraint content_tags_governance_state_check check (
    governance_state in ('pending', 'canonical', 'alias', 'deprecated')
  ),
  constraint content_tags_alias_target_check check (
    (governance_state = 'alias' and canonical_tag_id is not null)
    or (governance_state <> 'alias' and canonical_tag_id is null)
  ),
  constraint content_tags_not_self_canonical check (
    canonical_tag_id is null or canonical_tag_id <> id
  ),
  constraint content_tags_description_length check (
    description is null or char_length(description) <= 2000
  ),
  constraint content_tags_timestamp_order check (updated_at >= created_at)
);

create unique index content_tags_slug_unique
  on public.content_tags (slug);

create index content_tags_type_governance
  on public.content_tags (tag_type, governance_state, name);

create index content_tags_canonical_target
  on public.content_tags (canonical_tag_id)
  where canonical_tag_id is not null;

create or replace function private.validate_content_tag_canonical_target()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.governance_state = 'alias' and not exists (
    select 1
    from public.content_tags target
    where target.id = new.canonical_tag_id
      and target.governance_state = 'canonical'
      and target.tag_type = new.tag_type
  ) then
    raise exception using
      errcode = '23514',
      message = 'tag alias target must be canonical and type-compatible';
  end if;

  if tg_op = 'UPDATE'
    and exists (
      select 1
      from public.content_tags alias
      where alias.canonical_tag_id = old.id
    )
    and (
      new.governance_state <> 'canonical'
      or new.tag_type <> old.tag_type
    )
  then
    raise exception using
      errcode = '23514',
      message = 'canonical tag with aliases must remain canonical and type-compatible';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_content_tag_canonical_target() from public;

create trigger content_tags_validate_canonical_target
before insert or update on public.content_tags
for each row execute function private.validate_content_tag_canonical_target();

create table public.works (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (user_id) on delete restrict,
  category_id uuid references public.content_categories (id) on delete restrict,
  title text not null,
  slug text not null,
  summary text not null default '',
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint works_title_length check (
    char_length(btrim(title)) between 1 and 300
  ),
  constraint works_slug_format check (
    char_length(slug) between 1 and 160
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint works_summary_length check (char_length(summary) <= 5000),
  constraint works_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint works_publication_time_check check (
    (status = 'draft' and published_at is null)
    or (status in ('published', 'archived') and published_at is not null)
  ),
  constraint works_timestamp_order check (
    updated_at >= created_at
    and (published_at is null or published_at >= created_at)
  )
);

create unique index works_slug_unique on public.works (slug);

create index works_owner_recent
  on public.works (owner_user_id, updated_at desc);

create index works_published_feed
  on public.works (published_at desc, id)
  where status = 'published';

create index works_category_published
  on public.works (category_id, published_at desc)
  where status = 'published' and category_id is not null;

create or replace function private.current_user_can_manage_work(p_work_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.works w
    where w.id = p_work_id
      and private.current_user_can_manage_content_owner(w.owner_user_id)
  );
$$;

revoke all on function private.current_user_can_manage_work(uuid) from public;
grant execute on function private.current_user_can_manage_work(uuid) to authenticated;

create table public.chapters (
  id uuid primary key default extensions.gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete restrict,
  position integer not null,
  title text not null,
  slug text not null,
  status text not null default 'draft',
  content jsonb not null,
  content_schema_version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint chapters_position_positive check (position > 0),
  constraint chapters_title_length check (
    char_length(btrim(title)) between 1 and 300
  ),
  constraint chapters_slug_format check (
    char_length(slug) between 1 and 160
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint chapters_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint chapters_content_object check (jsonb_typeof(content) = 'object'),
  constraint chapters_schema_version_positive check (content_schema_version > 0),
  constraint chapters_publication_time_check check (
    (status = 'draft' and published_at is null)
    or (status in ('published', 'archived') and published_at is not null)
  ),
  constraint chapters_timestamp_order check (
    updated_at >= created_at
    and (published_at is null or published_at >= created_at)
  )
);

create unique index chapters_work_position_unique
  on public.chapters (work_id, position);

create unique index chapters_work_slug_unique
  on public.chapters (work_id, slug);

create index chapters_work_reading_order
  on public.chapters (work_id, status, position);

create table public.articles (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_user_id uuid not null references public.profiles (user_id) on delete restrict,
  category_id uuid references public.content_categories (id) on delete restrict,
  title text not null,
  slug text not null,
  summary text not null default '',
  status text not null default 'draft',
  content jsonb not null,
  content_schema_version integer not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint articles_title_length check (
    char_length(btrim(title)) between 1 and 300
  ),
  constraint articles_slug_format check (
    char_length(slug) between 1 and 160
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint articles_summary_length check (char_length(summary) <= 5000),
  constraint articles_status_check check (
    status in ('draft', 'published', 'archived')
  ),
  constraint articles_content_object check (jsonb_typeof(content) = 'object'),
  constraint articles_schema_version_positive check (content_schema_version > 0),
  constraint articles_publication_time_check check (
    (status = 'draft' and published_at is null)
    or (status in ('published', 'archived') and published_at is not null)
  ),
  constraint articles_timestamp_order check (
    updated_at >= created_at
    and (published_at is null or published_at >= created_at)
  )
);

create unique index articles_slug_unique on public.articles (slug);

create index articles_owner_recent
  on public.articles (owner_user_id, updated_at desc);

create index articles_published_feed
  on public.articles (published_at desc, id)
  where status = 'published';

create index articles_category_published
  on public.articles (category_id, published_at desc)
  where status = 'published' and category_id is not null;

create or replace function private.current_user_can_manage_article(
  p_article_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.articles a
    where a.id = p_article_id
      and private.current_user_can_manage_content_owner(a.owner_user_id)
  );
$$;

revoke all on function private.current_user_can_manage_article(uuid) from public;
grant execute on function private.current_user_can_manage_article(uuid) to authenticated;

create table public.work_tags (
  work_id uuid not null references public.works (id) on delete restrict,
  tag_id uuid not null references public.content_tags (id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  primary key (work_id, tag_id)
);

create index work_tags_tag_work on public.work_tags (tag_id, work_id);

create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete restrict,
  tag_id uuid not null references public.content_tags (id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  primary key (article_id, tag_id)
);

create index article_tags_tag_article
  on public.article_tags (tag_id, article_id);

create trigger content_categories_set_updated_at
before update on public.content_categories
for each row execute function private.set_updated_at();

create trigger content_tags_set_updated_at
before update on public.content_tags
for each row execute function private.set_updated_at();

create trigger works_set_updated_at
before update on public.works
for each row execute function private.set_updated_at();

create trigger chapters_set_updated_at
before update on public.chapters
for each row execute function private.set_updated_at();

create trigger articles_set_updated_at
before update on public.articles
for each row execute function private.set_updated_at();

alter table public.works enable row level security;
alter table public.chapters enable row level security;
alter table public.articles enable row level security;
alter table public.content_categories enable row level security;
alter table public.content_tags enable row level security;
alter table public.work_tags enable row level security;
alter table public.article_tags enable row level security;

revoke all on public.works from anon, authenticated;
revoke all on public.chapters from anon, authenticated;
revoke all on public.articles from anon, authenticated;
revoke all on public.content_categories from anon, authenticated;
revoke all on public.content_tags from anon, authenticated;
revoke all on public.work_tags from anon, authenticated;
revoke all on public.article_tags from anon, authenticated;

grant select (
  id, category_id, title, slug, summary, status,
  published_at, created_at, updated_at
) on public.works to authenticated;
grant insert (
  owner_user_id, category_id, title, slug, summary, status, published_at
) on public.works to authenticated;
grant update (
  category_id, title, slug, summary, status, published_at
) on public.works to authenticated;

grant select (
  id, work_id, position, title, slug, status, content,
  content_schema_version, published_at, created_at, updated_at
) on public.chapters to authenticated;
grant insert (
  work_id, position, title, slug, status, content,
  content_schema_version, published_at
) on public.chapters to authenticated;
grant update (
  position, title, slug, status, published_at
) on public.chapters to authenticated;

grant select (
  id, category_id, title, slug, summary, status, content,
  content_schema_version, published_at, created_at, updated_at
) on public.articles to authenticated;
grant insert (
  owner_user_id, category_id, title, slug, summary, status, content,
  content_schema_version, published_at
) on public.articles to authenticated;
grant update (
  category_id, title, slug, summary, status, published_at
) on public.articles to authenticated;

grant select on public.content_categories to authenticated;
grant insert (name, slug, description) on public.content_categories to authenticated;
grant update (name, slug, description) on public.content_categories to authenticated;

grant select on public.content_tags to authenticated;
grant insert (
  name, slug, tag_type, governance_state, canonical_tag_id, description
) on public.content_tags to authenticated;
grant update (
  name, slug, tag_type, governance_state, canonical_tag_id, description
) on public.content_tags to authenticated;

grant select, insert, delete on public.work_tags to authenticated;
grant select, insert, delete on public.article_tags to authenticated;

create policy works_select_published
on public.works
for select
to authenticated
using (
  status = 'published'
  and private.current_user_is_active_member()
);

create policy works_select_owner_or_admin
on public.works
for select
to authenticated
using (
  private.current_user_can_manage_content_owner(owner_user_id)
);

create policy works_insert_author_or_admin
on public.works
for insert
to authenticated
with check (
  private.current_user_can_manage_content_owner(owner_user_id)
);

create policy works_update_owner_or_admin
on public.works
for update
to authenticated
using (
  private.current_user_can_manage_content_owner(owner_user_id)
)
with check (
  private.current_user_can_manage_content_owner(owner_user_id)
);

create policy chapters_select_published
on public.chapters
for select
to authenticated
using (
  status = 'published'
  and private.current_user_is_active_member()
  and exists (
    select 1 from public.works w
    where w.id = chapters.work_id and w.status = 'published'
  )
);

create policy chapters_select_owner_or_admin
on public.chapters
for select
to authenticated
using (
  private.current_user_can_manage_work(work_id)
);

create policy chapters_insert_owner_or_admin
on public.chapters
for insert
to authenticated
with check (
  private.current_user_can_manage_work(work_id)
);

create policy chapters_update_owner_or_admin
on public.chapters
for update
to authenticated
using (
  private.current_user_can_manage_work(work_id)
)
with check (
  private.current_user_can_manage_work(work_id)
);

create policy articles_select_published
on public.articles
for select
to authenticated
using (
  status = 'published'
  and private.current_user_is_active_member()
);

create policy articles_select_owner_or_admin
on public.articles
for select
to authenticated
using (
  private.current_user_can_manage_content_owner(owner_user_id)
);

create policy articles_insert_author_or_admin
on public.articles
for insert
to authenticated
with check (
  private.current_user_can_manage_content_owner(owner_user_id)
);

create policy articles_update_owner_or_admin
on public.articles
for update
to authenticated
using (
  private.current_user_can_manage_content_owner(owner_user_id)
)
with check (
  private.current_user_can_manage_content_owner(owner_user_id)
);

create policy content_categories_select_active_members
on public.content_categories
for select
to authenticated
using (private.current_user_is_active_member());

create policy content_categories_insert_admin
on public.content_categories
for insert
to authenticated
with check (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy content_categories_update_admin
on public.content_categories
for update
to authenticated
using (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
)
with check (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy content_tags_select_active_members
on public.content_tags
for select
to authenticated
using (
  private.current_user_is_active_member()
  and governance_state <> 'deprecated'
);

create policy content_tags_select_admin
on public.content_tags
for select
to authenticated
using (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy content_tags_insert_author_or_admin
on public.content_tags
for insert
to authenticated
with check (
  (
    private.current_user_has_role('author')
    and governance_state = 'pending'
    and canonical_tag_id is null
  )
  or private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy content_tags_update_admin
on public.content_tags
for update
to authenticated
using (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
)
with check (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy work_tags_select_visible_work
on public.work_tags
for select
to authenticated
using (
  exists (select 1 from public.works w where w.id = work_tags.work_id)
);

create policy work_tags_insert_owner_or_admin
on public.work_tags
for insert
to authenticated
with check (
  private.current_user_can_manage_work(work_id)
  and exists (
    select 1 from public.content_tags t
    where t.id = work_tags.tag_id and t.governance_state <> 'deprecated'
  )
);

create policy work_tags_delete_owner_or_admin
on public.work_tags
for delete
to authenticated
using (
  private.current_user_can_manage_work(work_id)
);

create policy article_tags_select_visible_article
on public.article_tags
for select
to authenticated
using (
  exists (select 1 from public.articles a where a.id = article_tags.article_id)
);

create policy article_tags_insert_owner_or_admin
on public.article_tags
for insert
to authenticated
with check (
  private.current_user_can_manage_article(article_id)
  and exists (
    select 1 from public.content_tags t
    where t.id = article_tags.tag_id and t.governance_state <> 'deprecated'
  )
);

create policy article_tags_delete_owner_or_admin
on public.article_tags
for delete
to authenticated
using (
  private.current_user_can_manage_article(article_id)
);

comment on table public.works is
  'Multi-chapter work container. owner_user_id is private authorization data, not public authorship.';
comment on table public.chapters is
  'Ordered work chapters with schema-versioned JSON content.';
comment on table public.articles is
  'Standalone articles with schema-versioned JSON content.';
comment on table public.content_tags is
  'Shared governed tags; pending tags may be created by Authors and governance is administrative.';
