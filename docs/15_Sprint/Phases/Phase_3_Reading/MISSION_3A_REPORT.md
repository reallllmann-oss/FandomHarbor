# Mission 3A Engineering Report & Product Handoff

Status: PASS — Product Owner Accepted  
Date: 2026-07-02  
Mission: Phase 3A — Beta Blocking (`3A-0`、`3A-1`、`3A-2`、必要的 `3A-3`)

## 1. 修改文件列表

### Mission 直接维护

- `.ai/WORKFLOW.md`
- `.ai/AI_BEHAVIOR.md`
- `.ai/PROJECT_RULES.md`
- `.ai/START_HERE.md`
- `.ai/LANGUAGE_POLICY.md`
- `.ai/DECISIONS.md`
- `.ai/PROJECT_STATUS.md`
- `.ai/CHANGELOG.md`
- `.ai/MEMORY.md`
- `.ai/KNOWN_ISSUES.md`
- `docs/15_Sprint/Phases/Phase_3_Reading/SPRINT_PLAN_FAST_LAUNCH.md`
- `docs/15_Sprint/Phases/Phase_3_Reading/Acceptance.md`
- `docs/15_Sprint/Phases/Phase_3_Reading/MISSION_3A_REPORT.md`

### 机械格式化

首次全仓发布门禁发现 123 个既有未格式化文件。Mission 3A 执行了一次全仓
Prettier 格式化以解除该 P0，未改变产品行为。当前工作区在 Mission 开始前已包含
大量未提交的 Phase 2 代码和文档，因此 Git 当前变更列表同时包含既有工作与本次
机械格式化，不能把全部工作区差异归因于 Mission 3A。

本 Mission 没有新增产品功能、依赖、第三方服务、基础设施、权限模型或 Auth
架构，也没有修改 `pnpm-lock.yaml`。

## 2. 完成内容

- Mission Authorization v1 已写入项目治理事实源，D-038 已记录。
- 3A-0：
  - 工具链、环境变量一致性、敏感文件跟踪状态与发布质量门禁已验证。
  - 修复全仓格式门禁 P0。
- 3A-1：
  - 三份应用环境配置一致并指向同一远程 Supabase 项目。
  - 远程 Auth 允许注册且 Email Autoconfirm 已开启。
  - 本地与远程 9 条 Migration 完全一致。
- 3A-2：
  - 使用真实远程 Supabase 完成邀请码注册、注册名登录、Reader、Author
    grant、Studio、创建草稿、保存正文、发布与 Reader 回读。
  - 验证未登录守卫、Reader 角色拒绝 Studio、桌面与 390×844 窄屏路径。
- 3A-3：
  - 修复格式门禁 P0。
  - Mission 结束时未发现剩余应用 P0。

## 3. 测试结果

- `pnpm validate`：通过。
- Prettier、ESLint、TypeScript：通过。
- 全仓 Vitest：通过；Web 70 个测试、Admin 2 个测试及其他 workspace package
  tests 全部通过。
- Web、Admin、Docs production build：通过。
- 浏览器 QA：
  - 未登录访问 `/works`、`/archive`、`/studio` 均进入登录页。
  - Reader 可以阅读 Mission 3A 发布作品，且访问 `/studio` 被送回 `/archive`。
  - Author 可以进入 Studio、创建草稿、保存正文、发布并进入 Reader 页面。
  - 浏览器应用错误：0。

## 4. Runtime 结果

- Node.js：24.18.0。
- pnpm：11.7.0。
- Supabase CLI：2.108.0。
- Docker Client/Server：29.6.1。
- 本地 Supabase 从零重建成功。
- 主机没有独立 `psql`；使用现有 Supabase PostgreSQL 容器内置客户端执行 SQL
  suites，未安装新工具或改变技术栈。
- 首次镜像下载出现 TLS timeout，Supabase CLI 在同一进程内自动恢复，最终
  Runtime 成功。

## 5. Migration 结果

- 本地 9 条 Migration 从零顺序应用成功。
- 远程 Migration 列表与本地 9/9 一致。
- `phase_1c_identity_access.sql`：通过。
- `phase_2_auth_registration.sql`：通过。
- `phase_2_content_domain.sql`：通过。
- Mission 3A 没有新增或修改 Migration。

## 6. 文档同步情况

- Mission Authorization v1 已同步至 Workflow、AI Behavior、Project Rules、
  Start Here、Language Policy 与 D-038。
- Phase 3 Fast Launch Plan 已更新为 Mission 3A Authorized。
- Project Status、Changelog、Memory、Known Issues 与 Phase 3 Acceptance
  已同步。
- 本文同时作为 Mission Report、Product Handoff 与人工验收入口。

## 7. Known Issues

- KI-004：年龄与成人内容合规仍需产品决定。
- KI-009：Beta 规模、预算、SLO、RPO/RTO 仍未冻结。
- KI-012：域名、法律主体、政策与下架流程仍未冻结。
- KI-017：本次浏览器 QA 使用本地 Web 连接远程 Supabase，未在已部署 Vercel
  URL 上复验。
- KI-018：当前 Phase 2 + Mission 3A 工作区尚未形成独立 Git Release Candidate。

## 8. Remaining Risks

- 已部署前端域名、Vercel 环境变量与真实流量入口仍需要在 Release Readiness
  阶段做最终 smoke test。
- 当前远程 QA 邀请码和两个 Mission 3A QA 账号属于验收数据，正式发布前应决定
  保留、撤销或清理策略。
- Next.js 仍报告上层额外 lockfile 导致的 workspace root warning；当前不影响
  Build，但应在不改变技术栈的独立工具链维护中处理。
- 大量 Phase 2 变更在 Mission 开始前已未提交；正式 Release Candidate 前必须
  完成明确归档，避免发布来源不唯一。

## 9. Product Handoff

### 验收环境

- 产品入口：当前本地 Web URL，连接远程 Supabase acceptance project。
- Reader QA 注册名：`Mission3AReader0702A`。
- Author QA 注册名：`Mission3AAuthor0702A`。
- QA 密码不写入仓库；由本轮 Mission 交付给 Product Owner。
- Author QA 已通过可审计角色授予获得 Author。

### 验收作品

- 标题：`Mission 3A Remote Journey 20260702A`
- 状态：Published
- Reader 路由：
  `/works/work-9f75fa72-a9e8-4890-8478-bbc0694cd44e/chapters/chapter-1`

### 推荐验收顺序

1. 未登录访问 `/works`、`/archive`、`/studio`。
2. 使用 Reader QA 登录，打开验收作品，确认正文可读。
3. Reader QA 访问 `/studio`，确认返回 `/archive`。
4. 使用 Author QA 登录并进入 `/studio`。
5. 打开 Reader 目录，确认验收作品存在。
6. 在手机宽度下检查登录、目录、阅读和 Studio。

## 10. 人工验收清单

- [x] 未登录守卫符合预期。
- [x] Reader QA 可以登录并回读验收作品。
- [x] Reader QA 无法进入 Studio。
- [x] Author QA 可以登录并进入 Studio。
- [x] Author 创建、保存、发布、Reader 回读闭环符合预期。
- [x] 390px 窄屏核心页面可用，无阻断性横向溢出。
- [x] Product Owner 接受 KI-017、KI-018 在 Release Readiness 前处理。
- [x] Product Owner 确认 Mission 3A Pass。

Product Owner 于 2026-07-02 确认 `Mission 3A. PASS`。Mission 3B、Mission 3C
与 RR-1 均未授权。
