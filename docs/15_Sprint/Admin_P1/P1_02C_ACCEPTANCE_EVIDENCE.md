# ADMIN P1-02C — Ordinary Governance Write RPC Evidence

状态：`LOCAL IMPLEMENTATION COMPLETE — EXECUTE CLOSED / CLOSURE COMMIT NOT AUTHORIZED`
日期：2026-08-17
Parent：`64bba75360e9f303819c42d1c08a2d6ec545983d`
Worktree：`/Users/liuzyzy/Documents/FandomHarbor-Admin-P1-02C`
Branch：`codex/admin-p1-02c-write-rpcs`
Migration：`20260817125140_admin_p1_identity_access_writes.sql`

本文件记录 P1-02C 本地实施证据，不创建新的产品、安全或 Auth 合同。权威来源仍为 [P1-01 Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)、[P1-01 QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)、[P1-02 Plan](P1_02_IMPLEMENTATION_PLAN.md)、[ADR-022](../../17_Architecture_Decisions/ADR-022.md)、[ADR-023](../../17_Architecture_Decisions/ADR-023.md)、[P1-02A Evidence](P1_02A_ACCEPTANCE_EVIDENCE.md) 与 [P1-02B Evidence](P1_02B_ACCEPTANCE_EVIDENCE.md)。

## 1. Closed RPC contract

| RPC           | Signature                                                                | Authority                   | Final execute |
| ------------- | ------------------------------------------------------------------------ | --------------------------- | ------------- |
| Grant Author  | `grant_author_role_v2(uuid,uuid,text,text)`                              | `VOLATILE SECURITY DEFINER` | owner-only    |
| Revoke Author | `revoke_author_role_v2(uuid,uuid,text,text)`                             | `VOLATILE SECURITY DEFINER` | owner-only    |
| Membership    | `set_ordinary_membership_state_v2(uuid,uuid,membership_state,text,text)` | `VOLATILE SECURITY DEFINER` | owner-only    |

三个 public RPC 均为 `postgres` owner、空 `search_path`、无重载；创建后从 `PUBLIC/anon/authenticated/service_role` 撤销 execute，且没有向应用角色 grant。P1-04 原子 cutover 前不存在可调用的新写入口。私有共享执行器同样仅 owner 可执行，不能通过 Data API 或应用数据库角色直达。

Role RPC 的输入形状没有 role 参数，固定只表达 Author。Membership 只接受既有 enum，但内部 fingerprint 合同仅允许 `active/suspended/revoked`，明确拒绝 `pending`。三个接口均没有 proof、reauth、actor、capability 或 dormant elevated 参数。

## 2. Transaction and lock order

共享私有执行器采用固定顺序：

1. 从 `auth.uid()` 取得 actor，实时验证 active Admin/Super Admin。
2. 使用 P1-02A helper 规范化 reason，并生成覆盖 actor、operation、target、desired state、expected token、reason 的 fingerprint。
3. 获取 requestId transaction advisory lock，再检查 Ledger replay/mismatch。
4. 获取 `fandom-harbor:identity-access-governance` 全局 transaction lock，并再次实时验证 actor。
5. 获取既有 `fandom-harbor:super-admin-role` lock，确认至少一名 active Super Admin。
6. `FOR UPDATE` 锁定 target Membership 与全部 active Role Grant。
7. 任何未撤销 Admin/Super Admin grant 先返回 `42501` + `ELEVATED_MUTATION_DEFERRED`，不写 Ledger/Audit。
8. 只调用 P1-02A snapshot/token helper 重算 expected-state；Migration 不复制 token 或 fingerprint 算法。
9. 原子判定 `saved | unchanged | conflict`，Saved 才执行业务变化和一条 Audit，最后插入一个封闭 Ledger 结果。

函数没有 dynamic SQL、事务控制语句、客户端 actor/role 或 JWT role claim。任意异常由 PostgreSQL 事务语义回滚业务、Audit 与 Ledger。

## 3. Result and idempotency evidence

| Case                                                      | Business    | Audit       | Ledger/result                                     |
| --------------------------------------------------------- | ----------- | ----------- | ------------------------------------------------- |
| Saved                                                     | exactly one | exactly one | one `saved` row referencing that Audit            |
| Unchanged                                                 | none        | none        | one replayable `unchanged` row                    |
| Conflict                                                  | none        | none        | one `conflict` row with current snapshot/token    |
| same requestId + normalized payload                       | no repeat   | no repeat   | byte-for-byte original result                     |
| same requestId + different actor/target/operation/payload | none        | none        | `22023` + `REQUEST_ID_MISMATCH`                   |
| elevated target                                           | none        | none        | `42501` + `ELEVATED_MUTATION_DEFERRED`; no Ledger |

