# Known Issues and Open Questions

This is the authoritative queue for unresolved foundation questions. “Open” means implementation depending on that answer is blocked; it is not permission to assume.

| ID     | Topic                                                      | Why it matters                                                                                                                             | Blocks                              | Status                                                                                                                                            |
| ------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| KI-001 | Authentication method: email/password, magic link, or both | Recovery, abuse controls and email delivery differ                                                                                         | Auth implementation                 | Superseded by D-037/ADR-020: registration-name/password; no user email confirmation                                                               |
| KI-002 | Meaning of “anonymous comment”                             | Recommended model is authenticated member with public identity hidden but moderator identity retained                                      | Comment schema and policy           | Open                                                                                                                                              |
| KI-003 | MVP content formats                                        | Text is core; image, external link, PDF and EPUB add distinct security and reader work                                                     | Upload/storage implementation       | Open                                                                                                                                              |
| KI-004 | Age policy and adult-content compliance                    | Ratings/warnings alone may not satisfy jurisdiction or hosting requirements                                                                | Launch policy                       | Open                                                                                                                                              |
| KI-005 | Deletion, export and retention policy                      | Revisions, reports, audit logs and analytics have conflicting retention needs                                                              | Final schema                        | Open                                                                                                                                              |
| KI-006 | Invitation permission limits                               | Invite redemption must not bypass manual Author/Admin role grants                                                                          | Invite schema and UX                | Resolved by D-005/D-033: active membership only; no elevated role                                                                                 |
| KI-007 | Moderation appeal and author disclosure rules              | Reporter privacy and author transparency can conflict                                                                                      | Report workflow                     | Open                                                                                                                                              |
| KI-008 | Analytics consent, retention and metric definitions        | Reading analytics can undermine private-community expectations                                                                             | Analytics implementation            | Open                                                                                                                                              |
| KI-009 | Launch scale, budget, uptime target, RPO and RTO           | Determines indexes, backup plan, observability and Vercel/Supabase tiers                                                                   | Production readiness                | Open                                                                                                                                              |
| KI-010 | Languages and localization                                 | Affects schema, routes, search, typography and content metadata                                                                            | IA and search refinement            | Open                                                                                                                                              |
| KI-011 | Transactional email provider and notification scope        | Required for auth, invites and moderation communication                                                                                    | Email implementation                | Auth email no longer required by D-037; future product mail remains separately open                                                               |
| KI-012 | Domain, legal identity, policies and takedown process      | Needed before public launch and user-generated uploads                                                                                     | Launch                              | Open                                                                                                                                              |
| KI-013 | Recommendation semantics and visibility                    | Must not become a public popularity ranking                                                                                                | Interaction design                  | Open                                                                                                                                              |
| KI-014 | Invite-chain enforcement                                   | Whether sanctions propagate to descendants must be a deliberate moderation rule                                                            | Invite moderation                   | Open                                                                                                                                              |
| KI-015 | Reading-history default and privacy controls               | History is sensitive behavioral data                                                                                                       | Reading history                     | Open                                                                                                                                              |
| KI-016 | Remote Supabase Auth acceptance                            | Remote migration, Auth and full Product Owner acceptance chain required verification                                                       | Phase 2 Pass                        | Resolved 2026-07-02 — registration → login → manual Author grant → Studio passed                                                                  |
| KI-017 | Deployed frontend smoke test                               | Mission 3A browser QA used local Web against remote Supabase; deployed Vercel URL remains unverified                                       | Release Readiness                   | Resolved 2026-07-07 — RR-1B Product Owner accepted production Browser Smoke Test                                                                  |
| KI-018 | Release Candidate source baseline                          | Accepted Phase 2 through completed Phase 3 changes remain in an uncommitted working tree rather than one identifiable Git release baseline | Release Candidate                   | Resolved — Product Owner accepted baseline `8495bded5e0c78985be7410cceb902cd2c090421`                                                             |
| KI-019 | Supabase SQL test harness format                           | Existing SQL suites are transactional scripts without TAP plans, so `supabase test db` reports no plan despite successful SQL execution    | Test reporting                      | Open — execute with PostgreSQL `ON_ERROR_STOP`; convert harness separately                                                                        |
| KI-020 | Studio multi-step writes                                   | Chapter publication selection and tag replacement reuse existing grants but are not one newly authorized atomic RPC                        | Acceptance robustness               | Open — refresh and verify after network failure; atomic write RPC requires approval                                                               |
| KI-021 | Chapter deletion                                           | Existing schema has no Chapter delete grant/policy and this Mission explicitly forbids permission expansion                                | Chapter management                  | Open — deletion remains unavailable by approved scope                                                                                             |
| KI-022 | Studio Works owner query                                   | Filtering by hidden `owner_user_id` caused legitimate Author Studio reads to fail                                                          | A-04 / A-05 / A-06 acceptance       | Resolved 2026-07-03 by authenticated-only owner-scoped read RPCs                                                                                  |
| KI-023 | Search growth performance                                  | Search MVP uses bounded case-insensitive contains scans without ranking, pagination or a dedicated search index                            | Post-Beta search scale              | Open — acceptable for Beta; review when catalog size or latency requires it                                                                       |
| KI-024 | Archive offset pagination consistency                      | New publications during a browsing session can move item positions across offset-based pages                                               | Post-Beta browse scale              | Open — deterministic within an unchanged dataset; consider cursors if required                                                                    |
| KI-025 | Production canonical origin configuration                  | Canonical, Open Graph and Sitemap URLs need the final public origin rather than a deployment preview URL                                   | Release Readiness                   | Resolved 2026-07-07 — RR-1B Product Owner accepted HTTPS, Metadata, Canonical and Open Graph                                                      |
| KI-026 | Published Work crawler body access                         | Existing Work detail permission flow redirects unauthenticated visitors to sign-in although Published metadata and Sitemap entries exist   | Product permission decision         | Open — changing public body access requires an explicit Auth/permission decision                                                                  |
| KI-027 | Transitive PostCSS security advisory                       | Next.js currently resolves PostCSS 8.4.31, affected by moderate advisory GHSA-qx2v-qp2m-jg93; production audit has no high/critical items  | Release Candidate dependency review | Open — dependency/toolchain change requires separate authorization or explicit risk acceptance                                                    |
| KI-028 | Next.js workspace-root inference warning                   | Builds detect an unrelated parent-level lockfile and infer the workspace root outside this repository                                      | Build audit                         | Open — all builds pass; resolve through authorized toolchain configuration or environment cleanup                                                 |
| KI-029 | No automated CI workflow                                   | Validation is reproducible locally but the repository has no checked-in CI workflow to enforce it remotely                                 | Release process                     | Open — decide and authorize CI before Release Candidate, or explicitly accept manual gate                                                         |
| KI-030 | Supabase linked dry-run temporary-role authentication      | `migration list --linked` succeeds at 14/14, but an additional `db push --dry-run` cannot authenticate its temporary login role            | Database deployment preflight       | Open — no write occurred; re-authenticate/repair CLI access before any future database deployment                                                 |
| KI-031 | Local Auth identities missing after clean rebuild          | RR-1C Product Owner acceptance could not verify Login, Reader, Author or Studio when local Auth users were empty                           | RR-1C final acceptance              | Resolved 2026-07-11 — localhost-only idempotent QA fixture restores Reader/Author identities                                                      |
| KI-032 | Long-form Reading QA content unavailable                   | Local published chapters were too short to validate 20–30 minute reading comfort、long-document scrolling and fatigue                      | UX-06C Step 04 / Step 05 gate       | Resolved by UX-06C Step04A — Fixture Library now provides 150-paragraph Long-form and 60-paragraph Medium Chapters；Step04 rerun remains required |

