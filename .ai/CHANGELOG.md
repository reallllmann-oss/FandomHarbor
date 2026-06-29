# Changelog

All notable project changes are recorded here. Dates use `YYYY-MM-DD`.

## 2026-06-28 — Sprint 0

### Added

- Created the `FandomHarbor` project directory structure.
- Added the mandatory AI memory and development-governance documents.
- Recorded the confirmed product vision, roles, access model, scope boundaries, and decisions.
- Added documentation areas for product, architecture, database, API, UI, Sprints, meetings, and research.
- Added empty application, package, Supabase, and scripts directories without introducing code or choosing a technical stack.
- Added Sprint 0–5 prompt documents as planning guardrails.

### Not added

- No business functionality, dependencies, database schema, framework configuration, or deployment configuration.

## 2026-06-28 — Foundation Rebuild

### Added

- Expanded mandatory startup memory with `KNOWN_ISSUES.md`, `TECH_STACK.md` and `ACCEPTANCE_CHECKLIST.md`.
- Recorded the product-owner-approved Next.js/Supabase/Tailwind/shadcn/TipTap stack without installing packages.
- Added complete PRD, feature acceptance, role/permission, information architecture and navigation documentation.
- Added modular-monolith architecture, deployment, risk and technical-debt strategies.
- Added foundation threat model and testing strategy, including explicit permission/RLS negative-test coverage.
- Added conceptual domain model, Supabase schema blueprint, RLS matrix and data lifecycle documentation.
- Added API/server contract catalog and UI Design Bible, token and component rules.
- Added research protocol, official stack references, Sprint roadmap and review templates.
- Added repository-neutral `.editorconfig`, `.gitignore` and boundary READMEs.

### Changed

- Defined `apps/web` as Visitor/Reader/Author and `apps/admin` as Admin/Super Admin.
- Removed the empty `apps/shared` directory; shared implementation must use purpose-specific packages.
- Reframed Sprint 0–5 files as milestone envelopes that require approved outcome-sized briefs.
- Converted decision history into dated, status-bearing records with consequences.

### Not added

- No application code, pages, business logic, packages, lockfile, SQL migration, Supabase project, Git repository or deployment.

## 2026-06-28 — Phase 0.5: Freeze Product Blueprint

### Added

- Added `apps/docs` with a read-only documentation application boundary README.
- Expanded packages structure with `editor`, `auth`, `services`, `types` and `constants`; all nine package directories now contain purpose READMEs.
- Added `.ai/DESIGN_DECISIONS.md` for UI, interaction, product and reading-experience decisions.
- Added `.ai/FEATURE_FLAGS.md` with approved blueprint defaults and flag governance.
- Added `.ai/STYLE_GUIDE.md` with concrete reading, control, navigation, form, table and tag rules.
- Added `docs/00_Project/PRINCIPLES.md` with the ten Product and Engineering Principles.

### Changed

- Reorganized docs into numbered folders `00_Project` through `16_Research` without deleting existing document content.
- Updated all repository references from legacy docs paths to numbered paths.
- Updated `START_HERE.md` read order from 10 to 13 mandatory memory files.
- Reworked `docs/14_Sprint/ROADMAP.md` into the Product Phase Roadmap for Phase 0, 0.5 and 1–8.
- Defined Phase as the product stage and Sprint as an engineering unit within a Phase.
- Updated `PROJECT_STATUS.md` to Phase 0.5 — Freeze Product Blueprint.
- Updated app/package ownership, root documentation map, memory, rules and acceptance checklist.

### Conflicts preserved and resolved by supersession

- D-002's two-application count and D-009's app-count wording are retained historically but superseded by D-017, which adds the reserved `apps/docs` boundary.
- Legacy `SPRINT_1.md` through `SPRINT_5.md` content is retained and marked Superseded as product-stage planning; the Product Phase Roadmap is now authoritative.

### Not added

- No application code, page, business logic, dependency, lockfile, SQL migration, Supabase project or deployment configuration.

## 2026-06-28 — Phase 0.6: Product Freeze Review

### Added

