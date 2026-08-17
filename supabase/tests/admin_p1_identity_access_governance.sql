begin;

do $$
declare
  v_role text;
  v_function text;
begin
  if not exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'private'
      and c.relname = 'identity_access_request_ledger'
      and c.relkind = 'r'
      and c.relrowsecurity
  ) then
    raise exception 'private request ledger is missing or RLS is disabled';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_policies p
    where p.schemaname = 'private'
      and p.tablename = 'identity_access_request_ledger'
  ) then
    raise exception 'private request ledger unexpectedly has an RLS policy';
  end if;

  foreach v_role in array array['anon', 'authenticated', 'service_role'] loop
    if pg_catalog.has_table_privilege(
      v_role,
      'private.identity_access_request_ledger',
      'select,insert,update,delete'
    ) then
      raise exception '% unexpectedly has a direct ledger privilege', v_role;
    end if;
  end loop;

  foreach v_function in array array[
    'private.normalize_identity_access_reason(text)',
    'private.identity_access_reason_is_valid(text)',
    'private.require_identity_access_reason(text)',
    'private.identity_access_expected_state_snapshot(uuid)',
    'private.identity_access_state_token(uuid)',
    'private.identity_access_payload_fingerprint(text,uuid,text,text,text)',
    'private.prevent_identity_access_ledger_mutation()',
    'private.prevent_audit_log_mutation()'
  ] loop
    foreach v_role in array array['anon', 'authenticated', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception '% unexpectedly has execute on %', v_role, v_function;
      end if;
    end loop;
  end loop;

  if exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'grant_author_role_v2',
        'revoke_author_role_v2',
        'set_ordinary_membership_state_v2'
      )
  ) then
    raise exception 'P1-02A unexpectedly created a public governance write RPC';
  end if;

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
    raise exception 'P1-02A changed the legacy RPC cutover state';
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
  (
    'a1020000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'p1-02a-actor@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    'a1020000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'p1-02a-target@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  );

insert into public.profiles (user_id)
values
  ('a1020000-0000-4000-8000-000000000001'),
  ('a1020000-0000-4000-8000-000000000002');

insert into public.memberships (user_id, state, admitted_at)
values
  (
    'a1020000-0000-4000-8000-000000000001',
    'active',
    statement_timestamp()
  ),
  (
    'a1020000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp()
  );

insert into public.role_grants (
  id,
  user_id,
  role,
  granted_by,
  grant_reason
) values (
  'a1020000-0000-4000-8000-000000000010',
  'a1020000-0000-4000-8000-000000000002',
  'author',
  'a1020000-0000-4000-8000-000000000001',
  'P1-02A expected-state fixture'
);

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'a1020000-0000-4000-8000-000000000001',
  true
);

do $$
declare
  v_snapshot jsonb;
  v_token text;
  v_fingerprint bytea;
  v_equivalent_fingerprint bytea;
begin
  v_snapshot := private.identity_access_expected_state_snapshot(
    'a1020000-0000-4000-8000-000000000002'
  );
  v_token := private.identity_access_state_token(
    'a1020000-0000-4000-8000-000000000002'
  );
  v_fingerprint := private.identity_access_payload_fingerprint(
    'grant_author_role',
    'a1020000-0000-4000-8000-000000000002',
    null,
    v_token,
    '  P1-02A fingerprint reason  '
  );
  v_equivalent_fingerprint := private.identity_access_payload_fingerprint(
    'grant_author_role',
    'a1020000-0000-4000-8000-000000000002',
    null,
    v_token,
    'P1-02A fingerprint reason'
  );

  if v_snapshot -> 'membership' ->> 'state' <> 'active'
    or pg_catalog.jsonb_array_length(v_snapshot -> 'activeRoleGrants') <> 1
    or v_snapshot -> 'activeRoleGrants' -> 0 ->> 'role' <> 'author'
  then
    raise exception 'expected-state snapshot does not match live facts';
  end if;

  if v_token !~ '^[0-9a-f]{64}$' then
    raise exception 'state token is not a SHA-256 hex value';
  end if;

  if pg_catalog.octet_length(v_fingerprint) <> 32
    or v_fingerprint is distinct from v_equivalent_fingerprint
  then
    raise exception 'payload fingerprint is not stable normalized SHA-256';
  end if;

  if private.identity_access_expected_state_snapshot(
    'a1020000-0000-4000-8000-000000000099'
  ) is not null then
    raise exception 'missing target produced an expected-state snapshot';
  end if;
