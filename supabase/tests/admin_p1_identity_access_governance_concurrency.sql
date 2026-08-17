\set ON_ERROR_STOP on

do $$
begin
  if not (
    select role.rolsuper
    from pg_catalog.pg_roles role
    where role.rolname = current_user
  ) then
    raise exception
      'run this local-only dblink concurrency test as supabase_admin';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_extension extension
    where extension.extname = 'dblink'
  ) then
    raise exception 'P1-02C concurrency requires disposable dblink state';
  end if;

  if (
    select pg_catalog.count(*)
    from public.site_copy_state state
    join public.site_copy_revisions revision
      on revision.id = state.current_revision_id
    where state.scope = 'global'
      and revision.version = 1
  ) <> 1 then
    raise exception 'P1-02C concurrency requires the local Site Copy baseline';
  end if;
end;
$$;

create temporary table p1_02c_concurrency_baseline (
  audit_count bigint not null,
  ledger_count bigint not null,
  profile_count bigint not null,
  membership_count bigint not null,
  role_grant_count bigint not null,
  site_copy_state jsonb not null,
  site_copy_revisions jsonb not null
);

insert into p1_02c_concurrency_baseline
select
  (select pg_catalog.count(*) from public.audit_logs),
  (select pg_catalog.count(*) from private.identity_access_request_ledger),
  (select pg_catalog.count(*) from public.profiles),
  (select pg_catalog.count(*) from public.memberships),
  (select pg_catalog.count(*) from public.role_grants),
  (
    select coalesce(
      pg_catalog.jsonb_agg(pg_catalog.to_jsonb(state) order by state.scope),
      '[]'::jsonb
    )
    from public.site_copy_state state
  ),
  (
    select coalesce(
      pg_catalog.jsonb_agg(
        pg_catalog.to_jsonb(revision) order by revision.version
      ),
      '[]'::jsonb
    )
    from public.site_copy_revisions revision
  );

create extension dblink with schema extensions;

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
)
values
  (
    'c1100000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'p1-02c-concurrency-admin@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    'c1100000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'p1-02c-concurrency-super@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    'c1100000-0000-4000-8000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'p1-02c-concurrency-role-target@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    'c1100000-0000-4000-8000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'p1-02c-concurrency-membership-target@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  );

insert into public.profiles (user_id)
values
  ('c1100000-0000-4000-8000-000000000001'),
  ('c1100000-0000-4000-8000-000000000002'),
  ('c1100000-0000-4000-8000-000000000010'),
  ('c1100000-0000-4000-8000-000000000011');

insert into public.memberships (user_id, state, admitted_at)
values
  (
    'c1100000-0000-4000-8000-000000000001',
    'active',
    statement_timestamp()
  ),
  (
    'c1100000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp()
  ),
  (
    'c1100000-0000-4000-8000-000000000010',
    'active',
    statement_timestamp()
  ),
  (
    'c1100000-0000-4000-8000-000000000011',
    'active',
    statement_timestamp()
  );

insert into public.role_grants (
  id,
  user_id,
  role,
  granted_by,
  grant_reason
)
values
  (
    'c2100000-0000-4000-8000-000000000001',
    'c1100000-0000-4000-8000-000000000001',
    'admin',
    null,
    'P1-02C concurrency Admin fixture'
  ),
  (
    'c2100000-0000-4000-8000-000000000002',
    'c1100000-0000-4000-8000-000000000002',
    'super_admin',
    null,
    'P1-02C concurrency Super Admin fixture'
  );

create table private.p1_02c_concurrency_inputs (
  case_name text primary key,
  state_token text not null
);

insert into private.p1_02c_concurrency_inputs (case_name, state_token)
values
  (
    'same_request',
    private.identity_access_state_token(
      'c1100000-0000-4000-8000-000000000010'
    )
  ),
  (
    'same_target',
    private.identity_access_state_token(
      'c1100000-0000-4000-8000-000000000011'
    )
  );

revoke all on table private.p1_02c_concurrency_inputs
  from public, anon, authenticated, service_role;
grant select on table private.p1_02c_concurrency_inputs to postgres;

