-- Package B1: trusted email registration, two-hour invitation reservations,
-- and atomic membership activation. The feature remains disabled until an
-- operator changes the private registration mode in a controlled deployment.

create table private.registration_settings (
  singleton boolean primary key default true check (singleton),
  mode text not null default 'legacy' check (mode in ('legacy', 'email_required')),
  updated_at timestamptz not null default statement_timestamp()
);

insert into private.registration_settings (singleton, mode)
values (true, 'legacy')
on conflict (singleton) do nothing;

create table private.registration_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  registration_name text not null,
  login_name_key text not null,
  invitation_id uuid not null references public.invitations (id) on delete restrict,
  proof_hash text not null check (proof_hash ~ '^[0-9a-f]{64}$'),
  email_binding_hash text not null check (email_binding_hash ~ '^[0-9a-f]{64}$'),
  expected_auth_user_id uuid not null unique,
  auth_email_binding_hash text not null check (
    auth_email_binding_hash ~ '^[0-9a-f]{64}$'
  ),
  proof_expires_at timestamptz not null,
  proof_consumed_at timestamptz,
  auth_user_id uuid references auth.users (id) on delete restrict
    deferrable initially deferred,
  status text not null default 'prepared' check (
    status in (
      'prepared',
      'claimed',
      'auth_created',
      'verified_pending',
      'activated',
      'blocked',
      'released',
      'expired'
    )
  ),
  expires_at timestamptz not null,
  created_at timestamptz not null default statement_timestamp(),
  claimed_at timestamptz,
  auth_created_at timestamptz,
  activated_at timestamptz,
  terminal_reason text,
  updated_at timestamptz not null default statement_timestamp(),
  constraint registration_attempt_expiry_after_creation
    check (expires_at > created_at),
  constraint registration_attempt_proof_expiry check (
    proof_expires_at > created_at
    and proof_expires_at <= expires_at
  ),
  constraint registration_attempt_proof_consumption check (
    (status in ('prepared', 'released', 'expired') and proof_consumed_at is null)
    or (status in ('claimed', 'auth_created', 'verified_pending', 'activated', 'blocked')
      and proof_consumed_at is not null)
  ),
  constraint registration_attempt_auth_binding check (
    (status in ('prepared', 'released', 'expired') and auth_user_id is null)
    or (status in ('claimed', 'auth_created', 'verified_pending', 'activated', 'blocked')
      and auth_user_id is not null)
  )
);

create unique index registration_attempts_auth_user_unique
  on private.registration_attempts (auth_user_id)
  where auth_user_id is not null;

create index registration_attempts_invitation_status_expiry
  on private.registration_attempts (invitation_id, status, expires_at);

