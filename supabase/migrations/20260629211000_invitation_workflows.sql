create or replace function public.create_invitation(
  p_code_hash text,
  p_max_uses integer,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_invitation_id uuid;
  v_parent_invitation_id uuid;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if not (
    private.has_role('author', v_actor)
    or private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using errcode = '42501', message = 'author capability required';
  end if;

  if p_code_hash is null or p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid invitation hash';
  end if;

  if p_max_uses is null or p_max_uses <= 0 then
    raise exception using errcode = '22023', message = 'max uses must be positive';
  end if;

  if p_expires_at is null or p_expires_at <= statement_timestamp() then
    raise exception using errcode = '22023', message = 'expiry must be in the future';
  end if;

  select ir.invitation_id
  into v_parent_invitation_id
  from public.invitation_redemptions ir
  where ir.user_id = v_actor;

  insert into public.invitations (
    code_hash,
    inviter_user_id,
    parent_invitation_id,
    max_uses,
    expires_at
  ) values (
    p_code_hash,
    v_actor,
    v_parent_invitation_id,
    p_max_uses,
    p_expires_at
  )
  returning id into v_invitation_id;

  perform private.write_audit(
    v_actor,
    'invitation.created',
    'invitation',
    v_invitation_id,
    null,
    jsonb_build_object('max_uses', p_max_uses, 'expires_at', p_expires_at)
  );

  return v_invitation_id;
end;
$$;

create or replace function public.revoke_invitation(
  p_invitation_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_invitation public.invitations%rowtype;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if p_reason is null or length(btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;

  select * into v_invitation
  from public.invitations
  where id = p_invitation_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'invitation not found';
  end if;

  if not (
    v_invitation.inviter_user_id = v_actor
    or private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using errcode = '42501', message = 'invitation management denied';
  end if;

  if v_invitation.revoked_at is null then
    update public.invitations
    set revoked_by = v_actor,
        revoked_at = statement_timestamp(),
        revoke_reason = btrim(p_reason)
    where id = p_invitation_id;

    perform private.write_audit(
      v_actor,
      'invitation.revoked',
      'invitation',
      p_invitation_id,
      btrim(p_reason),
      '{}'::jsonb
    );
  end if;
end;
$$;

create or replace function public.redeem_invitation(p_code_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_invitation public.invitations%rowtype;
  v_redemption_id uuid;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if not exists (
    select 1
    from auth.users u
    where u.id = v_actor
      and u.email_confirmed_at is not null
  ) then
    raise exception using errcode = '42501', message = 'verified email required';
  end if;

  if p_code_hash is null or p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'invalid invitation hash';
  end if;

  if exists (
    select 1 from public.invitation_redemptions where user_id = v_actor
  ) or exists (
    select 1 from public.memberships where user_id = v_actor
  ) then
    raise exception using errcode = '23505', message = 'account already admitted';
  end if;

  select * into v_invitation
  from public.invitations
  where code_hash = p_code_hash
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'invitation not found';
  end if;

  if v_invitation.revoked_at is not null then
    raise exception using errcode = 'P0001', message = 'invitation revoked';
  end if;

  if v_invitation.expires_at <= statement_timestamp() then
    raise exception using errcode = 'P0001', message = 'invitation expired';
  end if;

  if v_invitation.use_count >= v_invitation.max_uses then
    raise exception using errcode = 'P0001', message = 'invitation exhausted';
  end if;

  insert into public.profiles (user_id) values (v_actor);

  insert into public.memberships (user_id, state, admitted_at)
  values (v_actor, 'active', statement_timestamp());

  insert into public.invitation_redemptions (invitation_id, user_id)
  values (v_invitation.id, v_actor)
  returning id into v_redemption_id;

  update public.invitations
  set use_count = use_count + 1
  where id = v_invitation.id;

  perform private.write_audit(
    v_actor,
    'invitation.redeemed',
    'invitation_redemption',
    v_redemption_id,
    null,
    jsonb_build_object('invitation_id', v_invitation.id)
  );

  return v_redemption_id;
end;
$$;

revoke all on function public.create_invitation(text, integer, timestamptz) from public;
revoke all on function public.revoke_invitation(uuid, text) from public;
revoke all on function public.redeem_invitation(text) from public;

grant execute on function public.create_invitation(text, integer, timestamptz) to authenticated;
grant execute on function public.revoke_invitation(uuid, text) to authenticated;
grant execute on function public.redeem_invitation(text) to authenticated;
