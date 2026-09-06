# Admin P1-05B-1 Attempt 1 Failure and Fresh-Bootstrap ACL Correction

Status: `P1-05B-1R1 LOCAL PASS / WAITING FOR PRODUCT OWNER COMMIT AUTHORIZATION`

Date: 2026-08-20
Baseline: `4990440cb0a6e341ce242380480a06fe0c62ea14`
Branch: `codex/admin-p1-04-ordinary-mutations`

This record preserves the first dedicated QA bootstrap failure and the local-only
correction. It does not authorize a remote retry, fixture creation, P1-05B-2,
Production work, P1-06, P1-07 or P1.1.

## 1. Attempt 1 — failed bootstrap evidence

Dedicated QA Project: `fandom-harbor-admin-p1-qa`
QA ref: `gqtchjrmpuxibxmurvfd`
Region: `ap-southeast-1`

The initial inspection found an acceptable fresh project: `ACTIVE_HEALTHY`, zero
Auth users, no application relations/functions, no Migration catalog and no
synthetic fixtures. QA ref, database host and API host were all distinct from the
Production ref `szfhngifsipsrxcpekti` and its hosts.

Migration apply then produced this exact result:

- Migrations 1–19: applied in repository order.
- Migration 20 / D,
  `20260819225318_admin_p1_identity_access_cutover.sql`: failed.
- Error: `IDENTITY_ACCESS_LEGACY_PRECONDITION_FAILED: anon
grant_role(uuid,elevated_role,text)` / SQLSTATE `P0001`.
- Fixture creation and business mutation QA: not started.
- Emergency fail-closed: executed only on QA; all six write RPCs × four
  application roles were verified `execute=false` (`0/24`).
- Production impact and Production credential/data use: none.

The Project is permanently classified for this attempt as
`FAILED BOOTSTRAP EVIDENCE / FAIL-CLOSED`. Its 19/20 state is not a valid P1-05B
environment and must not be continued, cleaned, reset or reused without a separate
Product Owner authorization.

## 2. Root cause — direct grant versus PUBLIC inheritance

PostgreSQL grants new functions `EXECUTE` to `PUBLIC` by default. An application
role can therefore have effective execute through `PUBLIC` without having its own
ACL entry. Supabase existing Hosted projects additionally give new functions
direct default `EXECUTE` grants to `anon`, `authenticated` and `service_role`.
Supabase's current guidance consequently requires revoking both `PUBLIC` and the
specific application roles when restricting a function:

