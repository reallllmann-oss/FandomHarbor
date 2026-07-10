begin;

do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'works',
    'chapters',
    'articles',
    'content_categories',
    'content_tags',
    'work_tags',
    'article_tags'
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

    if pg_catalog.has_any_column_privilege(
      'anon',
      'public.' || v_table,
      'select'
    ) then
      raise exception 'anon unexpectedly has SELECT on public.%', v_table;
    end if;
  end loop;

  if pg_catalog.has_column_privilege(
    'authenticated',
    'public.works',
    'owner_user_id',
    'select'
  ) or pg_catalog.has_column_privilege(
    'authenticated',
    'public.articles',
    'owner_user_id',
    'select'
  ) then
    raise exception 'private content owner identity is readable';
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
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'super@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'author-one@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'author-two@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reader@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'inactive@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp());

insert into public.profiles (user_id)
select id from auth.users where id::text like '20000000-%';

insert into public.memberships (user_id, state, admitted_at)
values
  ('20000000-0000-4000-8000-000000000001', 'active', statement_timestamp()),
  ('20000000-0000-4000-8000-000000000002', 'active', statement_timestamp()),
  ('20000000-0000-4000-8000-000000000003', 'active', statement_timestamp()),
  ('20000000-0000-4000-8000-000000000004', 'active', statement_timestamp()),
  ('20000000-0000-4000-8000-000000000005', 'active', statement_timestamp()),
  ('20000000-0000-4000-8000-000000000006', 'pending', null);

insert into public.role_grants (user_id, role, granted_by, grant_reason)
values
  ('20000000-0000-4000-8000-000000000001', 'super_admin', '20000000-0000-4000-8000-000000000001', 'Content test fixture'),
  ('20000000-0000-4000-8000-000000000002', 'admin', '20000000-0000-4000-8000-000000000001', 'Content test fixture'),
  ('20000000-0000-4000-8000-000000000003', 'author', '20000000-0000-4000-8000-000000000001', 'Content test fixture'),
  ('20000000-0000-4000-8000-000000000004', 'author', '20000000-0000-4000-8000-000000000001', 'Content test fixture');

insert into public.content_tags (
  id, name, slug, tag_type, governance_state
) values (
  '22000000-0000-4000-8000-000000000099',
  'Deprecated Test Tag',
  'deprecated-test-tag',
  'additional',
  'deprecated'
);

insert into public.works (
  id, owner_user_id, category_id, title, slug, summary, status, published_at
) values
  ('23000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', '21000000-0000-4000-8000-000000000001', 'Published One', 'published-one', '', 'published', statement_timestamp()),
  ('23000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', null, 'Draft One', 'draft-one', '', 'draft', null),
  ('23000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000003', null, 'Draft Empty', 'draft-empty', '', 'draft', null),
  ('23000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004', null, 'Published Two', 'published-two', '', 'published', statement_timestamp()),
  ('23000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000004', null, 'Draft Two', 'draft-two', '', 'draft', null);

insert into public.chapters (
  id, work_id, position, title, slug, status, content,
  content_schema_version, published_at
) values
  ('24000000-0000-4000-8000-000000000001', '23000000-0000-4000-8000-000000000001', 1, 'Chapter One', 'chapter-one', 'published', '{"type":"doc","content":[]}'::jsonb, 1, statement_timestamp()),
  ('24000000-0000-4000-8000-000000000002', '23000000-0000-4000-8000-000000000001', 2, 'Draft Chapter', 'draft-chapter', 'draft', '{"type":"doc","content":[]}'::jsonb, 1, null),
  ('24000000-0000-4000-8000-000000000003', '23000000-0000-4000-8000-000000000002', 1, 'Hidden By Parent', 'hidden-by-parent', 'published', '{"type":"doc","content":[]}'::jsonb, 1, statement_timestamp()),
  ('24000000-0000-4000-8000-000000000004', '23000000-0000-4000-8000-000000000004', 1, 'Other Author Draft', 'other-author-draft', 'draft', '{"type":"doc","content":[]}'::jsonb, 1, null);

insert into public.articles (
  id, owner_user_id, category_id, title, slug, summary, status, content,
  content_schema_version, published_at
) values
  ('25000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003', null, 'Published Article', 'published-article', '', 'published', '{"type":"doc","content":[]}'::jsonb, 1, statement_timestamp()),
  ('25000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000004', null, 'Draft Article', 'draft-article', '', 'draft', '{"type":"doc","content":[]}'::jsonb, 1, null);

insert into public.work_tags (work_id, tag_id)
values (
  '23000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000001'
);

insert into public.article_tags (article_id, tag_id)
values (
  '25000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000001'
);

