create or replace function private.normalize_site_copy_text(p_value text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select pg_catalog.btrim(normalize(p_value, NFC));
$$;

create or replace function private.site_copy_text_is_valid(
  p_value text,
  p_min_length integer,
  p_max_length integer
)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select p_value is not null
    and p_min_length >= 0
    and p_max_length >= p_min_length
    and p_value = private.normalize_site_copy_text(p_value)
    and pg_catalog.char_length(p_value) between p_min_length and p_max_length
    and p_value !~ '[[:cntrl:]]';
$$;

create or replace function private.require_site_copy_text(
  p_value text,
  p_field text,
  p_min_length integer,
  p_max_length integer
)
returns text
language plpgsql
immutable
parallel safe
set search_path = ''
as $$
declare
  v_value text;
begin
  if p_value is null then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=' || p_field;
  end if;

  v_value := private.normalize_site_copy_text(p_value);

  if pg_catalog.char_length(v_value) not between p_min_length and p_max_length
    or v_value ~ '[[:cntrl:]]'
  then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=' || p_field;
  end if;

  return v_value;
end;
$$;

create table public.site_copy_revisions (
  id uuid primary key default extensions.gen_random_uuid(),
  scope text not null default 'global'
    constraint site_copy_revisions_global_scope check (scope = 'global'),
  version bigint not null
    constraint site_copy_revisions_positive_version check (version >= 1),
  base_version bigint not null
    constraint site_copy_revisions_nonnegative_base_version check (base_version >= 0),
  base_revision_id uuid,
  homepage_title text not null
    constraint site_copy_revisions_homepage_title check (
      private.site_copy_text_is_valid(homepage_title, 1, 40)
    ),
  homepage_introduction text not null
    constraint site_copy_revisions_homepage_introduction check (
      private.site_copy_text_is_valid(homepage_introduction, 1, 180)
    ),
  homepage_primary_cta_label text not null
    constraint site_copy_revisions_homepage_primary_cta_label check (
      private.site_copy_text_is_valid(homepage_primary_cta_label, 1, 18)
    ),
  homepage_secondary_cta_label text not null
    constraint site_copy_revisions_homepage_secondary_cta_label check (
      private.site_copy_text_is_valid(homepage_secondary_cta_label, 1, 18)
    ),
  navigation_archive_label text not null
    constraint site_copy_revisions_navigation_archive_label check (
      private.site_copy_text_is_valid(navigation_archive_label, 1, 12)
    ),
  navigation_search_label text not null
    constraint site_copy_revisions_navigation_search_label check (
      private.site_copy_text_is_valid(navigation_search_label, 1, 12)
    ),
  navigation_studio_label text not null
    constraint site_copy_revisions_navigation_studio_label check (
      private.site_copy_text_is_valid(navigation_studio_label, 1, 12)
    ),
  footer_brand_note text not null
    constraint site_copy_revisions_footer_brand_note check (
      private.site_copy_text_is_valid(footer_brand_note, 1, 80)
    ),
  request_id uuid not null,
  audit_log_id bigint not null
    references public.audit_logs (id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  constraint site_copy_revisions_version unique (scope, version),
  constraint site_copy_revisions_scope_id unique (scope, id),
  constraint site_copy_revisions_scope_version_id unique (scope, version, id),
  constraint site_copy_revisions_request_id unique (request_id),
  constraint site_copy_revisions_audit_log unique (audit_log_id),
  constraint site_copy_revisions_base_reference foreign key (
    scope,
    base_version,
    base_revision_id
  ) references public.site_copy_revisions (
    scope,
    version,
    id
  ) on delete restrict,
  constraint site_copy_revisions_base_contract check (
    (version = 1 and base_version = 0 and base_revision_id is null)
    or (
      version > 1
      and base_version = version - 1
      and base_revision_id is not null
    )
  )
);

create index site_copy_revisions_created_at
  on public.site_copy_revisions (created_at desc);

create table public.site_copy_state (
  scope text primary key
    constraint site_copy_state_global_scope check (scope = 'global'),
  current_revision_id uuid not null unique,
  updated_at timestamptz not null default statement_timestamp(),
  constraint site_copy_state_current_revision foreign key (
    scope,
    current_revision_id
  ) references public.site_copy_revisions (
    scope,
    id
  ) on delete restrict
);

create or replace function private.prevent_site_copy_revision_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'SITE_COPY_REVISION_IMMUTABLE';
end;
$$;

create trigger site_copy_revisions_immutable
before update or delete on public.site_copy_revisions
for each row execute function private.prevent_site_copy_revision_mutation();

create or replace function private.prevent_site_copy_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    old.target_type = 'site_copy_revision'
    and old.action in ('site_copy.initialized', 'site_copy.updated')
  ) or (
    tg_op = 'UPDATE'
    and new.target_type = 'site_copy_revision'
    and new.action in ('site_copy.initialized', 'site_copy.updated')
  ) then
    raise exception using
      errcode = '55000',
      message = 'SITE_COPY_AUDIT_IMMUTABLE';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger site_copy_audit_immutable
before update or delete on public.audit_logs
for each row execute function private.prevent_site_copy_audit_mutation();

alter table public.site_copy_revisions enable row level security;
alter table public.site_copy_state enable row level security;

revoke all on public.site_copy_revisions
  from public, anon, authenticated, service_role;
revoke all on public.site_copy_state
  from public, anon, authenticated, service_role;

create or replace function public.get_public_site_copy()
returns table (
  version bigint,
  homepage_title text,
  homepage_introduction text,
  homepage_primary_cta_label text,
  homepage_secondary_cta_label text,
  navigation_archive_label text,
  navigation_search_label text,
  navigation_studio_label text,
  footer_brand_note text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.version,
    r.homepage_title,
    r.homepage_introduction,
    r.homepage_primary_cta_label,
    r.homepage_secondary_cta_label,
    r.navigation_archive_label,
    r.navigation_search_label,
    r.navigation_studio_label,
    r.footer_brand_note
  from public.site_copy_state s
  join public.site_copy_revisions r on r.id = s.current_revision_id
  where s.scope = 'global';
$$;

create or replace function public.get_admin_site_copy()
returns table (
  version bigint,
  revision_id uuid,
  homepage_title text,
  homepage_introduction text,
  homepage_primary_cta_label text,
  homepage_secondary_cta_label text,
  navigation_archive_label text,
  navigation_search_label text,
  navigation_studio_label text,
  footer_brand_note text,
  audit_log_id bigint,
  last_actor_user_id uuid,
  last_change_reason text,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  if not (
    private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  return query
  select
    r.version,
    r.id,
    r.homepage_title,
    r.homepage_introduction,
    r.homepage_primary_cta_label,
    r.homepage_secondary_cta_label,
    r.navigation_archive_label,
    r.navigation_search_label,
    r.navigation_studio_label,
    r.footer_brand_note,
    r.audit_log_id,
    a.actor_user_id,
    a.reason,
    s.updated_at
  from public.site_copy_state s
  join public.site_copy_revisions r on r.id = s.current_revision_id
  join public.audit_logs a on a.id = r.audit_log_id
  where s.scope = 'global';
end;
$$;

create or replace function public.save_site_copy(
  p_base_version bigint,
  p_base_revision_id uuid,
  p_request_id uuid,
  p_homepage_title text,
  p_homepage_introduction text,
  p_homepage_primary_cta_label text,
  p_homepage_secondary_cta_label text,
  p_navigation_archive_label text,
  p_navigation_search_label text,
  p_navigation_studio_label text,
  p_footer_brand_note text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_current_revision public.site_copy_revisions%rowtype;
  v_request_revision public.site_copy_revisions%rowtype;
  v_request_actor uuid;
  v_request_reason text;
  v_homepage_title text;
  v_homepage_introduction text;
  v_homepage_primary_cta_label text;
  v_homepage_secondary_cta_label text;
  v_navigation_archive_label text;
  v_navigation_search_label text;
  v_navigation_studio_label text;
  v_footer_brand_note text;
  v_reason text;
  v_revision_id uuid;
  v_audit_log_id bigint;
  v_saved_at timestamptz;
  v_changed_fields text[];
  v_changes jsonb;
begin
  if v_actor is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  if not (
    private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('fandom-harbor:site-copy:global', 0)
  );

  select r.* into v_current_revision
  from public.site_copy_state s
  join public.site_copy_revisions r on r.id = s.current_revision_id
  where s.scope = 'global'
  for update of s;

  v_homepage_title := private.require_site_copy_text(
    p_homepage_title, 'homepage_title', 1, 40
  );
  v_homepage_introduction := private.require_site_copy_text(
    p_homepage_introduction, 'homepage_introduction', 1, 180
  );
  v_homepage_primary_cta_label := private.require_site_copy_text(
    p_homepage_primary_cta_label, 'homepage_primary_cta_label', 1, 18
  );
  v_homepage_secondary_cta_label := private.require_site_copy_text(
    p_homepage_secondary_cta_label, 'homepage_secondary_cta_label', 1, 18
  );
  v_navigation_archive_label := private.require_site_copy_text(
    p_navigation_archive_label, 'navigation_archive_label', 1, 12
  );
  v_navigation_search_label := private.require_site_copy_text(
    p_navigation_search_label, 'navigation_search_label', 1, 12
  );
  v_navigation_studio_label := private.require_site_copy_text(
    p_navigation_studio_label, 'navigation_studio_label', 1, 12
  );
  v_footer_brand_note := private.require_site_copy_text(
    p_footer_brand_note, 'footer_brand_note', 1, 80
  );
  v_reason := private.require_site_copy_text(p_reason, 'reason', 1, 500);

  if p_request_id is null
    or p_base_version is null
    or p_base_version < 1
    or p_base_revision_id is null
  then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=request_contract';
  end if;

  select r.* into v_request_revision
  from public.site_copy_revisions r
  where r.request_id = p_request_id;

  if found then
    select a.actor_user_id, a.reason
    into v_request_actor, v_request_reason
    from public.audit_logs a
    where a.id = v_request_revision.audit_log_id;

    if v_request_actor is distinct from v_actor
      or v_request_revision.base_version is distinct from p_base_version
      or v_request_revision.base_revision_id is distinct from p_base_revision_id
      or v_request_revision.homepage_title is distinct from v_homepage_title
      or v_request_revision.homepage_introduction is distinct from v_homepage_introduction
      or v_request_revision.homepage_primary_cta_label
        is distinct from v_homepage_primary_cta_label
      or v_request_revision.homepage_secondary_cta_label
        is distinct from v_homepage_secondary_cta_label
      or v_request_revision.navigation_archive_label
        is distinct from v_navigation_archive_label
      or v_request_revision.navigation_search_label
        is distinct from v_navigation_search_label
      or v_request_revision.navigation_studio_label
        is distinct from v_navigation_studio_label
      or v_request_revision.footer_brand_note is distinct from v_footer_brand_note
      or v_request_reason is distinct from v_reason
    then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=request_id';
    end if;

    select pg_catalog.array_remove(array[
      case
        when b.homepage_title is distinct from v_request_revision.homepage_title
          then 'homepage_title'
      end,
      case
        when b.homepage_introduction
          is distinct from v_request_revision.homepage_introduction
          then 'homepage_introduction'
      end,
      case
        when b.homepage_primary_cta_label
          is distinct from v_request_revision.homepage_primary_cta_label
          then 'homepage_primary_cta_label'
      end,
      case
        when b.homepage_secondary_cta_label
          is distinct from v_request_revision.homepage_secondary_cta_label
          then 'homepage_secondary_cta_label'
      end,
      case
        when b.navigation_archive_label
          is distinct from v_request_revision.navigation_archive_label
          then 'navigation_archive_label'
      end,
      case
        when b.navigation_search_label
          is distinct from v_request_revision.navigation_search_label
          then 'navigation_search_label'
      end,
      case
        when b.navigation_studio_label
          is distinct from v_request_revision.navigation_studio_label
          then 'navigation_studio_label'
      end,
      case
        when b.footer_brand_note is distinct from v_request_revision.footer_brand_note
          then 'footer_brand_note'
      end
    ], null)
    into v_changed_fields
    from public.site_copy_revisions b
    where b.id = v_request_revision.base_revision_id;

    return pg_catalog.jsonb_build_object(
      'status', 'saved',
      'version', v_request_revision.version,
      'revision_id', v_request_revision.id,
      'audit_log_id', v_request_revision.audit_log_id,
      'changed_fields', pg_catalog.to_jsonb(v_changed_fields),
      'updated_at', v_request_revision.created_at
    );
  end if;

  if v_current_revision.id is null then
    raise exception using
      errcode = '55000',
      message = 'SITE_COPY_UNINITIALIZED';
  end if;

  if p_base_version <> v_current_revision.version
    or p_base_revision_id <> v_current_revision.id
  then
    return pg_catalog.jsonb_build_object(
      'status', 'conflict',
      'current_version', v_current_revision.version,
      'current_revision_id', v_current_revision.id
    );
  end if;

  v_changed_fields := pg_catalog.array_remove(array[
    case
      when v_current_revision.homepage_title is distinct from v_homepage_title
        then 'homepage_title'
    end,
    case
      when v_current_revision.homepage_introduction
        is distinct from v_homepage_introduction
        then 'homepage_introduction'
    end,
    case
      when v_current_revision.homepage_primary_cta_label
        is distinct from v_homepage_primary_cta_label
        then 'homepage_primary_cta_label'
    end,
    case
      when v_current_revision.homepage_secondary_cta_label
        is distinct from v_homepage_secondary_cta_label
        then 'homepage_secondary_cta_label'
    end,
    case
      when v_current_revision.navigation_archive_label
        is distinct from v_navigation_archive_label
        then 'navigation_archive_label'
    end,
    case
      when v_current_revision.navigation_search_label
        is distinct from v_navigation_search_label
        then 'navigation_search_label'
    end,
    case
      when v_current_revision.navigation_studio_label
        is distinct from v_navigation_studio_label
        then 'navigation_studio_label'
    end,
    case
      when v_current_revision.footer_brand_note is distinct from v_footer_brand_note
        then 'footer_brand_note'
    end
  ], null);

  if pg_catalog.cardinality(v_changed_fields) = 0 then
    return pg_catalog.jsonb_build_object(
      'status', 'unchanged',
      'version', v_current_revision.version,
      'revision_id', v_current_revision.id
    );
  end if;

  v_revision_id := extensions.gen_random_uuid();
  v_saved_at := statement_timestamp();

  v_changes := pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
    'homepage_title',
      case
        when v_current_revision.homepage_title is distinct from v_homepage_title
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.homepage_title,
            'after', v_homepage_title
          )
      end,
    'homepage_introduction',
      case
        when v_current_revision.homepage_introduction
          is distinct from v_homepage_introduction
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.homepage_introduction,
            'after', v_homepage_introduction
          )
      end,
    'homepage_primary_cta_label',
      case
        when v_current_revision.homepage_primary_cta_label
          is distinct from v_homepage_primary_cta_label
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.homepage_primary_cta_label,
            'after', v_homepage_primary_cta_label
          )
      end,
    'homepage_secondary_cta_label',
      case
        when v_current_revision.homepage_secondary_cta_label
          is distinct from v_homepage_secondary_cta_label
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.homepage_secondary_cta_label,
            'after', v_homepage_secondary_cta_label
          )
      end,
    'navigation_archive_label',
      case
        when v_current_revision.navigation_archive_label
          is distinct from v_navigation_archive_label
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.navigation_archive_label,
            'after', v_navigation_archive_label
          )
      end,
    'navigation_search_label',
      case
        when v_current_revision.navigation_search_label
          is distinct from v_navigation_search_label
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.navigation_search_label,
            'after', v_navigation_search_label
          )
      end,
    'navigation_studio_label',
      case
        when v_current_revision.navigation_studio_label
          is distinct from v_navigation_studio_label
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.navigation_studio_label,
            'after', v_navigation_studio_label
          )
      end,
    'footer_brand_note',
      case
        when v_current_revision.footer_brand_note is distinct from v_footer_brand_note
          then pg_catalog.jsonb_build_object(
            'before', v_current_revision.footer_brand_note,
            'after', v_footer_brand_note
          )
      end
  ));

  v_audit_log_id := private.write_audit(
    v_actor,
    'site_copy.updated',
    'site_copy_revision',
    v_revision_id,
    v_reason,
    v_changes
  );

  insert into public.site_copy_revisions (
    id,
    scope,
    version,
    base_version,
    base_revision_id,
    homepage_title,
    homepage_introduction,
    homepage_primary_cta_label,
    homepage_secondary_cta_label,
    navigation_archive_label,
    navigation_search_label,
    navigation_studio_label,
    footer_brand_note,
    request_id,
    audit_log_id,
    created_at
  ) values (
    v_revision_id,
    'global',
    v_current_revision.version + 1,
    v_current_revision.version,
    v_current_revision.id,
    v_homepage_title,
    v_homepage_introduction,
    v_homepage_primary_cta_label,
    v_homepage_secondary_cta_label,
    v_navigation_archive_label,
    v_navigation_search_label,
    v_navigation_studio_label,
    v_footer_brand_note,
    p_request_id,
    v_audit_log_id,
    v_saved_at
  );

  update public.site_copy_state
  set current_revision_id = v_revision_id,
      updated_at = v_saved_at
  where scope = 'global';

  return pg_catalog.jsonb_build_object(
    'status', 'saved',
    'version', v_current_revision.version + 1,
    'revision_id', v_revision_id,
    'audit_log_id', v_audit_log_id,
    'changed_fields', pg_catalog.to_jsonb(v_changed_fields),
    'updated_at', v_saved_at
  );
