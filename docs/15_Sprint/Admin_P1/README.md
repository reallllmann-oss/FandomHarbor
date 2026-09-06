# Admin P1 — Identity & Access Governance Console

状态：`P1-06C COMPLETE / P1-07A RELEASE PRECONDITIONS IN PROGRESS`
P1-00 Product Owner 决策日期：2026-08-16；ADR-022 Option 3 与 ADR-023 决策日期：2026-08-17

Admin P1 是独立于 Phase 7 Admin Intelligence 的治理计划。它升级现有 `/access` 身份访问操作，不扩展角色或 capability。

## 执行切片

| Step   | 目标                                         | 当前状态                               |
| ------ | -------------------------------------------- | -------------------------------------- |
| P1-00  | 范围、安全合同、威胁模型、验收与文档漂移冻结 | Complete                               |
| P1-01  | Database / Permission / Reauth Design        | Complete — Option 3 boundary accepted  |
| P1-02  | Backend Data / Domain / Repository / Service | Complete — P1-02A–G committed          |
| P1-03  | Read-only Directory / Search / Detail        | Complete — committed                   |
| P1-04A | Ordinary write RPC atomic cutover            | Complete — committed                   |
| P1-04B | Controlled Membership / Author Role UI       | Complete — committed                   |
| P1-05A | QA environment and safety preparation        | Pass — dedicated QA isolation verified |
| P1-05B | Local + Dedicated Non-Production Remote QA   | Complete — P1-05 closed                |
| P1-06A | Protected Admin Preview Provisioning         | Complete — committed                   |
| P1-06B | Manual Preview Acceptance                    | Complete — Product Owner PASS          |
| P1-06C | Admin UI Polish                              | Complete — committed by closure        |
| P1-07  | Production Release Review                    | In progress — PR #3 release gates      |

权威合同：

- [P1-00 Scope and Security Contract](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)
- [P1-01 Data, Permission and Reauth Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)
- [P1-01 Dedicated Non-Production QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)
- [P1-05A Dedicated Non-Production QA Preparation](P1_05A_QA_PREPARATION.md)
- [P1-05B-1 Attempt 1 Failure and ACL Correction](P1_05B1_BOOTSTRAP_FAILURE_AND_FIX.md)
- [P1-05B-1R2 Clean QA Attempt 2 Bootstrap Evidence](P1_05B1_ATTEMPT2_BOOTSTRAP_EVIDENCE.md)
- [P1-05B-2 Read and Denial QA Evidence](P1_05B2_READ_DENIAL_QA_EVIDENCE.md)
- [P1-05B-3 Mutation and Cleanup QA Evidence](P1_05B3_MUTATION_AND_CLEANUP_QA_EVIDENCE.md)
- [P1-05 Final Closure Audit](P1_05_FINAL_CLOSURE_AUDIT.md)
- [P1-06A Dedicated Protected Preview Evidence](P1_06A_DEDICATED_PREVIEW_EVIDENCE.md)
- [P1-06C UI Polish Acceptance Evidence](P1_06C_UI_POLISH_ACCEPTANCE_EVIDENCE.md)
- [P1-02 Implementation Plan and Engineering Gate Freeze](P1_02_IMPLEMENTATION_PLAN.md)
- [P1-02A Local Acceptance Evidence](P1_02A_ACCEPTANCE_EVIDENCE.md)
- [P1-02B Local Acceptance Evidence](P1_02B_ACCEPTANCE_EVIDENCE.md)
- [P1-02C Local Acceptance Evidence](P1_02C_ACCEPTANCE_EVIDENCE.md)
- [P1-02D Local Acceptance Evidence](P1_02D_ACCEPTANCE_EVIDENCE.md)
- [P1-02E Local Acceptance Evidence](P1_02E_ACCEPTANCE_EVIDENCE.md)
- [P1-02F Local Acceptance Evidence](P1_02F_ACCEPTANCE_EVIDENCE.md)
- [P1-02G Backend Closure and UI Handoff](P1_02G_BACKEND_CLOSURE_AND_UI_HANDOFF.md)
- [P1-03 Local Acceptance Evidence](P1_03_ACCEPTANCE_EVIDENCE.md)
- [P1-04A Local Acceptance Evidence](P1_04A_ACCEPTANCE_EVIDENCE.md)
- [P1-04B Local Acceptance Evidence](P1_04B_ACCEPTANCE_EVIDENCE.md)
- [Admin Identity & Access Governance](../../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md)
- [ADR-021](../../17_Architecture_Decisions/ADR-021.md)
- [ADR-022 — Reauth Trust Boundary](../../17_Architecture_Decisions/ADR-022.md)
- [ADR-023 — Read RPC Authority Boundary](../../17_Architecture_Decisions/ADR-023.md)

