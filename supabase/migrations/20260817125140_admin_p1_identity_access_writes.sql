create or replace function private.execute_identity_access_ordinary_mutation(
  p_operation text,
  p_request_id uuid,
  p_target_user_id uuid,
  p_desired_state text,
  p_expected_state_token text,
  p_reason text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_reason text;
  v_payload_fingerprint bytea;
  v_existing_actor_user_id uuid;
  v_existing_payload_fingerprint bytea;
  v_existing_result jsonb;
  v_target_membership_state public.membership_state;
  v_active_author_grant_id uuid;
  v_current_snapshot jsonb;
  v_current_state_token text;
  v_result jsonb;
  v_audit_log_id bigint;
  v_role_grant_id uuid;
  v_changed_at timestamptz;
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  if not (
    private.has_role('admin', v_actor_user_id)
    or private.has_role('super_admin', v_actor_user_id)
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  if p_request_id is null
    or p_request_id = '00000000-0000-0000-0000-000000000000'::uuid
  then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=requestId';
  end if;

  if p_operation not in (
    'grant_author_role',
    'revoke_author_role',
    'set_ordinary_membership_state'
  ) then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=operation';
  end if;

  v_reason := private.require_identity_access_reason(p_reason);
  v_payload_fingerprint := private.identity_access_payload_fingerprint(
    p_operation,
    p_target_user_id,
    p_desired_state,
    p_expected_state_token,
    v_reason
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-request:' || p_request_id::text,
      0
    )
  );

  if not (
    private.has_role('admin', v_actor_user_id)
    or private.has_role('super_admin', v_actor_user_id)
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  select
    ledger.actor_user_id,
    ledger.payload_fingerprint,
    ledger.result_snapshot
  into
    v_existing_actor_user_id,
    v_existing_payload_fingerprint,
    v_existing_result
  from private.identity_access_request_ledger ledger
  where ledger.request_id = p_request_id;

  if found then
    if v_existing_actor_user_id is distinct from v_actor_user_id
      or v_existing_payload_fingerprint is distinct from v_payload_fingerprint
    then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'REQUEST_ID_MISMATCH';
    end if;

    return v_existing_result;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-governance',
      0
    )
  );

  if not (
    private.has_role('admin', v_actor_user_id)
    or private.has_role('super_admin', v_actor_user_id)
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('fandom-harbor:super-admin-role', 0)
  );

  if (
    select pg_catalog.count(*)
    from public.role_grants super_admin_grant
    join public.memberships super_admin_membership
      on super_admin_membership.user_id = super_admin_grant.user_id
    where super_admin_grant.role = 'super_admin'
      and super_admin_grant.revoked_at is null
      and super_admin_membership.state = 'active'
  ) < 1 then
    raise exception using
      errcode = '55000',
      message = 'IDENTITY_ACCESS_GOVERNANCE_UNAVAILABLE';
  end if;

  select membership.state
  into v_target_membership_state
  from public.profiles profile
  join public.memberships membership
    on membership.user_id = profile.user_id
  where profile.user_id = p_target_user_id
  for update of membership;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'TARGET_NOT_FOUND';
  end if;

  perform role_grant.id
  from public.role_grants role_grant
  where role_grant.user_id = p_target_user_id
    and role_grant.revoked_at is null
  order by role_grant.role, role_grant.id
  for update;

  if exists (
    select 1
    from public.role_grants elevated_grant
    where elevated_grant.user_id = p_target_user_id
      and elevated_grant.role in ('admin', 'super_admin')
      and elevated_grant.revoked_at is null
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN',
      detail = 'ELEVATED_MUTATION_DEFERRED';
  end if;

  v_current_snapshot := private.identity_access_expected_state_snapshot(
    p_target_user_id
  );
  v_current_state_token := private.identity_access_state_token(
    p_target_user_id
  );

  if v_current_snapshot is null or v_current_state_token is null then
    raise exception using
      errcode = 'P0002',
      message = 'TARGET_NOT_FOUND';
  end if;

  if v_current_state_token is distinct from p_expected_state_token then
    v_result := pg_catalog.jsonb_build_object(
      'status', 'conflict',
      'requestId', p_request_id::text,
      'targetUserId', p_target_user_id::text,
      'stateToken', v_current_state_token,
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
      p_operation,
      p_target_user_id,
      v_payload_fingerprint,
      'conflict',
      v_result
    );

    return v_result;
  end if;

  select role_grant.id
  into v_active_author_grant_id
  from public.role_grants role_grant
  where role_grant.user_id = p_target_user_id
    and role_grant.role = 'author'
    and role_grant.revoked_at is null;

  if p_operation = 'grant_author_role'
    and v_target_membership_state <> 'active'
  then
    v_result := pg_catalog.jsonb_build_object(
      'status', 'conflict',
      'requestId', p_request_id::text,
      'targetUserId', p_target_user_id::text,
      'stateToken', v_current_state_token,
      'currentState', v_current_snapshot,
      'conflictReason', 'target_membership_not_active'
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
      p_operation,
      p_target_user_id,
      v_payload_fingerprint,
      'conflict',
      v_result
    );

    return v_result;
  end if;

  if (
    p_operation = 'grant_author_role'
    and v_active_author_grant_id is not null
  ) or (
    p_operation = 'revoke_author_role'
    and v_active_author_grant_id is null
  ) or (
    p_operation = 'set_ordinary_membership_state'
    and v_target_membership_state::text = p_desired_state
  ) then
    v_result := pg_catalog.jsonb_build_object(
      'status', 'unchanged',
      'requestId', p_request_id::text,
      'targetUserId', p_target_user_id::text,
      'stateToken', v_current_state_token,
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
      p_operation,
      p_target_user_id,
      v_payload_fingerprint,
      'unchanged',
      v_result
    );

    return v_result;
  end if;

  if p_operation = 'grant_author_role' then
    insert into public.role_grants (
      user_id,
      role,
      granted_by,
      grant_reason
    ) values (
      p_target_user_id,
      'author',
      v_actor_user_id,
      v_reason
    )
    returning id, granted_at into v_role_grant_id, v_changed_at;

    v_audit_log_id := private.write_audit(
      v_actor_user_id,
      'role.granted',
      'role_grant',
      v_role_grant_id,
      v_reason,
      pg_catalog.jsonb_build_object(
        'requestId', p_request_id::text,
        'operation', p_operation,
        'targetUserId', p_target_user_id::text,
        'role', 'author',
        'before', pg_catalog.jsonb_build_object(
          'active', false
        ),
        'after', pg_catalog.jsonb_build_object(
          'active', true,
          'grantId', v_role_grant_id::text
        ),
        'expectedStateToken', p_expected_state_token
      )
    );
  elsif p_operation = 'revoke_author_role' then
    v_role_grant_id := v_active_author_grant_id;
    v_changed_at := pg_catalog.statement_timestamp();

    update public.role_grants
    set revoked_by = v_actor_user_id,
        revoked_at = v_changed_at,
        revoke_reason = v_reason
    where id = v_role_grant_id;

    v_audit_log_id := private.write_audit(
      v_actor_user_id,
      'role.revoked',
      'role_grant',
      v_role_grant_id,
      v_reason,
      pg_catalog.jsonb_build_object(
        'requestId', p_request_id::text,
        'operation', p_operation,
        'targetUserId', p_target_user_id::text,
        'role', 'author',
        'before', pg_catalog.jsonb_build_object(
          'active', true,
          'grantId', v_role_grant_id::text
        ),
        'after', pg_catalog.jsonb_build_object(
          'active', false
        ),
        'expectedStateToken', p_expected_state_token
      )
    );
  else
    v_changed_at := pg_catalog.statement_timestamp();

    update public.memberships
    set state = p_desired_state::public.membership_state,
        admitted_at = case
          when p_desired_state <> 'pending'
            then coalesce(admitted_at, v_changed_at)
          else null
        end,
        suspended_at = case
          when p_desired_state = 'suspended' then v_changed_at
          else null
        end,
        revoked_at = case
          when p_desired_state = 'revoked' then v_changed_at
          else null
        end,
        updated_at = v_changed_at
    where user_id = p_target_user_id;

    v_audit_log_id := private.write_audit(
      v_actor_user_id,
      'membership.state_changed',
      'membership',
      p_target_user_id,
      v_reason,
      pg_catalog.jsonb_build_object(
        'requestId', p_request_id::text,
        'operation', p_operation,
        'targetUserId', p_target_user_id::text,
        'state', p_desired_state,
        'from', v_target_membership_state::text,
        'to', p_desired_state,
        'before', pg_catalog.jsonb_build_object(
          'membershipState', v_target_membership_state::text
        ),
        'after', pg_catalog.jsonb_build_object(
          'membershipState', p_desired_state
        ),
        'expectedStateToken', p_expected_state_token
      )
    );
  end if;

  v_current_snapshot := private.identity_access_expected_state_snapshot(
    p_target_user_id
  );
  v_current_state_token := private.identity_access_state_token(
    p_target_user_id
  );

  v_result := pg_catalog.jsonb_build_object(
    'status', 'saved',
    'requestId', p_request_id::text,
    'targetUserId', p_target_user_id::text,
    'stateToken', v_current_state_token,
    'currentState', v_current_snapshot,
    'auditLogId', v_audit_log_id::text,
    'changedAt', pg_catalog.to_char(
      v_changed_at at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'
    )
  );

  if v_role_grant_id is not null then
    v_result := v_result || pg_catalog.jsonb_build_object(
      'roleGrantId', v_role_grant_id::text
    );
  end if;

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
    p_operation,
    p_target_user_id,
    v_payload_fingerprint,
    'saved',
    v_result,
    v_audit_log_id
  );

  return v_result;
