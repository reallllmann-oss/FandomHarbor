create or replace function public.list_my_studio_works(
  p_limit integer default 100,
  p_offset integer default 0
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
language sql
stable
security definer
set search_path = ''
as $$
  select
    w.id,
    w.category_id,
    w.title,
    w.slug,
    w.summary,
    w.status,
    w.published_at,
    w.created_at,
    w.updated_at
  from public.works w
  where w.owner_user_id = auth.uid()
    and w.status in ('draft', 'published')
    and private.is_active_member(auth.uid())
    and private.has_role('author', auth.uid())
  order by w.updated_at desc, w.id
  limit least(greatest(coalesce(p_limit, 100), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

create or replace function public.get_my_studio_work(p_work_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'work', jsonb_build_object(
      'id', w.id,
      'category_id', w.category_id,
      'title', w.title,
      'slug', w.slug,
      'summary', w.summary,
      'status', w.status,
      'published_at', w.published_at,
      'created_at', w.created_at,
      'updated_at', w.updated_at
    ),
    'category', case when c.id is null then null else jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'description', c.description
    ) end,
    'chapters', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ch.id,
        'work_id', ch.work_id,
        'position', ch.position,
        'title', ch.title,
        'slug', ch.slug,
        'status', ch.status,
        'content', ch.content,
        'content_schema_version', ch.content_schema_version,
        'published_at', ch.published_at,
        'created_at', ch.created_at,
        'updated_at', ch.updated_at
      ) order by ch.position, ch.id)
      from public.chapters ch
      where ch.work_id = w.id
    ), '[]'::jsonb),
    'tags', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'tag_type', t.tag_type,
        'governance_state', t.governance_state,
        'canonical_tag_id', t.canonical_tag_id,
        'description', t.description
      ) order by t.name, t.id)
      from public.work_tags wt
      join public.content_tags t on t.id = wt.tag_id
      where wt.work_id = w.id
    ), '[]'::jsonb)
  )
  from public.works w
  left join public.content_categories c on c.id = w.category_id
  where w.id = p_work_id
    and w.owner_user_id = auth.uid()
    and w.status in ('draft', 'published')
    and private.is_active_member(auth.uid())
    and private.has_role('author', auth.uid());
$$;

revoke all on function public.list_my_studio_works(integer, integer)
  from public, anon, authenticated;
revoke all on function public.get_my_studio_work(uuid)
  from public, anon, authenticated;

grant execute on function public.list_my_studio_works(integer, integer)
  to authenticated;
grant execute on function public.get_my_studio_work(uuid)
  to authenticated;

comment on function public.list_my_studio_works(integer, integer) is
  'Lists only the current active Author own draft and published works without exposing owner_user_id.';
comment on function public.get_my_studio_work(uuid) is
  'Returns only the current active Author own work and nested management fields without exposing owner_user_id.';
