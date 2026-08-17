# Supabase Schema Blueprint

Status: Phase 1C identity/access, Phase 2 / Sprint 002A content-domain subsets and Admin P1-02A/B/C database foundations are implemented in local SQL migrations; remaining catalog is proposed.

## Schema separation

- `public`: RLS-protected application tables exposed through Supabase APIs only where needed.
- `private`: internal helpers, sensitive operational projections and privileged routines not directly exposed.
- `storage`: Supabase-managed objects/policies.
- `auth`: Supabase-managed users; application code does not alter its internal schema directly.

## Table catalog

| Table                                                   | Key fields / constraints                                                                                                   | Important indexes                   |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `profiles`                                              | `user_id` PK/FK auth, created/updated timestamps                                                                           | primary key                         |
| `memberships`                                           | `user_id` PK/FK profile, state, admitted/suspended/revoked/updated timestamps                                              | primary key                         |
| `role_grants`                                           | id, user_id, elevated role, grantor/reason/time, revoker/reason/time; unique active grant                                  | user history, active user/role      |
| `pen_names`                                             | id, owner_user_id, unique normalized slug, display name, state                                                             | owner, slug, state                  |
| `invitations`                                           | id, SHA-256 `code_hash` unique, inviter, parent invite, max/use count, expiry, revocation reason/actor/time                | inviter/time, parent                |
| `invitation_redemptions`                                | id, invite_id, user_id unique, redeemed_at                                                                                 | invite, user                        |
| `works`                                                 | id, private owner, title/slug/summary, category, status and publication times                                              | slug, owner/recent, publish feed    |
| `work_authors`                                          | work_id + pen_name_id unique, position                                                                                     | pen name, work/position             |
| `chapters`                                              | id, work_id, position/slug unique per work, status, JSON content/schema version                                            | work/status/position                |
| `articles`                                              | id, private owner, title/slug/summary, category, status, JSON content/schema version                                       | slug, owner/recent, publish feed    |
| `work_revisions`                                        | id, work_id, revision_no unique, immutable JSON snapshot                                                                   | work/revision, created_at           |
| `chapter_revisions`                                     | id, chapter_id, revision_no unique, TipTap JSON, plain text                                                                | chapter/revision                    |
| `series`                                                | id, owner/visibility/state, slug                                                                                           | slug, state                         |
| `series_works`                                          | series_id + work_id unique, position                                                                                       | series/position                     |
| `ratings`                                               | id, code unique, label/order                                                                                               | order                               |
| `warnings`                                              | id, code unique, label/state                                                                                               | state                               |
| `work_warnings`                                         | work_id + warning_id unique                                                                                                | warning                             |
| `content_categories`                                    | id, name/slug unique, description, timestamps                                                                              | slug                                |
| `content_tags`                                          | id, type, name/slug unique, governance state, canonical_tag_id                                                             | slug, type/state, canonical         |
| `work_tags`                                             | work_id + tag_id unique, submitted label/order                                                                             | tag, work/order                     |
| `article_tags`                                          | article_id + tag_id unique                                                                                                 | tag, article                        |
| `assets`                                                | id, owner, bucket/path unique, media type, size, scan/state                                                                | owner, state                        |
| `kudos`                                                 | work_id + user_id unique, created_at                                                                                       | work/date, user                     |
| `bookmarks`                                             | id, user_id + work_id unique, visibility, recommended, notes                                                               | user/date, public recommendation    |
| `comments`                                              | id, work/chapter, parent_id, user_id, attribution, state, body/revision                                                    | target/date, parent, state          |
| `reading_progress`                                      | user_id + work_id unique, chapter/position, updated_at                                                                     | user/recent                         |
| `reports`                                               | id, reporter, target type/id, state, assignee, created_at                                                                  | state/date, target, reporter        |
| `report_evidence`                                       | report_id + asset_id unique                                                                                                | report                              |
| `report_events`                                         | id, report_id, actor, event type, from/to, immutable payload                                                               | report/date                         |
| `audit_logs`                                            | identity id, actor, action, target type/id, reason, immutable JSON metadata, timestamp                                     | actor/date, target/date             |
| `private.identity_access_request_ledger` (P1-02A local) | request UUID, actor/target/operation, SHA-256 payload fingerprint, closed result snapshot, optional unique Audit reference | request PK, actor/date, target/date |
| `notifications`                                         | id, user, type, state, payload ref                                                                                         | user/state/date                     |
| `daily_metrics`                                         | date + metric + dimension hash unique, aggregate value                                                                     | date/metric                         |

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

Admin P1-02A locally implements the P1-01 private request ledger proposal as `private.identity_access_request_ledger`. It is not a role or Membership fact and is outside the Data API. It retains the global request UUID, actor/target/operation, SHA-256 payload fingerprint and original `saved/unchanged/conflict` result so a future controlled mutation can replay a result without a duplicate business change or Audit. The operation constraint contains only Author Grant, Author Revoke and ordinary-account Membership state change; it cannot record or authorize an elevated operation. RLS is enabled with no application policies, and `PUBLIC`, `anon`, `authenticated` and `service_role` have no direct table privileges.

P1-02A also adds private `security invoker` helpers for canonical reason validation, database-derived expected-state snapshots/tokens and payload fingerprints. It replaces the narrower site-copy Audit trigger with a global `audit_logs` UPDATE/DELETE guard while preserving the stable site-copy error. No read or write RPC is created, and no existing Membership/Role RPC execute grant changes. Local acceptance evidence is in [`P1_02A_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02A_ACCEPTANCE_EVIDENCE.md).

P1-02B locally adds three read-only RPCs without new tables, views, policies or table grants. `search_identity_access_subjects_v1` and `list_identity_access_audit_v1` are stable invoker functions over existing SELECT/RLS; `get_identity_access_subject_v1` is the sole stable definer read boundary approved by ADR-023 and calls the unexposed P1-02A snapshot/token helpers after live caller authorization. All three use empty `search_path`, authenticated-only exact execute grants, bounded keyset pagination where applicable and field-minimized JSON projections. Evidence is in [`P1_02B_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02B_ACCEPTANCE_EVIDENCE.md).

P1-02C locally adds three narrow ordinary mutation definitions and one owner-only private execution helper. The public signatures express only Author Grant/Revoke and ordinary Membership state; all are volatile definer functions with empty `search_path`, live actor/target checks, fixed request/global/final-Super-Admin/row lock order, P1-02A fingerprint/state helpers and atomic business/Audit/Ledger results. `PUBLIC/anon/authenticated/service_role` have no execute; legacy RPC grants, tables, policies and P1-02B reads are unchanged. Evidence is in [`P1_02C_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02C_ACCEPTANCE_EVIDENCE.md).

Phase 2 / Sprint 002A adds only a private `set_updated_at` trigger helper and a parameterless active-member helper for RLS. It does not add content-specific role tables, privileged workflow RPCs, editor functions or Revision functions.

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
