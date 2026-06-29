# Supabase Schema Blueprint

Status: Phase 1C identity/access subset implemented in local SQL migrations; remaining catalog is proposed.

## Schema separation

- `public`: RLS-protected application tables exposed through Supabase APIs only where needed.
- `private`: internal helpers, sensitive operational projections and privileged routines not directly exposed.
- `storage`: Supabase-managed objects/policies.
- `auth`: Supabase-managed users; application code does not alter its internal schema directly.

## Table catalog

| Table                    | Key fields / constraints                                                                                    | Important indexes                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `profiles`               | `user_id` PK/FK auth, created/updated timestamps                                                            | primary key                      |
| `memberships`            | `user_id` PK/FK profile, state, admitted/suspended/revoked/updated timestamps                               | primary key                      |
| `role_grants`            | id, user_id, elevated role, grantor/reason/time, revoker/reason/time; unique active grant                   | user history, active user/role   |
| `pen_names`              | id, owner_user_id, unique normalized slug, display name, state                                              | owner, slug, state               |
| `invitations`            | id, SHA-256 `code_hash` unique, inviter, parent invite, max/use count, expiry, revocation reason/actor/time | inviter/time, parent             |
| `invitation_redemptions` | id, invite_id, user_id unique, redeemed_at                                                                  | invite, user                     |
| `works`                  | id, status, language, rating_id, current_revision_id, publication times                                     | status/date, language/rating     |
| `work_authors`           | work_id + pen_name_id unique, position                                                                      | pen name, work/position          |
| `chapters`               | id, work_id, position unique per work, current_revision_id                                                  | work/position                    |
| `work_revisions`         | id, work_id, revision_no unique, immutable JSON snapshot                                                    | work/revision, created_at        |
| `chapter_revisions`      | id, chapter_id, revision_no unique, TipTap JSON, plain text                                                 | chapter/revision                 |
| `series`                 | id, owner/visibility/state, slug                                                                            | slug, state                      |
| `series_works`           | series_id + work_id unique, position                                                                        | series/position                  |
| `ratings`                | id, code unique, label/order                                                                                | order                            |
| `warnings`               | id, code unique, label/state                                                                                | state                            |
| `work_warnings`          | work_id + warning_id unique                                                                                 | warning                          |
| `tags`                   | id, type, normalized_name, slug, state, canonical_tag_id                                                    | type/name, canonical, search     |
| `work_tags`              | work_id + tag_id unique, submitted label/order                                                              | tag, work/order                  |
| `assets`                 | id, owner, bucket/path unique, media type, size, scan/state                                                 | owner, state                     |
| `kudos`                  | work_id + user_id unique, created_at                                                                        | work/date, user                  |
| `bookmarks`              | id, user_id + work_id unique, visibility, recommended, notes                                                | user/date, public recommendation |
| `comments`               | id, work/chapter, parent_id, user_id, attribution, state, body/revision                                     | target/date, parent, state       |
| `reading_progress`       | user_id + work_id unique, chapter/position, updated_at                                                      | user/recent                      |
| `reports`                | id, reporter, target type/id, state, assignee, created_at                                                   | state/date, target, reporter     |
| `report_evidence`        | report_id + asset_id unique                                                                                 | report                           |
| `report_events`          | id, report_id, actor, event type, from/to, immutable payload                                                | report/date                      |
| `audit_logs`             | identity id, actor, action, target type/id, reason, immutable JSON metadata, timestamp                      | actor/date, target/date          |
| `notifications`          | id, user, type, state, payload ref                                                                          | user/state/date                  |
| `daily_metrics`          | date + metric + dimension hash unique, aggregate value                                                      | date/metric                      |

## Content representation

- Work metadata snapshots and chapter TipTap JSON are versioned with an explicit `schema_version`.
- Validate JSON size and node/mark allowlist before write.
- Store derived plain text for search and accessibility fallbacks.
- Sanitized HTML is generated by trusted server code and may be cached only as a derived representation.

## Functions and triggers

Potential database functions are limited to atomic invariants, authorization helpers, counters and audit capture that cannot be safely expressed elsewhere. Each requires fixed `search_path`, explicit grants and tests. Business workflows should remain readable in server modules rather than disappear into triggers.

Likely atomic operations:

- redeem invitation with use-count/expiry/revocation check;
- publish revision and move current pointer transactionally;
- restore revision by creating a new snapshot;
- canonicalize/merge tag with redirect preservation;
- transition report state with event creation;
- role/membership transition with audit event.

Phase 1C implements the identity/access operations as explicit functions: `create_invitation`, `revoke_invitation`, `redeem_invitation`, `grant_role`, `revoke_role`, `set_membership_state`, and the private one-time `bootstrap_super_admin`. All are `security definer` with `search_path = ''`; public workflows are executable only by `authenticated`, and bootstrap remains owner-only.

## Seed and migration policy

- Migrations define extensions, tables, constraints, indexes, grants, RLS and policies.
- Controlled vocabularies use idempotent seed migrations.
- Development seeds use synthetic users/content and never production exports.
- All schema changes rebuild cleanly locally/CI and upgrade from the prior revision.

## Storage buckets (proposed)

- `avatars`: public only if policy approves; strip metadata and transform safely.
- `work-assets`: gated/private by default.
- `report-evidence`: strictly private, short-lived according to policy.
- `exports`: private, expiring and owner-scoped.

Exact bucket limits and allowed MIME types depend on KI-003/KI-005.
