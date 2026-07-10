# Changelog

All notable project changes are recorded here. Dates use `YYYY-MM-DD`.

## 2026-07-11 — Mission RR-1C Local QA Fixture Repair

- Added localhost-guarded `qa:fixture`, `qa:reset` and `qa:web` workflows for
  authenticated local Product Owner acceptance.
- Added synthetic `Harbor QA Reader` and `Harbor QA Author` identities with active
  memberships, Author grant/profile and invitation relationship.
- Kept passwords and plaintext invitation data exclusively in Git-ignored local
  credentials with mode `0600`.
- Rebuilt all 14 local migrations and restored the fixture afterward; repeated
  execution is idempotent.
- Browser QA passes Author login/Profile/Studio, Reader login/content access and
  Reader Studio denial with zero console errors.
- No production data, Migration, RLS, Auth architecture or Permission Model changed.
- RR-1C remains awaiting Product Owner final acceptance.

## 2026-07-10 — Mission RR-1C Release Candidate Engineering Complete

- Completed final Runtime, Migration, SQL, Validation, Browser QA, Mobile QA,
  Documentation and Known Issues audits.
- Rebuilt local Supabase from zero with 14 migrations, confirmed local/remote
  14/14 parity, passed local schema lint and six SQL suites.
- `pnpm validate` passes formatting, lint, typecheck, 167 tests and Web/Admin/Docs
  builds with P0 at zero.
- Final desktop and 390×844 mobile QA pass on public discovery, SEO endpoints,
  metadata, unauthenticated guards and responsive overflow checks.
- Created the Release Candidate Report and Beta Ready Checklist.
- Established the Release Candidate Git baseline at `final RR-1C Git HEAD（见最终 handoff）`.
- No new business feature, migration, dependency, permission model, framework,
  workflow or governance change was introduced.
- Mission RR-1C awaits Product Owner final acceptance; no Git tag was created.

## 2026-07-07 — Mission RR-1B PASS

- Product Owner completed final Production Deployment acceptance and confirmed
  Mission RR-1B PASS.
- Accepted Production URL, HTTPS, Environment Variables, Production Build, Home,
  Archive, Search, Author, Published Work, Sitemap, Robots, Metadata, Canonical,
  Open Graph, Browser Smoke, Console, Network and Responsive Layout.
- Added RR-1B acceptance report and deployment notes.
- Updated Release Readiness, Roadmap, Project Status, Acceptance, Memory and Known
  Issues to close RR-1B and wait for RR-1C authorization.
- No business code, migration, dependency, environment variable or deployment
  configuration was changed by this documentation closure.
- Mission RR-1C Release Candidate remains unauthorized and unstarted.

## 2026-07-04 — Mission RR-1A Release Preparation Engineering Complete

- Completed Runtime Contract, Migration, Validation, Build, Documentation and
  Project Structure audits without changing business code or deployment state.
- Rebuilt local Supabase from 14 migrations and passed six PostgreSQL SQL suites;
  local/remote migration histories remain 14/14 aligned.
- `pnpm validate` passes 167 tests and Web/Admin/Docs builds with P0 at zero.
- Established the V1 Beta Release Checklist and deployed Browser QA Checklist.
- Classified release gates and added KI-027 through KI-030 for dependency,
  workspace-root, CI and Supabase preflight risks.
- RR-1A established the preparation baseline; at that time RR-1B and RR-1C were
  not started.

## 2026-07-04 — Mission 3C-3 PASS / Phase 3 Completed

- Product Owner completed final Mission 3C-3 browser acceptance and confirmed PASS.
- Accepted Sitemap XML, Robots, Published-only inclusion, Draft exclusion,
  Author/Work/Archive/Search inclusion, metadata, canonical, Open Graph,
  Draft noindex, responsive behavior and clean console.
- Mission 3C-3 and Mission 3C are formally closed. Phase 3 is Completed —
  Product Owner Accepted.
- Release Readiness `RR-1` remains unauthorized and unstarted.

## 2026-07-03 — Mission 3C-3 SEO Foundation Engineering Complete

- Added dynamic `sitemap.xml` and `robots.txt` using the existing Published-only
  public catalog boundary; Draft works are excluded.
- Added site, Archive, Search, Author and Published Work metadata with canonical
  URLs, descriptions, robots directives and Open Graph fields.
- Added noindex protection for missing/unpublished Work metadata and Studio routes.
- Added `NEXT_PUBLIC_SITE_URL` runtime configuration with Vercel and localhost
  fallbacks; no framework, dependency, migration or permission change was made.
- Full validation, runtime checks and desktop/390px Browser QA pass. Mission 3C-3
  awaits Product Owner acceptance; RR-1 was not started.

## 2026-07-03 — Mission 3C-2 Browse Experience PASS

- Product Owner completed final Browse Experience acceptance and confirmed PASS.
- Accepted Archive, Published-only isolation, pagination, four sorts, URL state
  recovery, out-of-range correction, all page states, responsive layout,
  accessibility, Browser QA and a clean console.
- Mission 3C-2 is formally closed. Mission 3C-3 is SEO Foundation and remains
  unauthorized and unstarted.

## 2026-07-03 — Mission 3C-2 Browse Experience Engineering Complete

- Added public `/archive` Published Works browsing with deterministic pagination,
  newest/oldest/title sorting, shareable URL state and out-of-range correction.
- Added published-only Browse Service/Repository/RPC boundaries plus loading,
  empty and recoverable error states; Draft and private identity fields remain
  excluded.
- Local rebuild, SQL checks, remote 14/14 Migration parity, full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 now awaits Product Owner acceptance; Mission 3C-3 was not started.

