# Admin P1-04A — Ordinary Write RPC Atomic Cutover Acceptance Evidence

Status: `LOCAL IMPLEMENTATION COMPLETE — COMMIT NOT AUTHORIZED`

Date: 2026-08-19
Baseline: `9caac4a9affbd3ea9d13cbae266696f9c853490e`
Branch: `codex/admin-p1-04-ordinary-mutations`
Worktree: `/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-04`
Migration: `20260819225318_admin_p1_identity_access_cutover.sql`

## 1. Blocker origin and accepted scope

P1-04 application wiring was blocked because all three ordinary v2 write RPCs were
execute-closed while three legacy Membership/Role RPCs remained executable by
`authenticated`. The frozen P1-02G contract prohibits an old/new dual-entry window
and requires one atomic revoke-old/prove-deny/grant-v2 gate. Product Owner therefore
authorized P1-04A only for the local Migration, ACL tests, rollback rehearsal and
documentation. No UI, Action, Service, Repository, Domain, Auth or remote change is
included.

Exact legacy RPCs:

- `grant_role(uuid,elevated_role,text)`
- `revoke_role(uuid,elevated_role,text)`
- `set_membership_state(uuid,membership_state,text)`

Exact ordinary v2 RPCs:

- `grant_author_role_v2(uuid,uuid,text,text)`
- `revoke_author_role_v2(uuid,uuid,text,text)`
- `set_ordinary_membership_state_v2(uuid,uuid,membership_state,text,text)`

## 2. ACL before and after

| Function set | PUBLIC before/after | anon before/after | authenticated before/after | service_role before/after |
| ------------ | ------------------- | ----------------- | -------------------------- | ------------------------- |
| Legacy three | false / false       | false / false     | true / false               | false / false             |
| v2 three     | false / false       | false / false     | false / true               | false / false             |
| Read three   | false / false       | false / false     | true / true                | false / false             |

The final local catalog is legacy `0/12`, v2 `3/12` with only `authenticated`, and
read `3/12` with only `authenticated`. There is no `GRANT EXECUTE ON ALL FUNCTIONS`,
schema-wide grant, PUBLIC/anon grant, service-role broadening or function overload.

The nine P1 private helpers/executor remain execute-denied to
`PUBLIC/anon/authenticated/service_role`: `0/36`.

## 3. Atomic migration order

The Migration is one `DO` statement, so any failed precondition, intermediate
assertion or final assertion aborts and rolls back the complete statement. Within
that atomic statement it:

1. acquires the existing global Identity Access governance transaction lock;
2. proves the six exact, non-overloaded function names and the v2 owner, volatility,
   definer and empty-search-path catalog contract;
3. proves the legacy-before, v2-before and private-deny preconditions;
4. revokes the three exact legacy signatures from all application roles;
5. proves every legacy entry is closed before any v2 grant;
6. grants only the three exact v2 signatures to `authenticated`;
7. proves the final old/new matrix and re-proves all private denies.

It creates no table, policy, function, role, schema or Auth object and changes no
business data.

## 4. Rollback and failure rehearsal

`admin_p1_identity_access_cutover_rollback.sql` runs only against local PostgreSQL
inside an outer transaction. It temporarily reconstructs the pre-cutover ACL,
starts a nested subtransaction, revokes legacy execute and forces a failure before
the first v2 grant. PostgreSQL rolls that subtransaction back, and the test proves
all three legacy grants were restored with all v2 grants still closed. The test
then rehearses the full cutover, proves the final ACL and private deny matrix, and
rolls back the outer transaction so the real local cutover remains unchanged.

Operational rollback after deployment remains forward-only: make the application
read-only, revoke v2 execute and roll back to a read-only application. It must not
reopen any legacy RPC.

## 5. Security and semantic regression

- The v2 functions and private executor are unchanged. They still recheck
  `auth.uid()`, live active Admin/Super Admin state and the target boundary.
- No Admin/Super Admin Role mutation RPC exists. Membership mutation rejects any
  target with an unrevoked Admin/Super Admin grant before business, Audit or Ledger
  writes.
- The last-active-Super-Admin database guard remains unchanged and passes the Phase
  1C regression.
- Same request ID/same payload replay returns the stored result; a different payload
  is rejected. Saved/Unchanged/Conflict and stale expected-state behavior pass.
- Forced Audit and Ledger failures roll back the full business transaction; no
  partial state or orphan event remains.
- Read RPC and P0 Site Copy ACL/behavior are unchanged.

## 6. Local validation

- Two clean local rebuilds apply all 20 migrations in order: PASS.
- All 14 transaction-style SQL suites: PASS, including P1-02A/B/C, P1-04A rollback,
  both concurrency suites, Phase 1C and all P0 Site Copy suites.
- P1-02F Service targeted: 57/57 PASS.
- Services: 11 files / 180 tests PASS.
- Database/Repository: 14 files / 142 tests PASS.
- Workspace TypeScript, ESLint and targeted Prettier: PASS.
- `git diff --check`, internal-link, sensitive-information, provider-neutral and
  exact-scope scans: PASS.

All validation used the local Supabase project. No remote Migration, SQL, database
write, Auth change, login, Unpause or Deployment occurred. Admin Production remains
`paused=true`; the P0 Production authority record remains Version 7.

## 7. P1-04B handoff

P1-04A does not authorize UI or Action work. After a separate Closure Commit gate,
P1-04B may be considered for the ordinary-only Review/reason/second-confirmation
flow and narrow Server Actions. It must use the existing Service → strict Repository
→ v2 RPC chain, generate one stable request ID per reviewed intent, preserve the
database-issued expected-state token and keep elevated targets non-executable.
P1.1 remains unauthorized and KI-033 remains technically unresolved.
