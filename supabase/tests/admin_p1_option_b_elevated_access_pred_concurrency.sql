\set ON_ERROR_STOP on

do $$
begin
  if exists (
    select 1 from pg_catalog.pg_extension where extname = 'dblink'
  ) then
    raise exception 'Option B concurrency requires disposable dblink state';
  end if;
end;
$$;

create temporary table option_b_concurrency_baseline (
  audit_count bigint not null,
  ledger_count bigint not null,
  intent_count bigint not null,
  profile_count bigint not null,
  membership_count bigint not null,
  role_grant_count bigint not null
);

insert into option_b_concurrency_baseline
select
  (select pg_catalog.count(*) from public.audit_logs),
  (select pg_catalog.count(*) from private.identity_access_request_ledger),
  (select pg_catalog.count(*) from private.elevated_access_intents),
  (select pg_catalog.count(*) from public.profiles),
  (select pg_catalog.count(*) from public.memberships),
  (select pg_catalog.count(*) from public.role_grants);

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
    'a7010000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'a7-concurrent-actor@example.test',
    '',
    pg_catalog.statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    pg_catalog.statement_timestamp(),
    pg_catalog.statement_timestamp()
  ),
  (
    'a7010000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'a7-concurrent-target@example.test',
    '',
    pg_catalog.statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    pg_catalog.statement_timestamp(),
    pg_catalog.statement_timestamp()
  );

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
select
  user_id,
  user_id::text,
  user_id,
  pg_catalog.jsonb_build_object('sub', user_id::text),
  'email',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp()
from pg_catalog.unnest(array[
  'a7010000-0000-4000-8000-000000000001'::uuid,
  'a7010000-0000-4000-8000-000000000002'::uuid
]) fixture(user_id);

insert into public.profiles (user_id, registration_name)
values
  ('a7010000-0000-4000-8000-000000000001', 'Phase2RemoteInviter'),
  ('a7010000-0000-4000-8000-000000000002', 'akumie');

insert into public.memberships (user_id, state, admitted_at)
values
  (
    'a7010000-0000-4000-8000-000000000001',
    'active',
    pg_catalog.statement_timestamp()
  ),
  (
    'a7010000-0000-4000-8000-000000000002',
    'active',
    pg_catalog.statement_timestamp()
  );

insert into public.role_grants (
  id,
  user_id,
  role,
  granted_by,
  grant_reason
)
values (
  'a7110000-0000-4000-8000-000000000001',
  'a7010000-0000-4000-8000-000000000001',
  'super_admin',
  null,
  'Synthetic concurrent Option B actor'
);

insert into auth.mfa_factors (
  id,
  user_id,
  friendly_name,
  factor_type,
  status,
  created_at,
  updated_at
)
values
  ('a7210000-0000-4000-8000-000000000001', 'a7010000-0000-4000-8000-000000000001', 'actor-primary', 'totp', 'verified', pg_catalog.statement_timestamp(), pg_catalog.statement_timestamp()),
  ('a7210000-0000-4000-8000-000000000002', 'a7010000-0000-4000-8000-000000000001', 'actor-backup', 'totp', 'verified', pg_catalog.statement_timestamp(), pg_catalog.statement_timestamp()),
  ('a7210000-0000-4000-8000-000000000003', 'a7010000-0000-4000-8000-000000000002', 'target-primary', 'totp', 'verified', pg_catalog.statement_timestamp(), pg_catalog.statement_timestamp()),
  ('a7210000-0000-4000-8000-000000000004', 'a7010000-0000-4000-8000-000000000002', 'target-backup', 'totp', 'verified', pg_catalog.statement_timestamp(), pg_catalog.statement_timestamp());

insert into auth.sessions (
  id,
  user_id,
  created_at,
  updated_at,
  aal,
  not_after
)
values (
  'a7310000-0000-4000-8000-000000000001',
  'a7010000-0000-4000-8000-000000000001',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp(),
  'aal2',
  pg_catalog.statement_timestamp() + interval '1 hour'
);

select private.bind_elevated_commissioning_policy();

create function public.option_b_test_issue(
  p_request_id uuid,
  p_reason text,
  p_hold_lock boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token text;
  v_fingerprint text;
begin
  perform pg_catalog.set_config(
    'request.jwt.claims',
    pg_catalog.jsonb_build_object(
      'sub', 'a7010000-0000-4000-8000-000000000001',
      'aal', 'aal2',
      'session_id', 'a7310000-0000-4000-8000-000000000001',
      'amr', pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'method', 'totp',
          'timestamp', pg_catalog.floor(
            extract(epoch from pg_catalog.clock_timestamp())
          )::bigint - 30
        )
      )
    )::text,
    true
  );
  v_token := private.identity_access_state_token(
    'a7010000-0000-4000-8000-000000000002'
  );
  v_fingerprint := pg_catalog.encode(
    private.elevated_access_payload_fingerprint(
      'a7010000-0000-4000-8000-000000000001',
      'a7010000-0000-4000-8000-000000000002',
      v_token,
      p_reason
    ),
    'hex'
  );
  if p_hold_lock then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        'fandom-harbor:identity-access-request:' || p_request_id::text,
        0
      )
    );
    perform pg_catalog.pg_sleep(0.5);
  end if;
  return public.issue_grant_super_admin_intent_v1(
    p_request_id,
    v_token,
    p_reason,
    v_fingerprint
  );
