\set ON_ERROR_STOP on

do $$
begin
  if not (
    select r.rolsuper
    from pg_catalog.pg_roles r
    where r.rolname = current_user
  ) then
    raise exception 'run this local-only concurrency test as a database superuser';
  end if;
end;
$$;

create extension if not exists dblink with schema extensions;

set session_replication_role = replica;
delete from public.audit_logs
where target_id in (
  'b1300000-0000-4000-8000-000000000001',
  'b1300000-0000-4000-8000-000000000002'
);
set session_replication_role = origin;
delete from private.invitation_reservations
where invitation_id = 'b1200000-0000-4000-8000-000000000001';
delete from private.login_name_claims
where login_name_key in ('b1concurrentone', 'b1concurrenttwo');
delete from private.registration_attempts
where invitation_id = 'b1200000-0000-4000-8000-000000000001';
delete from public.invitations
where id = 'b1200000-0000-4000-8000-000000000001';
delete from public.memberships
where user_id = 'b1200000-0000-4000-8000-000000000000';
delete from public.profiles
where user_id = 'b1200000-0000-4000-8000-000000000000';
delete from auth.users
where id = 'b1200000-0000-4000-8000-000000000000';

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
  'b1200000-0000-4000-8000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'b1-concurrency-inviter@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into public.profiles (user_id, registration_name)
values ('b1200000-0000-4000-8000-000000000000', 'B1ConcurrencyInviter');

insert into public.memberships (user_id, state, admitted_at)
values (
  'b1200000-0000-4000-8000-000000000000',
  'active',
  statement_timestamp()
);

insert into public.invitations (
  id,
  code_hash,
  inviter_user_id,
  max_uses,
  expires_at
) values (
  'b1200000-0000-4000-8000-000000000001',
  repeat('c', 64),
  'b1200000-0000-4000-8000-000000000000',
  1,
  statement_timestamp() + interval '1 day'
);

update private.registration_settings
set mode = 'email_required',
    updated_at = statement_timestamp()
where singleton;

create or replace function public.b1_test_prepare_last_seat(
  p_registration_name text,
  p_email text,
  p_hold_lock boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt record;
begin
  select * into v_attempt
  from private.prepare_email_registration_at(
    p_registration_name,
    p_email,
    repeat('c', 64),
    null,
    null,
    statement_timestamp()
  );

  if p_hold_lock then
    perform pg_catalog.pg_sleep(0.5);
  end if;

  return jsonb_build_object(
    'status', 'prepared',
    'attempt_id', v_attempt.attempt_id
  );
exception
  when others then
    return jsonb_build_object('status', 'rejected');
end;
$$;

revoke all on function public.b1_test_prepare_last_seat(text, text, boolean)
  from public, anon, authenticated;

select extensions.dblink_connect(
  'b1_first',
  'dbname=postgres user=postgres'
);
select extensions.dblink_connect(
  'b1_second',
  'dbname=postgres user=postgres'
);

select extensions.dblink_send_query(
  'b1_first',
  $query$
    select public.b1_test_prepare_last_seat(
      'B1ConcurrentOne',
      'concurrent.one@example.test',
      true
    )
  $query$
);

select pg_catalog.pg_sleep(0.1);

select extensions.dblink_send_query(
  'b1_second',
  $query$
    select public.b1_test_prepare_last_seat(
      'B1ConcurrentTwo',
      'concurrent.two@example.test',
      false
    )
  $query$
);

create temporary table b1_concurrency_results (
  request_name text primary key,
  result jsonb not null
);

insert into b1_concurrency_results (request_name, result)
select 'first', result
from extensions.dblink_get_result('b1_first') as response(result jsonb);

insert into b1_concurrency_results (request_name, result)
select 'second', result
from extensions.dblink_get_result('b1_second') as response(result jsonb);

do $$
begin
  if (
    select count(*)
    from b1_concurrency_results r
    where r.result ->> 'status' = 'prepared'
  ) <> 1 or (
    select count(*)
    from b1_concurrency_results r
    where r.result ->> 'status' = 'rejected'
  ) <> 1 then
    raise exception 'last-seat race did not produce one winner and one rejection: %',
      (select jsonb_agg(r.result) from b1_concurrency_results r);
  end if;

  if (
    select count(*)
    from private.invitation_reservations ir
    where ir.invitation_id = 'b1200000-0000-4000-8000-000000000001'
      and ir.status = 'reserved'
      and ir.expires_at > statement_timestamp()
  ) <> 1 then
    raise exception 'last-seat race oversold or lost the reservation';
  end if;

  if (
    select i.use_count
    from public.invitations i
    where i.id = 'b1200000-0000-4000-8000-000000000001'
  ) <> 0 then
    raise exception 'reservation race consumed the invitation early';
  end if;
end;
$$;

select extensions.dblink_disconnect('b1_first');
select extensions.dblink_disconnect('b1_second');

drop function public.b1_test_prepare_last_seat(text, text, boolean);
drop table b1_concurrency_results;

set session_replication_role = replica;
delete from public.audit_logs
where target_id in (
  select ra.id
  from private.registration_attempts ra
  where ra.invitation_id = 'b1200000-0000-4000-8000-000000000001'
);
set session_replication_role = origin;
delete from private.invitation_reservations
where invitation_id = 'b1200000-0000-4000-8000-000000000001';
delete from private.login_name_claims
where login_name_key in ('b1concurrentone', 'b1concurrenttwo');
delete from private.registration_attempts
where invitation_id = 'b1200000-0000-4000-8000-000000000001';
delete from public.invitations
where id = 'b1200000-0000-4000-8000-000000000001';
delete from public.memberships
where user_id = 'b1200000-0000-4000-8000-000000000000';
delete from public.profiles
where user_id = 'b1200000-0000-4000-8000-000000000000';
delete from auth.users
where id = 'b1200000-0000-4000-8000-000000000000';

update private.registration_settings
set mode = 'legacy',
    updated_at = statement_timestamp()
where singleton;
