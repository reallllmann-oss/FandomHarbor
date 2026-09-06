begin;

do $$
declare
  v_role text;
  v_function regprocedure;
begin
  if (
    select pg_catalog.count(*)
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'grant_author_role_v2',
        'revoke_author_role_v2',
        'set_ordinary_membership_state_v2'
      )
  ) <> 3 then
    raise exception 'P1-02C write RPC names are missing or overloaded';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'grant_author_role_v2'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) =
        'p_request_id uuid, p_target_user_id uuid, p_expected_state_token text, p_reason text'
  ) or not exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'revoke_author_role_v2'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) =
        'p_request_id uuid, p_target_user_id uuid, p_expected_state_token text, p_reason text'
  ) or not exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'set_ordinary_membership_state_v2'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) =
        'p_request_id uuid, p_target_user_id uuid, p_state membership_state, p_expected_state_token text, p_reason text'
  ) then
    raise exception 'P1-02C write RPC signature drift';
  end if;

  foreach v_function in array array[
    'public.grant_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.revoke_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.set_ordinary_membership_state_v2(uuid,uuid,public.membership_state,text,text)'::regprocedure
  ] loop
    if not (
      select p.prosecdef
        and p.provolatile = 'v'
        and p.proowner::regrole::text = 'postgres'
        and p.proconfig @> array['search_path=""']
      from pg_catalog.pg_proc p
      where p.oid = v_function
    ) then
      raise exception '% has unsafe authority/catalog properties', v_function;
    end if;

    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'authenticated cannot execute % after cutover', v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% unexpectedly has execute on %', v_role, v_function;
      end if;
    end loop;
  end loop;

  foreach v_role in array array[
    'public',
    'anon',
    'authenticated',
    'service_role'
  ] loop
    if pg_catalog.has_function_privilege(
      v_role,
      'private.execute_identity_access_ordinary_mutation(text,uuid,uuid,text,text,text)',
      'execute'
    ) or pg_catalog.has_function_privilege(
      v_role,
      'private.identity_access_expected_state_snapshot(uuid)',
      'execute'
    ) or pg_catalog.has_function_privilege(
      v_role,
      'private.identity_access_state_token(uuid)',
      'execute'
    ) or pg_catalog.has_function_privilege(
      v_role,
      'private.identity_access_payload_fingerprint(text,uuid,text,text,text)',
      'execute'
    ) then
      raise exception '% unexpectedly executes a private governance helper', v_role;
    end if;
  end loop;

  foreach v_function in array array[
    'public.grant_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.revoke_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.set_membership_state(uuid,public.membership_state,text)'::regprocedure
  ] loop
    foreach v_role in array array[
      'public',
      'anon',
      'authenticated',
      'service_role'
    ] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'cutover left legacy execute for % on %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  if not pg_catalog.has_function_privilege(
    'authenticated',
    'public.search_identity_access_subjects_v1(text,jsonb,integer)',
    'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated',
    'public.get_identity_access_subject_v1(uuid)',
    'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated',
    'public.list_identity_access_audit_v1(uuid,jsonb,integer)',
    'execute'
  ) then
    raise exception 'P1-02C changed the P1-02B read RPC execute state';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'grant_admin_role_v2',
        'revoke_admin_role_v2',
        'grant_super_admin_role_v2',
        'revoke_super_admin_role_v2',
        'set_elevated_membership_state_v2'
      )
  ) then
    raise exception 'P1-02C created an elevated mutation RPC';
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
) select
  user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'p1-02c-' || ordinality::text || '@example.test',
  '',
  statement_timestamp(),
  '{}'::jsonb,
  '{}'::jsonb,
  statement_timestamp(),
  statement_timestamp()
from pg_catalog.unnest(array[
  'c1020000-0000-4000-8000-000000000001'::uuid,
  'c1020000-0000-4000-8000-000000000002'::uuid,
  'c1020000-0000-4000-8000-000000000003'::uuid,
  'c1020000-0000-4000-8000-000000000004'::uuid,
  'c1020000-0000-4000-8000-000000000005'::uuid,
  'c1020000-0000-4000-8000-000000000006'::uuid,
  'c1020000-0000-4000-8000-000000000010'::uuid,
  'c1020000-0000-4000-8000-000000000011'::uuid,
  'c1020000-0000-4000-8000-000000000012'::uuid,
  'c1020000-0000-4000-8000-000000000013'::uuid,
  'c1020000-0000-4000-8000-000000000014'::uuid,
  'c1020000-0000-4000-8000-000000000015'::uuid,
  'c1020000-0000-4000-8000-000000000016'::uuid,
  'c1020000-0000-4000-8000-000000000017'::uuid
]) with ordinality fixture(user_id, ordinality);