end;
$$;

do $$
declare
  v_audit_log_id bigint;
  v_fingerprint bytea;
begin
  v_audit_log_id := private.write_audit(
    'a1020000-0000-4000-8000-000000000001',
    'role.granted',
    'role_grant',
    'a1020000-0000-4000-8000-000000000010',
    'P1-02A saved result fixture',
    '{}'::jsonb
  );
  v_fingerprint := private.identity_access_payload_fingerprint(
    'grant_author_role',
    'a1020000-0000-4000-8000-000000000002',
    null,
    private.identity_access_state_token(
      'a1020000-0000-4000-8000-000000000002'
    ),
    'P1-02A saved result fixture'
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
    'a1020000-0000-4000-8000-000000000101',
    'a1020000-0000-4000-8000-000000000001',
    'grant_author_role',
    'a1020000-0000-4000-8000-000000000002',
    v_fingerprint,
    'saved',
    pg_catalog.jsonb_build_object(
      'status', 'saved',
      'requestId', 'a1020000-0000-4000-8000-000000000101'
    ),
    v_audit_log_id
  );

  insert into private.identity_access_request_ledger (
    request_id,
    actor_user_id,
    operation,
    target_user_id,
    payload_fingerprint,
    result_status,
    result_snapshot
  ) values
    (
      'a1020000-0000-4000-8000-000000000102',
      'a1020000-0000-4000-8000-000000000001',
      'revoke_author_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('unchanged', 'sha256'),
      'unchanged',
      '{"status":"unchanged"}'::jsonb
    ),
    (
      'a1020000-0000-4000-8000-000000000103',
      'a1020000-0000-4000-8000-000000000001',
      'set_ordinary_membership_state',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('conflict', 'sha256'),
      'conflict',
      '{"status":"conflict"}'::jsonb
    );

  if (
    select count(*)
    from private.identity_access_request_ledger
  ) <> 3 then
    raise exception 'valid closed results were not recorded';
  end if;
end;
$$;

do $$
begin
  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      '00000000-0000-0000-0000-000000000000',
      'a1020000-0000-4000-8000-000000000001',
      'grant_author_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('nil request', 'sha256'),
      'unchanged',
      '{"status":"unchanged"}'::jsonb
    );
    raise exception 'nil request ID unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      'a1020000-0000-4000-8000-000000000104',
      'a1020000-0000-4000-8000-000000000001',
      'grant_admin_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('elevated operation', 'sha256'),
      'unchanged',
      '{"status":"unchanged"}'::jsonb
    );
    raise exception 'elevated operation unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      'a1020000-0000-4000-8000-000000000105',
      'a1020000-0000-4000-8000-000000000001',
      'grant_author_role',
      'a1020000-0000-4000-8000-000000000002',
      pg_catalog.decode(pg_catalog.repeat('ab', 31), 'hex'),
      'unchanged',
      '{"status":"unchanged"}'::jsonb
    );
    raise exception 'non-SHA-256 fingerprint length unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      'a1020000-0000-4000-8000-000000000106',
      'a1020000-0000-4000-8000-000000000001',
      'grant_author_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('invalid status', 'sha256'),
      'pending',
      '{"status":"pending"}'::jsonb
    );
    raise exception 'open result status unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      'a1020000-0000-4000-8000-000000000107',
      'a1020000-0000-4000-8000-000000000001',
      'grant_author_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('array result', 'sha256'),
      'unchanged',
      '[]'::jsonb
    );
    raise exception 'non-object result snapshot unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      'a1020000-0000-4000-8000-000000000108',
      'a1020000-0000-4000-8000-000000000001',
      'grant_author_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('status mismatch', 'sha256'),
      'unchanged',
      '{"status":"conflict"}'::jsonb
    );
    raise exception 'result/status mismatch unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) values (
      'a1020000-0000-4000-8000-000000000109',
      'a1020000-0000-4000-8000-000000000001',
      'grant_author_role',
      'a1020000-0000-4000-8000-000000000002',
      extensions.digest('saved without audit', 'sha256'),
      'saved',
      '{"status":"saved"}'::jsonb
    );
    raise exception 'Saved without Audit unexpectedly succeeded';
  exception
    when check_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot,
      audit_log_id
    ) select
      'a1020000-0000-4000-8000-000000000110',
      actor_user_id,
      'revoke_author_role',
      target_user_id,
      extensions.digest('reused audit', 'sha256'),
      'saved',
      '{"status":"saved"}'::jsonb,
      audit_log_id
    from private.identity_access_request_ledger
    where request_id = 'a1020000-0000-4000-8000-000000000101';
    raise exception 'Saved Audit reuse unexpectedly succeeded';
  exception
    when unique_violation then
      null;
  end;

  begin
    insert into private.identity_access_request_ledger (
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      payload_fingerprint,
      result_status,
      result_snapshot
    ) select
      request_id,
      actor_user_id,
      operation,
      target_user_id,
      extensions.digest('duplicate request', 'sha256'),
      result_status,
      result_snapshot
    from private.identity_access_request_ledger
    where request_id = 'a1020000-0000-4000-8000-000000000102';
    raise exception 'duplicate request ID unexpectedly succeeded';
  exception
    when unique_violation then
      null;
  end;
