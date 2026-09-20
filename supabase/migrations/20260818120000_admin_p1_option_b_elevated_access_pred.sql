alter table private.identity_access_request_ledger
  drop constraint identity_access_request_operation;

alter table private.identity_access_request_ledger
  add constraint identity_access_request_operation check (
    operation in (
      'grant_author_role',
      'revoke_author_role',
      'set_ordinary_membership_state',
      'grant_super_admin'
    )
  );

create table private.elevated_commissioning_policy (
  policy_id text primary key,
  operation text not null,
  actor_registration_name text not null,
  target_registration_name text not null,
  actor_user_id uuid references public.profiles (user_id) on delete restrict,
  target_user_id uuid references public.profiles (user_id) on delete restrict,
  authorization_reference text not null unique,
  enabled boolean not null default false,
  bound_at timestamptz,
  constraint elevated_commissioning_policy_id check (
    policy_id = 'initial-super-admin-commissioning'
  ),
  constraint elevated_commissioning_policy_operation check (
    operation = 'grant_super_admin'
  ),
  constraint elevated_commissioning_policy_names check (
    pg_catalog.btrim(actor_registration_name) = actor_registration_name
    and pg_catalog.btrim(target_registration_name) = target_registration_name
    and actor_registration_name <> target_registration_name
  ),
  constraint elevated_commissioning_policy_binding check (
    (
      enabled = false
      and actor_user_id is null
      and target_user_id is null
      and bound_at is null
    ) or (
      enabled = true
      and actor_user_id is not null
      and target_user_id is not null
      and actor_user_id <> target_user_id
      and bound_at is not null
    )
  )
);

alter table private.elevated_commissioning_policy enable row level security;

revoke all on table private.elevated_commissioning_policy
  from public, anon, authenticated, service_role;

insert into private.elevated_commissioning_policy (
  policy_id,
  operation,
  actor_registration_name,
  target_registration_name,
  authorization_reference
) values (
  'initial-super-admin-commissioning',
  'grant_super_admin',
  'Phase2RemoteInviter',
  'akumie',
  'adr-024:initial-super-admin-commissioning:v1'
);

