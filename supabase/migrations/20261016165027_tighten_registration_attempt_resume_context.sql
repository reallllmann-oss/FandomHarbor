-- B2-FIX-01: a registration attempt cookie is only a pointer to server-owned
-- state.  It must never make a terminal or differently-bound attempt resumable.

create or replace function public.registration_context_by_proof(
  p_attempt_proof text
)
returns table (
  attempt_id uuid,
  attempt_status text,
  expected_auth_user_id uuid,
  auth_user_id uuid,
  proof_expires_at timestamptz,
  reservation_expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    ra.id,
    ra.status,
    ra.expected_auth_user_id,
    ra.auth_user_id,
    ra.proof_expires_at,
    ir.expires_at
  from private.registration_attempts ra
  join private.invitation_reservations ir
    on ir.attempt_id = ra.id
  join public.invitations i
    on i.id = ra.invitation_id
  join auth.users u
    on u.id = ra.auth_user_id
  join public.memberships m
    on m.user_id = ra.auth_user_id
  join private.login_name_claims lnc
    on lnc.user_id = ra.auth_user_id
  where ra.proof_hash = private.registration_proof_hash(p_attempt_proof)
    and ra.status = 'auth_created'
    and ra.proof_consumed_at is not null
    and ra.auth_user_id = ra.expected_auth_user_id
    and ra.expires_at > statement_timestamp()
    and ir.status = 'reserved'
    and ir.auth_user_id = ra.auth_user_id
    and ir.expires_at = ra.expires_at
    and ir.expires_at > statement_timestamp()
    and i.revoked_at is null
    and i.expires_at > statement_timestamp()
    and i.use_count < i.max_uses
    and u.email_confirmed_at is null
    and u.confirmed_at is null
    and (u.banned_until is null or u.banned_until <= statement_timestamp())
    and ra.auth_email_binding_hash =
      private.registration_auth_email_binding_hash(u.email, u.id)
    and m.state = 'pending'
    and lnc.attempt_id is null
    and lnc.login_name_key = ra.login_name_key
    and not exists (
      select 1
      from public.invitation_redemptions redemption
      where redemption.user_id = ra.auth_user_id
    )
    and exists (
      select 1
      from auth.identities identity
      where identity.user_id = ra.auth_user_id
        and identity.provider = 'email'
    );
$$;

create or replace function public.registration_resume_context(
  p_attempt_proof text,
  p_email text,
  p_registration_name text,
  p_code_hash text
)
returns table (
  attempt_id uuid,
  attempt_status text,
  expected_auth_user_id uuid,
  auth_user_id uuid,
  proof_expires_at timestamptz,
  reservation_expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select context.*
  from public.registration_context_by_proof(p_attempt_proof) context
  join private.registration_attempts ra
    on ra.id = context.attempt_id
  join public.invitations i
    on i.id = ra.invitation_id
  where ra.email_binding_hash =
      private.registration_email_binding_hash(p_email, p_attempt_proof)
    and ra.login_name_key =
      private.canonical_registration_name(p_registration_name)
    and p_code_hash ~ '^[0-9a-f]{64}$'
    and i.code_hash = p_code_hash;
$$;

revoke all on function public.registration_context_by_proof(text)
  from public, anon, authenticated, service_role;
revoke all on function public.registration_resume_context(text, text, text, text)
  from public, anon, authenticated, service_role;

grant execute on function public.registration_context_by_proof(text)
  to service_role;
grant execute on function public.registration_resume_context(text, text, text, text)
  to service_role;

comment on function public.registration_context_by_proof(text) is
  'Returns only an unconfirmed, unbanned, non-terminal email-registration attempt with an active reservation. Server-only.';
comment on function public.registration_resume_context(text, text, text, text) is
  'Matches a pending attempt to the current server-validated email, registration name, and invitation before resuming it. Server-only.';
