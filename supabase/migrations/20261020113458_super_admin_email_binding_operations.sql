create table private.super_admin_email_binding_operations (
  operation_id uuid primary key default extensions.gen_random_uuid(),
  target_user_id uuid not null
    references public.profiles (user_id) on delete restrict,
  operator_reference text not null,
  status text not null default 'prepared',
  prepared_at timestamptz not null default statement_timestamp(),
  expires_at timestamptz not null,
  bound_at timestamptz,
  bound_session_id uuid,
  email_fingerprint bytea,
  password_verified_at timestamptz,
  totp_authenticated_at timestamptz,
  pre_continuity_fingerprint bytea,
  identity_changed_at timestamptz,
  recovery_reason_code text,
  reauth_started_at timestamptz,
  sessions_revoked_at timestamptz,
  elevated_intents_invalidated_at timestamptz,
  reauthenticated_session_id uuid,
  protected_admin_read_verified_at timestamptz,
  completed_at timestamptz,
  terminal_at timestamptz,
  terminal_reason_code text,
  updated_at timestamptz not null default statement_timestamp(),
  constraint super_admin_email_binding_operator_reference check (
    pg_catalog.btrim(operator_reference) = operator_reference
    and pg_catalog.length(operator_reference) between 1 and 200
  ),
  constraint super_admin_email_binding_status check (
    status in (
      'prepared',
      'bound',
      'current_confirmed',
      'new_email_sent',
      'identity_changed',
      'recovery_required',
      'awaiting_reauth',
      'completed',
      'cancelled',
      'expired',
      'failed'
    )
  ),
  constraint super_admin_email_binding_lifetime check (
    expires_at > prepared_at
    and expires_at <= prepared_at + interval '1 hour'
  ),
  constraint super_admin_email_binding_fingerprint check (
    email_fingerprint is null
    or pg_catalog.octet_length(email_fingerprint) = 32
  ),
  constraint super_admin_email_binding_continuity_fingerprint check (
    pre_continuity_fingerprint is null
    or pg_catalog.octet_length(pre_continuity_fingerprint) = 32
  ),
  constraint super_admin_email_binding_recovery_reason check (
    recovery_reason_code is null
    or recovery_reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  constraint super_admin_email_binding_terminal_reason check (
    terminal_reason_code is null
    or terminal_reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  constraint super_admin_email_binding_session_rotation check (
    reauthenticated_session_id is null
    or bound_session_id is null
    or reauthenticated_session_id <> bound_session_id
  )
);

create unique index super_admin_email_binding_one_active_per_user
  on private.super_admin_email_binding_operations (target_user_id)
  where status in (
    'prepared',
    'bound',
    'current_confirmed',
    'new_email_sent',
    'identity_changed',
    'recovery_required',
    'awaiting_reauth'
  );

create unique index super_admin_email_binding_one_active_globally
  on private.super_admin_email_binding_operations ((true))
  where status in (
    'prepared',
    'bound',
    'current_confirmed',
    'new_email_sent',
    'identity_changed',
    'recovery_required',
    'awaiting_reauth'
  );

create index super_admin_email_binding_operations_target_time
  on private.super_admin_email_binding_operations (
    target_user_id,
    prepared_at desc
  );

alter table private.super_admin_email_binding_operations enable row level security;

revoke all on table private.super_admin_email_binding_operations
  from public, anon, authenticated, service_role;

create table private.super_admin_email_binding_audit (
  audit_id bigint generated always as identity primary key,
  operation_id uuid not null references
    private.super_admin_email_binding_operations (operation_id)
    on delete restrict,
  target_user_id uuid not null references public.profiles (user_id)
    on delete restrict,
  event_code text not null,
  from_status text,
  to_status text not null,
  reason_code text,
  recorded_at timestamptz not null default statement_timestamp(),
  constraint super_admin_email_binding_audit_event check (
    event_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  ),
  constraint super_admin_email_binding_audit_reason check (
    reason_code is null or reason_code ~ '^[A-Z][A-Z0-9_]{2,63}$'
  )
);

alter table private.super_admin_email_binding_audit enable row level security;

revoke all on table private.super_admin_email_binding_audit
  from public, anon, authenticated, service_role;

create or replace function private.is_super_admin_email_binding_target(
  p_user_id uuid
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from private.elevated_commissioning_policy policy
    join public.profiles profile
      on profile.user_id = p_user_id
    join auth.users auth_user
      on auth_user.id = profile.user_id
     and auth_user.deleted_at is null
    join public.memberships membership
      on membership.user_id = profile.user_id
     and membership.state = 'active'
    where policy.policy_id = 'initial-super-admin-commissioning'
      and policy.enabled = true
      and (
        (
          p_user_id = policy.actor_user_id
          and pg_catalog.lower(profile.registration_name) =
            pg_catalog.lower(policy.actor_registration_name)
        ) or (
          p_user_id = policy.target_user_id
          and pg_catalog.lower(profile.registration_name) =
            pg_catalog.lower(policy.target_registration_name)
        )
      )
      and exists (
        select 1
        from public.role_grants grant_row
        where grant_row.user_id = p_user_id
          and grant_row.role = 'super_admin'
          and grant_row.revoked_at is null
      )
      and (
        select pg_catalog.count(*)
        from auth.mfa_factors factor
        where factor.user_id = p_user_id
          and factor.factor_type::text = 'totp'
          and factor.status::text = 'verified'
      ) >= 2
      and (
        select pg_catalog.count(*)
        from auth.identities identity
        where identity.user_id = p_user_id
          and identity.provider = 'email'
      ) = 1
  );
$$;

revoke all on function private.is_super_admin_email_binding_target(uuid)
  from public, anon, authenticated, service_role;

create or replace function private.super_admin_email_binding_continuity(
  p_user_id uuid
)
returns bytea
language sql
stable
security invoker
set search_path = ''
as $$
  select extensions.digest(
    pg_catalog.convert_to(
      pg_catalog.jsonb_build_object(
        'userId', p_user_id::text,
        'membership', (
          select pg_catalog.jsonb_build_object(
            'state', membership.state::text,
            'admittedAtEpochSeconds', case
              when membership.admitted_at is null then null
              else pg_catalog.floor(
                extract(epoch from membership.admitted_at)
              )::bigint
            end
          )
          from public.memberships membership
          where membership.user_id = p_user_id
        ),
        'roles', coalesce((
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'id', grant_row.id::text,
              'role', grant_row.role::text,
              'grantedAtEpochSeconds', pg_catalog.floor(
                extract(epoch from grant_row.granted_at)
              )::bigint
            ) order by grant_row.id::text
          )
          from public.role_grants grant_row
          where grant_row.user_id = p_user_id
            and grant_row.revoked_at is null
        ), '[]'::jsonb),
        'totpFactors', coalesce((
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'id', factor.id::text,
              'status', factor.status::text,
              'type', factor.factor_type::text
            ) order by factor.id::text
          )
          from auth.mfa_factors factor
          where factor.user_id = p_user_id
        ), '[]'::jsonb),
        'emailIdentities', coalesce((
          select pg_catalog.jsonb_agg(
            pg_catalog.jsonb_build_object(
              'id', identity.id::text,
              'provider', identity.provider
            ) order by identity.id::text
          )
          from auth.identities identity
          where identity.user_id = p_user_id
            and identity.provider = 'email'
        ), '[]'::jsonb)
      )::text,
      'UTF8'
    ),
    'sha256'
  );