insert into public.profiles (user_id)
select id
from auth.users
where id::text like 'c1020000-0000-4000-8000-0000000000%';

insert into public.memberships (user_id, state, admitted_at, suspended_at)
values
  ('c1020000-0000-4000-8000-000000000001', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000002', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000003', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000004', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000005', 'suspended', statement_timestamp(), statement_timestamp()),
  ('c1020000-0000-4000-8000-000000000006', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000010', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000011', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000012', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000013', 'suspended', statement_timestamp(), statement_timestamp()),
  ('c1020000-0000-4000-8000-000000000014', 'active', statement_timestamp(), null),
  ('c1020000-0000-4000-8000-000000000015', 'suspended', statement_timestamp(), statement_timestamp()),
  ('c1020000-0000-4000-8000-000000000016', 'pending', null, null),
  ('c1020000-0000-4000-8000-000000000017', 'active', statement_timestamp(), null);

insert into public.role_grants (
  id,
  user_id,
  role,
  granted_by,
  grant_reason,
  revoked_by,
  revoked_at,
  revoke_reason
)
values
  (
    'c2020000-0000-4000-8000-000000000001',
    'c1020000-0000-4000-8000-000000000001',
    'admin',
    null,
    'P1-02C active Admin fixture',
    null,
    null,
    null
  ),
  (
    'c2020000-0000-4000-8000-000000000002',
    'c1020000-0000-4000-8000-000000000002',
    'super_admin',
    null,
    'P1-02C active Super Admin fixture',
    null,
    null,
    null
  ),
  (
    'c2020000-0000-4000-8000-000000000004',
    'c1020000-0000-4000-8000-000000000004',
    'author',
    null,
    'P1-02C Author actor fixture',
    null,
    null,
    null
  ),
  (
    'c2020000-0000-4000-8000-000000000005',
    'c1020000-0000-4000-8000-000000000005',
    'admin',
    null,
    'P1-02C suspended Admin fixture',
    null,
    null,
    null
  ),
  (
    'c2020000-0000-4000-8000-000000000006',
    'c1020000-0000-4000-8000-000000000006',
    'admin',
    null,
    'P1-02C revoked Admin fixture',
    'c1020000-0000-4000-8000-000000000002',
    statement_timestamp(),
    'P1-02C revoked Admin fixture'
  ),
  (
    'c2020000-0000-4000-8000-000000000012',
    'c1020000-0000-4000-8000-000000000012',
    'author',
    'c1020000-0000-4000-8000-000000000001',
    'P1-02C revoke target fixture',
    null,
    null,
    null
  ),
  (
    'c2020000-0000-4000-8000-000000000014',
    'c1020000-0000-4000-8000-000000000014',
    'admin',
    'c1020000-0000-4000-8000-000000000002',
    'P1-02C elevated Admin target fixture',
    null,
    null,
    null
  ),
  (
    'c2020000-0000-4000-8000-000000000015',
    'c1020000-0000-4000-8000-000000000015',
    'super_admin',
    'c1020000-0000-4000-8000-000000000002',
    'P1-02C suspended elevated target fixture',
    null,
    null,
    null
  );

create temporary table p1_02c_original_tokens (
  target_user_id uuid primary key,
  state_token text not null
);

insert into p1_02c_original_tokens (target_user_id, state_token)
select target_user_id, private.identity_access_state_token(target_user_id)
from pg_catalog.unnest(array[
  'c1020000-0000-4000-8000-000000000010'::uuid,
  'c1020000-0000-4000-8000-000000000011'::uuid,
  'c1020000-0000-4000-8000-000000000012'::uuid
]) targets(target_user_id);

set local role anon;

