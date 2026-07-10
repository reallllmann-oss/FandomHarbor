# V1 Beta Release Checklist

Owner: Product Owner / Engineering  
Created by: Mission RR-1A  
Status: RR-1C Release Candidate complete; awaiting Product Owner acceptance

## RR-1A — Preparation baseline

- [x] Phase 3 is Product Owner Accepted and formally closed.
- [x] `main` and `origin/main` point to the same commit.
- [x] Uncommitted accepted implementation is explicitly tracked by KI-018.
- [x] Runtime Contract is Node.js 24.x / pnpm 11.7.0 and the active runtime matches.
- [x] Frozen/offline dependency install check passes without manifest or lockfile changes.
- [x] Local Supabase rebuild applies all 14 migrations from zero.
- [x] Local and linked remote migration histories match 14/14.
- [x] Six PostgreSQL SQL suites pass with `ON_ERROR_STOP` on a clean local database.
- [x] Local public-schema database lint reports no errors.
- [x] `pnpm validate` passes Format, Lint, Typecheck, 167 tests and all builds.
- [x] Web, Admin and Docs production builds complete.
- [x] Source TODO / FIXME / XXX / HACK scan returns zero.
- [x] No tracked secret or private-key file is present; `.env.example` is the only tracked env file.
- [x] Project structure contains 3 applications, 9 packages and their ownership READMEs.
- [x] Known Issues are classified for Deployment, Release Candidate and post-Beta work.
- [x] Browser QA Checklist exists.

## RR-1B — Deployment gates (Product Owner accepted)

- [x] Product Owner authorizes RR-1B.
- [x] Production Deployment succeeds.
- [x] Production URL is accessible.
- [x] HTTPS is normal.
- [x] Required Environment Variables are accepted by Product Owner without logging secrets.
- [x] Production Build is normal.
- [x] Home, Archive, Search, Author and Published Work pages are accepted.
- [x] `/sitemap.xml` and `/robots.txt` are accepted.
- [x] Metadata, Canonical and Open Graph are accepted.
- [x] Browser Smoke Test passes.
- [x] Console has no severe errors; Network has no abnormal failures.
- [x] Responsive Layout is accepted.
- [x] Mission RR-1B is formally closed.

## RR-1C — Release Candidate gates

- [x] Product Owner authorizes RR-1C.
- [x] Capture the accepted implementation in one identifiable Git baseline (KI-018).
- [x] Review the complete Release Candidate diff and exclude unrelated files.
- [x] Re-run frozen dependency, Migration, SQL, Validation and Build baselines.
- [x] Review the Moderate PostCSS advisory (KI-027); High/Critical audit remains zero.
- [x] Review CI status (KI-029); manual validation gate is documented for this RC.
- [x] Review all open release-gate and product-decision Known Issues.
- [x] Attach final Browser QA and Mobile QA evidence.
- [x] Confirm P0 = 0 and document accepted P1/P2 risks.
- [x] Complete Beta Ready Checklist.
- [ ] Product Owner completes final RR-1C acceptance.
- [ ] Create a Git tag only after explicit authorization.

## Stop conditions

Stop release work on any Auth regression, permission/data leak, failed migration, failed
validation/build, unexpected environment drift, missing rollback path or new P0.
