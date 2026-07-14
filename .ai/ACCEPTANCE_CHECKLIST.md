# Acceptance Checklist

## Mission RR-1C QA Fixture evidence (2026-07-11)

- [x] Local clean rebuild followed by fixture restoration creates two Auth users.
- [x] Reader and Author password login pass.
- [x] Two active Memberships, one active Author grant and one invitation redemption exist.
- [x] Reader page and Author public profile pass in the browser.
- [x] Author can enter Studio; Reader is redirected away from Studio.
- [x] Browser console errors are zero.
- [x] Repeated fixture execution is idempotent.
- [x] Credentials stay in Git-ignored `.local/qa-fixture.json` with mode `0600`.
- [x] Product Owner can read credentials locally with `pnpm qa:credentials`.
- [x] Credential display performs no database, network or production operation.
- [x] No production data, Migration, Auth architecture, Permission Model or RLS changed.
- [x] Product Owner completes RR-1C final acceptance.
- [x] Product Owner verifies Reader `/studio` redirects to `/archive`.
- [x] QA Fixture acceptance is complete.

## Mission RR-1C Release Candidate evidence (2026-07-10)

- [x] Final Runtime Audit completed.
- [x] Frozen dependency check passes.
- [x] Local Supabase clean rebuild applies 14 migrations.
- [x] Local / Remote migration history is 14 / 14 aligned.
- [x] Local public-schema lint passes.
- [x] Six SQL regression suites pass.
- [x] `pnpm validate` passes Format, Lint, Typecheck, 167 tests and all builds.
- [x] Final Browser QA passes.
- [x] Final Mobile QA at 390 × 844 passes.
- [x] Documentation Audit completed.
- [x] Known Issues final review completed.
- [x] Release Checklist completed.
- [x] Beta Ready Checklist completed.
- [x] Product Owner accepted Release Candidate Git baseline:
      `8495bded5e0c78985be7410cceb902cd2c090421`.
- [x] P0 = 0.
- [x] No Regression detected.
- [x] No new business feature, migration, dependency, framework or permission model change.
- [x] Product Owner completes RR-1C final acceptance.
- [x] Mission RR-1C is formally closed and V1 Beta is Beta Ready.

## Mission RR-1B Deployment evidence (2026-07-07)

- [x] Product Owner confirmed Mission RR-1B PASS.
- [x] Production Deployment succeeds.
- [x] Production URL is accessible and HTTPS is normal.
- [x] Environment Variables are accepted as correctly configured.
- [x] Production Build is normal.
- [x] Home, Archive, Search, Author and Published Work pages are normal.
- [x] `/sitemap.xml` and `/robots.txt` are normal.
- [x] Metadata, Canonical and Open Graph are normal.
- [x] Browser Smoke Test passes.
- [x] Console has no severe errors; Network has no abnormal failures.
- [x] Responsive Layout is normal.
- [x] Mission RR-1B is formally closed.
- [x] RR-1C Release Candidate was not started.

## Mission RR-1A Release Preparation evidence (2026-07-04)

- [x] Runtime Contract and frozen dependency checks pass.
- [x] Local Supabase clean rebuild applies 14 migrations.
- [x] Local / Remote migration history is 14 / 14 aligned.
- [x] Six PostgreSQL SQL suites and local public-schema lint pass.
- [x] `pnpm validate` passes Format, Lint, Typecheck, 167 tests and all builds.
- [x] Project Structure and Documentation audits are complete.
- [x] Known Issues are classified; Release and Browser QA Checklists exist.
- [x] No business code, deployment, environment variable, dependency or Git baseline change.
- [x] P0 = 0 at RR-1A completion; RR-1B was later accepted and RR-1C remains unstarted.
- [x] RR-1A preparation baseline is complete and carried into accepted RR-1B deployment.

## Mission 3C-3 SEO Foundation evidence (2026-07-03)

- [x] `sitemap.xml` and `robots.txt` generate and return valid public URLs.
- [x] Sitemap contains Published Works and public Authors; Draft fixture is absent.
- [x] Site, Archive, Search, Author and Published Work metadata include canonical,
      title, description, robots and Open Graph fields.
- [x] Missing/unpublished Work metadata and Studio routes output noindex.
- [x] Local/remote Migration history remains 14/14 aligned; no Migration was added.
- [x] `pnpm validate` and desktop/390px Browser QA pass with zero console errors.
- [x] Product Owner 于 2026-07-04 完成最终人工验收并确认 Mission 3C-3 PASS。

## Phase 3 completion

- [x] Mission 3A PASS — Product Owner Accepted。
- [x] Mission 3B PASS — Product Owner Accepted。
- [x] Mission 3C-1、3C-2、3C-3 全部 PASS。
- [x] Phase 3 P0 为零，所有批准范围已完成人工验收。
- [x] Product Owner 于 2026-07-04 确认 Phase 3 Completed。
- [x] Release Readiness 已进入独立 RR-1A/RR-1B/RR-1C 流程。

## Mission 3C-2 Browse Experience evidence (2026-07-03)

