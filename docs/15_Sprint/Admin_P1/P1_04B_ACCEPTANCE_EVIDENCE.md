# Admin P1-04B — Ordinary Membership / Author Role UI Acceptance Evidence

Status: `LOCAL IMPLEMENTATION COMPLETE — COMMIT NOT AUTHORIZED`

Date: 2026-08-20
Baseline: `2750205f2b9a3cce2c09d2e3f5e43ba1b7d421cd`
Branch: `codex/admin-p1-04-ordinary-mutations`
Worktree: `/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-04`

## 1. Implemented surface

`/access` retains P1-03 Search, Detail and Audit and adds only three ordinary
governance intents:

- set ordinary Membership to `active | suspended | revoked`;
- grant Author when the ordinary target has active Membership and no active Author;
- revoke an existing ordinary Author grant.

Elevated accounts remain readable, but render an explanation instead of disabled
or hidden mutation controls. No generic Role selector, Admin/Super Admin operation,
elevated-account Membership operation, invitation flow or Web Admin entry was added.

## 2. Review and confirmation contract

The first Action call validates the operation with the existing Domain parsers,
normalizes reason using NFC/trim and the frozen 4–200 code-point/control-character
rules, obtains a fresh Detail through the P1-02F Service, rejects elevated or
ineligible targets, and compares the page token with the fresh database-issued
expected-state token. Only then does the Action create one non-nil UUID request ID.

The Review shows target registration name and public User ID, current Membership,
current Author state, exact operation/result, ordinary protection, normalized
reason, request ID and expected-state token. A separate confirmation submits the
reviewed command. Cancel performs no mutation. Editing, a new Review, or Conflict
requires a new request ID; an explicit retry after a safe provider failure preserves
the same request ID and full payload.

## 3. Execution and result contract

The Action calls only the P1-02F Governance Service. The Service repeats the live
Session, active Membership, current Admin/Super Admin and `admin:operate` checks,
then performs its ordinary-target read precheck and invokes at most one strict
Repository write Port. The database remains authoritative for target races,
expected-state, idempotency, Ledger and Audit atomicity.

- `Saved`: one business change, one Ledger and exactly one Audit; Detail/Audit refresh.
- `Unchanged`: zero business change and zero business Audit; Detail/Audit refresh.
- `Conflict`: current Membership/Author snapshot and token are retained for display;
  the old Review/confirmation becomes non-executable and the UI requires refresh and
  a new Review. There is no automatic retry or overwrite.
- safe provider failure: fixed message only; explicit retry uses the same request ID.
- auth, permission, invalid input/reason, mismatch, unavailable and unknown failures
  remain distinct safe codes without provider detail leakage.

The UI never accepts actor, capability, arbitrary Role, proof/reauth boolean or a
user-entered request ID. It has no direct Supabase table/RPC access and follows
Page → Action → Service → strict Repository → ordinary v2 RPC.

## 4. Security boundaries

- P1-04A ACL remains: legacy writes `0/12`; ordinary v2 writes authenticated-only
  `3/12`; private helpers/executor `0/36`; reads authenticated-only `3/12`.
- No Migration, RPC, RLS, Grant, Trigger, Auth, schema, dependency, config or
  lockfile changed.
- KI-033 remains technically unresolved and `ACCEPTED DEFERRED BOUNDARY`.
- Admin/Super Admin Role and elevated-account Membership mutations remain deferred.
- Admin Production remains `paused=true`; Web Admin entry remains closed; P0 Site
  Copy authority remains Version 7.

## 5. Local validation

- P1-04B Action/UI plus P1-03 data regression: 4 files / 28 tests PASS.
- P1-02F Governance Service targeted: 1 file / 57 tests PASS.
- Admin: 9 files / 82 tests PASS; Services: 11 files / 180 tests PASS;
  Database/Repository: 14 files / 142 tests PASS.
- Workspace TypeScript, ESLint, Prettier and Admin production build: PASS.
- Six relevant local SQL suites, including cutover rollback and requestId/concurrency
  regression: PASS. Final ACL matrix is old `0/12`, v2 `3/12`, private `0/36`,
  read `3/12`.
- `git diff --check`, internal links, sensitive-information, provider-boundary and
  exact-scope scans: PASS.

All database checks used local Supabase only. No Commit, Push, PR, remote Migration,
SQL/write, Production login, Admin Unpause or Deployment occurred. P1-05 and P1.1
were not started. P1 ordinary governance implementation is ready for Product Owner
review; any Closure Commit, dedicated non-Production QA or release work requires a
separate authorization.