P1-02A–F 已形成独立本地 Commit。P1-02G 在父提交 `edd78c190002340eaa2091860e5eb997785b7528` 上完成 clean local rebuild、全部 19 个 Migration、13 个 SQL suite、最终 Catalog/ACL/RLS/不可变性复核，以及 Domain 53、Repository 24、Service 57、Services 180、Database 138 项测试。三个读取 RPC 保持 ADR-023 最小混合权限；三个 ordinary write RPC 对 `PUBLIC`、`anon`、`authenticated`、`service_role` 的 12 项 execute 继续全部关闭。旧 RPC execute 未变且未 cutover。

权威交接将 P1-03 限定为 `/access` 读取 UI，只调用三个读取 Service 用例，不显示写控件、不开放 write execute、不启用 Web Admin 入口；P1-04 继续作为独立 Gate，才可实现 ordinary Membership 与 Author Role 的 Edit/Review/reason/confirm、Action、结果展示和单一原子 cutover。ADR-022 Option 3、KI-033 `ACCEPTED DEFERRED BOUNDARY` 与全部 elevated mutations `DEFERRED` 不变；P1.1 Elevated Access Governance 只能在整个 P1 完成后独立评估。邀请管理仍独立延期。P1-02G 已由 Product Owner 验收并形成 Commit `370d7b0541a51ed63dd4076e4d912b2309c9d072`；随后单独授权的 P1-03 不授权 P1-04、P1.1、远程 apply、登录、Unpause 或 Deployment。

P1-03 基于 P1-02G Commit `370d7b0541a51ed63dd4076e4d912b2309c9d072` 完成并形成 Commit `9caac4a9affbd3ea9d13cbae266696f9c853490e`：`/access` 使用 Search、Detail 与 Audit 三个既有 Governance Service read，按调用执行 fresh live-access check，展示冻结的最小身份、Membership、Role、expected-state 与治理 Audit。页面只有 GET 查询和链接导航；旧 mutation Action 不再被页面引用。P1-03 Closure 时 write execute 仍为 0/12、旧 RPC 尚未 cutover；其后的本地 ACL 状态由 P1-04A 段落取代。Loading、loaded、empty、unauthorized、recoverable error 与 unavailable/deferred 状态均已覆盖。

P1-04A 已形成 Commit `2750205f2b9a3cce2c09d2e3f5e43ba1b7d421cd`。P1-04B 在该本地 ACL 基线上完成 ordinary Membership 与 Author Grant/Revoke 的 reason → Review → 独立确认 → `Saved | Unchanged | Conflict` UI/Action，并形成 Commit `bf35f5a1e4b005e04bb4b9d054cf6310ffb0c74c`。每次 Review 通过 Service 重新读取并绑定数据库 expected-state，Action 生成稳定 requestId；确认只调用一次 Service mutation，安全显式重试复用同一 ID，Conflict 强制刷新与新 Review。Elevated 账户只有读取与延期说明，无写控件。证据见 [`P1_04B_ACCEPTANCE_EVIDENCE.md`](P1_04B_ACCEPTANCE_EVIDENCE.md)。

Ordinary governance 的本地实现链现已完成，但这不等于任何 Production 发布。P1-05B-3R2 已在 dedicated QA Attempt 2 完成 ordinary mutation、幂等、Conflict、并发、live authorization、Detail/Audit、elevated/legacy deny、local atomicity 与精确 cleanup；QA2 恢复零 synthetic state 并关闭 write。P1-05 Final Closure Audit 随后通过，并由 Commit `0542c759a2ac0683cc7ac7370748773ed26ae7d3` 正式关闭。`REMOTE FAILURE INJECTION` 的准确状态仍是 `NOT AVAILABLE BY CURRENT CONTRACT`；原子回滚证据来自当前权威本地测试。当前 P1-06A 结果由下一段与专用证据文档记录；P1-07 仍未授权，P1.1 Elevated Access Governance 保持 `DEFERRED / NOT AUTHORIZED`。Admin Production 保持 `paused=true`，Web Admin 入口保持关闭，P0 Production Site Copy 保持 Version 7。

P1-05 已在 Commit `0542c759a2ac0683cc7ac7370748773ed26ae7d3` 正式关闭。P1-06A 随后完成专用受保护 Preview 的失败恢复、人工验收和最终清理，并由 Commit `c9643d387c1216d40260882e6055b423576362ee` 关闭。P1-06B Manual Preview Acceptance 已由 Product Owner 正式确认 PASS。P1-06C 在此基础上完成 UI-01 全后台中文化、UI-02 Review 与全页面响应式修复、UI-03 全局 Header 退出登录和 UI-04 固定 `Asia/Shanghai` 的北京时间展示。Product Owner 已在最终受保护 Preview `dpl_HiF87dWBe54kXCMum3yN29nWHCxa` 完成人工验收；1440/1024/768/480/390 多视口与运行时北京时间均 PASS。正式 Admin Production 未变且仍 `paused=true`，Web Admin 入口关闭。P1-06C 已由本 Closure Commit 完成；P1-07A 已获授权并进入 PR #3 release precondition gates，P1.1 继续 `DEFERRED / NOT AUTHORIZED`。完整证据见 [`P1_06A_DEDICATED_PREVIEW_EVIDENCE.md`](P1_06A_DEDICATED_PREVIEW_EVIDENCE.md) 与 [`P1_06C_UI_POLISH_ACCEPTANCE_EVIDENCE.md`](P1_06C_UI_POLISH_ACCEPTANCE_EVIDENCE.md)。

