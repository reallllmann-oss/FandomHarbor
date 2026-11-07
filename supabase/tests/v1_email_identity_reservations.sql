\set ON_ERROR_STOP on

begin;

create temporary table b1_existing_memberships as
select to_jsonb(m) as row_data from public.memberships m;

create temporary table b1_existing_roles as
select to_jsonb(rg) as row_data from public.role_grants rg;

create temporary table b1_existing_mfa_factors as
select to_jsonb(mf) as row_data from auth.mfa_factors mf;

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
  'b1000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'b1-inviter@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into public.profiles (user_id, registration_name)
values ('b1000000-0000-4000-8000-000000000001', 'B1Inviter');

insert into public.memberships (user_id, state, admitted_at)
values (
  'b1000000-0000-4000-8000-000000000001',
  'active',
  statement_timestamp()
);

insert into public.invitations (
  id,
  code_hash,
  inviter_user_id,
  max_uses,
  expires_at
) values
  (
    'b1100000-0000-4000-8000-000000000001',
    repeat('1', 64),
    'b1000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '2 days'
  ),
  (
    'b1100000-0000-4000-8000-000000000002',
    repeat('2', 64),
    'b1000000-0000-4000-8000-000000000001',
    4,
    statement_timestamp() + interval '2 days'
  ),
  (
    'b1100000-0000-4000-8000-000000000003',
    repeat('3', 64),
    'b1000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '2 days'
  ),
  (
    'b1100000-0000-4000-8000-000000000004',
    repeat('4', 64),
    'b1000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '45 minutes'
  ),
  (
    'b1100000-0000-4000-8000-000000000005',
    repeat('5', 64),
    'b1000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '2 days'
  ),
  (
    'b1100000-0000-4000-8000-000000000006',
    repeat('6', 64),
    'b1000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '2 days'
  );

update private.registration_settings
set mode = 'email_required',
    updated_at = statement_timestamp()
where singleton;

do $$
begin
  if public.registration_invitation_status(repeat('1', 64)) <> 'invalid' then
    raise exception 'trusted mode exposed the invitation preflight oracle';
  end if;

  if public.validate_registration_invitation(repeat('1', 64)) then
    raise exception 'trusted mode kept public invitation validation enabled';
  end if;
end;
$$;

do $$
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values (
    'b1000000-0000-4000-8000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'direct-signup@example.test',
    'non-empty-password-hash',
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  );
  raise exception 'direct signup without proof unexpectedly succeeded';
exception
  when sqlstate 'P0001' then
    null;
end;
$$;

do $$
begin
  if exists (
    select 1 from auth.users
    where id = 'b1000000-0000-4000-8000-000000000010'
  ) then
    raise exception 'rejected direct signup left an Auth user';
  end if;

  if private.before_user_created_email_registration(
    jsonb_build_object(
      'user',
      jsonb_build_object(
        'id', 'b1000000-0000-4000-8000-000000000010',
        'email', 'direct-signup@example.test',
        'user_metadata', '{}'::jsonb
      )
    )
  ) -> 'error' is null then
    raise exception 'Hook did not reject a missing proof';
  end if;
end;
$$;

create temporary table b1_normal_attempt as
select *
from private.prepare_email_registration_at(
  'B1NormalReader',
  'normal.reader@example.test',
  repeat('1', 64),
  null,
  null,
  statement_timestamp()
);

update private.registration_attempts
set expected_auth_user_id = 'b1000000-0000-4000-8000-000000000011',
    auth_email_binding_hash = private.registration_auth_email_binding_hash(
      'normal.reader@example.test',
      'b1000000-0000-4000-8000-000000000011'
    )
where id = (select attempt_id from b1_normal_attempt);

update b1_normal_attempt
set expected_auth_user_id = 'b1000000-0000-4000-8000-000000000011';

do $$
declare
  v_attempt record;
