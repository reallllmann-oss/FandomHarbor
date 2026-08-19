begin;

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'profiles',
    'memberships',
    'role_grants',
    'invitations',
    'invitation_redemptions',
    'audit_logs'
  ] loop
    if not exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = v_table
        and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled for public.%', v_table;
    end if;

    if pg_catalog.has_table_privilege('anon', 'public.' || v_table, 'select') then
      raise exception 'anon unexpectedly has SELECT on public.%', v_table;
    end if;
  end loop;

  if pg_catalog.has_function_privilege(
    'authenticated',
    'private.is_active_member(uuid)',
    'execute'
  ) or pg_catalog.has_function_privilege(
    'authenticated',
    'private.has_role(public.elevated_role,uuid)',
    'execute'
  ) then
    raise exception 'authenticated can execute parameterized private authorization helpers';
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
) values
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'super-admin@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'author@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'reader@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'unadmitted@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  );

select private.bootstrap_super_admin(
  '10000000-0000-4000-8000-000000000001',
  'Phase 1C test bootstrap'
);

insert into public.profiles (user_id)
values ('10000000-0000-4000-8000-000000000002');

insert into public.memberships (user_id, state, admitted_at)
values (
  '10000000-0000-4000-8000-000000000002',
  'active',
  statement_timestamp()
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);

do $$
begin
  perform public.revoke_role(auth.uid(), 'super_admin', 'Legacy deny proof');
  raise exception 'authenticated executed a legacy Role RPC';
exception
  when insufficient_privilege then
    null;
end;
$$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);

do $$
begin
  perform public.revoke_role(
    auth.uid(),
    'super_admin',
    'Final Super Admin protection regression'
  );
  raise exception using
    errcode = 'XX000',
    message = 'final Super Admin revocation unexpectedly succeeded';
exception
  when sqlstate 'P0001' then
    null;
end;
$$;

select public.grant_author_role_v2(
  '11000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  private.identity_access_state_token(
    '10000000-0000-4000-8000-000000000002'
  ),
  'Phase 1C v2 Author test grant'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000002',
  true
);

select public.create_invitation(
  repeat('a', 64),
  1,
  statement_timestamp() + interval '1 day'
);

do $$
begin
  perform public.create_invitation(
    repeat('a', 64),
    1,
    statement_timestamp() + interval '1 day'
  );
  raise exception using
    errcode = 'XX000',
    message = 'duplicate invitation hash unexpectedly succeeded';
exception
  when unique_violation then
    null;
end;
$$;

do $$
begin
  if (
    select count(*)
    from public.invitations
    where code_hash = repeat('a', 64)
  ) <> 1 then
    raise exception 'duplicate invitation hash changed stored invitations';
  end if;

  if (
    select use_count
    from public.invitations
    where code_hash = repeat('a', 64)
  ) <> 0 then
    raise exception 'duplicate invitation hash changed invitation use count';
  end if;
end;
$$;

reset role;

do $$
begin
  if (
    select count(*)
    from public.audit_logs
    where action = 'invitation.created'
      and target_id = (
        select id
        from public.invitations
        where code_hash = repeat('a', 64)
      )
  ) <> 1 then
    raise exception 'duplicate invitation hash changed successful audit records';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000003',
  true
);

select public.redeem_invitation(repeat('a', 64));

do $$
begin
  if not exists (
    select 1
    from public.memberships
    where user_id = auth.uid() and state = 'active'
  ) then
    raise exception 'redeemed user is not an active member';
  end if;

  if exists (
    select 1
    from public.role_grants
    where user_id = auth.uid() and revoked_at is null
  ) then
    raise exception 'invitation redemption granted an elevated role';
  end if;

  if (select count(*) from public.profiles) <> 1 then
    raise exception 'Reader RLS exposed another private profile';
  end if;
end;
$$;

do $$
begin
  perform public.redeem_invitation(repeat('a', 64));
  raise exception 'invitation replay unexpectedly succeeded';
exception
  when unique_violation then
    null;
end;
$$;

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000004',
  true
);

do $$
begin
  perform public.redeem_invitation(repeat('a', 64));
  raise exception using
    errcode = 'XX000',
    message = 'exhausted invitation unexpectedly succeeded';
exception
  when sqlstate 'P0001' then
    null;
end;
$$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);

select public.revoke_author_role_v2(
  '11000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  private.identity_access_state_token(
    '10000000-0000-4000-8000-000000000002'
  ),
  'Phase 1C v2 Author test revocation'
);

insert into public.role_grants (
  user_id,
  role,
  granted_by,
  grant_reason
) values (
  '10000000-0000-4000-8000-000000000003',
  'admin',
  '10000000-0000-4000-8000-000000000001',
  'Phase 1C admin test grant'
);

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000003',
  true
);

select public.grant_author_role_v2(
  '11000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000002',
  private.identity_access_state_token(
    '10000000-0000-4000-8000-000000000002'
  ),
  'Admin may grant Author through v2'
);

set local role authenticated;

do $$
begin
  perform public.grant_role(
    '10000000-0000-4000-8000-000000000002',
    'admin',
    'Admin must not grant Admin'
  );
  raise exception 'Admin granted Admin unexpectedly';
exception
  when insufficient_privilege then
    null;
end;
$$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-4000-8000-000000000001',
  true
);

do $$
begin
  perform public.set_ordinary_membership_state_v2(
    '11000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000003',
    'suspended',
    private.identity_access_state_token(
      '10000000-0000-4000-8000-000000000003'
    ),
    'Elevated Membership mutation must stay deferred'
  );
  raise exception 'v2 changed an elevated Membership unexpectedly';
exception
  when insufficient_privilege then
    null;
end;
$$;

select public.set_ordinary_membership_state_v2(
  '11000000-0000-4000-8000-000000000005',
  '10000000-0000-4000-8000-000000000002',
  'suspended',
  private.identity_access_state_token(
    '10000000-0000-4000-8000-000000000002'
  ),
  'Phase 1C ordinary Membership suspension test'
);

do $$
begin
  if private.is_active_member('10000000-0000-4000-8000-000000000002') then
    raise exception 'suspended membership retained active capability';
  end if;

  if not exists (
    select 1
    from public.audit_logs
    where action = 'invitation.redeemed'
  ) or not exists (
    select 1
    from public.audit_logs
    where action = 'membership.state_changed'
  ) or not exists (
    select 1
    from public.audit_logs
    where action = 'role.revoked'
  ) then
    raise exception 'required audit events are missing';
  end if;
end;
$$;

rollback;
