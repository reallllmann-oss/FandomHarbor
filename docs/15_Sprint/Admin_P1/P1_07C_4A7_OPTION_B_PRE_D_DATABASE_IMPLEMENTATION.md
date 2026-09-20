# Admin P1-07C-4A7 — Option B Pre-D Database Implementation

- Status: `PASS — LOCAL / DISPOSABLE DATABASE SECURITY PROVEN`
- Date: 2026-09-21
- Baseline: `4f37cafa03e097f085a21c14436670aaf90cfd40`
- Governing decision: [ADR-024](../../17_Architecture_Decisions/ADR-024.md)
- Only elevated operation: `grant_super_admin`
- Formal Migration: `20260818120000_admin_p1_option_b_elevated_access_pred.sql`
- Ordering: C → Pre-D → unchanged D

## Result

The formal Pre-D Migration and strict database adapter implement the narrow
ADR-024 commissioning contract in the repository. This is a local/disposable
database result only. No hosted QA or Production Migration, real-user MFA
enrollment, real commissioning, deployment, Resume or Web Admin entry change is
part of this acceptance.

The database is the final authority for current actor, Session, policy, target,
expected state, request ownership, intent expiry and one-time evidence. Runtime
continues to obtain verified Auth evidence, require AAL2 plus fresh TOTP and
validate the server request; it does not replace the database transaction.

## Migration ordering and compatibility

| Item        | Value                                                              |
| ----------- | ------------------------------------------------------------------ |
| Predecessor | `20260817125140_admin_p1_identity_access_writes.sql`               |
| Pre-D       | `20260818120000_admin_p1_option_b_elevated_access_pred.sql`        |
| Successor D | `20260819225318_admin_p1_identity_access_cutover.sql`              |
| D SHA-256   | `b44ed44145b25cdf4524f1e7fbdec802a2bb84972ce07c467e4ff4edbc95d69e` |

A clean disposable database applied all 21 canonical migrations in order. The
formal sequence is C → Pre-D → D. Migration D is byte-identical to its accepted
object, and its catalog/ACL assertions still pass after Pre-D.

## Private state and policy

`private.elevated_commissioning_policy` stores the authorized registration-name
policy and its verified stable actor/target bindings. The binding function
requires exactly one live Auth identity and active Membership per name, a live
Super Admin actor, and an ordinary target. The names are policy data; the core
authorization functions do not contain a stable-ID bypass.

`private.elevated_access_intents` freezes the requestId, actor ID and policy
reference, original Session, only operation, exact stable target, fixed desired
role, expected-state token, normalized reason, 32-byte canonical fingerprint,
prior TOTP time, database issue/challenge/expiry time, consumption evidence,
result, role grant and Audit references. Lifetime is exactly five minutes by
database time.

Both tables enable RLS with no application policy. `PUBLIC`, `anon`,
`authenticated` and `service_role` have no direct table privilege. Every private
helper has empty `search_path`, fully qualified objects and execute denied to all
four roles. The private schema is not exposed through the Data API.

## Trusted execution boundary

The public boundary contains four exact RPCs:

- `get_grant_super_admin_policy_v1()`;
- `issue_grant_super_admin_intent_v1(uuid,text,text,text)`;
- `get_grant_super_admin_intent_v1(uuid)`; and
- `confirm_grant_super_admin_intent_v1(uuid,uuid,text,text,text)`.

Only `authenticated` receives exact-signature execute. `PUBLIC`, `anon` and
`service_role` remain denied. No public signature accepts actor ID, Session ID,
target ID, desired role or trusted MFA facts. The definer functions use an empty
search path, fully qualified objects, no dynamic SQL and owner `postgres`.

Database Auth validation derives `auth.uid()` and signed `auth.jwt()` claims,
requires `aal2`, an object-form TOTP AMR timestamp no more than 300 seconds old,
and a matching live `auth.sessions` row for the actor and Session. Current live
Membership/Super Admin authorization, both accounts' verified factor recovery
minimum and exact stable target policy are revalidated at execution. Different,
absent and expired Sessions fail closed.

## Shared requestId and transaction semantics

The existing `private.identity_access_request_ledger` remains the sole result
ledger and now accepts only one additional operation: `grant_super_admin`.
Ordinary ledger insertion and elevated intent insertion take the same advisory
request lock and cross-check the other store. A unique elevated requestId plus
the shared lock prevents an ordinary/elevated race from creating two claims.

Confirmation takes the request lock, intent row lock, global-governance lock,
Super Admin lock and target state locks. It then revalidates policy/Auth/Session,
checks the database-issued expected-state token and commits the following as one
transaction:

1. one Super Admin role grant;
2. one non-secret business Audit;
3. one canonical request ledger result; and
4. one consumed intent with a unique Session/TOTP evidence key.

`Saved` produces exactly those records. `Conflict` consumes the intent and writes
one ledger result but produces no role change or business Audit. Exact
requestId/payload replay returns the canonical ledger result and never repeats
the mutation. A changed payload/fingerprint is rejected. Audit, grant or ledger
failure rolls back every component, including intent consumption.

## Legacy compatibility boundary

Pre-D replaces the three exact legacy function definitions without changing
their signature, volatility, definer mode, owner or empty search path. Author and
ordinary Membership behavior remains available before D, while legacy
Admin/Super Admin role branches and elevated-account Membership mutation return
`ELEVATED_MUTATION_REQUIRES_MFA`. No overload or hidden elevated path exists.

Migration D later performs its already-frozen ordinary cutover. Rollback may
close the new elevated execute boundary, but must never reopen a legacy elevated
path.

## Verification

Local/disposable verification covers:

- a clean 21-Migration rebuild and C → Pre-D → D order;
- exact D hash and zero-byte modification;
- Guest, Reader, Author, ordinary Admin and direct private-access denial;
- valid, different, absent and expired Session cases;
- actor authorization revocation after intent issue;
- Saved, exact retry, changed-payload rejection and stale-state Conflict;
- shared requestId ordinary/elevated collision;
- same-request/same-payload and changed-payload concurrency;
- parallel same-intent confirmation with one role/Audit/ledger/consume;
- grant, Audit and ledger failure rollback;
- strict repository parsing, exact RPC mapping and safe error cleaning; and
- existing ordinary governance, Auth, Admin, workspace static and build
  regressions.

All fixtures are synthetic and transactional or explicitly cleaned. No password,
JWT, Cookie, token, TOTP secret/code, factor secret, connection credential or
service-role key is stored in the repository or evidence.

| Gate                                        | Result       |
| ------------------------------------------- | ------------ |
| Clean canonical Migration rebuild           | 21/21 PASS   |
| Repository SQL suites                       | 17/17 PASS   |
| Services                                    | 228/228 PASS |
| Database / repository                       | 155/155 PASS |
| Auth                                        | 27/27 PASS   |
| Admin                                       | 105/105 PASS |
| Workspace TypeScript / ESLint               | PASS / PASS  |
| Web/Admin/Docs production builds            | PASS         |
| Changed-file Prettier / `git diff --check`  | PASS / PASS  |
| Changed-doc internal links / sensitive scan | PASS / PASS  |

## Remaining release gates

This stage does not authorize hosted QA. The next boundary is a separate Product
Owner authorization for P1-07C-4A8 hosted QA Migration and integration
acceptance. After that, protected Preview, real primary/backup TOTP enrollment,
controlled commissioning, independent target smoke, a fresh backup and the full
P1-07C-4A rerun remain mandatory before D can be reconsidered.

Migration D remains blocked. PR #4 remains open/unmerged. Formal Admin Production
remains paused and Web Admin Entry remains closed.