begin
  select * into v_attempt from b1_normal_attempt;

  if v_attempt.attempt_proof !~ '^[0-9a-f]{64}$' then
    raise exception 'prepare did not return a 256-bit hex proof';
  end if;

  if v_attempt.reservation_expires_at <> (
    select ra.created_at + interval '2 hours'
    from private.registration_attempts ra
    where ra.id = v_attempt.attempt_id
  ) then
    raise exception 'reservation is not exactly two hours';
  end if;

  if v_attempt.proof_expires_at <> (
    select ra.created_at + interval '15 minutes'
    from private.registration_attempts ra
    where ra.id = v_attempt.attempt_id
  ) or v_attempt.proof_expires_at >= v_attempt.reservation_expires_at then
    raise exception 'proof and reservation do not use independent expiries';
  end if;

  if exists (
    select 1
    from private.registration_attempts ra
    where ra.id = v_attempt.attempt_id
      and (
        ra.proof_hash = v_attempt.attempt_proof
        or ra.email_binding_hash = v_attempt.attempt_proof
      )
  ) then
    raise exception 'plain proof was persisted';
  end if;

  if (
    select count(*)
    from private.invitation_reservations ir
    where ir.attempt_id = v_attempt.attempt_id
      and ir.status = 'reserved'
  ) <> 1 then
    raise exception 'prepare did not create one reservation';
  end if;

  if (
    select count(*)
    from public.memberships m
    where m.user_id = 'b1000000-0000-4000-8000-000000000011'
  ) <> 0 then
    raise exception 'prepare created membership too early';
  end if;
end;
$$;

do $$
declare
  v_attempt record;
begin
  select * into v_attempt from b1_normal_attempt;
  begin
    perform private.validate_email_registration_at(
      jsonb_build_object(
        'user',
        jsonb_build_object(
          'id', v_attempt.expected_auth_user_id,
          'email', 'normal.reader@example.test',
          'user_metadata', jsonb_build_object(
            '_fh_registration_attempt', v_attempt.attempt_id,
            '_fh_registration_proof', v_attempt.attempt_proof
          )
        )
      ),
      statement_timestamp()
    );
    raise exception 'public Signup Hook accepted deprecated proof metadata';
  exception
    when sqlstate 'P0001' then
      null;
  end;
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
  expected_auth_user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'normal.reader@example.test',
  'non-empty-password-hash',
  null,
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
from b1_normal_attempt;

do $$
begin
  if not exists (
    select 1
    from public.profiles p
    join public.memberships m on m.user_id = p.user_id
    where p.user_id = 'b1000000-0000-4000-8000-000000000011'
      and p.registration_name = 'B1NormalReader'
      and m.state = 'pending'
      and m.admitted_at is null
  ) then
    raise exception 'Auth insert did not create a pending identity';
  end if;

  if exists (
    select 1 from public.invitation_redemptions ir
    where ir.user_id = 'b1000000-0000-4000-8000-000000000011'
  ) or (
    select i.use_count from public.invitations i
    where i.id = 'b1100000-0000-4000-8000-000000000001'
  ) <> 0 then
    raise exception 'pending identity consumed the invitation';
  end if;

  if (
    select u.raw_user_meta_data ?| array[
      '_fh_registration_attempt',
      '_fh_registration_proof'
    ]
    from auth.users u
    where u.id = 'b1000000-0000-4000-8000-000000000011'
  ) then
    raise exception 'internal proof metadata persisted on auth.users';
  end if;

  if private.is_active_member('b1000000-0000-4000-8000-000000000011') then
    raise exception 'unverified pending user gained active membership';
  end if;
end;
$$;

do $$
declare
  v_attempt record;
begin
  select * into v_attempt from b1_normal_attempt;
  begin
    perform private.validate_email_registration_at(
      jsonb_build_object(
        'user',
        jsonb_build_object(
          'id', 'b1000000-0000-4000-8000-000000000012',
          'email', 'normal.reader@example.test',
          'user_metadata', jsonb_build_object(
            '_fh_registration_attempt', v_attempt.attempt_id,
            '_fh_registration_proof', v_attempt.attempt_proof
          )
        )
      ),
      statement_timestamp()
    );
    raise exception 'consumed proof unexpectedly passed Hook replay validation';
  exception
    when sqlstate 'P0001' then
      null;
  end;
end;
$$;

create or replace function private.b1_fail_activation_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id = 'b1000000-0000-4000-8000-000000000011' then
    raise exception 'B1 forced activation failure';
  end if;
  return new;
end;
$$;

create trigger b1_force_activation_failure
after insert on public.invitation_redemptions
for each row execute function private.b1_fail_activation_write();

