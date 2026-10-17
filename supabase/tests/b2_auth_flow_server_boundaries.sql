\set ON_ERROR_STOP on

begin;

select plan(1);

do $$
begin
  if has_function_privilege('anon', 'public.get_registration_mode()', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.get_registration_mode()', 'EXECUTE')
    or has_function_privilege('anon', 'public.registration_context_by_proof(text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.resolve_login_name_user_id(text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.registration_resume_context(text,text,text,text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.registration_resume_context(text,text,text,text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.consume_auth_rate_limit(text,text,integer,integer)', 'EXECUTE') then
    raise exception 'B2 server-only functions leaked to browser roles';
  end if;

  if not has_function_privilege('service_role', 'public.get_registration_mode()', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.registration_context_by_proof(text)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.registration_resume_context(text,text,text,text)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.resolve_login_name_user_id(text)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.consume_auth_rate_limit(text,text,integer,integer)', 'EXECUTE') then
    raise exception 'B2 service role grants are incomplete';
  end if;
end;
$$;

do $$
declare
  v_hash text := repeat('a', 64);
begin
  if not public.consume_auth_rate_limit('auth.test', v_hash, 2, 300) then
    raise exception 'first rate-limit request was rejected';
  end if;
  if not public.consume_auth_rate_limit('auth.test', v_hash, 2, 300) then
    raise exception 'second rate-limit request was rejected';
  end if;
  if public.consume_auth_rate_limit('auth.test', v_hash, 2, 300) then
    raise exception 'rate-limit overflow was accepted';
  end if;
  if exists (
    select 1 from private.auth_rate_limits
    where subject_hash !~ '^[0-9a-f]{64}$' or length(subject_hash) <> 64
  ) then
    raise exception 'rate-limit storage contains a non-digest subject';
  end if;
  if not exists (
    select 1 from private.auth_rate_limits
    where scope = 'auth.test'
      and subject_hash = v_hash
      and attempts = 3
  ) then
    raise exception 'rate-limit storage did not preserve the expected digest';
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
  'b2000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'b2-reader@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
);

insert into private.login_name_claims (
  login_name_key,
  registration_name,
  user_id
) values (
  private.canonical_registration_name('B2Reader'),
  'B2Reader',
  'b2000000-0000-4000-8000-000000000001'
);

do $$
begin
  if public.resolve_login_name_user_id('  b2reader  ') <>
    'b2000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'canonical login-name resolution failed';
  end if;
  if public.resolve_login_name_user_id('unknown') is not null then
    raise exception 'unknown login name returned a user';
  end if;
  if public.get_registration_mode() <> 'legacy' then
    raise exception 'B2 migration changed the safe registration-mode default';
  end if;
end;
$$;

select pass('B2 server-only auth boundaries, grants, rate limits, and login-name resolution hold');
select * from finish();

rollback;
