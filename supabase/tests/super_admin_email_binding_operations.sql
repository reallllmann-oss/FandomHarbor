\set ON_ERROR_STOP on

begin;

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
  fixture.label || '@example.test',
  '',
  pg_catalog.statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp()
from (
  values
    ('b3a10000-0000-4000-8000-000000000001'::uuid, 'phase2'),
    ('b3a10000-0000-4000-8000-000000000002'::uuid, 'akumie'),
    ('b3a10000-0000-4000-8000-000000000003'::uuid, 'third-admin')
) fixture(user_id, label);

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, created_at, updated_at
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
  'b3a10000-0000-4000-8000-000000000001'::uuid,
  'b3a10000-0000-4000-8000-000000000002'::uuid,
  'b3a10000-0000-4000-8000-000000000003'::uuid
]) fixture(user_id);

insert into public.profiles (user_id, registration_name)
values
  ('b3a10000-0000-4000-8000-000000000001', 'Phase2RemoteInviter'),
  ('b3a10000-0000-4000-8000-000000000002', 'akumie'),
  ('b3a10000-0000-4000-8000-000000000003', 'B3ThirdSuperAdmin');

insert into public.memberships (user_id, state, admitted_at)
select user_id, 'active', pg_catalog.statement_timestamp()
from pg_catalog.unnest(array[
  'b3a10000-0000-4000-8000-000000000001'::uuid,
  'b3a10000-0000-4000-8000-000000000002'::uuid,
  'b3a10000-0000-4000-8000-000000000003'::uuid
]) fixture(user_id);

insert into public.role_grants (id, user_id, role, grant_reason)
values
  (
    'b3a11000-0000-4000-8000-000000000001',
    'b3a10000-0000-4000-8000-000000000001',
    'super_admin',
    'B3-SA1 exact actor fixture'
  ),
  (
    'b3a11000-0000-4000-8000-000000000003',
    'b3a10000-0000-4000-8000-000000000003',
    'super_admin',
    'B3-SA1 non-allowlisted fixture'
  );

insert into auth.mfa_factors (
  id, user_id, friendly_name, factor_type, status, created_at, updated_at
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
    ('b3a12000-0000-4000-8000-000000000001'::uuid, 'b3a10000-0000-4000-8000-000000000001'::uuid, 'phase2-primary'),
    ('b3a12000-0000-4000-8000-000000000002'::uuid, 'b3a10000-0000-4000-8000-000000000001'::uuid, 'phase2-backup'),
    ('b3a12000-0000-4000-8000-000000000003'::uuid, 'b3a10000-0000-4000-8000-000000000002'::uuid, 'akumie-primary'),
    ('b3a12000-0000-4000-8000-000000000004'::uuid, 'b3a10000-0000-4000-8000-000000000002'::uuid, 'akumie-backup'),
    ('b3a12000-0000-4000-8000-000000000005'::uuid, 'b3a10000-0000-4000-8000-000000000003'::uuid, 'third-primary'),
    ('b3a12000-0000-4000-8000-000000000006'::uuid, 'b3a10000-0000-4000-8000-000000000003'::uuid, 'third-backup')
) fixture(factor_id, user_id, label);

select private.bind_elevated_commissioning_policy();

insert into public.role_grants (id, user_id, role, grant_reason)
values (
  'b3a11000-0000-4000-8000-000000000002',
  'b3a10000-0000-4000-8000-000000000002',
  'super_admin',
  'B3-SA1 exact target fixture after policy binding'
);

insert into auth.sessions (id, user_id, created_at, updated_at, aal, not_after)
values
  (
    'b3a13000-0000-4000-8000-000000000001',
    'b3a10000-0000-4000-8000-000000000002',
    pg_catalog.statement_timestamp(),
    pg_catalog.statement_timestamp(),
    'aal2',
    pg_catalog.statement_timestamp() + interval '1 hour'
  ),
  (
    'b3a13000-0000-4000-8000-000000000002',
    'b3a10000-0000-4000-8000-000000000002',
    pg_catalog.statement_timestamp(),
    pg_catalog.statement_timestamp(),
    'aal1',
    pg_catalog.statement_timestamp() + interval '1 hour'
  );