do $$
begin
  begin
    perform public.grant_author_role_v2(
      'c3020000-0000-4000-8000-000000000001',
      'c1020000-0000-4000-8000-000000000011',
      repeat('0', 64),
      'Anonymous call must stay closed'
    );
    raise exception 'anon executed a P1-02C write RPC';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;

reset role;
set local role authenticated;
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'c1020000-0000-4000-8000-000000000001',
  true
);

do $$
declare
  v_result jsonb;
begin
  begin
    v_result := public.grant_author_role_v2(
      'c3020000-0000-4000-8000-000000000002',
      'c1020000-0000-4000-8000-000000000011',
      repeat('0', 64),
      'Active Admin authenticated execute proof'
    );

    if v_result ->> 'status' <> 'conflict' then
      raise exception 'authenticated v2 result drift: %', v_result;
    end if;

    raise exception 'P1_04A_AUTHENTICATED_EXECUTE_ROLLBACK';
  exception
    when raise_exception then
      if sqlerrm <> 'P1_04A_AUTHENTICATED_EXECUTE_ROLLBACK' then
        raise;
      end if;
  end;
end;
$$;

reset role;

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'c1020000-0000-4000-8000-000000000001',
  true
);

do $$
declare
  v_before_token text := (
    select state_token
    from p1_02c_original_tokens
    where target_user_id = 'c1020000-0000-4000-8000-000000000010'
  );
  v_current_token text;
  v_saved jsonb;
  v_replay jsonb;
  v_unchanged jsonb;
  v_unchanged_replay jsonb;
  v_conflict jsonb;
  v_conflict_replay jsonb;
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  v_saved := public.set_ordinary_membership_state_v2(
    'c3020000-0000-4000-8000-000000000101',
    'c1020000-0000-4000-8000-000000000010',
    'suspended',
    v_before_token,
    U&'  Cafe\0301 membership suspension  '
  );

  v_replay := public.set_ordinary_membership_state_v2(
    'c3020000-0000-4000-8000-000000000101',
    'c1020000-0000-4000-8000-000000000010',
    'suspended',
    v_before_token,
    'Café membership suspension'
  );

  v_current_token := private.identity_access_state_token(
    'c1020000-0000-4000-8000-000000000010'
  );
  v_unchanged := public.set_ordinary_membership_state_v2(
    'c3020000-0000-4000-8000-000000000102',
    'c1020000-0000-4000-8000-000000000010',
    'suspended',
    v_current_token,
    'Membership already suspended'
  );
  v_unchanged_replay := public.set_ordinary_membership_state_v2(
    'c3020000-0000-4000-8000-000000000102',
    'c1020000-0000-4000-8000-000000000010',
    'suspended',
    v_current_token,
    'Membership already suspended'
  );
  v_conflict := public.set_ordinary_membership_state_v2(
    'c3020000-0000-4000-8000-000000000103',
    'c1020000-0000-4000-8000-000000000010',
    'active',
    v_before_token,
    'Stale membership review'
  );
  v_conflict_replay := public.set_ordinary_membership_state_v2(
    'c3020000-0000-4000-8000-000000000103',
    'c1020000-0000-4000-8000-000000000010',
    'active',
    v_before_token,
    'Stale membership review'
  );

  if v_saved ->> 'status' <> 'saved'
    or v_saved ->> 'auditLogId' is null
    or v_saved ->> 'changedAt' is null
    or v_saved -> 'currentState' -> 'membership' ->> 'state' <> 'suspended'
    or v_replay is distinct from v_saved
    or v_unchanged ->> 'status' <> 'unchanged'
    or v_unchanged_replay is distinct from v_unchanged
    or v_unchanged ? 'auditLogId'
    or v_conflict ->> 'status' <> 'conflict'
    or v_conflict_replay is distinct from v_conflict
    or v_conflict ->> 'conflictReason' <> 'expected_state_mismatch'
    or v_conflict ? 'auditLogId'
  then
    raise exception 'Membership result contract drift: %, %, %',
      v_saved,
      v_unchanged,
      v_conflict;
  end if;

  if (
    select state from public.memberships
    where user_id = 'c1020000-0000-4000-8000-000000000010'
  ) <> 'suspended'
    or (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before + 1
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before + 3
    or not exists (
      select 1
      from public.audit_logs audit
      join private.identity_access_request_ledger ledger
        on ledger.audit_log_id = audit.id
      where ledger.request_id = 'c3020000-0000-4000-8000-000000000101'
        and ledger.result_status = 'saved'
        and audit.reason = 'Café membership suspension'
        and audit.metadata ->> 'requestId' = ledger.request_id::text
        and audit.metadata ->> 'from' = 'active'
        and audit.metadata ->> 'to' = 'suspended'
    )
  then
    raise exception 'Membership Saved/Unchanged/Conflict counts drift';
  end if;
end;
$$;

do $$
declare
  v_before_token text := (
    select state_token
    from p1_02c_original_tokens
    where target_user_id = 'c1020000-0000-4000-8000-000000000011'
  );
  v_current_token text;
  v_saved jsonb;
  v_replay jsonb;
  v_unchanged jsonb;
  v_conflict jsonb;
  v_inactive_conflict jsonb;
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  v_saved := public.grant_author_role_v2(
    'c3020000-0000-4000-8000-000000000201',
    'c1020000-0000-4000-8000-000000000011',
    v_before_token,
    'Grant ordinary Author access'
  );
  v_replay := public.grant_author_role_v2(
    'c3020000-0000-4000-8000-000000000201',
    'c1020000-0000-4000-8000-000000000011',
    v_before_token,
    'Grant ordinary Author access'
  );
  v_current_token := private.identity_access_state_token(
    'c1020000-0000-4000-8000-000000000011'
  );
  v_unchanged := public.grant_author_role_v2(
    'c3020000-0000-4000-8000-000000000202',
    'c1020000-0000-4000-8000-000000000011',
    v_current_token,
    'Author grant already active'
  );
  v_conflict := public.grant_author_role_v2(
    'c3020000-0000-4000-8000-000000000203',
    'c1020000-0000-4000-8000-000000000011',
    v_before_token,
    'Stale Author grant review'
  );
  v_inactive_conflict := public.grant_author_role_v2(
    'c3020000-0000-4000-8000-000000000204',
    'c1020000-0000-4000-8000-000000000013',
    private.identity_access_state_token(
      'c1020000-0000-4000-8000-000000000013'
    ),
    'Inactive target cannot receive Author'
  );

  if v_saved ->> 'status' <> 'saved'
    or v_saved ->> 'roleGrantId' is null
    or v_replay is distinct from v_saved
    or v_unchanged ->> 'status' <> 'unchanged'
    or v_conflict ->> 'conflictReason' <> 'expected_state_mismatch'
    or v_inactive_conflict ->> 'conflictReason' <>
      'target_membership_not_active'
  then
    raise exception 'Author grant result contract drift';
  end if;

  if (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before + 1
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before + 4
    or (
      select pg_catalog.count(*)
      from public.role_grants
      where user_id = 'c1020000-0000-4000-8000-000000000011'
        and role = 'author'
        and revoked_at is null
    ) <> 1
  then
    raise exception 'Author grant Audit/Ledger/business counts drift';
  end if;
end;
$$;

do $$
declare
  v_before_token text := (
    select state_token
    from p1_02c_original_tokens
    where target_user_id = 'c1020000-0000-4000-8000-000000000012'
  );
  v_current_token text;
  v_saved jsonb;
  v_replay jsonb;
  v_unchanged jsonb;
  v_conflict jsonb;
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  v_saved := public.revoke_author_role_v2(
    'c3020000-0000-4000-8000-000000000301',
    'c1020000-0000-4000-8000-000000000012',
    v_before_token,
    'Revoke ordinary Author access'
  );
  v_replay := public.revoke_author_role_v2(
    'c3020000-0000-4000-8000-000000000301',
    'c1020000-0000-4000-8000-000000000012',
    v_before_token,
    'Revoke ordinary Author access'
  );
  v_current_token := private.identity_access_state_token(
    'c1020000-0000-4000-8000-000000000012'
  );
  v_unchanged := public.revoke_author_role_v2(
    'c3020000-0000-4000-8000-000000000302',
    'c1020000-0000-4000-8000-000000000012',
    v_current_token,
    'Author grant already revoked'
  );
  v_conflict := public.revoke_author_role_v2(
    'c3020000-0000-4000-8000-000000000303',
    'c1020000-0000-4000-8000-000000000012',
    v_before_token,
    'Stale Author revoke review'
  );

  if v_saved ->> 'status' <> 'saved'
    or v_saved ->> 'roleGrantId' <>
      'c2020000-0000-4000-8000-000000000012'
    or v_replay is distinct from v_saved
    or v_unchanged ->> 'status' <> 'unchanged'
    or v_conflict ->> 'conflictReason' <> 'expected_state_mismatch'
  then
    raise exception 'Author revoke result contract drift';
  end if;

  if (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before + 1
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before + 3
    or not exists (
      select 1
      from public.role_grants
      where id = 'c2020000-0000-4000-8000-000000000012'
        and revoked_at is not null
        and revoked_by = 'c1020000-0000-4000-8000-000000000001'
    )
  then
    raise exception 'Author revoke Audit/Ledger/business counts drift';
  end if;
end;
$$;

do $$
declare
  v_detail text;
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  begin
    perform public.set_ordinary_membership_state_v2(
      'c3020000-0000-4000-8000-000000000101',
      'c1020000-0000-4000-8000-000000000010',
      'suspended',
      repeat('f', 64),
      'Different payload reuse'
    );
    raise exception 'different payload reused requestId';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if sqlerrm <> 'INVALID_INPUT' or v_detail <> 'REQUEST_ID_MISMATCH' then
      raise;
    end if;
  end;

  begin
    perform public.grant_author_role_v2(
      'c3020000-0000-4000-8000-000000000101',
      'c1020000-0000-4000-8000-000000000010',
      repeat('f', 64),
      'Cross operation request reuse'
    );
    raise exception 'requestId crossed operations';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'REQUEST_ID_MISMATCH' then
      raise;
    end if;
  end;

  begin
    perform public.set_ordinary_membership_state_v2(
      'c3020000-0000-4000-8000-000000000101',
      'c1020000-0000-4000-8000-000000000011',
      'suspended',
      repeat('f', 64),
      'Cross target request reuse'
    );
    raise exception 'requestId crossed targets';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'REQUEST_ID_MISMATCH' then
      raise;
    end if;
  end;

  perform pg_catalog.set_config(
    'request.jwt.claim.sub',
    'c1020000-0000-4000-8000-000000000002',
    true
  );
  begin
    perform public.set_ordinary_membership_state_v2(
      'c3020000-0000-4000-8000-000000000101',
      'c1020000-0000-4000-8000-000000000010',
      'suspended',
      repeat('f', 64),
      'Cross actor request reuse'
    );
    raise exception 'requestId crossed actors';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'REQUEST_ID_MISMATCH' then
      raise;
    end if;
  end;

  perform pg_catalog.set_config(
    'request.jwt.claim.sub',
    'c1020000-0000-4000-8000-000000000001',
    true
  );

  if (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before
  then
    raise exception 'requestId mismatch created Audit or Ledger state';
  end if;
end;
$$;

do $$
declare
  v_actor uuid;
  v_state text;
  v_message text;
begin
  foreach v_actor in array array[
    'c1020000-0000-4000-8000-000000000003'::uuid,
    'c1020000-0000-4000-8000-000000000004'::uuid,
    'c1020000-0000-4000-8000-000000000005'::uuid,
    'c1020000-0000-4000-8000-000000000006'::uuid
  ] loop
    perform pg_catalog.set_config(
      'request.jwt.claim.sub',
      v_actor::text,
      true
    );
    begin
      perform public.grant_author_role_v2(
        extensions.gen_random_uuid(),
        'c1020000-0000-4000-8000-000000000017',
        private.identity_access_state_token(
          'c1020000-0000-4000-8000-000000000017'
        ),
        'Unauthorized actor must be denied'
      );
    exception when others then
      v_state := sqlstate;
      v_message := sqlerrm;
    end;

    if v_state <> '42501' or v_message <> 'FORBIDDEN' then
      raise exception 'actor % did not fail closed: % %',
        v_actor,
        v_state,
        v_message;
    end if;
  end loop;

  perform pg_catalog.set_config(
    'request.jwt.claim.sub',
    'c1020000-0000-4000-8000-000000000001',
    true
  );
end;
$$;

do $$
declare
  v_target uuid;
  v_operation text;
  v_detail text;
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  foreach v_target in array array[
    'c1020000-0000-4000-8000-000000000001'::uuid,
    'c1020000-0000-4000-8000-000000000014'::uuid,
    'c1020000-0000-4000-8000-000000000015'::uuid
  ] loop
    foreach v_operation in array array[
      'grant_author_role',
      'revoke_author_role',
      'set_ordinary_membership_state'
    ] loop
      begin
        if v_operation = 'grant_author_role' then
          perform public.grant_author_role_v2(
            extensions.gen_random_uuid(),
            v_target,
            private.identity_access_state_token(v_target),
            'Elevated target grant denied'
          );
        elsif v_operation = 'revoke_author_role' then
          perform public.revoke_author_role_v2(
            extensions.gen_random_uuid(),
            v_target,
            private.identity_access_state_token(v_target),
            'Elevated target revoke denied'
          );
        else
          perform public.set_ordinary_membership_state_v2(
            extensions.gen_random_uuid(),
            v_target,
            case
              when v_target = 'c1020000-0000-4000-8000-000000000001'
                then 'suspended'
              else 'active'
            end::public.membership_state,
            private.identity_access_state_token(v_target),
            'Elevated target Membership denied'
          );
        end if;
        raise exception 'elevated target mutation succeeded';
      exception when insufficient_privilege then
        get stacked diagnostics v_detail = pg_exception_detail;
        if sqlerrm <> 'FORBIDDEN'
          or v_detail <> 'ELEVATED_MUTATION_DEFERRED'
        then
          raise;
        end if;
      end;
    end loop;
  end loop;

  if (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before
  then
    raise exception 'elevated denial wrote Audit or Ledger';
  end if;
end;
$$;

do $$
declare
  v_detail text;
  v_before_ledger bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  begin
    perform public.set_ordinary_membership_state_v2(
      '00000000-0000-0000-0000-000000000000',
      'c1020000-0000-4000-8000-000000000017',
      'active',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Nil request ID denied'
    );
    raise exception 'nil request ID succeeded';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'field=requestId' then
      raise;
    end if;
  end;

  begin
    perform public.set_ordinary_membership_state_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      'pending',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Pending desired state denied'
    );
    raise exception 'pending Membership desired state succeeded';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'field=desired_state' then
      raise;
    end if;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      repeat('0', 63),
      'Invalid state token denied'
    );
    raise exception 'invalid state token succeeded';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'field=request_contract' then
      raise;
    end if;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      repeat('a', 201)
    );
    raise exception '201-code-point reason succeeded';
  exception when invalid_parameter_value then
    null;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'control' || chr(1) || 'character'
    );
    raise exception 'control-character reason succeeded';
  exception when invalid_parameter_value then
    null;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'bad'
    );
    raise exception 'three-code-point reason succeeded';
  exception when invalid_parameter_value then
    get stacked diagnostics v_detail = pg_exception_detail;
    if v_detail <> 'field=reason' then
      raise;
    end if;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'line one' || chr(10) || 'line two'
    );
    raise exception 'newline reason succeeded';
  exception when invalid_parameter_value then
    null;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000099',
      repeat('0', 64),
      'Missing target denied'
    );
    raise exception 'missing target succeeded';
  exception when no_data_found then
    if sqlerrm <> 'TARGET_NOT_FOUND' then
      raise;
    end if;
  end;

  if (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  ) <> v_before_ledger then
    raise exception 'invalid input or missing target wrote a Ledger result';
  end if;