end;
$$;

revoke all on function private.normalize_site_copy_text(text) from public;
revoke all on function private.site_copy_text_is_valid(text, integer, integer)
  from public;
revoke all on function private.require_site_copy_text(text, text, integer, integer)
  from public;
revoke all on function private.prevent_site_copy_revision_mutation() from public;
revoke all on function private.prevent_site_copy_audit_mutation() from public;

revoke all on function public.get_public_site_copy() from public;
revoke all on function public.get_admin_site_copy() from public;
revoke all on function public.save_site_copy(
  bigint,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.get_public_site_copy()
  to anon, authenticated;
grant execute on function public.get_admin_site_copy()
  to authenticated;
grant execute on function public.save_site_copy(
  bigint,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

comment on table public.site_copy_revisions is
  'Immutable full snapshots for the eight-field Admin P0 site copy contract.';
comment on table public.site_copy_state is
  'Single global current pointer; DATA-01 creates the first row and Version 1.';
comment on function public.get_public_site_copy() is
  'Public projection containing only the eight P0 copy fields and a non-sensitive version.';
comment on function public.get_admin_site_copy() is
  'Active Admin/Super Admin current-copy projection with review and audit context.';
comment on function public.save_site_copy(
  bigint,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) is
  'Atomic optimistic-concurrency save with global serialization, request idempotency, immutable revision, current pointer, and one audit event.';
