# V1 Beta Ready Checklist

Status: Historical RC PASS / Current Production Readiness Review PASS With Conditions

Mission: RR-1C — Release Candidate

Acceptance date: 2026-07-11

## Production Readiness review supplement — 2026-07-15

- [x] Product main flows and External Beta evidence pass.
- [x] Product P0 / P1 is `0 / 0`.
- [x] `Production Readiness Review = PASS`.
- [x] Establish a clean current V1 Release Candidate baseline on `codex/v1-production-rc`; exact SHA is recorded in the PRC-01 Mission output.
- [ ] Verify Production project, environment-variable names / scope, domain and HTTPS without exposing values.
- [ ] Approve launch scale, budget, uptime, RPO / RTO, backup recovery, monitoring and incident ownership.
- [ ] Approve legal identity, age / content, privacy, retention / deletion and takedown policies.
- [ ] Approve rollback, minimum governance continuity and Production smoke runbooks.

Current result: PRC-01 is `CLOSED`; PRC-02 through PRC-06 remain `BLOCKED`. `Production Ready = READY WITH CONDITIONS`; `Production Deployment Authorized = NO`. The historical RR-1C baseline remains accepted engineering evidence but does not authorize a current deployment.

## External Beta closeout supplement — 2026-07-15

- [x] Three-Reader external cohort completed and passed.
- [x] External Author test completed and passed.
- [x] Reader-only Controlled Test remains PASS.
- [x] Author001 Publish E2E remains PASS.
- [x] Product P0 / P1 remains `0 / 0`.
- [x] Guest Work Detail / Chapter sign-in redirect is recorded as the active Membership product rule.
- [x] Existing `/access` Admin changes remain frozen for the Admin phase and do not block Beta closeout.
- [x] `V1 External Beta Closeout = PASS`.

The project subsequently completed the Production Readiness Review recorded above. This historical External Beta supplement does not declare Production Ready or authorize Production Deployment.

## Product baseline

- [x] Phase 1 PASS.
- [x] Phase 2 PASS.
- [x] Phase 3 PASS.
- [x] RR-1A Release Preparation baseline complete.
- [x] RR-1B Production Deployment PASS.
- [x] RR-1C Release Candidate audit complete.
- [x] RR-1C Product Owner final acceptance complete.

## Runtime and database

- [x] Runtime Contract matches Node.js 24.18.0 and pnpm 11.7.0.
- [x] Supabase CLI available at 2.108.0.
- [x] Local Supabase core services are available.
- [x] Local clean rebuild applies all 14 migrations from zero.
- [x] Local and linked remote migration history are 14/14 aligned.
- [x] Local `public` schema lint reports no errors.
- [x] Six SQL regression suites pass with PostgreSQL `ON_ERROR_STOP`.

## Validation

- [x] Frozen/offline dependency install check passes.
- [x] `pnpm validate` passes formatting, lint, typecheck, tests and build.
- [x] Test count remains 167 passing tests.
- [x] Web, Admin and Docs production builds pass.
- [x] Source TODO / FIXME / XXX / HACK scan returns zero.
- [x] Production dependency audit has High = 0 and Critical = 0.

## Browser and mobile QA

- [x] Desktop QA passes.
- [x] Mobile QA at 390 × 844 passes.
- [x] Home, Archive, Search and Author public pages pass.
- [x] Published Work, Chapter and Studio unauthenticated guards pass.
- [x] Sitemap and Robots pass.
- [x] Metadata, Canonical and Open Graph checks pass.
- [x] Horizontal overflow checks pass.
- [x] No severe console or network errors.

## Authenticated local QA fixture

- [x] Local clean rebuild can be followed by deterministic fixture restoration.
- [x] Local Reader and Author accounts can sign in with passwords.
- [x] Reader access and Author public profile access pass.
- [x] Author Studio access passes.
- [x] Reader has no Author grant and is redirected away from Studio.
- [x] Product Owner verified Reader `/studio` redirects to `/archive`.
- [x] Passwords are absent from tracked files and public documentation.
- [x] Local-only host guard prevents remote fixture execution.

## Documentation

- [x] Project Status updated.
- [x] Roadmap updated.
- [x] Changelog updated.
- [x] Acceptance updated.
- [x] Memory updated.
- [x] Known Issues reviewed and classified.
- [x] Release Candidate Report created.
- [x] Beta Ready Checklist created.

## Release Candidate baseline

- [x] Release Candidate Git baseline created.
- [x] Product Owner accepted baseline commit:
      `8495bded5e0c78985be7410cceb902cd2c090421`.
- [x] P0 = 0.
- [x] No new business feature, migration, dependency, framework or permission model change.

## Remaining product / operational decisions

These items do not block the technical Release Candidate but should be reviewed before
or during final Public Beta Go / No-Go:

- KI-004：Age policy and adult-content compliance.
- KI-005：Deletion, export and retention policy.
- KI-009：Launch scale, budget, uptime target, RPO and RTO.
- KI-012：Domain, legal identity, policies and takedown process.
- KI-026：Published Work crawler body access.

## Remaining technical risks accepted for Beta monitoring

- KI-019：SQL test harness is non-TAP but all scripts pass with `ON_ERROR_STOP`.
- KI-020：Some Studio multi-step writes are not yet one atomic RPC.
- KI-021：Chapter deletion remains unavailable by approved scope.
- KI-023：Search MVP does not yet use dedicated search indexing.
- KI-024：Archive uses offset pagination.
- KI-027：Moderate transitive PostCSS advisory remains; High/Critical are zero.
- KI-028：Next.js workspace-root warning remains; builds pass.
- KI-029：No checked-in CI workflow; manual validation gate is used for this RC.
- KI-030：Supabase linked dry-run issue remains for future database deployment preflight.

## Final status

V1 Beta Release Candidate is Product Owner Accepted and Beta Ready. Mission RR-1C is
closed. Do not create a Git tag, perform Go / No-Go, start UI polish or begin a new
mission until explicitly authorized.