create table private.elevated_access_intents (
  intent_id uuid primary key default extensions.gen_random_uuid(),
  request_id uuid not null unique,
  actor_user_id uuid not null
    references public.profiles (user_id) on delete restrict,
  actor_authorization_reference text not null,
  actor_session_id uuid not null,
  operation text not null,
  target_user_id uuid not null
    references public.profiles (user_id) on delete restrict,
  desired_role public.elevated_role not null,
  expected_state_token text not null,
  normalized_reason text not null,
  payload_fingerprint bytea not null,
  prior_totp_amr_timestamp bigint not null,
  challenge_not_before timestamptz not null,
  issued_at timestamptz not null default statement_timestamp(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  terminal_status text,
  consumed_mfa_evidence_key bytea,
  result_status text,
  result_snapshot jsonb,
  role_grant_id uuid unique
    references public.role_grants (id) on delete restrict,
  audit_log_id bigint unique
    references public.audit_logs (id) on delete restrict,
  constraint elevated_access_intent_request_non_nil check (
    request_id <> '00000000-0000-0000-0000-000000000000'::uuid
  ),
  constraint elevated_access_intent_actor_target check (
    actor_user_id <> target_user_id
  ),
  constraint elevated_access_intent_operation check (
    operation = 'grant_super_admin'
  ),
  constraint elevated_access_intent_role check (
    desired_role = 'super_admin'
  ),
  constraint elevated_access_intent_expected_state check (
    expected_state_token ~ '^[0-9a-f]{64}$'
  ),
  constraint elevated_access_intent_reason check (
    private.identity_access_reason_is_valid(normalized_reason)
  ),
  constraint elevated_access_intent_fingerprint check (
    pg_catalog.octet_length(payload_fingerprint) = 32
  ),
  constraint elevated_access_intent_totp_timestamp check (
    prior_totp_amr_timestamp >= 0
  ),
  constraint elevated_access_intent_lifetime check (
    challenge_not_before = issued_at
    and expires_at = issued_at + interval '5 minutes'
  ),
  constraint elevated_access_intent_terminal_status check (
    terminal_status is null
    or terminal_status in ('saved', 'unchanged', 'conflict', 'expired')
  ),
  constraint elevated_access_intent_result_status check (
    result_status is null
    or result_status in ('saved', 'unchanged', 'conflict')
  ),
  constraint elevated_access_intent_consumption check (
    (
      consumed_at is null
      and terminal_status is null
      and consumed_mfa_evidence_key is null
      and result_status is null
      and result_snapshot is null
      and role_grant_id is null
      and audit_log_id is null
    ) or (
      consumed_at is not null
      and terminal_status = 'expired'
      and consumed_mfa_evidence_key is null
      and result_status is null
      and result_snapshot is null
      and role_grant_id is null
      and audit_log_id is null
    ) or (
      consumed_at is not null
      and terminal_status = result_status
      and consumed_mfa_evidence_key is not null
      and result_snapshot ->> 'status' = result_status
      and (
        (
          result_status = 'saved'
          and role_grant_id is not null
          and audit_log_id is not null
        ) or (
          result_status in ('unchanged', 'conflict')
          and role_grant_id is null
          and audit_log_id is null
        )
      )
    )
  )
);

create unique index elevated_access_intents_mfa_evidence_once
  on private.elevated_access_intents (consumed_mfa_evidence_key)
  where consumed_mfa_evidence_key is not null;

create index elevated_access_intents_actor_issued
  on private.elevated_access_intents (actor_user_id, issued_at desc);

create index elevated_access_intents_target_issued
  on private.elevated_access_intents (target_user_id, issued_at desc);

alter table private.elevated_access_intents enable row level security;

revoke all on table private.elevated_access_intents
  from public, anon, authenticated, service_role;

create or replace function private.bind_elevated_commissioning_policy()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_policy private.elevated_commissioning_policy%rowtype;
  v_actor_user_id uuid;
  v_target_user_id uuid;
  v_actor_count integer;
  v_target_count integer;
begin
  select policy.*
  into strict v_policy
  from private.elevated_commissioning_policy policy
  where policy.policy_id = 'initial-super-admin-commissioning';

  select pg_catalog.count(*), pg_catalog.min(profile.user_id::text)::uuid
  into v_actor_count, v_actor_user_id
  from public.profiles profile
  join auth.users auth_user
    on auth_user.id = profile.user_id
   and auth_user.deleted_at is null
  where pg_catalog.lower(profile.registration_name) =
    pg_catalog.lower(v_policy.actor_registration_name)
    and exists (
      select 1
      from auth.identities identity
      where identity.user_id = profile.user_id
    );

  select pg_catalog.count(*), pg_catalog.min(profile.user_id::text)::uuid
  into v_target_count, v_target_user_id
  from public.profiles profile
  join auth.users auth_user
    on auth_user.id = profile.user_id
   and auth_user.deleted_at is null
  where pg_catalog.lower(profile.registration_name) =
    pg_catalog.lower(v_policy.target_registration_name)
    and exists (
      select 1
      from auth.identities identity
      where identity.user_id = profile.user_id
    );

  if v_actor_count <> 1 or v_target_count <> 1 then
    raise exception using
      errcode = '55000',
      message = 'ELEVATED_COMMISSIONING_POLICY_BINDING_FAILED';
  end if;

  if v_actor_user_id = v_target_user_id
    or not private.has_role('super_admin', v_actor_user_id)
    or not private.is_active_member(v_target_user_id)
    or exists (
      select 1
      from public.role_grants grant_row
      where grant_row.user_id = v_target_user_id
        and grant_row.role in ('admin', 'super_admin')
        and grant_row.revoked_at is null
    )
  then
    raise exception using
      errcode = '55000',
      message = 'ELEVATED_COMMISSIONING_POLICY_STATE_INVALID';
  end if;

  update private.elevated_commissioning_policy policy
  set actor_user_id = v_actor_user_id,
      target_user_id = v_target_user_id,
      enabled = true,
      bound_at = pg_catalog.statement_timestamp()
  where policy.policy_id = 'initial-super-admin-commissioning';
end;
$$;

revoke all on function private.bind_elevated_commissioning_policy()
  from public, anon, authenticated, service_role;

create or replace function private.current_elevated_commissioning_policy(
  p_require_target_ordinary boolean
)
returns table (
  actor_user_id uuid,
  target_user_id uuid,
  authorization_reference text
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_policy private.elevated_commissioning_policy%rowtype;
begin
  select policy.*
  into v_policy
  from private.elevated_commissioning_policy policy
  where policy.policy_id = 'initial-super-admin-commissioning'
    and policy.enabled = true;

  if not found
    or v_policy.operation <> 'grant_super_admin'
    or v_policy.actor_user_id is null
    or v_policy.target_user_id is null
    or auth.uid() is distinct from v_policy.actor_user_id
    or not private.has_role('super_admin', v_policy.actor_user_id)
    or not private.is_active_member(v_policy.target_user_id)
    or not exists (
      select 1
      from public.profiles profile
      join auth.users auth_user
        on auth_user.id = profile.user_id
       and auth_user.deleted_at is null
      where profile.user_id = v_policy.actor_user_id
        and pg_catalog.lower(profile.registration_name) =
          pg_catalog.lower(v_policy.actor_registration_name)
        and exists (
          select 1 from auth.identities identity
          where identity.user_id = profile.user_id
        )
    )
    or not exists (
      select 1
      from public.profiles profile
      join auth.users auth_user
        on auth_user.id = profile.user_id
       and auth_user.deleted_at is null
      where profile.user_id = v_policy.target_user_id
        and pg_catalog.lower(profile.registration_name) =
          pg_catalog.lower(v_policy.target_registration_name)
        and exists (
          select 1 from auth.identities identity
          where identity.user_id = profile.user_id
        )
    )
    or (
      select pg_catalog.count(*)
      from auth.mfa_factors factor
      where factor.user_id = v_policy.actor_user_id
        and factor.factor_type::text = 'totp'
        and factor.status::text = 'verified'
    ) < 2
    or (
      select pg_catalog.count(*)
      from auth.mfa_factors factor
      where factor.user_id = v_policy.target_user_id
        and factor.factor_type::text = 'totp'
        and factor.status::text = 'verified'
    ) < 2
  then
    raise exception using
      errcode = '42501',
      message = 'UNAUTHORIZED_ACTOR';
  end if;

  if exists (
    select 1
    from public.role_grants grant_row
    where grant_row.user_id = v_policy.target_user_id
      and grant_row.role = 'admin'
      and grant_row.revoked_at is null
  ) or (
    p_require_target_ordinary
    and exists (
      select 1
      from public.role_grants grant_row
      where grant_row.user_id = v_policy.target_user_id
        and grant_row.role = 'super_admin'
        and grant_row.revoked_at is null
    )
  ) then
    raise exception using
      errcode = '42501',
      message = 'INVALID_TARGET';
  end if;

  return query select
    v_policy.actor_user_id,
    v_policy.target_user_id,
    v_policy.authorization_reference;
end;
$$;

revoke all on function private.current_elevated_commissioning_policy(boolean)
  from public, anon, authenticated, service_role;

create or replace function private.current_elevated_auth_evidence(
  p_require_fresh boolean
)
returns table (
  session_id uuid,
  totp_timestamp bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_jwt jsonb := auth.jwt();
  v_session_text text;
  v_entry jsonb;
  v_totp_timestamp bigint;
  v_now_epoch bigint := pg_catalog.floor(
    extract(epoch from pg_catalog.statement_timestamp())
  )::bigint;
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  if v_jwt ->> 'aal' <> 'aal2'
    or pg_catalog.jsonb_typeof(v_jwt -> 'amr') <> 'array'
  then
    raise exception using
      errcode = '42501',
      message = 'AAL2_REQUIRED';
  end if;

  for v_entry in
    select value
    from pg_catalog.jsonb_array_elements(v_jwt -> 'amr') entries(value)
  loop
    if pg_catalog.jsonb_typeof(v_entry) <> 'object'
      or v_entry ->> 'method' is null
      or v_entry ->> 'timestamp' is null
    then
      raise exception using
        errcode = '42501',
        message = 'INVALID_AUTH_EVIDENCE';
    end if;

    if v_entry ->> 'method' = 'totp' then
      if (v_entry ->> 'timestamp') !~ '^[0-9]+$' then
        raise exception using
          errcode = '42501',
          message = 'INVALID_AUTH_EVIDENCE';
      end if;
      v_totp_timestamp := greatest(
        coalesce(v_totp_timestamp, 0),
        (v_entry ->> 'timestamp')::bigint
      );
    end if;
  end loop;

  if v_totp_timestamp is null then
    raise exception using
      errcode = '42501',
      message = 'FRESH_TOTP_REQUIRED';
  end if;

  if v_totp_timestamp > v_now_epoch
    or (p_require_fresh and v_now_epoch - v_totp_timestamp > 300)
  then
    raise exception using
      errcode = '42501',
      message = case
        when v_totp_timestamp > v_now_epoch then 'INVALID_AUTH_EVIDENCE'
        else 'STALE_TOTP'
      end;
  end if;

  v_session_text := v_jwt ->> 'session_id';
  if v_session_text is null
    or v_session_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then
    raise exception using
      errcode = '42501',
      message = 'INVALID_SESSION';
  end if;

  session_id := v_session_text::uuid;
  if not exists (
    select 1
    from auth.sessions session_row
    where session_row.id = session_id
      and session_row.user_id = v_actor_user_id
      and session_row.aal::text = 'aal2'
      and (
        session_row.not_after is null
        or session_row.not_after > pg_catalog.statement_timestamp()
      )
  ) then
    raise exception using
      errcode = '42501',
      message = 'INVALID_SESSION';
  end if;

  totp_timestamp := v_totp_timestamp;
  return next;
end;
$$;

revoke all on function private.current_elevated_auth_evidence(boolean)
  from public, anon, authenticated, service_role;

create or replace function private.elevated_access_payload_fingerprint(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_expected_state_token text,
  p_reason text
)
returns bytea
language plpgsql
immutable
parallel safe
security invoker
set search_path = ''
as $$
declare
  v_part text;
  v_canonical text := '';
begin
  foreach v_part in array array[
    'fandom-harbor:elevated-access:v1',
    p_actor_user_id::text,
    'grant_super_admin',
    p_target_user_id::text,
    'super_admin',
    p_expected_state_token,
    p_reason
  ] loop
    v_canonical := v_canonical
      || pg_catalog.octet_length(pg_catalog.convert_to(v_part, 'UTF8'))::text
      || ':'
      || v_part;
  end loop;

  return extensions.digest(
    pg_catalog.convert_to(v_canonical, 'UTF8'),
    'sha256'
  );
end;
$$;

revoke all on function private.elevated_access_payload_fingerprint(
  uuid,
  uuid,
  text,
  text
) from public, anon, authenticated, service_role;

create or replace function private.elevated_access_intent_snapshot(
  p_intent_id uuid
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'intentId', intent.intent_id::text,
    'requestId', intent.request_id::text,
    'actorUserId', intent.actor_user_id::text,
    'actorAuthorizationReference', intent.actor_authorization_reference,
    'actorSessionId', intent.actor_session_id::text,
    'operation', intent.operation,
    'targetUserId', intent.target_user_id::text,
    'desiredRole', intent.desired_role::text,
    'expectedStateToken', intent.expected_state_token,
    'normalizedReason', intent.normalized_reason,
    'payloadFingerprint', pg_catalog.encode(intent.payload_fingerprint, 'hex'),
    'priorTotpAuthenticatedAtEpochSeconds', intent.prior_totp_amr_timestamp,
    'challengeNotBeforeEpochSeconds', pg_catalog.floor(
      extract(epoch from intent.challenge_not_before)
    )::bigint,
    'issuedAtEpochSeconds', pg_catalog.floor(
      extract(epoch from intent.issued_at)
    )::bigint,
    'expiresAtEpochSeconds', pg_catalog.floor(
      extract(epoch from intent.expires_at)
    )::bigint,
    'consumedAtEpochSeconds', case
      when intent.consumed_at is null then null
      else pg_catalog.floor(
        extract(epoch from intent.consumed_at)
      )::bigint
    end
  )
  from private.elevated_access_intents intent
  where intent.intent_id = p_intent_id;
$$;

revoke all on function private.elevated_access_intent_snapshot(uuid)
  from public, anon, authenticated, service_role;

create or replace function private.guard_elevated_request_claim()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-request:' || new.request_id::text,
      0
    )
  );

  if exists (
    select 1
    from private.identity_access_request_ledger ledger
    where ledger.request_id = new.request_id
  ) then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'REQUEST_ID_MISMATCH';
  end if;

  return new;
end;
$$;

create trigger elevated_access_intent_request_claim
before insert on private.elevated_access_intents
for each row execute function private.guard_elevated_request_claim();

create or replace function private.guard_ordinary_request_claim()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-request:' || new.request_id::text,
      0
    )
  );

  if exists (
    select 1
    from private.elevated_access_intents intent
    where intent.request_id = new.request_id
  ) then
    if new.operation = 'grant_super_admin'
      and exists (
        select 1
        from private.elevated_access_intents intent
        where intent.request_id = new.request_id
          and intent.actor_user_id = new.actor_user_id
          and intent.target_user_id = new.target_user_id
          and intent.payload_fingerprint = new.payload_fingerprint
      )
    then
      return new;
    end if;

    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'REQUEST_ID_MISMATCH';
  end if;

  return new;