create temporary table b3_sa1_operations (
  label text primary key,
  operation_id uuid not null
);

insert into b3_sa1_operations
select
  'akumie',
  (public.prepare_super_admin_email_binding_v1(
    'b3a10000-0000-4000-8000-000000000002',
    900,
    'po-approved:b3-sa1'
  ) ->> 'operationId')::uuid;

do $$
begin
  begin
    perform public.prepare_super_admin_email_binding_v1(
      'b3a10000-0000-4000-8000-000000000003',
      900,
      'po-approved:b3-sa1'
    );
    raise exception 'third Super Admin unexpectedly entered B3-SA';
  exception when insufficient_privilege then
    if sqlerrm <> 'INVALID_TARGET' then raise; end if;
  end;

  begin
    perform public.prepare_super_admin_email_binding_v1(
      'b3a10000-0000-4000-8000-000000000002',
      900,
      'po-approved:b3-sa1-duplicate'
    );
    raise exception 'second active operation unexpectedly succeeded';
  exception when unique_violation then
    if sqlerrm <> 'ACTIVE_OPERATION_EXISTS' then raise; end if;
  end;

  begin
    perform public.prepare_super_admin_email_binding_v1(
      'b3a10000-0000-4000-8000-000000000001',
      900,
      'po-approved:b3-sa1-global-conflict'
    );
    raise exception 'second target active operation unexpectedly succeeded';
  exception when unique_violation then
    if sqlerrm <> 'ACTIVE_OPERATION_EXISTS' then raise; end if;
  end;
end;
$$;

do $$
declare
  v_operation_id uuid := (
    select operation_id from b3_sa1_operations where label = 'akumie'
  );
begin
  begin
    perform public.bind_super_admin_email_binding_v1(
      v_operation_id,
      'b3a10000-0000-4000-8000-000000000002',
      'b3a13000-0000-4000-8000-000000000002',
      'aal1',
      pg_catalog.statement_timestamp(),
      repeat('a', 64),
      pg_catalog.statement_timestamp()
    );
    raise exception 'AAL1 binding unexpectedly succeeded';
  exception when insufficient_privilege then
    if sqlerrm <> 'FRESH_REAUTH_REQUIRED' then raise; end if;
  end;

  begin
    perform public.bind_super_admin_email_binding_v1(
      v_operation_id,
      'b3a10000-0000-4000-8000-000000000002',
      'b3a13000-0000-4000-8000-000000000001',
      'aal2',
      pg_catalog.statement_timestamp() - interval '6 minutes',
      repeat('a', 64),
      pg_catalog.statement_timestamp()
    );
    raise exception 'stale password evidence unexpectedly succeeded';
  exception when insufficient_privilege then
    if sqlerrm <> 'FRESH_REAUTH_REQUIRED' then raise; end if;
  end;
end;
$$;

select public.bind_super_admin_email_binding_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'b3a10000-0000-4000-8000-000000000002',
  'b3a13000-0000-4000-8000-000000000001',
  'aal2',
  pg_catalog.statement_timestamp(),
  repeat('a', 64),
  pg_catalog.statement_timestamp()
);

do $$
declare
  v_operation_id uuid := (
    select operation_id from b3_sa1_operations where label = 'akumie'
  );
begin
  begin
    perform public.advance_super_admin_email_binding_v1(
      v_operation_id,
      'bound',
      'current_confirmed',
      'b3a13000-0000-4000-8000-000000000002',
      repeat('a', 64)
    );
    raise exception 'cross-session transition unexpectedly succeeded';
  exception when insufficient_privilege then
    if sqlerrm <> 'INVALID_TRANSITION' then raise; end if;
  end;

  begin
    perform public.advance_super_admin_email_binding_v1(
      v_operation_id,
      'bound',
      'current_confirmed',
      'b3a13000-0000-4000-8000-000000000001',
      repeat('d', 64)
    );
    raise exception 'email fingerprint replacement unexpectedly succeeded';
  exception when insufficient_privilege then
    if sqlerrm <> 'INVALID_TRANSITION' then raise; end if;
  end;
end;
$$;

