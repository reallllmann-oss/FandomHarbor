begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('31000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'social-author@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('31000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'social-reader@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('31000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'social-invitee@example.test', '', statement_timestamp(), '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp());

insert into public.profiles (user_id, registration_name) values
  ('31000000-0000-4000-8000-000000000001', 'SocialAuthor'),
  ('31000000-0000-4000-8000-000000000002', 'SocialReader'),
  ('31000000-0000-4000-8000-000000000003', 'SocialInvitee');

insert into public.memberships (user_id, state, admitted_at) values
  ('31000000-0000-4000-8000-000000000001', 'active', statement_timestamp()),
  ('31000000-0000-4000-8000-000000000002', 'active', statement_timestamp()),
  ('31000000-0000-4000-8000-000000000003', 'active', statement_timestamp());

insert into public.role_grants (user_id, role, granted_by, grant_reason)
values (
  '31000000-0000-4000-8000-000000000001', 'author',
  '31000000-0000-4000-8000-000000000001', 'Mission 3B test fixture'
);

update public.author_profiles
set slug = 'social-author', display_name = 'Social Author', bio = 'Harbor stories.'
where user_id = '31000000-0000-4000-8000-000000000001';

insert into public.works (
  id, owner_user_id, title, slug, summary, status, published_at
) values
  ('32000000-0000-4000-8000-000000000001', '31000000-0000-4000-8000-000000000001', 'Visible Work', 'social-visible-work', 'Visible', 'published', statement_timestamp()),
  ('32000000-0000-4000-8000-000000000002', '31000000-0000-4000-8000-000000000001', 'Hidden Draft', 'social-hidden-draft', 'Hidden', 'draft', null);

insert into public.invitations (
  id, code_hash, inviter_user_id, max_uses, expires_at, use_count
) values (
  '33000000-0000-4000-8000-000000000001', repeat('a', 64),
  '31000000-0000-4000-8000-000000000002', 1,
  statement_timestamp() + interval '1 day', 1
);

insert into public.invitation_redemptions (invitation_id, user_id)
values (
  '33000000-0000-4000-8000-000000000001',
  '31000000-0000-4000-8000-000000000003'
);

set local role anon;
do $$
declare
  v_profile jsonb;
  v_public_author record;
begin
  v_profile := public.get_public_author_profile('social-author');
  if v_profile ->> 'display_name' <> 'Social Author' then
    raise exception 'anonymous author profile read failed';
  end if;
  if jsonb_array_length(v_profile -> 'works') <> 1
    or v_profile -> 'works' -> 0 ->> 'title' <> 'Visible Work' then
    raise exception 'public profile leaked a draft or omitted published work';
  end if;

  select * into v_public_author
  from public.get_published_work_authors(
    array['social-visible-work', 'social-hidden-draft']
  );
  if v_public_author.work_slug <> 'social-visible-work'
    or v_public_author.author_slug <> 'social-author'
    or v_public_author.display_name <> 'Social Author' then
    raise exception 'public work author mapping is incorrect';
  end if;
  if (select count(*) from public.get_published_work_authors(
    array['social-visible-work', 'social-hidden-draft']
  )) <> 1 then
    raise exception 'public work author mapping leaked a draft';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '31000000-0000-4000-8000-000000000002', true);
do $$
declare
  v_state jsonb;
  v_relationships jsonb;
begin
  v_state := public.follow_author('31000000-0000-4000-8000-000000000001');
  v_state := public.follow_author('31000000-0000-4000-8000-000000000001');
  if (v_state ->> 'follower_count')::integer <> 1 then
    raise exception 'duplicate follow changed follower count';
  end if;

  v_relationships := public.get_my_invitation_relationships();
  if (v_relationships ->> 'direct_invitee_count')::integer <> 1 then
    raise exception 'invitation relationship count is inconsistent';
  end if;

  v_state := public.unfollow_author('31000000-0000-4000-8000-000000000001');
  v_state := public.unfollow_author('31000000-0000-4000-8000-000000000001');
  if (v_state ->> 'follower_count')::integer <> 0 then
    raise exception 'idempotent unfollow left an inconsistent count';
  end if;
end;
$$;
reset role;

rollback;
