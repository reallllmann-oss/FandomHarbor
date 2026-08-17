create or replace function public.search_identity_access_subjects_v1(
  p_query text default null,
  p_cursor jsonb default null,
  p_limit integer default 25
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_query text;
  v_query_user_id uuid;
  v_limit integer := p_limit;
  v_cursor_missing boolean;
  v_cursor_name text;
  v_cursor_user_id uuid;
  v_items jsonb;
  v_has_more boolean;
  v_last_item jsonb;
  v_next_cursor jsonb;
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  if not (
    private.current_user_has_role('admin')
    or private.current_user_has_role('super_admin')
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  if v_limit is null or v_limit not between 1 and 50 then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=limit';
  end if;

  v_query := nullif(
    pg_catalog.lower(
      pg_catalog.btrim(
        pg_catalog."normalize"(p_query, 'NFKC')
      )
    ),
    ''
  );

  if v_query is not null then
    if pg_catalog.char_length(v_query) > 64
      or v_query ~ '[[:cntrl:]]'
    then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=query';
    end if;

    if v_query ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      v_query_user_id := v_query::uuid;
    end if;
  end if;

  if p_cursor is not null then
    if pg_catalog.jsonb_typeof(p_cursor) <> 'object'
      or not (p_cursor ? 'missingRegistrationName')
      or not (p_cursor ? 'normalizedRegistrationName')
      or not (p_cursor ? 'userId')
      or p_cursor - array[
        'missingRegistrationName',
        'normalizedRegistrationName',
        'userId'
      ]::text[] <> '{}'::jsonb
      or p_cursor ->> 'missingRegistrationName' not in ('true', 'false')
      or p_cursor ->> 'userId' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=cursor';
    end if;

    v_cursor_missing := (p_cursor ->> 'missingRegistrationName')::boolean;
    v_cursor_name := p_cursor ->> 'normalizedRegistrationName';
    v_cursor_user_id := (p_cursor ->> 'userId')::uuid;

    if (
      v_cursor_missing
      and v_cursor_name is not null
    ) or (
      not v_cursor_missing
      and (
        v_cursor_name is null
        or v_cursor_name = ''
        or v_cursor_name <> pg_catalog.lower(
          pg_catalog.btrim(
            pg_catalog."normalize"(v_cursor_name, 'NFKC')
          )
        )
        or pg_catalog.char_length(v_cursor_name) > 64
        or v_cursor_name ~ '[[:cntrl:]]'
      )
    ) then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=cursor';
    end if;
  end if;

  with candidates as (
    select
      p.registration_name is null as missing_registration_name,
      case
        when p.registration_name is null then ''
        else pg_catalog.lower(
          pg_catalog."normalize"(p.registration_name, 'NFKC')
        )
      end as normalized_registration_name,
      p.user_id,
      pg_catalog.jsonb_build_object(
        'userId', p.user_id::text,
        'registrationName', p.registration_name,
        'membershipState', m.state::text,
        'effectiveRoles', case
          when m.state = 'active' then
            pg_catalog.jsonb_build_array('reader') || roles.active_roles
          else '[]'::jsonb
        end,
        'profileUpdatedAt', p.updated_at,
        'membershipUpdatedAt', m.updated_at
      ) as item
    from public.profiles p
    join public.memberships m on m.user_id = p.user_id
    cross join lateral (
      select coalesce(
        pg_catalog.jsonb_agg(rg.role::text order by rg.role),
        '[]'::jsonb
      ) as active_roles
      from public.role_grants rg
      where rg.user_id = p.user_id
        and rg.revoked_at is null
    ) roles
    where (
      v_query is null
      or (
        v_query_user_id is not null
        and p.user_id = v_query_user_id
      )
      or (
        v_query_user_id is null
        and p.registration_name is not null
        and pg_catalog.lower(
          pg_catalog."normalize"(p.registration_name, 'NFKC')
        ) = v_query
      )
    )
      and (
        p_cursor is null
        or (
          p.registration_name is null,
          case
            when p.registration_name is null then ''
            else pg_catalog.lower(
              pg_catalog."normalize"(p.registration_name, 'NFKC')
            )
          end,
          p.user_id
        ) > (
          v_cursor_missing,
          coalesce(v_cursor_name, ''),
          v_cursor_user_id
        )
      )
    order by
      p.registration_name is null asc,
      case
        when p.registration_name is null then ''
        else pg_catalog.lower(
          pg_catalog."normalize"(p.registration_name, 'NFKC')
        )
      end asc,
      p.user_id asc
    limit v_limit + 1
  )
  select
    coalesce(
      pg_catalog.jsonb_agg(
        candidates.item
        order by
          candidates.missing_registration_name,
          candidates.normalized_registration_name,
          candidates.user_id
      ),
      '[]'::jsonb
    ),
    pg_catalog.count(*) > v_limit
  into v_items, v_has_more
  from candidates;

  if v_has_more then
    v_items := v_items - v_limit;
    v_last_item := v_items -> (pg_catalog.jsonb_array_length(v_items) - 1);
    v_next_cursor := pg_catalog.jsonb_build_object(
      'missingRegistrationName', v_last_item -> 'registrationName' = 'null'::jsonb,
      'normalizedRegistrationName', case
        when v_last_item -> 'registrationName' = 'null'::jsonb then null
        else pg_catalog.lower(
          pg_catalog."normalize"(
            v_last_item ->> 'registrationName',
            'NFKC'
          )
        )
      end,
      'userId', v_last_item ->> 'userId'
    );
  else
    v_next_cursor := null;
  end if;

  return pg_catalog.jsonb_build_object(
    'items', v_items,
    'nextCursor', v_next_cursor,
    'hasMore', v_has_more
  );
end;
$$;

revoke all on function public.search_identity_access_subjects_v1(
  text,
  jsonb,
  integer
) from public, anon, authenticated, service_role;
grant execute on function public.search_identity_access_subjects_v1(
  text,
  jsonb,
  integer
) to authenticated;

create or replace function public.get_identity_access_subject_v1(
  p_user_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_result jsonb;
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

  if p_user_id is null then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=userId';
  end if;

  select pg_catalog.jsonb_build_object(
    'userId', p.user_id::text,
    'registrationName', p.registration_name,
    'profileCreatedAt', p.created_at,
    'profileUpdatedAt', p.updated_at,
    'membership', pg_catalog.jsonb_build_object(
      'state', m.state::text,
      'admittedAt', m.admitted_at,
      'suspendedAt', m.suspended_at,
      'revokedAt', m.revoked_at,
      'updatedAt', m.updated_at
    ),
    'activeRoleGrants', roles.active_role_grants,
    'effectiveRoles', case
      when m.state = 'active' then
        pg_catalog.jsonb_build_array('reader') || roles.active_roles
      else '[]'::jsonb
    end,
    'isElevatedAccount', roles.is_elevated_account,
    'isOnlyActiveSuperAdmin', (
      m.state = 'active'
      and roles.has_super_admin
      and (
        select pg_catalog.count(*)
        from public.role_grants active_super_admin_grant
        join public.memberships active_super_admin_membership
          on active_super_admin_membership.user_id = active_super_admin_grant.user_id
        where active_super_admin_grant.role = 'super_admin'
          and active_super_admin_grant.revoked_at is null
          and active_super_admin_membership.state = 'active'
      ) = 1
    ),
    'expectedState', pg_catalog.jsonb_build_object(
      'snapshot', private.identity_access_expected_state_snapshot(p.user_id),
      'token', private.identity_access_state_token(p.user_id)
    )
  )
  into v_result
  from public.profiles p
  join public.memberships m on m.user_id = p.user_id
  cross join lateral (
    select
      coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'grantId', rg.id::text,
            'role', rg.role::text,
            'grantedAt', rg.granted_at,
            'grantedBy', rg.granted_by::text
          )
          order by rg.role, rg.id
        ) filter (where rg.id is not null),
        '[]'::jsonb
      ) as active_role_grants,
      coalesce(
        pg_catalog.jsonb_agg(
          rg.role::text order by rg.role
        ) filter (where rg.id is not null),
        '[]'::jsonb
      ) as active_roles,
      coalesce(
        pg_catalog.bool_or(rg.role in ('admin', 'super_admin')),
        false
      ) as is_elevated_account,
      coalesce(
        pg_catalog.bool_or(rg.role = 'super_admin'),
        false
      ) as has_super_admin
    from public.role_grants rg
    where rg.user_id = p.user_id
      and rg.revoked_at is null
  ) roles
  where p.user_id = p_user_id;

  if v_result is null then
    raise exception using
      errcode = 'P0002',
      message = 'TARGET_NOT_FOUND';
  end if;

  return v_result;
