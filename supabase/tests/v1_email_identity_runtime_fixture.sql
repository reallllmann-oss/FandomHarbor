\set ON_ERROR_STOP on

-- Local-only fixture for the real GoTrue B1 runtime tests. Run only after a
-- local database reset; these identifiers and example.test addresses must
-- never be used outside the isolated development stack.

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
  'b1400000-0000-4000-8000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'b1-runtime-inviter@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into public.profiles (user_id, registration_name)
values ('b1400000-0000-4000-8000-000000000000', 'B1RuntimeInviter');

insert into public.memberships (user_id, state, admitted_at)
values (
  'b1400000-0000-4000-8000-000000000000',
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
    'b1400000-0000-4000-8000-000000000001',
    repeat('d', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000002',
    repeat('e', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000003',
    repeat('f', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000004',
    repeat('a', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000005',
    repeat('b', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000006',
    repeat('c', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000007',
    repeat('7', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  ),
  (
    'b1400000-0000-4000-8000-000000000008',
    repeat('8', 64),
    'b1400000-0000-4000-8000-000000000000',
    1,
    statement_timestamp() + interval '1 day'
  );

update private.registration_settings
set mode = 'email_required',
    updated_at = statement_timestamp()
where singleton;