end;
$$;

do $$
begin
  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      'admin'::public.elevated_role,
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Injected Admin role parameter denied'
    );
    raise exception 'Admin role-parameter overload unexpectedly exists';
  exception when undefined_function then
    null;
  end;

  begin
    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      'super_admin'::public.elevated_role,
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Injected Super Admin role parameter denied'
    );
    raise exception 'Super Admin role-parameter overload unexpectedly exists';
  exception when undefined_function then
    null;
  end;
end;
$$;

do $$
begin
  begin
    update public.memberships
    set state = 'suspended',
        suspended_at = statement_timestamp(),
        updated_at = statement_timestamp()
    where user_id = 'c1020000-0000-4000-8000-000000000002';

    perform public.grant_author_role_v2(
      extensions.gen_random_uuid(),
      'c1020000-0000-4000-8000-000000000017',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Missing active Super Admin fails closed'
    );
    raise exception 'ordinary governance ran without an active Super Admin';
  exception when object_not_in_prerequisite_state then
    if sqlerrm <> 'IDENTITY_ACCESS_GOVERNANCE_UNAVAILABLE' then
      raise;
    end if;
  end;

  if (
    select state
    from public.memberships
    where user_id = 'c1020000-0000-4000-8000-000000000002'
  ) <> 'active' then
    raise exception 'final-Super-Admin failure did not roll back its probe';
  end if;
