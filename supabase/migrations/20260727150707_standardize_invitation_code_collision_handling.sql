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
  on conflict (code_hash) do nothing
  returning id into v_invitation_id;

  if v_invitation_id is null then
    return null;
  end if;

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

revoke all on function public.create_invitation(text, integer, timestamptz)
  from public;
grant execute on function public.create_invitation(text, integer, timestamptz)
  to authenticated;
