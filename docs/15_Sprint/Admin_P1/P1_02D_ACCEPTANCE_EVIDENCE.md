# ADMIN P1-02D — Provider-Neutral Identity Access Domain Evidence

状态：`LOCAL IMPLEMENTATION COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`
日期：2026-08-17
Parent：`0e1de6247a76b6e2bf94b050ce63a3b8fe80ba35`
Worktree：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02D`
Branch：`codex/admin-p1-02d-domain`

本文件只记录 P1-02D 本地 Domain 实施证据，不创建新的产品、数据库或 Auth 合同。权威来源仍为 [P1-00](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)、[P1-01 Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)、[P1-02 Plan](P1_02_IMPLEMENTATION_PLAN.md)、[ADR-022](../../17_Architecture_Decisions/ADR-022.md)、[ADR-023](../../17_Architecture_Decisions/ADR-023.md)、[P1-02A Evidence](P1_02A_ACCEPTANCE_EVIDENCE.md)、[P1-02B Evidence](P1_02B_ACCEPTANCE_EVIDENCE.md) 与 [P1-02C Evidence](P1_02C_ACCEPTANCE_EVIDENCE.md)。

## 1. Implementation boundary

P1-02D 只新增 `@fandom-harbor/services` provider-neutral Domain、单元测试与 export：

- 无 Supabase client、PostgREST、Next.js、React、Server Action、环境变量或数据库依赖。
- 无 Repository、Service implementation、RPC mapper、FormData、cookie、redirect 或 UI。
- 无 Migration、RPC、RLS、Grant、Trigger、Auth、dependency、config 或 lockfile 变化。
- 现有 package 已采用 Domain 文件定义 provider-neutral Store/Port 的模式，因此本实现把六方法 Port interface 留在同一 Domain，不创建平行架构。

## 2. Foundational values and validation

| Value                    | Domain contract                                                                  |
| ------------------------ | -------------------------------------------------------------------------------- |
| User ID                  | canonical non-nil UUID，经 parser 创建                                           |
| requestId                | canonical non-nil UUID；调用者必须显式提供，不自动生成                           |
| expected-state token     | 64 位 lowercase hex opaque value；只验证格式，不解析、不重算                     |
| registration-name search | NFKC + trim + case-fold；1–64 code points；拒绝控制字符                          |
| normalized reason        | NFC + trim；4–200 code points；拒绝控制字符和换行                                |
| page limit               | 默认 25；整数 1–50                                                               |
| Subject cursor           | `{ missingRegistrationName, normalizedRegistrationName, userId }` exact shape    |
| Audit cursor             | `{ createdAt, auditId }` exact shape；Audit ID 保持 string，避免 bigint 精度损失 |

所有 object parser 拒绝 unknown key；UUID、日期、Role、Membership state、Audit action、cursor/result shape 和 nullable 字段均显式验证。外部 unknown 数据不能通过宽泛 cast 进入 Domain。

## 3. Read models and Ports

最小读取模型覆盖 P1-02B 三个 RPC：

- `IdentityAccessSubjectSummary`：User ID、nullable registration name、Membership state、effective roles 与 Profile/Membership 更新时间。
- `IdentityAccessSubjectDetail`：脱敏 Profile、Membership 关键时间、active Role Grant、effective roles、elevated/only-active-Super-Admin 标识和 expected-state。
- `IdentityAccessGovernanceAuditSummary`：安全 actor、Membership/Role before/after、reason、action、string Audit ID 与时间；无 raw metadata/requestId/ledger。
- `IdentityAccessSubjectPage` 与 `IdentityAccessGovernanceAuditPage`：有界 items、稳定 cursor 和 `hasMore`。

`IdentityAccessGovernanceReadPort` 只定义 `searchSubjects`、`getSubjectDetail`、`listSubjectAudit`；`IdentityAccessGovernanceWritePort` 只定义 `grantAuthorRole`、`revokeAuthorRole`、`setOrdinaryMembershipState`。它们是未来 P1-02E Repository 的 provider-neutral seam，本阶段没有 transport 实现。

## 4. Ordinary Commands, results and errors

三个独立 Command：

- `GrantAuthorRoleCommand`
- `RevokeAuthorRoleCommand`
- `SetOrdinaryMembershipStateCommand`

Role Command 没有 role 参数。Membership Command 只接受 `active | suspended | revoked`；exact-key parser 拒绝 `pending`、`admin`、`super_admin`、actor、capability、proof 或其他隐藏字段。

Mutation result 为可穷尽 discriminated union：

| Result    | Domain requirement                                                            |
| --------- | ----------------------------------------------------------------------------- |
| Saved     | current snapshot/token、Audit ID、changed time；Role Saved 可有 Role Grant ID |
| Unchanged | current snapshot/token；不得有 Audit ID                                       |
| Conflict  | current snapshot/token 与冻结 conflict reason；不得有 Audit ID，供重新 Review |

安全错误 code 为 `UNAUTHENTICATED`、`FORBIDDEN`、`INVALID_INPUT`、`TARGET_NOT_FOUND`、`CONFLICT`、`REQUEST_ID_MISMATCH`、`ELEVATED_MUTATION_DEFERRED`、`DATA_CORRUPTION`、`REPOSITORY_UNAVAILABLE`、`UNKNOWN_REPOSITORY_ERROR`。错误消息由 code 固定生成，不接受 provider message/cause，因此不会携带 SQLSTATE、对象名或敏感 transport。

## 5. Elevated mutation non-expressibility

- `admin` 与 `super_admin` 只存在于读取 Role union。
- 没有 Grant/Revoke Admin、Grant/Revoke Super Admin、generic Role mutation 或 elevated Membership Command。
- 没有 reauth/proof、ordinary Session age、JWT、actor/capability client field 或 escape hatch。
- elevated account 可以进入详情模型；写入绕过只能映射为 `ELEVATED_MUTATION_DEFERRED`，不生成可执行 Command。
- P1-02C 三个 write RPC execute 继续关闭；本 Domain 没有调用它们。

## 6. Local validation

| Gate                              | Result                                                |
| --------------------------------- | ----------------------------------------------------- |
| Domain targeted Vitest            | PASS — 1 file / 53 tests                              |
| Services package Vitest           | PASS — 10 files / 123 tests                           |
| Services TypeScript / ESLint      | PASS                                                  |
| Prettier                          | PASS                                                  |
| Architecture boundary scan        | PASS — provider/import/assertion/elevated/token scans |
| P1-02A/B/C Migration contract     | PASS — Database 13 files / 114 tests                  |
| P0 / database contract regression | PASS — 7 targeted transaction/concurrency SQL suites  |
| Links / diff / sensitive / scope  | PASS                                                  |

## 7. Completion boundary

P1-02D 本地 Domain 完成不授权 Closure Commit、P1-02E、Repository、Service、Server Action、UI、Migration/RPC/Grant、execute 开放、旧 RPC cutover、远程操作、Admin 登录、Unpause 或 Deployment。Admin Production 权威状态仍为 `paused=true`；P0 Site Copy 仍为 Version 7。
