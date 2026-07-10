# Domain Data Model

Status: Phase 1C identity/access and Phase 2 / Sprint 002A content-domain subsets implemented; remaining domains are conceptual.

## Domain groups

### Identity and access

- `profiles`: private application profile keyed to Supabase Auth user; contains the case-insensitive unique registration name but no reader-facing author pen name.
- `memberships`: admission state (`pending`, `active`, `suspended`, `revoked`) and admission source.
- `role_grants`: explicit Author/Admin/Super Admin grants with grantor, reason and revocation lifecycle. Reader capability is derived from active membership and is never stored as a grant.
- `pen_names`: public creator identities owned privately by one account.
- `invitations`: hashed invitation secret, creator, limits, expiry and revocation.
- `invitation_redemptions`: one redemption event linking invite to admitted account.

### Archive

- `works`: stable multi-chapter work identity, private authorization owner, lifecycle and publication metadata.
- `work_authors`: ordered many-to-many relation from works to pen names.
- `chapters`: stable ordered chapter identity with schema-versioned JSON content.
- `articles`: standalone article identity, private authorization owner, lifecycle and schema-versioned JSON content.
- `series` and `series_works`: series identity and ordered membership.
- `work_revisions` / `chapter_revisions`: immutable snapshots with author, reason and source restoration reference.
- `assets`: private file metadata, ownership, processing state and storage key.

### Metadata

- `content_categories`: shared single-select category vocabulary for works and articles.
- `content_tags`: shared typed tag vocabulary with pending/canonical/alias/deprecated governance state.
- `work_tags` / `article_tags`: many-to-many content/tag relations.
- `ratings`: controlled rating vocabulary.
- `warnings`: controlled warning vocabulary.
- `work_warnings`: work-to-warning relation.
- `tags`: typed fandom/character/relationship/additional tags with governance state.
- `tag_aliases` or canonical link: redirects non-canonical names to canonical tags.
- `work_tags`: work-to-tag relation preserving the submitted label/order where needed.

### Interaction

- `kudos`: unique active Kudos per member/work.
- `bookmarks`: private/public bookmark with optional recommendation state and private notes.
- `comments`: work/chapter thread, moderation status and public attribution mode.
- `reading_progress`: private current position/preferences per member/work.
- `reading_events` or history entries only if approved under KI-015.

### Trust, administration and analytics

- `reports`: target, reporter, category, reason, workflow state and assignment.
- `report_evidence`: private asset links.
- `report_events`: append-only state and action history.
- `notifications`: minimal delivery state for required product notices when approved.
- `audit_logs`: append-only privileged action record.
- `analytics_events`: minimized raw events only if approved.
- `daily_metrics`: privacy-reviewed aggregates derived from source data/events.

## Key relationships

```text
auth.users 1─1 profiles 1─1 memberships
     │             ├─* role_grants
     ├─* owner authorization ─1 works 1─* chapters
     ├─* owner authorization ─1 articles
     ├─* future pen_names ─* work_authors *─1 works
     └─* invitation_redemptions *─1 invitations

works *─* content_tags
articles *─* content_tags
works/articles *─1 content_categories
works *─* warnings
works *─* series
works 1─* work_revisions
chapters 1─* chapter_revisions

profiles 1─* kudos/bookmarks/comments/reading_progress/reports
reports 1─* report_events/report_evidence
```

## Invariants

1. Active archive access requires active membership regardless of role.
2. Invitation redemption can create membership but never an elevated role grant.
3. Phase 2 / Sprint 002A uses a private `owner_user_id` for authorization only; it is not reader-facing authorship.
4. Only the active Author owner may author-edit content; Admin/Super Admin management is separate. Public Pen Name authorship remains a later boundary.
5. Current work/chapter content points to an immutable revision.
6. Restore creates a new revision; it never mutates or deletes history.
7. A tag alias resolves to one canonical tag of compatible type and cycles are impossible.
8. Reader-facing responses use pen-name identity, never private profile/auth identity.
9. Report state changes and privileged changes are append-only events.
10. Derived counts and analytics can be rebuilt and are never used as sole authorization truth.

## Lifecycle concepts

- Works: draft → published ↔ updated; may become hidden/archived; deletion follows retention policy.
- Chapters: draft → published; ordering changes are audited in work revision context.
- Tags: pending/free-form → canonical or aliased/merged; deprecated targets retain redirects.
- Invitations: active → exhausted/expired/revoked.
- Memberships: pending → active → suspended/revoked, with explicit reinstatement event.
- Reports: pending → in_progress → rejected/resolved; reopening creates another event.

## Phase 1C implemented subset

- `profiles`, `memberships`, `role_grants`, `invitations`, `invitation_redemptions` and `audit_logs` exist in ordered local migrations.
- Invitation secrets are generated in the service layer; only SHA-256 hashes cross the database boundary.
- V1 password registration locks and validates the invitation during `auth.users` insertion, then atomically creates the Profile, active Membership, Redemption, invite count and audit event. It does not require email verification and never grants an elevated role.
- Role and membership mutations are security-definer database functions with a fixed empty `search_path`, explicit execution grants and audit writes.
- The first Super Admin is a one-time owner-only bootstrap function; it is not exposed to application roles and no production identity is seeded.

## Phase 2 / Sprint 002A implemented subset

- `works`, `chapters`, `articles`, `content_categories`, `content_tags`, `work_tags` and `article_tags` exist in one additive migration.
- Works/articles use global per-resource slug uniqueness; chapters use `(work_id, slug)` uniqueness; all slugs are lowercase ASCII kebab-case.
- `owner_user_id` references `profiles` but is excluded from authenticated read grants. The field is authorization data, not public attribution.
- Active Membership reads `published` rows. Owning Authors read/manage their own rows; Admin/Super Admin manage all rows. Visitor, inactive, suspended and revoked identities remain denied.
- Core content has no direct DELETE grant while retention is unresolved. `archived` is the non-destructive lifecycle state.

## Design decisions still required

Exact anonymous-comment identity, non-text content formats, deletion retention, invite permission limits, analytics events and reading-history defaults remain blocked by `.ai/KNOWN_ISSUES.md`.
