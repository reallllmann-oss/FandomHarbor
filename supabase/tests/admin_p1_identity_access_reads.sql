begin;

do $$
declare
  v_role text;
  v_function regprocedure;
  v_name text;
  v_expected_definer boolean;
begin
  if (
    select count(*)
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'search_identity_access_subjects_v1',
        'get_identity_access_subject_v1',
        'list_identity_access_audit_v1'
      )
  ) <> 3 then
    raise exception 'read RPC names are missing or overloaded';
  end if;

  for v_name, v_function, v_expected_definer in
    select * from (values
      (
        'search_identity_access_subjects_v1',
        'public.search_identity_access_subjects_v1(text,jsonb,integer)'::regprocedure,
        false
      ),
      (
        'get_identity_access_subject_v1',
        'public.get_identity_access_subject_v1(uuid)'::regprocedure,
        true
      ),
      (
        'list_identity_access_audit_v1',
        'public.list_identity_access_audit_v1(uuid,jsonb,integer)'::regprocedure,
        false
      )
    ) contracts(name, signature, expected_definer)
  loop
    if not exists (
      select 1
      from pg_catalog.pg_proc p
      where p.oid = v_function
        and p.prosecdef = v_expected_definer
        and p.provolatile = 's'
        and p.proowner::regrole::text = 'postgres'
        and p.proconfig @> array['search_path=""']::text[]
    ) then
      raise exception '% catalog contract is invalid', v_name;
    end if;

    if exists (
      select 1
      from pg_catalog.pg_proc p
      cross join lateral pg_catalog.aclexplode(
        coalesce(
          p.proacl,
          pg_catalog.acldefault('f', p.proowner)
        )
      ) acl
      where p.oid = v_function
        and acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    ) then
      raise exception 'PUBLIC unexpectedly has execute on %', v_name;
    end if;

    foreach v_role in array array['anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% unexpectedly executes %', v_role, v_name;
      end if;
    end loop;

    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'authenticated cannot execute %', v_name;
    end if;
  end loop;

  foreach v_function in array array[
    'private.identity_access_expected_state_snapshot(uuid)'::regprocedure,
    'private.identity_access_state_token(uuid)'::regprocedure
  ] loop
    foreach v_role in array array[
      'anon',
      'authenticated',
      'service_role'
    ] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% unexpectedly executes helper %', v_role, v_function;
      end if;
    end loop;
  end loop;

  if not pg_catalog.has_function_privilege(
    'authenticated',
    'public.grant_role(uuid,public.elevated_role,text)',
    'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated',
    'public.revoke_role(uuid,public.elevated_role,text)',
    'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated',
    'public.set_membership_state(uuid,public.membership_state,text)',
    'execute'
  ) then
    raise exception 'P1-02B changed the legacy RPC execute state';
  end if;
end;
$$;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  ('b1020000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-super@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-admin@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-reader@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-author@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-inactive@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-revoked@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-alpha@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-null@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-elevated@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'p1-02b-beta@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp());

insert into public.profiles (user_id, registration_name)
values
  ('b1020000-0000-4000-8000-000000000001', 'SuperReader'),
  ('b1020000-0000-4000-8000-000000000002', 'AdminReader'),
  ('b1020000-0000-4000-8000-000000000003', 'ReaderOnly'),
  ('b1020000-0000-4000-8000-000000000004', 'AuthorOnly'),
  ('b1020000-0000-4000-8000-000000000005', 'InactiveAdmin'),
  ('b1020000-0000-4000-8000-000000000006', 'RevokedAdmin'),
  ('b1020000-0000-4000-8000-000000000007', 'Alpha'),
  ('b1020000-0000-4000-8000-000000000008', null),
  ('b1020000-0000-4000-8000-000000000009', 'ElevatedTarget'),
  ('b1020000-0000-4000-8000-000000000010', 'Beta');

insert into public.memberships (
  user_id,
  state,
  admitted_at,
  suspended_at
) values
  ('b1020000-0000-4000-8000-000000000001', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000002', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000003', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000004', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000005', 'suspended', statement_timestamp(), statement_timestamp()),
  ('b1020000-0000-4000-8000-000000000006', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000007', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000008', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000009', 'active', statement_timestamp(), null),
  ('b1020000-0000-4000-8000-000000000010', 'active', statement_timestamp(), null);

insert into public.role_grants (
  id,
  user_id,
  role,
  granted_by,
  grant_reason,
  revoked_by,
  revoked_at,
  revoke_reason
) values
  ('b1020000-0000-4000-8000-000000000101', 'b1020000-0000-4000-8000-000000000001', 'super_admin', null, 'P1-02B fixture', null, null, null),
  ('b1020000-0000-4000-8000-000000000102', 'b1020000-0000-4000-8000-000000000002', 'admin', 'b1020000-0000-4000-8000-000000000001', 'P1-02B fixture', null, null, null),
  ('b1020000-0000-4000-8000-000000000103', 'b1020000-0000-4000-8000-000000000004', 'author', 'b1020000-0000-4000-8000-000000000002', 'P1-02B fixture', null, null, null),
  ('b1020000-0000-4000-8000-000000000104', 'b1020000-0000-4000-8000-000000000005', 'admin', 'b1020000-0000-4000-8000-000000000001', 'P1-02B fixture', null, null, null),
  ('b1020000-0000-4000-8000-000000000105', 'b1020000-0000-4000-8000-000000000006', 'admin', 'b1020000-0000-4000-8000-000000000001', 'P1-02B fixture', 'b1020000-0000-4000-8000-000000000001', statement_timestamp(), 'P1-02B revoked fixture'),
  ('b1020000-0000-4000-8000-000000000106', 'b1020000-0000-4000-8000-000000000007', 'author', 'b1020000-0000-4000-8000-000000000002', 'P1-02B active target role', null, null, null),
  ('b1020000-0000-4000-8000-000000000107', 'b1020000-0000-4000-8000-000000000007', 'author', 'b1020000-0000-4000-8000-000000000002', 'P1-02B revoked target role', 'b1020000-0000-4000-8000-000000000002', statement_timestamp() - interval '1 day', 'P1-02B target revoke'),
  ('b1020000-0000-4000-8000-000000000108', 'b1020000-0000-4000-8000-000000000009', 'admin', 'b1020000-0000-4000-8000-000000000001', 'P1-02B elevated read fixture', null, null, null);

insert into public.audit_logs (
  actor_user_id,
  action,
  target_type,
  target_id,
  reason,
  metadata,
  created_at
) values
  (
    'b1020000-0000-4000-8000-000000000002',
    'role.granted',
    'role_grant',
    'b1020000-0000-4000-8000-000000000106',
    'P1-02B target role grant',
    '{"user_id":"b1020000-0000-4000-8000-000000000007","role":"author","requestId":"must-not-leak","secretMarker":"must-not-leak"}'::jsonb,
    '2026-08-17 12:00:00+00'
  ),
  (
    'b1020000-0000-4000-8000-000000000002',
    'role.revoked',
    'role_grant',
    'b1020000-0000-4000-8000-000000000107',
    'P1-02B target role revoke',
    '{"user_id":"b1020000-0000-4000-8000-000000000007","role":"author","payload_fingerprint":"must-not-leak"}'::jsonb,
    '2026-08-17 12:00:00+00'
  ),
  (
    'b1020000-0000-4000-8000-000000000002',
    'membership.state_changed',
    'membership',
    'b1020000-0000-4000-8000-000000000007',
    'P1-02B target membership',
    '{"from":"suspended","to":"active","private-note":"must-not-leak"}'::jsonb,
    '2026-08-17 12:00:00+00'
  ),
  (
    'b1020000-0000-4000-8000-000000000002',
    'membership.state_changed',
    'membership',
    'b1020000-0000-4000-8000-000000000003',
    'P1-02B unrelated target',
    '{"from":"suspended","to":"active"}'::jsonb,
    '2026-08-17 12:00:00+00'
  );

create temporary table p1_02b_read_snapshot (
  value jsonb not null
) on commit drop;

insert into p1_02b_read_snapshot (value)
select pg_catalog.jsonb_build_object(
  'profiles', (
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) order by p.user_id)
    from public.profiles p
  ),
  'memberships', (
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(m) order by m.user_id)
    from public.memberships m
  ),
  'roleGrants', (
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(rg) order by rg.id)
    from public.role_grants rg
  ),
  'auditLogs', (
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) order by a.id)
    from public.audit_logs a
  ),
  'ledger', (
    select coalesce(
      pg_catalog.jsonb_agg(pg_catalog.to_jsonb(l) order by l.request_id),
      '[]'::jsonb
    )
    from private.identity_access_request_ledger l
  ),
  'siteCopyState', (
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.scope)
    from public.site_copy_state s
  ),
  'siteCopyRevisions', (
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(r) order by r.id)
    from public.site_copy_revisions r
  )
);

