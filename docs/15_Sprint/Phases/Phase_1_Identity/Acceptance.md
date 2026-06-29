# Phase 1 Acceptance

Status: Engineering evidence complete; database execution and Product Owner phase acceptance pending.

## Exit criteria

- [x] 访客在服务端门禁与 RLS 合同中默认拒绝归档读取
- [x] 有效邀请原子兑换且不包含提权语句
- [x] 角色撤销/暂停在 capability 与数据库 helper 中立即失效
- [ ] 全部角色允许/拒绝路径在一次性数据库实际执行通过

## Universal gates

- [x] Research, requirements, architecture, database, API and UI artifacts are approved or explicitly N/A with reason.
- [ ] Security, privacy, accessibility, mobile and maintainability reviews pass.
- [ ] Phase-internal Sprints meet `.ai/ACCEPTANCE_CHECKLIST.md` after database execution evidence.
- [x] Memory, ADRs/decisions, detailed docs, known issues and `.ai/CHANGELOG.md` are reconciled.
- [ ] Product owner approves Phase completion.
