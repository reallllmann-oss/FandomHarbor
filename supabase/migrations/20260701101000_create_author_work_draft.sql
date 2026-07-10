create or replace function public.create_author_work_draft(
  p_title text,
  p_summary text default '',
  p_category_id uuid default null,
  p_tag_ids uuid[] default '{}'::uuid[]
)
returns table (
  id uuid,
  category_id uuid,
  title text,
  slug text,
  summary text,
  status text,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owner_user_id uuid := auth.uid();
  v_requested_tag_count integer;
  v_valid_tag_count integer;
  v_work public.works%rowtype;
begin
  if v_owner_user_id is null then
    raise exception using
      errcode = '42501',
      message = 'authentication required';
  end if;

  if not private.current_user_has_role('author') then
    raise exception using
      errcode = '42501',
      message = 'author capability required';
  end if;

  if p_category_id is not null and not exists (
    select 1
    from public.content_categories category
    where category.id = p_category_id
  ) then
    raise exception using
      errcode = '23503',
      message = 'content category does not exist';
  end if;

  if exists (
    select 1
    from pg_catalog.unnest(coalesce(p_tag_ids, '{}'::uuid[])) requested(tag_id)
    where requested.tag_id is null
  ) then
    raise exception using
      errcode = '23502',
      message = 'tag IDs cannot contain null';
  end if;

  select count(distinct requested.tag_id)
  into v_requested_tag_count
  from pg_catalog.unnest(coalesce(p_tag_ids, '{}'::uuid[])) requested(tag_id);

  select count(tag.id)
  into v_valid_tag_count
  from public.content_tags tag
  where tag.id = any(coalesce(p_tag_ids, '{}'::uuid[]))
    and tag.governance_state <> 'deprecated';

  if v_requested_tag_count <> v_valid_tag_count then
    raise exception using
      errcode = '23503',
      message = 'one or more content tags do not exist or are deprecated';
  end if;

  insert into public.works (
    owner_user_id,
    category_id,
    title,
    slug,
    summary,
    status,
    published_at
  )
  values (
    v_owner_user_id,
    p_category_id,
    pg_catalog.btrim(p_title),
    'work-' || extensions.gen_random_uuid()::text,
    coalesce(p_summary, ''),
    'draft',
    null
  )
  returning
    works.id,
    works.category_id,
    works.title,
    works.slug,
    works.summary,
    works.status,
    works.published_at,
    works.created_at,
    works.updated_at
  into
    v_work.id,
    v_work.category_id,
    v_work.title,
    v_work.slug,
    v_work.summary,
    v_work.status,
    v_work.published_at,
    v_work.created_at,
    v_work.updated_at;

  insert into public.work_tags (work_id, tag_id)
  select v_work.id, requested.tag_id
  from (
    select distinct tag_id
    from pg_catalog.unnest(coalesce(p_tag_ids, '{}'::uuid[])) input(tag_id)
  ) requested;

  return query
  select
    v_work.id,
    v_work.category_id,
    v_work.title,
    v_work.slug,
    v_work.summary,
    v_work.status,
    v_work.published_at,
    v_work.created_at,
    v_work.updated_at;
end;
$$;

revoke all on function public.create_author_work_draft(
  text,
  text,
  uuid,
  uuid[]
) from public;

grant execute on function public.create_author_work_draft(
  text,
  text,
  uuid,
  uuid[]
) to authenticated;
