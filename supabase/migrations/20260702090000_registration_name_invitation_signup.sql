alter table public.profiles
  add column registration_name text;

alter table public.profiles
  add constraint profiles_registration_name_valid check (
    registration_name is null
    or (
      char_length(btrim(registration_name)) between 1 and 64
      and registration_name = btrim(registration_name)
      and registration_name !~ '[[:cntrl:]]'
    )
  );

create unique index profiles_registration_name_unique
  on public.profiles (lower(registration_name))
  where registration_name is not null;

create or replace function public.validate_registration_invitation(
  p_code_hash text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_code_hash is not null
    and p_code_hash ~ '^[0-9a-f]{64}$'
    and exists (
      select 1
      from public.invitations i
      where i.code_hash = p_code_hash
        and i.revoked_at is null
        and i.expires_at > statement_timestamp()
        and i.use_count < i.max_uses
    );
$$;

create or replace function private.register_identity_from_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_registration_name text;
  v_invitation_hash text;
  v_invitation public.invitations%rowtype;
  v_redemption_id uuid;
begin
  -- SQL fixtures and externally bootstrapped identities use an empty password hash.
  -- Password sign-up identities must always pass the invitation workflow below.
  if coalesce(new.encrypted_password, '') = '' then
    return new;
  end if;

  v_registration_name := btrim(
    coalesce(new.raw_user_meta_data ->> 'registration_name', '')
  );
  v_invitation_hash := new.raw_user_meta_data ->> 'invitation_code_hash';

  if char_length(v_registration_name) not between 1 and 64
    or v_registration_name ~ '[[:cntrl:]]' then
    raise exception using
      errcode = '22023',
      message = 'registration name is invalid';
  end if;

  if v_invitation_hash is null
    or v_invitation_hash !~ '^[0-9a-f]{64}$' then
    raise exception using
      errcode = '22023',
      message = 'invitation is required';
  end if;

  select * into v_invitation
  from public.invitations
  where code_hash = v_invitation_hash
  for update;

  if not found
    or v_invitation.revoked_at is not null
    or v_invitation.expires_at <= statement_timestamp()
    or v_invitation.use_count >= v_invitation.max_uses then
    raise exception using
      errcode = 'P0001',
      message = 'invitation is invalid or unavailable';
  end if;

  insert into public.profiles (user_id, registration_name)
  values (new.id, v_registration_name);

  insert into public.memberships (user_id, state, admitted_at)
  values (new.id, 'active', statement_timestamp());

  insert into public.invitation_redemptions (invitation_id, user_id)
  values (v_invitation.id, new.id)
  returning id into v_redemption_id;

  update public.invitations
  set use_count = use_count + 1
  where id = v_invitation.id;

  perform private.write_audit(
    new.id,
    'invitation.redeemed',
    'invitation_redemption',
    v_redemption_id,
    null,
    jsonb_build_object(
      'invitation_id', v_invitation.id,
      'registration_flow', 'atomic_signup'
    )
  );

  return new;
exception
  when unique_violation then
    raise exception using
      errcode = '23505',
      message = 'registration name is already in use';
end;
$$;

drop trigger if exists on_auth_user_registered on auth.users;
create trigger on_auth_user_registered
after insert on auth.users
for each row
execute function private.register_identity_from_invitation();

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

revoke all on function public.validate_registration_invitation(text) from public;
grant execute on function public.validate_registration_invitation(text)
  to anon, authenticated;

revoke all on function private.register_identity_from_invitation() from public;
revoke all on function private.register_identity_from_invitation()
  from anon, authenticated;
