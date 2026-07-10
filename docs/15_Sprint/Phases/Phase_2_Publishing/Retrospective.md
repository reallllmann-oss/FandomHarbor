# Phase 2 Retrospective

Status: Complete — Phase 2 Passed

## Outcome versus goals

The accepted Phase 2 V1 path now covers invitation registration, registration-name/password login, Reader access, Author draft creation and editing, minimal publish/read flow, local library return paths and authenticated Studio entry.

## What improved reading, publishing, archive trust or maintainability

- Reader public routes remain published-only.
- Author writes remain owner-scoped and role-gated.
- Registration now reports actionable invitation, name, password and service errors.
- Remote acceptance is recorded separately from local test evidence.

## What worked

- Small, gated Sprints kept identity, content and publishing boundaries reviewable.
- Real PostgreSQL/Auth validation caught issues that fixture and component tests could not.
- Final Product Owner testing verified the same remote-backed browser path users will exercise.

## What created friction

- Local success initially obscured that the remote Supabase project lacked the latest Auth migrations.
- Generic registration error handling delayed root-cause discovery.
- Fixture-backed Studio lists and database-backed editor routes make the current V1 handoff less intuitive.

## Security, privacy, accessibility and operational findings

- Invitation redemption creates active Membership only and does not auto-grant Author.
- Author was granted manually with an audit record before Studio access.
- Email confirmation is intentionally disabled for the approved registration-name model.
- Remote schema and Auth configuration must remain part of every Phase acceptance checklist.

## Technical debt and known issues created/resolved

- Resolved: remote Auth migration/configuration drift and Phase 2 registration P0.
- Remaining: Revision/Diff/Restore, richer editing, multi-chapter workflows, cloud library sync and other limitations listed in `Product_Handoff.md`.

## Metrics/evidence

- Nine remote migrations deployed.
- Registration RPCs returned successfully.
- Product Owner completed real registration → login → Studio with `Auther001`.
- Phase 2 status: Pass.

## Decisions to preserve or supersede

- Preserve registration name + password + invitation as the V1 Auth model.
- Preserve manual elevated-role grants and audited authorization.
- Preserve remote browser acceptance as mandatory evidence; local passing results alone cannot clear a deployment P0.

## Changes recommended for the next Phase

- Require a separately approved Phase 3 brief before implementation.
- Add explicit remote migration/configuration verification to the beginning of future handoffs.
- Keep deferred Phase 2 blueprint items visible rather than silently treating them as delivered.
  The retrospective records learning; it does not silently change architecture or product scope.
