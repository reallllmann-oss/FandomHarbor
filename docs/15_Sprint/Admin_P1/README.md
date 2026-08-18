# Admin P1 — Identity & Access Governance Console

状态：`P1-02F LOCAL LIVE-ACCESS SERVICE COMPLETE — CLOSURE COMMIT NOT AUTHORIZED`
P1-00 Product Owner 决策日期：2026-08-16；ADR-022 Option 3 与 ADR-023 决策日期：2026-08-17

Admin P1 是独立于 Phase 7 Admin Intelligence 的治理计划。它升级现有 `/access` 身份访问操作，不扩展角色或 capability。

## 执行切片

| Step  | 目标                                         | 当前状态                                                                 |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------ |
| P1-00 | 范围、安全合同、威胁模型、验收与文档漂移冻结 | Complete                                                                 |
| P1-01 | Database / Permission / Reauth Design        | Complete — Option 3 boundary accepted                                    |
| P1-02 | Backend Data / Domain / Repository / Service | P1-02A–E committed; P1-02F local Service complete; P1-02G not authorized |
| P1-03 | Read-only Directory / Search / Detail        | Not authorized                                                           |
| P1-04 | Controlled Membership / Role Mutations       | Not authorized                                                           |
| P1-05 | Local + dedicated non-Production remote QA   | Not authorized                                                           |
| P1-06 | Protected Preview Acceptance                 | Not authorized                                                           |
| P1-07 | Production Release Review                    | Not authorized                                                           |

权威合同：

- [P1-00 Scope and Security Contract](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)
- [P1-01 Data, Permission and Reauth Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)
- [P1-01 Dedicated Non-Production QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)
- [P1-02 Implementation Plan and Engineering Gate Freeze](P1_02_IMPLEMENTATION_PLAN.md)
- [P1-02A Local Acceptance Evidence](P1_02A_ACCEPTANCE_EVIDENCE.md)
- [P1-02B Local Acceptance Evidence](P1_02B_ACCEPTANCE_EVIDENCE.md)
- [P1-02C Local Acceptance Evidence](P1_02C_ACCEPTANCE_EVIDENCE.md)
- [P1-02D Local Acceptance Evidence](P1_02D_ACCEPTANCE_EVIDENCE.md)
- [P1-02E Local Acceptance Evidence](P1_02E_ACCEPTANCE_EVIDENCE.md)
- [P1-02F Local Acceptance Evidence](P1_02F_ACCEPTANCE_EVIDENCE.md)
- [Admin Identity & Access Governance](../../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md)
- [ADR-021](../../17_Architecture_Decisions/ADR-021.md)
- [ADR-022 — Reauth Trust Boundary](../../17_Architecture_Decisions/ADR-022.md)
- [ADR-023 — Read RPC Authority Boundary](../../17_Architecture_Decisions/ADR-023.md)

P1-02A–E 已形成独立本地 Commit。P1-02F 在 `@fandom-harbor/services` 中实现 live-access Governance Service：六个用例先执行 P1-02D input parser，再逐调用取得一次实时 Access Context；只有 active Admin/Super Admin 可进入 Port。三个普通 mutation 在对应 write Port 前执行 target detail elevated precheck，但数据库继续作为竞态与最终权限权威。Service 不生成 requestId、不重算 expected-state、不 retry mutation、不转换 Conflict，也不依赖具体 Repository、Supabase/PostgREST、Next.js/React、RPC 或 wire shape。P1-02C 写 RPC 对应用角色继续 execute closed。Domain、Repository、Migration/RPC/RLS/Grant、`/access` 和 P0 均不变。本状态不授权 Closure Commit、P1-02G、App wiring、Server Action、远程 apply 或 P1-04 cutover。ADR-022 Option 3、KI-033 `ACCEPTED DEFERRED BOUNDARY` 与全部 elevated mutations `DEFERRED` 保持不变；P1-02G、P1-03 和 P1-04 仍未授权。
