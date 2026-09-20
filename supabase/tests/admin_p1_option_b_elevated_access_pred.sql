\set ON_ERROR_STOP on

begin;

do $$
declare
  v_role text;
  v_function regprocedure;
begin
  if pg_catalog.encode(
    private.elevated_access_payload_fingerprint(
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      pg_catalog.repeat('a', 64),
      'Commission the exact recovery administrator'
    ),
    'hex'
  ) <> 'b86f6a8bf06cbde93379917111803d987a0c75a7a6917d23db98ceae5bc2a443' then
    raise exception 'runtime/database canonical fingerprint drift';
  end if;

  if (
    select pg_catalog.count(*)
    from pg_catalog.pg_proc procedure
    join pg_catalog.pg_namespace namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname in (
        'get_grant_super_admin_policy_v1',
        'issue_grant_super_admin_intent_v1',
        'get_grant_super_admin_intent_v1',
        'confirm_grant_super_admin_intent_v1'
      )
  ) <> 4 then
    raise exception 'Option B RPC name or overload drift';
  end if;

  foreach v_function in array array[
    'public.get_grant_super_admin_policy_v1()'::regprocedure,
    'public.issue_grant_super_admin_intent_v1(uuid,text,text,text)'::regprocedure,
    'public.get_grant_super_admin_intent_v1(uuid)'::regprocedure,
    'public.confirm_grant_super_admin_intent_v1(uuid,uuid,text,text,text)'::regprocedure
  ] loop
    if not (
      select procedure.prosecdef
        and procedure.proowner::regrole::text = 'postgres'
        and procedure.proconfig @> array['search_path=""']::text[]
      from pg_catalog.pg_proc procedure
      where procedure.oid = v_function
    ) then
      raise exception '% has unsafe catalog authority', v_function;
    end if;

    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'authenticated lacks exact Option B RPC execute: %',
        v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% unexpectedly executes %', v_role, v_function;
      end if;
    end loop;
  end loop;

  foreach v_role in array array[
    'public',
    'anon',
    'authenticated',
    'service_role'
  ] loop
    if pg_catalog.has_table_privilege(
      v_role,
      'private.elevated_access_intents',
      'select,insert,update,delete'
    ) or pg_catalog.has_table_privilege(
      v_role,
      'private.elevated_commissioning_policy',
      'select,insert,update,delete'
    ) then
      raise exception '% unexpectedly accesses private Option B tables', v_role;
    end if;

    if pg_catalog.has_function_privilege(
      v_role,
      'private.bind_elevated_commissioning_policy()',
      'execute'
    ) or pg_catalog.has_function_privilege(
      v_role,
      'private.current_elevated_auth_evidence(boolean)',
      'execute'
    ) or pg_catalog.has_function_privilege(
      v_role,
      'private.elevated_access_payload_fingerprint(uuid,uuid,text,text)',
      'execute'
    ) then
      raise exception '% unexpectedly executes private Option B helpers', v_role;
    end if;
  end loop;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid =
      'private.identity_access_request_ledger'::regclass
      and constraint_row.conname = 'identity_access_request_operation'
      and pg_catalog.pg_get_constraintdef(constraint_row.oid)
        like '%grant_super_admin%'
  ) then
    raise exception 'shared ledger does not accept grant_super_admin';
  end if;
end;
$$;

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
select
  fixture.user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  fixture.label || '@example.test',
  '',
  pg_catalog.statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp()
from (
  values
    ('a7000000-0000-4000-8000-000000000001'::uuid, 'option-b-actor'),
    ('a7000000-0000-4000-8000-000000000002'::uuid, 'option-b-target'),
    ('a7000000-0000-4000-8000-000000000003'::uuid, 'option-b-reader'),
    ('a7000000-0000-4000-8000-000000000004'::uuid, 'option-b-author'),
    ('a7000000-0000-4000-8000-000000000005'::uuid, 'option-b-admin'),
    ('a7000000-0000-4000-8000-000000000006'::uuid, 'option-b-ordinary')
) fixture(user_id, label);

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
  fixture.user_id,
  fixture.user_id::text,
  fixture.user_id,
  pg_catalog.jsonb_build_object('sub', fixture.user_id::text),
  'email',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp()