- Added a dedicated `06_Design_System` layer with Color, Typography, Spacing, Grid, Radius, Elevation, Motion, Responsive, Dark Mode, Accessibility, Reader Layout and Admin Layout rules.
- Added Database registries for ERD, Migration, Policies, RLS, Seed, Indexes and Lifecycle; migrated existing schema/model/RLS/lifecycle documents into their owners.
- Added API registries for REST, ServerActions, Realtime, Webhooks, Events, Errors and Contracts; migrated the API specification into Contracts.
- Added `VISION.md`, `NON_GOALS.md`, `GLOSSARY.md` and `PRODUCT_RISKS.md`.
- Added `docs/17_Architecture_Decisions/` with ADR registry/template and ADR-001 through ADR-016.
- Added `.ai/AI_BEHAVIOR.md` and made it mandatory startup context.
- Added complete seven-document packages for Phase 0, 0.5, 0.6 and 1–8.

### Changed

- Frozen documentation taxonomy at `00_Project` through `18_Research`.
- Separated UI experience, Design System rules and Component implementation documentation.
- Inserted Phase 0.6 — Product Freeze Review into the Product Phase Roadmap.
- Updated startup order from 13 to 14 mandatory AI files.
- Updated root/docs indexes, rules, memory, status, decisions, acceptance gates and all live path references.
- Marked D-016 as superseded by D-019 and recorded final traceability/ADR/AI behavior decisions.

### Remaining gates

- Phase 0.6 still requires product-owner approval.
- Phase 1 remains blocked by unresolved authentication, invitation permission/lineage and transactional-email decisions.

### Not added

- No application code, page, business logic, dependency, lockfile, SQL migration, Supabase project or deployment configuration.

## 2026-06-28 — Phase 0.6 Supplement: Language Policy

### Added

- Added `.ai/LANGUAGE_POLICY.md` as the permanent policy for Product Owner communication, project artifact language and Sprint reporting.
- Recorded D-024 and made the language policy mandatory startup context.

### Changed

- Expanded the mandatory startup context from 14 to 15 files.
- Set Simplified Chinese as the default Product Owner communication language.
- Confirmed English for code, database and API identifiers, formal project documentation and Git metadata.
- Synchronized startup instructions, project memory, rules, status, acceptance references and the master prompt.

### Not added

- No application code, business logic, dependency, package installation, SQL migration or deployment configuration.

## 2026-06-28 — Phase 0.6 Supplement: Language Policy Revision

### Changed

- Replaced the English-document-content rule with Simplified Chinese content for formal product documentation.
- Retained English for file names, directory names, database identifiers, code identifiers, variables and API identifiers.
- Explicitly prohibited translation-only work for existing documents.
- Added D-025 to supersede D-024's language allocation while preserving mandatory startup and Sprint approval requirements.
- Synchronized the language policy, project memory, project rules and master prompt.

### Not changed

- Existing documents were not translated or rewritten for language consistency.
- Phase 0.6 remains awaiting Product Owner approval, and application development remains prohibited.

## 2026-06-28 — Phase 1 Supplement: Environment Policy

### Added

- Added `.ai/ENVIRONMENT_POLICY.md` as the permanent workflow for network, package installation, remote-service, runtime, CI, Sandbox and local environment failures.
- Added D-026 and made the environment policy mandatory startup context.

### Changed

- Expanded the mandatory startup context from 15 to 16 files.
- Required environment failures to stop the affected operation, enter Blocked status for Environment Issue and wait for Product Owner approval.
- Prohibited repeated retries, silent tool replacement, package-manager or registry changes, dependency downgrades and architecture workarounds.

### Protected

- No environment issue changed `PROJECT_STATUS.md`, Roadmap, Product Vision, Architecture or Sprint Acceptance.

## 2026-06-28 — Phase 1 Supplement: Escalation Rules

### Added

- Added `.ai/WORKFLOW.md` with permanent Tech Lead autonomy and Product Owner escalation boundaries.
- Added D-027 and made the workflow mandatory startup context.

### Changed

- Expanded the mandatory startup context from 16 to 17 files.
- Authorized autonomous refactoring, file organization, component extraction, performance optimization, bug fixes, test improvements and documentation updates.
- Required Product Owner approval for product, UX, schema, authentication, permission, dependency, technology, module-removal, roadmap and architecture changes.

### Protected

- The blocked dependency installation was not retried.
- No protected product or Sprint document was changed.

## 2026-06-29 — Phase 1 Supplement: Sprint Startup Gate

### Added

