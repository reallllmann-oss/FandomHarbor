do $$
declare
  v_function regprocedure;
  v_role text;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'fandom-harbor:identity-access-governance',
      0
    )
  );

  if (
    select pg_catalog.count(*)
    from pg_catalog.pg_proc procedure
    join pg_catalog.pg_namespace namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname in (
        'grant_role',
        'revoke_role',
        'set_membership_state',
        'grant_author_role_v2',
        'revoke_author_role_v2',
        'set_ordinary_membership_state_v2'
      )
  ) <> 6 then
    raise exception 'IDENTITY_ACCESS_CUTOVER_SIGNATURE_DRIFT';
  end if;

  foreach v_function in array array[
    'public.grant_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.revoke_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.set_membership_state(uuid,public.membership_state,text)'::regprocedure
  ] loop
    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'IDENTITY_ACCESS_LEGACY_PRECONDITION_FAILED: %',
        v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'IDENTITY_ACCESS_LEGACY_PRECONDITION_FAILED: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  foreach v_function in array array[
    'public.grant_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.revoke_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.set_ordinary_membership_state_v2(uuid,uuid,public.membership_state,text,text)'::regprocedure
  ] loop
    if not (
      select procedure.prosecdef
        and procedure.provolatile = 'v'
        and procedure.proowner::regrole::text = 'postgres'
        and procedure.proconfig @> array['search_path=""']::text[]
      from pg_catalog.pg_proc procedure
      where procedure.oid = v_function
    ) then
      raise exception 'IDENTITY_ACCESS_V2_CATALOG_DRIFT: %', v_function;
    end if;

    foreach v_role in array array[
      'public',
      'anon',
      'authenticated',
      'service_role'
    ] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'IDENTITY_ACCESS_V2_PRECONDITION_FAILED: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  foreach v_function in array array[
    'private.normalize_identity_access_reason(text)'::regprocedure,
    'private.identity_access_reason_is_valid(text)'::regprocedure,
    'private.require_identity_access_reason(text)'::regprocedure,
    'private.identity_access_expected_state_snapshot(uuid)'::regprocedure,
    'private.identity_access_state_token(uuid)'::regprocedure,
    'private.identity_access_payload_fingerprint(text,uuid,text,text,text)'::regprocedure,
    'private.prevent_identity_access_ledger_mutation()'::regprocedure,
    'private.prevent_audit_log_mutation()'::regprocedure,
    'private.execute_identity_access_ordinary_mutation(text,uuid,uuid,text,text,text)'::regprocedure
  ] loop
    foreach v_role in array array[
      'public',
      'anon',
      'authenticated',
      'service_role'
    ] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'IDENTITY_ACCESS_PRIVATE_EXECUTE_DRIFT: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  revoke execute on function public.grant_role(
    uuid,
    public.elevated_role,
    text
  ) from public, anon, authenticated, service_role;
  revoke execute on function public.revoke_role(
    uuid,
    public.elevated_role,
    text
  ) from public, anon, authenticated, service_role;
  revoke execute on function public.set_membership_state(
    uuid,
    public.membership_state,
    text
  ) from public, anon, authenticated, service_role;

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
        raise exception 'IDENTITY_ACCESS_LEGACY_REVOKE_FAILED: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  grant execute on function public.grant_author_role_v2(
    uuid,
    uuid,
    text,
    text
  ) to authenticated;
  grant execute on function public.revoke_author_role_v2(
    uuid,
    uuid,
    text,
    text
  ) to authenticated;
  grant execute on function public.set_ordinary_membership_state_v2(
    uuid,
    uuid,
    public.membership_state,
    text,
    text
  ) to authenticated;

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
      raise exception 'IDENTITY_ACCESS_V2_GRANT_FAILED: %', v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'IDENTITY_ACCESS_V2_GRANT_BROADENED: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  foreach v_function in array array[
    'private.normalize_identity_access_reason(text)'::regprocedure,
    'private.identity_access_reason_is_valid(text)'::regprocedure,
    'private.require_identity_access_reason(text)'::regprocedure,
    'private.identity_access_expected_state_snapshot(uuid)'::regprocedure,
    'private.identity_access_state_token(uuid)'::regprocedure,
    'private.identity_access_payload_fingerprint(text,uuid,text,text,text)'::regprocedure,
    'private.prevent_identity_access_ledger_mutation()'::regprocedure,
    'private.prevent_audit_log_mutation()'::regprocedure,
    'private.execute_identity_access_ordinary_mutation(text,uuid,uuid,text,text,text)'::regprocedure
  ] loop
    foreach v_role in array array[
      'public',
      'anon',
      'authenticated',
      'service_role'
    ] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'IDENTITY_ACCESS_PRIVATE_EXECUTE_BROADENED: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;
end;
$$;
