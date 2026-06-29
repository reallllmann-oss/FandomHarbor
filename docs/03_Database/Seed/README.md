# Seed Documentation

Two seed classes are allowed:

1. Controlled product vocabulary delivered through idempotent reviewed migrations.
2. Synthetic local/test fixtures that contain no copied production user data.

Initial controlled candidates: ratings, warning codes, report categories/states and stable role codes. Tags, fandoms, relationships, users and works are not silently hardcoded as production seeds.

Each seed set documents identifier stability, localization labels, update/deprecation rules and its owning migration. No seed SQL exists in Phase 0.6.
