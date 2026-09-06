# Admin P1-02G — Backend Closure and UI Handoff

Status: `LOCAL VALIDATION COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`

Date: 2026-08-18
Parent: `edd78c190002340eaa2091860e5eb997785b7528`
Branch: `codex/admin-p1-02g-backend-closure`
Worktree: `/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02G`

This document closes the local backend regression for Admin P1-02 and freezes the
handoff contracts for P1-03 and P1-04. It does not authorize a Commit, application
wiring, write execute, legacy RPC cutover, remote database work, or any UI phase.

## 1. Implemented backend baseline

| Slice   | Commit                                     | Implementation                                                               |
| ------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| P1-02A  | `8f7ee546ab069c36658a1debdddbf64a7382133f` | Private request ledger, state/fingerprint helpers, Ledger/Audit immutability |
| ADR-023 | `fc41ad153c75a326f76ca66c5219a889eb99a84e` | Minimal mixed read-RPC authority decision                                    |
| P1-02B  | `64bba75360e9f303819c42d1c08a2d6ec545983d` | Three bounded read RPCs                                                      |
| P1-02C  | `0e1de6247a76b6e2bf94b050ce63a3b8fe80ba35` | Three ordinary-only write RPCs, execute closed                               |
| P1-02D  | `ca300c234db6b4c9312dcc0e8b35c09b29b6f1f3` | Provider-neutral Domain, strict parsers, three read and three write Ports    |
| P1-02E  | `cadb81053720a2e1885abe3e6f63a1b5196a64e1` | Strict Repository and exact six-RPC transport mapping                        |
| P1-02F  | `edd78c190002340eaa2091860e5eb997785b7528` | Live-access Governance Service with six use cases                            |

Database migrations, in order:

1. `20260817104616_admin_p1_identity_access_ledger.sql`
2. `20260817121610_admin_p1_identity_access_reads.sql`
3. `20260817125140_admin_p1_identity_access_writes.sql`

The clean local rebuild applied all 19 repository migrations in order. No remote
project was contacted, changed, or used for validation.

## 2. Final database catalog and ACL

### Read RPCs

| Exact signature                                          | Mode                      | Owner      | Execute ACL                                     |
| -------------------------------------------------------- | ------------------------- | ---------- | ----------------------------------------------- |
| `search_identity_access_subjects_v1(text,jsonb,integer)` | `STABLE SECURITY INVOKER` | `postgres` | `authenticated=true`; all other app roles false |
| `get_identity_access_subject_v1(uuid)`                   | `STABLE SECURITY DEFINER` | `postgres` | `authenticated=true`; all other app roles false |
| `list_identity_access_audit_v1(uuid,jsonb,integer)`      | `STABLE SECURITY INVOKER` | `postgres` | `authenticated=true`; all other app roles false |

All three have `search_path=""`, one overload only, and exact-signature grants.
`PUBLIC`, `anon`, and `service_role` have no execute. The detail RPC remains the
sole strict read-only definer boundary: it authorizes the actor before target
lookup, returns the frozen minimal projection, and calls only the existing private
expected-state helper.

### Write RPCs

| Exact signature                                                          | Mode                        | ACL                     |
| ------------------------------------------------------------------------ | --------------------------- | ----------------------- |
| `grant_author_role_v2(uuid,uuid,text,text)`                              | `VOLATILE SECURITY DEFINER` | `{postgres=X/postgres}` |
| `revoke_author_role_v2(uuid,uuid,text,text)`                             | `VOLATILE SECURITY DEFINER` | `{postgres=X/postgres}` |
| `set_ordinary_membership_state_v2(uuid,uuid,membership_state,text,text)` | `VOLATILE SECURITY DEFINER` | `{postgres=X/postgres}` |

All three are owned by `postgres`, have `search_path=""`, have no overload, and
contain no dynamic SQL. The 12 combinations of three functions and
`PUBLIC`/`anon`/`authenticated`/`service_role` all resolve to `execute=false`.
Private executors and all P1-02A helpers also remain execute-denied to those four
roles. The legacy Membership/Role RPC ACL is unchanged; no cutover occurred.

