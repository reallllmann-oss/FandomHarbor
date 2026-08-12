\set ON_ERROR_STOP on

begin;

do $$
declare
  v_revision public.site_copy_revisions%rowtype;
  v_audit public.audit_logs%rowtype;
  v_expected_metadata jsonb := pg_catalog.jsonb_build_object(
    'homepage_title',
      pg_catalog.jsonb_build_object('before', null, 'after', 'Fandom Harbor'),
    'homepage_introduction',
      pg_catalog.jsonb_build_object(
        'before',
        null,
        'after',
        '一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。'
      ),
    'homepage_primary_cta_label',
      pg_catalog.jsonb_build_object('before', null, 'after', '浏览公开作品'),
    'homepage_secondary_cta_label',
      pg_catalog.jsonb_build_object('before', null, 'after', '查找作品与作者'),
    'navigation_archive_label',
      pg_catalog.jsonb_build_object('before', null, 'after', 'Archive'),
    'navigation_search_label',
      pg_catalog.jsonb_build_object('before', null, 'after', 'Search'),
    'navigation_studio_label',
      pg_catalog.jsonb_build_object('before', null, 'after', 'Studio'),
    'footer_brand_note',
      pg_catalog.jsonb_build_object(
        'before',
        null,
        'after',
        'Fandom Harbor · 私域作品归档'
      )
  );
begin
  if (select count(*) from public.site_copy_revisions) <> 1
    or (select count(*) from public.site_copy_state) <> 1
    or (
      select count(*)
      from public.audit_logs
      where action = 'site_copy.initialized'
        and target_type = 'site_copy_revision'
    ) <> 1
  then
    raise exception 'DATA-01 did not create exactly one baseline graph';
  end if;

  select r.* into strict v_revision
  from public.site_copy_state s
  join public.site_copy_revisions r on r.id = s.current_revision_id
  where s.scope = 'global';

  select a.* into strict v_audit
  from public.audit_logs a
  where a.id = v_revision.audit_log_id;

  if v_revision.id <> 'dada0100-0000-4000-8000-000000000001'
    or v_revision.scope <> 'global'
    or v_revision.version <> 1
    or v_revision.base_version <> 0
    or v_revision.base_revision_id is not null
    or v_revision.request_id <> '00000000-0000-0000-0000-000000000000'
  then
    raise exception 'DATA-01 Version 1 identity or ancestry is incorrect';
  end if;

  if v_revision.homepage_title <> 'Fandom Harbor'
    or v_revision.homepage_introduction <>
      '一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。'
    or v_revision.homepage_primary_cta_label <> '浏览公开作品'
    or v_revision.homepage_secondary_cta_label <> '查找作品与作者'
    or v_revision.navigation_archive_label <> 'Archive'
    or v_revision.navigation_search_label <> 'Search'
    or v_revision.navigation_studio_label <> 'Studio'
    or v_revision.footer_brand_note <> 'Fandom Harbor · 私域作品归档'
  then
    raise exception 'DATA-01 does not match the eight current Web values';
  end if;

  if v_audit.action <> 'site_copy.initialized'
    or v_audit.target_type <> 'site_copy_revision'
    or v_audit.target_id <> v_revision.id
    or v_audit.actor_user_id is not null
    or v_audit.reason <> 'DATA-01 site copy baseline initialization'
    or v_audit.metadata <> v_expected_metadata
  then
    raise exception 'DATA-01 initialization Audit contract is incorrect';
  end if;

  if (
    select pg_catalog.count(*)
    from pg_catalog.jsonb_object_keys(v_audit.metadata)
  ) <> 8 then
    raise exception 'DATA-01 Audit metadata is not the strict eight-field delta';
  end if;
end;
$$;

do $$
declare
  v_public jsonb;
