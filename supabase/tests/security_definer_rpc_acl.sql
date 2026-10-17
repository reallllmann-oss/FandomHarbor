begin;

do $$
declare
  v_function regprocedure;
begin
  if exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    cross join lateral pg_catalog.aclexplode(
      coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
    ) acl
    where n.nspname = 'public'
      and p.proname in (
        'browse_public_works',
        'create_invitation',
        'follow_author',
        'get_admin_site_copy',
        'get_my_invitation_relationships',
        'get_public_author_profile',
        'get_public_site_copy',
        'get_published_work_authors',
        'redeem_invitation',
        'registration_invitation_status',
        'revoke_invitation',
        'save_site_copy',
        'search_public_catalog',
        'unfollow_author',
        'validate_registration_invitation'
      )
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'a reviewed SECURITY DEFINER RPC still grants EXECUTE to PUBLIC';
  end if;

  foreach v_function in array array[
    'public.browse_public_works(integer,integer,text)'::regprocedure,
    'public.get_public_author_profile(text)'::regprocedure,
    'public.get_public_site_copy()'::regprocedure,
    'public.get_published_work_authors(text[])'::regprocedure,
    'public.registration_invitation_status(text)'::regprocedure,
    'public.search_public_catalog(text,integer)'::regprocedure,
    'public.validate_registration_invitation(text)'::regprocedure
  ] loop
    if not pg_catalog.has_function_privilege('anon', v_function, 'execute')
      or not pg_catalog.has_function_privilege('authenticated', v_function, 'execute') then
      raise exception '% lost an intentional public execute grant', v_function;
    end if;
  end loop;

  foreach v_function in array array[
    'public.create_invitation(text,integer,timestamp with time zone)'::regprocedure,
    'public.redeem_invitation(text)'::regprocedure,
    'public.revoke_invitation(uuid,text)'::regprocedure,
    'public.follow_author(uuid)'::regprocedure,
    'public.unfollow_author(uuid)'::regprocedure,
    'public.get_my_invitation_relationships()'::regprocedure,
    'public.get_admin_site_copy()'::regprocedure,
    'public.save_site_copy(bigint,uuid,uuid,text,text,text,text,text,text,text,text,text)'::regprocedure
  ] loop
    if pg_catalog.has_function_privilege('anon', v_function, 'execute')
      or not pg_catalog.has_function_privilege('authenticated', v_function, 'execute') then
      raise exception '% does not have the authenticated-workflow ACL', v_function;
    end if;
  end loop;

  foreach v_function in array array[
    'public.prepare_email_registration(text,text,text,uuid,text)'::regprocedure,
    'public.registration_context_by_proof(text)'::regprocedure,
    'public.registration_resume_context(text,text,text,text)'::regprocedure,
    'public.resolve_login_name_user_id(text)'::regprocedure,
    'public.consume_auth_rate_limit(text,text,integer,integer)'::regprocedure
  ] loop
    if pg_catalog.has_function_privilege('anon', v_function, 'execute')
      or pg_catalog.has_function_privilege('authenticated', v_function, 'execute')
      or not pg_catalog.has_function_privilege('service_role', v_function, 'execute') then
      raise exception '% lost the B1/B2 server-only ACL', v_function;
    end if;
  end loop;

  if exists (
    select 1
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'private')
      and p.prosecdef
      and not coalesce(p.proconfig, array[]::text[]) @> array['search_path=""']
  ) then
    raise exception 'a SECURITY DEFINER function is missing an empty search_path';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'private')
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
  ) then
    raise exception 'a public or private application table lost RLS';
  end if;
end;
$$;

set local role anon;

do $$
begin
  if public.registration_invitation_status(repeat('0', 64)) <> 'invalid'
    or public.validate_registration_invitation(repeat('0', 64)) then
    raise exception 'anonymous invitation preflight changed behavior';
  end if;

  perform public.browse_public_works(1, 0, 'newest');
  perform public.search_public_catalog('', 1);
  perform public.get_public_site_copy();
  perform public.get_public_author_profile('missing-author');
  perform public.get_published_work_authors(array[]::text[]);
end;
$$;

rollback;
