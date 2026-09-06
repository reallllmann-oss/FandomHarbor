# ADMIN P1-02 — Implementation Plan and Engineering Gate Freeze

状态：`PLANNING COMPLETE — IMPLEMENTATION NOT AUTHORIZED`
日期：2026-08-17
父提交：`37694f3550607e73d766471613357845a20fdc31`
独立实施区：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02`
分支：`codex/admin-p1-02-implementation-plan`

本文件只冻结普通 Identity & Access Governance 的实施顺序、候选文件、依赖、测试、Owner Gate 与回滚策略。它不授权创建 Migration、修改产品代码、执行 SQL、连接远程 Supabase、进入 P1-03/P1-04、Commit、Push、PR 或 Deployment。

## 1. 权威来源与冲突检查

实施时必须同时遵守：

- [P1-00 Scope and Security Contract](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)
- [Admin Identity & Access Governance](../../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md)
- [ADR-021](../../17_Architecture_Decisions/ADR-021.md)
- [P1-01 Data, Permission and Reauth Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)
- [P1-01 Non-Production QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)
- [ADR-022 Option 3](../../17_Architecture_Decisions/ADR-022.md)
- [ADR-023 Read RPC Authority Boundary](../../17_Architecture_Decisions/ADR-023.md)

交叉检查结论：`PASS`。

- P1-00 与 ADR-021 冻结 elevated mutation 必须具备操作绑定 Reauth；ADR-022 没有降低该要求，而是把全部 elevated mutations 延期。
- KI-033 保持 `ACCEPTED DEFERRED BOUNDARY`，技术问题未解决；延期不表示 Reauth 已验收，也不产生任何 elevated write 实施入口。
- 当前可规划写入只有 Author Role Grant/Revoke 与普通账户 Membership 状态变更；Admin/Super Admin Role 和任何存在未撤销 Admin/Super Admin grant 的目标账号 Membership 均不可写。
- P1-02 只负责后端普通治理实施准备；P1-03 保留只读目录/搜索/详情/Audit UI，P1-04 保留 Review/confirm、Server Action 可执行接入与写入 UI。
- P1-02 不通过实现隐藏 UI、临时 Action、旧 RPC wrapper 或客户端直写提前吞并 P1-03/P1-04。

若后续发现任一权威文档要求开放 elevated write、恢复旧 RPC execute、使用普通 Session 代替 Reauth，或把 UI 提前放入 P1-02，立即停止并请求 Product Owner 重新决策。

### 1.1 当前 Supabase 官方合同复核

2026-08-17 按要求先检查 [Supabase Changelog](https://supabase.com/changelog.md)，再检查 [Securing your API](https://supabase.com/docs/guides/api/securing-your-api)、[Database Functions](https://supabase.com/docs/guides/database/functions)、[Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) 与 [CLI reference](https://supabase.com/docs/reference/cli/introduction)。规划采用以下当前合同：

- Data API 暴露是显式边界；private ledger 不进入 exposed schema，且表级 RLS、revoke 与最小 grant 仍须独立证明。
- database function 优先 invoker；确需 definer 时固定空 `search_path`、全限定对象、撤销默认 execute，并在函数内使用 `auth.uid()` 与数据库实时 Membership/Role 复核。
- 授权不使用可由用户修改的 `user_metadata`，service role/secret 永不进入浏览器。
- 本规划使用 Supabase CLI 2.108.0；仅在先执行对应 `--help` 后记录未来 `migration new/list`、`db reset/lint/advisors` 与 `test db` 命令，没有连接或写入本地/远程数据库。

## 2. 当前实现映射

审计来源只包括父提交中的已提交文件；未读取或吸收原受保护 release 工作区的未提交 `/access` 内容。

| 层次                   | 当前事实                                                                                                       | 权威文件                                                                                                                             | 后续最小落点                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Identity tables/RLS    | `profiles`、`memberships`、`role_grants`、`audit_logs` 已启用 RLS；authenticated 读由 own-or-admin policy 控制 | `supabase/migrations/20260629210000_identity_access_foundation.sql`                                                                  | 不建立第二套事实；新增对象只在新 Migration               |
| Registration name      | `profiles.registration_name` 与 `lower(...)` 唯一索引已存在                                                    | `supabase/migrations/20260702090000_registration_name_invitation_signup.sql`                                                         | 精确注册名/UUID 查询复用现有字段与索引                   |
| Legacy writes          | `grant_role`、`revoke_role`、`set_membership_state` 是 `SECURITY DEFINER`，authenticated 当前可执行            | `supabase/migrations/20260629212000_membership_role_workflows.sql`                                                                   | v2 就绪前不改；最终 cutover 原子撤权                     |
| Live authorization     | `private.is_active_member`、`private.has_role` 与 `auth.uid()` 是数据库实时事实                                | identity foundation/workflow migrations                                                                                              | 所有新 RPC 复用实时检查，不使用 JWT role/user metadata   |
| Final Super Admin      | 旧 Role/Membership workflow 使用 advisory lock 与数据库计数                                                    | membership/role workflow migration                                                                                                   | guard 保留；当前 elevated 调用仍全部拒绝                 |
| Audit                  | `private.write_audit` 原子写入；Site Copy 已有专项不可变 Trigger                                               | identity foundation、Admin P0 Site Copy foundation                                                                                   | 扩展 Identity Access action 不可变保护                   |
| SQL tests              | Phase 1C transaction suite 覆盖基本 RLS、Role/Membership、Audit 与 final Super Admin                           | `supabase/tests/phase_1c_identity_access.sql`                                                                                        | 新增 P1 专项语义/并发 suite；cutover 时更新旧入口断言    |
| Static Migration tests | Vitest 直接读取 Migration 并断言安全合同                                                                       | `packages/database/src/migration-contract.test.ts`                                                                                   | 新建 P1 专项 migration contract test，避免扩张历史文件   |
| Auth/capability        | active Membership + live roles 派生 `admin:operate`/`super_admin:operate`                                      | `packages/auth/src/identity.ts`、`identity.test.ts`                                                                                  | 不新增 capability；继续作为应用前置检查                  |
| Legacy Domain/Store    | `IdentityAccessStore` 同时承载邀请与旧 Role/Membership void-style 方法                                         | `packages/services/src/identity-access.ts`                                                                                           | 邀请保持不动；新增独立 governance Domain/Service         |
| Legacy Repository      | `identity-access-adapter.ts` 直接调用旧 RPC，错误统一为 `DatabaseAccessError`                                  | `packages/database/src/identity-access-adapter.ts`                                                                                   | 新增严格解析的 governance Repository，不复用邀请 adapter |
| Admin wiring           | `createAdminIdentityAccess()` 建立 Auth、Access Context 与 legacy store                                        | `apps/admin/src/lib/identity-access.ts`                                                                                              | P1-03/P1-04 再接入新 service；P1-02 不改页面             |
| Current `/access`      | 三个直接表单；role/state/reason；无读取、Review、requestId 或 expected-state                                   | `apps/admin/src/app/access/page.tsx`、`actions.ts`                                                                                   | P1-03/P1-04 专属；P1-02 不修改                           |
| Accepted pattern       | Site Copy 已有 strict Domain → Repository → Service → Action、safe errors、Saved/Unchanged/Conflict            | `packages/services/src/site-copy-domain.ts`、`packages/database/src/site-copy-repository.ts`、`apps/admin/src/lib/site-copy-save.ts` | 复用边界模式，不复制 Site Copy 数据模型                  |

## 3. 固定工程边界

### 3.1 允许的后端能力

- `search_identity_access_subjects_v1`
- `get_identity_access_subject_v1`
- `list_identity_access_audit_v1`
- `grant_author_role_v2`
- `revoke_author_role_v2`
- `set_ordinary_membership_state_v2`
- private request ledger、expected-state、requestId replay、Audit 原子性。

### 3.2 禁止的能力

- 不创建接受 `role` 参数的通用 v2 write RPC。
- 不创建 Admin/Super Admin Role write RPC、proof 参数、Reauth issuer/consumer 或 dormant elevated flag。
- `set_ordinary_membership_state_v2` 必须在数据库锁内拒绝任何存在未撤销 `admin` 或 `super_admin` grant 的 target，不因 Membership 当前为 suspended/revoked 而降级为普通账户。
- 不恢复或包装旧 RPC 为兼容入口；不新增 direct table mutation grant。
- 不修改 Auth、capability、Web Admin 入口、邀请、Site Copy 或 P0 八字段。

### 3.3 固定调用链

```text
P1-03/P1-04 Admin boundary
  → Trusted Access Context
  → Identity Access Governance Service
  → strict Governance Repository
  → narrow Supabase RPC
  → live DB authorization + transaction + ledger + Audit
