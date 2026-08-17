# ADMIN P1-02B — Identity Access Read RPC Evidence

状态：`LOCAL IMPLEMENTATION COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`
日期：2026-08-17
Parent：`fc41ad153c75a326f76ca66c5219a889eb99a84e`
Worktree：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02B`
Branch：`codex/admin-p1-02b-read-rpcs`
Migration：`20260817121610_admin_p1_identity_access_reads.sql`

本文件记录 ADR-023 最小混合读取权限的本地实施证据，不创建新的产品或安全合同。权威来源仍为 [P1-01 Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)、[P1-02 Plan](P1_02_IMPLEMENTATION_PLAN.md)、[P1-02A Evidence](P1_02A_ACCEPTANCE_EVIDENCE.md)、[ADR-022](../../17_Architecture_Decisions/ADR-022.md) 与 [ADR-023](../../17_Architecture_Decisions/ADR-023.md)。

## 1. RPC contract

| RPC    | Signature                                                | Security                  | Result                                               |
| ------ | -------------------------------------------------------- | ------------------------- | ---------------------------------------------------- |
| Search | `search_identity_access_subjects_v1(text,jsonb,integer)` | `STABLE SECURITY INVOKER` | bounded items、tuple cursor、`hasMore`               |
| Detail | `get_identity_access_subject_v1(uuid)`                   | `STABLE SECURITY DEFINER` | minimal identity/Membership/roles/expected-state     |
| Audit  | `list_identity_access_audit_v1(uuid,jsonb,integer)`      | `STABLE SECURITY INVOKER` | target governance summaries、tuple cursor、`hasMore` |

三者均固定空 `search_path`、无重载，创建后从 `PUBLIC/anon/authenticated/service_role` 撤销默认 execute，再只向 `authenticated` grant 准确签名。owner 为 `postgres`。Search/Audit 通过现有 SELECT/RLS 与 `private.current_user_has_role` 复核 live actor；Detail 在任何 target lookup 前通过 `auth.uid()` 和 `private.has_role` 复核 active Admin/Super Admin。

## 2. Search projection

- `query` 为 null/空白时仅返回有界目录页；非空时仅执行 NFKC + trim + case-fold 后的 registration-name 精确匹配或 canonical full UUID 精确匹配。
- `limit` 默认 25，范围 1–50；取 `limit + 1` 判定 `hasMore`，不执行精确总数或无界返回。
- 稳定排序/游标为 `(registration_name is null, normalized registration_name, user_id)`；null registration name 最后。
- item 只包含 `userId`、nullable `registrationName`、Membership state、effective roles 与 Profile/Membership 更新时间。

## 3. Detail projection and privileged boundary

Detail definer 在授权后才读取 target；未认证/无权限错误与 target 存在性无关，只有已授权 Admin/Super Admin 可获得稳定 `TARGET_NOT_FOUND`。

返回仅包含：

- 最小 Profile ID、registration name 与 created/updated 时间。
- Membership state 和 admitted/suspended/revoked/updated 时间。
- 全部 active Role Grant 的 ID、role、grantedAt、grantedBy。
- effective roles、elevated-account 标识与唯一 active Super Admin 标识。
- 由 P1-02A `identity_access_expected_state_snapshot` / `identity_access_state_token` 生成的 snapshot/token。

Migration 不包含 dynamic SQL、写入语句、Ledger/Audit 调用或 expected-state 算法复制。Private helper 对 `PUBLIC/anon/authenticated/service_role` 的 execute deny 保持不变。

## 4. Audit projection

- 仅选择 target Membership 与关联 Role Grant 的治理 Audit。
- 稳定排序/游标为 `(created_at desc, id desc)`；Audit ID 以字符串返回，避免客户端 bigint 精度损失。
- item 只包含 Audit ID、action、脱敏 actor、目标 role/state、reason、`saved` 结果、允许的 before/after 摘要和时间。
- 不返回 raw metadata、requestId、payload fingerprint、Ledger、Auth identifier 或任意内部幂等结果。

## 5. Zero-write and permission evidence

事务 SQL suite 覆盖：

- anon、Reader、Author、suspended Admin、revoked Admin deny；active Admin/Super Admin allow。
- 未授权 caller 对 existing/missing target 获得相同 SQLSTATE/message。
- NFKC/case registration-name、full UUID、limit、cursor、稳定分页、null registration name。
- Detail 最小字段、ordinary/elevated/inactive semantics 与 helper token/snapshot 精确一致。
- Audit 同 timestamp tie-breaker、target filter、脱敏和多页无重复/遗漏。
- 调用前后完整 JSON snapshot 比较：Profile、Membership、Role Grant、Audit、private Ledger、Site Copy State/Revision 全部不变。
- Catalog 证明准确签名、无重载、owner、`prosecdef`、`provolatile`、空 search path、execute ACL、helper deny 与旧 RPC execute 未改变。

## 6. Local validation

| Gate                             | Result                                                |
| -------------------------------- | ----------------------------------------------------- |
| Supabase CLI / command help      | PASS — 2.108.0；相关命令先检查 `--help`               |
| Clean local reset                | PASS — 18/18 Migration，从空库应用至 `20260817121610` |
| P1-02B SQL suite                 | PASS — transaction rollback                           |
| P1-02A + existing SQL regression | PASS — 10 existing suites                             |
| Database Vitest                  | PASS — 13 files / 108 tests                           |
| TypeScript / ESLint              | PASS                                                  |
| Database lint / security advisor | PASS — 0 errors / 0 security issues                   |

## 7. Completion boundary

P1-02B 本地实现完成不授权 Commit、Push、PR、远程 Migration/SQL/QA、P1-02C、Admin 登录、Unpause 或 Deployment。没有修改旧 RPC、`/access`、Action、Domain、Repository、Service、依赖、配置或 lockfile。Admin Production 权威状态仍为 `paused=true`；P0 Site Copy 仍为 Version 7。
