# Database Policy Registry

Database policies are durable product/data invariants that are stronger than page behavior. RLS access policies live separately in `../RLS/`.

Initial policy families:

- `POL-IDENTITY`: invitation admission cannot grant elevated roles.
- `POL-AUTHORSHIP`: work mutation derives ownership through pen-name authorship.
- `POL-REVISION`: published content revisions are immutable; restore creates a new revision.
- `POL-TAG`: canonical aliases are type-compatible and cycle-free.
- `POL-MODERATION`: report transitions and privileged actions append history/audit events.
- `POL-PRIVACY`: private identity and behavioral data use minimum necessary access.

Each implemented policy uses `POLICY_TEMPLATE.md` and references its enforcing constraints/functions/migrations/tests.
