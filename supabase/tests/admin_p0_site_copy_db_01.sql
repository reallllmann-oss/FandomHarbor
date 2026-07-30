begin;

do $$
declare
  v_editable_columns text[] := array[
    'homepage_title',
    'homepage_introduction',
    'homepage_primary_cta_label',
    'homepage_secondary_cta_label',
    'navigation_archive_label',
    'navigation_search_label',
    'navigation_studio_label',
    'footer_brand_note'
  ];
  v_table text;
  v_function regprocedure;
begin
  foreach v_table in array array[
    'site_copy_revisions',
    'site_copy_state'
  ] loop
    if not exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = v_table
        and c.relrowsecurity
    ) then
      raise exception 'RLS is not enabled for public.%', v_table;
    end if;

    if pg_catalog.has_table_privilege('anon', 'public.' || v_table, 'select')
      or pg_catalog.has_table_privilege(
        'authenticated', 'public.' || v_table, 'select'
      )
      or pg_catalog.has_table_privilege(
        'authenticated', 'public.' || v_table, 'insert'
      )
      or pg_catalog.has_table_privilege(
        'authenticated', 'public.' || v_table, 'update'
      )
      or pg_catalog.has_table_privilege(
        'authenticated', 'public.' || v_table, 'delete'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'select'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'insert'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'update'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'delete'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'truncate'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'references'
      )
      or pg_catalog.has_table_privilege(
        'service_role', 'public.' || v_table, 'trigger'
      )
    then
      raise exception 'application role has a direct privilege on public.%', v_table;
    end if;
  end loop;

  if (
    select pg_catalog.array_agg(c.column_name::text order by c.column_name)
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'site_copy_revisions'
      and c.column_name = any(v_editable_columns)
  ) is distinct from (
    select pg_catalog.array_agg(value order by value)
    from pg_catalog.unnest(v_editable_columns) as value
  ) then
    raise exception 'the frozen eight-field storage contract is incomplete';
  end if;

  if exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name in ('site_copy_revisions', 'site_copy_state')
      and (
        c.data_type = 'jsonb'
        or c.column_name ~ '(path|route|href|order|position|visible|capability|legal)'
      )
  ) then
    raise exception 'a forbidden dynamic/navigation field entered site copy storage';
  end if;

  if not pg_catalog.has_function_privilege(
    'anon', 'public.get_public_site_copy()', 'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated', 'public.get_public_site_copy()', 'execute'
  ) then
    raise exception 'public projection execute grants are incomplete';
  end if;

  if pg_catalog.has_function_privilege(
    'anon', 'public.get_admin_site_copy()', 'execute'
  ) or pg_catalog.has_function_privilege(
    'anon',
    'public.save_site_copy(bigint,uuid,uuid,text,text,text,text,text,text,text,text,text)',
    'execute'
  ) then
    raise exception 'anon can execute an Admin site copy RPC';
  end if;

  if not pg_catalog.has_function_privilege(
    'authenticated', 'public.get_admin_site_copy()', 'execute'
  ) or not pg_catalog.has_function_privilege(
    'authenticated',
    'public.save_site_copy(bigint,uuid,uuid,text,text,text,text,text,text,text,text,text)',
    'execute'
  ) then
    raise exception 'authenticated is missing an Admin RPC execute grant';
  end if;

  foreach v_function in array array[
    'public.get_public_site_copy()'::regprocedure,
    'public.get_admin_site_copy()'::regprocedure,
    'public.save_site_copy(bigint,uuid,uuid,text,text,text,text,text,text,text,text,text)'::regprocedure
  ] loop
    if not (
      select p.prosecdef
        and coalesce(p.proconfig, array[]::text[]) @> array['search_path=""']
      from pg_catalog.pg_proc p
      where p.oid = v_function
    ) then
      raise exception '% is not SECURITY DEFINER with an empty search_path', v_function;
    end if;
  end loop;

  if (
    select count(*) from public.get_public_site_copy()
  ) <> 0 then
    raise exception 'DB-01 unexpectedly initialized public site copy';
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
    '81000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'db01-super-admin@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '81000000-0000-4000-8000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'db01-admin@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '81000000-0000-4000-8000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'db01-author@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '81000000-0000-4000-8000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'db01-reader@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '81000000-0000-4000-8000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'db01-suspended-admin@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '81000000-0000-4000-8000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'db01-revoked-admin@example.test',
    '',
    statement_timestamp(),
    '{}'::jsonb,
    '{}'::jsonb,
    statement_timestamp(),
    statement_timestamp()
  );