do $$
begin
  begin
    insert into public.works (owner_user_id, title, slug)
    values ('20000000-0000-4000-8000-000000000003', 'Bad Slug', 'Bad Slug');
    raise exception 'invalid slug unexpectedly succeeded';
  exception when check_violation then
    null;
  end;

  begin
    insert into public.works (owner_user_id, title, slug)
    values ('20000000-0000-4000-8000-000000000003', 'Duplicate Slug', 'published-one');
    raise exception 'duplicate work slug unexpectedly succeeded';
  exception when unique_violation then
    null;
  end;

  begin
    insert into public.chapters (
      work_id, position, title, slug, content
    ) values (
      '23000000-0000-4000-8000-000000000001',
      3,
      'Invalid Content',
      'invalid-content',
      '[]'::jsonb
    );
    raise exception 'non-object content unexpectedly succeeded';
  exception when check_violation then
    null;
  end;
end;
$$;

set local role anon;
do $$
begin
  begin
    perform id from public.works limit 1;
    raise exception 'Visitor read content unexpectedly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    update public.chapters
    set content = '{"type":"doc","content":[]}'::jsonb
    where id = '24000000-0000-4000-8000-000000000001';
    raise exception 'Visitor updated chapter content unexpectedly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform *
    from public.create_author_work_draft('Visitor Draft');
    raise exception 'Visitor created a work draft unexpectedly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform * from public.list_my_studio_works(100, 0);
    raise exception 'Visitor called the Studio list unexpectedly';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000006', true);
do $$
begin
  if exists (select id from public.works) then
    raise exception 'inactive member read content unexpectedly';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000005', true);
do $$
declare
  v_rows bigint;
begin
  if exists (select * from public.list_my_studio_works(100, 0)) then
    raise exception 'Reader received Studio works unexpectedly';
  end if;
  if public.get_my_studio_work(
    '23000000-0000-4000-8000-000000000001'
  ) is not null then
    raise exception 'Reader received Studio detail unexpectedly';
  end if;
  if (select count(id) from public.works) <> 2 then
    raise exception 'Reader did not receive exactly the published works';
  end if;
  if (select count(id) from public.chapters) <> 1 then
    raise exception 'Reader chapter visibility ignored chapter/parent publication';
  end if;
  if (select count(id) from public.articles) <> 1 then
    raise exception 'Reader did not receive exactly the published articles';
  end if;
  if (select count(id) from public.content_categories) <> 5 then
    raise exception 'Reader did not receive the five V1 content categories';
  end if;
  if (select count(id) from public.content_tags) <> 10 then
    raise exception 'Reader did not receive the ten active V1 content tags';
  end if;

  begin
    execute 'select owner_user_id from public.works limit 1';
    raise exception 'Reader read private owner identity unexpectedly';
  exception when insufficient_privilege then
    null;
  end;

  begin
    perform *
    from public.create_author_work_draft('Reader Draft');
    raise exception 'Reader created a work draft unexpectedly';
  exception when insufficient_privilege then
    null;
  end;

  update public.chapters
  set content = '{"type":"doc","content":[]}'::jsonb
  where id = '24000000-0000-4000-8000-000000000001';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Reader updated chapter content unexpectedly';
  end if;

  update public.works
  set status = 'published', published_at = statement_timestamp()
  where id = '23000000-0000-4000-8000-000000000002';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Reader published a work unexpectedly';
  end if;

  update public.chapters
  set status = 'published', published_at = statement_timestamp()
  where id = '24000000-0000-4000-8000-000000000004';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Reader published a chapter unexpectedly';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
do $$
declare
  v_created_work_id uuid;
  v_created_status text;
  v_created_published_at timestamptz;
  v_created_chapter_id uuid;
  v_rows bigint;
  v_work_count bigint;
