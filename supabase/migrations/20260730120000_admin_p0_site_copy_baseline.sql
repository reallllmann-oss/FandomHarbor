-- Baseline source-of-truth snapshot (verified 2026-07-30):
-- apps/web/src/app/page.tsx: visible Homepage title, introduction and CTA labels.
-- apps/web/src/lib/global-shell-navigation.ts: Archive, Search and Studio labels.
-- packages/ui/src/components/layouts.tsx: ReaderLayout Footer brand note rendered by Web.
create or replace function private.initialize_site_copy_baseline()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_revision_id constant uuid := 'dada0100-0000-4000-8000-000000000001';
  v_reserved_request_id constant uuid :=
    '00000000-0000-0000-0000-000000000000';
  v_homepage_title text;
  v_homepage_introduction text;
  v_homepage_primary_cta_label text;
  v_homepage_secondary_cta_label text;
  v_navigation_archive_label text;
  v_navigation_search_label text;
  v_navigation_studio_label text;
  v_footer_brand_note text;
  v_reason text;
  v_audit_log_id bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('fandom-harbor:site-copy:global', 0)
  );

  if exists (select 1 from public.site_copy_state)
    or exists (select 1 from public.site_copy_revisions)
    or exists (
      select 1
      from public.audit_logs
      where action = 'site_copy.initialized'
        or target_type = 'site_copy_revision'
    )
  then
    raise exception using
      errcode = '55000',
      message = 'SITE_COPY_ALREADY_INITIALIZED';
  end if;

  v_homepage_title := private.require_site_copy_text(
    'Fandom Harbor', 'homepage_title', 1, 40
  );
  v_homepage_introduction := private.require_site_copy_text(
    '一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。',
    'homepage_introduction',
    1,
    180
  );
  v_homepage_primary_cta_label := private.require_site_copy_text(
    '浏览公开作品', 'homepage_primary_cta_label', 1, 18
  );
  v_homepage_secondary_cta_label := private.require_site_copy_text(
    '查找作品与作者', 'homepage_secondary_cta_label', 1, 18
  );
  v_navigation_archive_label := private.require_site_copy_text(
    'Archive', 'navigation_archive_label', 1, 12
  );
  v_navigation_search_label := private.require_site_copy_text(
    'Search', 'navigation_search_label', 1, 12
  );
  v_navigation_studio_label := private.require_site_copy_text(
    'Studio', 'navigation_studio_label', 1, 12
  );
  v_footer_brand_note := private.require_site_copy_text(
    'Fandom Harbor · 私域作品归档', 'footer_brand_note', 1, 80
  );
  v_reason := private.require_site_copy_text(
    'DATA-01 site copy baseline initialization', 'reason', 4, 200
  );

  v_audit_log_id := private.write_audit(
    null,
    'site_copy.initialized',
    'site_copy_revision',
    v_revision_id,
    v_reason,
    pg_catalog.jsonb_build_object(
      'homepage_title', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_homepage_title
      ),
      'homepage_introduction', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_homepage_introduction
      ),
      'homepage_primary_cta_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_homepage_primary_cta_label
      ),
      'homepage_secondary_cta_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_homepage_secondary_cta_label
      ),
      'navigation_archive_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_navigation_archive_label
      ),
      'navigation_search_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_navigation_search_label
      ),
      'navigation_studio_label', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_navigation_studio_label
      ),
      'footer_brand_note', pg_catalog.jsonb_build_object(
        'before', null,
        'after', v_footer_brand_note
      )
    )
  );

  insert into public.site_copy_revisions (
    id,
    scope,
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
    v_revision_id,
    'global',
    1,
    0,
    null,
    v_homepage_title,
    v_homepage_introduction,
    v_homepage_primary_cta_label,
    v_homepage_secondary_cta_label,
    v_navigation_archive_label,
    v_navigation_search_label,
    v_navigation_studio_label,
    v_footer_brand_note,
    v_reserved_request_id,
    v_audit_log_id
  );

  insert into public.site_copy_state (
    scope,
    current_revision_id
  ) values (
    'global',
    v_revision_id
  );

  if (
    select count(*)
    from public.site_copy_state s
    join public.site_copy_revisions r
      on r.scope = s.scope
      and r.id = s.current_revision_id
    join public.audit_logs a
      on a.id = r.audit_log_id
      and a.target_id = r.id
    where s.scope = 'global'
      and r.version = 1
      and r.base_version = 0
      and r.base_revision_id is null
      and a.action = 'site_copy.initialized'
      and a.target_type = 'site_copy_revision'
      and a.actor_user_id is null
  ) <> 1 then
    raise exception using
      errcode = '55000',
      message = 'SITE_COPY_INITIALIZATION_FAILED';
  end if;

  return v_revision_id;
end;
$$;

revoke all on function private.initialize_site_copy_baseline() from public;

select private.initialize_site_copy_baseline();

comment on function private.initialize_site_copy_baseline() is
  'Owner-only, fail-closed DATA-01 initializer for the immutable Version 1 site copy baseline.';