create table private.login_name_claims (
  login_name_key text primary key,
  registration_name text not null,
  attempt_id uuid unique references private.registration_attempts (id) on delete restrict,
  user_id uuid unique references auth.users (id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint login_name_claim_single_owner check (
    (attempt_id is not null and user_id is null)
    or (attempt_id is null and user_id is not null)
  )
);

create table private.invitation_reservations (
  id uuid primary key default extensions.gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete restrict,
  attempt_id uuid not null unique references private.registration_attempts (id) on delete restrict,
  auth_user_id uuid references auth.users (id) on delete restrict
    deferrable initially deferred,
  status text not null default 'reserved' check (
    status in ('reserved', 'consumed', 'released', 'expired')
  ),
  expires_at timestamptz not null,
  created_at timestamptz not null default statement_timestamp(),
  consumed_at timestamptz,
  released_at timestamptz,
  release_reason text,
  updated_at timestamptz not null default statement_timestamp(),
  constraint invitation_reservation_expiry_after_creation
    check (expires_at > created_at),
  constraint invitation_reservation_terminal_state check (
    (status = 'reserved' and consumed_at is null and released_at is null)
    or (status = 'consumed' and consumed_at is not null and released_at is null)
    or (status in ('released', 'expired') and consumed_at is null and released_at is not null)
  )
);

create unique index invitation_reservations_one_reserved_per_auth_user
  on private.invitation_reservations (auth_user_id)
  where auth_user_id is not null and status = 'reserved';

create index invitation_reservations_capacity
  on private.invitation_reservations (invitation_id, expires_at)
  where status = 'reserved';

alter table private.registration_settings enable row level security;
alter table private.registration_attempts enable row level security;
alter table private.login_name_claims enable row level security;
alter table private.invitation_reservations enable row level security;

revoke all on private.registration_settings from public, anon, authenticated;
revoke all on private.registration_attempts from public, anon, authenticated;
revoke all on private.login_name_claims from public, anon, authenticated;
revoke all on private.invitation_reservations from public, anon, authenticated;

create or replace function private.canonical_registration_name(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.lower(
    pg_catalog."normalize"(pg_catalog.btrim(coalesce(p_name, '')), 'NFKC')
  );
$$;

create or replace function private.canonical_auth_email(p_email text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.lower(pg_catalog.btrim(coalesce(p_email, '')));
$$;

create or replace function private.registration_proof_hash(p_proof text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_proof ~ '^[0-9a-f]{64}$'
      then pg_catalog.encode(
        extensions.digest(pg_catalog.decode(p_proof, 'hex'), 'sha256'),
        'hex'
      )
    else null
  end;
$$;

create or replace function private.registration_email_binding_hash(
  p_email text,
  p_proof text
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_proof ~ '^[0-9a-f]{64}$'
      and private.canonical_auth_email(p_email) ~ '^[^@[:space:]]+@[^@[:space:]]+$'
      then pg_catalog.encode(
        extensions.digest(
          pg_catalog.convert_to(private.canonical_auth_email(p_email), 'UTF8')
            || pg_catalog.decode('00', 'hex')
            || pg_catalog.decode(p_proof, 'hex'),
          'sha256'
        ),
        'hex'
      )
    else null
  end;
$$;

create or replace function private.registration_auth_email_binding_hash(
  p_email text,
  p_auth_user_id uuid
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_auth_user_id is not null
      and private.canonical_auth_email(p_email) ~ '^[^@[:space:]]+@[^@[:space:]]+$'
      then pg_catalog.encode(
        extensions.digest(
          pg_catalog.convert_to(private.canonical_auth_email(p_email), 'UTF8')
            || pg_catalog.decode('00', 'hex')
            || pg_catalog.uuid_send(p_auth_user_id),
          'sha256'
        ),
        'hex'
      )
    else null
  end;
$$;

revoke all on function private.canonical_registration_name(text) from public, anon, authenticated;
revoke all on function private.canonical_auth_email(text) from public, anon, authenticated;
revoke all on function private.registration_proof_hash(text) from public, anon, authenticated;
revoke all on function private.registration_email_binding_hash(text, text) from public, anon, authenticated;
revoke all on function private.registration_auth_email_binding_hash(text, uuid)
  from public, anon, authenticated, service_role;

-- A collision here is a deliberate migration Stop Gate. It prevents two
-- existing identities that normalize to one login key from being hidden by
-- an arbitrary winner.
insert into private.login_name_claims (
  login_name_key,
  registration_name,
  user_id
)
select
  private.canonical_registration_name(p.registration_name),
  p.registration_name,
  p.user_id
from public.profiles p
where p.registration_name is not null;

create or replace function private.current_registration_mode()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select rs.mode
  from private.registration_settings rs
  where rs.singleton;
$$;

revoke all on function private.current_registration_mode() from public, anon, authenticated;

create or replace function private.read_registration_invitation(p_invitation_id uuid)
returns table (
  invitation_id uuid,
  invitation_expires_at timestamptz,
  invitation_revoked_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.expires_at, i.revoked_at
  from public.invitations i
  where i.id = p_invitation_id;
$$;

revoke all on function private.read_registration_invitation(uuid)
  from public, anon, authenticated, service_role;

create or replace function private.prepare_email_registration_at(
  p_registration_name text,
  p_email text,
  p_code_hash text,
  p_existing_attempt_id uuid,
  p_existing_proof text,
  p_now timestamptz
)
returns table (
  attempt_id uuid,
  expected_auth_user_id uuid,
  attempt_proof text,
  proof_expires_at timestamptz,
  reservation_expires_at timestamptz,
  attempt_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := pg_catalog.btrim(coalesce(p_registration_name, ''));
  v_name_key text := private.canonical_registration_name(p_registration_name);
  v_email text := private.canonical_auth_email(p_email);
  v_invitation public.invitations%rowtype;
  v_attempt private.registration_attempts%rowtype;
  v_existing_claim private.login_name_claims%rowtype;
  v_attempt_id uuid;
  v_expected_auth_user_id uuid;
  v_proof text;
  v_proof_expiry timestamptz;
  v_expiry timestamptz;
  v_reserved_count bigint;
begin
  if p_now is null then
    raise exception using errcode = '22023', message = 'registration unavailable';
  end if;

  if char_length(v_name) not between 1 and 64
    or v_name ~ '[[:cntrl:]]'
    or v_name_key = '' then
    raise exception using errcode = '22023', message = 'registration unavailable';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+$'
    or p_code_hash is null
    or p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception using errcode = '22023', message = 'registration unavailable';
  end if;

  if p_existing_attempt_id is not null or p_existing_proof is not null then
    if p_existing_attempt_id is null
      or private.registration_proof_hash(p_existing_proof) is null then
      raise exception using errcode = 'P0001', message = 'registration unavailable';
    end if;

    select ra.* into v_attempt
    from private.registration_attempts ra
    where ra.id = p_existing_attempt_id
    for update;

    if found then
      select i.* into v_invitation
      from public.invitations i
      where i.id = v_attempt.invitation_id
        and i.code_hash = p_code_hash
      for update;

      if found
        and v_attempt.status = 'prepared'
        and v_attempt.expires_at > p_now
        and v_attempt.login_name_key = v_name_key
        and v_attempt.proof_hash = private.registration_proof_hash(p_existing_proof)
        and v_attempt.email_binding_hash =
          private.registration_email_binding_hash(v_email, p_existing_proof)
        and v_invitation.revoked_at is null
        and v_invitation.expires_at > p_now then
        if v_attempt.proof_expires_at <= p_now then
          v_proof := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');
          v_proof_expiry := least(
            p_now + interval '15 minutes',
            v_attempt.expires_at
          );

          update private.registration_attempts ra
          set proof_hash = private.registration_proof_hash(v_proof),
              email_binding_hash =
                private.registration_email_binding_hash(v_email, v_proof),
              proof_expires_at = v_proof_expiry,
              updated_at = p_now
          where ra.id = v_attempt.id
            and ra.status = 'prepared'
            and ra.proof_hash = private.registration_proof_hash(p_existing_proof);

          if not found then
            raise exception using errcode = 'P0001', message = 'registration unavailable';
          end if;

          perform private.write_audit(
            null,
            'registration.proof_rotated',
            'registration_attempt',
            v_attempt.id,
            null,
            jsonb_build_object(
              'proof_expires_at', v_proof_expiry,
              'reservation_expires_at', v_attempt.expires_at
            )
          );

          return query select
            v_attempt.id,
            v_attempt.expected_auth_user_id,
            v_proof,
            v_proof_expiry,
            v_attempt.expires_at,
            v_attempt.status;
          return;
        end if;

        return query select
          v_attempt.id,
          v_attempt.expected_auth_user_id,
          p_existing_proof,
          v_attempt.proof_expires_at,
          v_attempt.expires_at,
          v_attempt.status;
        return;
      end if;
    end if;

    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  select i.* into v_invitation
  from public.invitations i
  where i.code_hash = p_code_hash
  for update;

  if not found
    or v_invitation.revoked_at is not null
    or v_invitation.expires_at <= p_now then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  select lnc.* into v_existing_claim
  from private.login_name_claims lnc
  where lnc.login_name_key = v_name_key
  for update;

  if found and v_existing_claim.attempt_id is not null then
    select ra.* into v_attempt
    from private.registration_attempts ra
    where ra.id = v_existing_claim.attempt_id
    for update;

    if v_attempt.status = 'prepared' and v_attempt.expires_at <= p_now then
      update private.invitation_reservations ir
      set status = 'expired',
          released_at = p_now,
          release_reason = 'reservation_expired',
          updated_at = p_now
      where ir.attempt_id = v_attempt.id
        and ir.status = 'reserved';

      update private.registration_attempts ra
      set status = 'expired',
          terminal_reason = 'reservation_expired',
          updated_at = p_now
      where ra.id = v_attempt.id;

      delete from private.login_name_claims lnc
      where lnc.login_name_key = v_name_key
        and lnc.attempt_id = v_attempt.id;
    else
      raise exception using errcode = '23505', message = 'registration unavailable';
    end if;
  elsif found then
    raise exception using errcode = '23505', message = 'registration unavailable';
  end if;

  select count(*) into v_reserved_count
  from private.invitation_reservations ir
  where ir.invitation_id = v_invitation.id
    and ir.status = 'reserved'
    and ir.expires_at > p_now;

  if v_invitation.use_count + v_reserved_count >= v_invitation.max_uses then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  v_attempt_id := extensions.gen_random_uuid();
  v_expected_auth_user_id := extensions.gen_random_uuid();
  v_proof := pg_catalog.encode(extensions.gen_random_bytes(32), 'hex');
  v_expiry := least(p_now + interval '2 hours', v_invitation.expires_at);
  v_proof_expiry := least(p_now + interval '15 minutes', v_expiry);

  insert into private.registration_attempts (
    id,
    registration_name,
    login_name_key,
    invitation_id,
    proof_hash,
    email_binding_hash,
    expected_auth_user_id,
    auth_email_binding_hash,
    proof_expires_at,
    status,
    expires_at,
    created_at,
    updated_at
  ) values (
    v_attempt_id,
    v_name,
    v_name_key,
    v_invitation.id,
    private.registration_proof_hash(v_proof),
    private.registration_email_binding_hash(v_email, v_proof),
    v_expected_auth_user_id,
    private.registration_auth_email_binding_hash(
      v_email,
      v_expected_auth_user_id
    ),
    v_proof_expiry,
    'prepared',
    v_expiry,
    p_now,
    p_now
  );

  insert into private.login_name_claims (
    login_name_key,
    registration_name,
    attempt_id,
    created_at,
    updated_at
  ) values (
    v_name_key,
    v_name,
    v_attempt_id,
    p_now,
    p_now
  );

  insert into private.invitation_reservations (
    invitation_id,
    attempt_id,
    status,
    expires_at,
    created_at,
    updated_at
  ) values (
    v_invitation.id,
    v_attempt_id,
    'reserved',
    v_expiry,
    p_now,
    p_now
  );

  perform private.write_audit(
    null,
    'registration.attempt_prepared',
    'registration_attempt',
    v_attempt_id,
    null,
    jsonb_build_object(
      'invitation_id', v_invitation.id,
      'proof_expires_at', v_proof_expiry,
      'reservation_expires_at', v_expiry
    )
  );

  return query select
    v_attempt_id,
    v_expected_auth_user_id,
    v_proof,
    v_proof_expiry,
    v_expiry,
    'prepared'::text;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'registration unavailable';
end;
$$;

create or replace function public.prepare_email_registration(
  p_registration_name text,
  p_email text,
  p_code_hash text,
  p_existing_attempt_id uuid default null,
  p_existing_proof text default null
)
returns table (
  attempt_id uuid,
  expected_auth_user_id uuid,
  attempt_proof text,
  proof_expires_at timestamptz,
  reservation_expires_at timestamptz,
  attempt_status text
)
language sql
volatile
security definer
set search_path = ''
as $$
  select *
  from private.prepare_email_registration_at(
    p_registration_name,
    p_email,
    p_code_hash,
    p_existing_attempt_id,
    p_existing_proof,
    statement_timestamp()
  );
$$;

create or replace function public.registration_attempt_status(
  p_attempt_id uuid,
  p_attempt_proof text
)
returns table (
  attempt_status text,
  reservation_expires_at timestamptz,
  auth_user_created boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    case
      when ra.status = 'prepared' and ra.expires_at <= statement_timestamp()
        then 'expired'
      else ra.status
    end,
    ra.expires_at,
    ra.auth_user_id is not null
  from private.registration_attempts ra
  where ra.id = p_attempt_id
    and ra.proof_hash = private.registration_proof_hash(p_attempt_proof);
$$;

create or replace function public.release_email_registration(
  p_attempt_id uuid,
  p_attempt_proof text,
  p_reason text default 'auth_creation_failed'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt private.registration_attempts%rowtype;
  v_now timestamptz := statement_timestamp();
begin
  select ra.* into v_attempt
  from private.registration_attempts ra
  where ra.id = p_attempt_id
    and ra.proof_hash = private.registration_proof_hash(p_attempt_proof)
  for update;

  if not found then
    return false;
  end if;

  if v_attempt.status in ('released', 'expired') then
    return true;
  end if;

  -- Claimed/created attempts are deliberately not releasable from an
  -- ambiguous network response. Their Auth UID or natural expiry decides.
  if v_attempt.status <> 'prepared' or v_attempt.auth_user_id is not null then
    return false;
  end if;

  update private.invitation_reservations ir
  set status = 'released',
      released_at = v_now,
      release_reason = left(coalesce(nullif(btrim(p_reason), ''), 'auth_creation_failed'), 120),
      updated_at = v_now
  where ir.attempt_id = v_attempt.id
    and ir.status = 'reserved';

  delete from private.login_name_claims lnc
  where lnc.attempt_id = v_attempt.id;

  update private.registration_attempts ra
  set status = 'released',
      terminal_reason = left(coalesce(nullif(btrim(p_reason), ''), 'auth_creation_failed'), 120),
      updated_at = v_now
  where ra.id = v_attempt.id;

  perform private.write_audit(
    null,
    'registration.attempt_released',
    'registration_attempt',
    v_attempt.id,
    left(coalesce(nullif(btrim(p_reason), ''), 'auth_creation_failed'), 120),
    '{}'::jsonb
  );

  return true;
end;
$$;

revoke all on function private.prepare_email_registration_at(text, text, text, uuid, text, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function public.prepare_email_registration(text, text, text, uuid, text)
  from public, anon, authenticated;
revoke all on function public.registration_attempt_status(uuid, text)
  from public, anon, authenticated;
revoke all on function public.release_email_registration(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.prepare_email_registration(text, text, text, uuid, text)
  to service_role;
grant execute on function public.registration_attempt_status(uuid, text)
  to service_role;
grant execute on function public.release_email_registration(uuid, text, text)
  to service_role;

create or replace function private.validate_email_registration_at(
  p_event jsonb,
  p_now timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_mode text;
begin
  if p_event is null or p_now is null then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  select rs.mode into v_mode
  from private.registration_settings rs
  where rs.singleton;

  if v_mode = 'legacy' then
    return true;
  end if;

  -- V1 email-required registrations are created only through the server-only
  -- Auth Admin endpoint with a database-preallocated UUID. Public Signup is
  -- therefore fail-closed and never receives an attempt proof in metadata.
  raise exception using errcode = 'P0001', message = 'registration unavailable';
end;
$$;

create or replace function private.before_user_created_email_registration(p_event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform private.validate_email_registration_at(p_event, statement_timestamp());
  return '{}'::jsonb;
exception
  when others then
    return jsonb_build_object(
      'error',
      jsonb_build_object(
        'http_code', 400,
        'message', 'Registration could not be completed.'
      )
    );
end;
$$;

revoke all on function private.validate_email_registration_at(jsonb, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function private.before_user_created_email_registration(jsonb)
  from public, anon, authenticated, service_role;

grant execute on function private.before_user_created_email_registration(jsonb)
  to supabase_auth_admin;
grant execute on function private.validate_email_registration_at(jsonb, timestamptz)
  to supabase_auth_admin;
grant select on private.registration_settings to supabase_auth_admin;
grant usage on schema private to supabase_auth_admin;

create policy registration_settings_auth_hook_select
on private.registration_settings
for select
to supabase_auth_admin
using (true);

create or replace function private.guard_email_registration_auth_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mode text := private.current_registration_mode();
  v_invitation_id uuid;
  v_invitation public.invitations%rowtype;
  v_attempt private.registration_attempts%rowtype;
  v_reservation private.invitation_reservations%rowtype;
  v_claimed_id uuid;
begin
  -- Preserve existing SQL bootstrap/test fixtures and the legacy path while
  -- the additive feature flag is off.
  if coalesce(new.encrypted_password, '') = '' or v_mode = 'legacy' then
    return new;
  end if;

  if new.email_confirmed_at is not null then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  select ra.invitation_id into v_invitation_id
  from private.registration_attempts ra
  where ra.expected_auth_user_id = new.id;

  if v_invitation_id is null then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  -- Match the lock order used by prepare, revoke, and activation. The Hook is
  -- intentionally read-only; this trigger closes every race before claiming.
  select i.* into v_invitation
  from public.invitations i
  where i.id = v_invitation_id
  for update;

  select ra.* into v_attempt
  from private.registration_attempts ra
  where ra.expected_auth_user_id = new.id
  for update;

  select ir.* into v_reservation
  from private.invitation_reservations ir
  where ir.attempt_id = v_attempt.id
  for update;

  if v_invitation.id is null
    or v_attempt.id is null
    or v_attempt.status <> 'prepared'
    or v_attempt.auth_user_id is not null
    or v_attempt.proof_consumed_at is not null
    or v_attempt.proof_expires_at <= statement_timestamp()
    or v_attempt.expires_at <= statement_timestamp()
    or v_attempt.expected_auth_user_id <> new.id
    or v_attempt.auth_email_binding_hash <>
      private.registration_auth_email_binding_hash(new.email, new.id)
    or coalesce(new.raw_user_meta_data, '{}'::jsonb) ?| array[
      '_fh_registration_attempt',
      '_fh_registration_proof'
    ]
    or v_reservation.id is null
    or v_reservation.invitation_id <> v_invitation.id
    or v_reservation.status <> 'reserved'
    or v_reservation.auth_user_id is not null
    or v_reservation.expires_at <> v_attempt.expires_at
    or v_reservation.expires_at <= statement_timestamp()
    or v_invitation.revoked_at is not null
    or v_invitation.expires_at <= statement_timestamp()
    or not exists (
      select 1
      from private.login_name_claims lnc
      where lnc.attempt_id = v_attempt.id
        and lnc.login_name_key = v_attempt.login_name_key
        and lnc.user_id is null
    ) then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  update private.registration_attempts ra
  set status = 'claimed',
      auth_user_id = new.id,
      proof_consumed_at = statement_timestamp(),
      claimed_at = statement_timestamp(),
      updated_at = statement_timestamp()
  where ra.id = v_attempt.id
    and ra.status = 'prepared'
    and ra.auth_user_id is null
    and ra.proof_consumed_at is null
    and ra.proof_expires_at > statement_timestamp()
    and ra.expires_at > statement_timestamp()
    and ra.expected_auth_user_id = new.id
    and ra.auth_email_binding_hash =
      private.registration_auth_email_binding_hash(new.email, new.id)
  returning ra.id into v_claimed_id;

  if v_claimed_id is null then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  update private.invitation_reservations ir
  set auth_user_id = new.id,
      updated_at = statement_timestamp()
  where ir.id = v_reservation.id
    and ir.status = 'reserved'
    and ir.auth_user_id is null
    and ir.expires_at > statement_timestamp();

  if not found then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  return new;
end;
$$;

create or replace function private.register_identity_from_invitation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mode text := private.current_registration_mode();
  v_registration_name text;
  v_login_name_key text;
  v_invitation_hash text;
  v_invitation public.invitations%rowtype;
  v_attempt private.registration_attempts%rowtype;
  v_redemption_id uuid;
  v_reserved_count bigint;
begin
  -- Existing SQL fixtures and externally bootstrapped identities keep their
  -- established behavior.
  if coalesce(new.encrypted_password, '') = '' then
    return new;
  end if;

  if v_mode = 'legacy' then
    v_registration_name := btrim(
      coalesce(new.raw_user_meta_data ->> 'registration_name', '')
    );
    v_login_name_key := private.canonical_registration_name(v_registration_name);
    v_invitation_hash := new.raw_user_meta_data ->> 'invitation_code_hash';

    if char_length(v_registration_name) not between 1 and 64
      or v_registration_name ~ '[[:cntrl:]]'
      or v_login_name_key = '' then
      raise exception using errcode = '22023', message = 'registration name is invalid';
    end if;

    if v_invitation_hash is null
      or v_invitation_hash !~ '^[0-9a-f]{64}$' then
      raise exception using errcode = '22023', message = 'invitation is required';
    end if;

    select i.* into v_invitation
    from public.invitations i
    where i.code_hash = v_invitation_hash
    for update;

    select count(*) into v_reserved_count
    from private.invitation_reservations ir
    where ir.invitation_id = v_invitation.id
      and ir.status = 'reserved'
      and ir.expires_at > statement_timestamp();

    if v_invitation.id is null
      or v_invitation.revoked_at is not null
      or v_invitation.expires_at <= statement_timestamp()
      or v_invitation.use_count + v_reserved_count >= v_invitation.max_uses then
      raise exception using errcode = 'P0001', message = 'invitation is invalid or unavailable';
    end if;

    insert into public.profiles (user_id, registration_name)
    values (new.id, v_registration_name);

    insert into private.login_name_claims (
      login_name_key,
      registration_name,
      user_id
    ) values (
      v_login_name_key,
      v_registration_name,
      new.id
    );

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
        'registration_flow', 'atomic_signup_legacy'
      )
    );

    return new;
  end if;

  if new.email_confirmed_at is not null then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  select ra.* into v_attempt
  from private.registration_attempts ra
  where ra.auth_user_id = new.id
  for update;

  if not found
    or v_attempt.status <> 'claimed'
    or v_attempt.expires_at <= statement_timestamp()
    or not exists (
      select 1
      from private.invitation_reservations ir
      join public.invitations i on i.id = ir.invitation_id
      where ir.attempt_id = v_attempt.id
        and ir.auth_user_id = new.id
        and ir.status = 'reserved'
        and ir.expires_at > statement_timestamp()
        and i.revoked_at is null
        and i.expires_at > statement_timestamp()
    ) then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  insert into public.profiles (user_id, registration_name)
  values (new.id, v_attempt.registration_name);

  insert into public.memberships (user_id, state, admitted_at)
  values (new.id, 'pending', null);

  update private.login_name_claims lnc
  set attempt_id = null,
      user_id = new.id,
      updated_at = statement_timestamp()
  where lnc.attempt_id = v_attempt.id
    and lnc.user_id is null;

  if not found then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  update private.registration_attempts ra
  set status = 'auth_created',
      auth_created_at = statement_timestamp(),
      updated_at = statement_timestamp()
  where ra.id = v_attempt.id
    and ra.status = 'claimed';

  if not found then
    raise exception using errcode = 'P0001', message = 'registration unavailable';
  end if;

  perform private.write_audit(
    new.id,
    'registration.auth_user_created',
    'registration_attempt',
    v_attempt.id,
    null,
    jsonb_build_object('membership_state', 'pending')
  );

  return new;
exception
  when unique_violation then
    raise exception using errcode = '23505', message = 'registration name is already in use';
end;
$$;

drop trigger if exists a_guard_email_registration_auth_insert on auth.users;
create trigger a_guard_email_registration_auth_insert
before insert on auth.users
for each row
execute function private.guard_email_registration_auth_insert();

drop trigger if exists on_auth_user_registered on auth.users;
create trigger on_auth_user_registered
after insert on auth.users
for each row
execute function private.register_identity_from_invitation();

revoke all on function private.guard_email_registration_auth_insert()
  from public, anon, authenticated, service_role;
revoke all on function private.register_identity_from_invitation()
  from public, anon, authenticated, service_role;

create or replace function private.activate_email_registration_at(
  p_user_id uuid,
  p_now timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt_id uuid;
  v_invitation_id uuid;
  v_attempt private.registration_attempts%rowtype;
  v_reservation private.invitation_reservations%rowtype;
  v_invitation public.invitations%rowtype;
  v_redemption_id uuid;
begin
  select ra.id, ra.invitation_id
  into v_attempt_id, v_invitation_id
  from private.registration_attempts ra
  where ra.auth_user_id = p_user_id;

  if v_attempt_id is null then
    return false;
  end if;

  select i.* into v_invitation
  from public.invitations i
  where i.id = v_invitation_id
  for update;

  select ra.* into v_attempt
  from private.registration_attempts ra
  where ra.id = v_attempt_id
  for update;

  select ir.* into v_reservation
  from private.invitation_reservations ir
  where ir.attempt_id = v_attempt.id
  for update;

  perform 1
  from public.memberships m
  where m.user_id = p_user_id
  for update;

  if v_attempt.status = 'activated' then
    return true;
  end if;

  if v_attempt.status not in ('auth_created', 'verified_pending')
    or v_reservation.status <> 'reserved'
    or v_reservation.auth_user_id <> p_user_id
    or v_reservation.expires_at <= p_now
    or v_invitation.expires_at <= p_now
    or v_invitation.revoked_at is not null
    or v_invitation.use_count >= v_invitation.max_uses then
    if v_reservation.status = 'reserved' then
      update private.invitation_reservations ir
      set status = case
            when v_reservation.expires_at <= p_now
              or v_invitation.expires_at <= p_now then 'expired'
            else 'released'
          end,
          released_at = p_now,
          release_reason = case
            when v_invitation.revoked_at is not null then 'invitation_revoked'
            when v_reservation.expires_at <= p_now
              or v_invitation.expires_at <= p_now then 'reservation_expired'
            else 'activation_unavailable'
          end,
          updated_at = p_now
      where ir.id = v_reservation.id
        and ir.status = 'reserved';
    end if;

    update private.registration_attempts ra
    set status = case
          when v_invitation.revoked_at is not null then 'blocked'
          else 'verified_pending'
        end,
        terminal_reason = case
          when v_invitation.revoked_at is not null then 'invitation_revoked'
          when v_reservation.expires_at <= p_now
            or v_invitation.expires_at <= p_now then 'reservation_expired'
          else 'activation_unavailable'
        end,
        updated_at = p_now
    where ra.id = v_attempt.id
      and ra.status <> 'activated';

    perform private.write_audit(
      p_user_id,
      'registration.activation_deferred',
      'registration_attempt',
      v_attempt.id,
      case
        when v_invitation.revoked_at is not null then 'invitation_revoked'
        when v_reservation.expires_at <= p_now
          or v_invitation.expires_at <= p_now then 'reservation_expired'
        else 'activation_unavailable'
      end,
      '{}'::jsonb
    );

    return false;
  end if;

  insert into public.invitation_redemptions (
    invitation_id,
    user_id,
    redeemed_at
  ) values (
    v_invitation.id,
    p_user_id,
    p_now
  )
  returning id into v_redemption_id;

  update public.invitations i
  set use_count = use_count + 1
  where i.id = v_invitation.id
    and i.use_count < i.max_uses;

  if not found then
    raise exception using errcode = 'P0001', message = 'registration activation unavailable';
  end if;

  update private.invitation_reservations ir
  set status = 'consumed',
      consumed_at = p_now,
      updated_at = p_now
  where ir.id = v_reservation.id
    and ir.status = 'reserved';

  if not found then
    raise exception using errcode = 'P0001', message = 'registration activation unavailable';
  end if;

  update public.memberships m
  set state = 'active',
      admitted_at = p_now,
      suspended_at = null,
      revoked_at = null,
      updated_at = p_now
  where m.user_id = p_user_id
    and m.state = 'pending';

  if not found then
    raise exception using errcode = 'P0001', message = 'registration activation unavailable';
  end if;

  update private.registration_attempts ra
  set status = 'activated',
      activated_at = p_now,
      terminal_reason = null,
      updated_at = p_now
  where ra.id = v_attempt.id
    and ra.status in ('auth_created', 'verified_pending');

  if not found then
    raise exception using errcode = 'P0001', message = 'registration activation unavailable';
  end if;

  perform private.write_audit(
    p_user_id,
    'registration.membership_activated',
    'invitation_redemption',
    v_redemption_id,
    null,
    jsonb_build_object(
      'attempt_id', v_attempt.id,
      'reservation_id', v_reservation.id,
      'invitation_id', v_invitation.id
    )
  );

  return true;
end;
$$;

create or replace function private.activate_membership_on_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform private.activate_email_registration_at(new.id, statement_timestamp());
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function private.activate_membership_on_email_confirmation();

revoke all on function private.activate_email_registration_at(uuid, timestamptz)
  from public, anon, authenticated, service_role;
revoke all on function private.activate_membership_on_email_confirmation()
  from public, anon, authenticated, service_role;

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
  v_now timestamptz := statement_timestamp();
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;

  if p_reason is null or length(btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;

  select i.* into v_invitation
  from public.invitations i
  where i.id = p_invitation_id
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
    update public.invitations i
    set revoked_by = v_actor,
        revoked_at = v_now,
        revoke_reason = btrim(p_reason)
    where i.id = p_invitation_id;

    update private.invitation_reservations ir
    set status = 'released',
        released_at = v_now,
        release_reason = 'invitation_revoked',
        updated_at = v_now
    where ir.invitation_id = p_invitation_id
      and ir.status = 'reserved';

    update private.registration_attempts ra
    set status = case
          when ra.auth_user_id is null then 'released'
          else 'blocked'
        end,
        terminal_reason = 'invitation_revoked',
        updated_at = v_now
    where ra.invitation_id = p_invitation_id
      and ra.status in ('prepared', 'auth_created', 'verified_pending');

    delete from private.login_name_claims lnc
    using private.registration_attempts ra
    where lnc.attempt_id = ra.id
      and ra.invitation_id = p_invitation_id
      and ra.auth_user_id is null
      and ra.status = 'released';

    perform private.write_audit(
      v_actor,
      'invitation.revoked',
      'invitation',
      p_invitation_id,
      btrim(p_reason),
      jsonb_build_object(
        'pending_reservations_invalidated', true
      )
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
  v_now timestamptz := statement_timestamp();
  v_invitation public.invitations%rowtype;
  v_membership public.memberships%rowtype;
  v_redemption_id uuid;
  v_reserved_count bigint;
  v_attempt_id uuid;
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
    select 1 from public.invitation_redemptions ir where ir.user_id = v_actor
  ) then
    raise exception using errcode = '23505', message = 'account already admitted';
  end if;

  select m.* into v_membership
  from public.memberships m
  where m.user_id = v_actor
  for update;

  if found and v_membership.state <> 'pending' then
    raise exception using errcode = '23505', message = 'account already admitted';
  end if;

  select ra.id
  into v_attempt_id
  from private.registration_attempts ra
  join public.invitations i on i.id = ra.invitation_id
  where ra.auth_user_id = v_actor
    and i.code_hash = p_code_hash;

  if v_attempt_id is not null
    and private.activate_email_registration_at(v_actor, v_now) then
    select ir.id into v_redemption_id
    from public.invitation_redemptions ir
    where ir.user_id = v_actor;
    return v_redemption_id;
  end if;

  select i.* into v_invitation
  from public.invitations i
  where i.code_hash = p_code_hash
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'invitation not found';
  end if;

  if v_invitation.revoked_at is not null then
    raise exception using errcode = 'P0001', message = 'invitation revoked';
  end if;

  if v_invitation.expires_at <= v_now then
    raise exception using errcode = 'P0001', message = 'invitation expired';
  end if;

  select count(*) into v_reserved_count
  from private.invitation_reservations ir
  where ir.invitation_id = v_invitation.id
    and ir.status = 'reserved'
    and ir.expires_at > v_now;

  if v_invitation.use_count + v_reserved_count >= v_invitation.max_uses then
    raise exception using errcode = 'P0001', message = 'invitation exhausted';
  end if;

  insert into public.profiles (user_id)
  values (v_actor)
  on conflict (user_id) do nothing;

  insert into public.memberships (user_id, state, admitted_at, updated_at)
  values (v_actor, 'active', v_now, v_now)
  on conflict (user_id) do update
  set state = 'active',
      admitted_at = v_now,
      suspended_at = null,
      revoked_at = null,
      updated_at = v_now
  where public.memberships.state = 'pending';

  insert into public.invitation_redemptions (
    invitation_id,
    user_id,
    redeemed_at
  ) values (
    v_invitation.id,
    v_actor,
    v_now
  )
  returning id into v_redemption_id;

  update public.invitations i
  set use_count = use_count + 1
  where i.id = v_invitation.id
    and i.use_count < i.max_uses;

  if not found then
    raise exception using errcode = 'P0001', message = 'invitation exhausted';
  end if;

  update private.invitation_reservations ir
  set status = case
        when ir.expires_at <= v_now then 'expired'
        else 'released'
      end,
      released_at = v_now,
      release_reason = 'replacement_invitation',
      updated_at = v_now
  where ir.auth_user_id = v_actor
    and ir.status = 'reserved';

  update private.registration_attempts ra
  set status = 'activated',
      activated_at = v_now,
      terminal_reason = 'replacement_invitation',
      updated_at = v_now
  where ra.auth_user_id = v_actor
    and ra.status in ('auth_created', 'verified_pending', 'blocked');

  perform private.write_audit(
    v_actor,
    'invitation.redeemed',
    'invitation_redemption',
    v_redemption_id,
    null,
    jsonb_build_object(
      'invitation_id', v_invitation.id,
      'registration_flow', 'verified_pending_recovery'
    )
  );

  return v_redemption_id;
end;
$$;

create or replace function public.registration_invitation_status(
  p_code_hash text
)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  -- The trusted mode intentionally removes public preflight/oracle behavior.
  if private.current_registration_mode() = 'email_required' then
    return 'invalid';
  end if;

  if p_code_hash is null or p_code_hash !~ '^[0-9a-f]{64}$' then
    return 'invalid';
  end if;

  select case
    when i.revoked_at is not null then 'revoked'
    when i.expires_at <= statement_timestamp() then 'expired'
    when i.use_count + (
      select count(*)
      from private.invitation_reservations ir
      where ir.invitation_id = i.id
        and ir.status = 'reserved'
        and ir.expires_at > statement_timestamp()
    ) >= i.max_uses then 'exhausted'
    else 'valid'
  end
  into v_status
  from public.invitations i
  where i.code_hash = p_code_hash;

  return coalesce(v_status, 'invalid');
end;
$$;

create or replace function public.validate_registration_invitation(
  p_code_hash text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.registration_invitation_status(p_code_hash) = 'valid';
$$;

revoke all on function public.revoke_invitation(uuid, text) from public;
revoke all on function public.redeem_invitation(text) from public;
revoke all on function public.registration_invitation_status(text) from public;
revoke all on function public.validate_registration_invitation(text) from public;

grant execute on function public.revoke_invitation(uuid, text) to authenticated;
grant execute on function public.redeem_invitation(text) to authenticated;
grant execute on function public.registration_invitation_status(text)
  to anon, authenticated;
grant execute on function public.validate_registration_invitation(text)
  to anon, authenticated;