end;
$$;

do $$
begin
  begin
    update private.identity_access_request_ledger
    set result_snapshot = '{"status":"unchanged","changed":true}'::jsonb
    where request_id = 'a1020000-0000-4000-8000-000000000102';
    raise exception 'ledger update unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'IDENTITY_ACCESS_REQUEST_LEDGER_IMMUTABLE' then
        raise exception 'ledger update returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    delete from private.identity_access_request_ledger
    where request_id = 'a1020000-0000-4000-8000-000000000103';
    raise exception 'ledger delete unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'IDENTITY_ACCESS_REQUEST_LEDGER_IMMUTABLE' then
        raise exception 'ledger delete returned unstable error: %', sqlerrm;
      end if;
  end;
end;
$$;

do $$
declare
  v_audit_log_id bigint;
  v_site_copy_audit_log_id bigint;
begin
  v_audit_log_id := private.write_audit(
    'a1020000-0000-4000-8000-000000000001',
    'membership.state_changed',
    'membership',
    'a1020000-0000-4000-8000-000000000002',
    'P1-02A Audit immutability test',
    '{}'::jsonb
  );
  v_site_copy_audit_log_id := private.write_audit(
    null,
    'site_copy.updated',
    'site_copy_revision',
    'a1020000-0000-4000-8000-000000000020',
    'P1-02A legacy Audit error test',
    '{}'::jsonb
  );

  if not exists (
    select 1 from public.audit_logs where id = v_audit_log_id
  ) then
    raise exception 'normal Audit insert failed';
  end if;

  begin
    update public.audit_logs
    set reason = 'Mutation must fail'
    where id = v_audit_log_id;
    raise exception 'Audit update unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'AUDIT_LOG_IMMUTABLE' then
        raise exception 'Audit update returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    delete from public.audit_logs
    where id = v_audit_log_id;
    raise exception 'Audit delete unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'AUDIT_LOG_IMMUTABLE' then
        raise exception 'Audit delete returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    update public.audit_logs
    set reason = 'Mutation must fail'
    where id = v_site_copy_audit_log_id;
    raise exception 'Site Copy Audit update unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_AUDIT_IMMUTABLE' then
        raise exception 'Site Copy Audit error contract changed: %', sqlerrm;
      end if;
  end;
end;
$$;

set local role authenticated;
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  'a1020000-0000-4000-8000-000000000001',
  true
);

do $$
begin
  begin
    perform count(*) from private.identity_access_request_ledger;
    raise exception 'authenticated read the private ledger';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform private.identity_access_state_token(
      'a1020000-0000-4000-8000-000000000002'
    );
    raise exception 'authenticated executed a private helper';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;

set local role anon;

do $$
begin
  begin
    perform count(*) from private.identity_access_request_ledger;
    raise exception 'anon read the private ledger';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform private.identity_access_state_token(
      'a1020000-0000-4000-8000-000000000002'
    );
    raise exception 'anon executed a private helper';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;

rollback;