insert into public.profiles (user_id)
select id
from auth.users
where id between
  '81000000-0000-4000-8000-000000000001'::uuid
  and '81000000-0000-4000-8000-000000000006'::uuid;

insert into public.memberships (
  user_id,
  state,
  admitted_at,
  suspended_at
) values
  (
    '81000000-0000-4000-8000-000000000001',
    'active',
    statement_timestamp(),
    null
  ),
  (
    '81000000-0000-4000-8000-000000000002',
    'active',
    statement_timestamp(),
    null
  ),
  (
    '81000000-0000-4000-8000-000000000003',
    'active',
    statement_timestamp(),
    null
  ),
  (
    '81000000-0000-4000-8000-000000000004',
    'active',
    statement_timestamp(),
    null
  ),
  (
    '81000000-0000-4000-8000-000000000005',
    'suspended',
    statement_timestamp(),
    statement_timestamp()
  ),
  (
    '81000000-0000-4000-8000-000000000006',
    'active',
    statement_timestamp(),
    null
  );

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
  (
    '82000000-0000-4000-8000-000000000001',
    '81000000-0000-4000-8000-000000000001',
    'super_admin',
    null,
    'DB-01 test fixture',
    null,
    null,
    null
  ),
  (
    '82000000-0000-4000-8000-000000000002',
    '81000000-0000-4000-8000-000000000002',
    'admin',
    '81000000-0000-4000-8000-000000000001',
    'DB-01 test fixture',
    null,
    null,
    null
  ),
  (
    '82000000-0000-4000-8000-000000000003',
    '81000000-0000-4000-8000-000000000003',
    'author',
    '81000000-0000-4000-8000-000000000001',
    'DB-01 test fixture',
    null,
    null,
    null
  ),
  (
    '82000000-0000-4000-8000-000000000005',
    '81000000-0000-4000-8000-000000000005',
    'admin',
    '81000000-0000-4000-8000-000000000001',
    'DB-01 test fixture',
    null,
    null,
    null
  ),
  (
    '82000000-0000-4000-8000-000000000006',
    '81000000-0000-4000-8000-000000000006',
    'admin',
    '81000000-0000-4000-8000-000000000001',
    'DB-01 test fixture',
    '81000000-0000-4000-8000-000000000001',
    statement_timestamp(),
    'DB-01 revoked Admin fixture'
  );

do $$
declare
  v_audit_log_id bigint;
begin
  v_audit_log_id := private.write_audit(
    null,
    'site_copy.initialized',
    'site_copy_revision',
    '83000000-0000-4000-8000-000000000001',
    'DB-01 transactional baseline fixture',
    pg_catalog.jsonb_build_object(
      'homepage_title', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Fandom Harbor'
      ),
      'homepage_introduction', pg_catalog.jsonb_build_object(
        'before', null,
        'after', '一座为公开故事发现与长久阅读保留安静位置的文学港湾。'
      ),
      'homepage_primary_cta_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', '浏览公开作品'
      ),
      'homepage_secondary_cta_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', '查找作品与作者'
      ),
      'navigation_archive_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Archive'
      ),
      'navigation_search_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Search'
      ),
      'navigation_studio_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Studio'
      ),
      'footer_brand_note', pg_catalog.jsonb_build_object(
        'before', null,
        'after', 'Fandom Harbor · 私域作品归档'
      )
    )
  );

  insert into public.site_copy_revisions (
    id,
    version,
    base_version,
    base_revision_id,
    homepage_title,
    homepage_introduction,
    homepage_primary_cta_label,
    homepage_secondary_cta_label,
    navigation_archive_label,
    navigation_search_label,
    navigation_studio_label,
    footer_brand_note,
    request_id,
    audit_log_id
  ) values (
    '83000000-0000-4000-8000-000000000001',
    1,
    0,
    null,
    'Fandom Harbor',
    '一座为公开故事发现与长久阅读保留安静位置的文学港湾。',
    '浏览公开作品',
    '查找作品与作者',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor · 私域作品归档',
    '84000000-0000-4000-8000-000000000001',
    v_audit_log_id
  );

  insert into public.site_copy_state (scope, current_revision_id)
  values ('global', '83000000-0000-4000-8000-000000000001');
