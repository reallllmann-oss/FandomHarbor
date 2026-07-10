# Sprint 002A — Content Domain Foundation

## Identity

- Product Phase: Phase 2 — Publishing
- Product outcome: 建立作品、章节、独立文章、分类和标签的数据库与代码边界
- Approval status: Product Owner 于 2026-06-30 明确批准
- Dependencies: Phase 1 Membership / `role_grants` / RLS helpers

## Mandatory startup gate

- Environment Check: Passed — macOS 14.6.1、workspace/`.git` 权限、DNS/TLS 与官方 npm registry 可用
- Toolchain Check: Passed — Node、pnpm、Git、Turbo、Vitest、TypeScript、Supabase CLI 可用
- Version Check: Passed — Node 24.18.0、pnpm 11.7.0、registry/engines/packageManager 与 Runtime Contract 一致
- Dependency Check: Passed — `pnpm install --frozen-lockfile --offline --ignore-scripts`；manifest、lockfile、workspace 配置哈希未变化
- Development authorized only after all four checks pass: Yes

## Scope

### In

- `works`, `chapters`, `articles`
- `content_categories`, `content_tags`, `work_tags`, `article_tags`
- 外键、索引、Check Constraint、slug 唯一范围、自动更新时间
- RLS、Author 所有权、Admin/Super Admin 管理、active Membership 已发布内容读取
- `packages/database` 类型/Repository 与 `packages/services` 领域/Service 边界
- Migration 静态契约、Vitest 与一次性数据库 SQL allow/deny 脚本
- README、System Architecture、数据库注册表、Decision/ADR 与项目记忆同步

### Out

- UI、编辑器、Revision/Diff/Restore、Storage
- 评论、Kudos、收藏、通知、推荐与其他社区功能
- Pen Name 公开署名、协作作者、系列
- 永久删除/保留策略、匿名 Visitor 正文读取
- ORM、新依赖、manifest/lockfile 或 Supabase 核心配置变更

## Workflow evidence

- Research: 复核现有 Phase 1 migrations、RBAC helper、RLS 矩阵、数据库注册表和 package 边界
- Requirement: 以 Product Owner 本 Sprint brief 为范围与验收来源
- Architecture: ADR-019 与 `SYSTEM_ARCHITECTURE.md` 5.1
- Database: ERD/Supabase Schema/Migration/RLS/Indexes/Lifecycle 注册表已同步
- API: N/A — 本 Sprint 不新增 REST、Server Action、Webhook、Realtime 或 Event 合同
- UI: N/A — Product Owner 明确禁止 UI 与编辑器
- Review: 默认拒绝、私有 owner 列、Membership/Role Grant 复用、非破坏生命周期与 provider 类型隔离已审查

## Acceptance and tests

- 七张表、外键、索引、Check Constraint、slug 唯一策略与更新时间 trigger 可由 migration 重建
- 所有表启用 RLS，`anon` 无表权限
- active Membership 只读 `published` 内容；Visitor/inactive/suspended/revoked 默认拒绝
- owning Author 可管理自己的内容，unrelated Author 不可管理；Admin/Super Admin 可管理全部
- `owner_user_id` 不出现在 authenticated SELECT grant
- TypeScript 类型、Service/Repository 契约与 runtime mapping 测试通过
- SQL role matrix 可在一次性 Supabase/PostgreSQL 数据库中事务执行并回滚

## Rollback / recovery

Migration 是纯新增。若尚未写入业务数据，可按依赖逆序删除关联表、内容表、词表、trigger 与两个 helper；存在数据后不得直接回滚，必须先导出并通过新的 remediation migration 处理。当前不执行云端 migration。

## Verification result

- Scoped formatting: Passed
- Workspace lint: Passed
- Workspace TypeScript: Passed
- Workspace Vitest: Passed；Database 12/12，Services 7/7，其余既有测试通过
- Three Next.js production builds: Passed
- Static Migration contract: Passed；5/5
- Transactional SQL role matrix: Prepared, not executed；当前环境没有 PostgreSQL client/server 或 container runtime，且未获授权新增 `supabase/config.toml`
- Full repository `format:check`: Existing baseline failure；123 个历史文件不符合当前 Prettier，未在本 Sprint 批量改写