end;
$$;

create trigger identity_access_ledger_request_claim
before insert on private.identity_access_request_ledger
for each row execute function private.guard_ordinary_request_claim();

revoke all on function private.guard_elevated_request_claim()
  from public, anon, authenticated, service_role;
revoke all on function private.guard_ordinary_request_claim()
  from public, anon, authenticated, service_role;

create or replace function public.get_grant_super_admin_policy_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid;
  v_target_user_id uuid;
  v_authorization_reference text;
begin
  select policy.actor_user_id, policy.target_user_id, policy.authorization_reference
  into v_actor_user_id, v_target_user_id, v_authorization_reference
  from private.current_elevated_commissioning_policy(true) policy;

  return pg_catalog.jsonb_build_object(
    'actorAuthorizationReference', v_authorization_reference,
    'authorizedActorUserId', v_actor_user_id::text,
    'exactTargetUserId', v_target_user_id::text
  );
end;
$$;

create or replace function public.issue_grant_super_admin_intent_v1(
  p_request_id uuid,
  p_expected_state_token text,
  p_reason text,
  p_payload_fingerprint text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid;
  v_target_user_id uuid;
  v_authorization_reference text;
  v_session_id uuid;
  v_totp_timestamp bigint;
  v_reason text;
  v_fingerprint bytea;
  v_existing_intent private.elevated_access_intents%rowtype;
  v_existing_ledger private.identity_access_request_ledger%rowtype;
  v_current_token text;
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_intent_id uuid;
begin
  if p_request_id is null
    or p_request_id = '00000000-0000-0000-0000-000000000000'::uuid
    or p_expected_state_token !~ '^[0-9a-f]{64}$'
    or p_payload_fingerprint !~ '^[0-9a-f]{64}$'
  then
    raise exception using
      errcode = '22023',
      message = 'INVALID_REQUEST';
  end if;

  select policy.actor_user_id, policy.target_user_id, policy.authorization_reference
  into v_actor_user_id, v_target_user_id, v_authorization_reference
  from private.current_elevated_commissioning_policy(true) policy;

  select evidence.session_id, evidence.totp_timestamp
  into v_session_id, v_totp_timestamp
  from private.current_elevated_auth_evidence(true) evidence;

  v_reason := private.require_identity_access_reason(p_reason);
  v_fingerprint := private.elevated_access_payload_fingerprint(
    v_actor_user_id,
    v_target_user_id,
    p_expected_state_token,
    v_reason
  );

  if pg_catalog.encode(v_fingerprint, 'hex') <> p_payload_fingerprint then
    raise exception using
      errcode = '22023',
      message = 'INTENT_MISMATCH';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-request:' || p_request_id::text,
      0
    )
  );

  select ledger.*
  into v_existing_ledger
  from private.identity_access_request_ledger ledger
  where ledger.request_id = p_request_id;

  if found then
    select intent.*
    into v_existing_intent
    from private.elevated_access_intents intent
    where intent.request_id = p_request_id;

    if not found
      or v_existing_ledger.operation <> 'grant_super_admin'
      or v_existing_ledger.actor_user_id <> v_actor_user_id
      or v_existing_ledger.target_user_id <> v_target_user_id
      or v_existing_ledger.payload_fingerprint <> v_fingerprint
      or v_existing_intent.actor_session_id <> v_session_id
    then
      return pg_catalog.jsonb_build_object('status', 'request_id_conflict');
    end if;

    return pg_catalog.jsonb_build_object(
      'status', 'replayed',
      'intent', private.elevated_access_intent_snapshot(
        v_existing_intent.intent_id
      )
    );
  end if;

  select intent.*
  into v_existing_intent
  from private.elevated_access_intents intent
  where intent.request_id = p_request_id;

  if found then
    if v_existing_intent.actor_user_id <> v_actor_user_id
      or v_existing_intent.actor_session_id <> v_session_id
      or v_existing_intent.target_user_id <> v_target_user_id
      or v_existing_intent.payload_fingerprint <> v_fingerprint
      or v_existing_intent.expected_state_token <> p_expected_state_token
      or v_existing_intent.normalized_reason <> v_reason
    then
      return pg_catalog.jsonb_build_object('status', 'request_id_conflict');
    end if;

    return pg_catalog.jsonb_build_object(
      'status', 'replayed',
      'intent', private.elevated_access_intent_snapshot(
        v_existing_intent.intent_id
      )
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-governance',
      0
    )
  );

  v_current_token := private.identity_access_state_token(v_target_user_id);
  if v_current_token is null
    or v_current_token is distinct from p_expected_state_token
  then
    raise exception using
      errcode = '40001',
      message = 'EXPECTED_STATE_CONFLICT';
  end if;

  insert into private.elevated_access_intents (
    request_id,
    actor_user_id,
    actor_authorization_reference,
    actor_session_id,
    operation,
    target_user_id,
    desired_role,
    expected_state_token,
    normalized_reason,
    payload_fingerprint,
    prior_totp_amr_timestamp,
    challenge_not_before,
    issued_at,
    expires_at
  ) values (
    p_request_id,
    v_actor_user_id,
    v_authorization_reference,
    v_session_id,
    'grant_super_admin',
    v_target_user_id,
    'super_admin',
    p_expected_state_token,
    v_reason,
    v_fingerprint,
    v_totp_timestamp,
    v_now,
    v_now,
    v_now + interval '5 minutes'
  ) returning intent_id into v_intent_id;

  return pg_catalog.jsonb_build_object(
    'status', 'issued',
    'intent', private.elevated_access_intent_snapshot(v_intent_id)
  );