set local role anon;

do $$
declare
  v_existing_state text;
  v_existing_message text;
  v_missing_state text;
  v_missing_message text;
begin
  begin
    perform public.get_identity_access_subject_v1(
      'b1020000-0000-4000-8000-000000000007'
    );
  exception when others then
    v_existing_state := sqlstate;
    v_existing_message := sqlerrm;
  end;

  begin
    perform public.get_identity_access_subject_v1(
      'b1020000-0000-4000-8000-000000000099'
    );
  exception when others then
    v_missing_state := sqlstate;
    v_missing_message := sqlerrm;
  end;

  if v_existing_state <> '42501'
    or v_missing_state <> v_existing_state
    or v_missing_message <> v_existing_message
  then
    raise exception 'anon target existence errors are distinguishable';
  end if;

  begin
    perform public.search_identity_access_subjects_v1(null, null, 25);
    raise exception 'anon search unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform public.list_identity_access_audit_v1(
      'b1020000-0000-4000-8000-000000000007',
      null,
      25
    );
    raise exception 'anon Audit unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

reset role;
set local role authenticated;

do $$
declare
  v_actor uuid;
  v_existing_state text;
  v_existing_message text;
  v_missing_state text;
  v_missing_message text;
begin
  foreach v_actor in array array[
    'b1020000-0000-4000-8000-000000000003'::uuid,
    'b1020000-0000-4000-8000-000000000004'::uuid,
    'b1020000-0000-4000-8000-000000000005'::uuid,
    'b1020000-0000-4000-8000-000000000006'::uuid
  ] loop
    perform pg_catalog.set_config(
      'request.jwt.claim.sub',
      v_actor::text,
      true
    );

    begin
      perform public.get_identity_access_subject_v1(
        'b1020000-0000-4000-8000-000000000007'
      );
    exception when others then
      v_existing_state := sqlstate;
      v_existing_message := sqlerrm;
    end;

    begin
      perform public.get_identity_access_subject_v1(
        'b1020000-0000-4000-8000-000000000099'
      );
    exception when others then
      v_missing_state := sqlstate;
      v_missing_message := sqlerrm;
    end;

    if v_existing_state <> '42501'
      or v_existing_message <> 'FORBIDDEN'
      or v_missing_state <> v_existing_state
      or v_missing_message <> v_existing_message
    then
      raise exception 'unauthorized actor % leaks target existence', v_actor;
    end if;

    begin
      perform public.search_identity_access_subjects_v1(null, null, 25);
      raise exception 'unauthorized actor % searched directory', v_actor;
    exception
      when insufficient_privilege then
        if sqlerrm <> 'FORBIDDEN' then
          raise;
        end if;
    end;

    begin
      perform public.list_identity_access_audit_v1(
        'b1020000-0000-4000-8000-000000000007',
        null,
        25
      );
      raise exception 'unauthorized actor % read Audit', v_actor;
    exception
      when insufficient_privilege then
        if sqlerrm <> 'FORBIDDEN' then
          raise;
        end if;
    end;
  end loop;
