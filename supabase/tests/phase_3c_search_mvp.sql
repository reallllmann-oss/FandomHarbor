begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('51000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'search-author@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp());

insert into public.profiles (user_id, registration_name)
values ('51000000-0000-4000-8000-000000000001', 'SearchHarborAuthor');

insert into public.memberships (user_id, state, admitted_at)
values ('51000000-0000-4000-8000-000000000001', 'active', statement_timestamp());

insert into public.role_grants (user_id, role, granted_by, grant_reason)
values (
  '51000000-0000-4000-8000-000000000001', 'author',
  '51000000-0000-4000-8000-000000000001', 'Mission 3C-1 search fixture'
);

update public.author_profiles
set slug = 'search-harbor-author', display_name = 'Search Harbor Author',
    bio = 'Writes searchable harbor stories.'
where user_id = '51000000-0000-4000-8000-000000000001';

insert into public.works (
  id, owner_user_id, title, slug, summary, status, published_at
) values
  ('52000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', 'Northern Harbor Light', 'northern-harbor-light', 'Visible search result.', 'published', statement_timestamp()),
  ('52000000-0000-4000-8000-000000000002', '51000000-0000-4000-8000-000000000001', 'Secret Harbor Draft', 'secret-harbor-draft', 'Must stay hidden.', 'draft', null);

set local role anon;
do $$
declare
  v_result jsonb;
begin
  v_result := public.search_public_catalog('HARBOR', 20);
  if jsonb_array_length(v_result -> 'works') <> 1 then
    raise exception 'search did not return exactly one published work';
  end if;
  if v_result -> 'works' -> 0 ->> 'slug' <> 'northern-harbor-light' then
    raise exception 'search returned the wrong work or leaked a draft';
  end if;
  if jsonb_array_length(v_result -> 'authors') <> 1 then
    raise exception 'public author search failed';
  end if;

  v_result := public.search_public_catalog('secret-harbor-draft', 20);
  if jsonb_array_length(v_result -> 'works') <> 0 then
    raise exception 'draft slug leaked into search';
  end if;

  v_result := public.search_public_catalog('northern-harbor-light', 20);
  if jsonb_array_length(v_result -> 'works') <> 1 then
    raise exception 'published work slug search failed';
  end if;

  v_result := public.search_public_catalog('', 20);
  if jsonb_array_length(v_result -> 'works') <> 0
    or jsonb_array_length(v_result -> 'authors') <> 0 then
    raise exception 'blank search returned catalog data';
  end if;
end;
$$;
reset role;

rollback;