end;
$$;

set local role anon;

do $$
begin
  if (
    select count(*) from public.get_public_site_copy()
  ) <> 1 then
    raise exception 'anon did not receive exactly one public projection';
  end if;

  if (
    select homepage_title from public.get_public_site_copy()
  ) <> 'Fandom Harbor' then
    raise exception 'public projection returned unexpected content';
  end if;

  begin
    perform count(*) from public.site_copy_revisions;
    raise exception 'anon directly read site_copy_revisions';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform public.get_admin_site_copy();
    raise exception 'anon executed get_admin_site_copy';
  exception
    when insufficient_privilege then
      null;
  end;
end;
$$;

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000004',
  true
);

do $$
begin
  begin
    perform public.get_admin_site_copy();
    raise exception 'Reader read Admin site copy';
  exception
    when insufficient_privilege then
      if sqlerrm <> 'FORBIDDEN' then
        raise exception 'Reader received unstable error: %', sqlerrm;
      end if;
  end;

  begin
    perform public.save_site_copy(
      1,
      '83000000-0000-4000-8000-000000000001',
      '84000000-0000-4000-8000-000000000004',
      'Reader cannot save',
      'Reader cannot save',
      'Primary',
      'Secondary',
      'Archive',
      'Search',
      'Studio',
      'Footer',
      'Reader denial'
    );
    raise exception 'Reader saved Admin site copy';
  exception
    when insufficient_privilege then
      if sqlerrm <> 'FORBIDDEN' then
        raise exception 'Reader save received unstable error: %', sqlerrm;
      end if;
  end;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000003',
  true
);

do $$
begin
  begin
    perform public.save_site_copy(
      1,
      '83000000-0000-4000-8000-000000000001',
      '84000000-0000-4000-8000-000000000003',
      'Author cannot save',
      'Author cannot save',
      'Primary',
      'Secondary',
      'Archive',
      'Search',
      'Studio',
      'Footer',
      'Author denial'
    );
    raise exception 'Author saved Admin site copy';
  exception
    when insufficient_privilege then
      if sqlerrm <> 'FORBIDDEN' then
        raise exception 'Author save received unstable error: %', sqlerrm;
      end if;
  end;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000005',
  true
);

do $$
begin
  begin
    perform public.get_admin_site_copy();
    raise exception 'Suspended Admin read Admin site copy';
  exception
    when insufficient_privilege then
      if sqlerrm <> 'FORBIDDEN' then
        raise exception 'Suspended Admin received unstable error: %', sqlerrm;
      end if;
  end;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000006',
  true
);

do $$
begin
  begin
    perform public.save_site_copy(
      1,
      '83000000-0000-4000-8000-000000000001',
      '84000000-0000-4000-8000-000000000006',
      'Revoked Admin cannot save',
      'Revoked Admin cannot save',
      'Primary',
      'Secondary',
      'Archive',
      'Search',
      'Studio',
      'Footer',
      'Revoked Admin denial'
    );
    raise exception 'Revoked Admin saved Admin site copy';
  exception
    when insufficient_privilege then
      if sqlerrm <> 'FORBIDDEN' then
        raise exception 'Revoked Admin received unstable error: %', sqlerrm;
      end if;
  end;
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000002',
  true
);

do $$
declare
  v_result jsonb;