### Tables, RLS, exposure, and immutability

- `profiles`, `memberships`, `role_grants`, and `audit_logs` retain RLS and their
  existing authenticated read boundary; no underlying Grant or policy expanded.
- `private.identity_access_request_ledger` has RLS enabled and only owner-level
  privileges. `private` is not in the configured Data API exposed schemas.
- `audit_logs` and the request ledger retain active `BEFORE UPDATE OR DELETE`
  rejection triggers. Existing Audit INSERT and P0 Site Copy error contracts are
  unchanged.
- The last active Super Admin database guard remains effective.

## 3. Mutation semantics and regression proof

| Result      | Business change | Audit | Ledger | Returned state                               |
| ----------- | --------------- | ----- | ------ | -------------------------------------------- |
| `Saved`     | exactly one     | one   | one    | saved snapshot/token                         |
| `Unchanged` | zero            | zero  | one    | replayable current snapshot/token            |
| `Conflict`  | zero            | zero  | one    | lock-current snapshot/token for a new Review |

- The same `requestId` and canonical payload replays the stored result without a
  second business change or Audit. A different payload, actor, target, or operation
  is rejected with the stable request-mismatch contract.
- Concurrent use of the same `requestId` produces one business change, one Audit,
  and one Ledger. Different request IDs against the same target serialize; the
  later stale request receives `Conflict` from the latest locked state.
- Forced Audit or Ledger failure rolls back the full transaction.
- Ledger and Audit update/delete attempts remain rejected.
- Elevated targets return the deferred-mutation error before business, Audit, or
  Ledger writes. Final-active-Super-Admin protection continues to pass.
- P0 Site Copy permission, idempotency, data, and concurrency suites pass. The
  clean local database intentionally rebuilds the repository's formal Version 1
  seed; the unchanged production authority record remains Version 7 because this
  mission performed no remote read or write.

## 4. Application boundary closure

The dependency direction is fixed as:

`provider-neutral Domain → strict Repository → live-access Service`

- Domain defines strict IDs, normalized search/reason inputs, opaque expected-state,
  bounded cursors, minimal Subject/Detail/Audit models, three read Ports, three
  ordinary-write Ports, `Saved | Unchanged | Conflict`, and safe errors. Elevated
  mutation is not expressible.
- Repository maps those six Ports to the exact three read and three write RPCs.
  Provider successes enter as `unknown`; exact parsers reject malformed or extra
  fields and response-ID mismatches. Provider messages, hints, SQLSTATE, and object
  names are cleaned. Mutations set transport retry to false, add no retry loop, and
  never fall back to legacy RPCs or direct tables/private helpers.
- Service exposes the six matching use cases. Valid input performs exactly one
  fresh live-access check requiring an authenticated actor, active Membership,
  effective Admin/Super Admin role, and `admin:operate`. Invalid input and denied
  actors call no Repository Port. An ordinary mutation performs a read-only target
  precheck and at most one matching write call; the database remains final authority
  for races. The Service does not create request IDs, calculate expected-state,
  retry mutations, resolve Conflict, or retain provider details.

No layer authorizes from `user_metadata`, a cached role, or a stale JWT role claim.
Domain and Service remain independent of Supabase/PostgREST, SQL/RPC wire shapes,
Next.js/React, cookies, sessions, or environment values.

## 5. P1-03 read-only UI handoff — future Owner Gate

P1-03 may implement only the Admin `/access` read surface:

- identity-subject search with the frozen limit, stable cursor, and pagination;
- minimal identity, current Membership, effective Role Grant, expected-state, and
  target governance Audit summary;
- the P1-02F `searchSubjects`, `getSubjectDetail`, and `listSubjectAudit` use cases;
- one fresh live-access check for each read; an unauthorized response must not
  disclose whether the target exists.

P1-03 must not render or call Grant, Revoke, Membership mutation, Save, Review, or
confirmation controls. It must not grant execute on P1-02C writes. The Web Admin
entry remains disabled and no Web-to-Admin navigation is added.

## 6. P1-04 write UI and cutover handoff — future Owner Gate