$$;

revoke all on function private.super_admin_email_binding_continuity(uuid)
  from public, anon, authenticated, service_role;

create or replace function private.super_admin_email_binding_snapshot(
  p_operation private.super_admin_email_binding_operations
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'operationId', p_operation.operation_id::text,
    'targetUserId', p_operation.target_user_id::text,
    'status', p_operation.status,
    'preparedAtEpochSeconds', pg_catalog.floor(
      extract(epoch from p_operation.prepared_at)
    )::bigint,
    'expiresAtEpochSeconds', pg_catalog.floor(
      extract(epoch from p_operation.expires_at)
    )::bigint,
    'sessionBound', p_operation.bound_session_id is not null,
    'emailFingerprintBound', p_operation.email_fingerprint is not null,
    'recoveryReasonCode', p_operation.recovery_reason_code,
    'completedAtEpochSeconds', case
      when p_operation.completed_at is null then null
      else pg_catalog.floor(
        extract(epoch from p_operation.completed_at)
      )::bigint
    end
  );
$$;

revoke all on function private.super_admin_email_binding_snapshot(
  private.super_admin_email_binding_operations
) from public, anon, authenticated, service_role;

create or replace function private.expire_super_admin_email_binding(
  p_operation_id uuid,
  p_now timestamptz
)
returns private.super_admin_email_binding_operations
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  v_operation private.super_admin_email_binding_operations%rowtype;
  v_from_status text;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  if p_now <= v_operation.expires_at
    or v_operation.status in ('completed', 'cancelled', 'expired', 'failed')
  then
    return v_operation;
  end if;

  v_from_status := v_operation.status;
  if v_operation.status in ('prepared', 'bound') then
    update private.super_admin_email_binding_operations
    set status = 'expired',
        terminal_at = p_now,
        terminal_reason_code = 'OPERATION_EXPIRED',
        updated_at = p_now
    where operation_id = p_operation_id
    returning * into strict v_operation;
  else
    update private.super_admin_email_binding_operations
    set status = 'recovery_required',
        recovery_reason_code = 'OPERATION_EXPIRED_AFTER_EXTERNAL_STEP',
        updated_at = p_now
    where operation_id = p_operation_id
    returning * into strict v_operation;
  end if;

  insert into private.super_admin_email_binding_audit (
    operation_id,
    target_user_id,
    event_code,
    from_status,
    to_status,
    reason_code,
    recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'OPERATION_EXPIRED',
    v_from_status,
    v_operation.status,
    coalesce(v_operation.terminal_reason_code, v_operation.recovery_reason_code),
    p_now
  );

  return v_operation;