## 2026-07-03 — Mission 3C-1 Search MVP PASS

- Product Owner completed final Search MVP acceptance and confirmed PASS.
- Accepted Published Work, Work Slug, Author and Author Slug search, Draft
  isolation, URL synchronization, all page states, responsive layout,
  accessibility and Browser QA with a clean console.
- Mission 3C-1 is formally closed. Mission 3C-2 Browse Experience remains
  unauthorized and unstarted.

## 2026-07-03 — Mission 3C-1 Search MVP Engineering Complete

- Added public `/search` with GET-based URL synchronization and accessible Search,
  Results, Empty, Loading and Error states.
- Added bounded, case-insensitive Published Work title/slug and public Author
  name/slug matching without full text, fuzzy search, ranking or analytics.
- Added Search Service / Repository boundaries and a narrow public read RPC that
  exposes no Draft or private identity fields.
- Added unit, Migration contract and PostgreSQL permission/isolation coverage.
- Deployed the additive Migration; local/remote histories are 13/13 aligned and
  anonymous remote search returns HTTP 200.
- Full validation and Browser QA pass. Mission 3C-2 was not started.

## 2026-07-03 — Mission 3B PASS

- Product Owner completed the final browser acceptance and confirmed Mission 3B PASS.
- Accepted Create Work, Save Draft, Publish, Reader readback, Author Public
  Profile, published-only isolation, Follow / Unfollow, login return,
  Invitation Relationship and baseline mobile layout.
- Closed the acceptance-found publishing and Studio owner-read P0 after repair
  and successful re-verification.
- Reconfirmed full `pnpm validate`, zero known P0 and local/remote 12/12
  Migration parity.
- Mission 3B is closed. Mission 3C remains unauthorized and unstarted.

## 2026-07-03 — Studio Works P0 Owner Read Repair

- Reproduced `/studio/works` failure as a PostgreSQL privilege error caused by
  filtering on the intentionally non-readable `owner_user_id` column.
- Added authenticated-only `list_my_studio_works` / `get_my_studio_work` RPCs
  instead of widening grants or relying on public Published Work visibility.
- Updated Studio list, detail and editor ownership preflight reads to use the
  owner-scoped RPCs; all writes remain protected by existing RLS.
- Added contract and PostgreSQL coverage for anon denial, Reader empty results,
  Author own-only results and no owner ID disclosure.
- Deployed the Migration remotely; local/remote histories are 12/12 aligned and
  anonymous remote invocation returns HTTP 401.

## 2026-07-03 — Phase 3 Reader / Studio Acceptance Fix Engineering Complete

- Added clickable public Author identity across landing, Reader Work cards,
  Work detail, Chapter reading, Author profile and new local shelf records.
- Added global signed-out Login / Register and signed-in registration name /
  Studio / Sign-out header state.
- Added published-only TXT Work export with ordered Chapter content.
- Replaced fixture Studio Work lists/details with owner-scoped Supabase data,
  including Draft and Published management paths.
- Added Chapter create/title/body save, publish selection and governed Work tag
  association editing without expanding delete permissions.
- Added and remotely deployed the narrow `get_published_work_authors` RPC;
  local/remote Migration histories are 11/11 aligned and remote RPC returns 200.
- Product Owner acceptance remains pending.

## 2026-07-02 — Mission 3B Engineering Complete

- Added public Author Profile routes with public identity, Bio, initials avatar,
  statistics, published-only works and complete page states.
- Added idempotent Reader-to-Author Follow / Unfollow with login return path and
  consistent follower/following counts.
- Added own-only invitation relationship summaries over existing Invitation and
  Redemption facts.
- Added the social relationship Migration, Service / Repository boundaries,
  transactional SQL coverage, Browser QA and Mission 3B handoff.
- Rebuilt local Supabase and deployed the additive Migration remotely; local and
  remote histories are 10/10 aligned.
- Mission 3B awaits Product Owner acceptance; Mission 3C and RR-1 were not started.

## 2026-07-02 — Mission 3A PASS

- Product Owner confirmed `Mission 3A. PASS`.
- Closed the Phase 3A Beta Blocking acceptance gate with engineering P0 at zero.
- Preserved KI-017 and KI-018 for Release Readiness.
- Mission 3B, Mission 3C and RR-1 remain unauthorized.

## 2026-07-02 — Mission 3A Engineering Complete

- Completed the authorized Mission 3A scope across 3A-0, 3A-1, 3A-2 and the
  required 3A-3 formatting blocker repair.
- Passed the full workspace validation, local nine-migration rebuild and all
  three SQL permission suites.
- Confirmed local/remote 9/9 migration parity, remote signup availability and
  Email Autoconfirm.
- Completed real remote registration, registration-name login, Reader denial,
  audited Author grant, Studio, draft creation, body save, publish and Reader
  readback.
- Verified unauthenticated guards and 390×844 auth, Reader, shelf and Studio
  layouts without horizontal overflow; browser application errors remained zero.
- Added the Mission 3A report, Product Handoff, manual acceptance checklist and
  KI-017/KI-018 release-readiness risks.
- Stopped before Mission 3B pending Product Owner acceptance.

## 2026-07-02 — Phase 3 Fast Launch Governance

- Replaced the planned Phase 3 Reading scope with the Product Owner-approved V1
  Fast Launch governance model.
- Organized work into Phase 3A Beta Blocking, Phase 3B Beta Operations and Phase
  3C Beta Polish.
- Made Phase 3A the only Beta-blocking stage; Phase 3B and Phase 3C may run after
  Beta and do not delay launch.
- Added `3B-3 Invitation Relationship` for a simple Admin Table, Tree Table or
  Parent / Child invitation tree without analytics or complex visualization.