end;
$$;

create or replace function public.get_grant_super_admin_intent_v1(
  p_intent_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid;
  v_target_user_id uuid;
  v_authorization_reference text;
  v_session_id uuid;
  v_totp_timestamp bigint;
  v_intent private.elevated_access_intents%rowtype;
begin
  select policy.actor_user_id, policy.target_user_id, policy.authorization_reference
  into v_actor_user_id, v_target_user_id, v_authorization_reference
  from private.current_elevated_commissioning_policy(false) policy;

  select evidence.session_id, evidence.totp_timestamp
  into v_session_id, v_totp_timestamp
  from private.current_elevated_auth_evidence(false) evidence;

  select intent.*
  into v_intent
  from private.elevated_access_intents intent
  where intent.intent_id = p_intent_id
    and intent.actor_user_id = v_actor_user_id
    and intent.actor_session_id = v_session_id
    and intent.target_user_id = v_target_user_id
    and intent.actor_authorization_reference = v_authorization_reference;

  if not found then
    return null;
  end if;

  return private.elevated_access_intent_snapshot(v_intent.intent_id);
end;
$$;

create or replace function public.confirm_grant_super_admin_intent_v1(
  p_intent_id uuid,
  p_request_id uuid,
  p_expected_state_token text,
  p_reason text,
  p_payload_fingerprint text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid;
  v_target_user_id uuid;
  v_authorization_reference text;
  v_session_id uuid;
  v_totp_timestamp bigint;
  v_reason text;
  v_fingerprint bytea;
  v_intent private.elevated_access_intents%rowtype;
  v_ledger private.identity_access_request_ledger%rowtype;
  v_target_membership_state public.membership_state;
  v_current_snapshot jsonb;
  v_current_token text;
  v_result jsonb;
  v_role_grant_id uuid;
  v_audit_log_id bigint;
  v_changed_at timestamptz;
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_now_epoch bigint := pg_catalog.floor(
    extract(epoch from pg_catalog.statement_timestamp())
  )::bigint;
  v_evidence_key bytea;
begin
  if p_intent_id is null
    or p_request_id is null
    or p_request_id = '00000000-0000-0000-0000-000000000000'::uuid
    or p_expected_state_token !~ '^[0-9a-f]{64}$'
    or p_payload_fingerprint !~ '^[0-9a-f]{64}$'
  then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  select policy.actor_user_id, policy.target_user_id, policy.authorization_reference
  into v_actor_user_id, v_target_user_id, v_authorization_reference
  from private.current_elevated_commissioning_policy(false) policy;

  select evidence.session_id, evidence.totp_timestamp
  into v_session_id, v_totp_timestamp
  from private.current_elevated_auth_evidence(true) evidence;

  v_reason := private.require_identity_access_reason(p_reason);
  v_fingerprint := private.elevated_access_payload_fingerprint(
    v_actor_user_id,
    v_target_user_id,
    p_expected_state_token,
    v_reason
  );

  if pg_catalog.encode(v_fingerprint, 'hex') <> p_payload_fingerprint then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-request:' || p_request_id::text,
      0
    )
  );

  select intent.*
  into v_intent
  from private.elevated_access_intents intent
  where intent.intent_id = p_intent_id
    and intent.request_id = p_request_id
  for update;

  if not found
    or v_intent.actor_user_id <> v_actor_user_id
    or v_intent.actor_session_id <> v_session_id
    or v_intent.actor_authorization_reference <> v_authorization_reference
    or v_intent.operation <> 'grant_super_admin'
    or v_intent.target_user_id <> v_target_user_id
    or v_intent.desired_role <> 'super_admin'
    or v_intent.expected_state_token <> p_expected_state_token
    or v_intent.normalized_reason <> v_reason
    or v_intent.payload_fingerprint <> v_fingerprint
  then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  select ledger.*
  into v_ledger
  from private.identity_access_request_ledger ledger
  where ledger.request_id = p_request_id;

  if found then
    if v_ledger.actor_user_id <> v_actor_user_id
      or v_ledger.operation <> 'grant_super_admin'
      or v_ledger.target_user_id <> v_target_user_id
      or v_ledger.payload_fingerprint <> v_fingerprint
      or v_intent.consumed_at is null
    then
      return pg_catalog.jsonb_build_object('status', 'request_id_conflict');
    end if;

    return pg_catalog.jsonb_build_object(
      'status', 'result',
      'result', v_ledger.result_snapshot
    );
  end if;

  if v_intent.consumed_at is not null then
    return pg_catalog.jsonb_build_object(
      'status', case
        when v_intent.terminal_status = 'expired' then 'intent_expired'
        else 'intent_consumed'
      end
    );
  end if;

  if v_now > v_intent.expires_at then
    update private.elevated_access_intents
    set consumed_at = v_now,
        terminal_status = 'expired'
    where intent_id = v_intent.intent_id;
    return pg_catalog.jsonb_build_object('status', 'intent_expired');
  end if;

  if v_totp_timestamp <= v_intent.prior_totp_amr_timestamp
    or v_totp_timestamp < pg_catalog.floor(
      extract(epoch from v_intent.challenge_not_before)
    )::bigint
    or v_now_epoch - v_totp_timestamp > 300
  then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  v_evidence_key := extensions.digest(
    pg_catalog.convert_to(
      v_session_id::text || ':' || v_totp_timestamp::text,
      'UTF8'
    ),
    'sha256'
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-governance',
      0
    )
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('fandom-harbor:super-admin-role', 0)
  );

  select policy.actor_user_id, policy.target_user_id, policy.authorization_reference
  into v_actor_user_id, v_target_user_id, v_authorization_reference
  from private.current_elevated_commissioning_policy(false) policy;

  if exists (
    select 1
    from private.elevated_access_intents consumed_intent
    where consumed_intent.consumed_mfa_evidence_key = v_evidence_key
      and consumed_intent.intent_id <> v_intent.intent_id
  ) then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  select membership.state
  into v_target_membership_state
  from public.memberships membership
  where membership.user_id = v_target_user_id
  for update;

  if not found or v_target_membership_state <> 'active' then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  perform role_grant.id
  from public.role_grants role_grant
  where role_grant.user_id = v_target_user_id
    and role_grant.revoked_at is null
  order by role_grant.role, role_grant.id
  for update;

  v_current_snapshot := private.identity_access_expected_state_snapshot(
    v_target_user_id
  );
  v_current_token := private.identity_access_state_token(v_target_user_id);

  if v_current_token is distinct from p_expected_state_token then
    v_result := pg_catalog.jsonb_build_object(
      'status', 'conflict',
      'requestId', p_request_id::text,
      'targetUserId', v_target_user_id::text,
      'stateToken', v_current_token,
      'currentState', v_current_snapshot,
      'conflictReason', 'expected_state_mismatch'
    );

    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      p_request_id,
      v_actor_user_id,
      'grant_super_admin',
      v_target_user_id,
      v_fingerprint,
      'conflict',
      v_result
    );

    update private.elevated_access_intents
    set consumed_at = v_now,
        terminal_status = 'conflict',
        consumed_mfa_evidence_key = v_evidence_key,
        result_status = 'conflict',
        result_snapshot = v_result
    where intent_id = v_intent.intent_id;

    return pg_catalog.jsonb_build_object(
      'status', 'result',
      'result', v_result
    );
  end if;

  if exists (
    select 1
    from public.role_grants grant_row
    where grant_row.user_id = v_target_user_id
      and grant_row.role = 'super_admin'
      and grant_row.revoked_at is null
  ) then
    v_result := pg_catalog.jsonb_build_object(
      'status', 'unchanged',
      'requestId', p_request_id::text,
      'targetUserId', v_target_user_id::text,
      'stateToken', v_current_token,
      'currentState', v_current_snapshot
    );

    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      p_request_id,
      v_actor_user_id,
      'grant_super_admin',
      v_target_user_id,
      v_fingerprint,
      'unchanged',
      v_result
    );

    update private.elevated_access_intents
    set consumed_at = v_now,
        terminal_status = 'unchanged',
        consumed_mfa_evidence_key = v_evidence_key,
        result_status = 'unchanged',
        result_snapshot = v_result
    where intent_id = v_intent.intent_id;

    return pg_catalog.jsonb_build_object(
      'status', 'result',
      'result', v_result
    );
  end if;

  if exists (
    select 1
    from public.role_grants grant_row
    where grant_row.user_id = v_target_user_id
      and grant_row.role = 'admin'
      and grant_row.revoked_at is null
  ) then
    return pg_catalog.jsonb_build_object('status', 'intent_mismatch');
  end if;

  insert into public.role_grants (
    user_id,
    role,
    granted_by,
    grant_reason
  ) values (
    v_target_user_id,
    'super_admin',
    v_actor_user_id,
    v_reason
  ) returning id, granted_at into v_role_grant_id, v_changed_at;

  v_audit_log_id := private.write_audit(
    v_actor_user_id,
    'role.granted',
    'role_grant',
    v_role_grant_id,
    v_reason,
    pg_catalog.jsonb_build_object(
      'requestId', p_request_id::text,
      'operation', 'grant_super_admin',
      'targetUserId', v_target_user_id::text,
      'role', 'super_admin',
      'intentId', v_intent.intent_id::text,
      'authorizationReference', v_authorization_reference,
      'expectedStateToken', p_expected_state_token,
      'mfaMethod', 'totp',
      'mfaAuthenticatedAtEpochSeconds', v_totp_timestamp,
      'before', pg_catalog.jsonb_build_object('active', false),
      'after', pg_catalog.jsonb_build_object(
        'active', true,
        'grantId', v_role_grant_id::text
      )
    )
  );

  v_current_snapshot := private.identity_access_expected_state_snapshot(
    v_target_user_id
  );
  v_current_token := private.identity_access_state_token(v_target_user_id);
  v_result := pg_catalog.jsonb_build_object(
    'status', 'saved',
    'requestId', p_request_id::text,
    'targetUserId', v_target_user_id::text,
    'stateToken', v_current_token,
    'currentState', v_current_snapshot,
    'auditLogId', v_audit_log_id::text,
    'changedAt', pg_catalog.to_char(
      v_changed_at at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    ),
    'roleGrantId', v_role_grant_id::text
  );

  insert into private.identity_access_request_ledger (
    request_id,
    actor_user_id,
    operation,
    target_user_id,
    payload_fingerprint,
    result_status,
    result_snapshot,
    audit_log_id
  ) values (
    p_request_id,
    v_actor_user_id,
    'grant_super_admin',
    v_target_user_id,
    v_fingerprint,
    'saved',
    v_result,
    v_audit_log_id
  );

  update private.elevated_access_intents
  set consumed_at = v_now,
      terminal_status = 'saved',
      consumed_mfa_evidence_key = v_evidence_key,
      result_status = 'saved',
      result_snapshot = v_result,
      role_grant_id = v_role_grant_id,
      audit_log_id = v_audit_log_id
  where intent_id = v_intent.intent_id;

  return pg_catalog.jsonb_build_object(
    'status', 'result',
    'result', v_result
  );