select public.advance_super_admin_email_binding_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'bound',
  'current_confirmed',
  'b3a13000-0000-4000-8000-000000000001',
  repeat('a', 64)
);

select public.advance_super_admin_email_binding_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'current_confirmed',
  'new_email_sent',
  'b3a13000-0000-4000-8000-000000000001',
  repeat('a', 64)
);

select public.mark_super_admin_email_binding_recovery_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'b3a13000-0000-4000-8000-000000000001',
  repeat('a', 64),
  'GOTRUE_RESULT_UNCERTAIN'
);

delete from auth.sessions
where user_id = 'b3a10000-0000-4000-8000-000000000002';

select public.advance_super_admin_email_binding_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'recovery_required',
  'identity_changed',
  'b3a13000-0000-4000-8000-000000000001',
  repeat('a', 64)
);

set local timezone to 'Asia/Shanghai';

insert into private.elevated_access_intents (
  intent_id,
  request_id,
  actor_user_id,
  actor_authorization_reference,
  actor_session_id,
  operation,
  target_user_id,
  desired_role,
  expected_state_token,
  normalized_reason,
  payload_fingerprint,
  prior_totp_amr_timestamp,
  challenge_not_before,
  issued_at,
  expires_at
)
values (
  'b3a14000-0000-4000-8000-000000000001',
  'b3a14000-0000-4000-8000-000000000002',
  'b3a10000-0000-4000-8000-000000000001',
  'b3-sa1-existing-elevated-intent',
  'b3a13000-0000-4000-8000-000000000001',
  'grant_super_admin',
  'b3a10000-0000-4000-8000-000000000002',
  'super_admin',
  repeat('b', 64),
  'B3 SA1 existing elevated intent invalidation',
  pg_catalog.decode(repeat('c', 64), 'hex'),
  1,
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp() + interval '5 minutes'
);

select public.begin_super_admin_email_binding_reauth_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'b3a13000-0000-4000-8000-000000000001',
  repeat('a', 64)
);

do $$
begin
  if not exists (
    select 1
    from private.elevated_access_intents intent
    where intent.intent_id = 'b3a14000-0000-4000-8000-000000000001'
      and intent.consumed_at is not null
      and intent.terminal_status = 'expired'
  ) then
    raise exception 'old elevated intent remained usable after session revoke';
  end if;
end;
$$;

do $$
declare
  v_operation_id uuid := (
    select operation_id from b3_sa1_operations where label = 'akumie'
  );
begin
  begin
    perform public.complete_super_admin_email_binding_v1(
      v_operation_id,
      'b3a13000-0000-4000-8000-000000000002',
      'aal1',
      pg_catalog.statement_timestamp(),
      pg_catalog.statement_timestamp(),
      false,
      repeat('a', 64)
    );
    raise exception 'awaiting_reauth completed without protected read';
  exception when insufficient_privilege then
    if sqlerrm <> 'REAUTH_NOT_VERIFIED' then raise; end if;
  end;
end;
$$;

insert into auth.sessions (id, user_id, created_at, updated_at, aal, not_after)
values (
  'b3a13000-0000-4000-8000-000000000003',
  'b3a10000-0000-4000-8000-000000000002',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp(),
  'aal2',
  pg_catalog.statement_timestamp() + interval '1 hour'
);

select public.complete_super_admin_email_binding_v1(
  (select operation_id from b3_sa1_operations where label = 'akumie'),
  'b3a13000-0000-4000-8000-000000000003',
  'aal2',
  pg_catalog.statement_timestamp(),
  pg_catalog.statement_timestamp(),
  true,
  repeat('a', 64)
);

do $$
declare
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = (
    select operation_id from b3_sa1_operations where label = 'akumie'
  );

  if v_operation.status <> 'completed'
    or v_operation.reauthenticated_session_id <>
      'b3a13000-0000-4000-8000-000000000003'
    or v_operation.completed_at is null
  then
    raise exception 'operation did not complete through awaiting_reauth';
  end if;

  if (select state from public.memberships where user_id = v_operation.target_user_id)
      <> 'active'
    or not exists (
      select 1 from public.role_grants
      where user_id = v_operation.target_user_id
        and role = 'super_admin'
        and revoked_at is null
    )
    or (
      select pg_catalog.count(*) from auth.mfa_factors
      where user_id = v_operation.target_user_id
        and factor_type::text = 'totp'
        and status::text = 'verified'
    ) <> 2
  then
    raise exception 'authorization continuity changed unexpectedly';
  end if;

  if exists (
    select 1
    from private.super_admin_email_binding_audit audit
    where audit.operation_id = v_operation.operation_id
      and (
        audit.event_code ilike '%@%'
        or audit.reason_code ilike '%@%'
      )
  ) then
    raise exception 'redacted audit unexpectedly contains email-like data';
  end if;