P1-07A-2C 冻结 Admin Preview deployment governance：正式
`fandom-harbor-admin` 保持 `paused=true` 且不再为 PR 创建自动 Preview；专用
`fandom-harbor-admin-p1-preview` 连接同一 GitHub repository 与 `apps/admin`，使用
QA2 Preview-only 环境、Vercel Authentication、零 bypass，并以既有
`admin-production-disabled` 哨兵分支作为 Production Branch。Production release
只能在冻结不可变 release SHA 后经单独授权显式执行；当前未授权 Merge、Production
deployment、Admin resume 或 Web Admin 入口开放。

P1-05A 已完成 fixture、credential、write-window、emergency close-writes、cleanup/retention、20-Migration apply、ACL、QA matrix 与 evidence 计划，并形成 Commit `4990440cb0a6e341ce242380480a06fe0c62ea14`。Attempt 1 在 dedicated QA 的 Migration D 检测到 Hosted direct `anon` legacy execute 后失败；Migration 1–19 已应用，D 未应用，fixture/业务 QA 未开始，紧急 fail-closed 后 6 个 write RPC × 4 个应用角色均为 deny。该 Project 固定为 `FAILED BOOTSTRAP EVIDENCE / FAIL-CLOSED`，不得继续用于 P1-05B。

P1-05B-1R1 已在本地修正 D 的 fresh-bootstrap ACL 合同并 Commit。R2 暂停但未删除 Attempt 1，创建独立 Free/Nano Attempt 2 `hicfnlwzmnbxhimyeviy`，从空状态完整应用 20 条 Migration。远程 catalog 精确；Hosted 默认 privilege difference 为 YES；D normalization PASS；最终 old `0/12`、v2 authenticated-only `3/12`、read authenticated-only `3/12`、private `0/36`。创建后因 CLI 输出解析未保留首次密码而对 Attempt 2 旋转一次数据库密码；Product Owner 已接受该 QA-only operational deviation。

P1-05B-2 已在 Attempt 2 建立 14 个 A–N 合成业务夹具和一个不可登录 bootstrap control identity。Admin 与 Super Admin 的本地 `/access` Search/Detail/Audit 通过；Reader、Author、inactive/revoked Admin、匿名、live-access 失效与 Review→Confirm 权限丢失全部拒绝。Admin、Super Admin、elevated Membership 与唯一 active Super Admin 保护测试均为 `ELEVATED_MUTATION_DEFERRED`；旧 RPC 为 authenticated privilege denied。业务、Ledger、Audit 零增量，post-test ACL 仍为 old `0/12`、v2 `3/12`、read `3/12`、private `0/36`，合成会话已关闭。P1-05B-2 已形成 Commit `3f45ce7459e67e7f6b8844024bfd64181a1a8374`；其当时的 B-3 ready handoff 已由下述 B-3 实际结果取代。该 B-2 历史时点的 P1-06/P1-07/P1.1 未授权状态也已由上方当前状态取代。

P1-05B-3 Attempt 1 的 `INVALID_INPUT`、零写入和 fail-closed cleanup 继续作为历史证据保留。R1 Commit `f00743c4e8ae7604b1b8114f29cf7fdec32f2e63` 修正 Action raw request → Service parser 组合边界后，R2 的正式 UI `active -> suspended` 返回 Saved 且 Detail/Audit 一致。完整矩阵得到 17 个唯一 Ledger（11 Saved、4 Unchanged、2 Conflict）和 11 个业务 Audit，无重复或孤儿记录；三类并发、requestId replay/mismatch、stale Conflict、elevated 与 legacy deny 均通过。本地权威 atomicity/rollback 与 dblink concurrency suites 通过。最终 synthetic Auth/Session/Profile/Membership/Role/Audit/Ledger/requestId/邀请均为零，ACL 为 old `0/12`、v2 `0/12`、read `3/12`、private `0/36`，20/20 Migration 与非 fixture 基线不变。该 P1-05 Closure 前历史时点的 Final Closure Audit 在当时 HEAD 重跑 Admin 88、P1-03 17、P1-04B 17、composition 7、Service 57、Services 180、Repository 24、Database 143、Migration contract 23 及本地 SQL/静态/构建门禁后通过，进入 `PASS / READY TO CLOSE`；后续已由 Commit `0542c759a2ac0683cc7ac7370748773ed26ae7d3` 与上方 P1-06A 当前状态取代。
