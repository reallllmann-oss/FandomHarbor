create schema if not exists extensions;
create schema if not exists private;

create extension if not exists pgcrypto with schema extensions;

create type public.membership_state as enum (
  'pending',
  'active',
  'suspended',
  'revoked'
);

create type public.elevated_role as enum (
  'author',
  'admin',
  'super_admin'
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table public.memberships (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  state public.membership_state not null default 'pending',
  admitted_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  updated_at timestamptz not null default statement_timestamp(),
  constraint membership_admission_time check (
    (state = 'pending' and admitted_at is null)
    or (state <> 'pending' and admitted_at is not null)
  )
);

create table public.role_grants (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  role public.elevated_role not null,
  granted_by uuid references public.profiles (user_id) on delete restrict,
  granted_at timestamptz not null default statement_timestamp(),
  grant_reason text not null check (length(btrim(grant_reason)) between 1 and 1000),
  revoked_by uuid references public.profiles (user_id) on delete restrict,
  revoked_at timestamptz,
  revoke_reason text,
  constraint role_revocation_complete check (
    (revoked_at is null and revoked_by is null and revoke_reason is null)
    or (
      revoked_at is not null
      and revoked_by is not null
      and length(btrim(revoke_reason)) between 1 and 1000
    )
  )
);

create unique index role_grants_one_active_role
  on public.role_grants (user_id, role)
  where revoked_at is null;

create index role_grants_user_history
  on public.role_grants (user_id, granted_at desc);

create table public.invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  inviter_user_id uuid not null references public.profiles (user_id) on delete restrict,
  parent_invitation_id uuid references public.invitations (id) on delete restrict,
  max_uses integer not null check (max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0 and use_count <= max_uses),
  expires_at timestamptz not null,
  created_at timestamptz not null default statement_timestamp(),
  revoked_by uuid references public.profiles (user_id) on delete restrict,
  revoked_at timestamptz,
  revoke_reason text,
  constraint invitation_expiry_after_creation check (expires_at > created_at),
  constraint invitation_revocation_complete check (
    (revoked_at is null and revoked_by is null and revoke_reason is null)
    or (
      revoked_at is not null
      and revoked_by is not null
      and length(btrim(revoke_reason)) between 1 and 1000
    )
  )
);

create index invitations_inviter_created
  on public.invitations (inviter_user_id, created_at desc);

create index invitations_parent
  on public.invitations (parent_invitation_id)
  where parent_invitation_id is not null;

create table public.invitation_redemptions (
  id uuid primary key default extensions.gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete restrict,
  user_id uuid not null unique references public.profiles (user_id) on delete restrict,
  redeemed_at timestamptz not null default statement_timestamp()
);

create index invitation_redemptions_invitation
  on public.invitation_redemptions (invitation_id, redeemed_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles (user_id) on delete restrict,
  action text not null check (length(btrim(action)) between 1 and 120),
  target_type text not null check (length(btrim(target_type)) between 1 and 120),
  target_id uuid,
  reason text check (reason is null or length(btrim(reason)) between 1 and 1000),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default statement_timestamp(),
  constraint audit_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index audit_logs_actor_time
  on public.audit_logs (actor_user_id, created_at desc);

create index audit_logs_target_time
  on public.audit_logs (target_type, target_id, created_at desc);

create or replace function private.is_active_member(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = p_user_id
      and m.state = 'active'
  );
$$;

create or replace function private.has_role(
  p_role public.elevated_role,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_active_member(p_user_id)
    and exists (
      select 1
      from public.role_grants rg
      where rg.user_id = p_user_id
        and rg.role = p_role
        and rg.revoked_at is null
    );
$$;

create or replace function private.current_user_has_role(
  p_role public.elevated_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role(p_role, auth.uid());
$$;

create or replace function private.write_audit(
  p_actor_user_id uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  insert into public.audit_logs (
    actor_user_id,
    action,
    target_type,
    target_id,
    reason,
    metadata
  ) values (
    p_actor_user_id,
    p_action,
    p_target_type,
    p_target_id,
    p_reason,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function private.is_active_member(uuid) from public;
revoke all on function private.has_role(public.elevated_role, uuid) from public;
revoke all on function private.current_user_has_role(public.elevated_role) from public;
revoke all on function private.write_audit(uuid, text, text, uuid, text, jsonb) from public;

grant usage on schema private to authenticated;
grant execute on function private.current_user_has_role(public.elevated_role) to authenticated;

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.role_grants enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_redemptions enable row level security;
alter table public.audit_logs enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.memberships from anon, authenticated;
revoke all on public.role_grants from anon, authenticated;
revoke all on public.invitations from anon, authenticated;
revoke all on public.invitation_redemptions from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.memberships to authenticated;
grant select on public.role_grants to authenticated;
grant select on public.invitations to authenticated;
grant select on public.invitation_redemptions to authenticated;
grant select on public.audit_logs to authenticated;

create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy memberships_select_own_or_admin
on public.memberships
for select
to authenticated
using (
  user_id = auth.uid()
  or private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy role_grants_select_own_or_admin
on public.role_grants
for select
to authenticated
using (
  user_id = auth.uid()
  or private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy invitations_select_own_or_admin
on public.invitations
for select
to authenticated
using (
  inviter_user_id = auth.uid()
  or private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy invitation_redemptions_select_own_or_admin
on public.invitation_redemptions
for select
to authenticated
using (
  user_id = auth.uid()
  or private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

create policy audit_logs_select_admin
on public.audit_logs
for select
to authenticated
using (
  private.current_user_has_role('admin')
  or private.current_user_has_role('super_admin')
);

comment on table public.memberships is
  'Archive admission state. Active membership provides Reader capability.';
comment on table public.role_grants is
  'Manual, auditable elevated roles only; Reader is derived from active membership.';
comment on table public.audit_logs is
  'Append-only security-significant action history.';