begin
  if (select count(*) from public.list_my_studio_works(100, 0)) <> 3 then
    raise exception 'Studio list did not return exactly the owning Author works';
  end if;
  if public.get_my_studio_work(
    '23000000-0000-4000-8000-000000000002'
  ) is null then
    raise exception 'Studio detail did not return the owning Author draft';
  end if;
  if public.get_my_studio_work(
    '23000000-0000-4000-8000-000000000004'
  ) is not null then
    raise exception 'Studio detail returned another Author work';
  end if;
  if public.get_my_studio_work(
    '23000000-0000-4000-8000-000000000002'
  ) -> 'work' ? 'owner_user_id' then
    raise exception 'Studio detail exposed owner_user_id';
  end if;
  if not exists (
    select id from public.works
    where id = '23000000-0000-4000-8000-000000000002'
  ) then
    raise exception 'owning Author could not read own draft';
  end if;
  if exists (
    select id from public.works
    where id = '23000000-0000-4000-8000-000000000004'
  ) then
    raise exception 'Author read another Author draft';
  end if;

  update public.works
  set title = 'Draft One Updated'
  where id = '23000000-0000-4000-8000-000000000002';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'owning Author could not update own work';
  end if;

  update public.works
  set title = 'Cross-owner Update'
  where id = '23000000-0000-4000-8000-000000000003';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Author updated another Author work';
  end if;

  update public.chapters
  set content = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Updated draft body"}]}]}'::jsonb,
      content_schema_version = 1
  where id = '24000000-0000-4000-8000-000000000003';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'owning Author could not update own draft chapter body';
  end if;
  if (
    select status from public.works
    where id = '23000000-0000-4000-8000-000000000002'
  ) <> 'draft' or (
    select published_at from public.works
    where id = '23000000-0000-4000-8000-000000000002'
  ) is not null then
    raise exception 'saving chapter body unexpectedly published a work';
  end if;

  update public.chapters
  set content = '{"type":"doc","content":[]}'::jsonb
  where id = '24000000-0000-4000-8000-000000000004';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then
    raise exception 'Author updated another Author chapter body';
  end if;

  update public.works
  set status = 'published', published_at = statement_timestamp()
  where id = '23000000-0000-4000-8000-000000000002';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'owning Author could not publish own draft work';
  end if;
  if (
    select status from public.works
    where id = '23000000-0000-4000-8000-000000000002'
  ) <> 'published' or (
    select published_at from public.works
    where id = '23000000-0000-4000-8000-000000000002'
  ) is null then
    raise exception 'draft work publish did not persist lifecycle fields';
  end if;

  insert into public.chapters (
    work_id, position, title, slug, status, content,
    content_schema_version, published_at
  ) values (
    '23000000-0000-4000-8000-000000000005',
    1,
    'Chapter One',
    'chapter-1',
    'published',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Created on first save"}]}]}'::jsonb,
    1,
    statement_timestamp()
  )
  returning id into v_created_chapter_id;

  update public.works
  set status = 'published', published_at = statement_timestamp()
  where id = '23000000-0000-4000-8000-000000000005';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'owning Author could not publish own empty draft work after creating a first chapter';
  end if;

  update public.chapters
  set content = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Updated same chapter"}]}]}'::jsonb,
      content_schema_version = 1,
      status = 'published',
      published_at = statement_timestamp()
  where id = v_created_chapter_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'owning Author could not update the first created draft chapter';
  end if;

  begin
    insert into public.works (owner_user_id, title, slug)
    values ('20000000-0000-4000-8000-000000000004', 'Wrong Owner', 'wrong-owner');
    raise exception 'Author created content for another owner';
  exception when insufficient_privilege then
    null;
  end;

  select created.id, created.status, created.published_at
  into v_created_work_id, v_created_status, v_created_published_at
  from public.create_author_work_draft(
    'RPC Draft',
    'Created atomically',
    '21000000-0000-4000-8000-000000000001',
    array[
      '22000000-0000-4000-8000-000000000001',
      '22000000-0000-4000-8000-000000000002'
    ]::uuid[]
  ) created;

  if v_created_status <> 'draft' or v_created_published_at is not null then
    raise exception 'RPC did not force the draft lifecycle';
  end if;
  if (
    select count(*)
    from public.work_tags
    where work_id = v_created_work_id
  ) <> 2 then
    raise exception 'RPC did not create every work tag atomically';
  end if;

  select count(*) into v_work_count from public.works;
  begin
    perform *
    from public.create_author_work_draft(
      'Invalid Category Draft',
      '',
      '21000000-0000-4000-8000-000000000099',
      '{}'::uuid[]
    );
    raise exception 'RPC accepted an invalid category';
  exception when foreign_key_violation then
    null;
  end;
  if (select count(*) from public.works) <> v_work_count then
    raise exception 'Invalid category left a partial work';
  end if;

  begin
    perform *
    from public.create_author_work_draft(
      'Deprecated Tag Draft',
      '',
      null,
      array['22000000-0000-4000-8000-000000000099']::uuid[]
    );
    raise exception 'RPC accepted a deprecated tag';
  exception when foreign_key_violation then
    null;
  end;
  if (select count(*) from public.works) <> v_work_count then
    raise exception 'Invalid tag left a partial work';
  end if;

  insert into public.content_tags (
    name, slug, tag_type, governance_state
  ) values ('New Pending Tag', 'new-pending-tag', 'additional', 'pending');

  begin
    insert into public.content_tags (
      name, slug, tag_type, governance_state
    ) values ('Author Canonical', 'author-canonical', 'additional', 'canonical');
    raise exception 'Author created a governed canonical tag';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000005', true);
do $$
begin
  if (select count(id) from public.works) <> 4 then
    raise exception 'Reader did not receive the newly published works';
  end if;
  if (select count(id) from public.chapters) <> 3 then
    raise exception 'Reader did not receive the newly published chapters';
  end if;
  if not exists (
    select id from public.works
    where id = '23000000-0000-4000-8000-000000000002'
  ) then
    raise exception 'Reader could not read the newly published draft work';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
do $$
declare
  v_rows bigint;
begin
  if (select count(id) from public.works) <> 6 then
    raise exception 'Admin could not read all works';
  end if;

  update public.works
  set title = 'Admin Moderated Draft'
  where id = '23000000-0000-4000-8000-000000000004';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Admin could not manage another Author work';
  end if;
end;
$$;
reset role;

rollback;