- [Database Functions — Function privileges](https://supabase.com/docs/guides/database/functions#function-privileges)
- [Securing your API — Default privileges](https://supabase.com/docs/guides/api/securing-your-api#default-privileges)

The owning legacy Migration,
`20260629212000_membership_role_workflows.sql`, created the three legacy definer
RPCs, revoked only `PUBLIC`, then explicitly granted `authenticated`. That statement
does remove PostgreSQL's `PUBLIC` aclitem and the effective privilege inherited
through it. It does not remove Hosted Supabase's separate direct `anon` and
`service_role` aclitems.

Catalog inspection after a local reset through that owning Migration showed:

| Role            | Direct execute | Effective execute |
| --------------- | -------------- | ----------------- |
| `PUBLIC`        | false          | false             |
| `anon`          | false          | false             |
| `authenticated` | true           | true              |
| `service_role`  | false          | false             |

The Hosted failure occurred after the same explicit `PUBLIC` revoke. Therefore the
observed effective `anon=true` was a remaining direct Hosted grant, not inheritance
through `PUBLIC`. D incorrectly treated that safely normalizable environment
default as a hard precondition failure before running its own exact revokes.

## 3. Migration immutability and ownership decision

The repository's database rules require ordered, reviewable Migration changes,
normal Migration workflow, clean rebuilds and rollback/remediation evidence. They
prohibit Dashboard/manual schema changes as a Migration substitute. They do not
prohibit correcting a committed Migration that has not been applied to Production
and remains inside an explicitly authorized QA validation gate.

P1 A–D have not been applied to Production. Product Owner authorized R1 specifically
to correct the fresh-bootstrap contract. The minimal owner is therefore D itself:

- Modified: `20260819225318_admin_p1_identity_access_cutover.sql`.
- New corrective Migration E: not required.
- Earlier owning Migration and already-failed QA schema: not modified.
- QA-only workaround or ad-hoc schema patch: not created.
- Repository Migration count: remains 20.

## 4. Corrected atomic cutover

D remains one transactional `DO` statement under the governance advisory lock.
Its order is now:

1. Prove the exact six public write function names/signatures.
2. Prove all three legacy functions are `VOLATILE SECURITY DEFINER`, owned by
   `postgres`, with `search_path=""`.
3. Retain the v2 catalog and execute-closed hard preconditions.
4. Retain all nine private helper/executor deny hard preconditions.
5. Normalize all three legacy RPCs with exact-signature `REVOKE EXECUTE FROM
PUBLIC, anon, authenticated, service_role`.
6. Prove legacy `0/12`.
7. Grant only the three ordinary v2 RPCs to `authenticated`.
8. Prove v2 `3/12` and re-prove private `0/36`.

There is no dynamic SQL, schema-wide grant, `GRANT EXECUTE ON ALL FUNCTIONS`, new
function, elevated mutation, helper exposure or application-role expansion. If a
retained hard assertion fails, PostgreSQL rolls back the entire `DO`; no committed
old/new half-cutover state exists.

### Preconditions reclassified

Hard safety preconditions retained or strengthened:

- exact function catalog/signatures;
- legacy and v2 definer/volatility/owner/empty-search-path contract;
- all v2 RPCs closed before cutover;
- all private helpers/executor closed before and after cutover;
- exact final legacy deny and v2 authenticated-only grants.

Normalizable state:

- legacy `PUBLIC` execute;
- effective `anon` execute inherited through `PUBLIC`;
- direct Hosted `anon/authenticated/service_role` execute;
- already-closed legacy execute.

These states all safely converge to the same final `0/12`; they no longer fail
before normalization.

## 5. Hosted-default regression fixture

`supabase/tests/admin_p1_identity_access_cutover_hosted_defaults.sql` runs only
against disposable local PostgreSQL inside an outer transaction. It first proves
PostgreSQL ACL semantics by constructing `PUBLIC`-only execute: `anon` has effective
execute while its direct aclitem is absent. It then revokes `PUBLIC`, creates the
Hosted direct grants, proves direct `anon=true`, restores the v2 pre-cutover deny
state and replays the real D Migration.

Final assertions prove:

| Matrix                         | Result   |
| ------------------------------ | -------- |
| Legacy write application ACL   | `0/12`   |
| Ordinary v2 write ACL          | `3/12`   |
| Read RPC ACL                   | `3/12`   |
| Private helpers/executor ACL   | `0/36`   |
| Fixture transaction completion | rollback |

The existing cutover rollback rehearsal also remains passing; a failed cutover
cannot commit a partial ACL state and operational rollback still never reopens the
legacy functions.

## 6. Local validation

- Clean rebuild #1 from Migration 1 through 20: PASS.
- Hosted-default ACL regression after rebuild #1: PASS.
- Clean rebuild #2 from Migration 1 through 20: PASS.
- All 15 SQL suites: PASS, including both concurrency suites, cutover rollback,
  idempotency, request mismatch, Conflict, forced Audit/Ledger rollback,
  elevated-target zero-write, final active Super Admin and P0 Site Copy.
- Final ACL: legacy `0/12`; v2 `3/12`; read `3/12`; private `0/36`.
- Read catalog: Search/Audit `STABLE SECURITY INVOKER`; Detail `STABLE SECURITY
DEFINER`; all owned by `postgres` with `search_path=""`.
- Database lint: no errors.
- Database: 14 files / 143 tests; Repository targeted: 24/24.
- P1-02F Service targeted: 57/57; Services: 11 files / 180 tests.
- Admin: 9 files / 82 tests.
- Workspace TypeScript and ESLint: PASS.

## 7. Scope and next gate

R1 performed no remote access after the accepted failure: no QA Migration, SQL,
ACL, cleanup, reset, delete/recreate, fixture, Auth user or RPC call. Production was
not accessed or changed. No Product code, dependency, configuration, lockfile,
Domain, Repository, Service, Action or UI changed. Elevated mutations and KI-033
remain deferred; Admin Production remains `paused=true`; Web Admin entry remains
closed; P0 Production Site Copy remains Version 7.

R1 is ready for a separate docs/Migration/test Closure Commit authorization. A
future remote retry must use a newly authorized clean QA environment and be recorded
as Attempt 2. P1-05B-2 remains not started and cannot begin until a clean bootstrap
passes under a separate Product Owner gate.