end;
$$;

create function pg_temp.p1_02c_fail_audit_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.metadata ->> 'requestId' =
    'c3020000-0000-4000-8000-000000000401'
  then
    raise exception 'P1_02C_FORCED_AUDIT_FAILURE';
  end if;
  return new;
end;
$$;

create trigger p1_02c_fail_audit_insert
before insert on public.audit_logs
for each row execute function pg_temp.p1_02c_fail_audit_insert();

do $$
declare
  v_state_before public.membership_state := (
    select state from public.memberships
    where user_id = 'c1020000-0000-4000-8000-000000000017'
  );
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  begin
    perform public.set_ordinary_membership_state_v2(
      'c3020000-0000-4000-8000-000000000401',
      'c1020000-0000-4000-8000-000000000017',
      'suspended',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Forced Audit failure rolls back'
    );
    raise exception 'forced Audit failure unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'P1_02C_FORCED_AUDIT_FAILURE' then
      raise;
    end if;
  end;

  if (
    select state from public.memberships
    where user_id = 'c1020000-0000-4000-8000-000000000017'
  ) <> v_state_before
    or (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before
  then
    raise exception 'Audit failure left partial business or ledger state';
  end if;
end;
$$;

drop trigger p1_02c_fail_audit_insert on public.audit_logs;

create function pg_temp.p1_02c_fail_ledger_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.request_id = 'c3020000-0000-4000-8000-000000000402' then
    raise exception 'P1_02C_FORCED_LEDGER_FAILURE';
  end if;
  return new;
end;
$$;

create trigger p1_02c_fail_ledger_insert
before insert on private.identity_access_request_ledger
for each row execute function pg_temp.p1_02c_fail_ledger_insert();

do $$
declare
  v_state_before public.membership_state := (
    select state from public.memberships
    where user_id = 'c1020000-0000-4000-8000-000000000017'
  );
  v_audit_before bigint := (
    select pg_catalog.count(*) from public.audit_logs
  );
  v_ledger_before bigint := (
    select pg_catalog.count(*) from private.identity_access_request_ledger
  );
begin
  begin
    perform public.set_ordinary_membership_state_v2(
      'c3020000-0000-4000-8000-000000000402',
      'c1020000-0000-4000-8000-000000000017',
      'suspended',
      private.identity_access_state_token(
        'c1020000-0000-4000-8000-000000000017'
      ),
      'Forced Ledger failure rolls back'
    );
    raise exception 'forced Ledger failure unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'P1_02C_FORCED_LEDGER_FAILURE' then
      raise;
    end if;
  end;

  if (
    select state from public.memberships
    where user_id = 'c1020000-0000-4000-8000-000000000017'
  ) <> v_state_before
    or (select pg_catalog.count(*) from public.audit_logs) <> v_audit_before
    or (
      select pg_catalog.count(*)
      from private.identity_access_request_ledger
    ) <> v_ledger_before
  then
    raise exception 'Ledger failure left partial business or Audit state';
  end if;
end;
$$;

drop trigger p1_02c_fail_ledger_insert
  on private.identity_access_request_ledger;

do $$
declare
  v_role text;
  v_function regprocedure;
begin
  foreach v_function in array array[
    'public.grant_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.revoke_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.set_ordinary_membership_state_v2(uuid,uuid,public.membership_state,text,text)'::regprocedure
  ] loop
    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'authenticated lost execute on % during tests', v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% gained execute on % during tests', v_role, v_function;
      end if;
    end loop;
  end loop;
end;
$$;

rollback;
