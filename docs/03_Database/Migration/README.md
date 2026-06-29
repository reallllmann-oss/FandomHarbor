# Migration Registry

Status: Phase 1C identity/access migrations implemented locally; not applied to a hosted project.

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

| Order          | Migration                        | Concern                                                                                                                                                | Verification                                                     |
| -------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 20260629210000 | `identity_access_foundation.sql` | Identity/access enums, profiles, memberships, elevated role grants, invitations, redemptions, append-only audit log, helper functions and baseline RLS | Static migration contract tests; transactional SQL test prepared |
| 20260629211000 | `invitation_workflows.sql`       | Atomic invitation creation, revocation and verified-email redemption                                                                                   | Unit/service tests; transactional SQL test prepared              |
| 20260629212000 | `membership_role_workflows.sql`  | Audited role grants/revocations, membership transitions and one-time Super Admin bootstrap                                                             | Static migration contract tests; transactional SQL test prepared |

The migrations are additive and ordered. They create no cloud resources and must be applied through the normal Supabase migration workflow only after the target environment and bootstrap operator are explicitly approved. `supabase/tests/phase_1c_identity_access.sql` is the allow/deny and workflow verification script for a disposable database.
