create table private.identity_access_request_ledger (
  request_id uuid primary key,
  actor_user_id uuid not null
    references public.profiles (user_id) on delete restrict,
  operation text not null,
  target_user_id uuid not null
    references public.profiles (user_id) on delete restrict,
  payload_fingerprint bytea not null,
  result_status text not null,
  result_snapshot jsonb not null,
  audit_log_id bigint unique
    references public.audit_logs (id) on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  constraint identity_access_request_id_non_nil check (
    request_id <> '00000000-0000-0000-0000-000000000000'::uuid
  ),
  constraint identity_access_request_operation check (
    operation in (
      'grant_author_role',
      'revoke_author_role',
      'set_ordinary_membership_state'
    )
  ),
  constraint identity_access_request_fingerprint_sha256 check (
    pg_catalog.octet_length(payload_fingerprint) = 32
  ),
  constraint identity_access_request_result_status check (
    result_status in ('saved', 'unchanged', 'conflict')
  ),
  constraint identity_access_request_result_object check (
    pg_catalog.jsonb_typeof(result_snapshot) = 'object'
  ),
  constraint identity_access_request_result_matches_status check (
    result_snapshot ->> 'status' = result_status
  ),
  constraint identity_access_request_saved_audit check (
    (result_status = 'saved' and audit_log_id is not null)
    or (result_status in ('unchanged', 'conflict') and audit_log_id is null)
  )
);

create index identity_access_request_ledger_actor_created
  on private.identity_access_request_ledger (
    actor_user_id,
    created_at desc
  );

create index identity_access_request_ledger_target_created
  on private.identity_access_request_ledger (
    target_user_id,
    created_at desc
  );

alter table private.identity_access_request_ledger enable row level security;

revoke all on table private.identity_access_request_ledger
  from public, anon, authenticated, service_role;

create or replace function private.normalize_identity_access_reason(
  p_value text
)
returns text
language sql
immutable
parallel safe
security invoker
set search_path = ''
as $$
  select pg_catalog.btrim(pg_catalog.normalize(p_value));
$$;

create or replace function private.identity_access_reason_is_valid(
  p_value text
)
returns boolean
language sql
immutable
parallel safe
security invoker
set search_path = ''
as $$
  select p_value is not null
    and p_value = private.normalize_identity_access_reason(p_value)
    and pg_catalog.char_length(p_value) between 4 and 200
    and p_value !~ '[[:cntrl:]]';
$$;

create or replace function private.require_identity_access_reason(
  p_value text
)
returns text
language plpgsql
immutable
parallel safe
security invoker
set search_path = ''
as $$
declare
  v_value text := private.normalize_identity_access_reason(p_value);
begin
  if not private.identity_access_reason_is_valid(v_value) then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=reason';
  end if;

  return v_value;
end;
$$;

create or replace function private.identity_access_expected_state_snapshot(
  p_target_user_id uuid
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'targetUserId', m.user_id::text,
    'membership', pg_catalog.jsonb_build_object(
      'state', m.state::text,
      'updatedAt', pg_catalog.to_char(
        m.updated_at at time zone 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
      )
    ),
    'activeRoleGrants', coalesce(
      (
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'grantId', rg.id::text,
            'role', rg.role::text,
            'grantedAt', pg_catalog.to_char(
              rg.granted_at at time zone 'UTC',
              'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
            )
          )
          order by rg.role, rg.id
        )
        from public.role_grants rg
        where rg.user_id = m.user_id
          and rg.revoked_at is null
      ),
      '[]'::jsonb
    )
  )
  from public.memberships m
  where m.user_id = p_target_user_id;
$$;

create or replace function private.identity_access_state_token(
  p_target_user_id uuid
)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when state_snapshot is null then null
    else pg_catalog.encode(
      extensions.digest(
        pg_catalog.convert_to(state_snapshot::text, 'UTF8'),
        'sha256'
      ),
      'hex'
    )
  end
  from (
    select private.identity_access_expected_state_snapshot(
      p_target_user_id
    ) as state_snapshot
  ) snapshots;
$$;

create or replace function private.identity_access_payload_fingerprint(
  p_operation text,
  p_target_user_id uuid,
  p_desired_state text,
  p_expected_state_token text,
  p_reason text
)
returns bytea
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_reason text;
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'authentication required';
  end if;

  if p_target_user_id is null
    or p_expected_state_token is null
    or p_expected_state_token !~ '^[0-9a-f]{64}$'
  then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=request_contract';
  end if;

  if p_operation in ('grant_author_role', 'revoke_author_role') then
    if p_desired_state is not null then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=desired_state';
    end if;
  elsif p_operation = 'set_ordinary_membership_state' then
    if p_desired_state is null
      or p_desired_state not in ('active', 'suspended', 'revoked')
    then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=desired_state';
    end if;
  else
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=operation';
  end if;

  v_reason := private.require_identity_access_reason(p_reason);

  return extensions.digest(
    pg_catalog.convert_to(
      pg_catalog.jsonb_build_object(
        'version', 1,
        'actorUserId', v_actor_user_id::text,
        'operation', p_operation,
        'targetUserId', p_target_user_id::text,
        'desiredState', p_desired_state,
        'expectedStateToken', p_expected_state_token,
        'reason', v_reason
      )::text,
      'UTF8'
    ),
    'sha256'
  );
end;
$$;

create or replace function private.prevent_identity_access_ledger_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'IDENTITY_ACCESS_REQUEST_LEDGER_IMMUTABLE';
end;
$$;

create trigger identity_access_request_ledger_immutable
before update or delete on private.identity_access_request_ledger
for each row execute function private.prevent_identity_access_ledger_mutation();

create or replace function private.prevent_audit_log_mutation()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (
    old.target_type = 'site_copy_revision'
    and old.action in ('site_copy.initialized', 'site_copy.updated')
  ) or (
    tg_op = 'UPDATE'
    and new.target_type = 'site_copy_revision'
    and new.action in ('site_copy.initialized', 'site_copy.updated')
  ) then
    raise exception using
      errcode = '55000',
      message = 'SITE_COPY_AUDIT_IMMUTABLE';
  end if;

  raise exception using
    errcode = '55000',
    message = 'AUDIT_LOG_IMMUTABLE';
end;
$$;

drop trigger site_copy_audit_immutable on public.audit_logs;

create trigger audit_logs_immutable
before update or delete on public.audit_logs
for each row execute function private.prevent_audit_log_mutation();

revoke all on function private.normalize_identity_access_reason(text)
  from public, anon, authenticated, service_role;
revoke all on function private.identity_access_reason_is_valid(text)
  from public, anon, authenticated, service_role;
revoke all on function private.require_identity_access_reason(text)
  from public, anon, authenticated, service_role;
revoke all on function private.identity_access_expected_state_snapshot(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.identity_access_state_token(uuid)
  from public, anon, authenticated, service_role;
revoke all on function private.identity_access_payload_fingerprint(
  text,
  uuid,
  text,
  text,
  text
) from public, anon, authenticated, service_role;
revoke all on function private.prevent_identity_access_ledger_mutation()
  from public, anon, authenticated, service_role;
revoke all on function private.prevent_audit_log_mutation()
  from public, anon, authenticated, service_role;

comment on table private.identity_access_request_ledger is
  'Append-only idempotency results for ordinary Identity Access governance; private, unexposed, and retained indefinitely.';

comment on function private.identity_access_payload_fingerprint(
  text,
  uuid,
  text,
  text,
  text
) is
  'Builds the versioned SHA-256 fingerprint from auth.uid() and the normalized ordinary-governance payload; performs no authorization.';
