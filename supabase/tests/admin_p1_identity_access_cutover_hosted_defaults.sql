\set ON_ERROR_STOP on

begin;

-- PostgreSQL grants EXECUTE to PUBLIC by default. Prove that an effective anon
-- privilege can therefore exist without a direct anon aclitem.
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

grant execute on function public.grant_role(
  uuid,
  public.elevated_role,
  text
) to public;
grant execute on function public.revoke_role(
  uuid,
  public.elevated_role,
  text
) to public;
grant execute on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) to public;

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
      'public',
      v_function,
      'execute'
    ) then
      raise exception 'PUBLIC inheritance fixture lacks PUBLIC execute: %',
        v_function;
    end if;

    if not pg_catalog.has_function_privilege('anon', v_function, 'execute') then
      raise exception 'PUBLIC inheritance fixture did not grant effective anon execute: %',
        v_function;
    end if;

    if not exists (
      select 1
      from pg_catalog.pg_proc procedure
      cross join lateral pg_catalog.aclexplode(
        coalesce(
          procedure.proacl,
          pg_catalog.acldefault('f', procedure.proowner)
        )
      ) acl
      where procedure.oid = v_function
        and acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    ) then
      raise exception 'PUBLIC inheritance fixture lacks direct PUBLIC execute: %',
        v_function;
    end if;

    if exists (
      select 1
      from pg_catalog.pg_proc procedure
      cross join lateral pg_catalog.aclexplode(
        coalesce(
          procedure.proacl,
          pg_catalog.acldefault('f', procedure.proowner)
        )
      ) acl
      where procedure.oid = v_function
        and acl.grantee = 'anon'::regrole::oid
        and acl.privilege_type = 'EXECUTE'
    ) then
      raise exception 'PUBLIC inheritance fixture unexpectedly created direct anon execute: %',
        v_function;
    end if;
  end loop;
end;
$$;

-- Hosted Supabase additionally grants new public functions directly to its
-- application roles. Model the state left after the owning migration revoked
-- PUBLIC but did not revoke those direct grants.
revoke execute on function public.grant_role(
  uuid,
  public.elevated_role,
  text
) from public;
revoke execute on function public.revoke_role(
  uuid,
  public.elevated_role,
  text
) from public;
revoke execute on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) from public;

grant execute on function public.grant_role(
  uuid,
  public.elevated_role,
  text
) to anon, authenticated, service_role;
grant execute on function public.revoke_role(
  uuid,
  public.elevated_role,
  text
) to anon, authenticated, service_role;
grant execute on function public.set_membership_state(
  uuid,
  public.membership_state,
  text
) to anon, authenticated, service_role;

do $$
declare
  v_function regprocedure;
begin
  foreach v_function in array array[
    'public.grant_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.revoke_role(uuid,public.elevated_role,text)'::regprocedure,
    'public.set_membership_state(uuid,public.membership_state,text)'::regprocedure
  ] loop
    if pg_catalog.has_function_privilege('public', v_function, 'execute') then
      raise exception 'hosted-default fixture retained PUBLIC execute: %',
        v_function;
    end if;

    if not pg_catalog.has_function_privilege('anon', v_function, 'execute') then
      raise exception 'hosted-default fixture lacks effective anon execute: %',
        v_function;
    end if;

    if not exists (
      select 1
      from pg_catalog.pg_proc procedure
      cross join lateral pg_catalog.aclexplode(
        coalesce(
          procedure.proacl,
          pg_catalog.acldefault('f', procedure.proowner)
        )
      ) acl
      where procedure.oid = v_function
        and acl.grantee = 'anon'::regrole::oid
        and acl.privilege_type = 'EXECUTE'
    ) then
      raise exception 'hosted-default fixture lacks direct anon execute: %',
        v_function;
    end if;
  end loop;
end;
$$;

-- Reconstruct the v2 pre-cutover contract before replaying the real Migration D.
revoke execute on function public.grant_author_role_v2(
  uuid,
  uuid,
  text,
  text
) from public, anon, authenticated, service_role;
revoke execute on function public.revoke_author_role_v2(
  uuid,
  uuid,
  text,
  text
) from public, anon, authenticated, service_role;
revoke execute on function public.set_ordinary_membership_state_v2(
  uuid,
  uuid,
  public.membership_state,
  text,
  text
) from public, anon, authenticated, service_role;

\ir ../migrations/20260819225318_admin_p1_identity_access_cutover.sql

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
        raise exception 'hosted-default cutover left legacy execute: % %',
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
      raise exception 'hosted-default cutover did not open v2 execute: %',
        v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'hosted-default cutover broadened v2 execute: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;

  foreach v_function in array array[
    'public.search_identity_access_subjects_v1(text,jsonb,integer)'::regprocedure,
    'public.get_identity_access_subject_v1(uuid)'::regprocedure,
    'public.list_identity_access_audit_v1(uuid,jsonb,integer)'::regprocedure
  ] loop
    if not pg_catalog.has_function_privilege(
      'authenticated',
      v_function,
      'execute'
    ) then
      raise exception 'hosted-default cutover changed authenticated read execute: %',
        v_function;
    end if;

    foreach v_role in array array['public', 'anon', 'service_role'] loop
      if pg_catalog.has_function_privilege(v_role, v_function, 'execute') then
        raise exception 'hosted-default cutover broadened read execute: % %',
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
        raise exception 'hosted-default cutover exposed private function: % %',
          v_role,
          v_function;
      end if;
    end loop;
  end loop;
end;
$$;

rollback;
