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

ADR-022 Option 3 closure narrows the current P1 implementation boundary without lowering that Reauth requirement: only Author Grant/Revoke and ordinary-account Membership mutations may be planned. Admin/Super Admin Role and elevated-account Membership mutations are deferred and have no callable current P1 contract. Elevated subjects remain readable through the minimal projection. Future reopening requires separate Product Owner authorization and a new Auth ADR.

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

## 8. Admin P1 identity governance reads（P1-02B local implementation）

权威细节见 [`P1_01_DATA_PERMISSION_REAUTH_DESIGN.md`](../../15_Sprint/Admin_P1/P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)。

### Read RPC

- `search_identity_access_subjects_v1`: active Admin/Super Admin only；注册名精确匹配或完整 UUID；1–50 keyset pagination；不返回 Auth email/phone/metadata。
- `get_identity_access_subject_v1`: 最小 Profile/Membership/active grant/effective role/关键时间投影，附 P1-02A helper 生成的 expected-state token。
- `list_identity_access_audit_v1`: 仅返回 target 的 Membership/Role 治理事件，以 `(created_at,id)` 稳定游标分页。
- 权限模式由 [ADR-023](../../17_Architecture_Decisions/ADR-023.md) 冻结：搜索与 Audit 为 `SECURITY INVOKER`；只有详情为严格只读 `SECURITY DEFINER`。详情必须在 target lookup 前通过 `auth.uid()`、live active Membership 与未撤销 Admin/Super Admin grant 授权，只调用现有 expected-state helper，禁止 dynamic SQL 和任何写入。三者均不依赖 `user_metadata` 或 JWT role claim。
- 三者创建后立即撤销 `PUBLIC/anon` execute，只向 `authenticated` grant；private helper execute 继续对 `PUBLIC/anon/authenticated/service_role` deny，不扩大底层表 Grant。

准确数据库签名：

- `search_identity_access_subjects_v1(p_query text default null, p_cursor jsonb default null, p_limit integer default 25) returns jsonb`
- `get_identity_access_subject_v1(p_user_id uuid) returns jsonb`
- `list_identity_access_audit_v1(p_user_id uuid, p_before jsonb default null, p_limit integer default 25) returns jsonb`

Search cursor 为 `{ missingRegistrationName, normalizedRegistrationName, userId }`；Audit cursor 为 `{ createdAt, auditId }`，其中 Audit ID 使用字符串避免客户端 bigint 精度损失。两个列表返回 `{ items, nextCursor, hasMore }`，limit 为 1–50。Detail 返回 P1-01 冻结的最小投影及 `{ snapshot, token }` expected-state。准确本地证据见 [`P1_02B_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02B_ACCEPTANCE_EVIDENCE.md)。

### Mutation RPC

- P1-02C 已在本地实现并保持 execute 关闭的准确签名：
  - `grant_author_role_v2(p_request_id uuid, p_target_user_id uuid, p_expected_state_token text, p_reason text) returns jsonb`
  - `revoke_author_role_v2(p_request_id uuid, p_target_user_id uuid, p_expected_state_token text, p_reason text) returns jsonb`
  - `set_ordinary_membership_state_v2(p_request_id uuid, p_target_user_id uuid, p_state membership_state, p_expected_state_token text, p_reason text) returns jsonb`
- 三者均为 `VOLATILE SECURITY DEFINER`、owner `postgres`、空 `search_path`；`PUBLIC/anon/authenticated/service_role` 全部 execute deny。P1-04 原子 cutover 前不得由应用、Server Action 或客户端调用。
- Role 方法没有 role 参数；Membership 只接受 `active | suspended | revoked`，没有 Reauth proof、actor、capability 或 dormant elevated 参数。
- 同 requestId/同规范 payload 返回 private ledger 原结果；同 ID 不同 payload/actor 稳定拒绝。
- 结果只为 `Saved | Unchanged | Conflict`；Saved 精确一次业务变化与一条 Audit，Unchanged/Conflict 零业务 Audit。
- 所有 v2 写入使用固定顺序全局治理事务锁；在锁内重算 expected-state、实时权限和 target 边界。Membership RPC 对任何存在未撤销 Admin/Super Admin grant 的 target fail closed。
- Product Owner 已选择 ADR-022 Option 3：KI-033 当前 P1 为 `ACCEPTED DEFERRED BOUNDARY`，但技术问题未解决。Admin/Super Admin Role 与 elevated-account Membership 没有当前 P1 write RPC 或 grant；不得使用 Session age、JWT `iat`、客户端 boolean、再次普通登录或新建 `aal1` Session 代替 step-up。
- cutover 必须先撤销旧 `grant_role`、`revoke_role`、`set_membership_state` 的 authenticated execute；正常回滚不得恢复这些绕过入口。最后一名 active Super Admin 数据库保护保留。

P1-02C 的 wire result 使用小写 `saved | unchanged | conflict`。三者都返回 requestId、targetUserId、数据库生成的 current state/token；Saved 额外返回 Audit/changed time，Role Saved 返回 grant ID；Conflict 返回安全原因与最新快照。准确本地证据见 [`P1_02C_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02C_ACCEPTANCE_EVIDENCE.md)。

## 9. Admin P1 provider-neutral governance Domain（P1-02D local implementation）

