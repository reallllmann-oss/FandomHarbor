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

  if (
    select count(*)
    from public.site_copy_state s
    join public.site_copy_revisions r on r.id = s.current_revision_id
    join public.audit_logs a on a.id = r.audit_log_id
    where s.scope = 'global'
      and r.id = 'dada0100-0000-4000-8000-000000000001'
      and r.version = 1
      and a.action = 'site_copy.initialized'
      and a.actor_user_id is null
  ) <> 1 then
    raise exception 'concurrency test requires the formal DATA-01 baseline';
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
    'dada0100-0000-4000-8000-000000000001',
    p_request_id,
    p_title,
    '一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。',
    '浏览公开作品',
    '查找作品与作者',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor · 私域作品归档',
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
update public.site_copy_state
set current_revision_id = 'dada0100-0000-4000-8000-000000000001'
where scope = 'global';
delete from public.site_copy_revisions
where version > 1;
delete from public.audit_logs
where target_type = 'site_copy_revision'
  and action = 'site_copy.updated';
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
  if (select count(*) from public.site_copy_state) <> 1
    or (select count(*) from public.site_copy_revisions) <> 1
    or (
      select count(*)
      from public.audit_logs
      where action = 'site_copy.initialized'
        and target_type = 'site_copy_revision'
    ) <> 1
    or (
      select current_revision_id
      from public.site_copy_state
      where scope = 'global'
    ) <> 'dada0100-0000-4000-8000-000000000001'
    or exists (
      select 1
      from auth.users
      where id = '91000000-0000-4000-8000-000000000001'
    )
  then
    raise exception 'concurrency cleanup did not preserve only the DATA-01 baseline';
  end if;
end;
$$;