end;
$$;

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'b1020000-0000-4000-8000-000000000002',
  true
);

do $$
declare
  v_result jsonb;
  v_cursor jsonb;
  v_item jsonb;
  v_seen text[] := array[]::text[];
  v_first_name text;
  v_last_name text;
begin
  loop
    v_result := public.search_identity_access_subjects_v1(
      null,
      v_cursor,
      3
    );

    for v_item in
      select value from pg_catalog.jsonb_array_elements(v_result -> 'items')
    loop
      if v_item ->> 'userId' = any(v_seen) then
        raise exception 'search pagination returned a duplicate';
      end if;
      v_seen := pg_catalog.array_append(v_seen, v_item ->> 'userId');
      v_first_name := coalesce(v_first_name, v_item ->> 'registrationName');
      v_last_name := v_item ->> 'registrationName';
    end loop;

    exit when not (v_result ->> 'hasMore')::boolean;
    v_cursor := v_result -> 'nextCursor';

    if v_cursor is null or v_cursor = 'null'::jsonb then
      raise exception 'search hasMore omitted its cursor';
    end if;
  end loop;

  if pg_catalog.cardinality(v_seen) <> 10
    or v_first_name <> 'AdminReader'
    or v_last_name is not null
  then
    raise exception 'search pagination order or completeness is invalid';
  end if;

  v_result := public.search_identity_access_subjects_v1(
    'ＡＬＰＨＡ',
    null,
    25
  );
  if pg_catalog.jsonb_array_length(v_result -> 'items') <> 1
    or v_result -> 'items' -> 0 ->> 'userId'
      <> 'b1020000-0000-4000-8000-000000000007'
  then
    raise exception 'NFKC/case registration-name search failed';
  end if;

  v_result := public.search_identity_access_subjects_v1(
    'b1020000-0000-4000-8000-000000000010',
    null,
    25
  );
  if pg_catalog.jsonb_array_length(v_result -> 'items') <> 1
    or v_result -> 'items' -> 0 ->> 'registrationName' <> 'Beta'
  then
    raise exception 'full UUID search failed';
  end if;

  foreach v_item in array array['0'::jsonb, '51'::jsonb] loop
    begin
      perform public.search_identity_access_subjects_v1(
        null,
        null,
        (v_item #>> '{}')::integer
      );
      raise exception 'invalid search limit unexpectedly succeeded';
    exception
      when invalid_parameter_value then
        if sqlerrm <> 'INVALID_INPUT' then
          raise;
        end if;
    end;
  end loop;

  begin
    perform public.search_identity_access_subjects_v1(
      null,
      '{"userId":"invalid"}'::jsonb,
      25
    );
    raise exception 'invalid search cursor unexpectedly succeeded';
  exception
    when invalid_parameter_value then
      if sqlerrm <> 'INVALID_INPUT' then
        raise;
      end if;
  end;
end;
$$;

do $$
declare
  v_result jsonb;
  v_elevated jsonb;
  v_inactive jsonb;
begin
  v_result := public.get_identity_access_subject_v1(
    'b1020000-0000-4000-8000-000000000007'
  );

  if v_result - array[
    'userId',
    'registrationName',
    'profileCreatedAt',
    'profileUpdatedAt',
    'membership',
    'activeRoleGrants',
    'effectiveRoles',
    'isElevatedAccount',
    'isOnlyActiveSuperAdmin',
    'expectedState'
  ]::text[] <> '{}'::jsonb
    or v_result ? 'email'
    or v_result ? 'phone'
    or v_result ? 'metadata'
    or v_result ? 'session'
    or v_result ? 'ledger'
  then
    raise exception 'detail returned fields outside the frozen projection';
  end if;

  if v_result -> 'membership' ->> 'state' <> 'active'
    or pg_catalog.jsonb_array_length(v_result -> 'activeRoleGrants') <> 1
    or v_result -> 'activeRoleGrants' -> 0 ->> 'role' <> 'author'
    or not (v_result -> 'effectiveRoles' ? 'reader')
    or not (v_result -> 'effectiveRoles' ? 'author')
    or (v_result ->> 'isElevatedAccount')::boolean
    or v_result -> 'expectedState' ->> 'token' !~ '^[0-9a-f]{64}$'
  then
    raise exception 'ordinary detail projection is invalid';
  end if;

  v_elevated := public.get_identity_access_subject_v1(
    'b1020000-0000-4000-8000-000000000009'
  );
  if not (v_elevated ->> 'isElevatedAccount')::boolean
    or v_elevated -> 'activeRoleGrants' -> 0 ->> 'role' <> 'admin'
    or v_elevated ? 'canMutateElevated'
  then
    raise exception 'elevated target was not returned as read-only detail';
  end if;

  v_inactive := public.get_identity_access_subject_v1(
    'b1020000-0000-4000-8000-000000000005'
  );
  if v_inactive -> 'membership' ->> 'state' <> 'suspended'
    or pg_catalog.jsonb_array_length(v_inactive -> 'activeRoleGrants') <> 1
    or pg_catalog.jsonb_array_length(v_inactive -> 'effectiveRoles') <> 0
    or not (v_inactive ->> 'isElevatedAccount')::boolean
  then
    raise exception 'inactive elevated detail semantics are invalid';
  end if;

  begin
    perform public.get_identity_access_subject_v1(
      'b1020000-0000-4000-8000-000000000099'
    );
    raise exception 'authorized missing detail unexpectedly succeeded';
  exception
    when no_data_found then
      if sqlerrm <> 'TARGET_NOT_FOUND' then
        raise;
      end if;
  end;
end;
$$;

do $$
declare
  v_result jsonb;
  v_cursor jsonb;
  v_item jsonb;
  v_seen text[] := array[]::text[];
begin
  loop
    v_result := public.list_identity_access_audit_v1(
      'b1020000-0000-4000-8000-000000000007',
      v_cursor,
      2
    );

    for v_item in
      select value from pg_catalog.jsonb_array_elements(v_result -> 'items')
    loop
      if v_item ->> 'auditId' = any(v_seen) then
        raise exception 'Audit pagination returned a duplicate';
      end if;
      v_seen := pg_catalog.array_append(v_seen, v_item ->> 'auditId');

      if v_item - array[
        'auditId',
        'action',
        'actor',
        'targetRole',
        'targetState',
        'reason',
        'result',
        'before',
        'after',
        'createdAt'
      ]::text[] <> '{}'::jsonb
        or v_item::text ~ '(metadata|requestId|payload_fingerprint|secretMarker|private-note|must-not-leak)'
        or v_item ->> 'result' <> 'saved'
      then
        raise exception 'Audit projection leaked internal data';
      end if;
    end loop;

    exit when not (v_result ->> 'hasMore')::boolean;
    v_cursor := v_result -> 'nextCursor';
  end loop;

  if pg_catalog.cardinality(v_seen) <> 3 then
    raise exception 'Audit target filter/pagination is incomplete';
  end if;

  begin
    perform public.list_identity_access_audit_v1(
      'b1020000-0000-4000-8000-000000000099',
      null,
      25
    );
    raise exception 'authorized missing Audit target unexpectedly succeeded';
  exception
    when no_data_found then
      if sqlerrm <> 'TARGET_NOT_FOUND' then
        raise;
      end if;
  end;
end;
$$;

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'b1020000-0000-4000-8000-000000000001',
  true
);