from pg_catalog.unnest(array[
  'a7000000-0000-4000-8000-000000000001'::uuid,
  'a7000000-0000-4000-8000-000000000002'::uuid,
  'a7000000-0000-4000-8000-000000000003'::uuid,
  'a7000000-0000-4000-8000-000000000004'::uuid,
  'a7000000-0000-4000-8000-000000000005'::uuid,
  'a7000000-0000-4000-8000-000000000006'::uuid
]) fixture(user_id);

insert into public.profiles (user_id, registration_name)
values
  ('a7000000-0000-4000-8000-000000000001', 'Phase2RemoteInviter'),
  ('a7000000-0000-4000-8000-000000000002', 'akumie'),
  ('a7000000-0000-4000-8000-000000000003', 'A7SyntheticReader'),
  ('a7000000-0000-4000-8000-000000000004', 'A7SyntheticAuthor'),
  ('a7000000-0000-4000-8000-000000000005', 'A7SyntheticAdmin'),
  ('a7000000-0000-4000-8000-000000000006', 'A7SyntheticOrdinary');

insert into public.memberships (user_id, state, admitted_at)
select user_id, 'active', pg_catalog.statement_timestamp()
from pg_catalog.unnest(array[
  'a7000000-0000-4000-8000-000000000001'::uuid,
  'a7000000-0000-4000-8000-000000000002'::uuid,
  'a7000000-0000-4000-8000-000000000003'::uuid,
  'a7000000-0000-4000-8000-000000000004'::uuid,
  'a7000000-0000-4000-8000-000000000005'::uuid,
  'a7000000-0000-4000-8000-000000000006'::uuid
]) fixture(user_id);