end;
$$;

revoke all on function public.get_grant_super_admin_policy_v1()
  from public, anon, authenticated, service_role;
revoke all on function public.issue_grant_super_admin_intent_v1(
  uuid,
  text,
  text,
  text
) from public, anon, authenticated, service_role;
revoke all on function public.get_grant_super_admin_intent_v1(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.confirm_grant_super_admin_intent_v1(
  uuid,
  uuid,
  text,
  text,
  text
) from public, anon, authenticated, service_role;

grant execute on function public.get_grant_super_admin_policy_v1()
  to authenticated;
grant execute on function public.issue_grant_super_admin_intent_v1(
  uuid,
  text,
  text,
  text
) to authenticated;
grant execute on function public.get_grant_super_admin_intent_v1(uuid)
  to authenticated;
grant execute on function public.confirm_grant_super_admin_intent_v1(
  uuid,
  uuid,
  text,
  text,
  text
) to authenticated;

create or replace function public.grant_role(
  p_user_id uuid,
  p_role public.elevated_role,
  p_reason text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_grant_id uuid;
begin
  if p_role <> 'author' then
    raise exception using
      errcode = '42501',
      message = 'ELEVATED_MUTATION_REQUIRES_MFA';
  end if;
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;
  if not private.is_active_member(p_user_id) then
    raise exception using errcode = '42501', message = 'target must be an active member';
  end if;
  if p_reason is null or pg_catalog.length(pg_catalog.btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if not (
    private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using errcode = '42501', message = 'admin capability required';
  end if;
  insert into public.role_grants (user_id, role, granted_by, grant_reason)
  values (p_user_id, 'author', v_actor, pg_catalog.btrim(p_reason))
  returning id into v_grant_id;
  perform private.write_audit(
    v_actor,
    'role.granted',
    'role_grant',
    v_grant_id,
    pg_catalog.btrim(p_reason),
    pg_catalog.jsonb_build_object('user_id', p_user_id, 'role', 'author')
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
volatile
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_grant public.role_grants%rowtype;
begin
  if p_role <> 'author' then
    raise exception using
      errcode = '42501',
      message = 'ELEVATED_MUTATION_REQUIRES_MFA';
  end if;
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;
  if p_reason is null or pg_catalog.length(pg_catalog.btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if not (
    private.has_role('admin', v_actor)
    or private.has_role('super_admin', v_actor)
  ) then
    raise exception using errcode = '42501', message = 'admin capability required';
  end if;
  select * into v_grant
  from public.role_grants
  where user_id = p_user_id
    and role = 'author'
    and revoked_at is null
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'active role grant not found';
  end if;
  update public.role_grants
  set revoked_by = v_actor,
      revoked_at = pg_catalog.statement_timestamp(),
      revoke_reason = pg_catalog.btrim(p_reason)
  where id = v_grant.id;
  perform private.write_audit(
    v_actor,
    'role.revoked',
    'role_grant',
    v_grant.id,
    pg_catalog.btrim(p_reason),
    pg_catalog.jsonb_build_object('user_id', p_user_id, 'role', 'author')
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
volatile
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
  if p_reason is null or pg_catalog.length(pg_catalog.btrim(p_reason)) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'reason is required';
  end if;
  if exists (
    select 1
    from public.role_grants grant_row
    where grant_row.user_id = p_user_id
      and grant_row.role in ('admin', 'super_admin')
      and grant_row.revoked_at is null
  ) then
    raise exception using
      errcode = '42501',
      message = 'ELEVATED_MUTATION_REQUIRES_MFA';
  end if;
  if p_user_id = v_actor and p_state in ('suspended', 'revoked') then
    raise exception using errcode = '42501', message = 'cannot disable own membership';
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
        when p_state <> 'pending' then coalesce(admitted_at, pg_catalog.statement_timestamp())
        else null
      end,
      suspended_at = case when p_state = 'suspended' then pg_catalog.statement_timestamp() else null end,
      revoked_at = case when p_state = 'revoked' then pg_catalog.statement_timestamp() else null end,
      updated_at = pg_catalog.statement_timestamp()
  where user_id = p_user_id;
  perform private.write_audit(
    v_actor,
    'membership.state_changed',
    'membership',
    p_user_id,
    pg_catalog.btrim(p_reason),
    pg_catalog.jsonb_build_object('from', v_old_state, 'to', p_state)
  );
end;
$$;

revoke all on function public.grant_role(uuid, public.elevated_role, text)
  from public, anon, authenticated, service_role;
revoke all on function public.revoke_role(uuid, public.elevated_role, text)
  from public, anon, authenticated, service_role;
revoke all on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) from public, anon, authenticated, service_role;

grant execute on function public.grant_role(uuid, public.elevated_role, text)
  to authenticated;
grant execute on function public.revoke_role(uuid, public.elevated_role, text)
  to authenticated;
grant execute on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) to authenticated;

do $$
begin
  if exists (select 1 from public.profiles) then
    perform private.bind_elevated_commissioning_policy();
  end if;
end;
$$;

comment on table private.elevated_access_intents is
  'ADR-024 private, Session-bound, one-time elevated commissioning intents; no application role has table access.';
comment on function public.issue_grant_super_admin_intent_v1(
  uuid,
  text,
  text,
  text
) is
  'Exact ADR-024 commissioning intent issue boundary. Actor, Session, target, operation, role, time and MFA facts are database-derived.';
comment on function public.confirm_grant_super_admin_intent_v1(
  uuid,
  uuid,
  text,
  text,
  text
) is
  'Exact ADR-024 atomic grant_super_admin confirmation boundary. Grant, Audit, ledger and one-time consume commit together.';
