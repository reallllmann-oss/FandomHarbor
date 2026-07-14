# Fandom Harbor Documentation Center

`docs/` is the permanent product and engineering documentation source of truth. `.ai/` is the mandatory memory and execution gate; `apps/docs` may later render approved documents but cannot become an editable copy.

## Frozen taxonomy

| Directory                   | Responsibility                                                             |
| --------------------------- | -------------------------------------------------------------------------- |
| `00_Project`                | Vision, Principles, Non-Goals, Glossary and project-wide governance        |
| `01_Product`                | PRD, product acceptance and role/permission requirements                   |
| `02_Architecture`           | System/information architecture, navigation and technical-debt strategy    |
| `03_Database`               | ERD, Migration, Policies, RLS, Seed, Indexes and Lifecycle registries      |
| `04_API`                    | REST, Server Actions, Realtime, Webhooks, Events, Errors and Contracts     |
| `05_UI`                     | Visual experience and UI direction                                         |
| `06_Design_System`          | Reusable tokens, accessibility and Reader/Admin layout rules               |
| `07_Component`              | Component implementation contracts                                         |
| `08_Security`               | Threat model and architecture risk                                         |
| `09_Reader`                 | Reader/reading requirements and journeys                                   |
| `10_Author`                 | Author/publishing requirements and journeys                                |
| `11_Admin`                  | Admin operations and governance                                            |
| `12_SuperAdmin`             | Highest-risk operations and recovery                                       |
| `13_Test`                   | Test strategy, Local QA Fixture and mandatory Manual QA handoff rules      |
| `14_Deploy`                 | Environments, deployment, rollback and recovery                            |
| `15_Sprint`                 | Product Phase Roadmap and per-Phase Sprint documents                       |
| `16_Meeting`                | Decision/review meeting records                                            |
| `17_Architecture_Decisions` | Permanent Architecture Decision Records                                    |
| `18_Design`                 | UX Design Intelligence, brand experience foundation and reference analysis |
| `18_Research`               | Research protocol and verified references                                  |

## Mandatory separation

- UI describes the intended visual/interaction experience.
- Design System defines reusable tokens and layout/accessibility rules.
- Component defines implementation behavior and states.
- Database tables/migrations/policies/RLS/indexes/seeds/lifecycle have explicit registry ownership.
- REST, Server Actions, Realtime, Webhooks, Events, Errors and Contracts never share an ambiguous interface category.
- `.ai/DECISIONS.md` is compact memory; ADRs preserve permanent rationale.
- Product Phase is evolution; Sprint is execution inside one Phase.
- `18_Design/QA_FIXTURE_LIBRARY.md` governs the reusable non-production Reading QA
  content foundation; operational credentials remain owned by `13_Test`.

## Status rules

- Draft: incomplete.
- Proposed: ready for review.
- Accepted/Approved: implementation source.
- Superseded: retained and linked to replacement.

Moving or renaming a document requires same-task updates to this map, every repository reference, `.ai/MEMORY.md`, `.ai/CHANGELOG.md` and relevant ADR/decision. After Phase 0.6 approval, large-scale taxonomy restructuring is prohibited without a new superseding ADR and product-owner approval.
