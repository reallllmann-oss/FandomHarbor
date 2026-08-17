# API and Server Contract Specification

Status: Phase 1C identity/access subset implemented through internal server actions and database functions; later domains remain proposed.

## 1. Boundary model

- Server Components: authorized page reads and initial data.
- Server Actions: app-internal typed mutations where HTTP interoperability is unnecessary.
- Route Handlers: uploads, exports, webhooks, cross-app contracts and endpoints requiring explicit HTTP semantics.
- Supabase Data API: used only behind grants/RLS and approved data-access modules; not an unreviewed public API.

## 2. Contract conventions

- JSON uses UTF-8, ISO-8601 UTC timestamps and opaque string/UUID IDs.
- Inputs are parsed with Zod; unknown privileged fields are rejected.
- Success payloads return the resource or explicit result, never database internals.
- Errors use `{ code, message, fieldErrors?, requestId }`; messages are safe for users.
- Cursor pagination uses `{ items, nextCursor }`; page sizes are bounded.
- Mutations that may retry accept an idempotency key or enforce a database uniqueness invariant.
- Optimistic concurrency uses revision/version identifiers for editor and moderation updates.
- Every contract states authentication, roles, ownership, rate limit and audit behavior.

## 3. Error catalog

The authoritative error vocabulary is `../Errors/ERROR_CATALOG.md`. The table below is a contract overview and must remain synchronized; new codes are created in the Errors registry first.

| Code                  | Meaning                                                      |
| --------------------- | ------------------------------------------------------------ |
| `VALIDATION_ERROR`    | Input failed schema or domain validation                     |
| `UNAUTHENTICATED`     | No valid identity                                            |
| `MEMBERSHIP_REQUIRED` | Valid identity lacks active archive admission                |
| `FORBIDDEN`           | Identity lacks role/ownership/field permission               |
| `NOT_FOUND`           | Missing or intentionally concealed resource                  |
| `CONFLICT`            | Stale revision, duplicate action or invalid state transition |
| `RATE_LIMITED`        | Abuse/rate policy blocked request                            |
| `CONTENT_REJECTED`    | Unsafe/unsupported content or upload                         |
| `INTERNAL_ERROR`      | Correlated server failure with no sensitive detail           |

## 4. Contract catalog

### Session and membership

| Operation                       | Auth                        | Purpose                                                       |
| ------------------------------- | --------------------------- | ------------------------------------------------------------- |
| Get current context             | Valid session               | Return membership, role capabilities and safe profile summary |
| Redeem invitation               | Valid/establishing account  | Atomically validate invite and create admission               |
| Get/update preferences          | Active member, own          | Locale, reading and privacy preferences                       |
| Request account export/deletion | Active member, own + reauth | Start auditable privacy workflow                              |

Authentication transport uses registration-name/password credentials. The provider adapter derives an internal Supabase identifier; users do not provide or verify an email. Provider objects are translated to ID-only `TrustedIdentity`/`TrustedSession` contracts and never enter business services.

### Invitations and roles

| Operation                      | Permission           | Notes                                     |
| ------------------------------ | -------------------- | ----------------------------------------- |
| Create/list/revoke own invite  | Author within policy | Secret shown only at creation; store hash |
| Admin list/revoke invites      | Admin                | Filter by state/inviter/lineage; audited  |
| Grant/revoke Author            | Admin                | Cannot self-elevate; reason required      |
| Grant/revoke Admin/Super Admin | Super Admin          | Reauth and stronger review; audited       |
| Suspend/reinstate membership   | Admin                | Reason, expiry if temporary, audit event  |

Phase 1C implementation notes:

- Sign-up requires an invitation code. The Auth identity, Profile, active Membership, Invitation Redemption, invite counter and audit record are committed atomically; invalid invitations leave no account.
- Invitation plaintext is returned only once by creation. Clients submit it over an authenticated server action; persistence and audit metadata contain only its SHA-256 hash or invitation ID.
- Reader access is an active-membership capability. Author/Admin/Super Admin are explicit grants, and every elevated mutation is re-authorized inside the database transaction.
- Provider/database errors are normalized at server action boundaries; raw Supabase `User`, `Session` and client objects are not public business contracts.

Admin P1 target contract（P1-00 frozen; not implemented）:

- Membership 与 Role Mutation 保持 Server Action ownership，不新增公开 REST 写接口。
- 所有写操作要求规范化 4–200 code-point reason、独立 Review/confirm、UUID requestId、expected-state 与 `Saved | Unchanged | Conflict`。
- Admin/Super Admin grant/revoke 与 elevated-account Membership 变更要求当前 actor 的 registration-name/password reauth；证明必须绑定单次 Review payload，客户端布尔值无效。
- 邀请管理不属于 Admin P1；现有 Admin/Super Admin capability matrix 与 final active Super Admin guard 不变。
- 具体 request ledger、expected-state transport、v2 function signature 与旧 function cutover 必须在 P1-01 独立设计/授权后进入实现。

### Pen names, works, chapters and series

| Resource/action                        | Permission                                        | Concurrency/audit                                       |
| -------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| List/get pen names                     | Active member public fields; owner private fields | Never expose owner account ID                           |
| Create/update/archive pen name         | Author owner                                      | Name/slug validation; audit sensitive change            |
| Search/list/get published works        | Active member                                     | Bounded filters; no draft leakage                       |
| Create/update work metadata            | Owning Author                                     | Expected revision/version required                      |
| Preview/publish/unpublish/archive work | Owning Author; moderation override Admin          | Publish validates required metadata; moderation audited |
| Create/reorder/update chapter          | Owning Author                                     | Atomic order/revision update                            |
| List/compare revisions                 | Owning Author; scoped Admin                       | Gated and rate-limited                                  |
| Restore revision                       | Owning Author or Admin policy                     | Creates new revision; reason/audit                      |
| Create/update series; reorder works    | Owning Author                                     | Validate authorship and order uniqueness                |

### Tags and discovery

| Operation                    | Permission              | Notes                                                              |
| ---------------------------- | ----------------------- | ------------------------------------------------------------------ |
| Search/suggest tags          | Active member           | Typed, bounded; canonical shown first                              |
| Submit free-form tag         | Author during work edit | Normalize without changing display intent                          |
| Canonicalize/alias/merge tag | Admin                   | Cycle/type checks, redirects and audit                             |
| Archive search               | Active member           | Text + typed filters + cursor; authorization before result shaping |

### Interactions

| Operation                        | Permission                        | Rules                                                        |
| -------------------------------- | --------------------------------- | ------------------------------------------------------------ |
| Give/remove Kudos                | Active member                     | Unique per work/member; idempotent                           |
| Create/update/delete bookmark    | Active member, own                | Private notes never exposed; recommendation explicit         |
| List own bookmarks/history       | Active member, own                | Private, cursor paginated                                    |
| Create/reply/edit/delete comment | Active member, own within policy  | Attribution mode, rate limits, edit history/moderation state |
| Moderate comment                 | Admin or defined work-owner scope | Never leak hidden identity                                   |

### Reports and administration

| Operation                       | Permission                           | Rules                                             |
| ------------------------------- | ------------------------------------ | ------------------------------------------------- |
| Create report / upload evidence | Active member                        | Reason required; private upload; rate limit       |
| View own report status          | Reporter                             | Policy-safe fields only                           |
| View author notice              | Affected Author                      | No reporter identity/evidence by default          |
| Claim/transition/resolve report | Admin                                | Valid state machine, reason and append-only event |
| List/manage users/content/tags  | Admin                                | Field-scoped projections, all mutations audited   |
| Query audit log                 | Admin scope/Super Admin              | Read-only, filterable, export restricted          |
| Query analytics                 | Author own aggregate/Admin aggregate | No raw identity leakage                           |

## 5. Upload protocol

1. Request authorized upload intent with expected media type/size/purpose.
2. Server creates an asset record and narrow private upload permission/signed URL.
3. Client uploads directly where approved.
4. Processing verifies actual type, size, metadata and malware/content requirements.
5. Asset becomes usable only after `ready`; rejected assets are quarantined/deleted.
6. Download/render access is re-authorized and signed/streamed; bucket paths alone grant nothing.

## 6. Cache and invalidation

- Gated/authenticated responses default to private/no-store until a reviewed cache design exists.
- Successful mutations invalidate only affected work, series, tag, interaction or Admin query keys/paths.
- Counters may be eventually consistent only when the UX states it and source rows remain correct.
- TanStack Query keys are centralized by domain, never hand-built inconsistently in screens.

## 7. Contract review checklist

Authentication, membership, role, ownership, state transition, field exposure, validation, idempotency, concurrency, rate limit, audit, cache, error, retention and allow/deny tests must be answered for each implemented operation.