do $$
declare
  v_search jsonb;
  v_detail jsonb;
  v_audit jsonb;
begin
  v_search := public.search_identity_access_subjects_v1('Alpha', null, 25);
  v_detail := public.get_identity_access_subject_v1(
    'b1020000-0000-4000-8000-000000000007'
  );
  v_audit := public.list_identity_access_audit_v1(
    'b1020000-0000-4000-8000-000000000007',
    null,
    25
  );

  if pg_catalog.jsonb_array_length(v_search -> 'items') <> 1
    or v_detail ->> 'userId' <> 'b1020000-0000-4000-8000-000000000007'
    or pg_catalog.jsonb_array_length(v_audit -> 'items') <> 3
  then
    raise exception 'active Super Admin read matrix failed';
  end if;
end;
$$;

reset role;

do $$
declare
  v_result jsonb;
begin
  v_result := public.get_identity_access_subject_v1(
    'b1020000-0000-4000-8000-000000000007'
  );

  if v_result -> 'expectedState' ->> 'token'
    <> private.identity_access_state_token(
      'b1020000-0000-4000-8000-000000000007'
    )
    or v_result -> 'expectedState' -> 'snapshot'
      is distinct from private.identity_access_expected_state_snapshot(
        'b1020000-0000-4000-8000-000000000007'
      )
  then
    raise exception 'detail did not use the P1-02A expected-state helpers';
  end if;
