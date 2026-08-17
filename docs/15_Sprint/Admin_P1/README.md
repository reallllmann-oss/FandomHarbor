# Admin P1 — Identity & Access Governance Console

状态：`P1-00 SCOPE FREEZE COMPLETE`
Product Owner 决策日期：2026-08-16

Admin P1 是独立于 Phase 7 Admin Intelligence 的治理计划。它升级现有 `/access` 身份访问操作，不扩展角色或 capability。

## 执行切片

| Step  | 目标                                         | 当前状态       |
| ----- | -------------------------------------------- | -------------- |
| P1-00 | 范围、安全合同、威胁模型、验收与文档漂移冻结 | Complete       |
| P1-01 | Database / Permission / Contract Design      | Not authorized |
| P1-02 | Domain / Repository / Service                | Not authorized |
| P1-03 | Read-only Directory / Search / Detail        | Not authorized |
| P1-04 | Controlled Membership / Role Mutations       | Not authorized |
| P1-05 | Local + dedicated non-Production remote QA   | Not authorized |
| P1-06 | Protected Preview Acceptance                 | Not authorized |
| P1-07 | Production Release Review                    | Not authorized |

权威合同：

- [P1-00 Scope and Security Contract](P1_00_SCOPE_AND_SECURITY_CONTRACT.md)
- [Admin Identity & Access Governance](../../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md)
- [ADR-021](../../17_Architecture_Decisions/ADR-021.md)

P1-00 不授权进入 P1-01，也不授权 Migration、远程数据库写入、Admin Unpause、Web 入口、Deployment、Commit 或 Push。
