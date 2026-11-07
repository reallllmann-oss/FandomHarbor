-- New hosted projects may assign direct EXECUTE grants to API roles when a
-- public function is created. Earlier migrations revoked PUBLIC but did not
-- remove those direct anon grants. Keep the seven intentional public read and
-- invitation-preflight RPCs unchanged, and close only authenticated workflows.

revoke execute on function public.create_invitation(
  text,
  integer,
  timestamp with time zone
) from public, anon;
revoke execute on function public.redeem_invitation(text)
  from public, anon;
revoke execute on function public.revoke_invitation(uuid, text)
  from public, anon;

revoke execute on function public.follow_author(uuid)
  from public, anon;
revoke execute on function public.unfollow_author(uuid)
  from public, anon;
revoke execute on function public.get_my_invitation_relationships()
  from public, anon;

revoke execute on function public.get_admin_site_copy()
  from public, anon;
revoke execute on function public.save_site_copy(
  bigint,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public, anon;

grant execute on function public.create_invitation(
  text,
  integer,
  timestamp with time zone
) to authenticated;
grant execute on function public.redeem_invitation(text)
  to authenticated;
grant execute on function public.revoke_invitation(uuid, text)
  to authenticated;
grant execute on function public.follow_author(uuid)
  to authenticated;
grant execute on function public.unfollow_author(uuid)
  to authenticated;
grant execute on function public.get_my_invitation_relationships()
  to authenticated;
grant execute on function public.get_admin_site_copy()
  to authenticated;
grant execute on function public.save_site_copy(
  bigint,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
