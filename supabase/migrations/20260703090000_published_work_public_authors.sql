create or replace function public.get_published_work_authors(p_work_slugs text[])
returns table (
  work_slug text,
  author_slug text,
  display_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select w.slug, ap.slug, ap.display_name
  from public.works w
  join public.author_profiles ap on ap.user_id = w.owner_user_id
  where w.status = 'published'
    and w.slug = any(coalesce(p_work_slugs, array[]::text[]))
    and exists (
      select 1
      from public.role_grants rg
      join public.memberships m on m.user_id = rg.user_id
      where rg.user_id = ap.user_id
        and rg.role = 'author'
        and rg.revoked_at is null
        and m.state = 'active'
    )
  order by w.slug;
$$;

revoke all on function public.get_published_work_authors(text[]) from public;
grant execute on function public.get_published_work_authors(text[]) to anon, authenticated;

comment on function public.get_published_work_authors(text[]) is
  'Returns only public author display fields for published works owned by active Authors.';