P1-04 remains limited to ordinary Membership-state changes and Author Role
Grant/Revoke. The required flow is:

1. Edit against the latest detail snapshot.
2. Review the exact change and normalized reason.
3. Perform a separate second confirmation.
4. At the Action boundary after Review, create and fix one `requestId` for that
   intent; preserve the latest detail's opaque expected-state.
5. Recheck live access and make at most one mutation call.
6. Display `Saved`, `Unchanged`, or `Conflict` without reinterpretation. Conflict
   requires a fresh read and a new Review; it is never overwritten automatically.

Write enablement requires a separately authorized atomic database gate:

1. revoke authenticated execute from all legacy Membership/Role RPCs;
2. prove every legacy entry is denied;
3. grant authenticated execute only on the three approved ordinary v2 writes;
4. prohibit any old/new dual-entry compatibility window.

Application rollback is read-only plus revocation of v2 execute. It must never
reopen a legacy write RPC. Database migrations remain forward-only and require
their own remote-apply authorization.

## 7. Elevated boundary and P1.1

ADR-022 Option 3 and KI-033 remain unchanged: current P1 has no database-verifiable,
session- and operation-bound reauthentication proof. It therefore does not support
Admin/Super Admin Role Grant/Revoke or any Membership mutation whose target is
elevated. Ordinary sessions, session age, JWT `iat`, client booleans, repeated
ordinary sign-in, or hidden legacy paths are not substitutes.

No MFA/AAL2, proof issuer, elevated command, or temporary escape hatch is included.
`P1.1 Elevated Access Governance` may be evaluated only after the complete P1 and
under a separate Product Owner authorization and Auth ADR. Invitation management
also remains independently deferred and outside this handoff; the older roadmap
label that called invitations “P1.1 or later” must be disambiguated by the Product
Owner before either future initiative begins.

## 8. Local validation evidence

- Supabase Changelog was checked first, followed by the current Database Functions,
  RLS, Data API security, and custom-schema documentation. The implementation still
  follows explicit function execute revocation, fixed empty search paths, schema
  qualification, RLS plus Grants, and non-exposure of private schemas.
- Supabase CLI `2.108.0`; clean local reset and 19-migration order: PASS.
- All 13 SQL suites: PASS, including P1-02A/B/C, both concurrency suites, the
  migration contracts, Identity/Access regressions, and P0 Site Copy data,
  permission, idempotency, and concurrency.
- Domain: 53/53; Repository: 24/24; Service: 57/57; Services: 180/180; Database:
  138/138.
- Full-workspace TypeScript: PASS. Full-workspace ESLint: PASS.
- Database lint: PASS with two pre-existing P0 assignment-cast warnings and no P1
  error. Local security advisor: PASS, no issue.
- Final documentation Prettier, `git diff --check`, internal links, sensitive-data
  scan, exact six-file scope, and empty staged diff: PASS.

## 9. Known limitations, rollback, and Owner Gates

- The write RPC ACL is intentionally closed, so no authenticated application
  mutation can succeed. `/access`, Actions, UI, and composition root are not wired.
- Legacy write execute remains unchanged until the single P1-04 atomic cutover.
  This is an inherited compatibility state, not a new P1-02 capability.
- Validation is local only. No Production or dedicated non-Production remote QA was
  performed. Admin Production remains `paused=true`.
- The local CLI reports a newer release is available; dependencies and CLI were not
  upgraded in this mission.
- P1-02 rollback is limited to unapplied local code/document history. Any future
  database rollback must be a separately reviewed forward migration. After cutover,
  rollback must not restore legacy execute.

Next Owner Gates are independent and sequential: a P1-02G docs-only Closure Commit,
P1-03 read-only UI, P1-04 ordinary write UI and atomic cutover, and then dedicated
non-Production remote QA/release gates. None is authorized by this document.

## 10. Non-operation statement

This mission did not Commit, Push, open a PR, merge, change product code, change a
Migration/RPC/RLS/Grant/Auth object, grant write execute, perform cutover, access a
remote database, log in to Admin, Unpause, deploy, or begin P1-03, P1-04, or P1.1.