end;
$$;

revoke all on function public.option_b_test_issue(uuid, text, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.option_b_test_issue(uuid, text, boolean)
  to postgres;

select extensions.dblink_connect(
  'a7_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'a7_second',
  'dbname=postgres user=postgres'
);

create temporary table option_b_concurrency_results (
  case_name text not null,
  request_name text not null,
  result jsonb not null,
  primary key (case_name, request_name)
);

select extensions.dblink_send_query(
  'a7_first',
  $query$
    select public.option_b_test_issue(
      'a7410000-0000-4000-8000-000000000001',
      'Concurrent exact Option B request',
      true
    )
  $query$
);
select pg_catalog.pg_sleep(0.1);
select extensions.dblink_send_query(
  'a7_second',
  $query$
    select public.option_b_test_issue(
      'a7410000-0000-4000-8000-000000000001',
      'Concurrent exact Option B request',
      false
    )
  $query$
);
insert into option_b_concurrency_results
select 'same_payload', 'first', response.result
from extensions.dblink_get_result('a7_first') as response(result jsonb);
insert into option_b_concurrency_results
select 'same_payload', 'second', response.result
from extensions.dblink_get_result('a7_second') as response(result jsonb);

do $$
begin
  if (
    select result ->> 'status'
    from option_b_concurrency_results
    where case_name = 'same_payload' and request_name = 'first'
  ) <> 'issued'
    or (
      select result ->> 'status'
      from option_b_concurrency_results
      where case_name = 'same_payload' and request_name = 'second'
    ) <> 'replayed'
    or (
      select result -> 'intent' ->> 'intentId'
      from option_b_concurrency_results
      where case_name = 'same_payload' and request_name = 'first'
    ) is distinct from (
      select result -> 'intent' ->> 'intentId'
      from option_b_concurrency_results
      where case_name = 'same_payload' and request_name = 'second'
    )
    or (
      select pg_catalog.count(*)
      from private.elevated_access_intents
      where request_id = 'a7410000-0000-4000-8000-000000000001'
    ) <> 1
  then
    raise exception 'same request/same payload did not create one claim';
  end if;
end;
$$;

select extensions.dblink_disconnect('a7_first');
select extensions.dblink_disconnect('a7_second');
select extensions.dblink_connect(
  'a7_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'a7_second',
  'dbname=postgres user=postgres'
);

select extensions.dblink_send_query(
  'a7_first',
  $query$
    select public.option_b_test_issue(
      'a7410000-0000-4000-8000-000000000002',
      'Concurrent canonical winner payload',
      true
    )
  $query$
);
select pg_catalog.pg_sleep(0.1);
select extensions.dblink_send_query(
  'a7_second',
  $query$
    select public.option_b_test_issue(
      'a7410000-0000-4000-8000-000000000002',
      'Concurrent conflicting loser payload',
      false
    )
  $query$
);
insert into option_b_concurrency_results
select 'different_payload', 'first', response.result
from extensions.dblink_get_result('a7_first') as response(result jsonb);
insert into option_b_concurrency_results
select 'different_payload', 'second', response.result
from extensions.dblink_get_result('a7_second') as response(result jsonb);

do $$
begin
  if (
    select result ->> 'status'
    from option_b_concurrency_results
    where case_name = 'different_payload' and request_name = 'first'
  ) <> 'issued'
    or (
      select result ->> 'status'
      from option_b_concurrency_results
      where case_name = 'different_payload' and request_name = 'second'
    ) <> 'request_id_conflict'
    or (
      select pg_catalog.count(*)
      from private.elevated_access_intents
      where request_id = 'a7410000-0000-4000-8000-000000000002'
    ) <> 1
  then
    raise exception 'same request/different payload did not reject loser';
  end if;
end;
$$;

select extensions.dblink_disconnect('a7_first');
select extensions.dblink_disconnect('a7_second');

select pg_catalog.pg_sleep(1.05);

create function public.option_b_test_confirm(p_hold_lock boolean)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_intent private.elevated_access_intents%rowtype;
begin
  perform pg_catalog.set_config(
    'request.jwt.claims',
    pg_catalog.jsonb_build_object(
      'sub', 'a7010000-0000-4000-8000-000000000001',
      'aal', 'aal2',
      'session_id', 'a7310000-0000-4000-8000-000000000001',
      'amr', pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'method', 'totp',
          'timestamp', pg_catalog.floor(
            extract(epoch from pg_catalog.clock_timestamp())
          )::bigint
        )
      )
    )::text,
    true
  );
  select * into strict v_intent
  from private.elevated_access_intents
  where request_id = 'a7410000-0000-4000-8000-000000000001';
  if p_hold_lock then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        'fandom-harbor:identity-access-request:' || v_intent.request_id::text,
        0
      )
    );
    perform pg_catalog.pg_sleep(0.5);
  end if;
  return public.confirm_grant_super_admin_intent_v1(
    v_intent.intent_id,
    v_intent.request_id,
    v_intent.expected_state_token,
    v_intent.normalized_reason,
    pg_catalog.encode(v_intent.payload_fingerprint, 'hex')
  );