- Moved former Sprint 3.10 out of Phase 3 as independent Release Readiness `RR-1`.
- Added the new numbering map and updated Phase documents, Roadmaps and project
  status.
- This was a documentation-only governance change. No business code changed and
  no Sprint started or received implementation authorization.

## 2026-07-02 — Phase 2 Pass / Auth P0 Resolved

- Product Owner confirmed successful Studio entry with the remotely registered `Auther001` account.
- Confirmed the accepted chain: nine remote migrations deployed, Email Confirm disabled, real remote registration, registration-name/password login, audited manual Author grant and Studio entry.
- Updated Phase 2 from Conditional Pass to Pass and closed the Phase 2 Auth P0.
- Phase 3 implementation has not started and still requires separate planning and explicit authorization.

## 2026-07-02 — Remote QA Author Grant

- Confirmed remote registration name `Auther001` maps to an active Membership.
- Bootstrapped the controlled remote QA operator and manually granted Author to `Auther001` under explicit Product Owner authorization.
- Wrote the corresponding role-grant audit record.
- Phase 2 remains Conditional Pass until Product Owner confirms successful Studio entry.

## 2026-07-02 — Phase 2 Remote P0 Environment Preparation

### Remote changes

- Linked Supabase CLI to project `szfhngifsipsrxcpekti`.
- Deployed all nine ordered migrations and verified local/remote migration history parity.
- Verified `validate_registration_invitation` and `registration_invitation_status` through the remote REST API.
- Set remote `mailer_autoconfirm` to true without pushing unrelated local Auth configuration.
- Created a bounded remote QA invitation with three uses and seven-day expiry.
- Restarted Web without local overrides; root/Web/Admin env URLs all target the linked remote project.

### Acceptance boundary

- Phase 2 remains Conditional Pass and P0 remains open until Product Owner completes real registration and login.
- Invitation admission still grants Reader only. Entering Studio with the new acceptance account requires a separate manual Author grant.
- Phase 3 implementation remains prohibited.

## 2026-07-02 — Phase 2 Conditional Pass

### Product Owner acceptance

- Recorded Phase 2 as Conditional Pass.
- Product Owner manually checked the Author and Reader surfaces and found no other obvious issue besides registration P0.
- Allowed preparation of next-step planning while explicitly prohibiting Phase 3 implementation.

### Pass conditions

- Deploy the latest migrations to the configured remote Supabase.
- Disable remote Email Confirm.
- Complete one real registration in the remote acceptance environment.
- Sign in successfully with registration name + password.
- Enter Studio successfully in the same acceptance environment.

## 2026-07-02 — Phase 2 Auth P0 Regression Repair

### Root cause

- Reproduced `/auth/sign-up` redirecting to the generic Provider error.
- Browser console contained no registration exception because the Server Action caught and collapsed the Provider error.
- The remote Supabase RPC response was HTTP 404 / `PGRST202`: the configured project does not contain `validate_registration_invitation`.
- Local clean migrations, Trigger and Auth signup succeed, excluding local RLS, registration-name validation and Trigger logic as the primary cause.

### Changed

- Added non-disclosing invitation status classification for valid, invalid, expired, exhausted and revoked invitations.
- Added explicit Provider and Server Action error categories for invitation states, duplicate registration name, password rejection, rate limit, missing remote Migration and temporary service failure.
- Replaced the generic signup failure text with specific, actionable messages.
- Added Provider, Server Action, Migration-contract and SQL status-matrix coverage.

### Verification and blocker

- Nine local migrations, three transactional SQL suites and a real local Auth signup pass.
- Workspace lint, typecheck, full Vitest and all three production builds pass.
- Remote deployment was not performed: Supabase CLI has no Platform token and the repository is not linked to the remote project.
- Phase 2 remains P0 Blocked and Phase 3 is prohibited until remote Migration/Auth deployment and browser registration pass.

## 2026-07-02 — Phase 2 Product Handoff

### Added

- Added the Phase 2 QA handoff with startup instructions, application entry, local Reader / Author test accounts, route inventory, recommended manual acceptance flow and known limitations.
- Added a reusable Product Handoff template that is required after every future Product Phase.
- Prepared local-only `Phase2Reader` and `Phase2Author` accounts plus a bounded QA invitation in the current local Supabase Runtime.

### Verification and boundaries

- Both QA accounts return valid sessions through the local Auth API.
- The existing repository `.env.local` points to remote Supabase, so QA must switch all local env files to the local Supabase URL and publishable key before using these accounts in the Web UI.
- No business code, dependency, package manifest, lockfile, Migration, Schema, RLS, permission model or deployment configuration changed.
- Local QA identities are Runtime data only and disappear after `supabase db reset`.

## 2026-07-02 — Phase 2 Auth P0 Registration Model

### Changed

- Replaced user-facing email/password signup and login with registration-name/password credentials.
- Made invitation code a required signup field and kept the password rule at a simple minimum of eight characters.
- Removed email-confirmation UI, login gating and email-delivery rate-limit messaging.
- Added `profiles.registration_name`, a case-insensitive unique index, invitation preflight and an atomic Auth signup trigger.

### Security and runtime

- The Auth insert, Profile, active Membership, Invitation Redemption, invite consumption and audit record now commit or roll back together.
- Invalid invitations and duplicate registration names leave no partial Auth user or membership state.
- Registration metadata is validated only as transaction input; trusted runtime identity and authorization continue to use Auth user ID, Membership and `role_grants`.
- Local Supabase reset, Phase 1C/Phase 2 content/Phase 2 Auth SQL scripts, real local Auth signup/login, lint, typecheck, full Vitest and all three production builds pass.

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

