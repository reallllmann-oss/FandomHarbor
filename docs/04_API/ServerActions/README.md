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

### `grantRole` / `revokeRole` / `setMembershipState`

- Owner: `apps/admin` / Identity Access.
- Current P0 input: User ID、role/state 与 reason；Server Action 复核 Session 与 `admin:operate`，数据库函数再次授权并审计。
- Current permission: Admin 仅管理 Author 与普通成员 Membership；Super Admin 可管理 elevated roles/accounts；final active Super Admin 受保护。
- Current limitation: 直接提交，无成员搜索/详情、Review、requestId、expected-state 或 stale Conflict。
- P1-00 target（not implemented）: 所有写操作进入 reason + Review/confirm + requestId + expected-state 合同；elevated role/elevated Membership 额外执行当前 actor password reauth。P1-01 必须定义 v2/cutover，旧入口不得在 cutover 后绕过新合同。

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
