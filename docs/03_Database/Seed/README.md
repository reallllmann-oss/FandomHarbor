# Seed Documentation

Two seed classes are allowed:

1. Controlled product vocabulary delivered through idempotent reviewed migrations.
2. Synthetic local/test fixtures that contain no copied production user data.

Sprint 002D-Step02 adds the first approved controlled content vocabulary:

- Categories: 小说、同人、原创、随笔、设定集。
- Tags: Harbor、连载中、已完结、短篇、长篇、轻松、治愈、剧情、角色向、世界观。
- Every V1 Tag is explicitly mapped to `tag_type = additional` and `governance_state = canonical`.
- Stable UUIDs and slug-conflict upserts live in `20260701100000_v1_content_taxonomy.sql`.
- No `seed.sql` is introduced; production vocabulary is reproducible through the ordered Migration.

Future ratings, warning codes, report categories/states and other controlled vocabularies still require explicit approval. Users, Works, fandom/relationship content and synthetic test fixtures are not silently hardcoded as production data.

Each seed set documents identifier stability, localization labels, update/deprecation rules and its owning migration.
