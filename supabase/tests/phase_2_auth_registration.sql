begin;

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
  '41000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'registration-inviter@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into public.profiles (user_id, registration_name)
values (
  '41000000-0000-4000-8000-000000000001',
  'InviteAuthor'
);

insert into public.memberships (user_id, state, admitted_at)
values (
  '41000000-0000-4000-8000-000000000001',
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
    '42000000-0000-4000-8000-000000000001',
    repeat('a', 64),
    '41000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    '42000000-0000-4000-8000-000000000002',
    repeat('b', 64),
    '41000000-0000-4000-8000-000000000001',
    1,
    statement_timestamp() + interval '1 day'
  );

insert into public.invitations (
  id,
  code_hash,
  inviter_user_id,
  max_uses,
  use_count,
  created_at,
  expires_at,
  revoked_by,
  revoked_at,
  revoke_reason
) values
  (
    '42000000-0000-4000-8000-000000000003',
    repeat('c', 64),
    '41000000-0000-4000-8000-000000000001',
    1,
    0,
    statement_timestamp() - interval '2 days',
    statement_timestamp() - interval '1 day',
    null,
    null,
    null
  ),
  (
    '42000000-0000-4000-8000-000000000004',
    repeat('d', 64),
    '41000000-0000-4000-8000-000000000001',
    1,
    1,
    statement_timestamp(),
    statement_timestamp() + interval '1 day',
    null,
    null,
    null
  ),
  (
    '42000000-0000-4000-8000-000000000005',
    repeat('e', 64),
    '41000000-0000-4000-8000-000000000001',
    1,
    0,
    statement_timestamp(),
    statement_timestamp() + interval '1 day',
    '41000000-0000-4000-8000-000000000001',
    statement_timestamp(),
    'registration status test'
  );

do $$
begin
  if public.registration_invitation_status(repeat('a', 64)) <> 'valid' then
    raise exception 'valid invitation status is not valid';
  end if;

  if public.registration_invitation_status(repeat('f', 64)) <> 'invalid' then
    raise exception 'unknown invitation status is not invalid';
  end if;

  if public.registration_invitation_status(repeat('c', 64)) <> 'expired' then
    raise exception 'expired invitation status is not expired';
  end if;

  if public.registration_invitation_status(repeat('d', 64)) <> 'exhausted' then
    raise exception 'exhausted invitation status is not exhausted';
  end if;

  if public.registration_invitation_status(repeat('e', 64)) <> 'revoked' then
    raise exception 'revoked invitation status is not revoked';
  end if;

  if not public.validate_registration_invitation(repeat('a', 64)) then
    raise exception 'valid invitation failed preflight validation';
  end if;

  if public.validate_registration_invitation(repeat('f', 64)) then
    raise exception 'unknown invitation passed preflight validation';
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
) values (
  '41000000-0000-4000-8000-000000000010',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'atomic-reader@accounts.fandom-harbor.invalid',
  'non-empty-password-hash',
  null,
  '{}'::jsonb,
  jsonb_build_object(
    'registration_name', 'AtomicReader',
    'invitation_code_hash', repeat('a', 64)
  ),
  statement_timestamp(),
  statement_timestamp()
);

do $$
begin
  if not exists (
    select 1
    from public.profiles
    where user_id = '41000000-0000-4000-8000-000000000010'
      and registration_name = 'AtomicReader'
  ) then
    raise exception 'atomic registration did not create the profile';
  end if;

  if not exists (
    select 1
    from public.memberships
    where user_id = '41000000-0000-4000-8000-000000000010'
      and state = 'active'
  ) then
    raise exception 'atomic registration did not activate membership';
  end if;

  if not exists (
    select 1
    from public.invitation_redemptions
    where user_id = '41000000-0000-4000-8000-000000000010'
      and invitation_id = '42000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'atomic registration did not record redemption';
  end if;

  if (
    select use_count
    from public.invitations
    where id = '42000000-0000-4000-8000-000000000001'
  ) <> 1 then
    raise exception 'atomic registration did not consume the invitation';
  end if;

  if exists (
    select 1
    from public.role_grants
    where user_id = '41000000-0000-4000-8000-000000000010'
  ) then
    raise exception 'registration unexpectedly granted an elevated role';
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
    '41000000-0000-4000-8000-000000000011',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'invalid-invite@accounts.fandom-harbor.invalid',
    'non-empty-password-hash',
    '{}'::jsonb,
    jsonb_build_object(
      'registration_name', 'InvalidInviteReader',
      'invitation_code_hash', repeat('f', 64)
    ),
    statement_timestamp(),
    statement_timestamp()
  );
  raise exception 'invalid invitation unexpectedly created an auth user';
exception
  when sqlstate 'P0001' then
    null;
end;
$$;

do $$
begin
  if exists (
    select 1 from auth.users
    where id = '41000000-0000-4000-8000-000000000011'
  ) or exists (
    select 1 from public.profiles
    where user_id = '41000000-0000-4000-8000-000000000011'
  ) then
    raise exception 'invalid invitation left a partial account';
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
    '41000000-0000-4000-8000-000000000012',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'duplicate-name@accounts.fandom-harbor.invalid',
    'non-empty-password-hash',
    '{}'::jsonb,
    jsonb_build_object(
      'registration_name', 'atomicreader',
      'invitation_code_hash', repeat('b', 64)
    ),
    statement_timestamp(),
    statement_timestamp()
  );
  raise exception 'case-insensitive duplicate registration name succeeded';
exception
  when unique_violation then
    null;
end;
$$;

do $$
begin
  if exists (
    select 1 from auth.users
    where id = '41000000-0000-4000-8000-000000000012'
  ) or (
    select use_count
    from public.invitations
    where id = '42000000-0000-4000-8000-000000000002'
  ) <> 0 then
    raise exception 'duplicate registration name did not roll back atomically';
  end if;
end;
$$;

rollback;