end;
$$;

revoke all on function public.option_b_test_confirm(boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.option_b_test_confirm(boolean) to postgres;

select extensions.dblink_connect(
  'a7_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'a7_second',
  'dbname=postgres user=postgres'
);
select extensions.dblink_send_query(
  'a7_first',
  'select public.option_b_test_confirm(true)'
);
select pg_catalog.pg_sleep(0.1);
select extensions.dblink_send_query(
  'a7_second',
  'select public.option_b_test_confirm(false)'
);
insert into option_b_concurrency_results
select 'same_intent', 'first', response.result
from extensions.dblink_get_result('a7_first') as response(result jsonb);
insert into option_b_concurrency_results
select 'same_intent', 'second', response.result
from extensions.dblink_get_result('a7_second') as response(result jsonb);

do $$
begin
  if (
    select result
    from option_b_concurrency_results
    where case_name = 'same_intent' and request_name = 'first'
  ) is distinct from (
    select result
    from option_b_concurrency_results
    where case_name = 'same_intent' and request_name = 'second'
  )
    or (
      select result -> 'result' ->> 'status'
      from option_b_concurrency_results
      where case_name = 'same_intent' and request_name = 'first'
    ) <> 'saved'
    or (
      select pg_catalog.count(*) from public.role_grants
      where user_id = 'a7010000-0000-4000-8000-000000000002'
        and role = 'super_admin' and revoked_at is null
    ) <> 1
    or (
      select pg_catalog.count(*) from public.audit_logs
      where metadata ->> 'requestId' =
        'a7410000-0000-4000-8000-000000000001'
    ) <> 1
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
      where request_id = 'a7410000-0000-4000-8000-000000000001'
    ) <> 1
    or (
      select pg_catalog.count(*)
      from private.elevated_access_intents
      where request_id = 'a7410000-0000-4000-8000-000000000001'
        and terminal_status = 'saved'
    ) <> 1
  then
    raise exception 'concurrent same-intent consumption was not exactly once';
  end if;
end;
$$;

select extensions.dblink_disconnect('a7_first');
select extensions.dblink_disconnect('a7_second');

drop function public.option_b_test_confirm(boolean);
drop function public.option_b_test_issue(uuid, text, boolean);

set session_replication_role = replica;
delete from private.identity_access_request_ledger
where request_id::text like 'a7410000-0000-4000-8000-%';
delete from public.audit_logs
where metadata ->> 'requestId' like 'a7410000-0000-4000-8000-%';
delete from private.elevated_access_intents
where request_id::text like 'a7410000-0000-4000-8000-%';
delete from public.role_grants
where user_id::text like 'a7010000-0000-4000-8000-%';
delete from auth.mfa_factors
where user_id::text like 'a7010000-0000-4000-8000-%';
delete from auth.sessions
where user_id::text like 'a7010000-0000-4000-8000-%';
delete from public.memberships
where user_id::text like 'a7010000-0000-4000-8000-%';
delete from public.profiles
where user_id::text like 'a7010000-0000-4000-8000-%';
delete from auth.identities
where user_id::text like 'a7010000-0000-4000-8000-%';
delete from auth.users
where id::text like 'a7010000-0000-4000-8000-%';
update private.elevated_commissioning_policy
set actor_user_id = null,
    target_user_id = null,
    enabled = false,
    bound_at = null
where policy_id = 'initial-super-admin-commissioning';
set session_replication_role = origin;

drop extension dblink;

do $$
begin
  if (select pg_catalog.count(*) from public.audit_logs) <>
      (select audit_count from option_b_concurrency_baseline)
    or (select pg_catalog.count(*) from private.identity_access_request_ledger) <>
      (select ledger_count from option_b_concurrency_baseline)
    or (select pg_catalog.count(*) from private.elevated_access_intents) <>
      (select intent_count from option_b_concurrency_baseline)
    or (select pg_catalog.count(*) from public.profiles) <>
      (select profile_count from option_b_concurrency_baseline)
    or (select pg_catalog.count(*) from public.memberships) <>
      (select membership_count from option_b_concurrency_baseline)
    or (select pg_catalog.count(*) from public.role_grants) <>
      (select role_grant_count from option_b_concurrency_baseline)
  then
    raise exception 'Option B concurrency cleanup changed local baseline';
  end if;
end;
$$;
