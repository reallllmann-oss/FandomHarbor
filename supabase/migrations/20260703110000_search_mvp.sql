create or replace function public.search_public_catalog(
  p_query text,
  p_limit integer default 20
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with search_input as (
    select
      lower(btrim(coalesce(p_query, ''))) as query,
      least(greatest(coalesce(p_limit, 20), 1), 50) as result_limit
  ),
  eligible_authors as (
    select ap.user_id, ap.slug, ap.display_name, ap.bio
    from public.author_profiles ap
    where exists (
      select 1
      from public.role_grants rg
      join public.memberships m on m.user_id = rg.user_id
      where rg.user_id = ap.user_id
        and rg.role = 'author'
        and rg.revoked_at is null
        and m.state = 'active'
    )
  ),
  matched_works as (
    select jsonb_build_object(
      'id', w.id,
      'slug', w.slug,
      'title', w.title,
      'summary', w.summary,
      'published_at', w.published_at,
      'author_slug', ea.slug,
      'author_name', ea.display_name
    ) as result,
    w.published_at,
    w.id
    from search_input si
    join public.works w on true
    join eligible_authors ea on ea.user_id = w.owner_user_id
    where char_length(si.query) between 1 and 80
      and w.status = 'published'
      and (
        strpos(lower(w.title), si.query) > 0
        or strpos(lower(w.slug), si.query) > 0
      )
    order by w.published_at desc, w.id
    limit (select result_limit from search_input)
  ),
  matched_authors as (
    select jsonb_build_object(
      'slug', ea.slug,
      'display_name', ea.display_name,
      'bio', ea.bio,
      'published_work_count', (
        select count(*)
        from public.works w
        where w.owner_user_id = ea.user_id and w.status = 'published'
      )
    ) as result,
    ea.display_name,
    ea.slug
    from search_input si
    join eligible_authors ea on true
    where char_length(si.query) between 1 and 80
      and (
        strpos(lower(ea.display_name), si.query) > 0
        or strpos(lower(ea.slug), si.query) > 0
      )
      and exists (
        select 1 from public.works w
        where w.owner_user_id = ea.user_id and w.status = 'published'
      )
    order by ea.display_name, ea.slug
    limit (select result_limit from search_input)
  )
  select jsonb_build_object(
    'works', coalesce(
      (select jsonb_agg(result order by published_at desc, id) from matched_works),
      '[]'::jsonb
    ),
    'authors', coalesce(
      (select jsonb_agg(result order by display_name, slug) from matched_authors),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.search_public_catalog(text, integer) from public;
grant execute on function public.search_public_catalog(text, integer)
  to anon, authenticated;

comment on function public.search_public_catalog(text, integer) is
  'Search MVP: bounded case-insensitive title/slug and public author matching over published works only.';