```

页面、Server Action 或 Service 的预判只用于安全 UX；数据库是 ordinary/elevated target、requestId、expected-state、final Super Admin 与 Audit 原子性的最终执行边界。

## 4. 步骤总表

| Step       | 目标                                            | 产物状态          | Owner Gate                             |
| ---------- | ----------------------------------------------- | ----------------- | -------------------------------------- |
| P1-02A     | private ledger 与数据库安全 helper foundation   | 本地后端实现候选  | 单独授权创建 Migration/SQL 测试        |
| P1-02B     | 三个字段最小化 read RPC                         | 本地后端实现候选  | 单独授权 read Migration                |
| P1-02C     | 三个 ordinary v2 write RPC，execute 保持关闭    | 本地后端实现候选  | 单独授权 write-definition Migration    |
| P1-02D     | provider-neutral Domain types/parsers/errors    | 本地纯 TypeScript | 单独授权 Domain 实现                   |
| P1-02E     | strict Repository 与 Supabase transport mapping | 本地纯 TypeScript | 单独授权 Repository 实现               |
| P1-02F     | live-access Service 与普通治理 use cases        | 本地纯 TypeScript | 单独授权 Service 实现                  |
| P1-02G     | 后端集成、P0 回归与 P1-03/P1-04 handoff         | 本地验证/文档     | 单独授权 P1-02 closure；不等于 UI 授权 |
| P1-04 Gate | Server Action、Review UI 与旧 RPC 原子 cutover  | 明确延期到 P1-04  | P1-03/P1-04 分别独立授权后才可执行     |

任何 Step 的授权都不自动授权下一 Step、Commit、Push、PR、远程 Migration、QA、Preview 或 Deployment。

## 5. P1-02A — Private ledger and database safety foundation

### Objective

建立只服务于当前三种 ordinary operation 的私有幂等 ledger、规范化/fingerprint/state-token helper 和 Identity Access Audit 不可变保护，不改变任何应用可调用写入口。

### Scope

- 通过经 `supabase migration new --help` 确认的命令生成唯一 Migration 文件，不手写时间戳。
- 新增 `private.identity_access_request_ledger`：全局 UUID 主键、actor/operation/target、32-byte fingerprint、closed result、唯一 Saved Audit 引用、indefinite retention。
- operation 约束只允许 `grant_author_role`、`revoke_author_role`、`set_ordinary_membership_state`。
- table RLS enabled；`PUBLIC/anon/authenticated/service_role` 无 table/sequence privilege；private schema 不加入 exposed schemas。
- helper 使用明确规范化版本；reason 为 NFC/trim、4–200 code points、拒绝控制字符和换行；payload 不保存 password 或完整原文。
- 扩展 Audit immutability，使 Identity Access action 的 UPDATE/DELETE 在数据库拒绝。

### Out of Scope

read/write RPC、应用代码、UI、cutover、远程 apply、retention cleanup。

### Candidate files

- 新建 `supabase/migrations/<generated>_admin_p1_identity_access_ledger.sql`
- 新建 `supabase/tests/admin_p1_identity_access_governance.sql`
- 新建 `packages/database/src/identity-access-governance-migration-contract.test.ts`

### Dependencies

父提交中的 identity foundation、registration-name Migration、`private.write_audit`、`pgcrypto`；不新增 npm dependency。

### Acceptance

- ledger 不在 Data API exposed schema，且任何应用角色不能直接 SELECT/INSERT/UPDATE/DELETE。
- requestId 为非 nil 全局唯一 UUID；fingerprint 固定 32 bytes；Saved 才允许非空且唯一 audit ID。
- ledger append-only；失败事务不留下 pending/ghost row。
- helper 不接受 actor 或 capability 作为客户端授权事实。

### Validation

Migration static contract、clean local reset、catalog/RLS/grant assertions、Audit immutability、invalid reason/fingerprint/result checks、`supabase db lint --local` 与 `supabase db advisors --local`。当前 transaction-style SQL suites继续用 `psql ON_ERROR_STOP` 路径，不误报为 pgTAP。

### Product Owner gate

必须单独授权创建 Migration 与本地 SQL 执行；不授权 linked/remote apply。

### Stop conditions

private schema 被暴露、应用角色获得 ledger 权限、需保存完整 payload/secret、需新 extension/dependency、或 Audit Trigger 影响非目标历史 action。

### Rollback

远程 apply 前只丢弃本 Step 文件并重建本地数据库。未来若已在获准 non-Production 应用，只使用 forward remediation 禁用新 helper/权限；不删除已产生 ledger/Audit。

## 6. P1-02B — Minimal read RPCs

### Objective

实现精确注册名/完整 UUID 搜索、详情/expected-state 与 target Audit 三个字段最小化读取能力。

### Scope

- read RPC 按 ADR-023 使用最小混合权限：搜索/Audit 为 `SECURITY INVOKER`；只有详情可为严格只读 `SECURITY DEFINER`，以调用不向应用角色开放的 P1-02A expected-state helper。三者只向 `authenticated` grant execute。
- 数据库/RLS 实时要求 active Admin 或 active Super Admin；Guest、Reader、Author、inactive/revoked actor fail closed。
- 搜索默认 25、范围 1–50，稳定 tuple keyset：missing registration name、normalized registration name、user ID。
- 详情分开返回 active grants 与 effective roles；elevated target 可读。
- expected-state 由数据库对 Membership state/updatedAt 与排序后的 active grant id/role/grantedAt 生成 canonical snapshot 和 SHA-256 token。
- Audit 只投影 target 相关治理事件，不返回 raw metadata 或 Auth identifier。

### Out of Scope

UI、缓存、prefix/contains 搜索、精确总数、write RPC、service role、views。

### Candidate files

- 新建 `supabase/migrations/<generated>_admin_p1_identity_access_reads.sql`
- 更新 `supabase/tests/admin_p1_identity_access_governance.sql`
- 更新 `packages/database/src/identity-access-governance-migration-contract.test.ts`

### Dependencies

P1-02A helper、现有 SELECT grants/RLS、registration-name index。ADR-023 已证明全 invoker 与 helper deny 冲突并批准详情的唯一 definer 例外；不得把该例外扩展到搜索/Audit，不得开放 helper、复制 token 算法或扩大底层表 Grant。

### Acceptance

三个 RPC 的输入、稳定排序、最大结果、nullable registration name、脱敏字段、Not Found/Forbidden/Unavailable 语义与 P1-01 一致；客户端不能生成 expected-state。详情 definer 必须先 live-authorize caller 再读取 target，且通过 read-before/read-after 证明零写入。

### Validation

Migration contract、RLS/execute catalog、Guest/Reader/Author/inactive deny、Admin/Super Admin allow、NFKC/case exact search、UUID、cursor 边界、同 timestamp Audit pagination、无敏感字段快照。额外证明搜索/Audit invoker、详情 definer、helper execute deny、空 search path、全限定对象、无 dynamic SQL、未授权 target non-disclosure 与全表零写入。

### Product Owner gate

单独授权 read Migration；不授权 P1-03 UI 或远程 QA。

### Stop conditions

搜索/Audit 需要 definer、详情无法先 live-authorize caller、详情需要 helper 之外的 privileged access、返回 email/phone/Auth metadata、使用 offset/无上限查询，或 RLS 无法区分 active Admin。

### Rollback

应用接入前可 forward revoke/drop 新 read RPC；不改变事实表。应用接入后先回滚消费者，再通过 forward Migration 撤销 execute；不修改数据。

## 7. P1-02C — Ordinary v2 write definitions, closed execute surface

### Objective

实现三个 narrow ordinary write RPC 的数据库语义与测试，但在 P1-04 cutover 前保持 `authenticated` execute 关闭。

### Scope

- `grant_author_role_v2`、`revoke_author_role_v2`、`set_ordinary_membership_state_v2`。
- 必要的 `SECURITY DEFINER`：空 `search_path`、全限定对象、首部 `auth.uid()`、live Membership/Role、`REVOKE EXECUTE FROM PUBLIC, anon, authenticated, service_role`。
- requestId lock → replay/mismatch → global governance lock → target row lock → elevated target reject → expected-state 重算 → Unchanged/Conflict/Saved。
- 同 requestId/同 payload 返回原 result snapshot；不同 actor/payload 返回稳定 mismatch；Saved 才执行一次业务变化与一次 Audit。
- 保留 final active Super Admin helper/guard；当前接口不能表达 elevated mutation。

### Out of Scope

旧 RPC 撤权、新 RPC authenticated grant、Server Action、UI、Reauth/proof、remote apply。

### Candidate files

- 新建 `supabase/migrations/<generated>_admin_p1_identity_access_writes.sql`
- 更新 `supabase/tests/admin_p1_identity_access_governance.sql`
- 新建 `supabase/tests/admin_p1_identity_access_governance_concurrency.sql`
- 更新 `packages/database/src/identity-access-governance-migration-contract.test.ts`

### Dependencies

P1-02A ledger/helpers、P1-02B expected-state helper、现有 role/membership/audit facts。所有 write definitions 共享固定 global advisory lock 名称。

### Acceptance

Saved/Unchanged/Conflict、replay、payload mismatch、Audit/ledger 原子性、ordinary target、elevated target rejection、self-disable rejection、target missing 与并发均由数据库证明；catalog 证明新 writes 仍不可由 authenticated 调用。

### Validation

RPC semantic suite、强制 Audit/ledger failure rollback、双连接同 requestId、不同 requestId stale conflict、target role ABA、elevated suspended/revoked target deny、final Super Admin guard 静态/拒绝回归。

### Product Owner gate

单独授权 write-definition Migration 和本地 SQL；不包含 cutover 或应用调用授权。

### Stop conditions

函数需要 role/proof 参数、elevated target 可得到 Unchanged/Conflict 而非先拒绝、旧/新同时获得 execute、或任一失败产生业务/Audit/ledger 部分状态。

### Rollback

cutover 前通过 forward Migration 删除或替换未授权定义即可；旧应用入口未改变。已有 ledger/Audit 永不 destructive rollback。

## 8. P1-02D — Domain types, parsing and closed errors

### Objective

建立 provider-neutral governance Domain，严格表达读模型、expected-state、三种普通 mutation、closed results 与安全错误。

### Scope

- UUID、cursor、limit、Membership state、active/effective roles、Audit projection、state token、requestId 与 reason parser。
- 三个不同 mutation input；Author Role 方法没有 role 字段，ordinary Membership 方法不能接受 pending。
- `Saved | Unchanged | Conflict` discriminated union；Unchanged/Conflict 无 Audit ID。
- 安全错误：`UNAUTHENTICATED`（Unauthorized/Authentication required）、`FORBIDDEN`、`INVALID_INPUT`、`TARGET_NOT_FOUND`、`REQUEST_ID_MISMATCH`、`ELEVATED_MUTATION_DEFERRED`、`DATA_CORRUPTION`、`REPOSITORY_UNAVAILABLE`、`UNKNOWN_REPOSITORY_ERROR`。
- `ELEVATED_MUTATION_DEFERRED` 是数据库 `42501` Forbidden 类的稳定安全子类，不是 UI 推断，也不表示 Reauth 可用。

### Out of Scope

Supabase client、React、FormData、redirect、cookie、invitation、Auth provider。

### Candidate files

- 新建 `packages/services/src/identity-access-governance-domain.ts`
- 新建 `packages/services/src/identity-access-governance-domain.test.ts`
- 更新 `packages/services/src/index.ts`

### Dependencies

只依赖既有 `@fandom-harbor/auth` types；不增加依赖。复用 Site Copy 的 strict parse/error pattern，但不复用其数据类型。

### Acceptance

所有 input/output exact-key、UUID、日期、token、cursor 与 safe summary 均严格解析；未知字段和 transport shape fail closed；错误消息不含 SQL/PostgREST/Token/secret。

### Validation

Vitest 覆盖边界值、Unicode reason 4/200、3/201、NFC/trim、控制字符、nil UUID、三种结果 exact shape、elevated 字段注入、敏感信息隔离。

### Product Owner gate

单独授权纯 Domain 实现；不授权 Repository、数据库或 UI。

### Stop conditions

Domain 需要 Supabase type、客户端 role/capability、password/proof、通用 elevated operation 或依赖升级。

### Rollback

未被消费者采用前删除新增 export/files；采用后先回滚消费者，再移除 export。无数据库状态。

## 9. P1-02E — Strict Repository and transport mapping

### Objective

将六个 RPC 的 snake_case transport 严格映射为 Domain，并提供稳定数据库错误映射。

### Scope

- 新建独立 Governance Repository；不扩张承载邀请的 legacy `identity-access-adapter.ts`。
- 所有 RPC response 使用 strict schema；日期、UUID、cursor、expected token、Audit bigint ID 无损转换。
- SQL `28000` → `UNAUTHENTICATED`；普通 `42501` → `FORBIDDEN`；安全 detail `ELEVATED_MUTATION_DEFERRED` → 同名 Domain；`22023` mismatch detail → `REQUEST_ID_MISMATCH`，其余 → `INVALID_INPUT`；controlled no-data → `TARGET_NOT_FOUND`；PGRST/transport → unavailable；未知数据库 code → unknown。
- raw cause 只保留在内部 error cause，不进入 Domain message、日志正文或页面状态。

### Out of Scope

权限决策、UI fallback、自动 retry、service role、旧 RPC wrapper、邀请 adapter 修改。

### Candidate files

- 新建 `packages/database/src/identity-access-governance-repository.ts`
- 新建 `packages/database/src/identity-access-governance-repository.test.ts`
- 更新 `packages/database/src/index.ts`

### Dependencies

P1-02D Domain；未来 runtime integration 依赖 P1-02B/C RPC。使用既有 server Supabase client 与当前 pinned Zod，不升级依赖。

### Acceptance

六个方法只调用固定 RPC；参数精确、无 actor/role/proof；response 与 error fail closed；同 requestId 由调用者原样传输，不在 Repository 重生成。

### Validation

mock RPC tests 覆盖所有成功结果、空/多行/额外字段、unsafe bigint/date/token、每个错误映射、raw error non-leak、正确 RPC 名/参数。

### Product Owner gate

单独授权 Repository 实现；不授权真实数据库写入或 UI。

### Stop conditions

需要 service role、直接 table mutation、宽泛 `as T` cast、自动 retry mutation、或错误映射依赖 raw message 文本。

### Rollback

先回滚 Service/consumer，再移除 Repository export/files；数据库不变。

## 10. P1-02F — Governance Service

### Objective

在 Domain 与 Repository 之间建立 live access、输入规范化、读写 use case 与 closed error 边界。

### Scope

- 每次调用接收可信 `TrustedAccessContext`；要求 active `admin:operate`，但数据库继续独立授权。
- search/detail/audit 只转发规范输入与 strict result。
- Author grant/revoke 和 ordinary Membership 调用前执行防御性 target classification；不得把 Service 判断当数据库授权。
- 不捕获 Conflict/Unchanged 为错误，不自动 retry stale mutation，不生成第二个 requestId。

### Out of Scope

cookies、FormData、React state、Review UI、redirect、cache invalidation、Server Action、Reauth。

### Candidate files

- 新建 `packages/services/src/identity-access-governance-service.ts`
- 新建 `packages/services/src/identity-access-governance-service.test.ts`
- 更新 `packages/services/src/index.ts`

### Dependencies

P1-02D Domain 与 P1-02E Repository interface；不新增 capability 或 npm dependency。

### Acceptance

Guest/null、Reader、Author、inactive Admin 在 Repository 前拒绝；active Admin/Super Admin 可调用 ordinary use cases；elevated write input 无 Service method；Repository error 保持稳定安全 code。

### Validation

Vitest 权限矩阵、Repository call count/shape、Saved/Unchanged/Conflict pass-through、no retry、elevated injection deny、sensitive error isolation。

### Product Owner gate

单独授权 Service 实现；不授权 App wiring、Server Action 或页面。

### Stop conditions

需修改 Auth/capability、使用 `user_metadata`、Service 需要访问 password/Session token、或为了 UI 方便合并 read/write 权限。

### Rollback

回滚尚未接入的 Service export/files；若已有内部 consumer，先回滚 consumer。无数据库状态。

## 11. P1-02G — Backend closure and handoff

### Objective

证明 P1-02 后端切片在未启用 UI、未开放新 writes、未撤销旧 RPC 的条件下可审阅，并形成 P1-03/P1-04 精确输入。

### Scope

- 运行本文件第 15 节的本地自动门禁。
- 证明新 v2 write RPC 在 catalog 中仍对 authenticated 关闭。
- 证明没有修改 `apps/admin/src/app/access/page.tsx` 或 `actions.ts`。
- 冻结 P1-03 read service 输入/输出和 P1-04 action contract/cutover precondition。

### Out of Scope

UI、Server Action、cutover、remote QA、Commit/Push/PR 除非另有 Closure Mission。

### Candidate files

- P1-02A–F 已授权文件
- 必要的 Admin P1/Status 文档
- 明确禁止修改当前 `/access` 产品文件

### Dependencies

P1-02A–F 全部本地验收完成。

### Acceptance

P1-03 可只用 read service 开始 UI；P1-04 可基于 frozen action input/output 继续；P1-02 本身没有可执行的新 mutation surface，也没有破坏当前 `/access`。

### Validation

full scoped lint/typecheck/tests/build、local DB catalog/SQL suites、P0 Site Copy/Auth/identity regression、secret/file-scope scan、clean diff review。

### Product Owner gate

需要独立 P1-02 Closure Review/Commit 授权；之后 P1-03 仍需单独授权。

### Stop conditions

任何 P0 regression、当前 `/access` 失效、old/new 双入口、v2 write 提前 grant、UI 文件变化、依赖/lockfile变化或需要 remote state。

### Rollback

不提交时丢弃 P1-02 独立实施区变更；已获准本地 Commit 时用新的 forward/fix Commit，不改写共享历史。数据库只存在本地可重建状态。

## 12. P1-03/P1-04 handoff and atomic cutover

本节只冻结后续依赖，不授权实现。

### P1-03 read-only UI

- 可以修改 `apps/admin/src/app/access/page.tsx` 并新增只读 loader/components/tests。
- 只调用 P1-02 read Service；elevated 账户可读。
- 不提供任何写控件、Review、Action 或 cutover。
- 需要独立 Product Owner P1-03 授权。

### P1-04 Server Action contract

未来候选文件：

- 修改 `apps/admin/src/app/access/actions.ts`
- 新建 `apps/admin/src/app/access/actions.test.ts`
- 新建 `apps/admin/src/lib/identity-access-governance-action-state.ts`
- 新建对应 action-state/Review state tests
- 修改 P1-04 获准的 `/access` write components

Action 输入只允许 operation-specific target、desired Membership state、database-issued expected-state token、normalized reason 与已有 Review requestId。Action 重新取得 Trusted Access Context，调用 P1-02 Service，返回 safe `Saved | Unchanged | Conflict | Error`；不接受 actor、role、capability、proof 或 reauthenticated boolean。

### Atomic cutover Migration

只有 P1-04 Action/Review 实现、本地测试与 rollback rehearsal 全部通过后，才可单独授权创建：

- `supabase/migrations/<generated>_admin_p1_identity_access_cutover.sql`

同一 Migration transaction 与同一 global governance lock 内按以下顺序执行：

1. 验证三个 v2 write definitions、ledger、Audit guard 与 expected-state helper 的精确 signature/catalog 状态。
2. `REVOKE EXECUTE` 旧 `grant_role`、`revoke_role`、`set_membership_state` from `authenticated`（并确认 PUBLIC/anon 无权）。
3. 再只向 `authenticated` grant 三个 narrow ordinary v2 write RPC。
4. catalog assertion 必须在 transaction 内证明不存在新旧双入口，之后才允许提交。

旧函数定义保持 owner-only，不能用于运营、应用或普通回滚。P1-04 更新 `supabase/tests/phase_1c_identity_access.sql`：旧 RPC authenticated 调用必须 deny，普通治理改由 v2 验证，final Super Admin guard 保留静态/拒绝回归。

### Safe rollback after cutover

1. 先将 Admin mutation surface 置为应用级 read-only。
2. forward Migration 撤销三个 v2 write execute。
3. 回滚 App 到不发起写入的版本。
4. 保留 read RPC、ledger 与 Audit，不删除、不改写。
5. 不恢复旧 RPC authenticated execute；服务保持写入关闭。

任何 remote apply、Push、PR、Preview 或 Deployment 都需要独立 Owner Gate；cutover Migration 不得先于对应应用发布单元单独部署。

## 13. Migration 顺序与发布依赖

```text
Migration A: private ledger + helpers + Identity Audit immutability
  ↓
