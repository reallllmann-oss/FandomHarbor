begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('61000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'browse-author@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp());

insert into public.profiles (user_id, registration_name)
values ('61000000-0000-4000-8000-000000000001', 'BrowseHarborAuthor');

insert into public.memberships (user_id, state, admitted_at)
values ('61000000-0000-4000-8000-000000000001', 'active', statement_timestamp());

insert into public.role_grants (user_id, role, granted_by, grant_reason)
values (
  '61000000-0000-4000-8000-000000000001', 'author',
  '61000000-0000-4000-8000-000000000001', 'Mission 3C-2 browse fixture'
);

update public.author_profiles
set slug = 'browse-harbor-author', display_name = 'Browse Harbor Author'
where user_id = '61000000-0000-4000-8000-000000000001';

insert into public.works (
  id, owner_user_id, title, slug, summary, status, created_at, published_at
) values
  ('62000000-0000-4000-8000-000000000001', '61000000-0000-4000-8000-000000000001', 'Alpha Harbor', 'alpha-harbor', 'Older published work.', 'published', statement_timestamp() - interval '3 days', statement_timestamp() - interval '2 days'),
  ('62000000-0000-4000-8000-000000000002', '61000000-0000-4000-8000-000000000001', 'Zeta Harbor', 'zeta-harbor', 'Newer published work.', 'published', statement_timestamp() - interval '2 days', statement_timestamp() - interval '1 day'),
  ('62000000-0000-4000-8000-000000000003', '61000000-0000-4000-8000-000000000001', 'Hidden Browse Draft', 'hidden-browse-draft', 'Must stay hidden.', 'draft', statement_timestamp(), null);

set local role anon;
do $$
declare
  v_result jsonb;
begin
  v_result := public.browse_public_works(1, 0, 'newest');
  if (v_result ->> 'total')::integer <> 2
    or jsonb_array_length(v_result -> 'items') <> 1
    or v_result -> 'items' -> 0 ->> 'slug' <> 'zeta-harbor' then
    raise exception 'newest browse page is incorrect';
  end if;

  v_result := public.browse_public_works(1, 1, 'newest');
  if v_result -> 'items' -> 0 ->> 'slug' <> 'alpha-harbor' then
    raise exception 'browse pagination is unstable';
  end if;

  v_result := public.browse_public_works(2, 0, 'oldest');
  if v_result -> 'items' -> 0 ->> 'slug' <> 'alpha-harbor' then
    raise exception 'oldest sort is incorrect';
  end if;

  v_result := public.browse_public_works(2, 0, 'title-desc');
  if v_result -> 'items' -> 0 ->> 'slug' <> 'zeta-harbor' then
    raise exception 'title descending sort is incorrect';
  end if;

  if (v_result -> 'items')::text like '%hidden-browse-draft%' then
    raise exception 'draft leaked into browse results';
  end if;
end;
$$;
reset role;

rollback;
