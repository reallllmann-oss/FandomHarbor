# ADMIN P1-02E — Strict Identity Access Repository Evidence

状态：`LOCAL IMPLEMENTATION COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`
日期：2026-08-18
Parent：`ca300c234db6b4c9312dcc0e8b35c09b29b6f1f3`
Worktree：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02E`
Branch：`codex/admin-p1-02e-repository`

本文件只记录 P1-02E 本地 Repository 实施证据，不创建新的 Domain、数据库、Auth 或产品合同。权威来源仍为 [P1-01 Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)、[P1-02 Plan](P1_02_IMPLEMENTATION_PLAN.md)、[P1-02B Evidence](P1_02B_ACCEPTANCE_EVIDENCE.md)、[P1-02C Evidence](P1_02C_ACCEPTANCE_EVIDENCE.md)、[P1-02D Evidence](P1_02D_ACCEPTANCE_EVIDENCE.md)、[ADR-022](../../17_Architecture_Decisions/ADR-022.md) 与 [ADR-023](../../17_Architecture_Decisions/ADR-023.md)。

## 1. Implementation boundary

P1-02E 在现有 `@fandom-harbor/database` package 新增独立 Governance Repository：

- `createIdentityAccessGovernanceRepository()` 使用可注入的六方法 DataSource 实现 P1-02D 三个 read Port 与三个 ordinary write Port。
- `createSupabaseIdentityAccessGovernanceRepository()` 复用既有 server Supabase client/cookie boundary，只负责六个冻结 RPC 的 transport wiring。
- 未修改承载 Invitation/旧写接口的 `identity-access-adapter.ts`，不创建第二套 client infrastructure。
- 未实现 Service、Server Action、`/access`、UI、Migration、RPC、RLS、Grant、Auth 或 elevated mutation。

## 2. Exact RPC and parameter mapping

| Port                         | RPC                                  | 精确参数                                                                            | Retry contract                     |
| ---------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------- |
| `searchSubjects`             | `search_identity_access_subjects_v1` | `p_query`、`p_cursor`、`p_limit`                                                    | read transport default             |
| `getSubjectDetail`           | `get_identity_access_subject_v1`     | `p_user_id`                                                                         | read transport default             |
| `listSubjectAudit`           | `list_identity_access_audit_v1`      | `p_user_id`、`p_before`、`p_limit`                                                  | read transport default             |
| `grantAuthorRole`            | `grant_author_role_v2`               | `p_request_id`、`p_target_user_id`、`p_expected_state_token`、`p_reason`            | explicit per-request retry disable |
| `revokeAuthorRole`           | `revoke_author_role_v2`              | `p_request_id`、`p_target_user_id`、`p_expected_state_token`、`p_reason`            | explicit per-request retry disable |
| `setOrdinaryMembershipState` | `set_ordinary_membership_state_v2`   | `p_request_id`、`p_target_user_id`、`p_state`、`p_expected_state_token`、`p_reason` | explicit per-request retry disable |

Repository 原样传输 Domain 已验证的 requestId、target User ID、opaque expected-state token、normalized reason 与 ordinary Membership state。它不生成 requestId、不改写 Conflict token、不接受 actor/role/capability/proof，也不自动修复 malformed 数据。

Subject cursor 显式映射为 `{ missingRegistrationName, normalizedRegistrationName, userId }`；Audit cursor 的 `Date` 映射为 ISO string，Audit bigint ID 始终保持 canonical decimal string。RPC 参数 snake_case 只存在于 Repository transport 内部，不进入 Domain。

## 3. Strict runtime parsing

所有成功结果仍被视为 `unknown`，必须通过 P1-02D exact-key parser 才能返回：

- Search：顶层 page、items、UUID、nullable registration name、Membership/Role enum、时间、stable cursor、`hasMore` 关系和 page limit。
- Detail：target/profile/expected-state User ID 一致性、脱敏 Profile、Membership、active Role Grant、effective roles、elevated read flags 与 opaque token。
- Audit：string Audit ID、action、nullable actor/before/after/target fields、reason、时间与 cursor。
- Mutation：穷尽 `saved | unchanged | conflict`；requestId/target 必须与输入一致；Conflict 保留 current snapshot/token；Role Saved 必须有 grant ID，Membership Saved 必须没有 grant ID。

null、未知字段、非法 UUID/日期/token/enum、超出请求 limit 的 page、响应 ID 不一致、未知 result status 或 operation-inconsistent result 全部映射为固定 `DATA_CORRUPTION`，不猜测、不部分接受。

## 4. Provider error cleaning

错误映射只读取结构化 `code` 与两个冻结 safe detail，不依赖自然语言 message：

| Provider contract                      | Domain error                 |
| -------------------------------------- | ---------------------------- |
| `28000`                                | `UNAUTHENTICATED`            |
| ordinary `42501`                       | `FORBIDDEN`                  |
| `42501` + `ELEVATED_MUTATION_DEFERRED` | `ELEVATED_MUTATION_DEFERRED` |
| ordinary `22023`                       | `INVALID_INPUT`              |
| `22023` + `REQUEST_ID_MISMATCH`        | `REQUEST_ID_MISMATCH`        |
| `P0002`                                | `TARGET_NOT_FOUND`           |
| `PGRST*` or thrown transport failure   | `REPOSITORY_UNAVAILABLE`     |
| unknown non-null database code         | `UNKNOWN_REPOSITORY_ERROR`   |
| malformed successful result            | `DATA_CORRUPTION`            |

原始 message、hint、details、provider object、SQLSTATE、表/函数名和敏感 metadata 不进入 Domain Error message/cause、日志或返回值。Conflict 是数据库成功 result，不被错误映射改写成 Saved/Unchanged。

## 5. Retry and official contract proof

2026-08-17 先复核 [Supabase Changelog](https://supabase.com/changelog)，再复核 [JavaScript RPC](https://supabase.com/docs/reference/javascript/rpc)、[supabase-js error handling](https://supabase.com/docs/guides/api/handling-errors-in-supabase-js)、[PostgREST error codes](https://supabase.com/docs/guides/api/rest/postgrest-error-codes) 与 [automatic retries](https://supabase.com/docs/guides/api/automatic-retries-in-supabase-js)。

当前官方合同说明 supabase-js 2.102+ 的 PostgREST `.rpc()` 存在默认 transient retry 能力，且应按结构化 code 而非可变 message 分支。仓库固定 `@supabase/supabase-js 2.108.2`；该版本 RPC builder 支持逐请求 `.retry(false)`。三个 mutation transport 均显式调用该关闭开关，并由测试证明每项只发起一次 RPC、Repository 自身不捕获重放。read 方法没有被错误改写成 mutation retry 合同。

## 6. Architecture denial proof

Repository 源码只出现上述六个 `client.rpc()` 名称，并通过静态测试/扫描证明：

- 无 `.from()`、`profiles`、`memberships`、`role_grants` 或 `audit_logs` 直接访问。
- 无 private ledger/helper 调用。
- 无旧 `grant_role`、`revoke_role`、`set_membership_state` fallback。
- 无 service role、generic role、Admin/Super Admin mutation、automatic retry loop、raw error logging、`any` 或双重断言。
- P1-02C 三个 write RPC 仍对 `PUBLIC/anon/authenticated/service_role` execute closed；本阶段不声称 authenticated mutation 集成成功。

## 7. Local validation

| Gate                                  | Result                                               |
| ------------------------------------- | ---------------------------------------------------- |
| Repository targeted Vitest            | PASS — 1 file / 24 tests                             |
| Database package Vitest               | PASS — 14 files / 138 tests                          |
| Domain regression                     | PASS — 1 file / 53 tests                             |
| Services package Vitest               | PASS — 10 files / 123 tests                          |
| Existing Database regression          | PASS — 13 files / 114 tests                          |
| TypeScript / ESLint / Prettier        | PASS                                                 |
| Architecture / links / sensitive scan | PASS                                                 |
| P1-02C execute ACL                    | PASS — 12 application-role combinations remain false |

数据库 suite 只读/本地执行；未创建或修改 Migration、RPC、RLS、Grant 或远程状态。P0 Site Copy 与 P1-02A/B/C contract regression 保持通过。

## 8. Completion boundary

P1-02E 本地 Repository 完成不授权 Closure Commit、P1-02F Service、Server Action、UI、write execute、旧 RPC cutover、远程 SQL/Migration/QA、Push、PR、Admin 登录、Unpause 或 Deployment。Admin Production 权威状态仍为 `paused=true`；P0 Site Copy 仍为 Version 7。
