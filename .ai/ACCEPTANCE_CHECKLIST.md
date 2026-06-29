# Acceptance Checklist

No task, feature, Sprint, or release is complete until every applicable item passes. “N/A” requires a written reason.

## Before development

- [ ] Environment Check passed with recorded evidence.
- [ ] Toolchain Check passed with recorded evidence.
- [ ] Version Check passed with recorded evidence.
- [ ] Dependency Check passed with recorded evidence.
- [ ] Research sources and findings are documented.
- [ ] Requirement, user value, non-goals and acceptance criteria are approved.
- [ ] Architecture and affected domain boundaries are documented.
- [ ] Database entities, migrations, lifecycle and RLS effects are designed.
- [ ] API/server contract, validation and error behavior are designed.
- [ ] UI states, responsive behavior and accessibility are designed.
- [ ] Security, privacy, abuse, performance and operational risks are reviewed.
- [ ] No blocking item remains open in `KNOWN_ISSUES.md`.
- [ ] The current Product Phase and its approved Sprint explicitly authorize the implementation scope.

## Implementation quality

- [ ] The approved stack and existing module boundaries are followed.
- [ ] No duplicated components, contracts, validation or authorization logic were introduced.
- [ ] TypeScript strict checks, lint, formatting and build pass.
- [ ] Unit/integration tests cover domain behavior and edge cases.
- [ ] RLS and permission tests cover allowed and forbidden access for every affected role.
- [ ] Critical user journeys have end-to-end coverage.
- [ ] Loading, empty, error, denied, success and destructive-confirmation states exist where relevant.
- [ ] Mobile, keyboard, screen-reader, contrast and reduced-motion checks pass where relevant.
- [ ] Secrets and private identities are absent from client bundles, logs and diffs.
- [ ] Migration, rollback, cache invalidation and deployment effects are verified.

## Review and handoff

- [ ] Code/diff review found no unrelated changes or unresolved high-risk comments.
- [ ] Product acceptance criteria pass.
- [ ] Documentation, diagrams and API/schema contracts match the implementation.
- [ ] `PROJECT_STATUS.md`, `CHANGELOG.md` and `MEMORY.md` are reconciled.
- [ ] New decisions are recorded in `DECISIONS.md`.
- [ ] Known issues and technical debt are recorded with owner and trigger.
- [ ] Monitoring, release and rollback instructions are adequate for the change.

## Phase 0–0.6 foundation acceptance

- [x] Required directories and AI memory documents exist.
- [x] Fixed technology stack and replacement rule are recorded.
- [x] Product, architecture, database, API, UI, security, deployment, risk and roadmap documents exist.
- [x] Documentation explicitly separates confirmed decisions from open questions.
- [x] `apps/docs` and all nine package boundaries have README ownership contracts.
- [x] Detailed documentation uses the frozen numbered `00_Project`–`18_Research` taxonomy.
- [x] The seventeen-file startup order, language policy, environment policy, escalation workflow, design decisions, feature flags, style guide and AI behavior contract exist.
- [x] Product principles and Product Phase Roadmap exist.
- [x] Vision, Non-Goals and canonical Glossary exist.
- [x] UI, Design System and Component layers are separated.
- [x] Database and API categories have registries/templates and migrated source documents.
- [x] ADR registry and permanent decision records exist.
- [x] Every Product Phase has README, Goals, Scope, Acceptance, Risks, Sprint Template and Retrospective.
- [x] No application code, business logic, pages, package installation or database migration exists.
- [x] Product owner has reviewed and approved Phase 0.6.
- [x] Phase 1 authentication/invitation blockers are resolved through D-033/ADR-018.

## Phase 1 current acceptance evidence

- [x] Environment, toolchain, version and frozen dependency checks pass.
- [x] TypeScript, lint, unit/contract tests and production build pass.
- [x] Identity/provider, repository/database and ObjectStorage platform boundaries are implemented.
- [x] Invitation admission, Membership-derived Reader, manual elevated grants, audit and RLS contracts are implemented.
- [ ] Ordered migrations rebuild cleanly and the SQL allow/deny matrix passes in a disposable database.
- [ ] Product Owner approves Phase 1 completion and entry to Phase 2.