begin
  if (
    select count(*) from public.get_admin_site_copy()
  ) <> 1 then
    raise exception 'active Admin could not read site copy';
  end if;

  begin
    perform count(*) from public.site_copy_revisions;
    raise exception 'active Admin directly read site_copy_revisions';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    perform public.save_site_copy(
      1,
      '83000000-0000-4000-8000-000000000001',
      '84000000-0000-4000-8000-000000000010',
      repeat('界', 41),
      'Length rejection',
      'Primary',
      'Secondary',
      'Archive',
      'Search',
      'Studio',
      'Footer',
      'Length rejection'
    );
    raise exception '41-code-point homepage title was accepted';
  exception
    when sqlstate '22023' then
      if sqlerrm <> 'INVALID_INPUT' then
        raise exception 'length validation returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    perform public.save_site_copy(
      1,
      '83000000-0000-4000-8000-000000000001',
      '84000000-0000-4000-8000-000000000011',
      'Control rejection',
      E'Line one\nLine two',
      'Primary',
      'Secondary',
      'Archive',
      'Search',
      'Studio',
      'Footer',
      'Control rejection'
    );
    raise exception 'newline was accepted';
  exception
    when sqlstate '22023' then
      if sqlerrm <> 'INVALID_INPUT' then
        raise exception 'control validation returned unstable error: %', sqlerrm;
      end if;
  end;

  v_result := public.save_site_copy(
    1,
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000020',
    U&'  Cafe\0301 Harbor  ',
    '一座为公开故事发现与长久阅读保留安静位置的文学港湾。',
    '浏览公开作品',
    '查找作品与作者',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor · 私域作品归档',
    '  Normalize and save  '
  );

  if v_result ->> 'status' <> 'saved'
    or (v_result ->> 'version')::bigint <> 2
    or v_result -> 'changed_fields' <> '["homepage_title"]'::jsonb
  then
    raise exception 'active Admin save returned unexpected result: %', v_result;
  end if;

  if (
    select homepage_title
    from public.get_admin_site_copy()
  ) <> 'Café Harbor' then
    raise exception 'NFC normalization and trimming were not persisted';
  end if;
end;
$$;

do $$
declare
  v_first_result jsonb;
  v_retry_result jsonb;
  v_revision_count bigint;
  v_audit_count bigint;
begin
  select pg_catalog.jsonb_build_object(
    'status', 'saved',
    'version', a.version,
    'revision_id', a.revision_id,
    'audit_log_id', a.audit_log_id,
    'changed_fields', '["homepage_title"]'::jsonb,
    'updated_at', a.updated_at
  )
  into v_first_result
  from public.get_admin_site_copy() a;

  reset role;
  select count(*) into v_revision_count from public.site_copy_revisions;
  select count(*) into v_audit_count from public.audit_logs;
  set local role authenticated;

  v_retry_result := public.save_site_copy(
    1,
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000020',
    U&'Cafe\0301 Harbor',
    '一座为公开故事发现与长久阅读保留安静位置的文学港湾。',
    '浏览公开作品',
    '查找作品与作者',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor · 私域作品归档',
    'Normalize and save'
  );

  if v_retry_result is distinct from v_first_result then
    raise exception 'same request retry did not return original result: %, %',
      v_first_result,
      v_retry_result;
  end if;

  reset role;
  if (select count(*) from public.site_copy_revisions) <> v_revision_count
    or (select count(*) from public.audit_logs) <> v_audit_count
  then
    raise exception 'same request retry wrote new data';
  end if;
  set local role authenticated;

  begin
    perform public.save_site_copy(
      1,
      '83000000-0000-4000-8000-000000000001',
      '84000000-0000-4000-8000-000000000020',
      'Different payload',
      '一座为公开故事发现与长久阅读保留安静位置的文学港湾。',
      '浏览公开作品',
      '查找作品与作者',
      'Archive',
      'Search',
      'Studio',
      'Fandom Harbor · 私域作品归档',
      'Normalize and save'
    );
    raise exception 'same request id accepted a different payload';
  exception
    when sqlstate '22023' then
      if sqlerrm <> 'INVALID_INPUT' then
        raise exception 'request mismatch returned unstable error: %', sqlerrm;
      end if;
  end;

  reset role;
  if (select count(*) from public.site_copy_revisions) <> v_revision_count
    or (select count(*) from public.audit_logs) <> v_audit_count
  then
    raise exception 'request mismatch produced a partial write';
  end if;
  set local role authenticated;
end;
$$;

do $$
declare
  v_result jsonb;
  v_revision_count bigint;
  v_audit_count bigint;
  v_pointer uuid;
