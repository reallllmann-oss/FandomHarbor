# Project Status

## 当前阶段

Phase 1 · Sprint 2 / Phase 1C — Identity Access Core

## 当前状态

`Engineering Complete — Awaiting Database Execution and Product Acceptance`

## 已完成

- Phase 0.6、Phase 1 与 Phase 1C 方案已由 Product Owner 批准。
- Project Foundation、RuntimeConfig、Trusted Identity/Session、Repository 与 ObjectStorage 最小边界已建立。
- Supabase email/password + 必须验证邮箱的 Auth adapter 已建立，provider User/Session 不进入业务合同。
- 邀请、Membership、Reader capability、Author/Admin/Super Admin 手工授权与审计流程已实现。
- 三个有序 identity/access migrations、RLS/grants、安全函数与 SQL 行为测试脚本已写入仓库。
- Web/Admin 已具备登录、注册、邀请兑换、门禁、邀请管理和权限管理壳层；未引入 Phase 2 业务。
- `pnpm install --frozen-lockfile`、Type、Lint、Test、Build 已通过。

## 当前阻塞

- 无代码或依赖阻塞。
- 当前执行环境没有 Supabase CLI、PostgreSQL client 或 Docker，因此尚未在一次性数据库上实际执行 migration rebuild 与 `supabase/tests/phase_1c_identity_access.sql`。

## 未完成

- 在经批准的一次性 Supabase/PostgreSQL 环境执行三项 migration 与 SQL allow/deny 测试。
- 在目标 Supabase 项目配置 Auth URL、邮件验证与 Custom SMTP；此项仍属于云资源/部署配置工作。
- Product Owner 完成 Phase 1 产品验收并批准进入 Phase 2。

## 下一步

- 优先在一次性数据库执行 migration rebuild 与 SQL 测试，不使用生产数据。
- SQL 验证通过后进行 Phase 1 产品验收。
- 未获 Product Owner 批准前不得进入 Phase 2，也不得创建云资源或首个生产 Super Admin。

## 最后更新

2026-06-29
