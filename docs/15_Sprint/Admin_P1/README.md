# Admin P1 — Identity & Access Governance Console

状态：`P1-02B READ AUTHORITY CONTRACT APPROVED — IMPLEMENTATION NOT AUTHORIZED`
P1-00 Product Owner 决策日期：2026-08-16；ADR-022 Option 3 与 ADR-023 决策日期：2026-08-17

Admin P1 是独立于 Phase 7 Admin Intelligence 的治理计划。它升级现有 `/access` 身份访问操作，不扩展角色或 capability。

## 执行切片

| Step  | 目标                                         | 当前状态                                                                            |
| ----- | -------------------------------------------- | ----------------------------------------------------------------------------------- |
| P1-00 | 范围、安全合同、威胁模型、验收与文档漂移冻结 | Complete                                                                            |
| P1-01 | Database / Permission / Reauth Design        | Complete — Option 3 boundary accepted                                               |
| P1-02 | Backend Data / Domain / Repository / Service | P1-02A committed; P1-02B authority contract approved, implementation not authorized |
| P1-03 | Read-only Directory / Search / Detail        | Not authorized                                                                      |
| P1-04 | Controlled Membership / Role Mutations       | Not authorized                                                                      |
| P1-05 | Local + dedicated non-Production remote QA   | Not authorized                                                                      |
| P1-06 | Protected Preview Acceptance                 | Not authorized                                                                      |
| P1-07 | Production Release Review                    | Not authorized                                                                      |

权威合同：

- [P1-00 Scope and Security Contract](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)
- [P1-01 Data, Permission and Reauth Design](P1_01_DATA_PERMISSION_REAUTH_DESIGN.md)
- [P1-01 Dedicated Non-Production QA Matrix](P1_01_NON_PRODUCTION_QA_MATRIX.md)
- [P1-02 Implementation Plan and Engineering Gate Freeze](P1_02_IMPLEMENTATION_PLAN.md)
- [P1-02A Local Acceptance Evidence](P1_02A_ACCEPTANCE_EVIDENCE.md)
- [Admin Identity & Access Governance](../../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md)
- [ADR-021](../../17_Architecture_Decisions/ADR-021.md)
- [ADR-022 — Reauth Trust Boundary](../../17_Architecture_Decisions/ADR-022.md)
- [ADR-023 — Read RPC Authority Boundary](../../17_Architecture_Decisions/ADR-023.md)

P1-02A private ledger/helper/Audit foundation 已形成独立本地 Commit。P1-02B proof 发现全 invoker 与 private helper deny 无法同时满足；Product Owner 通过 ADR-023 批准最小混合读取权限：搜索/Audit 保持 invoker，只有详情可使用严格只读 definer，且 helper execute deny、单一 token 算法和底层表 Grant 不变。本次只授权合同修正，不授权 RPC/Migration 实现。ADR-022 Option 3、KI-033 `ACCEPTED DEFERRED BOUNDARY` 与全部 elevated mutations `DEFERRED` 保持不变；P1-02C–G、P1-03 和 P1-04 仍未授权。
