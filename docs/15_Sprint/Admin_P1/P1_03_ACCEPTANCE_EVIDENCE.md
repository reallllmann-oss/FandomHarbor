# Admin P1-03 — Read-only Access UI Acceptance Evidence

Status: `LOCAL IMPLEMENTATION COMPLETE — COMMIT NOT AUTHORIZED`

Date: 2026-08-19
Baseline: `370d7b0541a51ed63dd4076e4d912b2309c9d072`
Branch: `codex/admin-p1-03-read-only-access-ui`
Worktree: `/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-03`

## 1. Accepted scope

P1-03 replaces the legacy `/access` mutation form with an Admin-only read surface.
It adds no governance capability and does not change the database contract. The
page can search identity subjects, inspect one minimal detail snapshot, and read
the target's governance Audit summary with stable forward pagination.

The UI displays only fields already frozen by P1-02G:

- registration name or its missing state and full User ID;
- Profile created/updated times;
- Membership state and admitted/suspended/revoked/updated times;
- effective roles and active Role Grant summaries;
- elevated-account and only-active-Super-Admin protection flags;
- the database-generated opaque expected-state token;
- minimal Membership/Role governance Audit summaries.

It does not request or display Auth email/phone identifiers, metadata, credentials,
raw provider errors, SQLSTATE, or internal database object names.

## 2. Controlled read path

The runtime dependency path is:

`/access server page → P1-03 page-data loader → read-only Service facade → P1-02F Governance Service → P1-02E strict Repository → P1-02B read RPCs`

The facade exposes only these existing Service methods:

1. `searchSubjects`
2. `getSubjectDetail`
3. `listSubjectAudit`

The initial page always calls `searchSubjects`, so an unauthenticated or forbidden
actor is denied before protected data renders. Selecting a subject then calls
`getSubjectDetail`; only after that succeeds does the page call
`listSubjectAudit`. Each call independently executes the existing P1-02F fresh
live-access check. It requires a verified Session, active Membership, effective
Admin or Super Admin role, and `admin:operate`; it does not authorize from
`user_metadata`, cached UI state, or a JWT role claim.

Search and Audit use their approved invoker RPCs. Detail uses the sole strict
read-only definer RPC. Provider responses still enter the Repository as `unknown`
and pass the P1-02D exact parser before reaching the page. The UI contains no
Supabase client, RPC call, direct table query, or copied authorization logic.

## 3. UI states and behavior

- **Loading:** route-level status announces the controlled read in progress.
- **Loaded:** responsive directory, selected detail, active grants, expected-state,
  and Audit timeline.
- **Empty:** distinct no-subject and no-Audit states.
- **Unauthorized:** redirect to sign-in; forbidden actors use the existing
  forbidden redirect and see no target data.
- **Recoverable error:** fixed safe messages for invalid navigation, unavailable
  subject, or temporary read failure; no raw cause is rendered.
- **Unavailable/deferred:** a text-only boundary explains that ordinary writes wait
  for P1-04 and elevated writes remain deferred by KI-033. There are no disabled
  mutation controls.
- **Pagination:** URL-safe opaque transport carries the existing stable search and
  Audit cursor fields back to the Service parser. Malformed or oversized cursor
  transport fails closed.

The visual treatment reuses the Admin shell, `hero-panel`, `stat-card`,
`empty-state`, surface, focus, responsive grid, semantic heading, list, `time`,
`dl`, `role=status`, and `role=alert` patterns. The only interactive form is a GET
search with one “查询” submit control; identity and pagination navigation use links.

## 4. Read-only proof

- `/access/page.tsx` no longer imports `./actions` and has no Server Action binding.
- The page has no textarea, select, reason, requestId, role, state, confirmation,
  Save, Grant, Revoke, Restore, or Membership mutation control.
- The page-data loader references exactly the three approved read methods and no
  Governance mutation method.
- The server facade returns a `Pick` containing only the three reads. It does not
  expose a write method to the page.
- The legacy `access/actions.ts` file and old RPC ACL are unchanged. Because the
  route no longer imports the module, those Actions are not part of the P1-03 page
  graph. Their eventual removal/cutover remains P1-04 scope.
- Catalog preflight confirms the three ordinary v2 write RPCs remain
  `execute=false` for `PUBLIC`, `anon`, `authenticated`, and `service_role`: 0 open
  across 12 checks. No Grant, RLS, RPC, Auth, Migration, or schema file changed.
- No Admin/Super Admin Role mutation, elevated-account Membership mutation, custom
  reauth, MFA/AAL2, or KI-033 escape hatch exists in this implementation.

## 5. Tests and regression

- P1-03 page-data and route source-contract tests: 2 files / 16 tests PASS.
- Admin suite: 7 files / 70 tests PASS.
- P1-02F Service preflight and regression: 57/57 targeted; Services suite 11 files /
  180 tests PASS.
- Database/Repository suite: 14 files / 138 tests PASS.
- Full-workspace TypeScript and ESLint: PASS.
- Admin production build: PASS; Next recognizes `/access` as a dynamic server route.
- Local Admin smoke: PASS. An anonymous request to the locally built `/access`
  produced the expected Next redirect contract for `/auth/sign-in`; no login or
  data write was attempted.
- Prettier, `git diff --check`, whitespace/internal links, sensitive-data scan,
  provider-boundary scan, exact 12-file scope, and empty staged diff: PASS.

The established P0 Site Copy editor, Admin shell, P1-02 Domain/Repository/Service,
Web App, Production configuration, and database files are outside the change set.

## 6. Unimplemented capabilities and P1-04 handoff

P1-03 does not implement Membership changes, Author Role Grant/Revoke, write result
states, reason/Review/confirm, mutation Actions, write execute, or legacy RPC
cutover. P1-04 remains a separate Product Owner gate for those ordinary operations
and must follow the P1-02G atomic cutover contract. P1.1 Elevated Access Governance
also remains unauthorized and technically deferred by KI-033.

Web continues to have no Admin entry. Admin Production remains `paused=true`.
There was no Production or remote database access, write, QA, login, Unpause, or
Deployment in P1-03.
