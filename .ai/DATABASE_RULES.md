# Database Rules

## Change management

- Every schema or policy change must be represented by an ordered, reviewable migration.
- Never edit production data or schema manually as a substitute for a migration.
- Migrations must be safe to apply in sequence and must include rollback or remediation notes when reversal is unsafe.
- Generated types must be refreshed after schema changes once tooling exists.

## Data design

- Use stable primary keys, explicit foreign keys, constraints, and indexes based on documented query patterns.
- Store timestamps consistently in UTC and present them in the user's locale.
- Define ownership, lifecycle, retention, deletion, and audit requirements for every sensitive entity.
- Preserve work revisions as immutable history; restoration creates an auditable current version rather than erasing history.
- Model pen names separately from private account identity.
- Model invitation ancestry so the full invite chain can be audited.
- Keep free-form tags distinct from canonical tag records and mappings.

## Access control

- Database-level authorization is mandatory for protected data; UI checks are not security boundaries.
- Apply least privilege and default-deny policies.
- Authors may mutate only their own permitted resources; readers cannot access administration data.
- Elevated operations must be explicit, narrowly scoped, and auditable.
- Test authorization policies for permitted and forbidden cases before release.
- Every table in an exposed schema must explicitly enable RLS in its migration.
- Authorization data must not rely on user-editable JWT metadata.
- Privileged `security definer` functions require a fixed `search_path`, narrow grants, tests and review.
- Views exposed through APIs must use safe invoker behavior or remain in a non-exposed schema.
- Service-role usage is server-only, exceptional, audited and never a shortcut around policy design.

Supabase PostgreSQL is approved. The conceptual schema and registries are documented in `docs/03_Database/`; SQL creation remains prohibited until Phase 0.6 is approved and an authorized Phase 1 Sprint creates reviewed migrations.

## Migration quality gate

- One concern per migration with deterministic ordering.
- Include indexes, constraints, RLS policies, grants and comments needed by the change.
- Test upgrade from the previous schema and a clean rebuild from zero.
- Destructive changes use expand/migrate/contract steps and a documented recovery path.
- Production migrations are never coupled to irreversible application behavior without a staged rollout.