## 2026-06-29 — Milestone v0.1 Release Documentation

### Added

- Added `docs/releases/v0.1.md` as the formal release note for Phase 1 Foundation and Sprint 002A Website Shell.
- Added `docs/ROADMAP.md` as the milestone-level roadmap index for completed, in-progress and future delivery buckets.

### Changed

- Updated `README.md` with the current milestone, current Sprint and GitHub repository status.
- Updated `PROJECT_STATUS.md` and `MEMORY.md` to reflect `v0.1 Released` and the transition into Sprint 002B planning.

### Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass for the release-documentation state.

### Not changed

- No business code, runtime contract, database schema, Supabase project, deployment configuration, provider, ORM or SDK was modified.

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

## 2026-06-30 — Codex Git Execution Validation

### Added

- Added a validated Codex Git execution entry to `.ai/TROUBLESHOOTING.md`, documenting `.git` write checks, SSH remote usage and GitHub access verification.

### Changed

- Updated `.ai/WORKFLOW.md` with the explicit Git execution boundary: Git write/push is allowed only after Product Owner confirmation, successful sensitive-file checks and a healthy Git execution chain.
- Updated `.ai/START_HERE.md` to route Git delivery tasks to the troubleshooting guidance and the existing SSH remote setup.

### Verification

- `git status`, `.git` write test, `git ls-remote origin` and `git push origin main` have all been validated successfully in the current Codex execution environment.

### Not changed

- No business code, dependency, database schema, Supabase project, deployment configuration or runtime contract was modified.

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

## 2026-06-30 — Phase 2 / Sprint 002A Content Domain Foundation

### Added

- Added the `works`, `chapters`, `articles`, `content_categories`, `content_tags`, `work_tags` and `article_tags` migration with foreign keys, indexes, Check Constraints, scoped slug uniqueness and updated-at triggers.
- Added active-Membership published reads, owning-Author mutation, Admin/Super Admin management and private owner-column grants while reusing Phase 1 RBAC.
- Added provider-neutral content domain/Service contracts, typed database rows and a Supabase Repository adapter.
- Added Vitest Migration/Repository/Service coverage and a transactional SQL role matrix.
- Added ADR-019 and the approved Sprint 002A brief.

### Changed

- Updated README, System Architecture, database ERD/schema/migration/RLS/index/lifecycle registries and project memory for the works + chapters + articles model.

### Verification

- Environment, toolchain, version and frozen dependency checks pass without manifest, lockfile or workspace-config changes.
- Workspace lint, typecheck, Vitest and all three Next.js production builds pass.
- Database package tests pass 12/12; Services package tests pass 7/7.
- Transactional SQL is prepared but not executed because the environment has no PostgreSQL client/server or container runtime; no Supabase core configuration was added without approval.
- Full repository `format:check` remains blocked by 123 pre-existing unformatted files; all Sprint-modified files pass scoped formatting.

### Not changed

- No package manifest, lockfile, dependency, ORM, editor, Storage, UI, comment, Kudos, bookmark, notification, recommendation, auth model or Supabase core configuration was changed.

## 2026-06-30 — Phase 2 / Sprint 002B-Step01 Reading Experience Foundation

### Added

- Added work detail, chapter reading and standalone article reading routes under the existing Reader Membership guard.
- Added a replaceable `ReaderContentGateway → Content Service → ContentStore` flow with read-only fixtures while the local database Runtime is unavailable.
- Added safe structured-document rendering, previous/next chapter navigation, chapter directory and Light/Dark, font-size, line-height and reading-width controls.
- Added gateway and structured-renderer Vitest coverage plus the approved Sprint brief.

### Changed

- Updated the Reader list/detail experience, Reader layout rules, Web README, project status and Phase 2 records for Step01.

### Verification

- Frozen/offline dependency verification passed without changing `package.json`, `pnpm-lock.yaml` or workspace configuration.
- Workspace lint, typecheck, Vitest and all three Next.js production builds pass.
- Browser QA confirmed the public shell, theme toggle, zero console errors and unauthenticated redirect to sign-in.
- Authenticated route visual QA remains pending a working approved local identity/database Runtime; no auth bypass was introduced.

### Not changed

- No dependency, package manifest, lockfile, Supabase configuration, database schema, permission model, editor, community feature, recommendation feature or author dashboard was changed.
- Supabase Runtime was not retried and no remote production database was contacted.

## 2026-06-30 — Phase 2 / Sprint 002B-Step02 Reader Preferences + Navigation Persistence

### Added

- Added a versioned `fandom-harbor.reader-preferences.v1` localStorage contract for Light/Dark, font size, line height and reading width.
- Added safe parsing and Storage failure fallbacks with Vitest coverage.
- Added chapter progress, direct directory navigation, explicit first/last chapter states and an accessible current-chapter marker.
- Added a provider-contained `useAppTheme` adapter in the existing shared UI package.

### Changed

- Updated Reader controls, navigation styling, Reader/Web README, design rules and Sprint acceptance records for Step02.

### Verification

- Frozen/offline dependency verification passed without changing manifests, lockfile or workspace configuration.
- Workspace lint, typecheck, 33 Vitest tests and all three Next.js production builds pass.
- Browser regression confirms theme persistence across reload, zero console errors and the unchanged unauthenticated chapter-route guard.

### Not changed

- No database write, Supabase retry, dependency, permission model, reading history, bookmark, favorite, comment, notification, recommendation or author workflow was added.

## 2026-06-30 — Phase 2 / Sprint 002B-Step03 Reading History + Continue Reading

### Added