create function public.p1_02c_test_concurrent_write(
  p_case_name text,
  p_variant text,
  p_hold_lock boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_state_token text;
begin
  perform pg_catalog.set_config(
    'request.jwt.claim.sub',
    'c1100000-0000-4000-8000-000000000001',
    true
  );

  select input.state_token
  into v_state_token
  from private.p1_02c_concurrency_inputs input
  where input.case_name = p_case_name;

  if p_case_name = 'same_request' then
    if p_hold_lock then
      perform pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
          'fandom-harbor:identity-access-request:' ||
            'c3100000-0000-4000-8000-000000000001',
          0
        )
      );
      perform pg_catalog.pg_sleep(0.5);
    end if;

    return public.grant_author_role_v2(
      'c3100000-0000-4000-8000-000000000001',
      'c1100000-0000-4000-8000-000000000010',
      v_state_token,
      'Concurrent same request Author grant'
    );
  end if;

  if p_hold_lock then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        'fandom-harbor:identity-access-governance',
        0
      )
    );
    perform pg_catalog.pg_sleep(0.5);
  end if;

  return public.set_ordinary_membership_state_v2(
    case
      when p_variant = 'first'
        then 'c3100000-0000-4000-8000-000000000002'::uuid
      else 'c3100000-0000-4000-8000-000000000003'::uuid
    end,
    'c1100000-0000-4000-8000-000000000011',
    case
      when p_variant = 'first' then 'suspended'
      else 'revoked'
    end::public.membership_state,
    v_state_token,
    case
      when p_variant = 'first' then 'Concurrent winner suspension'
      else 'Concurrent stale revocation'
    end
  );
end;
$$;

revoke all on function public.p1_02c_test_concurrent_write(
  text,
  text,
  boolean
) from public, anon, authenticated, service_role;
grant execute on function public.p1_02c_test_concurrent_write(
  text,
  text,
  boolean
) to postgres;

select extensions.dblink_connect(
  'p1_02c_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'p1_02c_second',
  'dbname=postgres user=postgres'
);

create temporary table p1_02c_concurrency_results (
  case_name text not null,
  request_name text not null,
  result jsonb not null,
  primary key (case_name, request_name)
);

select extensions.dblink_send_query(
  'p1_02c_first',
  $query$
    select public.p1_02c_test_concurrent_write(
      'same_request',
      'first',
      true
    )
  $query$
);
select pg_catalog.pg_sleep(0.1);
select extensions.dblink_send_query(
  'p1_02c_second',
  $query$
    select public.p1_02c_test_concurrent_write(
      'same_request',
      'second',
      false
    )
  $query$
);

insert into p1_02c_concurrency_results (case_name, request_name, result)
select 'same_request', 'first', response.result
from extensions.dblink_get_result('p1_02c_first')
  as response(result jsonb);
insert into p1_02c_concurrency_results (case_name, request_name, result)
select 'same_request', 'second', response.result
from extensions.dblink_get_result('p1_02c_second')
  as response(result jsonb);

do $$
begin
  if (
    select result ->> 'status'
    from p1_02c_concurrency_results
    where case_name = 'same_request' and request_name = 'first'
  ) <> 'saved'
    or (
      select result
      from p1_02c_concurrency_results
      where case_name = 'same_request' and request_name = 'first'
    ) is distinct from (
      select result
      from p1_02c_concurrency_results
      where case_name = 'same_request' and request_name = 'second'
    )
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
      where request_id = 'c3100000-0000-4000-8000-000000000001'
    ) <> 1
    or (
      select pg_catalog.count(*)
      from public.audit_logs
      where metadata ->> 'requestId' =
        'c3100000-0000-4000-8000-000000000001'
    ) <> 1
    or (
      select pg_catalog.count(*)
      from public.role_grants
      where user_id = 'c1100000-0000-4000-8000-000000000010'
        and role = 'author'
        and revoked_at is null
    ) <> 1
  then
    raise exception 'same-request concurrency was not exactly-once';
  end if;
end;
$$;

select extensions.dblink_disconnect('p1_02c_first');
select extensions.dblink_disconnect('p1_02c_second');
select extensions.dblink_connect(
  'p1_02c_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'p1_02c_second',
  'dbname=postgres user=postgres'
);

select extensions.dblink_send_query(
  'p1_02c_first',
  $query$
    select public.p1_02c_test_concurrent_write(
      'same_target',
      'first',
      true
    )
  $query$
);
select pg_catalog.pg_sleep(0.1);
select extensions.dblink_send_query(
  'p1_02c_second',
  $query$
    select public.p1_02c_test_concurrent_write(
      'same_target',
      'second',
      false
    )
  $query$
);

insert into p1_02c_concurrency_results (case_name, request_name, result)
select 'same_target', 'first', response.result
from extensions.dblink_get_result('p1_02c_first')
  as response(result jsonb);