begin
  reset role;
  select count(*) into v_revision_count from public.site_copy_revisions;
  select count(*) into v_audit_count from public.audit_logs;
  select current_revision_id into v_pointer
  from public.site_copy_state
  where scope = 'global';
  set local role authenticated;

  v_result := public.save_site_copy(
    1,
    '83000000-0000-4000-8000-000000000001',
    '84000000-0000-4000-8000-000000000021',
    'Stale request',
    '一座为公开故事发现与长久阅读保留安静位置的文学港湾。',
    '浏览公开作品',
    '查找作品与作者',
    'Archive',
    'Search',
    'Studio',
    'Fandom Harbor · 私域作品归档',
    'Same base loses after the first save'
  );

  if v_result ->> 'status' <> 'conflict'
    or (v_result ->> 'current_version')::bigint <> 2
  then
    raise exception 'stale base did not return conflict: %', v_result;
  end if;

  reset role;
  if (select count(*) from public.site_copy_revisions) <> v_revision_count
    or (select count(*) from public.audit_logs) <> v_audit_count
    or (
      select current_revision_id
      from public.site_copy_state
      where scope = 'global'
    ) <> v_pointer
  then
    raise exception 'conflict produced a partial write';
  end if;
  set local role authenticated;
end;
$$;

reset role;

do $$
begin
  if (
    select a.metadata
    from public.site_copy_revisions r
    join public.audit_logs a on a.id = r.audit_log_id
    where r.version = 2
  ) <> pg_catalog.jsonb_build_object(
    'homepage_title',
    pg_catalog.jsonb_build_object(
      'before', 'Fandom Harbor',
      'after', 'Café Harbor'
    )
  ) then
    raise exception 'save audit metadata contains more than changed fields';
  end if;

  if (
    select count(*)
    from public.site_copy_revisions r
    join public.audit_logs a
      on a.id = r.audit_log_id
      and a.target_id = r.id
      and a.action in ('site_copy.initialized', 'site_copy.updated')
      and a.target_type = 'site_copy_revision'
  ) <> (
    select count(*) from public.site_copy_revisions
  ) then
    raise exception 'audit and revision are not one-to-one';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000001',
  true
);

do $$
declare
  v_current record;
  v_result jsonb;
begin
  select * into v_current from public.get_admin_site_copy();

  v_result := public.save_site_copy(
    v_current.version,
    v_current.revision_id,
    '84000000-0000-4000-8000-000000000030',
    v_current.homepage_title,
    v_current.homepage_introduction,
    v_current.homepage_primary_cta_label,
    v_current.homepage_secondary_cta_label,
    v_current.navigation_archive_label,
    v_current.navigation_search_label,
    v_current.navigation_studio_label,
    'Fandom Harbor · 安静的文学港湾',
    'Super Admin uses the same P0 field contract'
  );

  if v_result ->> 'status' <> 'saved'
    or (v_result ->> 'version')::bigint <> 3
    or v_result -> 'changed_fields' <> '["footer_brand_note"]'::jsonb
  then
    raise exception 'Super Admin save returned unexpected result: %', v_result;
  end if;
end;
$$;

reset role;

create or replace function private.fail_site_copy_audit_test()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.action = 'site_copy.updated' then
    raise exception using
      errcode = 'XX000',
      message = 'DB01_TEST_AUDIT_FAILURE';
  end if;
  return new;
end;
$$;

create trigger db01_test_fail_site_copy_audit
before insert on public.audit_logs
for each row execute function private.fail_site_copy_audit_test();

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000002',
  true
);

do $$
declare
  v_current record;
  v_revision_count bigint;
  v_audit_count bigint;
begin
  select * into v_current from public.get_admin_site_copy();

  reset role;
  select count(*) into v_revision_count from public.site_copy_revisions;
  select count(*) into v_audit_count from public.audit_logs;
  set local role authenticated;

  begin
    perform public.save_site_copy(
      v_current.version,
      v_current.revision_id,
      '84000000-0000-4000-8000-000000000040',
      'Must roll back',
      v_current.homepage_introduction,
      v_current.homepage_primary_cta_label,
      v_current.homepage_secondary_cta_label,
      v_current.navigation_archive_label,
      v_current.navigation_search_label,
      v_current.navigation_studio_label,
      v_current.footer_brand_note,
      'Forced audit failure'
    );
    raise exception 'forced audit failure unexpectedly saved';
  exception
    when sqlstate 'XX000' then
      if sqlerrm <> 'DB01_TEST_AUDIT_FAILURE' then
        raise exception 'unexpected atomic failure: %', sqlerrm;
      end if;
  end;

  reset role;
  if (select count(*) from public.site_copy_revisions) <> v_revision_count
    or (select count(*) from public.audit_logs) <> v_audit_count
    or (
      select current_revision_id
      from public.site_copy_state
      where scope = 'global'
    ) <> v_current.revision_id
  then
    raise exception 'audit failure left a partial save';
  end if;
  set local role authenticated;
