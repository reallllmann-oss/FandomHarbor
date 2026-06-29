# Database Documentation Source of Truth

Status: Proposed for Phase 0.6 freeze

No table, column, constraint, index, seed, migration, database policy or RLS policy may be implemented without an owner document here.

## Categories

- `ERD/` — entity/table ownership, relationships and logical schema
- `Migration/` — migration registry, template, rollout and rollback
- `Policies/` — database-level product invariants and privileged function policy
- `RLS/` — row/field access matrix and per-policy specifications
- `Seed/` — controlled vocabulary and synthetic development data
- `Indexes/` — index/query ownership and review
- `Lifecycle/` — retention, deletion, export and archival behavior

## Traceability rule

Every migration header/document references affected ERD IDs, policy IDs, RLS IDs, index IDs, seed IDs and lifecycle decisions. Every category document links back to the implementing migration once code is authorized.

Dashboard-only schema changes are prohibited. Documentation approval precedes SQL migration creation.
