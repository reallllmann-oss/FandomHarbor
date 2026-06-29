create or replace function public.grant_role(
  p_user_id uuid,
  p_role public.elevated_role,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_grant_id uuid;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if not private.is_active_member(p_user_id) then
    raise exception using errcode = '42501', message = 'target must be an active member';
  end if;

  if p_reason is null or length(btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;

  if p_role = 'author' then
    if not (
      private.has_role('admin', v_actor)
      or private.has_role('super_admin', v_actor)
    ) then
      raise exception using errcode = '42501', message = 'admin capability required';
    end if;
  elsif not private.has_role('super_admin', v_actor) then
    raise exception using errcode = '42501', message = 'super admin capability required';
  end if;

  if p_role = 'super_admin' then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('fandom-harbor:super-admin-role', 0)
    );
  end if;

  insert into public.role_grants (
    user_id,
    role,
    granted_by,
    grant_reason
  ) values (
    p_user_id,
    p_role,
    v_actor,
    btrim(p_reason)
  )
  returning id into v_grant_id;

  perform private.write_audit(
    v_actor,
    'role.granted',
    'role_grant',
    v_grant_id,
    btrim(p_reason),
    jsonb_build_object('user_id', p_user_id, 'role', p_role)
  );

  return v_grant_id;
end;
$$;

create or replace function public.revoke_role(
  p_user_id uuid,
  p_role public.elevated_role,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_grant public.role_grants%rowtype;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if p_reason is null or length(btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;

  if p_role = 'author' then
    if not (
      private.has_role('admin', v_actor)
      or private.has_role('super_admin', v_actor)
    ) then
      raise exception using errcode = '42501', message = 'admin capability required';
    end if;
  elsif not private.has_role('super_admin', v_actor) then
    raise exception using errcode = '42501', message = 'super admin capability required';
  end if;

  if p_role = 'super_admin' then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('fandom-harbor:super-admin-role', 0)
    );

    if (
      select count(*)
      from public.role_grants rg
      join public.memberships m on m.user_id = rg.user_id
      where rg.role = 'super_admin'
        and rg.revoked_at is null
        and m.state = 'active'
    ) <= 1 then
      raise exception using errcode = 'P0001', message = 'cannot revoke the final super admin';
    end if;
  end if;

  select * into v_grant
  from public.role_grants
  where user_id = p_user_id
    and role = p_role
    and revoked_at is null
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'active role grant not found';
  end if;

  update public.role_grants
  set revoked_by = v_actor,
      revoked_at = statement_timestamp(),
      revoke_reason = btrim(p_reason)
  where id = v_grant.id;

  perform private.write_audit(
    v_actor,
    'role.revoked',
    'role_grant',
    v_grant.id,
    btrim(p_reason),
    jsonb_build_object('user_id', p_user_id, 'role', p_role)
  );
end;
$$;

create or replace function public.set_membership_state(
  p_user_id uuid,
  p_state public.membership_state,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_old_state public.membership_state;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if not (
    private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using errcode = '42501', message = 'admin capability required';
  end if;

  if p_reason is null or length(btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;

  if p_user_id = v_actor and p_state in ('suspended', 'revoked') then
    raise exception using errcode = '42501', message = 'cannot disable own membership';
  end if;

  if not private.has_role('super_admin', v_actor) and exists (
    select 1
    from public.role_grants
    where user_id = p_user_id
      and role in ('admin', 'super_admin')
      and revoked_at is null
  ) then
    raise exception using errcode = '42501', message = 'super admin capability required';
  end if;

  if exists (
    select 1
    from public.role_grants
    where user_id = p_user_id
      and role = 'super_admin'
      and revoked_at is null
  ) then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('fandom-harbor:super-admin-role', 0)
    );

    if p_state in ('suspended', 'revoked') and (
      select count(*)
      from public.role_grants rg
      join public.memberships m on m.user_id = rg.user_id
      where rg.role = 'super_admin'
        and rg.revoked_at is null
        and m.state = 'active'
    ) <= 1 then
      raise exception using errcode = 'P0001', message = 'cannot disable the final active super admin';
    end if;
  end if;

  select state into v_old_state
  from public.memberships
  where user_id = p_user_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'membership not found';
  end if;

  update public.memberships
  set state = p_state,
      admitted_at = case
        when p_state <> 'pending' then coalesce(admitted_at, statement_timestamp())
        else null
      end,
      suspended_at = case when p_state = 'suspended' then statement_timestamp() else null end,
      revoked_at = case when p_state = 'revoked' then statement_timestamp() else null end,
      updated_at = statement_timestamp()
  where user_id = p_user_id;

  perform private.write_audit(
    v_actor,
    'membership.state_changed',
    'membership',
    p_user_id,
    btrim(p_reason),
    jsonb_build_object('from', v_old_state, 'to', p_state)
  );
end;
$$;

create or replace function private.bootstrap_super_admin(
  p_user_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grant_id uuid;
begin
  if p_reason is null or length(btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('fandom-harbor:super-admin-role', 0)
  );

  if exists (
    select 1 from public.role_grants
    where role = 'super_admin' and revoked_at is null
  ) then
    raise exception using errcode = 'P0001', message = 'super admin already exists';
  end if;

  if not exists (
    select 1 from auth.users
    where id = p_user_id and email_confirmed_at is not null
  ) then
    raise exception using errcode = 'P0002', message = 'verified auth user not found';
  end if;

  insert into public.profiles (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  insert into public.memberships (user_id, state, admitted_at)
  values (p_user_id, 'active', statement_timestamp())
  on conflict (user_id) do update
  set state = 'active',
      admitted_at = coalesce(public.memberships.admitted_at, statement_timestamp()),
      suspended_at = null,
      revoked_at = null,
      updated_at = statement_timestamp();

  insert into public.role_grants (user_id, role, granted_by, grant_reason)
  values (p_user_id, 'super_admin', null, btrim(p_reason))
  returning id into v_grant_id;

  perform private.write_audit(
    null,
    'role.bootstrap_super_admin',
    'role_grant',
    v_grant_id,
    btrim(p_reason),
    jsonb_build_object('user_id', p_user_id)
  );

  return v_grant_id;
end;
$$;

revoke all on function public.grant_role(uuid, public.elevated_role, text) from public;
revoke all on function public.revoke_role(uuid, public.elevated_role, text) from public;
revoke all on function public.set_membership_state(uuid, public.membership_state, text) from public;
revoke all on function private.bootstrap_super_admin(uuid, text) from public;

grant execute on function public.grant_role(uuid, public.elevated_role, text) to authenticated;
grant execute on function public.revoke_role(uuid, public.elevated_role, text) to authenticated;
grant execute on function public.set_membership_state(uuid, public.membership_state, text) to authenticated;
