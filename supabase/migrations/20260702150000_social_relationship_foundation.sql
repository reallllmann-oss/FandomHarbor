create table public.author_profiles (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  bio text not null default '',
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint author_profiles_slug_valid check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 80
  ),
  constraint author_profiles_display_name_valid check (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 80
    and display_name !~ '[[:cntrl:]]'
  ),
  constraint author_profiles_bio_valid check (char_length(bio) <= 500)
);

create table public.author_follows (
  follower_user_id uuid not null references public.profiles (user_id) on delete cascade,
  author_user_id uuid not null references public.author_profiles (user_id) on delete cascade,
  created_at timestamptz not null default statement_timestamp(),
  primary key (follower_user_id, author_user_id),
  constraint author_follows_not_self check (follower_user_id <> author_user_id)
);

create index author_follows_author_time
  on public.author_follows (author_user_id, created_at desc);

create or replace function private.ensure_author_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  if new.role <> 'author' or new.revoked_at is not null then
    return new;
  end if;

  select nullif(btrim(p.registration_name), '') into v_name
  from public.profiles p
  where p.user_id = new.user_id;

  insert into public.author_profiles (user_id, slug, display_name)
  values (
    new.user_id,
    'author-' || replace(new.user_id::text, '-', ''),
    coalesce(v_name, 'Author ' || substr(new.user_id::text, 1, 8))
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger role_grants_ensure_author_profile
after insert or update of revoked_at on public.role_grants
for each row execute function private.ensure_author_profile();

insert into public.author_profiles (user_id, slug, display_name)
select
  rg.user_id,
  'author-' || replace(rg.user_id::text, '-', ''),
  coalesce(
    nullif(btrim(p.registration_name), ''),
    'Author ' || substr(rg.user_id::text, 1, 8)
  )
from public.role_grants rg
join public.profiles p on p.user_id = rg.user_id
where rg.role = 'author' and rg.revoked_at is null
on conflict (user_id) do nothing;

create or replace function public.get_public_author_profile(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'user_id', ap.user_id,
    'slug', ap.slug,
    'display_name', ap.display_name,
    'bio', ap.bio,
    'published_work_count', (
      select count(*) from public.works w
      where w.owner_user_id = ap.user_id and w.status = 'published'
    ),
    'follower_count', (
      select count(*) from public.author_follows af
      where af.author_user_id = ap.user_id
    ),
    'following_count', (
      select count(*) from public.author_follows af
      where af.follower_user_id = ap.user_id
    ),
    'is_following', coalesce((
      select true from public.author_follows af
      where af.follower_user_id = auth.uid() and af.author_user_id = ap.user_id
    ), false),
    'works', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', w.id,
        'slug', w.slug,
        'title', w.title,
        'summary', w.summary,
        'published_at', w.published_at
      ) order by w.published_at desc, w.id)
      from public.works w
      where w.owner_user_id = ap.user_id and w.status = 'published'
    ), '[]'::jsonb)
  )
  from public.author_profiles ap
  where ap.slug = p_slug
    and exists (
      select 1 from public.role_grants rg
      join public.memberships m on m.user_id = rg.user_id
      where rg.user_id = ap.user_id
        and rg.role = 'author'
        and rg.revoked_at is null
        and m.state = 'active'
    );
$$;

create or replace function public.follow_author(p_author_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;
  if not private.is_active_member(v_actor) then
    raise exception using errcode = '42501', message = 'active membership required';
  end if;
  if v_actor = p_author_user_id then
    raise exception using errcode = '22023', message = 'authors cannot follow themselves';
  end if;
  if not exists (
    select 1 from public.author_profiles ap
    join public.role_grants rg on rg.user_id = ap.user_id
    join public.memberships m on m.user_id = ap.user_id
    where ap.user_id = p_author_user_id
      and rg.role = 'author' and rg.revoked_at is null and m.state = 'active'
  ) then
    raise exception using errcode = 'P0002', message = 'author not found';
  end if;

  insert into public.author_follows (follower_user_id, author_user_id)
  values (v_actor, p_author_user_id)
  on conflict do nothing;

  return jsonb_build_object(
    'is_following', true,
    'follower_count', (select count(*) from public.author_follows where author_user_id = p_author_user_id)
  );
end;
$$;

create or replace function public.unfollow_author(p_author_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'authentication required';
  end if;
  if not private.is_active_member(v_actor) then
    raise exception using errcode = '42501', message = 'active membership required';
  end if;

  delete from public.author_follows
  where follower_user_id = v_actor and author_user_id = p_author_user_id;

  return jsonb_build_object(
    'is_following', false,
    'follower_count', (select count(*) from public.author_follows where author_user_id = p_author_user_id)
  );
end;
$$;

create or replace function public.get_my_invitation_relationships()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when auth.uid() is null then null else jsonb_build_object(
    'inviter_user_id', (
      select i.inviter_user_id
      from public.invitation_redemptions ir
      join public.invitations i on i.id = ir.invitation_id
      where ir.user_id = auth.uid()
      limit 1
    ),
    'direct_invitee_count', (
      select count(*)
      from public.invitations i
      join public.invitation_redemptions ir on ir.invitation_id = i.id
      where i.inviter_user_id = auth.uid()
    ),
    'direct_invitees', coalesce((
      select jsonb_agg(jsonb_build_object(
        'invitee_user_id', ir.user_id,
        'invitation_id', i.id,
        'redeemed_at', ir.redeemed_at
      ) order by ir.redeemed_at desc)
      from public.invitations i
      join public.invitation_redemptions ir on ir.invitation_id = i.id
      where i.inviter_user_id = auth.uid()
    ), '[]'::jsonb)
  ) end;
$$;

alter table public.author_profiles enable row level security;
alter table public.author_follows enable row level security;

revoke all on public.author_profiles from anon, authenticated;
revoke all on public.author_follows from anon, authenticated;
revoke all on function private.ensure_author_profile() from public, anon, authenticated;

revoke all on function public.get_public_author_profile(text) from public;
revoke all on function public.follow_author(uuid) from public;
revoke all on function public.unfollow_author(uuid) from public;
revoke all on function public.get_my_invitation_relationships() from public;

grant execute on function public.get_public_author_profile(text) to anon, authenticated;
grant execute on function public.follow_author(uuid) to authenticated;
grant execute on function public.unfollow_author(uuid) to authenticated;
grant execute on function public.get_my_invitation_relationships() to authenticated;

comment on table public.author_profiles is
  'Public author identity, intentionally separated from private registration identity.';
comment on table public.author_follows is
  'Idempotent one-way Reader-to-Author relationship; direct table access remains closed.';
