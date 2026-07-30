\set ON_ERROR_STOP on

do $$
begin
  if not (
    select r.rolsuper
    from pg_catalog.pg_roles r
    where r.rolname = current_user
  ) then
    raise exception
      'run this local-only dblink concurrency test as supabase_admin';
  end if;

  if exists (select 1 from public.site_copy_state where scope = 'global') then
    raise exception 'concurrency test requires an uninitialized DB-01 database';
  end if;
end;
$$;

create extension if not exists dblink with schema extensions;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '91000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'db01-concurrency-admin@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into public.profiles (user_id)
values ('91000000-0000-4000-8000-000000000001');

insert into public.memberships (user_id, state, admitted_at)
values (
  '91000000-0000-4000-8000-000000000001',
  'active',
  statement_timestamp()
);

insert into public.role_grants (
  id,
  user_id,
  role,
  granted_by,
  grant_reason
) values (
  '92000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000001',
  'admin',
  null,
  'DB-01 concurrency fixture'
);

do $$
declare
  v_audit_log_id bigint;
begin
  v_audit_log_id := private.write_audit(
    null,
    'site_copy.initialized',
    'site_copy_revision',
    '93000000-0000-4000-8000-000000000001',
    'DB-01 concurrency baseline fixture',
    pg_catalog.jsonb_build_object(
      'homepage_title', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Fandom Harbor'
      ),
      'homepage_introduction', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Concurrency baseline'
      ),
      'homepage_primary_cta_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Browse'
      ),
      'homepage_secondary_cta_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Search'
      ),
      'navigation_archive_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Archive'
      ),
      'navigation_search_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Search'
      ),
      'navigation_studio_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Studio'
      ),
      'footer_brand_note', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Fandom Harbor'
      )
    )
  );

  insert into public.site_copy_revisions (
    id,
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
    audit_log_id
  ) values (
    '93000000-0000-4000-8000-000000000001',
    1,
    0,
    null,
    'Fandom Harbor',
    'Concurrency baseline',
    'Browse',
    'Search',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor',
    '94000000-0000-4000-8000-000000000001',
    v_audit_log_id
  );

  insert into public.site_copy_state (scope, current_revision_id)
  values ('global', '93000000-0000-4000-8000-000000000001');
end;
$$;

create or replace function public.db01_test_concurrent_save(
  p_request_id uuid,
  p_title text,
  p_hold_lock boolean
)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.set_config(
    'request.jwt.claim.sub',
    '91000000-0000-4000-8000-000000000001',
    true
  );

  if p_hold_lock then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('fandom-harbor:site-copy:global', 0)
    );
    perform pg_catalog.pg_sleep(0.5);
  end if;

  return public.save_site_copy(
    1,
    '93000000-0000-4000-8000-000000000001',
    p_request_id,
    p_title,
    'Concurrency baseline',
    'Browse',
    'Search',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor',
    'Two requests use the same base'
  );
end;
$$;

select extensions.dblink_connect(
  'db01_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'db01_second',
  'dbname=postgres user=postgres'
);

select extensions.dblink_send_query(
  'db01_first',
  $query$
    select public.db01_test_concurrent_save(
      '94000000-0000-4000-8000-000000000010',
      'Concurrent winner',
      true
    )
  $query$
);

select pg_catalog.pg_sleep(0.1);

select extensions.dblink_send_query(
  'db01_second',
  $query$
    select public.db01_test_concurrent_save(
      '94000000-0000-4000-8000-000000000011',
      'Concurrent loser',
      false
    )
  $query$
);

create temporary table db01_concurrency_results (
  request_name text primary key,
  result jsonb not null
);

insert into db01_concurrency_results (request_name, result)
select 'first', result
from extensions.dblink_get_result('db01_first') as response(result jsonb);

insert into db01_concurrency_results (request_name, result)
select 'second', result
from extensions.dblink_get_result('db01_second') as response(result jsonb);

do $$
begin
  if (
    select result ->> 'status'
    from db01_concurrency_results
    where request_name = 'first'
  ) <> 'saved' then
    raise exception 'first same-base request did not save: %',
      (select result from db01_concurrency_results where request_name = 'first');
  end if;

  if (
    select result ->> 'status'
    from db01_concurrency_results
    where request_name = 'second'
  ) <> 'conflict' then
    raise exception 'second same-base request did not conflict: %',
      (select result from db01_concurrency_results where request_name = 'second');
  end if;

  if (select count(*) from public.site_copy_revisions) <> 2
    or (
      select count(*)
      from public.audit_logs
      where target_type = 'site_copy_revision'
        and target_id in (
          select id from public.site_copy_revisions
        )
    ) <> 2
    or (
      select r.version
      from public.site_copy_state s
      join public.site_copy_revisions r on r.id = s.current_revision_id
      where s.scope = 'global'
    ) <> 2
  then
    raise exception 'same-base concurrency produced a partial or extra write';
  end if;

  if exists (
    select 1
    from public.site_copy_revisions
    where request_id = '94000000-0000-4000-8000-000000000011'
  ) then
    raise exception 'conflicting request consumed its request id';
  end if;
end;
$$;

select extensions.dblink_disconnect('db01_first');
select extensions.dblink_disconnect('db01_second');

drop function public.db01_test_concurrent_save(uuid, text, boolean);
drop table db01_concurrency_results;

set session_replication_role = replica;
delete from public.site_copy_state where scope = 'global';
delete from public.site_copy_revisions;
delete from public.audit_logs
where target_type = 'site_copy_revision'
  and action in ('site_copy.initialized', 'site_copy.updated');
set session_replication_role = origin;

delete from public.role_grants
where user_id = '91000000-0000-4000-8000-000000000001';
delete from public.memberships
where user_id = '91000000-0000-4000-8000-000000000001';
delete from public.profiles
where user_id = '91000000-0000-4000-8000-000000000001';
delete from auth.users
where id = '91000000-0000-4000-8000-000000000001';

drop extension dblink;

do $$
begin
  if exists (select 1 from public.site_copy_state where scope = 'global')
    or exists (select 1 from public.site_copy_revisions)
    or exists (
      select 1
      from auth.users
      where id = '91000000-0000-4000-8000-000000000001'
    )
  then
    raise exception 'concurrency fixture cleanup failed';
  end if;
end;
$$;