do $$
begin
  begin
    update auth.users
    set email_confirmed_at = statement_timestamp(),
        updated_at = statement_timestamp()
    where id = 'b1000000-0000-4000-8000-000000000011';
    raise exception 'forced activation failure unexpectedly committed';
  exception
    when others then
      if sqlerrm = 'forced activation failure unexpectedly committed' then
        raise;
      end if;
  end;

  if (
    select u.email_confirmed_at is not null
    from auth.users u
    where u.id = 'b1000000-0000-4000-8000-000000000011'
  ) or exists (
    select 1 from public.invitation_redemptions ir
    where ir.user_id = 'b1000000-0000-4000-8000-000000000011'
  ) or (
    select m.state from public.memberships m
    where m.user_id = 'b1000000-0000-4000-8000-000000000011'
  ) <> 'pending' or (
    select i.use_count from public.invitations i
    where i.id = 'b1100000-0000-4000-8000-000000000001'
  ) <> 0 then
    raise exception 'activation failure left a partial write';
  end if;
end;
$$;

drop trigger b1_force_activation_failure on public.invitation_redemptions;
drop function private.b1_fail_activation_write();

update auth.users
set email_confirmed_at = statement_timestamp(),
    updated_at = statement_timestamp()
where id = 'b1000000-0000-4000-8000-000000000011';

do $$
declare
  v_attempt_id uuid;