P1-02D 在 `@fandom-harbor/services` 中建立六个 RPC 的唯一 provider-neutral 业务合同，但不实现任何 RPC mapper、Repository、Service、Server Action 或 UI：

- Read Port 只表达 Subject search、Subject detail 与 target Audit list；使用 NFKC registration-name/full UUID search、1–50 page limit、稳定 Subject/Audit cursor、脱敏 Profile、Membership、active/effective roles、Audit summary 和 database-issued expected-state。
- Write Port 只有 `grantAuthorRole`、`revokeAuthorRole` 与 `setOrdinaryMembershipState` 三个方法。Role Command 没有 role 字段；Membership Command 只接受 `active | suspended | revoked`。
- requestId、User ID、expected-state token、normalized reason、registration-name query 与 page limit 必须先通过 Domain parser。expected-state token 是 64 位 lowercase hex opaque value；Domain 不解析、重算或生成 token。
- Mutation result 是可穷尽的 `saved | unchanged | conflict` discriminated union。Conflict 必须携带数据库返回的 current snapshot/token；Unchanged/Conflict 不能携带 Audit ID。
- Domain error 只暴露冻结的安全 code 与固定消息；不得包含 SQLSTATE、Supabase/PostgREST object、表/函数名、Token、Cookie、Session 或 provider metadata。

所有 unknown object parser 拒绝额外 privileged 字段。elevated role 仅存在于读取模型及 `ELEVATED_MUTATION_DEFERRED` 安全错误；当前 Domain 没有 Admin/Super Admin mutation Command、generic role mutation、proof、actor 或 capability 注入点。P1-02E 才可在独立授权下把 snake_case RPC transport 严格映射到这些 Domain 类型。

## 10. Admin P1 strict governance Repository（P1-02E local implementation）

P1-02E 在 `@fandom-harbor/database` 中实现 P1-02D 六方法 Port，不修改 Domain 或数据库合同：

- Read 方法只调用 `search_identity_access_subjects_v1`、`get_identity_access_subject_v1` 与 `list_identity_access_audit_v1`。
- ordinary write 方法只调用 `grant_author_role_v2`、`revoke_author_role_v2` 与 `set_ordinary_membership_state_v2`；这些函数在独立授权的 P1-04 原子 cutover 前继续 execute closed。
- Request transport 把 Domain 值映射到准确 `p_*` RPC 参数。Repository 不提供 actor、role、capability、proof 或自动生成的 requestId。
- 所有成功数据保持 `unknown`，直至 strict Domain parser 通过。未知 key、非法 UUID/time/token/enum/cursor/result、response ID 不一致和超出 limit 的 page 均 fail closed 为 `DATA_CORRUPTION`。
- 结构化错误只按 stable code 与两个冻结 safe detail allowlist 映射；自然语言 provider message、SQL 内部信息和 raw error object 不进入 Domain 输出。
- 每个 mutation RPC builder 显式关闭自动 retry。transport uncertainty 返回安全错误；只有上层在重新 Review 后才能显式重放同一 requestId。
- 不存在 direct table read/write、private helper、旧 RPC fallback、mutation retry loop 或 elevated write interface。

实施证据见 [`P1_02E_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02E_ACCEPTANCE_EVIDENCE.md)。

## 11. Admin P1 live-access Governance Service（P1-02F local implementation）

P1-02F 在 `@fandom-harbor/services` 中编排 P1-02D Ports，不接触 RPC、Supabase client 或具体 Repository：

- 六个公开用例为 Search subjects、Get subject detail、List target Audit、Grant Author、Revoke Author 与 Set ordinary Membership。
- 调用顺序固定为：strict input parser → 单次 injected live-access check → ordinary mutation 的只读 target classification → 对应 Port 最多一次。
- live-access check 必须返回本次调用重新读取的可信 context；只有 active Membership 且拥有 live Admin/Super Admin role 与 `admin:operate` capability 才可继续。Guest/null、Reader、Author 与 inactive Admin 在 Port 前 fail closed。
- 输入 parser 只验证调用者已提交的 UUID/query/cursor/limit/requestId/token/reason/state，不查询目标，因此采用 input-first 顺序不会泄漏目标是否存在。未授权 target lookup 不会发生。
- 写入 target classification 是 defense-in-depth UX/security guard；若 target 当前为 elevated，Service 返回 `ELEVATED_MUTATION_DEFERRED` 且不调用 mutation Port。classification 后发生竞态时，数据库仍重新分类并最终拒绝。
- requestId、target、opaque expected-state 与 normalized reason 原样进入对应 Command。Service 不生成 requestId、不重算 token、不自动 retry transport failure，也不把 Conflict 转为异常、Saved 或二次 mutation。
- 已清洗的 P1-02D Domain Error 原样保留；任何非 Domain 异常统一成为固定 `UNKNOWN_REPOSITORY_ERROR`，不保留原始 cause/message/provider metadata。

未来 P1-03/P1-04 composition root 必须注入 live-access checker 与 P1-02E Repository Ports。Server Action 负责取得请求级 Auth/cookie 边界和序列化安全结果，但不得跳过 Service 直接调用 Repository。P1-02F 不创建 Action、FormData parser、UI、cache invalidation 或 write execute grant。实施证据见 [`P1_02F_ACCEPTANCE_EVIDENCE.md`](../../15_Sprint/Admin_P1/P1_02F_ACCEPTANCE_EVIDENCE.md)。
