# Testing Strategy

Status: Proposed. Concrete tools are pinned during approved Phase 1 Sprint planning without changing the required coverage model.

## Principles

- Test user-visible behavior, domain invariants and security boundaries.
- Prefer the lowest reliable test layer; retain end-to-end tests for critical cross-system journeys.
- Every bug fix adds a regression test when reproducible.
- Flaky tests are defects, not permanently retried background noise.

## Test layers

| Layer          | Scope                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Static         | Strict TypeScript, lint, formatting, dependency boundaries and secret scanning                      |
| Unit           | Pure domain logic, Zod schemas, content transforms, tag rules, permission helpers                   |
| Component      | Accessible states and interactions for shared UI/editor controls                                    |
| Database       | Constraints, functions, migrations, RLS grants/policies and concurrency invariants                  |
| Integration    | Server Actions/Route Handlers with database/storage/auth boundaries                                 |
| End-to-end     | Invite admission, sign-in, role changes, publish/read, interaction, report/Admin and recovery paths |
| Non-functional | Accessibility, performance budgets, security checks and restore/migration rehearsal                 |

## Permission testing

Generate cases from `ROLE_PERMISSION_MATRIX.md` and `RLS_POLICY_MATRIX.md`: unauthenticated, inactive, Reader, unrelated Author, owning Author, Admin, Super Admin, revoked role and suspended member. Test create/read/update/delete plus forbidden field exposure.

## Critical end-to-end journeys

1. Visitor denied work → valid invite redeemed → Reader reads.
2. Admin grants Author → Author creates pen name → publishes versioned work → Reader reads.
3. Author edits → diff available → restore creates new revision.
4. Reader searches/tags/bookmarks/Kudos/comments under approved policies.
5. Reader reports → Admin processes → author receives safe notice → audit event exists.
6. Revocation/suspension immediately blocks direct page, API and asset access.
7. Backup restore/migration rebuild preserves schema and authorization behavior.

## Test data

- Synthetic fixtures only outside production.
- RR-1C authenticated local acceptance identities use the explicit
  [Local QA Fixture](LOCAL_QA_FIXTURE.md); credentials stay in a Git-ignored local
  file and are never written into public documentation.
- Factories explicitly encode owner/unrelated-role relationships.
- Rich-content fixtures include empty, huge, malformed, Unicode, RTL/CJK, pasted markup and unsafe payload cases.
- Never copy production user content into local, CI, Preview or staging.

## Accessibility and visual quality

Automated checks supplement, not replace, keyboard, focus, screen-reader and zoom testing. Representative Reader/Author/Admin screens receive visual regression coverage after the design system exists.

## CI gates

Fast static/unit checks run on every change; database/integration/end-to-end suites run before merge according to cost. Migrations always receive clean-rebuild and upgrade-path tests. No skipped security test may merge without a documented blocker and approval.