- [x] Public Archive、Published Works 列表和导航入口完成。
- [x] 每页 12 项分页与四种稳定排序完成。
- [x] URL `page` / `sort` 同步、分享恢复与越界页纠正通过。
- [x] Draft 隔离及匿名 published-only SQL checks 通过。
- [x] Empty、Loading、Error、响应式和 Accessibility 状态完成。
- [x] Desktop / 390px Browser QA 通过，Console errors 为 0。
- [x] Local / Remote 14/14 Migration parity 与 `pnpm validate` 通过。
- [x] Product Owner 于 2026-07-03 人工验收并确认 Mission 3C-2 PASS。

## Mission 3C-1 Search MVP evidence (2026-07-03)

- [x] Public Search page, input, navigation and URL query sync complete.
- [x] Published Work title/slug and public Author name/slug matching complete.
- [x] Draft exclusion and anonymous published-only SQL checks pass.
- [x] Loading, initial, empty, invalid-query and error recovery states exist.
- [x] Desktop and 390px Browser QA pass with zero browser errors.
- [x] Local/remote 13/13 Migration parity and full `pnpm validate` pass.
- [x] Product Owner confirmed Mission 3C-1 PASS on 2026-07-03.

## Phase 3 Reader / Studio acceptance fix evidence (2026-07-03)

- [x] R-01 through R-04 engineering scope completed.
- [x] A-01 through A-06 completed within the approved no-delete boundary.
- [x] Narrow Published Work public-author RPC deployed; local/remote 11/11.
- [x] Studio Works hidden-owner-column P0 repaired with authenticated-only owner read RPCs; local/remote 12/12.
- [x] Unit, type, lint, build, Migration reset and PostgreSQL SQL checks pass.
- [x] Product Owner completed authenticated browser acceptance and confirmed Pass on 2026-07-03.

No task, feature, Sprint, or release is complete until every applicable item passes. “N/A” requires a written reason.

## Manual QA handoff gate

- [ ] Final Output records the actual Local URL and running environment.
- [ ] Final Output states whether the development or QA server must be restarted.
- [ ] `pnpm qa:credentials` succeeds when the project QA Fixture applies.
- [ ] Guest can access Homepage.
- [ ] Reader credentials successfully authenticate.
- [ ] Author credentials successfully authenticate.
- [ ] Author public profile URL is verified when applicable.
- [ ] Author Studio access is verified when applicable.
- [ ] Reader Studio denial is preserved when applicable.
- [ ] Invitation Code registration is verified when registration is in Mission scope.
- [ ] Desktop and Mobile acceptance surfaces are ready.
- [ ] Regression paths required by the Mission pass.
- [ ] Final Output includes the standard Manual QA Checklist.
- [ ] No QA Fixture, credential, login, invitation or environment P0 remains open.

If any item required for the Mission fails, the Mission cannot be marked `Completed` or
`Awaiting Product Owner Acceptance`. Repair and revalidation are mandatory before handoff.

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

## Phase 2 / Sprint 002A current acceptance evidence

- [x] Environment, toolchain, version and frozen dependency checks pass.
- [x] Seven content tables, constraints, indexes, grants, RLS and updated-at triggers are represented by an ordered migration.
- [x] Content domain types and Service/Repository boundaries are provider-neutral and tested.
- [x] Static Migration contracts, workspace lint, typecheck, Vitest and production builds pass.
- [x] Visitor/inactive/Reader/owning Author/unrelated Author/Admin SQL allow/deny matrix is written transactionally.
- [ ] Ordered migrations rebuild cleanly and `phase_2_content_domain.sql` passes in an approved disposable database.
- [ ] Product Owner approves Sprint 002A completion.

## Phase 2 / Sprint 002B-Step01 current acceptance evidence

- [x] Environment, toolchain, version and frozen dependency checks pass without manifest or lockfile changes.
- [x] Work detail, chapter reading and standalone article routes preserve the existing App Router and Membership guard.
- [x] Reader data flows through the 002A Content Service contract and a replaceable read-only fixture `ContentStore`.
- [x] Structured JSON renders without raw HTML; title, body, chapter navigation and chapter directory are covered.
- [x] Light/Dark, font size, line height and reading-width controls are keyboard-operable and represented by reader CSS variables.
- [x] Workspace lint, typecheck, Vitest and production builds pass; browser QA confirms the public shell, theme toggle and unauthenticated redirect.
- [ ] Authenticated reader-route browser QA runs after an approved local identity/database Runtime is available.
- [ ] Product Owner approves Sprint 002B-Step01 completion.

## Phase 2 / Sprint 002B-Step02 current acceptance evidence

- [x] Startup gates and frozen/offline dependency verification pass without manifest or lockfile changes.
- [x] Light/Dark, font size, line height and reading width use a versioned localStorage contract with safe fallback.
- [x] Preference storage is login-independent and contains no identity, content ID or reading-history data.
- [x] Chapter progress, previous/next boundary states, directory entry and accessible current-chapter state are explicit.
- [x] No database write, Supabase retry, community feature, recommendation or author workflow is introduced.
- [x] Workspace lint, typecheck, Vitest, production build and browser theme/persistence regression pass.
- [ ] Product Owner approves Sprint 002B-Step02 completion.
