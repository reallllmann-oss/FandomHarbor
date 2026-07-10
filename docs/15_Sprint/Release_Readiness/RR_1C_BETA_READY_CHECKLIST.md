# V1 Beta Ready Checklist

Status: Ready for Product Owner final acceptance  
Mission: RR-1C — Release Candidate  
Date: 2026-07-10

## Product baseline

- [x] Phase 1 PASS.
- [x] Phase 2 PASS.
- [x] Phase 3 PASS.
- [x] RR-1A Release Preparation baseline complete.
- [x] RR-1B Production Deployment PASS.
- [x] RR-1C Release Candidate audit complete.

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
- [x] Baseline commit: `final RR-1C Git HEAD（见最终 handoff）`.
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

V1 Beta is technically ready for Product Owner final acceptance. Do not create a Git
tag, start UI polish or begin a new mission until explicitly authorized.