end;
$$;

do $$
declare
  v_after jsonb;
  v_before jsonb;
begin
  select value into v_before from p1_02b_read_snapshot;

  select pg_catalog.jsonb_build_object(
    'profiles', (
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(p) order by p.user_id)
      from public.profiles p
    ),
    'memberships', (
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(m) order by m.user_id)
      from public.memberships m
    ),
    'roleGrants', (
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(rg) order by rg.id)
      from public.role_grants rg
    ),
    'auditLogs', (
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a) order by a.id)
      from public.audit_logs a
    ),
    'ledger', (
      select coalesce(
        pg_catalog.jsonb_agg(pg_catalog.to_jsonb(l) order by l.request_id),
        '[]'::jsonb
      )
      from private.identity_access_request_ledger l
    ),
    'siteCopyState', (
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(s) order by s.scope)
      from public.site_copy_state s
    ),
    'siteCopyRevisions', (
      select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(r) order by r.id)
      from public.site_copy_revisions r
    )
  ) into v_after;

  if v_after is distinct from v_before then
    raise exception 'read RPCs changed business, Audit, Ledger, or Site Copy data';
  end if;
end;
$$;

set local role authenticated;
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'b1020000-0000-4000-8000-000000000002',
  true
);

do $$
begin
  begin
    perform private.identity_access_expected_state_snapshot(
      'b1020000-0000-4000-8000-000000000007'
    );
    raise exception 'authenticated executed snapshot helper directly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform private.identity_access_state_token(
      'b1020000-0000-4000-8000-000000000007'
    );
    raise exception 'authenticated executed token helper directly';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

reset role;
rollback;