end;
$$;

insert into b3_sa1_operations
select
  'phase2-expired',
  (public.prepare_super_admin_email_binding_v1(
    'b3a10000-0000-4000-8000-000000000001',
    60,
    'po-approved:b3-sa1-expiry'
  ) ->> 'operationId')::uuid;

update private.super_admin_email_binding_operations
set prepared_at = pg_catalog.statement_timestamp() - interval '61 seconds',
    expires_at = pg_catalog.statement_timestamp() - interval '1 second'
where operation_id = (
  select operation_id from b3_sa1_operations where label = 'phase2-expired'
);

insert into b3_sa1_operations
select
  'phase2-replacement',
  (public.prepare_super_admin_email_binding_v1(
    'b3a10000-0000-4000-8000-000000000001',
    600,
    'po-approved:b3-sa1-replacement'
  ) ->> 'operationId')::uuid;

do $$
begin
  if (
    select status
    from private.super_admin_email_binding_operations
    where operation_id = (
      select operation_id from b3_sa1_operations where label = 'phase2-expired'
    )
  ) <> 'expired' then
    raise exception 'expired operation was not released before replacement';
  end if;
end;
$$;

select public.terminate_super_admin_email_binding_v1(
  (select operation_id from b3_sa1_operations where label = 'phase2-replacement'),
  'cancelled',
  'PRODUCT_OWNER_CANCELLED'
);

do $$
begin
  if (
    select state from public.memberships
    where user_id = 'b3a10000-0000-4000-8000-000000000001'
  ) <> 'active'
    or not exists (
      select 1 from public.role_grants
      where user_id = 'b3a10000-0000-4000-8000-000000000001'
        and role = 'super_admin'
        and revoked_at is null
    )
    or (
      select pg_catalog.count(*) from auth.mfa_factors
      where user_id = 'b3a10000-0000-4000-8000-000000000001'
        and status::text = 'verified'
    ) <> 2
  then
    raise exception 'expiry/cancellation changed protected identity state';
  end if;
end;
$$;

do $$
declare
  v_role name;
  v_signature text;
begin
  foreach v_signature in array array[
    'public.get_super_admin_email_binding_targets_v1()',
    'public.get_super_admin_email_binding_operation_v1(uuid)',
    'public.assert_super_admin_email_binding_context_v1(uuid,text,uuid,text)',
    'public.prepare_super_admin_email_binding_v1(uuid,integer,text)',
    'public.bind_super_admin_email_binding_v1(uuid,uuid,uuid,text,timestamptz,text,timestamptz)',
    'public.advance_super_admin_email_binding_v1(uuid,text,text,uuid,text)',
    'public.mark_super_admin_email_binding_recovery_v1(uuid,uuid,text,text)',
    'public.begin_super_admin_email_binding_reauth_v1(uuid,uuid,text)',
    'public.complete_super_admin_email_binding_v1(uuid,uuid,text,timestamptz,timestamptz,boolean,text)',
    'public.terminate_super_admin_email_binding_v1(uuid,text,text)'
  ]
  loop
    foreach v_role in array array[
      'public'::name,
      'anon'::name,
      'authenticated'::name
    ]
    loop
      if pg_catalog.has_function_privilege(v_role, v_signature, 'EXECUTE') then
        raise exception '% unexpectedly executes %', v_role, v_signature;
      end if;
    end loop;

    if not pg_catalog.has_function_privilege(
      'service_role',
      v_signature,
      'EXECUTE'
    ) then
      raise exception 'service_role cannot execute %', v_signature;
    end if;
  end loop;
end;
$$;

rollback;