insert into p1_02c_concurrency_results (case_name, request_name, result)
select 'same_target', 'second', response.result
from extensions.dblink_get_result('p1_02c_second')
  as response(result jsonb);

do $$
begin
  if (
    select result ->> 'status'
    from p1_02c_concurrency_results
    where case_name = 'same_target' and request_name = 'first'
  ) <> 'saved'
    or (
      select result ->> 'status'
      from p1_02c_concurrency_results
      where case_name = 'same_target' and request_name = 'second'
    ) <> 'conflict'
    or (
      select result ->> 'conflictReason'
      from p1_02c_concurrency_results
      where case_name = 'same_target' and request_name = 'second'
    ) <> 'expected_state_mismatch'
    or (
      select state
      from public.memberships
      where user_id = 'c1100000-0000-4000-8000-000000000011'
    ) <> 'suspended'
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
      where request_id in (
        'c3100000-0000-4000-8000-000000000002',
        'c3100000-0000-4000-8000-000000000003'
      )
    ) <> 2
    or (
      select pg_catalog.count(*)
      from public.audit_logs
      where metadata ->> 'requestId' in (
        'c3100000-0000-4000-8000-000000000002',
        'c3100000-0000-4000-8000-000000000003'
      )
    ) <> 1
  then
    raise exception 'same-target concurrency did not serialize Saved/Conflict';
  end if;
end;
$$;

select extensions.dblink_disconnect('p1_02c_first');
select extensions.dblink_disconnect('p1_02c_second');

drop function public.p1_02c_test_concurrent_write(text, text, boolean);
drop table private.p1_02c_concurrency_inputs;

set session_replication_role = replica;

delete from private.identity_access_request_ledger
where request_id in (
  'c3100000-0000-4000-8000-000000000001',
  'c3100000-0000-4000-8000-000000000002',
  'c3100000-0000-4000-8000-000000000003'
);

delete from public.audit_logs
where metadata ->> 'requestId' in (
  'c3100000-0000-4000-8000-000000000001',
  'c3100000-0000-4000-8000-000000000002',
  'c3100000-0000-4000-8000-000000000003'
);

delete from public.role_grants
where user_id in (
  'c1100000-0000-4000-8000-000000000001',
  'c1100000-0000-4000-8000-000000000002',
  'c1100000-0000-4000-8000-000000000010'
);
delete from public.memberships
where user_id::text like 'c1100000-0000-4000-8000-0000000000%';
delete from public.profiles
where user_id::text like 'c1100000-0000-4000-8000-0000000000%';
delete from auth.users
where id::text like 'c1100000-0000-4000-8000-0000000000%';

set session_replication_role = origin;

drop extension dblink;

do $$
declare
  v_role text;
  v_function regprocedure;
begin
  if (select pg_catalog.count(*) from public.audit_logs) <>
      (select audit_count from p1_02c_concurrency_baseline)
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> (select ledger_count from p1_02c_concurrency_baseline)
    or (select pg_catalog.count(*) from public.profiles) <>
      (select profile_count from p1_02c_concurrency_baseline)
    or (select pg_catalog.count(*) from public.memberships) <>
      (select membership_count from p1_02c_concurrency_baseline)
    or (select pg_catalog.count(*) from public.role_grants) <>
      (select role_grant_count from p1_02c_concurrency_baseline)
    or (
      select coalesce(
        pg_catalog.jsonb_agg(pg_catalog.to_jsonb(state) order by state.scope),
        '[]'::jsonb
      )
      from public.site_copy_state state
    ) is distinct from (
      select site_copy_state from p1_02c_concurrency_baseline
    )
    or (
      select coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.to_jsonb(revision) order by revision.version
        ),
        '[]'::jsonb
      )
      from public.site_copy_revisions revision
    ) is distinct from (
      select site_copy_revisions from p1_02c_concurrency_baseline
    )
  then
    raise exception 'P1-02C concurrency cleanup changed the local baseline';
  end if;

  foreach v_function in array array[
    'public.grant_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.revoke_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.set_ordinary_membership_state_v2(uuid,uuid,public.membership_state,text,text)'::regprocedure
  ] loop
    foreach v_role in array array[
      'public',
      'anon',
      'authenticated',
      'service_role'
    ] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% gained execute on %', v_role, v_function;
      end if;
    end loop;
  end loop;
end;
$$;
