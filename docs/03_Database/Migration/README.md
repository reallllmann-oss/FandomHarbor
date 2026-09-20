# Migration Registry

Status: Production is at 19 applied canonical migrations. The repository now has
21 migrations: formal Option B Pre-D and unchanged D remain unapplied to
Production and require separate release gates.

Each future migration receives an ordered identifier, title, owner, ERD references, affected policies/RLS/indexes/seeds, compatibility strategy, verification and rollback/remediation plan.

Rules:

- Documentation is approved before SQL.
- One coherent concern per migration.
- Test clean rebuild and upgrade from the prior version.
- Destructive work uses expand → backfill → switch → contract.
- Dashboard-only/manual production schema changes are prohibited.
- Registry entries link to the real file under `supabase/migrations/` after creation.

Use `MIGRATION_TEMPLATE.md` for every entry.

## Registry

| Order          | Migration                                    | Concern                                                                                                                                                                      | Verification                                                                                                   |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 20260629210000 | `identity_access_foundation.sql`             | Identity/access enums, profiles, memberships, elevated role grants, invitations, redemptions, append-only audit log, helper functions and baseline RLS                       | Static migration contract tests; transactional SQL test prepared                                               |
| 20260629211000 | `invitation_workflows.sql`                   | Historical invitation creation/revocation/redemption workflow; email gate superseded by 20260702090000                                                                       | Unit/service tests; transactional SQL test                                                                     |
| 20260629212000 | `membership_role_workflows.sql`              | Audited role grants/revocations, membership transitions and one-time Super Admin bootstrap                                                                                   | Static migration contract tests; transactional SQL test prepared                                               |
| 20260630100000 | `content_domain_foundation.sql`              | Works, chapters, articles, shared categories/tags, constraints, indexes, least-privilege grants and RLS                                                                      | Vitest migration contracts; transactional SQL allow/deny test                                                  |
| 20260701100000 | `v1_content_taxonomy.sql`                    | Idempotent V1 Category and `additional/canonical` Tag vocabulary with stable UUIDs                                                                                           | Vitest seed contract; clean rebuild and repeat execution passed                                                |
| 20260701101000 | `create_author_work_draft.sql`               | Author-only atomic Work Draft and `work_tags` RPC with trusted owner and fixed draft lifecycle                                                                               | Vitest RPC contract; transactional SQL allow/deny/rollback passed                                              |
| 20260701113000 | `chapters_body_update_grant.sql`             | Minimal owner-RLS-protected Chapter body column update grant                                                                                                                 | Transactional SQL owner/deny tests passed                                                                      |
| 20260702090000 | `registration_name_invitation_signup.sql`    | Registration name, case-insensitive uniqueness, invitation preflight and atomic Auth/Profile/Membership/Redemption trigger                                                   | Clean reset, migration contract, transactional SQL and real Auth API signup/login passed                       |
| 20260702120000 | `registration_invitation_status.sql`         | Non-disclosing registration invitation status classification plus boolean preflight compatibility                                                                            | Clean reset, migration contract, transactional SQL status matrix and real Auth signup passed                   |
| 20260730110000 | `admin_p0_site_copy_foundation.sql`          | Admin P0 immutable eight-field site-copy revisions, current pointer, public/Admin projections, atomic audited save, conflict and request idempotency                         | Clean/upgrade migration, 4–200 reason boundaries, transactional atomicity and concurrency                      |
| 20260730120000 | `admin_p0_site_copy_baseline.sql`            | Atomic Version 1 initialization from the eight current Web-rendered values, actor-null immutable Audit and global Current Pointer                                            | Exact projection, fail-closed rerun/partial-state, atomic rollback and permission tests                        |
| 20260817104616 | `admin_p1_identity_access_ledger.sql`        | Private request ledger, canonical reason/expected-state/fingerprint helpers and global Audit immutability guard; no public RPC or execute grant                              | Clean local reset, static migration contract, transactional catalog/deny/immutability tests                    |
| 20260817121610 | `admin_p1_identity_access_reads.sql`         | Three bounded, field-minimized Identity Access read RPCs using ADR-023 invoker/definer/invoker authority; no writes or table grant changes                                   | Clean local reset, static contracts, catalog/permission/pagination/zero-write SQL suite                        |
| 20260817125140 | `admin_p1_identity_access_writes.sql`        | Three ordinary-only v2 write definitions with request/global locks, replay, expected-state, atomic Audit/Ledger and all application execute closed                           | Clean reset, static/catalog/semantic/failure tests and two-connection concurrency suite                        |
| 20260818120000 | `admin_p1_option_b_elevated_access_pred.sql` | ADR-024 exact `grant_super_admin` private policy/intent, shared request namespace, trusted Session/MFA checks, atomic grant/Audit/ledger/consume and legacy elevated closure | Clean 21-Migration rebuild, strict ACL/catalog, synthetic E2E, failure rollback and two-connection concurrency |
| 20260819225318 | `admin_p1_identity_access_cutover.sql`       | Atomic legacy ACL normalization and deny assertion, then exact authenticated grant for the three ordinary-only v2 write RPCs                                                 | Two clean rebuilds, 15 SQL suites, Hosted direct/PUBLIC ACL regression and rollback rehearsal                  |

The migrations are additive and ordered. They create no cloud resources and must
be applied through the normal Supabase migration workflow only after the target
environment and operator are explicitly approved. Pre-D sorts strictly between C
and D. Migration D remains byte-identical at SHA-256
`b44ed44145b25cdf4524f1e7fbdec802a2bb84972ce07c467e4ff4edbc95d69e`.
Production remains at 19/21; neither Pre-D nor D has been applied. Any hosted
proof requires a clean dedicated QA environment and separate Product Owner
authorization.