end;
$$;

revoke all on function public.get_identity_access_subject_v1(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.get_identity_access_subject_v1(uuid)
  to authenticated;

create or replace function public.list_identity_access_audit_v1(
  p_user_id uuid,
  p_before jsonb default null,
  p_limit integer default 25
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_limit integer := p_limit;
  v_before_created_at timestamptz;
  v_before_audit_id bigint;
  v_items jsonb;
  v_has_more boolean;
  v_last_item jsonb;
  v_next_cursor jsonb;
begin
  if v_actor_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'AUTHENTICATION_REQUIRED';
  end if;

  if not (
    private.current_user_has_role('admin')
    or private.current_user_has_role('super_admin')
  ) then
    raise exception using
      errcode = '42501',
      message = 'FORBIDDEN';
  end if;

  if p_user_id is null then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=userId';
  end if;

  if v_limit is null or v_limit not between 1 and 50 then
    raise exception using
      errcode = '22023',
      message = 'INVALID_INPUT',
      detail = 'field=limit';
  end if;

  if p_before is not null then
    if pg_catalog.jsonb_typeof(p_before) <> 'object'
      or not (p_before ? 'createdAt')
      or not (p_before ? 'auditId')
      or p_before - array['createdAt', 'auditId']::text[] <> '{}'::jsonb
      or p_before ->> 'createdAt' is null
      or p_before ->> 'auditId' !~ '^[1-9][0-9]*$'
    then
      raise exception using
        errcode = '22023',
        message = 'INVALID_INPUT',
        detail = 'field=before';
    end if;

    begin
      v_before_created_at := (p_before ->> 'createdAt')::timestamptz;
      v_before_audit_id := (p_before ->> 'auditId')::bigint;
    exception
      when others then
        raise exception using
          errcode = '22023',
          message = 'INVALID_INPUT',
          detail = 'field=before';
    end;
  end if;

  perform 1
  from public.profiles target_profile
  where target_profile.user_id = p_user_id;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'TARGET_NOT_FOUND';
  end if;

  with candidates as (
    select
      audit.id,
      audit.created_at,
      pg_catalog.jsonb_build_object(
        'auditId', audit.id::text,
        'action', audit.action,
        'actor', case
          when audit.actor_user_id is null then null
          else pg_catalog.jsonb_build_object(
            'userId', audit.actor_user_id::text,
            'registrationName', actor_profile.registration_name
          )
        end,
        'targetRole', role_grant.role::text,
        'targetState', case
          when audit.action = 'membership.state_changed'
            then audit.metadata ->> 'to'
          else null
        end,
        'reason', audit.reason,
        'result', 'saved',
        'before', case
          when audit.action = 'membership.state_changed' then
            pg_catalog.jsonb_build_object(
              'membershipState', audit.metadata ->> 'from'
            )
          when audit.action = 'role.revoked' then
            pg_catalog.jsonb_build_object('role', role_grant.role::text)
          else null
        end,
        'after', case
          when audit.action = 'membership.state_changed' then
            pg_catalog.jsonb_build_object(
              'membershipState', audit.metadata ->> 'to'
            )
          when audit.action in ('role.granted', 'role.bootstrap_super_admin') then
            pg_catalog.jsonb_build_object('role', role_grant.role::text)
          else null
        end,
        'createdAt', audit.created_at
      ) as item
    from public.audit_logs audit
    left join public.role_grants role_grant
      on audit.target_type = 'role_grant'
      and role_grant.id = audit.target_id
    left join public.profiles actor_profile
      on actor_profile.user_id = audit.actor_user_id
    where (
      (
        audit.target_type = 'membership'
        and audit.target_id = p_user_id
        and audit.action = 'membership.state_changed'
      )
      or (
        audit.target_type = 'role_grant'
        and role_grant.user_id = p_user_id
        and audit.action in (
          'role.granted',
          'role.revoked',
          'role.bootstrap_super_admin'
        )
      )
    )
      and (
        p_before is null
        or (audit.created_at, audit.id) < (
          v_before_created_at,
          v_before_audit_id
        )
      )
    order by audit.created_at desc, audit.id desc
    limit v_limit + 1
  )
  select
    coalesce(
      pg_catalog.jsonb_agg(
        candidates.item
        order by candidates.created_at desc, candidates.id desc
      ),
      '[]'::jsonb
    ),
    pg_catalog.count(*) > v_limit
  into v_items, v_has_more
  from candidates;

  if v_has_more then
    v_items := v_items - v_limit;
    v_last_item := v_items -> (pg_catalog.jsonb_array_length(v_items) - 1);
    v_next_cursor := pg_catalog.jsonb_build_object(
      'createdAt', v_last_item ->> 'createdAt',
      'auditId', v_last_item ->> 'auditId'
    );
  else
    v_next_cursor := null;
  end if;

  return pg_catalog.jsonb_build_object(
    'items', v_items,
    'nextCursor', v_next_cursor,
    'hasMore', v_has_more
  );
end;
$$;

revoke all on function public.list_identity_access_audit_v1(
  uuid,
  jsonb,
  integer
) from public, anon, authenticated, service_role;
grant execute on function public.list_identity_access_audit_v1(
  uuid,
  jsonb,
  integer
) to authenticated;
