\set ON_ERROR_STOP on

begin;

select plan(1);

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
  'b2010000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'b2-fix-inviter@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into public.profiles (user_id, registration_name)
values ('b2010000-0000-4000-8000-000000000001', 'B2FixInviter');

insert into public.memberships (user_id, state, admitted_at)
values (
  'b2010000-0000-4000-8000-000000000001',
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
  'b2011000-0000-4000-8000-000000000001',
  repeat('8', 64),
  'b2010000-0000-4000-8000-000000000001',
  1,
  statement_timestamp() + interval '1 day'
);

update private.registration_settings
set mode = 'email_required',
    updated_at = statement_timestamp()
where singleton;

create temporary table b2_fix_attempt as
select *
from private.prepare_email_registration_at(
  'B2FixReader',
  'b2-fix-reader@example.test',
  repeat('8', 64),
  null,
  null,
  statement_timestamp()
);

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
)
select
  expected_auth_user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'b2-fix-reader@example.test',
  'non-empty-password-hash',
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
from b2_fix_attempt;

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
  expected_auth_user_id,
  expected_auth_user_id::text,
  expected_auth_user_id,
  jsonb_build_object(
    'sub', expected_auth_user_id::text,
    'email', 'b2-fix-reader@example.test'
  ),
  'email',
  statement_timestamp(),
  statement_timestamp()
from b2_fix_attempt;

do $$
declare
  v_attempt record;
begin
  select * into v_attempt from b2_fix_attempt;

  if (
    select count(*)
    from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) <> 1 then
    raise exception 'valid auth_created attempt was not readable by the server';
  end if;

  if (
    select count(*)
    from public.registration_resume_context(
      v_attempt.attempt_proof,
      ' B2-FIX-READER@example.test ',
      'B2FixReader',
      repeat('8', 64)
    )
  ) <> 1 then
    raise exception 'exactly-bound pending attempt could not resume';
  end if;

  if exists (
    select 1
    from public.registration_resume_context(
      v_attempt.attempt_proof,
      'other@example.test',
      'B2FixReader',
      repeat('8', 64)
    )
  ) or exists (
    select 1
    from public.registration_resume_context(
      v_attempt.attempt_proof,
      'b2-fix-reader@example.test',
      'OtherReader',
      repeat('8', 64)
    )
  ) or exists (
    select 1
    from public.registration_resume_context(
      v_attempt.attempt_proof,
      'b2-fix-reader@example.test',
      'B2FixReader',
      repeat('9', 64)
    )
  ) then
    raise exception 'attempt resumed with a mismatched binding';
  end if;

  if (
    select count(*) from public.memberships m
    where m.user_id = v_attempt.expected_auth_user_id
      and m.state = 'pending'
  ) <> 1 or exists (
    select 1 from public.invitation_redemptions redemption
    where redemption.user_id = v_attempt.expected_auth_user_id
  ) or (
    select i.use_count from public.invitations i
    where i.id = 'b2011000-0000-4000-8000-000000000001'
  ) <> 0 then
    raise exception 'read-only resume changed membership or invitation state';
  end if;

  update auth.users
  set banned_until = statement_timestamp() + interval '1 day'
  where id = v_attempt.expected_auth_user_id;
  if exists (
    select 1 from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) then
    raise exception 'banned Auth user remained resumable';
  end if;
  update auth.users
  set banned_until = null
  where id = v_attempt.expected_auth_user_id;

  update private.registration_attempts
  set status = 'verified_pending'
  where id = v_attempt.attempt_id;
  if exists (
    select 1 from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) then
    raise exception 'verified_pending attempt remained resumable';
  end if;

  update private.registration_attempts
  set status = 'blocked', terminal_reason = 'test'
  where id = v_attempt.attempt_id;
  if exists (
    select 1 from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) then
    raise exception 'blocked attempt remained resumable';
  end if;

  update private.registration_attempts
  set status = 'activated', activated_at = statement_timestamp()
  where id = v_attempt.attempt_id;
  if exists (
    select 1 from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) then
    raise exception 'activated attempt remained resumable';
  end if;

  update private.invitation_reservations
  set status = 'released',
      auth_user_id = null,
      released_at = statement_timestamp(),
      release_reason = 'test',
      updated_at = statement_timestamp()
  where attempt_id = v_attempt.attempt_id;
  update private.registration_attempts
  set status = 'released',
      auth_user_id = null,
      proof_consumed_at = null,
      claimed_at = null,
      auth_created_at = null,
      activated_at = null,
      terminal_reason = 'test',
      updated_at = statement_timestamp()
  where id = v_attempt.attempt_id;
  if exists (
    select 1 from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) then
    raise exception 'released attempt remained resumable';
  end if;

  update private.invitation_reservations
  set status = 'expired', updated_at = statement_timestamp()
  where attempt_id = v_attempt.attempt_id;
  update private.registration_attempts
  set status = 'expired', updated_at = statement_timestamp()
  where id = v_attempt.attempt_id;
  if exists (
    select 1 from public.registration_context_by_proof(v_attempt.attempt_proof)
  ) then
    raise exception 'expired attempt remained resumable';
  end if;

  if exists (
    select 1 from public.registration_context_by_proof(repeat('f', 64))
  ) then
    raise exception 'unknown proof unexpectedly resolved an attempt';
  end if;
end;
$$;

do $$
begin
  if has_function_privilege(
    'anon',
    'public.registration_resume_context(text,text,text,text)',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.registration_resume_context(text,text,text,text)',
    'execute'
  ) or not has_function_privilege(
    'service_role',
    'public.registration_resume_context(text,text,text,text)',
    'execute'
  ) then
    raise exception 'resume context does not have the server-only ACL';
  end if;
end;
$$;

select pass('B2-FIX-01 exact attempt binding, terminal-state rejection, and ACL hold');
select * from finish();

rollback;