insert into public.role_grants (id, user_id, role, granted_by, grant_reason)
values
  (
    'a7100000-0000-4000-8000-000000000001',
    'a7000000-0000-4000-8000-000000000001',
    'super_admin',
    null,
    'Synthetic Option B actor'
  ),
  (
    'a7100000-0000-4000-8000-000000000004',
    'a7000000-0000-4000-8000-000000000004',
    'author',
    null,
    'Synthetic Option B Author denial fixture'
  ),
  (
    'a7100000-0000-4000-8000-000000000005',
    'a7000000-0000-4000-8000-000000000005',
    'admin',
    null,
    'Synthetic Option B Admin denial fixture'
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
select
  fixture.factor_id,
  fixture.user_id,
  fixture.label,
  'totp',
  'verified',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp()
from (
  values
    ('a7200000-0000-4000-8000-000000000001'::uuid, 'a7000000-0000-4000-8000-000000000001'::uuid, 'actor-primary'),
    ('a7200000-0000-4000-8000-000000000002'::uuid, 'a7000000-0000-4000-8000-000000000001'::uuid, 'actor-backup'),
    ('a7200000-0000-4000-8000-000000000003'::uuid, 'a7000000-0000-4000-8000-000000000002'::uuid, 'target-primary'),
    ('a7200000-0000-4000-8000-000000000004'::uuid, 'a7000000-0000-4000-8000-000000000002'::uuid, 'target-backup')
) fixture(factor_id, user_id, label);

insert into auth.sessions (
  id,
  user_id,
  created_at,
  updated_at,
  aal,
  not_after
)
values
  (
    'a7300000-0000-4000-8000-000000000001',
    'a7000000-0000-4000-8000-000000000001',
    pg_catalog.statement_timestamp(),
    pg_catalog.statement_timestamp(),
    'aal2',
    pg_catalog.statement_timestamp() + interval '1 hour'
  ),
  (
    'a7300000-0000-4000-8000-000000000002',
    'a7000000-0000-4000-8000-000000000001',
    pg_catalog.statement_timestamp(),
    pg_catalog.statement_timestamp(),
    'aal2',
    pg_catalog.statement_timestamp() + interval '1 hour'
  );

select private.bind_elevated_commissioning_policy();

do $$
declare
  v_actor uuid;
  v_target uuid;
begin
  select policy.actor_user_id, policy.target_user_id
  into v_actor, v_target
  from private.elevated_commissioning_policy policy
  where policy.policy_id = 'initial-super-admin-commissioning'
    and policy.enabled = true;
  if v_actor <> 'a7000000-0000-4000-8000-000000000001'
    or v_target <> 'a7000000-0000-4000-8000-000000000002'
  then
    raise exception 'policy did not bind registration names to stable IDs';
  end if;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform public.get_grant_super_admin_policy_v1();
    raise exception 'anon executed Option B RPC';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
reset role;

do $$
declare
  v_denied_user uuid;
begin
  foreach v_denied_user in array array[
    'a7000000-0000-4000-8000-000000000003'::uuid,
    'a7000000-0000-4000-8000-000000000004'::uuid,
    'a7000000-0000-4000-8000-000000000005'::uuid
  ] loop
    perform pg_catalog.set_config(
      'request.jwt.claims',
      pg_catalog.jsonb_build_object('sub', v_denied_user::text)::text,
      true
    );
    begin
      perform public.get_grant_super_admin_policy_v1();
      raise exception 'non-policy actor entered Option B path: %', v_denied_user;
    exception
      when insufficient_privilege then null;
    end;
  end loop;
end;
$$;

create temporary table option_b_inputs (
  expected_state_token text not null,
  payload_fingerprint text not null
);

insert into option_b_inputs
select
  private.identity_access_state_token(
    'a7000000-0000-4000-8000-000000000002'
  ),
  pg_catalog.encode(
    private.elevated_access_payload_fingerprint(
      'a7000000-0000-4000-8000-000000000001',
      'a7000000-0000-4000-8000-000000000002',
      private.identity_access_state_token(
        'a7000000-0000-4000-8000-000000000002'
      ),
      'Synthetic Option B commissioning'
    ),
    'hex'
  );

select pg_catalog.set_config(
  'request.jwt.claims',
  pg_catalog.jsonb_build_object(
    'sub', 'a7000000-0000-4000-8000-000000000001',
    'aal', 'aal2',
    'session_id', 'a7300000-0000-4000-8000-000000000001',
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

create temporary table option_b_intents (
  case_name text primary key,
  intent_id uuid not null,
  request_id uuid not null
);

insert into option_b_intents
select
  fixture.case_name,
  (result.response -> 'intent' ->> 'intentId')::uuid,
  fixture.request_id
from (
  values
    ('audit_failure', 'a7400000-0000-4000-8000-000000000001'::uuid),
    ('grant_failure', 'a7400000-0000-4000-8000-000000000002'::uuid),
    ('ledger_failure', 'a7400000-0000-4000-8000-000000000003'::uuid),
    ('authorization_revoked', 'a7400000-0000-4000-8000-000000000004'::uuid),
    ('session_invalidated', 'a7400000-0000-4000-8000-000000000005'::uuid),
    ('session_absent', 'a7400000-0000-4000-8000-000000000009'::uuid),
    ('session_expired', 'a7400000-0000-4000-8000-00000000000a'::uuid),
    ('saved', 'a7400000-0000-4000-8000-000000000006'::uuid),
    ('stale_state', 'a7400000-0000-4000-8000-000000000007'::uuid),
    ('namespace_collision', 'a7400000-0000-4000-8000-000000000008'::uuid)
) fixture(case_name, request_id)
cross join lateral (
  select public.issue_grant_super_admin_intent_v1(
    fixture.request_id,
    inputs.expected_state_token,
    'Synthetic Option B commissioning',
    inputs.payload_fingerprint
  ) as response
  from option_b_inputs inputs
) result;

do $$
declare
  v_state_token text := private.identity_access_state_token(
    'a7000000-0000-4000-8000-000000000006'
  );
begin
  begin
    perform public.grant_author_role_v2(
      'a7400000-0000-4000-8000-000000000008',
      'a7000000-0000-4000-8000-000000000006',
      v_state_token,
      'Ordinary request cannot steal elevated requestId'
    );
    raise exception 'ordinary mutation stole elevated request namespace';
  exception
    when invalid_parameter_value then
      null;
  end;
end;
$$;

update public.memberships
set state = 'suspended',
    suspended_at = pg_catalog.statement_timestamp(),
    updated_at = pg_catalog.statement_timestamp()
where user_id = 'a7000000-0000-4000-8000-000000000001';

do $$
declare
  v_intent_id uuid := (
    select intent_id from option_b_intents
    where case_name = 'authorization_revoked'
  );
  v_request_id uuid := (
    select request_id from option_b_intents
    where case_name = 'authorization_revoked'
  );
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_inputs from option_b_inputs;
  begin
    perform public.confirm_grant_super_admin_intent_v1(
      v_intent_id,
      v_request_id,
      v_inputs.expected_state_token,
      'Synthetic Option B commissioning',
      v_inputs.payload_fingerprint
    );
    raise exception 'revoked actor authorization was accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

update public.memberships
set state = 'active',
    suspended_at = null,
    updated_at = pg_catalog.statement_timestamp()
where user_id = 'a7000000-0000-4000-8000-000000000001';

delete from auth.sessions
where id = 'a7300000-0000-4000-8000-000000000001';

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_intent from option_b_intents where case_name = 'session_absent';
  select * into v_inputs from option_b_inputs;
  begin
    perform public.confirm_grant_super_admin_intent_v1(
      v_intent.intent_id,
      v_intent.request_id,
      v_inputs.expected_state_token,
      'Synthetic Option B commissioning',
      v_inputs.payload_fingerprint
    );
    raise exception 'absent Session was accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

insert into auth.sessions (
  id,
  user_id,
  created_at,
  updated_at,
  aal,
  not_after
)
values (
  'a7300000-0000-4000-8000-000000000001',
  'a7000000-0000-4000-8000-000000000001',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp(),
  'aal2',
  pg_catalog.statement_timestamp() - interval '1 second'
);

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_intent from option_b_intents where case_name = 'session_expired';
  select * into v_inputs from option_b_inputs;
  begin
    perform public.confirm_grant_super_admin_intent_v1(
      v_intent.intent_id,
      v_intent.request_id,
      v_inputs.expected_state_token,
      'Synthetic Option B commissioning',
      v_inputs.payload_fingerprint
    );
    raise exception 'expired Session was accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

update auth.sessions
set not_after = pg_catalog.statement_timestamp() + interval '1 hour',
    updated_at = pg_catalog.statement_timestamp()
where id = 'a7300000-0000-4000-8000-000000000001';

select pg_catalog.set_config(
  'request.jwt.claims',
  pg_catalog.jsonb_build_object(
    'sub', 'a7000000-0000-4000-8000-000000000001',
    'aal', 'aal2',
    'session_id', 'a7300000-0000-4000-8000-000000000002',
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

do $$
declare
  v_result jsonb;
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_inputs from option_b_inputs;
  select public.confirm_grant_super_admin_intent_v1(
    intent.intent_id,
    intent.request_id,
    v_inputs.expected_state_token,
    'Synthetic Option B commissioning',
    v_inputs.payload_fingerprint
  ) into v_result
  from option_b_intents intent
  where intent.case_name = 'session_invalidated';
  if v_result ->> 'status' <> 'intent_mismatch' then
    raise exception 'different Session was not rejected: %', v_result;
  end if;
end;
$$;

select pg_catalog.set_config(
  'request.jwt.claims',
  pg_catalog.jsonb_build_object(
    'sub', 'a7000000-0000-4000-8000-000000000001',
    'aal', 'aal2',
    'session_id', 'a7300000-0000-4000-8000-000000000001',
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
select pg_catalog.pg_sleep(1.05);
select pg_catalog.set_config(
  'request.jwt.claims',
  pg_catalog.jsonb_set(
    auth.jwt(),
    '{amr,0,timestamp}',
    pg_catalog.to_jsonb(
      pg_catalog.floor(extract(epoch from pg_catalog.clock_timestamp()))::bigint
    )
  )::text,
  true
);

create function pg_temp.option_b_fail_audit()
returns trigger language plpgsql as $$
begin
  if new.action = 'role.granted'
    and new.metadata ->> 'operation' = 'grant_super_admin'
  then
    raise exception 'OPTION_B_TEST_AUDIT_FAILURE';
  end if;
  return new;
end;
$$;
create trigger option_b_test_audit_failure
before insert on public.audit_logs
for each row execute function pg_temp.option_b_fail_audit();

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_intent from option_b_intents where case_name = 'audit_failure';
  select * into v_inputs from option_b_inputs;
  begin
    perform public.confirm_grant_super_admin_intent_v1(
      v_intent.intent_id,
      v_intent.request_id,
      v_inputs.expected_state_token,
      'Synthetic Option B commissioning',
      v_inputs.payload_fingerprint
    );
    raise exception 'audit failure injection did not fail';
  exception when raise_exception then
    if sqlerrm <> 'OPTION_B_TEST_AUDIT_FAILURE' then raise; end if;
  end;
  if exists (
    select 1 from public.role_grants
    where user_id = 'a7000000-0000-4000-8000-000000000002'
      and role = 'super_admin' and revoked_at is null
  ) or exists (
    select 1 from private.identity_access_request_ledger
    where request_id = v_intent.request_id
  ) or exists (
    select 1 from private.elevated_access_intents
    where intent_id = v_intent.intent_id and consumed_at is not null
  ) then
    raise exception 'audit failure did not roll back grant/ledger/consume';
  end if;
end;
$$;
drop trigger option_b_test_audit_failure on public.audit_logs;

create function pg_temp.option_b_fail_grant()
returns trigger language plpgsql as $$
begin
  if new.role = 'super_admin' then
    raise exception 'OPTION_B_TEST_GRANT_FAILURE';
  end if;
  return new;
end;
$$;
create trigger option_b_test_grant_failure
before insert on public.role_grants
for each row execute function pg_temp.option_b_fail_grant();

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_intent from option_b_intents where case_name = 'grant_failure';
  select * into v_inputs from option_b_inputs;
  begin
    perform public.confirm_grant_super_admin_intent_v1(
      v_intent.intent_id,
      v_intent.request_id,
      v_inputs.expected_state_token,
      'Synthetic Option B commissioning',
      v_inputs.payload_fingerprint
    );
    raise exception 'grant failure injection did not fail';
  exception when raise_exception then
    if sqlerrm <> 'OPTION_B_TEST_GRANT_FAILURE' then raise; end if;
  end;
  if exists (
    select 1 from public.audit_logs
    where metadata ->> 'requestId' = v_intent.request_id::text
  ) or exists (
    select 1 from private.identity_access_request_ledger
    where request_id = v_intent.request_id
  ) or exists (
    select 1 from private.elevated_access_intents
    where intent_id = v_intent.intent_id and consumed_at is not null
  ) then
    raise exception 'grant failure did not roll back audit/ledger/consume';
  end if;
end;
$$;
drop trigger option_b_test_grant_failure on public.role_grants;

create function pg_temp.option_b_fail_ledger()
returns trigger language plpgsql as $$
begin
  if new.operation = 'grant_super_admin' then
    raise exception 'OPTION_B_TEST_LEDGER_FAILURE';
  end if;
  return new;
end;
$$;
create trigger option_b_test_ledger_failure
before insert on private.identity_access_request_ledger
for each row execute function pg_temp.option_b_fail_ledger();

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
begin
  select * into v_intent from option_b_intents where case_name = 'ledger_failure';
  select * into v_inputs from option_b_inputs;
  begin
    perform public.confirm_grant_super_admin_intent_v1(
      v_intent.intent_id,
      v_intent.request_id,
      v_inputs.expected_state_token,
      'Synthetic Option B commissioning',
      v_inputs.payload_fingerprint
    );
    raise exception 'ledger failure injection did not fail';
  exception when raise_exception then
    if sqlerrm <> 'OPTION_B_TEST_LEDGER_FAILURE' then raise; end if;
  end;
  if exists (
    select 1 from public.role_grants
    where user_id = 'a7000000-0000-4000-8000-000000000002'
      and role = 'super_admin' and revoked_at is null
  ) or exists (
    select 1 from public.audit_logs
    where metadata ->> 'requestId' = v_intent.request_id::text
  ) or exists (
    select 1 from private.elevated_access_intents
    where intent_id = v_intent.intent_id and consumed_at is not null
  ) then
    raise exception 'ledger failure did not roll back grant/audit/consume';
  end if;
end;
$$;
drop trigger option_b_test_ledger_failure on private.identity_access_request_ledger;

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
  v_saved jsonb;
  v_replay jsonb;
  v_mismatch jsonb;
begin
  select * into v_intent from option_b_intents where case_name = 'saved';
  select * into v_inputs from option_b_inputs;
  v_saved := public.confirm_grant_super_admin_intent_v1(
    v_intent.intent_id,
    v_intent.request_id,
    v_inputs.expected_state_token,
    'Synthetic Option B commissioning',
    v_inputs.payload_fingerprint
  );
  v_replay := public.confirm_grant_super_admin_intent_v1(
    v_intent.intent_id,
    v_intent.request_id,
    v_inputs.expected_state_token,
    'Synthetic Option B commissioning',
    v_inputs.payload_fingerprint
  );
  v_mismatch := public.confirm_grant_super_admin_intent_v1(
    v_intent.intent_id,
    v_intent.request_id,
    v_inputs.expected_state_token,
    'Different replay payload is rejected',
    pg_catalog.encode(
      private.elevated_access_payload_fingerprint(
        'a7000000-0000-4000-8000-000000000001',
        'a7000000-0000-4000-8000-000000000002',
        v_inputs.expected_state_token,
        'Different replay payload is rejected'
      ),
      'hex'
    )
  );

  if v_saved ->> 'status' <> 'result'
    or v_saved -> 'result' ->> 'status' <> 'saved'
    or v_replay is distinct from v_saved
    or v_mismatch ->> 'status' <> 'intent_mismatch'
    or (
      select pg_catalog.count(*) from public.role_grants
      where user_id = 'a7000000-0000-4000-8000-000000000002'
        and role = 'super_admin' and revoked_at is null
    ) <> 1
    or (
      select pg_catalog.count(*) from public.audit_logs
      where metadata ->> 'requestId' = v_intent.request_id::text
    ) <> 1
    or (
      select pg_catalog.count(*) from private.identity_access_request_ledger
      where request_id = v_intent.request_id
    ) <> 1
    or not exists (
      select 1 from private.elevated_access_intents
      where intent_id = v_intent.intent_id
        and terminal_status = 'saved'
        and consumed_at is not null
    )
  then
    raise exception 'saved/retry/replay atomic contract failed: %, %, %',
      v_saved, v_replay, v_mismatch;
  end if;
end;
$$;

select pg_catalog.pg_sleep(1.05);
select pg_catalog.set_config(
  'request.jwt.claims',
  pg_catalog.jsonb_set(
    auth.jwt(),
    '{amr,0,timestamp}',
    pg_catalog.to_jsonb(
      pg_catalog.floor(extract(epoch from pg_catalog.clock_timestamp()))::bigint
    )
  )::text,
  true
);

do $$
declare
  v_intent option_b_intents%rowtype;
  v_inputs option_b_inputs%rowtype;
  v_conflict jsonb;
begin
  select * into v_intent from option_b_intents where case_name = 'stale_state';
  select * into v_inputs from option_b_inputs;
  v_conflict := public.confirm_grant_super_admin_intent_v1(
    v_intent.intent_id,
    v_intent.request_id,
    v_inputs.expected_state_token,
    'Synthetic Option B commissioning',
    v_inputs.payload_fingerprint
  );
  if v_conflict ->> 'status' <> 'result'
    or v_conflict -> 'result' ->> 'status' <> 'conflict'
    or exists (
      select 1 from public.audit_logs
      where metadata ->> 'requestId' = v_intent.request_id::text
    )
  then
    raise exception 'stale expected-state did not return zero-audit Conflict: %',
      v_conflict;
  end if;
end;
$$;

do $$
begin
  if (
    select pg_catalog.count(*)
    from public.role_grants
    where user_id = 'a7000000-0000-4000-8000-000000000002'
      and role = 'super_admin'
      and revoked_at is null
  ) <> 1 then
    raise exception 'synthetic E2E did not produce exactly one grant';
  end if;

  begin
    perform public.grant_role(
      'a7000000-0000-4000-8000-000000000006',
      'admin',
      'Legacy elevated path must stay closed'
    );
    raise exception 'legacy grant_role elevated bypass remains open';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.set_membership_state(
      'a7000000-0000-4000-8000-000000000002',
      'suspended',
      'Legacy elevated target membership must stay closed'
    );
    raise exception 'legacy elevated membership bypass remains open';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