## RR-1C classification

### Product / operational decisions before or during Go / No-Go

- KI-009: approve launch scale, budget, uptime, RPO and RTO.
- KI-012: approve domain, legal identity, policies and takedown process.

- KI-004, KI-005 and KI-026.

### Accepted Beta technical risks / post-Beta triggers

- KI-019, KI-020, KI-021, KI-023, KI-024, KI-027, KI-028, KI-029 and KI-030.

### Future feature decisions, not Release Readiness blockers

- KI-002, KI-003, KI-007, KI-008, KI-010, KI-011, KI-013, KI-014 and KI-015.

### Resolved history

- KI-001, KI-006, KI-016, KI-017, KI-018, KI-022, KI-025 and KI-031 remain in the table as audit history.

## Current release-readiness limitations

- Phase 3 and Release Readiness through RR-1C are Product Owner accepted. The
  Release Candidate is Beta Ready.
- Database changes are represented by 14 ordered migrations and six SQL suites, but
  the SQL harness remains non-TAP (KI-019).
- Production deployment, domain/HTTPS configuration and deployed smoke testing passed RR-1B
  Product Owner acceptance.
- No checked-in CI workflow currently enforces the local validation baseline (KI-029).

## Resolution protocol

1. Research the question and document options/trade-offs.
2. Obtain product-owner approval when product behavior or cost changes.
3. Record the accepted answer in `DECISIONS.md`.
4. Update affected detailed documents.
5. Mark the issue Resolved with a link; do not delete its history.
