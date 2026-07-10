# Index Registry

Indexes are owned by measured query/constraint needs, not added speculatively.

Initial candidate families:

- Membership/role active-state lookup
- Invitation hash, inviter, state and expiry lookup
- Work publication/update/filter fields
- Work/chapter/series order uniqueness
- Typed normalized tag and canonical resolution
- PostgreSQL text/trigram search projection
- Interaction uniqueness and recent ordering
- Report state/assignee/created-at queue
- Audit actor/target/action/time search

## Phase 2 / Sprint 002A implemented indexes

- Global unique slug indexes for `works`, `articles`, `content_categories` and `content_tags`.
- Per-work unique `(work_id, slug)` and `(work_id, position)` indexes for chapters.
- Owner/recent and published-feed indexes for works/articles.
- Work/status/position index for chapter reading order.
- Reverse tag lookup indexes for `work_tags` and `article_tags`.
- Tag type/governance and canonical-target indexes for governance queries.

Every index document records ID, table/columns/expression, query owner, uniqueness, write/storage cost, migration, expected plan and removal trigger. Query-plan evidence is required before production approval.