begin
  select attempt_id into v_attempt_id from b1_normal_attempt;

  if not exists (
    select 1
    from public.memberships m
    join public.invitation_redemptions ir on ir.user_id = m.user_id
    join private.invitation_reservations r on r.attempt_id = v_attempt_id
    join private.registration_attempts ra on ra.id = v_attempt_id
    where m.user_id = 'b1000000-0000-4000-8000-000000000011'
      and m.state = 'active'
      and m.admitted_at is not null
      and r.status = 'consumed'
      and ra.status = 'activated'
  ) then
    raise exception 'email confirmation did not atomically activate membership';
  end if;

  if (
    select i.use_count from public.invitations i
    where i.id = 'b1100000-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'activation did not increment invitation exactly once';
  end if;

  if not private.activate_email_registration_at(
    'b1000000-0000-4000-8000-000000000011',
    statement_timestamp()
  ) then
    raise exception 'idempotent activation did not return existing success';
  end if;

  if (
    select count(*) from public.invitation_redemptions ir
    where ir.user_id = 'b1000000-0000-4000-8000-000000000011'
  ) <> 1 or (
    select i.use_count from public.invitations i
    where i.id = 'b1100000-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'idempotent activation double-consumed the invitation';
  end if;
end;
$$;

create temporary table b1_early_expiry_attempt as
select *
from private.prepare_email_registration_at(
  'B1EarlyExpiry',
  'early.expiry@example.test',
  repeat('4', 64),
  null,
  null,
  statement_timestamp()
);

do $$
begin
  if (
    select a.reservation_expires_at from b1_early_expiry_attempt a
  ) <> (
    select i.expires_at from public.invitations i
    where i.id = 'b1100000-0000-4000-8000-000000000004'
  ) then
    raise exception 'reservation exceeded the invitation expiry';
  end if;
end;
$$;

create temporary table b1_expired_attempt as
select *
from private.prepare_email_registration_at(
  'B1ExpiredReader',
  'expired.reader@example.test',
  repeat('2', 64),
  null,
  null,
  statement_timestamp()
);

do $$
declare
  v_attempt record;
  v_rotated record;
  v_boundary_proof record;
begin
  select * into v_attempt from b1_expired_attempt;

  select * into v_rotated
  from private.prepare_email_registration_at(
    'B1ExpiredReader',
    'expired.reader@example.test',
    repeat('2', 64),
    v_attempt.attempt_id,
    v_attempt.attempt_proof,
    v_attempt.proof_expires_at
  );

  if v_rotated.attempt_id <> v_attempt.attempt_id
    or v_rotated.attempt_proof = v_attempt.attempt_proof
    or v_rotated.reservation_expires_at <> v_attempt.reservation_expires_at
    or v_rotated.proof_expires_at <= v_attempt.proof_expires_at then
    raise exception 'proof rotation changed the attempt or reservation boundary';
  end if;

  if exists (
    select 1
    from public.registration_attempt_status(
      v_attempt.attempt_id,
      v_attempt.attempt_proof
    )
  ) then
    raise exception 'old proof remained valid after rotation';
  end if;

  select * into v_boundary_proof
  from private.prepare_email_registration_at(
    'B1ExpiredReader',
    'expired.reader@example.test',
    repeat('2', 64),
    v_rotated.attempt_id,
    v_rotated.attempt_proof,
    v_attempt.reservation_expires_at - interval '1 minute'
  );

  if v_boundary_proof.reservation_expires_at <> v_attempt.reservation_expires_at
    or v_boundary_proof.proof_expires_at <> v_attempt.reservation_expires_at then
    raise exception 'late proof rotation extended the two-hour reservation';
  end if;

  if v_boundary_proof.proof_expires_at <=
      v_attempt.reservation_expires_at - interval '1 second'
    or v_boundary_proof.proof_expires_at > v_attempt.reservation_expires_at then
    raise exception 'late proof rotation did not remain valid until the reservation boundary';
  end if;
end;
$$;

create temporary table b1_revoked_attempt as
select *
from private.prepare_email_registration_at(
  'B1RevokedReader',
  'revoked.reader@example.test',
  repeat('3', 64),
  null,
  null,
  statement_timestamp()
);

update private.registration_attempts
set expected_auth_user_id = 'b1000000-0000-4000-8000-000000000030',
    auth_email_binding_hash = private.registration_auth_email_binding_hash(
      'revoked.reader@example.test',
      'b1000000-0000-4000-8000-000000000030'
    )
where id = (select attempt_id from b1_revoked_attempt);

update b1_revoked_attempt
set expected_auth_user_id = 'b1000000-0000-4000-8000-000000000030';

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
  expected_auth_user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'revoked.reader@example.test',
  'non-empty-password-hash',
  null,
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
from b1_revoked_attempt;

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'b1000000-0000-4000-8000-000000000001',
  true
);

select public.revoke_invitation(
  'b1100000-0000-4000-8000-000000000003',
  'B1 revocation test'
);

update auth.users
set email_confirmed_at = statement_timestamp(),
    updated_at = statement_timestamp()
where id = 'b1000000-0000-4000-8000-000000000030';

do $$
begin
  if (
    select m.state from public.memberships m
    where m.user_id = 'b1000000-0000-4000-8000-000000000030'
  ) <> 'pending' or exists (
    select 1 from public.invitation_redemptions ir
    where ir.user_id = 'b1000000-0000-4000-8000-000000000030'
  ) or (
    select i.use_count from public.invitations i
    where i.id = 'b1100000-0000-4000-8000-000000000003'
  ) <> 0 then
    raise exception 'revoked reservation activated membership';
  end if;

  if not exists (
    select 1
    from private.registration_attempts ra
    join private.invitation_reservations ir on ir.attempt_id = ra.id
    where ra.auth_user_id = 'b1000000-0000-4000-8000-000000000030'
      and ra.status = 'blocked'
      and ir.status = 'released'
  ) then
    raise exception 'revocation did not invalidate the pending reservation';
  end if;
end;
$$;

create temporary table b1_auth_failure_attempt as
select *
from private.prepare_email_registration_at(
  'B1AuthFailure',
  'auth.failure@example.test',
  repeat('5', 64),
  null,
  null,
  statement_timestamp()
);

update private.registration_attempts
set expected_auth_user_id = 'b1000000-0000-4000-8000-000000000040',
    auth_email_binding_hash = private.registration_auth_email_binding_hash(
      'auth.failure@example.test',
      'b1000000-0000-4000-8000-000000000040'
    )
where id = (select attempt_id from b1_auth_failure_attempt);

update b1_auth_failure_attempt
set expected_auth_user_id = 'b1000000-0000-4000-8000-000000000040';

create or replace function private.b1_fail_pending_membership()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id = 'b1000000-0000-4000-8000-000000000040' then
    raise exception 'B1 forced Auth insert failure';
  end if;
  return new;
end;
$$;

create trigger b1_force_auth_insert_failure
before insert on public.memberships
for each row execute function private.b1_fail_pending_membership();

do $$
declare
  v_attempt record;
begin
  select * into v_attempt from b1_auth_failure_attempt;
  begin
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      'b1000000-0000-4000-8000-000000000040',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auth.failure@example.test',
      'non-empty-password-hash',
      '{}'::jsonb,
      '{}'::jsonb,
      statement_timestamp(),
      statement_timestamp()
    );
    raise exception 'forced Auth insert failure unexpectedly committed';
  exception
    when others then
      if sqlerrm = 'forced Auth insert failure unexpectedly committed' then
        raise;
      end if;
  end;

  if exists (
    select 1 from auth.users u
    where u.id = 'b1000000-0000-4000-8000-000000000040'
  ) or exists (
    select 1 from public.profiles p
    where p.user_id = 'b1000000-0000-4000-8000-000000000040'
  ) or exists (
    select 1 from public.memberships m
    where m.user_id = 'b1000000-0000-4000-8000-000000000040'
  ) then
    raise exception 'Auth insert failure left a partial identity';
  end if;

  if not exists (
    select 1
    from private.registration_attempts ra
    join private.invitation_reservations ir on ir.attempt_id = ra.id
    where ra.id = v_attempt.attempt_id
      and ra.status = 'prepared'
      and ra.auth_user_id is null
      and ir.status = 'reserved'
      and ir.auth_user_id is null
  ) then
    raise exception 'Auth insert failure did not roll back the BEFORE INSERT claim';
  end if;