- Added the versioned `fandom-harbor.reading-history.v1` localStorage contract for work, chapter and article history.
- Added reading timestamps, chapter position/count, derived progress percentage, identity-based updates and a 30-entry retention bound.
- Added client-side history tracking to work detail, chapter reading and article reading pages.
- Added a work-scoped Continue Reading card that validates the saved chapter against the current published chapter list.
- Added Vitest coverage for all entry types, progress, ordering/upsert, localStorage round-trip, corrupt data, blocked Storage and retention bounds.

### Changed

- Updated Reader documentation and project memory for local-only reading history and Continue Reading.

### Verification

- Workspace lint, typecheck, 38 Vitest tests and all three Next.js production builds pass.
- Browser regression confirms the public shell, zero console errors and the unchanged unauthenticated work-route redirect.
- Authenticated Continue Reading visual QA remains pending the approved local identity/database Runtime; no auth bypass was introduced.

### Not changed

- No dependency, manifest, lockfile, database, Supabase Runtime, permission model, bookmark, favorite, comment, notification, recommendation or author workflow was changed.

## 2026-06-30 — Phase 2 / Sprint 002B-Step04 Bookmark + Reader Shelf

### Added

- Added the versioned `fandom-harbor.reader-bookmarks.v1` localStorage contract for chapter and article bookmarks.
- Added add/remove behavior, explicit current-bookmark state, stable bookmark hrefs and a 100-entry retention bound.
- Added bookmark controls and local-shelf entry links to chapter and article reading pages.
- Added a Reader Shelf at `/archive` that aggregates local bookmarks and recent reading without changing the existing Membership guard.
- Added Vitest coverage for chapter/article bookmark behavior, hrefs, persistence, corrupt data, blocked Storage and retention bounds.

### Changed

- Updated Reader documentation and project memory for local-only bookmarks and Reader Shelf behavior.

### Verification

- Workspace lint, typecheck, 43 Vitest tests and all three Next.js production builds pass.
- Browser regression confirms the public shell/Reader entry, zero console errors and the unchanged unauthenticated `/archive` redirect.
- Authenticated Bookmark/Reader Shelf visual QA remains pending the approved local identity/database Runtime; no auth bypass was introduced.

### Not changed

- No dependency, manifest, lockfile, database, Supabase Runtime, permission model, cloud favorite, comment, Kudos, notification, recommendation or author workflow was changed.

## 2026-06-30 — Phase 2 / Sprint 002B-Step05 Reading Experience QA & Accessibility Polish

### Changed

- Added a distinct Reader Shelf hydration state so persisted data does not briefly appear empty.
- Rejected non-canonical work/chapter/article slugs from local Bookmark and Reading History data before rendering links.
- Improved global missing-content recovery with Reader directory and local-shelf actions.
- Improved the global error state with alert semantics, retry and Reader-directory recovery.
- Added named Reader settings semantics, explicit option aria-labels, polite preference status and content-specific Bookmark labels/status.
- Added descriptive accessible names for shelf bookmark and recent-reading links.

### Verification

- Workspace lint, typecheck, 43 Vitest tests and all three Next.js production builds pass.
- Browser QA confirms 404 recovery links, Light/Dark click and reload persistence, the unchanged `/archive` login guard and zero console errors.
- The theme button receives keyboard focus, but in-app browser Enter/Space injection did not emit the native click; protected-page manual keyboard QA remains pending the approved local identity Runtime.

### Not changed

- No business feature, dependency, manifest, lockfile, database, Supabase Runtime, permission model, comment, Kudos, notification, recommendation or author workflow was added.

## 2026-06-30 — Phase 2 / Sprint 002C-Step01 Author Studio Foundation

### Added

- Added `/studio`, `/studio/works` and `/studio/articles` under a shared Author-only Sidebar/Header/Content layout.
- Added works and articles lists with draft/published status, update metadata and disabled create/edit placeholders.
- Added `StudioContentStore` and `createStudioContentService`, reusing trusted identity injection, pagination and existing `work:author` authorization.
- Added a Web `StudioContentGateway` with author fixtures and Service/Gateway tests.
- Added the approved Sprint brief and Author Studio route/data documentation.

### Changed

- Redirected the legacy `/author` landing route to `/studio`; `/author/invitations` remains available.
- Added draft Work/Article fixtures while explicitly filtering Reader fixture reads to published content.
- Added a draft Chapter fixture and completed the Reader published-only boundary by filtering chapter lists on both work ownership and published status.
- Updated root/Web README and Phase/project status for Sprint 002C.

### Verification

- Frozen/offline dependency verification passes without manifest or lockfile changes.
- Services lint/typecheck and 9 tests pass; Web lint/typecheck and 20 tests pass.
- Full workspace lint/typecheck, 48 Vitest tests and all three Next.js production builds pass; Web production build passes again after the draft Chapter isolation fix.
- Browser QA confirms `/studio`, `/studio/works` and legacy `/author` redirect unauthenticated visitors to `/auth/sign-in` with zero console errors.
- Authenticated Studio visual QA remains dependent on the approved local identity/database Runtime; no authentication bypass or Supabase retry was introduced.

### Acceptance

- Product Owner accepted Sprint 002C-Step01 on 2026-06-30.
- Step02 was outside Step01 acceptance scope and is tracked in its own later changelog entry.

### Not changed

- No dependency, manifest, lockfile, database Schema, RLS, permission system, Supabase Runtime, editor, chapter editing, cover upload, statistics, comments or publishing action was added.

## 2026-06-30 — Phase 2 / Sprint 002C-Step02 Studio Work Detail Read-Only Foundation

### Added

