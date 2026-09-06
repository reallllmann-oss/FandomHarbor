# Server Action Registry

Server Actions are typed application-internal mutation boundaries. They validate Zod input, re-check trusted identity/capability, rely on RLS/transactions, return safe results and define cache/query invalidation.

Each action documents owning app/domain, input/output contract, authorization, concurrency/idempotency, audit, invalidation and allow/deny tests. A Server Action is not automatically reusable by another app.

## Implemented actions

### `signUp`

- Owner: `apps/web` / Auth.
- Input: registration name, password and invitation code; Zod validates required fields, a password length of 8–128 and registration-name safety.
- Persistence: hashes the invitation secret, then calls the Auth provider. The provider performs a safe invitation preflight before Supabase signup; the database trigger remains the final atomic authority.
- Failure: distinguishes invalid/unavailable invitation, duplicate registration name, request rate limit and provider failure without claiming success.
- Success: signs out the newly created Session and redirects to registration-name login. No verification email is sent.

### `signIn`

- Owner: `apps/web` and `apps/admin` / Auth.
- Input: registration name and password.
- Authorization: Web routes by active Membership capability; Admin additionally requires `admin:operate` and signs out unauthorized identities.

### `governOrdinaryAccessAction`

- Owner: `apps/admin` / Identity Access Governance.
- Scope: only Author Grant/Revoke and ordinary-account Membership `active | suspended | revoked`; no generic role input, elevated mutation or Reauth bypass can be expressed.
- Review: parses the operation/target/reason, re-reads target detail through the live-access Governance Service, normalizes reason, binds the database-issued expected-state token and creates a server-owned stable requestId.
- Confirm: accepts only the server-prepared Review state, performs the fresh Service live-access/target checks and invokes at most one matching mutation method. It never accepts client actor/capability, recomputes expected-state, retries automatically or resolves Conflict.
- Result: preserves `Saved | Unchanged | Conflict`; safe explicit retry reuses the same requestId, while Conflict clears the executable Review and requires refresh plus a new Review.
- Authorization: the Action uses the request Session boundary; the Service requires active Membership, a live Admin/Super Admin role and `admin:operate`; the v2 RPC repeats live authorization and target protection in the transaction.
- Cutover: P1-04A Commit `2750205f2b9a3cce2c09d2e3f5e43ba1b7d421cd` locally revokes authenticated execute from legacy `grant_role` / `revoke_role` / `set_membership_state` and grants only the three ordinary v2 signatures. P1-04B Commit `bf35f5a1e4b005e04bb4b9d054cf6310ffb0c74c` connects the Review/confirm UI and Action. Normal rollback must not reopen the legacy entry points.
- Release boundary: this is a committed local implementation only. No remote Migration/SQL/ACL apply or Production mutation has occurred; P1-05 dedicated non-Production QA remains required and not authorized.
- Elevated boundary: [ADR-022 Option 3](../../17_Architecture_Decisions/ADR-022.md) and KI-033 remain unresolved/deferred. Admin/Super Admin Role changes and elevated-account Membership changes have no executable Action or RPC.

### `createWorkDraft`

- Owner: `apps/web` / Author Studio.
- Input: title, summary, optional Category UUID and up to 100 Tag UUIDs; Zod validated.
- Authorization: authenticated `work:author`; owner is never accepted from client input.
- Persistence: `createWorkDraftService → createAuthorWorkDraft Repository → create_author_work_draft RPC`.
- Transaction: PostgreSQL atomically inserts `works` and `work_tags`; status is always `draft`, `published_at` is null and owner is `auth.uid()`.
- Failure: returns a safe error state and creates no partial Work.
- Success: redirects to `/studio/works/[workId]/edit`.
- Invalidation: no cache invalidation yet because the Studio owner list remains fixture-backed.

### `submitDraftEditor`

- Owner: `apps/web` / Author Studio Draft Editor.
- Input: `workId`, current body text and `intent = save | publish`; Zod validated.
- Authorization: authenticated `work:author`; owner is never accepted from client input.
- Persistence:
  - `save`: `saveDraftWorkBody` through the existing draft editor Service/Repository boundary
  - `publish`: save current body, then publish the Work and first Chapter through `publishDraftWork`
- Transaction model: no new RPC; publish uses the existing owner-RLS-protected `works` and `chapters` tables directly.
- Failure: returns a safe, honest error state; it never reports publish success when publish did not complete.
- Success:
  - `save`: redirects back to `/studio/works/[workId]/edit?status=saved`
  - `publish`: redirects to `/works/[workSlug]/chapters/[chapterSlug]`
- Invalidation: revalidates the editor path before redirecting.
