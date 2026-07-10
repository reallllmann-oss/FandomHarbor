create or replace function public.browse_public_works(
  p_limit integer default 12,
  p_offset integer default 0,
  p_sort text default 'newest'
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with browse_input as (
    select
      least(greatest(coalesce(p_limit, 12), 1), 50) as result_limit,
      greatest(coalesce(p_offset, 0), 0) as result_offset,
      case
        when p_sort in ('newest', 'oldest', 'title-asc', 'title-desc') then p_sort
        else 'newest'
      end as result_sort
  ),
  eligible_works as (
    select
      w.id,
      w.slug,
      w.title,
      w.summary,
      w.published_at,
      ap.slug as author_slug,
      ap.display_name as author_name
    from public.works w
    join public.author_profiles ap on ap.user_id = w.owner_user_id
    where w.status = 'published'
      and exists (
        select 1
        from public.role_grants rg
        join public.memberships m on m.user_id = rg.user_id
        where rg.user_id = ap.user_id
          and rg.role = 'author'
          and rg.revoked_at is null
          and m.state = 'active'
      )
  ),
  page_items as (
    select ew.*, row_number() over (
      order by
        case when bi.result_sort = 'newest' then ew.published_at end desc nulls last,
        case when bi.result_sort = 'oldest' then ew.published_at end asc nulls last,
        case when bi.result_sort = 'title-asc' then lower(ew.title) end asc nulls last,
        case when bi.result_sort = 'title-desc' then lower(ew.title) end desc nulls last,
        ew.id asc
    ) as ordinality
    from eligible_works ew
    cross join browse_input bi
    order by
      case when bi.result_sort = 'newest' then ew.published_at end desc nulls last,
      case when bi.result_sort = 'oldest' then ew.published_at end asc nulls last,
      case when bi.result_sort = 'title-asc' then lower(ew.title) end asc nulls last,
      case when bi.result_sort = 'title-desc' then lower(ew.title) end desc nulls last,
      ew.id asc
    limit (select result_limit from browse_input)
    offset (select result_offset from browse_input)
  )
  select jsonb_build_object(
    'total', (select count(*) from eligible_works),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pi.id,
        'slug', pi.slug,
        'title', pi.title,
        'summary', pi.summary,
        'published_at', pi.published_at,
        'author_slug', pi.author_slug,
        'author_name', pi.author_name
      ) order by pi.ordinality)
      from page_items pi
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.browse_public_works(integer, integer, text)
  from public;
grant execute on function public.browse_public_works(integer, integer, text)
  to anon, authenticated;

comment on function public.browse_public_works(integer, integer, text) is
  'Browse MVP: stable bounded pagination and approved sorting over published works with public author fields.';