end;
$$;

revoke all on function private.expire_super_admin_email_binding(uuid, timestamptz)
  from public, anon, authenticated, service_role;

create or replace function public.get_super_admin_email_binding_targets_v1()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    pg_catalog.jsonb_agg(candidate.user_id::text order by candidate.user_id::text),
    '[]'::jsonb
  )
  from (
    select policy.actor_user_id as user_id
    from private.elevated_commissioning_policy policy
    where policy.policy_id = 'initial-super-admin-commissioning'
      and policy.enabled = true
      and private.is_super_admin_email_binding_target(policy.actor_user_id)
    union all
    select policy.target_user_id as user_id
    from private.elevated_commissioning_policy policy
    where policy.policy_id = 'initial-super-admin-commissioning'
      and policy.enabled = true
      and private.is_super_admin_email_binding_target(policy.target_user_id)
  ) candidate;
$$;

revoke all on function public.get_super_admin_email_binding_targets_v1()
  from public, anon, authenticated, service_role;
grant execute on function public.get_super_admin_email_binding_targets_v1()
  to service_role;

create or replace function public.get_super_admin_email_binding_operation_v1(
  p_operation_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.super_admin_email_binding_snapshot(operation)
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id;
$$;

revoke all on function public.get_super_admin_email_binding_operation_v1(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.get_super_admin_email_binding_operation_v1(uuid)
  to service_role;

create or replace function public.assert_super_admin_email_binding_context_v1(
  p_operation_id uuid,
  p_expected_status text,
  p_session_id uuid,
  p_email_fingerprint text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  v_operation := private.expire_super_admin_email_binding(
    v_operation.operation_id,
    v_now
  );

  if v_operation.status <> p_expected_status
    or v_operation.bound_session_id <> p_session_id
    or v_operation.email_fingerprint <>
      pg_catalog.decode(coalesce(p_email_fingerprint, ''), 'hex')
    or not exists (
      select 1
      from auth.sessions session_row
      where session_row.id = p_session_id
        and session_row.user_id = v_operation.target_user_id
        and (
          session_row.not_after is null
          or session_row.not_after > v_now
        )
    )
  then
    raise exception using errcode = '42501', message = 'INVALID_BINDING_CONTEXT';
  end if;

  return private.super_admin_email_binding_snapshot(v_operation);
exception
  when invalid_parameter_value or invalid_text_representation then
    raise exception using errcode = '42501', message = 'INVALID_BINDING_CONTEXT';
end;
$$;

revoke all on function public.assert_super_admin_email_binding_context_v1(
  uuid, text, uuid, text
) from public, anon, authenticated, service_role;
grant execute on function public.assert_super_admin_email_binding_context_v1(
  uuid, text, uuid, text
) to service_role;

create or replace function public.prepare_super_admin_email_binding_v1(
  p_target_user_id uuid,
  p_ttl_seconds integer,
  p_operator_reference text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_existing record;
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  if p_ttl_seconds is null or p_ttl_seconds < 60 or p_ttl_seconds > 3600
    or p_operator_reference is null
    or pg_catalog.btrim(p_operator_reference) <> p_operator_reference
    or pg_catalog.length(p_operator_reference) not between 1 and 200
  then
    raise exception using errcode = '22023', message = 'INVALID_REQUEST';
  end if;

  if not private.is_super_admin_email_binding_target(p_target_user_id) then
    raise exception using errcode = '42501', message = 'INVALID_TARGET';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:super-admin-email-binding:global',
      741031
    )
  );

  for v_existing in
    select operation.operation_id
    from private.super_admin_email_binding_operations operation
    where operation.status in (
        'prepared', 'bound', 'current_confirmed', 'new_email_sent',
        'identity_changed', 'recovery_required', 'awaiting_reauth'
      )
    for update
  loop
    perform private.expire_super_admin_email_binding(
      v_existing.operation_id,
      v_now
    );
  end loop;

  if exists (
    select 1
    from private.super_admin_email_binding_operations operation
    where operation.status in (
        'prepared', 'bound', 'current_confirmed', 'new_email_sent',
        'identity_changed', 'recovery_required', 'awaiting_reauth'
      )
  ) then
    raise exception using errcode = '23505', message = 'ACTIVE_OPERATION_EXISTS';
  end if;

  insert into private.super_admin_email_binding_operations (
    target_user_id,
    operator_reference,
    expires_at
  ) values (
    p_target_user_id,
    p_operator_reference,
    v_now + pg_catalog.make_interval(secs => p_ttl_seconds)
  ) returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, to_status, recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'OPERATION_PREPARED',
    'prepared',
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
end;
$$;

revoke all on function public.prepare_super_admin_email_binding_v1(
  uuid, integer, text
) from public, anon, authenticated, service_role;
grant execute on function public.prepare_super_admin_email_binding_v1(
  uuid, integer, text
) to service_role;

create or replace function public.bind_super_admin_email_binding_v1(
  p_operation_id uuid,
  p_target_user_id uuid,
  p_session_id uuid,
  p_assurance_level text,
  p_password_verified_at timestamptz,
  p_email_fingerprint text,
  p_totp_authenticated_at timestamptz
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  v_operation := private.expire_super_admin_email_binding(
    v_operation.operation_id,
    v_now
  );

  if v_operation.status <> 'prepared'
    or v_operation.target_user_id <> p_target_user_id
    or not private.is_super_admin_email_binding_target(p_target_user_id)
  then
    raise exception using errcode = '42501', message = 'OPERATION_NOT_BINDABLE';
  end if;

  if p_assurance_level <> 'aal2'
    or p_password_verified_at is null
    or p_totp_authenticated_at is null
    or p_password_verified_at < v_operation.prepared_at
    or p_totp_authenticated_at < v_operation.prepared_at
    or p_password_verified_at > v_now
    or p_totp_authenticated_at > v_now
    or v_now - p_password_verified_at > interval '5 minutes'
    or v_now - p_totp_authenticated_at > interval '5 minutes'
  then
    raise exception using errcode = '42501', message = 'FRESH_REAUTH_REQUIRED';
  end if;

  if p_email_fingerprint is null
    or p_email_fingerprint !~ '^[0-9a-f]{64}$'
    or not exists (
      select 1
      from auth.sessions session_row
      where session_row.id = p_session_id
        and session_row.user_id = p_target_user_id
        and session_row.aal::text = 'aal2'
        and (
          session_row.not_after is null
          or session_row.not_after > v_now
        )
    )
  then
    raise exception using errcode = '42501', message = 'INVALID_BINDING_EVIDENCE';
  end if;

  update private.super_admin_email_binding_operations
  set status = 'bound',
      bound_at = v_now,
      bound_session_id = p_session_id,
      email_fingerprint = pg_catalog.decode(p_email_fingerprint, 'hex'),
      password_verified_at = p_password_verified_at,
      totp_authenticated_at = p_totp_authenticated_at,
      pre_continuity_fingerprint =
        private.super_admin_email_binding_continuity(p_target_user_id),
      updated_at = v_now
  where operation_id = p_operation_id
    and status = 'prepared'
    and bound_session_id is null
    and email_fingerprint is null
  returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, from_status, to_status,
    recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'OPERATION_BOUND',
    'prepared',
    'bound',
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
end;
$$;

revoke all on function public.bind_super_admin_email_binding_v1(
  uuid, uuid, uuid, text, timestamptz, text, timestamptz
) from public, anon, authenticated, service_role;
grant execute on function public.bind_super_admin_email_binding_v1(
  uuid, uuid, uuid, text, timestamptz, text, timestamptz
) to service_role;

create or replace function public.advance_super_admin_email_binding_v1(
  p_operation_id uuid,
  p_expected_status text,
  p_next_status text,
  p_session_id uuid,
  p_email_fingerprint text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  v_operation := private.expire_super_admin_email_binding(
    v_operation.operation_id,
    v_now
  );

  if v_operation.status <> p_expected_status
    or v_operation.bound_session_id <> p_session_id
    or v_operation.email_fingerprint <>
      pg_catalog.decode(coalesce(p_email_fingerprint, ''), 'hex')
    or (
      not (
        p_expected_status = 'recovery_required'
        and p_next_status = 'identity_changed'
      )
      and not exists (
        select 1
        from auth.sessions session_row
        where session_row.id = p_session_id
          and session_row.user_id = v_operation.target_user_id
          and (
            session_row.not_after is null
            or session_row.not_after > v_now
          )
      )
    )
    or (
      p_expected_status = 'recovery_required'
      and p_next_status = 'identity_changed'
      and v_operation.pre_continuity_fingerprint <>
        private.super_admin_email_binding_continuity(
          v_operation.target_user_id
        )
    )
    or not (
      (p_expected_status = 'bound' and p_next_status = 'current_confirmed')
      or (
        p_expected_status = 'current_confirmed'
        and p_next_status = 'new_email_sent'
      )
      or (
        p_expected_status = 'new_email_sent'
        and p_next_status = 'identity_changed'
      )
      or (
        p_expected_status = 'recovery_required'
        and p_next_status = 'identity_changed'
      )
    )
  then
    raise exception using errcode = '42501', message = 'INVALID_TRANSITION';
  end if;

  update private.super_admin_email_binding_operations
  set status = p_next_status,
      identity_changed_at = case
        when p_next_status = 'identity_changed' then v_now
        else identity_changed_at
      end,
      recovery_reason_code = case
        when p_expected_status = 'recovery_required' then null
        else recovery_reason_code
      end,
      updated_at = v_now
  where operation_id = p_operation_id
    and status = p_expected_status
  returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, from_status, to_status,
    recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'STATE_ADVANCED',
    p_expected_status,
    p_next_status,
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
exception
  when invalid_parameter_value or invalid_text_representation then
    raise exception using errcode = '42501', message = 'INVALID_TRANSITION';
end;
$$;

revoke all on function public.advance_super_admin_email_binding_v1(
  uuid, text, text, uuid, text
) from public, anon, authenticated, service_role;
grant execute on function public.advance_super_admin_email_binding_v1(
  uuid, text, text, uuid, text
) to service_role;

create or replace function public.mark_super_admin_email_binding_recovery_v1(
  p_operation_id uuid,
  p_session_id uuid,
  p_email_fingerprint text,
  p_reason_code text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
  v_from_status text;
begin
  if p_reason_code is null
    or p_reason_code !~ '^[A-Z][A-Z0-9_]{2,63}$'
  then
    raise exception using errcode = '22023', message = 'INVALID_REASON_CODE';
  end if;

  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  v_from_status := v_operation.status;
  if v_operation.status not in (
    'bound', 'current_confirmed', 'new_email_sent', 'identity_changed',
    'awaiting_reauth'
  )
    or v_operation.bound_session_id <> p_session_id
    or v_operation.email_fingerprint <>
      pg_catalog.decode(coalesce(p_email_fingerprint, ''), 'hex')
  then
    raise exception using errcode = '42501', message = 'RECOVERY_NOT_ALLOWED';
  end if;

  update private.super_admin_email_binding_operations
  set status = 'recovery_required',
      recovery_reason_code = p_reason_code,
      updated_at = v_now
  where operation_id = p_operation_id
    and status = v_from_status
  returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, from_status, to_status,
    reason_code, recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'RECOVERY_REQUIRED',
    v_from_status,
    'recovery_required',
    p_reason_code,
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
exception
  when invalid_parameter_value or invalid_text_representation then
    raise exception using errcode = '42501', message = 'RECOVERY_NOT_ALLOWED';
end;
$$;

revoke all on function public.mark_super_admin_email_binding_recovery_v1(
  uuid, uuid, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.mark_super_admin_email_binding_recovery_v1(
  uuid, uuid, text, text
) to service_role;

create or replace function public.begin_super_admin_email_binding_reauth_v1(
  p_operation_id uuid,
  p_original_session_id uuid,
  p_email_fingerprint text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  if v_operation.status <> 'identity_changed'
    or v_operation.bound_session_id <> p_original_session_id
    or v_operation.email_fingerprint <>
      pg_catalog.decode(coalesce(p_email_fingerprint, ''), 'hex')
    or exists (
      select 1
      from auth.sessions session_row
      where session_row.user_id = v_operation.target_user_id
    )
    or v_operation.pre_continuity_fingerprint <>
      private.super_admin_email_binding_continuity(
        v_operation.target_user_id
      )
  then
    raise exception using errcode = '42501', message = 'REAUTH_NOT_READY';
  end if;

  update private.elevated_access_intents intent
  set consumed_at = v_now,
      terminal_status = 'expired'
  where intent.consumed_at is null
    and (
      intent.actor_user_id = v_operation.target_user_id
      or intent.target_user_id = v_operation.target_user_id
    );

  update private.super_admin_email_binding_operations
  set status = 'awaiting_reauth',
      reauth_started_at = v_now,
      sessions_revoked_at = v_now,
      elevated_intents_invalidated_at = v_now,
      updated_at = v_now
  where operation_id = p_operation_id
    and status = 'identity_changed'
  returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, from_status, to_status,
    recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'AWAITING_REAUTH',
    'identity_changed',
    'awaiting_reauth',
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
exception
  when invalid_parameter_value or invalid_text_representation then
    raise exception using errcode = '42501', message = 'REAUTH_NOT_READY';
end;
$$;

revoke all on function public.begin_super_admin_email_binding_reauth_v1(
  uuid, uuid, text
) from public, anon, authenticated, service_role;
grant execute on function public.begin_super_admin_email_binding_reauth_v1(
  uuid, uuid, text
) to service_role;

create or replace function public.complete_super_admin_email_binding_v1(
  p_operation_id uuid,
  p_new_session_id uuid,
  p_assurance_level text,
  p_password_reauthenticated_at timestamptz,
  p_totp_authenticated_at timestamptz,
  p_protected_admin_read_verified boolean,
  p_email_fingerprint text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
begin
  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  if v_operation.status <> 'awaiting_reauth'
    or p_new_session_id = v_operation.bound_session_id
    or p_assurance_level <> 'aal2'
    or p_protected_admin_read_verified is distinct from true
    or v_operation.email_fingerprint <>
      pg_catalog.decode(coalesce(p_email_fingerprint, ''), 'hex')
    or p_password_reauthenticated_at < v_operation.reauth_started_at
    or p_totp_authenticated_at < v_operation.reauth_started_at
    or p_password_reauthenticated_at > v_now
    or p_totp_authenticated_at > v_now
    or v_now - p_password_reauthenticated_at > interval '5 minutes'
    or v_now - p_totp_authenticated_at > interval '5 minutes'
    or not exists (
      select 1
      from auth.sessions session_row
      where session_row.id = p_new_session_id
        and session_row.user_id = v_operation.target_user_id
        and session_row.aal::text = 'aal2'
        and (
          session_row.not_after is null
          or session_row.not_after > v_now
        )
    )
    or exists (
      select 1
      from private.elevated_access_intents intent
      where intent.consumed_at is null
        and (
          intent.actor_user_id = v_operation.target_user_id
          or intent.target_user_id = v_operation.target_user_id
        )
    )
    or v_operation.pre_continuity_fingerprint <>
      private.super_admin_email_binding_continuity(
        v_operation.target_user_id
      )
  then
    raise exception using errcode = '42501', message = 'REAUTH_NOT_VERIFIED';
  end if;

  update private.super_admin_email_binding_operations
  set status = 'completed',
      reauthenticated_session_id = p_new_session_id,
      protected_admin_read_verified_at = v_now,
      completed_at = v_now,
      terminal_at = v_now,
      updated_at = v_now
  where operation_id = p_operation_id
    and status = 'awaiting_reauth'
  returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, from_status, to_status,
    recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'OPERATION_COMPLETED',
    'awaiting_reauth',
    'completed',
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
end;
$$;

revoke all on function public.complete_super_admin_email_binding_v1(
  uuid, uuid, text, timestamptz, timestamptz, boolean, text
) from public, anon, authenticated, service_role;
grant execute on function public.complete_super_admin_email_binding_v1(
  uuid, uuid, text, timestamptz, timestamptz, boolean, text
) to service_role;

create or replace function public.terminate_super_admin_email_binding_v1(
  p_operation_id uuid,
  p_terminal_status text,
  p_reason_code text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := pg_catalog.statement_timestamp();
  v_operation private.super_admin_email_binding_operations%rowtype;
  v_from_status text;
begin
  if p_terminal_status not in ('cancelled', 'failed')
    or p_reason_code is null
    or p_reason_code !~ '^[A-Z][A-Z0-9_]{2,63}$'
  then
    raise exception using errcode = '22023', message = 'INVALID_TERMINATION';
  end if;

  select operation.*
  into strict v_operation
  from private.super_admin_email_binding_operations operation
  where operation.operation_id = p_operation_id
  for update;

  v_from_status := v_operation.status;
  if v_operation.status not in ('prepared', 'bound') then
    raise exception using errcode = '42501', message = 'RECOVERY_REQUIRED';
  end if;

  update private.super_admin_email_binding_operations
  set status = p_terminal_status,
      terminal_at = v_now,
      terminal_reason_code = p_reason_code,
      updated_at = v_now
  where operation_id = p_operation_id
    and status = v_from_status
  returning * into strict v_operation;

  insert into private.super_admin_email_binding_audit (
    operation_id, target_user_id, event_code, from_status, to_status,
    reason_code, recorded_at
  ) values (
    v_operation.operation_id,
    v_operation.target_user_id,
    'OPERATION_TERMINATED',
    v_from_status,
    p_terminal_status,
    p_reason_code,
    v_now
  );

  return private.super_admin_email_binding_snapshot(v_operation);
end;
$$;

revoke all on function public.terminate_super_admin_email_binding_v1(
  uuid, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.terminate_super_admin_email_binding_v1(
  uuid, text, text
) to service_role;

comment on table private.super_admin_email_binding_operations is
  'B3-SA additive ledger for the two P1-07C-bound Super Admin email operations.';

comment on column private.super_admin_email_binding_operations.email_fingerprint is
  'Server-only keyed HMAC-SHA-256 of the normalized target email; never a raw or unkeyed email digest.';

comment on table private.super_admin_email_binding_audit is
  'Redacted B3-SA state-transition evidence; never stores email, OTP, token, or password data.';