end;
$$;

reset role;
drop trigger db01_test_fail_site_copy_audit on public.audit_logs;
drop function private.fail_site_copy_audit_test();

create or replace function private.fail_site_copy_revision_test()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = 'XX000',
    message = 'DB01_TEST_REVISION_FAILURE';
end;
$$;

create trigger db01_test_fail_site_copy_revision
before insert on public.site_copy_revisions
for each row execute function private.fail_site_copy_revision_test();

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '81000000-0000-4000-8000-000000000002',
  true
);

do $$
declare
  v_current record;
  v_revision_count bigint;
  v_audit_count bigint;
begin
  select * into v_current from public.get_admin_site_copy();

  reset role;
  select count(*) into v_revision_count from public.site_copy_revisions;
  select count(*) into v_audit_count from public.audit_logs;
  set local role authenticated;

  begin
    perform public.save_site_copy(
      v_current.version,
      v_current.revision_id,
      '84000000-0000-4000-8000-000000000041',
      'Revision must roll back',
      v_current.homepage_introduction,
      v_current.homepage_primary_cta_label,
      v_current.homepage_secondary_cta_label,
      v_current.navigation_archive_label,
      v_current.navigation_search_label,
      v_current.navigation_studio_label,
      v_current.footer_brand_note,
      'Forced revision failure after audit insertion'
    );
    raise exception 'forced revision failure unexpectedly saved';
  exception
    when sqlstate 'XX000' then
      if sqlerrm <> 'DB01_TEST_REVISION_FAILURE' then
        raise exception 'unexpected post-audit failure: %', sqlerrm;
      end if;
  end;

  reset role;
  if (select count(*) from public.site_copy_revisions) <> v_revision_count
    or (select count(*) from public.audit_logs) <> v_audit_count
    or (
      select current_revision_id
      from public.site_copy_state
      where scope = 'global'
    ) <> v_current.revision_id
  then
    raise exception 'revision failure left an orphan audit or partial save';
  end if;
  set local role authenticated;
end;
$$;

reset role;
drop trigger db01_test_fail_site_copy_revision
  on public.site_copy_revisions;
drop function private.fail_site_copy_revision_test();

do $$
declare
  v_current_revision_id uuid;
  v_current_audit_log_id bigint;
begin
  select s.current_revision_id, r.audit_log_id
  into v_current_revision_id, v_current_audit_log_id
  from public.site_copy_state s
  join public.site_copy_revisions r on r.id = s.current_revision_id
  where s.scope = 'global';

  begin
    update public.site_copy_revisions
    set homepage_title = 'Mutation must fail'
    where id = v_current_revision_id;
    raise exception 'revision update unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_REVISION_IMMUTABLE' then
        raise exception 'revision update returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    delete from public.site_copy_revisions
    where id = v_current_revision_id;
    raise exception 'revision delete unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_REVISION_IMMUTABLE' then
        raise exception 'revision delete returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    update public.audit_logs
    set reason = 'Mutation must fail'
    where id = v_current_audit_log_id;
    raise exception 'site copy audit update unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_AUDIT_IMMUTABLE' then
        raise exception 'audit update returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    delete from public.audit_logs
    where id = v_current_audit_log_id;
    raise exception 'site copy audit delete unexpectedly succeeded';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_AUDIT_IMMUTABLE' then
        raise exception 'audit delete returned unstable error: %', sqlerrm;
      end if;
  end;

  begin
    update public.site_copy_state
    set current_revision_id = '83000000-0000-4000-8000-000000000099'
    where scope = 'global';
    raise exception 'state accepted a missing revision';
  exception
    when foreign_key_violation then
      null;
  end;

  if (
    select r.id
    from public.site_copy_state s
    join public.site_copy_revisions r on r.id = s.current_revision_id
    where s.scope = 'global'
  ) is distinct from v_current_revision_id then
    raise exception 'current pointer integrity changed after rejected operations';
  end if;
end;
$$;

rollback;
