# Admin P1 — Identity & Access Governance Console

状态：`P1-01 DESIGN CLOSURE — OPTION 3 / ELEVATED MUTATIONS DEFERRED`
P1-00 Product Owner 决策日期：2026-08-16；ADR-022 Option 3 决策日期：2026-08-17

Admin P1 是独立于 Phase 7 Admin Intelligence 的治理计划。它升级现有 `/access` 身份访问操作，不扩展角色或 capability。

## 执行切片

| Step  | 目标                                         | 当前状态                                                    |
| ----- | -------------------------------------------- | ----------------------------------------------------------- |
| P1-00 | 范围、安全合同、威胁模型、验收与文档漂移冻结 | Complete                                                    |
| P1-01 | Database / Permission / Reauth Design        | Complete — Option 3 boundary accepted                       |
| P1-02 | Domain / Repository / Service                | Not authorized; ordinary scope eligible for future planning |
| P1-03 | Read-only Directory / Search / Detail        | Not authorized                                              |
| P1-04 | Controlled Membership / Role Mutations       | Not authorized                                              |
| P1-05 | Local + dedicated non-Production remote QA   | Not authorized                                              |
| P1-06 | Protected Preview Acceptance                 | Not authorized                                              |
| P1-07 | Production Release Review                    | Not authorized                                              |

权威合同：

- [P1-00 Scope and Security Contract](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)
- [P1-01 Data, Permission and Reauth Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)
- [P1-01 Dedicated Non-Production QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)
- [Admin Identity & Access Governance](../../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md)
- [ADR-021](../../17_Architecture_Decisions/ADR-021.md)
- [ADR-022 — Reauth Trust Boundary](../../17_Architecture_Decisions/ADR-022.md)

Product Owner 已选择 ADR-022 Option 3。KI-033 当前 P1 状态为 `ACCEPTED DEFERRED BOUNDARY`，技术问题仍未解决；全部 elevated mutations `DEFERRED`，普通治理 `AUTHORIZED FOR FUTURE P1-02 PLANNING`。本状态仅授权 P1-01 docs-only Closure Commit，不授权开始 P1-02、Migration、远程数据库写入、Admin Unpause、Web 入口、Deployment 或 Push。