end;
$$;

revoke all on function private.execute_identity_access_ordinary_mutation(
  text,
  uuid,
  uuid,
  text,
  text,
  text
) from public, anon, authenticated, service_role;

create or replace function public.grant_author_role_v2(
  p_request_id uuid,
  p_target_user_id uuid,
  p_expected_state_token text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  return private.execute_identity_access_ordinary_mutation(
    'grant_author_role',
    p_request_id,
    p_target_user_id,
    null,
    p_expected_state_token,
    p_reason
  );
end;
$$;

revoke all on function public.grant_author_role_v2(
  uuid,
  uuid,
  text,
  text
) from public, anon, authenticated, service_role;

create or replace function public.revoke_author_role_v2(
  p_request_id uuid,
  p_target_user_id uuid,
  p_expected_state_token text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  return private.execute_identity_access_ordinary_mutation(
    'revoke_author_role',
    p_request_id,
    p_target_user_id,
    null,
    p_expected_state_token,
    p_reason
  );
end;
$$;

revoke all on function public.revoke_author_role_v2(
  uuid,
  uuid,
  text,
  text
) from public, anon, authenticated, service_role;

create or replace function public.set_ordinary_membership_state_v2(
  p_request_id uuid,
  p_target_user_id uuid,
  p_state public.membership_state,
  p_expected_state_token text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  return private.execute_identity_access_ordinary_mutation(
    'set_ordinary_membership_state',
    p_request_id,
    p_target_user_id,
    p_state::text,
    p_expected_state_token,
    p_reason
  );
end;
$$;

revoke all on function public.set_ordinary_membership_state_v2(
  uuid,
  uuid,
  public.membership_state,
  text,
  text
) from public, anon, authenticated, service_role;

comment on function private.execute_identity_access_ordinary_mutation(
  text,
  uuid,
  uuid,
  text,
  text,
  text
) is
  'Owner-only ordinary Identity Access mutation engine with request replay, expected-state conflict detection, atomic Audit, and ledger persistence.';

comment on function public.grant_author_role_v2(uuid, uuid, text, text) is
  'Execute-closed P1 ordinary Author grant definition; no application role may call before the separately authorized cutover.';

comment on function public.revoke_author_role_v2(uuid, uuid, text, text) is
  'Execute-closed P1 ordinary Author revoke definition; no application role may call before the separately authorized cutover.';

comment on function public.set_ordinary_membership_state_v2(
  uuid,
  uuid,
  public.membership_state,
  text,
  text
) is
  'Execute-closed P1 ordinary Membership definition; elevated targets remain deferred and denied.';
