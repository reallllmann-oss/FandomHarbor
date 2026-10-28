\set ON_ERROR_STOP on

create temporary table b3_sa1_extension_state (
  dblink_preexisting boolean not null
);

insert into b3_sa1_extension_state
select exists (
  select 1 from pg_catalog.pg_extension where extname = 'dblink'
);

create extension if not exists dblink with schema extensions;

delete from auth.users
where id in (
  'b3a1c000-0000-4000-8000-000000000001',
  'b3a1c000-0000-4000-8000-000000000002'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
select
  fixture.user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  fixture.email,
  '',
  pg_catalog.statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp()
from (values
  ('b3a1c000-0000-4000-8000-000000000001'::uuid, 'b3-sa1-concurrency-1@example.test'),
  ('b3a1c000-0000-4000-8000-000000000002'::uuid, 'b3-sa1-concurrency-2@example.test')
) fixture(user_id, email);

insert into public.profiles (user_id, registration_name)
values
  ('b3a1c000-0000-4000-8000-000000000001', 'B3SA1ConcurrencyFixture1'),
  ('b3a1c000-0000-4000-8000-000000000002', 'B3SA1ConcurrencyFixture2');

select extensions.dblink_connect_u(
  'b3_sa1_first',
  'dbname=postgres'
);
select extensions.dblink_connect_u(
  'b3_sa1_second',
  'dbname=postgres'
);

select extensions.dblink_send_query(
  'b3_sa1_first',
  $query$
    insert into private.super_admin_email_binding_operations (
      target_user_id,
      operator_reference,
      expires_at
    ) values (
      'b3a1c000-0000-4000-8000-000000000002',
      'b3-sa1-concurrent-first',
      statement_timestamp() + interval '10 minutes'
    ) returning operation_id::text
  $query$
);

select extensions.dblink_send_query(
  'b3_sa1_second',
  $query$
    insert into private.super_admin_email_binding_operations (
      target_user_id,
      operator_reference,
      expires_at
    ) values (
      'b3a1c000-0000-4000-8000-000000000001',
      'b3-sa1-concurrent-second',
      statement_timestamp() + interval '10 minutes'
    ) returning operation_id::text
  $query$
);

select *
from extensions.dblink_get_result('b3_sa1_first', false)
  as first_result(operation_id text);
select *
from extensions.dblink_get_result('b3_sa1_second', false)
  as second_result(operation_id text);

do $$
begin
  if (
    select pg_catalog.count(*)
    from private.super_admin_email_binding_operations operation
    where operation.status = 'prepared'
  ) <> 1 then
    raise exception 'concurrent active-operation claim was not exclusive';
  end if;
end;
$$;

select extensions.dblink_disconnect('b3_sa1_first');
select extensions.dblink_disconnect('b3_sa1_second');

delete from private.super_admin_email_binding_operations
where target_user_id in (
  'b3a1c000-0000-4000-8000-000000000001',
  'b3a1c000-0000-4000-8000-000000000002'
);
delete from auth.users
where id in (
  'b3a1c000-0000-4000-8000-000000000001',
  'b3a1c000-0000-4000-8000-000000000002'
);

do $$
begin
  if not (select dblink_preexisting from b3_sa1_extension_state) then
    execute 'drop extension dblink';
  end if;
end;
$$;
