# Fandom Harbor V1 — B2-FIX-01 Registration Attempt State Acceptance

**Date:** 2026-10-17

**Issue:** GitHub #8

**Environment:** local isolated worktree, local Supabase, and isolated Hosted Preview `bniqsjnjqesnpcfkpqcz`

**Status:** PASS — LOCAL + HOSTED MIGRATION / WEB NOT DEPLOYED

## Confirmed defect

The Web registration action passed an existing `fh_registration_attempt` cookie into the registration broker. The broker treated `activated` as resumable, looked up the old Auth user, called the signup `/resend` endpoint, and converted an HTTP 2xx response into the unconditional UI claim that a verification code had been sent. A new Registration Attempt or Auth user was not created for the submitted registration.

## Accepted local fix

- Fresh registration and attempt resumption are separate server operations.
- A fresh registration never passes a browser attempt handle into the prepare RPC.
- Resumption uses a new service-role-only RPC that binds the cookie proof to the current normalized email, registration name, invitation hash, expected/current Auth UID, pending Membership and live Reservation.
- Only `auth_created` is resumable. `verified_pending`, `activated`, `blocked`, `released`, `expired`, unknown proof, revoked/exhausted invitation, confirmed user and banned user fail closed.
- Resumption never calls `/auth/v1/resend`; only the explicit resend action and the initial confirmation request for a newly created identity can do so.
- A transient resume-RPC/Auth-Admin failure preserves the cookie and returns service-unavailable rather than discarding a potentially valid pending attempt.
- Invalid or terminal cookies are deleted with the same host-only `/auth` path used at creation. Server validation remains authoritative even if a historical cookie remains in the browser.
- HTTP 2xx from `/resend` is represented as `confirmation_request_accepted`, not proof of provider acceptance or inbox delivery.
- The verification page uses neutral anti-enumeration wording and provides sign-in and password-recovery links.

## Database change

Migration: `20261016165027_tighten_registration_attempt_resume_context.sql`

The migration replaces the existing read-only attempt-context function with a fail-closed `auth_created` projection and adds `registration_resume_context(text,text,text,text)` for exact form binding. Both functions are `STABLE SECURITY DEFINER`, use an empty `search_path`, and grant EXECUTE only to `service_role` (besides the owner). The migration creates no tables, triggers, bypass records, roles or data; it contains no Sponsor Commissioning facility.

The original 24 migrations are unchanged. The local and Hosted Preview migration histories are both 25/25. Migration 25 was applied to the isolated Preview through the linked Supabase migration workflow only after the CLI dry-run showed it as the sole pending migration.

## Evidence

- Previously completed targeted Web suite: 43 tests PASS.
- Previously completed database migration contract suite: 18 tests PASS.
- Incremental outage-preservation tests added after that run: 2 focused tests PASS; unaffected tests were skipped rather than rerun.
- Updated Migration exact-match/service-only contract: 1 focused test PASS; the other 17 contract tests were not rerun.
- PostgreSQL attempt-state test: PASS.
- B2 server boundary test: PASS.
- SECURITY DEFINER ACL catalog check: PASS.
- TypeScript: PASS.
- ESLint: PASS (only the existing workspace-root/pages advisory was emitted).
- Web production build: PASS.
- Local Supabase database lint at error level: PASS, zero findings.
- Hosted Preview migration history: PASS, 25/25, latest version `20261016165027`.
- Hosted Preview RPC catalog: PASS. Both functions are `SECURITY DEFINER`, owned by `postgres`, use an empty `search_path`, deny EXECUTE to PUBLIC/anon/authenticated and grant EXECUTE only to `service_role` besides the owner.
- Hosted Preview compatibility snapshot: PASS. Registration Mode remained `legacy`; Auth user, Session, Membership, Invitation, Redemption, Registration Attempt and active Reservation counts were unchanged by the migration.

## Deployment state and Stop Gate

- Hosted Preview migration 25: **PASS — APPLIED (25/25)**.
- Fixed Web Preview: **NOT DEPLOYED**.
- F2-R3 registration OTP resend: **NOT RUN**.
- F2-R3 Secure Email Change: **NOT RUN**.
- Production: **ZERO CHANGES**.

Before deployment, revalidate Web and Admin Preview environment isolation and protection, then apply migration 25 to Preview before deploying the matching Web code. If the migration fails, do not deploy the Web code. If the Web deployment fails, keep F2-R3 stopped and do not create a new invitation or send email.