end;
$$;

drop trigger b1_force_auth_insert_failure on public.memberships;
drop function private.b1_fail_pending_membership();

do $$
declare
  v_attempt record;
  v_reused record;
begin
  select * into v_attempt from b1_auth_failure_attempt;
  select * into v_reused
  from private.prepare_email_registration_at(
    'B1AuthFailure',
    'auth.failure@example.test',
    repeat('5', 64),
    v_attempt.attempt_id,
    v_attempt.attempt_proof,
    statement_timestamp() + interval '5 minutes'
  );

  if v_reused.attempt_id <> v_attempt.attempt_id
    or v_reused.reservation_expires_at <> v_attempt.reservation_expires_at then
    raise exception 'retry extended or replaced the reservation';
  end if;

  if not public.release_email_registration(
    v_attempt.attempt_id,
    v_attempt.attempt_proof,
    'auth_creation_failed'
  ) then
    raise exception 'explicit Auth failure did not release the attempt';
  end if;

  if not public.release_email_registration(
    v_attempt.attempt_id,
    v_attempt.attempt_proof,
    'auth_creation_failed'
  ) then
    raise exception 'release retry was not idempotent';
  end if;
end;
$$;

do $$
begin
  if has_function_privilege(
    'anon',
    'public.prepare_email_registration(text,text,text,uuid,text)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.prepare_email_registration(text,text,text,uuid,text)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.prepare_email_registration(text,text,text,uuid,text)',
    'EXECUTE'
  ) then
    raise exception 'prepare function grants are unsafe';
  end if;

  if has_function_privilege(
    'anon',
    'private.before_user_created_email_registration(jsonb)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'private.before_user_created_email_registration(jsonb)',
    'EXECUTE'
  ) or not has_function_privilege(
    'supabase_auth_admin',
    'private.before_user_created_email_registration(jsonb)',
    'EXECUTE'
  ) then
    raise exception 'Auth Hook grants are unsafe';
  end if;

  if has_function_privilege(
    'anon',
    'private.registration_auth_email_binding_hash(text,uuid)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'private.registration_auth_email_binding_hash(text,uuid)',
    'EXECUTE'
  ) or has_function_privilege(
    'service_role',
    'private.registration_auth_email_binding_hash(text,uuid)',
    'EXECUTE'
  ) then
    raise exception 'Auth UID/email binding helper grants are unsafe';
  end if;

  if has_table_privilege('anon', 'private.registration_attempts', 'SELECT')
    or has_table_privilege('authenticated', 'private.registration_attempts', 'SELECT')
    or has_table_privilege('anon', 'private.invitation_reservations', 'SELECT')
    or has_table_privilege('authenticated', 'private.invitation_reservations', 'SELECT') then
    raise exception 'private registration tables are publicly readable';
  end if;

  if exists (
    select 1
    from public.audit_logs a
    join b1_normal_attempt t on true
    where a.created_at >= (
      select min(ra.created_at)
      from private.registration_attempts ra
      where ra.id = t.attempt_id
    )
      and a.metadata::text like '%' || t.attempt_proof || '%'
  ) then
    raise exception 'proof leaked into audit metadata';
  end if;

  if exists (
    select 1
    from b1_existing_memberships before
    where not exists (
      select 1 from public.memberships current
      where to_jsonb(current) = before.row_data
    )
  ) then
    raise exception 'B1 changed an existing membership';
  end if;

  if exists (
    select 1
    from b1_existing_roles before
    where not exists (
      select 1 from public.role_grants current
      where to_jsonb(current) = before.row_data
    )
  ) then
    raise exception 'B1 changed an existing role grant';
  end if;

  if exists (
    select 1
    from b1_existing_mfa_factors before
    where not exists (
      select 1 from auth.mfa_factors current
      where to_jsonb(current) = before.row_data
    )
  ) then
    raise exception 'B1 changed an existing TOTP factor';
  end if;
end;
$$;

rollback;