- Added owner-scoped `/studio/works/[workId]` with work metadata, chapter count and ordered chapter summaries.
- Added a Works-list detail entry and disabled placeholders for new chapter, edit, publish and archive actions.
- Added `StudioWorkDetail` and owner-injected `getWork` across the existing Service/Store/Gateway boundary.
- Added Service and Web tests for trusted owner injection, draft Work/Chapter visibility, unknown IDs and other-author isolation.

### Verification

- Workspace lint and typecheck pass.
- 52 Vitest tests pass: Services 10 and Web 23.
- Web production build passes with the dynamic Studio Work Detail route.

### Acceptance

- Product Owner accepted Sprint 002C-Step02 on 2026-06-30.
- `/studio/works/[workId]` read-only Work Detail passed engineering acceptance and is reachable from `/studio/works`.
- Owner ID is injected only from trusted identity context; the URL carries only `workId`.
- Other-author works and unknown work IDs return Not Found.
- Reader remains published-only, while current-author draft/published Work and Chapter visibility stays Studio-scoped.
- New chapter, edit, publish and archive entrypoints remain disabled and do not write.

### Not changed

- No dependency, manifest, lockfile, Supabase Runtime, Migration, RLS, Database Contract, editor or write action changed.
- Sprint 002A DB Runtime remains pending; Step03 was not part of Step02 scope and is tracked in its own later changelog entry after separate authorization.

## 2026-06-30 — Phase 2 / Sprint 002C-Step03 Studio Article Detail Read-Only Foundation

### Added

- Added owner-scoped `/studio/articles/[articleId]` with article metadata, summary, status, category/association display and tag empty state.
- Added an Articles-list detail entry and disabled placeholders for new article, edit, publish and archive actions.
- Added `StudioArticleDetail` and owner-injected `getArticle` across the existing Service/Store/Gateway boundary.
- Added Service and Web tests for trusted owner injection, draft Article visibility, unknown article IDs, other-author isolation and Reader draft-article filtering.

### Verification

- Workspace lint and typecheck pass.
- 55 Vitest tests pass: Services 10 and Web 26.
- Web production build passes with the dynamic Studio Article Detail route.

### Acceptance

- Product Owner accepted Sprint 002C-Step03 on 2026-07-01.
- `/studio/articles/[articleId]` passed read-only route and owner-boundary acceptance.
- Owner ID comes only from `TrustedAccessContext.identity.id`; other-author and unknown article IDs return Not Found.
- Reader remains published-only and all article write entrypoints remain disabled.
- Workspace lint, typecheck, 55/55 Vitest tests and Web production build all pass.

### Not changed

- No dependency, manifest, lockfile, Supabase Runtime, Migration, RLS, Database Contract, editor or write action changed.
- Supabase was not executed; Sprint 002A DB Runtime remains pending and Step04 remains unauthorized.

## 2026-07-01 — Phase 2 / Sprint 002C-Step04 Studio Empty / Error / Boundary States

### Added

- Added explicit Works/Articles empty states with disabled create placeholders and a return-to-Studio path.
- Added Studio-specific Work/Article Not Found states with safe copy and return paths to Studio and the matching list.
- Added distinct no-chapter and all-draft-chapter Work states without exposing internal identifiers or database fields.
- Added a draft-only Work fixture and a shared disabled Studio action contract for read-only verification.

### Verification

- Workspace lint and typecheck pass with zero cached tasks.
- 58/58 Vitest tests pass, including Web 29/29.
- Web production build passes with Studio list and dynamic detail routes present.
- Tests cover empty owner lists, unknown/other-owner content isolation, draft Work/Article/Chapter Reader isolation and disabled Studio actions.

### Not changed

- No dependency, manifest, lockfile, Supabase Runtime, Migration, RLS, Database Contract, editor or write action changed.
- Supabase was not executed; Sprint 002A DB Runtime remains pending.

### Acceptance

- Product Owner accepted Sprint 002C-Step04 on 2026-07-01.
- Empty lists, safe owner-scoped Not Found states, no-chapter/all-draft boundaries, recovery navigation, disabled actions and Reader published-only isolation passed review.
- Forced lint, typecheck, 58/58 Vitest tests and Web production build all passed.

## 2026-07-01 — Phase 2 / Sprint 002C-Step05 Freeze & Handoff

### Frozen

- Marked Sprint 002C-Step01 through Step04 Accepted and Step05 Freeze & Handoff complete.
- Frozen the read-only Studio home, Works/Articles lists, Work/Article details, empty/Not Found states, navigation, Reader published-only and Trusted Identity contracts.
- Recorded Create/Edit Work, Create/Edit Article, Draft Save, Publish, Archive, Delete, Supabase Runtime, Owner Repository and Rich Text Editor as explicitly unimplemented and separately gated.
- Recorded Sprint 002D candidates: Draft Creation / Editing UI Shell or Database Runtime Recovery; neither direction is authorized.

### Verification

- Workspace lint, typecheck and 58/58 Vitest tests pass.
- Web production build passes.
- No product code, page, component, test, dependency, package manifest, lockfile, Supabase, Migration, RLS or Database Contract changed in Step05.

### Final status

- Sprint 002C Freeze & Handoff is complete and the Sprint can be formally closed.
- Sprint 002A DB Runtime Pending remains unchanged; Supabase was not executed.

## 2026-07-01 — Phase 2 / Sprint 002D Author Creation Experience UI Shell Planning

### Planned

- Added the approved Sprint 002D development handbook covering Create Work, Create Article, owner-scoped Edit, Form Experience, Draft Workflow and Freeze/Handoff Steps.
- Fixed the Sprint boundary to input-capable UI shells, client validation, fixture-prefill and disabled actions only.
- Preserved the Phase 2 Architecture Review blockers for real writes: owner-only Repository, DB Runtime, content schema validation, Revision, state machine and transactional publishing.
- Selected the UI Shell direction for Sprint 002D while leaving Database Runtime Recovery separately gated.