Membership、Author Grant 与 Author Revoke 均覆盖 Saved、Unchanged、stale expected-state Conflict 及 Saved replay。Grant Author 对 inactive target 返回 `target_membership_not_active` Conflict。NFC/trim 等价 reason 使用相同 fingerprint，Audit 只保存规范化 reason。

Audit 继续使用 `membership.state_changed`、`role.granted`、`role.revoked`，保存 requestId、operation、target、允许的 before/after 与 expected token；P1-02B Audit RPC 仍只投影冻结的安全摘要。Saved Ledger 的唯一 `audit_log_id` 与实际 Audit 精确一致。

## 4. Permission, denial, and atomicity evidence

- Catalog：`PUBLIC/anon/authenticated/service_role` 对三个 write RPC 和私有执行器均无 execute；P1-02A helper deny 保持。
- active Admin/Super Admin 的内部语义允许路径通过 owner-only 本地 harness 验证；Reader、Author、suspended Admin、revoked Admin 在函数内实时拒绝。
- active 或 inactive elevated target 的 Membership、Author Grant、Author Revoke 全部在 expected-state/result 写入前拒绝。
- Role 参数注入因不存在 overload 而失败；`pending` Membership、nil requestId、非法 token、3/201 code-point reason、控制字符和换行均失败且不写 Ledger。
- 人为 Audit INSERT 失败证明业务变化与 Ledger 回滚；人为 Ledger INSERT 失败证明业务变化与 Audit 回滚。
- active Super Admin 数量为零的事务式 probe 返回 `IDENTITY_ACCESS_GOVERNANCE_UNAVAILABLE`，probe 自身回滚；既有最后 active Super Admin 保护和旧 RPC 定义未修改。

## 5. Concurrency evidence

本地 `dblink` 双连接 suite 使用合成身份并在结束后清理到逐表/逐 JSON 基线：

- 同 requestId、同 payload：两个连接返回逐字段相同 Saved；精确一项 Role 变化、一条 Audit、一个 Ledger。
- 不同 requestId、同 target、同初始 expected token：全局锁串行；第一项 Membership Saved，第二项获得最新 token 的 Conflict；精确一次业务变化、一条 Audit、两个 Ledger。
- suite 结束后 dblink、临时函数/表、合成 Auth/Profile/Membership/Role/Audit/Ledger 全部移除；Site Copy state/revisions 精确不变；最终 write RPC execute 仍关闭。

## 6. Local validation

| Gate                             | Result                                                    |
| -------------------------------- | --------------------------------------------------------- |
| Supabase CLI / help              | PASS — 2.108.0；先检查 migration/reset/lint/advisors help |
| Clean local reset                | PASS — 19/19 Migration，从空库应用至 `20260817125140`     |
| P1-02C semantic suite            | PASS — transaction rollback                               |
| P1-02C concurrency suite         | PASS — two dblink races + full cleanup                    |
| Existing SQL regression          | PASS — 11 existing suites                                 |
| Database Vitest                  | PASS — 13 files / 114 tests；定向合同 18/18               |
| TypeScript / ESLint / Prettier   | PASS                                                      |
| Database lint / security advisor | PASS — 0 errors / 0 P1-02C findings                       |

当前官方复核来源：[Supabase Changelog](https://supabase.com/changelog.md)、[Database Functions](https://supabase.com/docs/guides/database/functions)、[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)、[Triggers](https://supabase.com/docs/guides/database/postgres/triggers)、[Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)、[PostgreSQL advisory/row locking](https://www.postgresql.org/docs/current/explicit-locking.html) 与 [CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html)。2026-07/08 Changelog 中 extension pinning、Realtime schema、gateway 与日志 endpoint 变化不改变本地 ordinary mutation 合同。

## 7. Completion boundary

P1-02C 本地实现完成不授权 Closure Commit、Push、PR、P1-02D、authenticated execute、旧 RPC cutover、远程 Migration/SQL/QA、Admin 登录、Unpause 或 Deployment。没有修改 `/access`、Action、Domain、Repository、Service、依赖、配置或 lockfile。Admin Production 权威状态仍为 `paused=true`；P0 Site Copy 仍为 Version 7，且没有任何远程状态变化。
