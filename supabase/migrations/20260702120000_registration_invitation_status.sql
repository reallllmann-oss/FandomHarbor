create or replace function public.registration_invitation_status(
  p_code_hash text
)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_code_hash is null
      or p_code_hash !~ '^[0-9a-f]{64}$'
      then 'invalid'
    else coalesce(
      (
        select case
          when i.revoked_at is not null then 'revoked'
          when i.expires_at <= statement_timestamp() then 'expired'
          when i.use_count >= i.max_uses then 'exhausted'
          else 'valid'
        end
        from public.invitations i
        where i.code_hash = p_code_hash
      ),
      'invalid'
    )
  end;
$$;

create or replace function public.validate_registration_invitation(
  p_code_hash text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.registration_invitation_status(p_code_hash) = 'valid';
$$;

revoke all on function public.registration_invitation_status(text) from public;
grant execute on function public.registration_invitation_status(text)
  to anon, authenticated;

