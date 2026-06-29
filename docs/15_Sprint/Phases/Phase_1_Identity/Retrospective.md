# Phase 1 Retrospective

Status: Engineering retrospective recorded; Product Owner phase exit pending.

## Outcome versus goals

Phase 1C established the intended identity/access path without adding a second provider or creating cloud resources. Email/password identity, verified-email admission, invitation redemption, Membership, elevated role grants, audit and RLS are represented by narrow package and database boundaries.

## What improved reading, publishing, archive trust or maintainability

Archive access now has one fail-closed capability source: active Membership. Reader is derived rather than duplicated as a role. Elevated roles have explicit grant/revocation history and security-significant mutations write audit entries.

## What worked

Provider types remained inside adapters, database clients remained outside pages, and atomic invariants stayed in reviewed SQL functions. Frozen dependency reuse limited the only new package to the approved `@supabase/ssr` adapter.

## What created friction

The Codex sandbox prevents Turbopack from binding its internal port, so production build required the approved controlled execution outside the sandbox. The environment also lacks a disposable PostgreSQL/Supabase runtime for executing SQL tests.

## Security, privacy, accessibility and operational findings

Invitation plaintext is intentionally shown once and never persisted. Authentication alone does not admit a member. Direct table mutations are revoked from app roles, RLS protects reads, and database functions re-authorize writes. The first Super Admin remains an owner-only operational bootstrap with no seed identity.

## Technical debt and known issues created/resolved

Identity/auth/invitation decisions KI-001, KI-006 and KI-011 are resolved. Migration rebuild and live SQL allow/deny execution remain acceptance evidence, not an implementation redesign. Remote Auth URL/SMTP/bootstrap configuration remains intentionally outside this Sprint.

## Metrics/evidence

Frozen install, type, lint, unit/contract tests and three-app production build passed. Sixteen executable tests pass; the transactional SQL script is prepared but not yet executed.

## Decisions to preserve or supersede

Preserve D-033/ADR-018: verified email/password, invitation-only admission, active Membership as Reader, manual elevated grants, provider isolation and audited security-definer workflows.

## Changes recommended for the next Phase

Do not enter Phase 2 until the migrations rebuild cleanly in a disposable database, the SQL role matrix passes and Product Owner accepts Phase 1. Phase 2 should consume existing identity/repository contracts instead of bypassing them.

The retrospective records learning; it does not silently change architecture or product scope.
