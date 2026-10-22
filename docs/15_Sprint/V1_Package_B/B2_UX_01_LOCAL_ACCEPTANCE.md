# Fandom Harbor V1 — B2-UX-01 Local Acceptance

**Date:** 2026-10-17
**Branch:** `codex/v1-package-b0-auth-architecture`
**Baseline HEAD:** `02dad783bb75f46422dedd3ca258efef4884af08`
**Status:** PASS — LOCAL / PREVIEW NOT DEPLOYED

## Scope

This local-only change addresses the two feedback defects retained in GitHub
Issue #8 after the F2-R3 Hosted Auth acceptance. It does not change the
registration state machine, Registration Attempt cookies, invitation
Reservation, OTP validity, resend cooldown, database schema, Hosted Auth
configuration, or any remote environment.

## UX-01 — registration OTP resend feedback

Root cause: `resendRegistrationOtp()` redirected to
`confirmation_request_accepted`, but `/auth/verify-email` did not render that
status. The Auth request and second message could succeed while the page showed
no feedback.

The verification page now renders an accessible `role="status"` message that
says only that the request was accepted and asks the user to inspect the inbox
and spam folder. It does not claim that a message was sent or delivered, does
not disclose account state, and does not trigger another resend.

Existing handling for pending verification, deferred delivery, cooldown,
expired attempts and errors remains unchanged. Failures continue to use
`role="alert"`.

## UX-02 — secure email-change confirmation feedback

Root cause: both successful `verifyOtp({ type: "email_change" })` calls used the
same `email-confirmed` redirect. The page therefore could not distinguish the
first-side confirmation from the completed email change.

The server action now:

1. reads the authenticated user before verification;
2. verifies the submitted email-change OTP;
3. accepts the current `auth-js` contract in which the first secure-email-change
   confirmation may return no user or session;
4. rejects an explicitly returned different Auth UID;
5. reads the trusted current Auth user again; and
6. reports final success only when the same UID's actual Auth email changed.

An unchanged email produces the first-side pending message. A changed email
produces the final-success message. Missing, failed or inconsistent trusted
Auth state produces a conservative unknown-state message and never fabricates
final success. No form field, URL parameter, user metadata, Admin API or
service-role lookup determines the result.

The initial email-change request message now says that the request was accepted
and conditionally describes expected delivery; it no longer claims that the
messages were sent.

## Verification

- Focused Vitest run: 3 files, 31 tests PASS.
- New defect-specific coverage: 8 tests PASS.
- Web unit suite (invoked once through the package script): 29 files,
  159 tests PASS.
- TypeScript: PASS.
- ESLint: PASS.
- Production Web build: PASS.
- `git diff --check`: PASS.
- Local secret-pattern and QA-file scan: PASS; no OTP, password, session token,
  SMTP/API key, invitation plaintext, or transport proof added.

The current Supabase documentation and the installed `auth-js 2.108.2`
response transformer were checked. The installed transformer explicitly treats
the first secure-email-change confirmation's message-only response as a null
user/session response, which is covered by the local action test.

## Preserved security contracts

- B2-FIX-01 terminal-attempt and cookie protections are unchanged.
- Registration resend remains explicit and subject to the existing 60-second
  cooldown.
- OTP validity remains 15 minutes.
- Invitation Reservation remains capped at 2 hours and is not extended.
- Auth UID, Session, Membership, Identity, Redemption and invitation
  consumption logic is unchanged.
- No migration or database contract was added or modified.
- The eight pre-existing untracked QA/acceptance files remain preserved.

## Remaining gates

- Hosted Preview deployment of B2-UX-01: NOT DEPLOYED.
- Hosted registration resend feedback regression: NOT RUN for this change.
- Hosted two-side email-change feedback regression: NOT RUN for this change.
- GitHub Issue #8 remains OPEN until a separately authorized protected Preview
  push/deployment and focused Hosted verification complete.
- No commit, push, merge or deployment was performed.
