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

Every index document records ID, table/columns/expression, query owner, uniqueness, write/storage cost, migration, expected plan and removal trigger. Query-plan evidence is required before production approval.
