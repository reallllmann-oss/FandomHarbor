# ADMIN P1-02A — Private Ledger and Audit Immutability Evidence

状态：`LOCAL IMPLEMENTATION COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`
日期：2026-08-17
Parent：`e3bb16c537d064808eeed8516b90ec3874b2ab26`
Worktree：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02A`
Branch：`codex/admin-p1-02a-private-ledger`
Migration：`20260817104616_admin_p1_identity_access_ledger.sql`

本文件记录 P1-02A 的本地实施与验收证据，不创建第二份产品或安全合同。权威范围仍为 [P1-00](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)、[P1-01 Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)、[ADR-022](../../17_Architecture_Decisions/ADR-022.md) 与 [P1-02 Plan](P1_02_IMPLEMENTATION_PLAN.md)。

前向说明：P1-02B 的一次性本地 proof 证明 `SECURITY INVOKER` 详情 RPC 无法调用已对 authenticated 撤权的 expected-state helper。Product Owner 通过 [ADR-023](../../17_Architecture_Decisions/ADR-023.md) 批准仅详情 RPC 使用严格只读 definer；本文件冻结的 private helper execute deny、单一 expected-state 算法、Ledger/Audit 不可变与零应用直连权限均保持不变。

## 1. 实施结果

P1-02A 只新增数据库内部安全基础：

- `private.identity_access_request_ledger`。
- reason 规范化/验证、expected-state snapshot/token 与 payload fingerprint 私有 helper。
- Ledger append-only Trigger。
- `audit_logs` 全表 UPDATE/DELETE 不可变 Trigger，同时保留 Site Copy 的稳定错误合同。
- Migration contract 与事务式 catalog/约束/权限/回归测试。

没有创建读取 RPC、写入 RPC、Repository、Service、Server Action、UI、Reauth proof、elevated helper、role、capability 或新应用权限。旧 `grant_role`、`revoke_role`、`set_membership_state` execute 状态保持不变；cutover 仍只属于未来 P1-04。

## 2. Ledger Schema

| 字段                  | 类型与约束                          | 安全语义                                |
| --------------------- | ----------------------------------- | --------------------------------------- |
| `request_id`          | UUID primary key；nil UUID check    | 全局唯一 requestId                      |
| `actor_user_id`       | Profile FK / restrict               | actor 事实；未来由 `auth.uid()` 绑定    |
| `operation`           | 三值 constrained text               | 仅 Author Grant/Revoke、普通 Membership |
| `target_user_id`      | Profile FK / restrict               | 目标账号                                |
| `payload_fingerprint` | bytea；精确 32 bytes                | 版本化规范 payload SHA-256              |
| `result_status`       | `saved/unchanged/conflict`          | 封闭结果                                |
| `result_snapshot`     | JSON object；status 必须匹配        | 原结果安全快照                          |
| `audit_log_id`        | nullable unique Audit FK / restrict | Saved 必填；其他结果必须为空            |
| `created_at`          | statement timestamp                 | 取证时间；indefinite retention          |

索引为 request primary key、`(actor_user_id, created_at desc)` 与 `(target_user_id, created_at desc)`。表启用 RLS，但没有应用角色 Policy；`PUBLIC`、`anon`、`authenticated`、`service_role` 的 table privilege 全部显式撤销。`private` 不在 `supabase/config.toml` 的 Data API exposed schemas 中。

Ledger 没有 reason、payload、password、Token、Cookie、Session 或 secret 字段。UPDATE/DELETE 由 `IDENTITY_ACCESS_REQUEST_LEDGER_IMMUTABLE` 数据库 Trigger 拒绝；当前没有清理或 TTL 路径。

## 3. Private helper boundary

| Helper                                    | 用途                                     | 属性                |
| ----------------------------------------- | ---------------------------------------- | ------------------- |
| `normalize_identity_access_reason`        | NFC 默认规范化与 trim                    | immutable / invoker |
| `identity_access_reason_is_valid`         | 4–200 code points；拒绝控制字符/换行     | immutable / invoker |
| `require_identity_access_reason`          | 稳定 `22023 INVALID_INPUT`               | immutable / invoker |
| `identity_access_expected_state_snapshot` | Membership + 排序 active grants 规范快照 | stable / invoker    |
| `identity_access_state_token`             | 规范快照 SHA-256 hex                     | stable / invoker    |
| `identity_access_payload_fingerprint`     | 版本 1 ordinary payload SHA-256          | stable / invoker    |
| 两个 Trigger functions                    | Ledger 与 Audit 不可变                   | invoker             |

全部函数固定空 `search_path`，安全敏感对象使用全限定名，并从 `PUBLIC`、`anon`、`authenticated`、`service_role` 撤销 execute。fingerprint helper 不接受 actor、role、capability 或 proof 参数；actor 只从 `auth.uid()` 取得。helper 本身不执行授权，未来写 RPC 仍必须独立执行 live actor/target 权限检查。

## 4. Audit immutability

Migration 将原 Site Copy 专项 Trigger 替换为 `audit_logs_immutable`：

- INSERT 不在 Trigger event 中，`private.write_audit` 正常写入。
- 任意非 Site Copy Audit UPDATE/DELETE 返回 SQLSTATE `55000` / `AUDIT_LOG_IMMUTABLE`。
- Site Copy Audit UPDATE/DELETE 继续返回既有 SQLSTATE `55000` / `SITE_COPY_AUDIT_IMMUTABLE`。
- 不修改、删除、重写或重新编号任何历史 Audit。

## 5. Local evidence

| Gate                    | 结果                                                        |
| ----------------------- | ----------------------------------------------------------- |
| Supabase CLI            | 2.108.0；相关命令先检查 `--help`                            |
| Clean local reset       | PASS；17/17 Migration，从空库应用至 `20260817104616`        |
| Local migration catalog | PASS；新时间戳按序登记                                      |
| P1-02A SQL suite        | PASS；事务末尾 rollback                                     |
| Existing SQL regression | PASS；9/9 suites                                            |
| Database Vitest         | PASS；13 files / 102 tests，含新增 6 tests                  |
| Database TypeScript     | PASS                                                        |
| Database ESLint         | PASS                                                        |
| Database lint           | PASS，0 errors；仅两条既有 DATA-01 assignment-cast warnings |
| Local security advisor  | PASS，0 issues                                              |

SQL 覆盖：Schema/RLS/no-policy、三角色 direct-table deny、helper execute deny、nil/重复 requestId、operation/status/result object、32-byte fingerprint、Saved-only/unique Audit、expected-state/token、reason 等价规范化、Ledger UPDATE/DELETE、Audit INSERT/UPDATE/DELETE 与旧 RPC execute 未改变。

既有回归覆盖 Phase 1C Membership/Role/final-Super-Admin、Auth registration、Content、Social、Search/Browse、Site Copy DB/DATA 和双连接并发。所有 SQL fixture 为本地合成数据；transaction suites rollback，Site Copy concurrency suite 恢复正式本地基线。

## 6. Completion boundary

本地实现完成不授权 Commit、Push、PR、远程 Migration/SQL/QA、P1-02B、Admin 登录、Unpause 或 Deployment。Admin Production 权威状态仍为 `paused=true`；P0 Site Copy 仍为 Version 7，且本阶段没有任何远程状态变化。
