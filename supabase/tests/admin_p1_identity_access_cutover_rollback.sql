\set ON_ERROR_STOP on

begin;

do $$
declare
  v_function regprocedure;
  v_role text;
begin
  foreach v_function in array array[
    'public.grant_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.revoke_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.set_membership_state(uuid,public.membership_state,text)'::regprocedure
  ] loop
    if pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'rollback rehearsal requires closed legacy RPCs: %',
        v_function;
    end if;
  end loop;

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
      raise exception 'rollback rehearsal requires open v2 RPCs: %', v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'rollback rehearsal found broad v2 execute: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;
end;
$$;

revoke execute on function public.grant_author_role_v2(
  uuid,
  uuid,
  text,
  text
) from authenticated;
revoke execute on function public.revoke_author_role_v2(
  uuid,
  uuid,
  text,
  text
) from authenticated;
revoke execute on function public.set_ordinary_membership_state_v2(
  uuid,
  uuid,
  public.membership_state,
  text,
  text
) from authenticated;

grant execute on function public.grant_role(
  uuid,
  public.elevated_role,
  text
) to authenticated;
grant execute on function public.revoke_role(
  uuid,
  public.elevated_role,
  text
) to authenticated;
grant execute on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) to authenticated;

do $$
declare
  v_function regprocedure;
begin
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
      raise exception 'pre-cutover recovery failed for %', v_function;
    end if;
  end loop;

  foreach v_function in array array[
    'public.grant_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.revoke_author_role_v2(uuid,uuid,text,text)'::regprocedure,
    'public.set_ordinary_membership_state_v2(uuid,uuid,public.membership_state,text,text)'::regprocedure
  ] loop
    if pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'pre-cutover recovery left v2 open for %', v_function;
    end if;
  end loop;

  begin
    revoke execute on function public.grant_role(
      uuid,
      public.elevated_role,
      text
    ) from authenticated;
    revoke execute on function public.revoke_role(
      uuid,
      public.elevated_role,
      text
    ) from authenticated;
    revoke execute on function public.set_membership_state(
      uuid,
      public.membership_state,
      text
    ) from authenticated;

    raise exception 'P1_04A_FORCED_CUTOVER_FAILURE';

    grant execute on function public.grant_author_role_v2(
      uuid,
      uuid,
      text,
      text
    ) to authenticated;
  exception
    when raise_exception then
      if sqlerrm <> 'P1_04A_FORCED_CUTOVER_FAILURE' then
        raise;
      end if;
  end;

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
      raise exception 'failed cutover left legacy RPC closed: %', v_function;
    end if;
  end loop;
end;
$$;

revoke execute on function public.grant_role(
  uuid,
  public.elevated_role,
  text
) from authenticated;
revoke execute on function public.revoke_role(
  uuid,
  public.elevated_role,
  text
) from authenticated;
revoke execute on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) from authenticated;

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

do $$
declare
  v_function regprocedure;
  v_role text;
begin
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
        raise exception 'rehearsed cutover left legacy execute: % %',
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
    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'rehearsed cutover did not open v2: %', v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'rehearsed cutover broadened v2 execute: % %',
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
        raise exception 'rehearsal exposed private function: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;
end;
$$;

rollback;