begin
  select pg_catalog.to_jsonb(copy)
  into strict v_public
  from public.get_public_site_copy() as copy;

  if v_public <> pg_catalog.jsonb_build_object(
    'version', 1,
    'homepage_title', 'Fandom Harbor',
    'homepage_introduction',
      '一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。',
    'homepage_primary_cta_label', '浏览公开作品',
    'homepage_secondary_cta_label', '查找作品与作者',
    'navigation_archive_label', 'Archive',
    'navigation_search_label', 'Search',
    'navigation_studio_label', 'Studio',
    'footer_brand_note', 'Fandom Harbor · 私域作品归档'
  ) then
    raise exception 'public projection is not the exact non-sensitive baseline: %',
      v_public;
  end if;

  if v_public ?| array[
    'revision_id',
    'request_id',
    'audit_log_id',
    'actor_user_id',
    'reason',
    'created_at',
    'updated_at'
  ] then
    raise exception 'public projection exposes a sensitive initialization field';
  end if;
end;
$$;

do $$
declare
  v_revision_count bigint;
  v_audit_count bigint;
  v_pointer uuid;
begin
  if pg_catalog.has_function_privilege(
    'anon',
    'private.initialize_site_copy_baseline()',
    'execute'
  ) or pg_catalog.has_function_privilege(
    'authenticated',
    'private.initialize_site_copy_baseline()',
    'execute'
  ) or pg_catalog.has_function_privilege(
    'service_role',
    'private.initialize_site_copy_baseline()',
    'execute'
  ) then
    raise exception 'an application role can execute the DATA-01 initializer';
  end if;

  select count(*) into v_revision_count from public.site_copy_revisions;
  select count(*) into v_audit_count from public.audit_logs;
  select current_revision_id into strict v_pointer
  from public.site_copy_state
  where scope = 'global';

  begin
    perform private.initialize_site_copy_baseline();
    raise exception 'DATA-01 initializer accepted a second execution';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_ALREADY_INITIALIZED' then
        raise exception 'reinitialization returned an unstable error: %', sqlerrm;
      end if;
  end;

  if (select count(*) from public.site_copy_revisions) <> v_revision_count
    or (select count(*) from public.audit_logs) <> v_audit_count
    or (
      select current_revision_id
      from public.site_copy_state
      where scope = 'global'
    ) <> v_pointer
  then
    raise exception 'reinitialization rejection produced a partial write';
  end if;
end;
$$;

savepoint data01_stray_audit;

set local session_replication_role = replica;
delete from public.site_copy_state;
delete from public.site_copy_revisions;
delete from public.audit_logs
where target_type = 'site_copy_revision'
  and action in ('site_copy.initialized', 'site_copy.updated');
set local session_replication_role = origin;

select private.write_audit(
  null,
  'site_copy.initialized',
  'site_copy_revision',
  'dada0100-0000-4000-8000-000000000099',
  'DATA-01 incomplete state test',
  '{}'::jsonb
);

do $$
begin
  begin
    perform private.initialize_site_copy_baseline();
    raise exception 'DATA-01 initializer accepted a stray site-copy Audit';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_ALREADY_INITIALIZED' then
        raise exception 'stray Audit returned an unstable error: %', sqlerrm;
      end if;
  end;

  if exists (select 1 from public.site_copy_revisions)
    or exists (select 1 from public.site_copy_state)
    or (
      select count(*)
      from public.audit_logs
      where target_type = 'site_copy_revision'
    ) <> 1
  then
    raise exception 'stray Audit rejection produced a partial write';
  end if;
end;
$$;

rollback to savepoint data01_stray_audit;

savepoint data01_stray_revision;

set local session_replication_role = replica;
delete from public.site_copy_state;
delete from public.site_copy_revisions;
delete from public.audit_logs
where target_type = 'site_copy_revision'
  and action in ('site_copy.initialized', 'site_copy.updated');
set local session_replication_role = origin;

do $$
declare
  v_audit_log_id bigint;