### Authorization boundary

- This approval covers planning and handbook documentation only.
- Step01 implementation still requires explicit Product Owner authorization.
- No code, route, component, test, dependency, package manifest, lockfile, Supabase, Migration, RLS, Database Contract or Repository changed.

## 2026-07-01 — Phase 2 / Sprint 002D-Step01 Create Work UI Shell

### Added

- Added `/studio/works/new` with the existing Author guards, Studio breadcrumb and explicit return navigation.
- Added an input-capable client form for title, description, fixture category/tags, cover placeholder and local clearing.
- Added client-only required, length and illegal-control-character validation with character counts and accessible error messaging.
- Added a shared Studio Form Action Bar whose save-draft and publish actions are disabled and have no write callbacks.
- Added a route loading skeleton and enabled the Works list/empty-state links to the UI Shell.

### Tests

- Added validation coverage for required title, title/description limits, illegal characters and valid local form state.
- Extended the disabled Studio action contract for Create Work save/publish actions.
- Web scoped tests pass 35/35; full workspace lint, typecheck and 64/64 Vitest pass with zero cached tasks.
- Web production build passes with `/studio/works/new` in the production route table.

### Not changed

- No Service write, Repository, Supabase query, Mutation, POST, RPC, SQL, fake save result, editor, Revision or status transition was added.
- package.json, pnpm-lock.yaml, Supabase Runtime, Migration, RLS and Database Contract remain unchanged.
- Reader remains published-only; Sprint 002A DB Runtime remains pending and Step02 is unauthorized.

## 2026-07-01 — Phase 2 / Sprint 002D-Step02 Create Work Draft Persistence

### Added

- Added an idempotent production Migration with five approved V1 Categories and ten stable-UUID `additional/canonical` Tags.
- Added the authenticated `create_author_work_draft` PostgreSQL RPC, which atomically creates a Work and `work_tags`.
- Fixed draft ownership and lifecycle inside PostgreSQL: owner is `auth.uid()`, status is `draft`, and `published_at` is null.
- Added Zod-validating Repository and `createWorkDraftService` boundaries plus an Author-only Web Server Action.
- Replaced Create Work metadata fixtures with database-backed Category/Tag reads.
- Enabled Save Draft with pending, accessible failure and honest success states while keeping Publish disabled.

### Tests

- Added static Migration checks for taxonomy idempotence, stable tag mapping and RPC privilege/lifecycle contracts.
- Added Service/Repository tests for Author authorization, Zod validation and draft-only output.
- Added Server Action tests for unauthenticated, non-Author, Author-success and persistence-failure paths.
- Extended SQL tests for RPC authorization, invalid Category, deprecated Tag and no-partial-Work rollback behavior.
- Workspace lint, typecheck and 74/74 Vitest tests pass.
- Web production build passes with `/studio/works/new` in the production route table.

### Boundaries

- No Publish, Edit, Archive, Delete, editor, cover upload or adult-content behavior was added.
- Existing RLS, table structures, tag-type union, package manifests and lockfile remain unchanged.
- Database Runtime remains pending; Migration and SQL tests have not yet run against PostgreSQL.
- A read-only `supabase status` check could not connect to the local Docker daemon; no Runtime start, image pull, remote connection or retry was attempted.

### Runtime validation and acceptance

- Product Owner confirmed the local Supabase Runtime had recovered and authorized controlled validation.
- `supabase db reset --local --no-seed` rebuilt the database and applied all six ordered Migrations.
- Runtime testing exposed that `INSERT ... RETURNING *` and explicit `id` insertion exceeded the authenticated column grants.
- Narrowed the RPC to let PostgreSQL generate `works.id` and return only application-visible columns; no grant, RLS or table structure was widened.
- `phase_2_content_domain.sql` then passed in local PostgreSQL, including Author success, anon/Reader denial, invalid Category rollback, deprecated Tag rollback and atomic Work/Tag creation.
- Reapplying the V1 taxonomy Migration inserted zero rows; the database retained exactly five Categories and ten canonical additional Tags.
- Sprint 002D-Step02 is Accepted and the Phase 2 content-domain database Runtime Pending state is closed.

## 2026-07-01 — Phase 2 / Sprint 002E-Step01 Minimal Draft Editor

### Added

- Added `/studio/works/[workId]/edit` as an owner-only draft editing shell.
- Added `DraftWorkEditorStore`, `createDraftWorkEditorService`, a Zod-validating Repository and Studio Gateway.
- Reused existing `chapters.content` and `content_schema_version`; the first Chapter by position supplies the current V1 body.
- Added Work metadata, current Chapter context and a plain textarea that edits only browser memory.
- Redirected successful Create Work Draft actions directly to the new editor route.

### Security and boundaries

- Service requires `work:author`; the Supabase query requires `status = draft`; existing RLS enforces owner through the authenticated session.
- URL accepts only a UUID `workId`; invalid, unknown, published and non-owner resources resolve to Not Found.
- Save and Publish remain disabled. No Server Action, write Repository, RPC, Migration, RLS, Schema, package or lockfile change was added.

### Tests

- Added Service allow/deny tests, Repository mapping/Not Found/input validation tests and structured-document plain-text projection tests.
- Existing Reader published-only and Create Draft contracts remain covered.
- Workspace lint, typecheck and 81/81 Vitest tests pass.
- Web production build passes with `/studio/works/[workId]/edit` in the route table.

## 2026-07-01 — Autonomous Sprint Documentation Authorization

### Governance

