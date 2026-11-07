-- Package B2: server-only registration context, login-name resolution, and
-- privacy-preserving fixed-window rate limits. These helpers expose no new
-- capability to anon/authenticated callers and keep the B1 registration mode
-- switch as the sole operator-controlled rollout gate.

create unique index registration_attempts_proof_hash_unique
  on private.registration_attempts (proof_hash);

create table private.auth_rate_limits (
  scope text not null,
  subject_hash text not null check (subject_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  attempts integer not null check (attempts > 0),
  updated_at timestamptz not null default statement_timestamp(),
  primary key (scope, subject_hash),
  constraint auth_rate_limit_scope check (
    char_length(scope) between 1 and 64
    and scope ~ '^[a-z0-9_.-]+$'
  )
);

alter table private.auth_rate_limits enable row level security;
revoke all on private.auth_rate_limits from public, anon, authenticated;

create or replace function public.get_registration_mode()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_registration_mode();
$$;

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
    case
      when ra.status in ('prepared', 'auth_created')
        and ra.expires_at <= statement_timestamp() then 'expired'
      else ra.status
    end,
    ra.expected_auth_user_id,
    ra.auth_user_id,
    ra.proof_expires_at,
    ra.expires_at
  from private.registration_attempts ra
  where ra.proof_hash = private.registration_proof_hash(p_attempt_proof);
$$;

create or replace function public.resolve_login_name_user_id(
  p_registration_name text
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select lnc.user_id
  from private.login_name_claims lnc
  where lnc.login_name_key =
    private.canonical_registration_name(p_registration_name)
    and lnc.user_id is not null;
$$;

create or replace function public.consume_auth_rate_limit(
  p_scope text,
  p_subject_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := statement_timestamp();
  v_attempts integer;
begin
  if p_scope is null
    or char_length(p_scope) not between 1 and 64
    or p_scope !~ '^[a-z0-9_.-]+$'
    or p_subject_hash is null
    or p_subject_hash !~ '^[0-9a-f]{64}$'
    or p_limit not between 1 and 1000
    or p_window_seconds not between 1 and 86400 then
    raise exception using errcode = '22023', message = 'invalid rate limit request';
  end if;

  insert into private.auth_rate_limits (
    scope,
    subject_hash,
    window_started_at,
    attempts,
    updated_at
  ) values (
    p_scope,
    p_subject_hash,
    v_now,
    1,
    v_now
  )
  on conflict (scope, subject_hash) do update
  set window_started_at = case
        when private.auth_rate_limits.window_started_at
          + pg_catalog.make_interval(secs => p_window_seconds) <= v_now
          then v_now
        else private.auth_rate_limits.window_started_at
      end,
      attempts = case
        when private.auth_rate_limits.window_started_at
          + pg_catalog.make_interval(secs => p_window_seconds) <= v_now
          then 1
        else private.auth_rate_limits.attempts + 1
      end,
      updated_at = v_now
  returning attempts into v_attempts;

  return v_attempts <= p_limit;
end;
$$;

revoke all on function public.get_registration_mode()
  from public, anon, authenticated;
revoke all on function public.registration_context_by_proof(text)
  from public, anon, authenticated;
revoke all on function public.resolve_login_name_user_id(text)
  from public, anon, authenticated;
revoke all on function public.consume_auth_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.get_registration_mode()
  to service_role;
grant execute on function public.registration_context_by_proof(text)
  to service_role;
grant execute on function public.resolve_login_name_user_id(text)
  to service_role;
grant execute on function public.consume_auth_rate_limit(text, text, integer, integer)
  to service_role;

comment on table private.auth_rate_limits is
  'B2 server-only fixed-window counters keyed by application-HMAC values; never stores raw IP, email, registration name, or invitation data.';
comment on function public.registration_context_by_proof(text) is
  'Server-only resolver for the opaque B1 attempt cookie. Never grant to browser roles.';
comment on function public.resolve_login_name_user_id(text) is
  'Server-only login-name resolver; the browser must never receive the UID result.';