begin
  v_audit_log_id := private.write_audit(
    null,
    'data01.partial_fixture',
    'data01_test',
    'dada0100-0000-4000-8000-000000000098',
    'DATA-01 incomplete revision test',
    '{}'::jsonb
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
    'dada0100-0000-4000-8000-000000000098',
    1,
    0,
    null,
    'Fandom Harbor',
    'Incomplete revision fixture',
    'Primary',
    'Secondary',
    'Archive',
    'Search',
    'Studio',
    'Footer',
    'dada0100-0000-4000-8000-000000000098',
    v_audit_log_id
  );

  begin
    perform private.initialize_site_copy_baseline();
    raise exception 'DATA-01 initializer accepted a Revision without State';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_ALREADY_INITIALIZED' then
        raise exception 'stray Revision returned an unstable error: %', sqlerrm;
      end if;
  end;

  if (select count(*) from public.site_copy_revisions) <> 1
    or exists (select 1 from public.site_copy_state)
  then
    raise exception 'stray Revision rejection produced a partial write';
  end if;
end;
$$;

rollback to savepoint data01_stray_revision;

savepoint data01_stray_state;

set local session_replication_role = replica;
delete from public.site_copy_state;
delete from public.site_copy_revisions;
delete from public.audit_logs
where target_type = 'site_copy_revision'
  and action in ('site_copy.initialized', 'site_copy.updated');
insert into public.site_copy_state (scope, current_revision_id)
values ('global', 'dada0100-0000-4000-8000-000000000097');
set local session_replication_role = origin;

do $$
begin
  begin
    perform private.initialize_site_copy_baseline();
    raise exception 'DATA-01 initializer accepted a State without Revision';
  exception
    when sqlstate '55000' then
      if sqlerrm <> 'SITE_COPY_ALREADY_INITIALIZED' then
        raise exception 'stray State returned an unstable error: %', sqlerrm;
      end if;
  end;

  if (select count(*) from public.site_copy_state) <> 1
    or exists (select 1 from public.site_copy_revisions)
    or exists (
      select 1
      from public.audit_logs
      where target_type = 'site_copy_revision'
    )
  then
    raise exception 'stray State rejection produced a partial write';
  end if;
end;
$$;

rollback to savepoint data01_stray_state;

savepoint data01_atomic_failure;

set local session_replication_role = replica;
delete from public.site_copy_state;
delete from public.site_copy_revisions;
delete from public.audit_logs
where target_type = 'site_copy_revision'
  and action in ('site_copy.initialized', 'site_copy.updated');
set local session_replication_role = origin;

create or replace function private.fail_data01_pointer_test()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception using
    errcode = 'XX000',
    message = 'DATA01_TEST_POINTER_FAILURE';
end;
$$;

create trigger data01_test_fail_pointer
before insert on public.site_copy_state
for each row execute function private.fail_data01_pointer_test();

do $$
begin
  begin
    perform private.initialize_site_copy_baseline();
    raise exception 'forced DATA-01 failure unexpectedly initialized';
  exception
    when sqlstate 'XX000' then
      if sqlerrm <> 'DATA01_TEST_POINTER_FAILURE' then
        raise exception 'forced DATA-01 failure returned unexpected error: %',
          sqlerrm;
      end if;
  end;

  if exists (select 1 from public.site_copy_revisions)
    or exists (select 1 from public.site_copy_state)
    or exists (
      select 1
      from public.audit_logs
      where target_type = 'site_copy_revision'
        and action in ('site_copy.initialized', 'site_copy.updated')
    )
  then
    raise exception 'forced DATA-01 failure left a partial baseline';
  end if;
end;
$$;

rollback to savepoint data01_atomic_failure;

do $$
begin
  if (select count(*) from public.site_copy_revisions) <> 1
    or (select count(*) from public.site_copy_state) <> 1
    or (
      select count(*)
      from public.audit_logs
      where action = 'site_copy.initialized'
        and target_type = 'site_copy_revision'
    ) <> 1
    or (
      select current_revision_id
      from public.site_copy_state
      where scope = 'global'
    ) <> 'dada0100-0000-4000-8000-000000000001'
  then
    raise exception 'DATA-01 tests did not restore the formal baseline';
  end if;
end;
$$;

rollback;