- Recorded the Product Owner's standing authorization, effective from Sprint 002E, for automatic factual documentation updates after Sprint/Step completion.
- Allowed records include verified status, acceptance, commands/results, Runtime state, modified files, boundaries, risks, Level 3 blockers and next-step recommendations.
- Preserved all Level 3 gates for database, auth/permission, Publish, dependencies, package/lockfiles, uploads/storage, deletion, production deployment, large refactors and technology changes.
- Required every final report to disclose automatically updated files, recorded content, Level 3 involvement and whether the next step needs authorization.

## 2026-07-01 — Phase 2 / Sprint 002E-Step02 Draft Body Save

### Added

- Added the minimal Migration `20260701113000_chapters_body_update_grant.sql` to allow authenticated Chapter body updates on `content` and `content_schema_version`.
- Added `saveDraftWorkBody` to the existing Draft Editor Service/Store/Repository boundary.
- Added a Web Server Action and client form shell so `/studio/works/[workId]/edit` can save draft body content with pending, success and error states.
- Added minimal plain-text to `ContentDocument` projection for draft persistence.
- Added first-save Chapter creation when a draft Work has no Chapter yet; later saves update the same first Chapter.

### Security and boundaries

- Kept owner enforcement on trusted identity plus existing `chapters_update_owner_or_admin` RLS; no owner identity is accepted from URL, query or form fields.
- Did not add any RPC, REST endpoint, Publish path, status transition, schema change or RLS policy change.
- Saving body content does not alter `work.status`, does not set `published_at` and does not expose draft content to Reader.

### Tests and runtime

- Added Service, Repository, plain-text projection and Web Server Action coverage for owner success, non-Author denial, Not Found and failure states.
- Extended SQL runtime tests for anon/Reader/non-owner rejection, owner update, first-save Chapter creation, same-Chapter update and no-accidental-publish behavior.
- `supabase db reset --local --no-seed` and the Phase 2 SQL suite pass against local PostgreSQL.
- Workspace lint, typecheck and 86/86 Vitest tests pass.
- Web production build passes with `/studio/works/[workId]/edit` in the route table.

## 2026-07-01 — Phase 2 / Sprint 002F Minimal Publish Workflow

### Added

- Added minimal draft publish support to the existing Studio draft editor form through a single `submitDraftEditor` Server Action with `save | publish` intent.
- Added `publishDraftWork` to the existing Studio draft editor Service/Repository boundary.
- Added Reader hybrid published-content gateway support so newly published database-backed Works become readable immediately while existing published fixture content remains available.
- Added publish redirects from the Studio editor to the public Reader chapter route.

### Security and boundaries

- Reused existing owner capability, `works` update grants, `chapters` update grants and current RLS.
- Added no new Migration, RPC, Schema, RLS policy, dependency or package change for Sprint 002F.
- Publish updates only the Work and the first Chapter; it does not introduce revision history, archive, delete or workflow orchestration.
- Reader remains published-only; draft Works never become readable before Work and Chapter lifecycle fields are set.

### Tests and runtime

- Added Service/Repository coverage for publish allow/deny and publish result mapping.
- Added Web Server Action coverage for publish success, empty-body rejection and honest failure handling.
- Added Reader hybrid gateway coverage for database-first published reads with fixture fallback.
- Extended SQL runtime tests for Reader publish denial, owner publish success, first-Chapter publish path and Reader published-count visibility after publish.
- Workspace lint, typecheck and full Vitest pass.
- Web production build passes with `/studio/works/[workId]/edit`, `/works/[slug]` and `/works/[slug]/chapters/[chapterSlug]` in the route table.
- `supabase db reset --local --no-seed` and the extended Phase 2 SQL suite pass against local PostgreSQL.

## 2026-07-01 — Phase 2 / Sprint 002G Public Reading

### Added

- Moved `/articles/[slug]` onto the same hybrid published-content gateway already used by the public Work and Chapter routes.
- Completed the minimum public-reading closure so published database-backed Works, Chapters and Articles are preferred automatically while published fixture content remains as fallback.
- Added hybrid Reader article tests to verify runtime-first published reads and continued draft isolation.

### Security and boundaries

- Reader remains strictly published-only across Work, Chapter and Article routes.
- Added no Migration, RPC, Schema, RLS, dependency, package or lockfile change for Sprint 002G.
- Draft content stays invisible to Reader even when fixture fallback is active.

### Tests and verification

- Workspace lint, typecheck and full Vitest pass.
- Web production build passes with `/articles/[slug]`, `/works/[slug]` and `/works/[slug]/chapters/[chapterSlug]` in the route table.
- No new database-side validation was required because Sprint 002G changed only the read-path gateway wiring; the latest local Supabase reset and Phase 2 SQL suite remain the passing baseline from Sprint 002F.

## 2026-07-01 — Phase 2 / Sprint 002H Bookshelf / Library

### Added

- Added a Reader Library Hub client shell to `/works` with continue-reading, latest-bookmark and local shelf summary cards.
- Added lightweight client-side filtering over published Works and Articles by content type and text query.
- Added pure Reader Library tests for shelf snapshots and browse filtering.

### Security and boundaries

- Reader remains strictly published-only for Work and Article browse results.
- Local shelf data remains browser-only and does not write to the database.
- Added no Migration, RPC, Schema, RLS, dependency, package or lockfile change for Sprint 002H.

### Tests and verification

- Workspace lint, typecheck and full Vitest pass.
- Web production build passes with `/archive`, `/articles/[slug]`, `/works/[slug]` and `/works/[slug]/chapters/[chapterSlug]` in the route table.
- No new database-side validation was required because Sprint 002H changed only client-side Reader browse/shelf composition on top of existing published-only data paths.
