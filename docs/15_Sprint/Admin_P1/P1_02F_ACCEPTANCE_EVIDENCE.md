# ADMIN P1-02F — Live-Access Identity Governance Service Evidence

状态：`LOCAL IMPLEMENTATION COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`
日期：2026-08-18
Parent：`cadb81053720a2e1885abe3e6f63a1b5196a64e1`
Worktree：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02F`
Branch：`codex/admin-p1-02f-governance-service`

本文件只记录 P1-02F 本地 Service 实施证据。权威 Domain、Repository 与数据库合同仍分别由 [P1-02D Evidence](P1_02D_ACCEPTANCE_EVIDENCE.md)、[P1-02E Evidence](P1_02E_ACCEPTANCE_EVIDENCE.md)、[P1-01 Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)、[ADR-022](../../17_Architecture_Decisions/ADR-022.md) 与 [ADR-023](../../17_Architecture_Decisions/ADR-023.md) 所有。

## 1. Service boundary

P1-02F 在 `@fandom-harbor/services` 新增 `createIdentityAccessGovernanceService()`：

- 依赖一个 `IdentityAccessGovernanceLiveAccessChecker`、P1-02D Read Port 与 Write Port。
- 不导入 `@fandom-harbor/database`、Supabase/PostgREST、Next.js/React、RPC 名称或 snake_case wire shape。
- 不接入 composition root、Server Action、`/access` 或 UI。
- 不创建 Audit/Ledger，不修改 Domain、Repository、Migration、RPC、RLS、Grant 或 execute。

## 2. Six use cases

| Service use case             | Domain validation                        | Port call                                               |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| `searchSubjects`             | bounded query/cursor/limit parser        | `read.searchSubjects`                                   |
| `getSubjectDetail`           | non-nil canonical User ID                | `read.getSubjectDetail`                                 |
| `listSubjectAudit`           | target User ID/Audit cursor/limit parser | `read.listSubjectAudit`                                 |
| `grantAuthorRole`            | Grant Author Command parser              | target detail precheck → `write.grantAuthorRole`        |
| `revokeAuthorRole`           | Revoke Author Command parser             | target detail precheck → `write.revokeAuthorRole`       |
| `setOrdinaryMembershipState` | ordinary Membership Command parser       | target detail precheck → matching Membership write Port |

不存在 generic role、Admin/Super Admin Role、elevated-account Membership、proof、actor、capability 或 Reauth placeholder 方法。

## 3. Input and live-access order

每次公开调用固定执行：

1. P1-02D parser 验证纯调用者输入。
2. injected checker 的 `getCurrent()` 精确调用一次，不跨请求缓存。
3. context 必须非 null，Membership 必须为 `active`，roles 必须含 live `admin` 或 `super_admin`，且 capability 必须含 `admin:operate`。
4. 授权成功后才调用 read Port；mutation 先调用 target detail 做 elevated classification，再最多调用一次对应 write Port。

输入验证只暴露固定 `INVALID_INPUT`，不访问目标也不判断其存在，因此 input-first 不形成 target existence oracle。Guest/null 返回 `UNAUTHENTICATED`；Reader、Author、pending/suspended/revoked Admin 返回 `FORBIDDEN`，且全部 Port 调用为零。checker/provider 未知异常统一清洗，不输出 Session、Cookie、Token 或原始错误。

## 4. Ordinary target and database authority

三个 mutation 对 detail 的 `isElevatedAccount` 执行 defense-in-depth precheck：

- elevated target 返回固定 `ELEVATED_MUTATION_DEFERRED`，对应 mutation Port 零调用。
- ordinary target 才把 Command 交给准确 write Port，最多一次。
- classification 与 mutation 之间若发生 target elevation 竞态，数据库仍为最终权威；Service 保留数据库的安全延期错误，不重试或绕过。
- 该 precheck 不计算 final Super Admin、不代替数据库锁/授权，也不产生新的 capability。

## 5. requestId, expected-state and result semantics

- requestId 不自动生成；User ID、requestId、expected-state token 与 Membership state 原样传递。
- reason 只使用 P1-02D NFC/trim 后的规范值。
- Service 不解析、生成、重算或覆盖 expected-state token。
- `saved | unchanged | conflict` 直接作为正常结果返回。
- Conflict 保留 current snapshot/token，不抛异常、不自动换用新 token、不进行第二次 mutation。
- 一次显式上层重放会重新执行 live-access check，并以相同 requestId/Command 调用一次 Port；Service 内部没有 retry loop。

## 6. Closed error boundary

`IdentityAccessGovernanceDomainError` 的固定安全 code/message 原样保留。任何 checker/Port 抛出的非 Domain 值都映射为新的 `UNKNOWN_REPOSITORY_ERROR`，不保存 cause，也不记录 raw payload、reason、SQLSTATE、RPC/table 名或 provider object。

## 7. Validation

| Gate                                  | Result                                               |
| ------------------------------------- | ---------------------------------------------------- |
| Service targeted Vitest               | PASS — 1 file / 57 tests                             |
| Services package Vitest               | PASS — 11 files / 180 tests                          |
| Domain regression                     | PASS — 1 file / 53 tests                             |
| Repository targeted regression        | PASS — 1 file / 24 tests                             |
| Database package regression           | PASS — 14 files / 138 tests                          |
| TypeScript / ESLint / Prettier        | PASS                                                 |
| Architecture / links / sensitive scan | PASS                                                 |
| P1-02C execute ACL                    | PASS — 12 application-role combinations remain false |

测试覆盖六用例 live check 次数、Guest/Reader/Author/inactive deny、输入先验证、Port 调用隔离、三种结果、requestId/expected-state/reason 传递、elevated precheck、race 后数据库拒绝、显式重放重新鉴权、Conflict 零二次调用，以及未知 access/Port error 清洗。

## 8. Completion boundary

P1-02F 本地 Service 完成不授权 Closure Commit、P1-02G、composition root、Server Action、UI、write execute、旧 RPC cutover、远程 SQL/Migration/QA、Push、PR、Admin 登录、Unpause 或 Deployment。Admin Production 权威状态仍为 `paused=true`；P0 Site Copy 仍为 Version 7。