- Added the permanent Environment Check → Toolchain Check → Version Check → Dependency Check startup sequence to AI workflow and Sprint templates.
- Added D-028 and required recorded evidence before development begins.

### Changed

- Required root-cause diagnosis before any environment retry is considered.
- Updated the environment policy, project memory, project rules, global Sprint template and every Phase Sprint template.

### Protected

- No dependency installation was started.
- No application, product, database, permission or architecture behavior changed.

## 2026-06-29 — Phase 1 Supplement: Runtime Contract

### Added

- Added the permanent Runtime Contract to `.ai/ENVIRONMENT_POLICY.md`.
- Added D-029 for NVM-provided Node.js 24.x, current approved Node.js 24.18.0, pnpm 11.7.0 and the official npm registry.

### Changed

- Initialized NVM in login and non-interactive zsh through an append-only `~/.zprofile` change.
- Unified the NVM Node.js 24 environment and project commands on pnpm 11.7.0.
- Required local, Codex, CI, Git Hooks, Playwright and Vercel to inherit the canonical runtime from their environment.
- Limited Husky/Git Hooks to runtime verification; they may not switch Node.js.

### Protected

- No project dependency installation, migration, authentication, RLS, business code or page development was executed.

## 2026-06-29 — Phase 1 Supplement: Root-Cause Retry Limit

### Changed

- Replaced the one-operation-only interpretation with one Product Owner-approved controlled retry per root cause.
- Required mandatory stop when the controlled retry fails for the same root cause.
- Clarified that a materially different root cause requires evidence and a new Environment Issue report.
- Clarified that tool-internal reconnect attempts belong to one top-level operation and must be reported.

### Protected

- Retry remains prohibited before diagnosis and Product Owner approval.
- No installation, dependency, registry, architecture or business change was executed.

## 2026-06-29 — Phase 1C: Identity Access Core

### Added

- Added validated `RuntimeConfig`, provider-neutral trusted identity/session and capability types, repository/database adapters and an `ObjectStorage` interface.
- Added Supabase SSR auth adapters for verified email/password without exposing provider `User`/`Session` contracts to business modules.
- Added invitation service orchestration with one-time plaintext secrets and SHA-256 persistence boundaries.
- Added ordered migrations for profiles, Membership, elevated role grants, invitations/redemptions, audit logs, RLS/grants and atomic security-definer workflows.
- Added Web/Admin access shells for sign-in/sign-up, invitation redemption/management and audited membership/role administration.
- Added unit, repository, static migration-contract and transactional SQL role-matrix tests.
- Added ADR-018 and the approved Phase 1C Sprint brief.

### Changed

- Added exact `@supabase/ssr@0.12.0`, reusing approved `zod@4.4.3` and `@supabase/supabase-js@2.108.2`; updated only the approved manifests and lockfile.
- Synchronized database/API contracts, RLS matrix, migration registry, package boundaries, project status and phase documentation.
- Resolved KI-001, KI-006 and KI-011 through D-033/ADR-018.

### Verification

- Frozen install, Node/pnpm/registry checks, typecheck, lint, unit/contract tests and all three Next.js production builds pass.
- Transactional SQL tests are prepared but not executed because the current environment provides no Supabase CLI, PostgreSQL client or Docker runtime.

### Not changed

- No cloud resource, registry, package manager, second infrastructure provider, ORM, email SDK, Storage SDK or deployment configuration was added.
- No Phase 2 publishing/content feature was implemented.

## 2026-06-29 — Monorepo Dev Server And Env Troubleshooting

### Added

- Added `.ai/TROUBLESHOOTING.md` to centralize local development troubleshooting for env loading, Turborepo dynamic ports, Supabase CLI, pnpm workspace behavior and Next multi-lockfile warnings.

### Changed

- Updated `START_HERE.md` to route dev-startup, local-port and env-loading issues to `TROUBLESHOOTING.md`.
- Updated `PROJECT_RULES.md` to forbid fixed port assumptions across `apps/web`, `apps/admin` and `apps/docs`.
- Updated `README.md` with the authoritative dev-server rule: always use the terminal `Local:` address instead of assumed ports.
- Recorded the current `.env.local` synchronization expectation for `apps/web` and `apps/admin`, plus the first-response checklist for Runtime Zod env failures.

### Not changed

- No business code, package manifest, lockfile, runtime contract, Supabase configuration or deployment configuration was modified.