Migration B: read RPCs + authenticated execute
  ↓
Migration C: ordinary v2 write definitions + execute closed
  ↓
Domain → Repository → Service（P1-02 local only）
  ↓
P1-03 read-only UI
  ↓
P1-04 Review/Action implementation + tests
  ↓
Migration D: atomic old revoke → new grant cutover
  ↓
P1-05 dedicated non-Production remote QA
```

Migration A–C 即使完成也不能单独远程 apply；它们与应用/cutover 的远程顺序必须在 P1-05 前由 Product Owner 重新批准。Migration D 永远不能在 P1-04 Action 未就绪时部署。

## 14. RPC/Service error and result mapping

| Database/transport                                 | Repository/Domain            | Action/UI meaning                                     |
| -------------------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| no actor / SQL `28000`                             | `UNAUTHENTICATED`            | Unauthorized / 登录状态失效                           |
| generic SQL `42501`                                | `FORBIDDEN`                  | actor/target 无权，不泄漏额外对象事实                 |
| `42501` + safe `ELEVATED_MUTATION_DEFERRED` detail | `ELEVATED_MUTATION_DEFERRED` | elevated 可读但当前不可写；提示未来 Reauth/MFA 阶段   |
| SQL `22023`                                        | `INVALID_INPUT`              | UUID/token/reason/state 非法                          |
| `22023` + safe `REQUEST_ID_MISMATCH` detail        | `REQUEST_ID_MISMATCH`        | 同 requestId payload/actor 不一致；不得显示原 payload |
| controlled no-data                                 | `TARGET_NOT_FOUND`           | Profile/Membership 不完整；不伪造成功                 |
| transport success `saved`                          | `Saved`                      | 精确一次业务变化 + 一条 Audit                         |
| transport success `unchanged`                      | `Unchanged`                  | 零业务变化、零业务 Audit                              |
| transport success `conflict`                       | `Conflict`                   | stale/普通目标条件变化；保留输入并重新 Review         |
| malformed success                                  | `DATA_CORRUPTION`            | fail closed                                           |
| PGRST/network unavailable                          | `REPOSITORY_UNAVAILABLE`     | 安全可重试提示；mutation 不自动 retry                 |
| unknown database error                             | `UNKNOWN_REPOSITORY_ERROR`   | 无内部详情的失败                                      |

数据库必须先验证 live actor，再决定是否返回 elevated safe subtype，避免向未授权调用者泄漏 target elevation。elevated write 不得返回 Unchanged/Conflict 或写 ledger；它在 target classification 后直接拒绝。

## 15. 自动验证顺序

未来每个获准 Step 只运行与其范围相称的本地门禁；P1-02 closure 运行完整顺序：

1. 定向 Prettier/ESLint/TypeScript。
2. Migration contract Vitest。
3. `supabase db reset --local --no-seed` clean rebuild。
4. `supabase migration list --local` 确认顺序。
5. `supabase db lint --local --fail-on error`。
6. `supabase db advisors --local --type security`，记录并处置新问题。
7. RLS/Grant/catalog SQL assertions。
8. RPC Saved/Unchanged/Conflict、permission、idempotency 与 failure atomicity suite。
9. dblink 双连接 concurrency suite。
10. Domain tests。
11. Repository tests。
12. Service tests。
13. P1-04 获准后才执行 Server Action tests。
14. 既有 Auth/identity-access、Phase 1C、Admin P0 Site Copy 与全仓 lint/typecheck/test/build regression。
15. `git diff --check`、内部链接、敏感信息、文件范围与 staged=0/获准 staged 范围检查。

CLI 2.108.0 的 `migration new/list`、`db reset/lint/advisors` 与 `test db` 已于本规划阶段通过对应 `--help` 确认。现有 SQL 文件是 transaction/`ON_ERROR_STOP` harness，不具备 pgTAP plan；在 KI-019 关闭前不得直接用 `supabase test db` 冒充其执行器。

## 16. 自动化与人工确认边界

### 可在单独本地实现授权后自动完成

- 创建/修改获准候选文件。
- 本地 Migration reset、静态 catalog、SQL transaction/concurrency、TypeScript/Lint/Test/Build。
- diff、链接、格式、敏感信息与 scope scan。
- 合成身份数据的本地事务测试；测试完成 rollback/reset。

### 必须 Product Owner 人工确认

- P1-02A–G 每个实施 Step 的开始与 Closure Commit。
- P1-03 read UI 与 P1-04 write UI/Action/cutover 的开始。
- Push、PR、Merge。
- 任何 Migration apply，包括 non-Production。
- 专用 non-Production Project 的身份、隔离、fixture 与允许写入窗口。
- P1-05 远程 QA、P1-06 Preview、P1-07 Production review。
- Admin login、Unpause、Deployment/Promotion。

## 17. Dedicated non-Production QA entry gate

进入 P1-05 前必须全部满足：

- P1-02 后端、P1-03 read UI、P1-04 Action/UI/cutover 均有独立 accepted local baseline。
- local clean rebuild、全部 SQL/TypeScript/Build、catalog、concurrency、P0 regression PASS。
- QA Project ref、URL、publishable key、Auth users、database 与 Production 完全不同；不复制 Production 数据/用户/Session/Cookie/Token/password。
- Migration diff 只包含已批准 A–D，remote history 与父基线可验证。
- write window、synthetic fixture、前后计数/hash、cleanup/retention 与 emergency close-writes 步骤经 Product Owner 确认。
- QA Matrix 覆盖 ordinary Saved/Unchanged/Conflict/replay/mismatch、权限拒绝、elevated denial、old RPC denial、final Super Admin guard 与敏感信息检查；不执行 elevated success。

本阶段不得创建、连接或写入 QA；Production 永远不是 QA fallback。

## 18. 全局停止条件

出现以下任一项，当前 Step 立即停止，不自行扩大架构：

- 权威合同冲突或需要新增 role/capability/Auth factor。
- 需要读取原受保护工作区未提交 `/access` 内容。
- 需要 service role、secret、password、Token、Cookie 或 Session 进入客户端/日志/fixture。
- 无法在数据库拒绝 elevated target、重算 expected-state 或原子完成 ledger/business/Audit。
- 新表/RPC 暴露范围不能通过 catalog/RLS/grant 证明。
- old/new write execute 同时开放，或 rollback 需要恢复旧 RPC。
- P0 Site Copy Version 7、八字段、Auth/capability 或 Admin pause 状态发生变化。
- 需要 Production、远程写入、依赖安装/升级、配置或 lockfile 变化。

## 19. 本规划阶段完成边界

P1-02 Planning 完成只表示步骤、文件范围、依赖、Owner Gate、测试和回滚已可审阅。本阶段没有授权任何 P1-02A–G 实现，也没有授权 P1-03/P1-04、Migration、SQL、remote QA、Commit、Push、PR、登录、Unpause 或 Deployment。
