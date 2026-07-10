# Mission 3B 验收报告

Status: PASS — Product Owner Accepted  
Date: 2026-07-03  
Mission: Phase 3B — Social Relationship Foundation

## 1. 修改文件列表

- Web：`apps/web/src/app/author/[slug]/*`、登录回跳、Social Relationship Gateway。
- Service / Repository：`packages/services/src/social-relationships*`、
  `packages/database/src/social-relationship-repository*` 及公开导出。
- Database：`20260702150000_social_relationship_foundation.sql`、
  `phase_3b_social_relationships.sql`、Migration contract tests。
- Docs：Roadmap、Project Status、Changelog、Memory、Known Issues、Acceptance
  与本报告。

## 2. 功能完成情况

- `3B-1`：完成 `/author/{slug}`、公开作者身份、字母头像、Bio、作品/关注统计、
  published-only 作品列表及 Empty / Loading / Error / 404 / 响应式状态。
- `3B-2`：完成 Follow / Unfollow、登录回跳、状态与数量刷新、重复操作幂等、
  Self Follow 拒绝和 active Reader 权限检查。
- `3B-3`：复用现有 Invitation 与 Redemption，提供当前用户的 Inviter、直接
  Invitee 记录和基础计数；用户只能读取自己的关系摘要。

## 3. 测试与 Validation

- `pnpm validate`：2026-07-03 最终复验通过。
- 最终测试：Web 76、Database 32、Services 21、Auth 13、Admin 2、Config 3、UI 1，
  全部通过。
- 本地 Supabase 与远程数据库最终均为 12/12 Migration 对齐；包含验收期间的
  Public Author 与 Studio owner-read 修复。
- Mission 3B PostgreSQL 事务脚本：通过。
- Web / Admin / Docs production build：通过。

## 4. Runtime 与 Migration

- Node.js 24.x、pnpm 11.7.0、Supabase CLI 2.108.0。
- 本地匿名公开读取、登录注册、Follow / Unfollow 与邀请关系 Runtime 通过。
- Mission 3B 初始 Migration 及两条验收修复 Migration 均已部署；本地与远程
  最终为 12/12 对齐。
- 远程公开作者 RPC 使用 publishable key 返回 HTTP 200。
- CLI 在 Migration 已成功应用后出现 pg-delta catalog cache 证书警告；Migration
  列表和远程 RPC 已独立复核，因此不影响数据库结果。

## 5. 文档同步

Roadmap、Project Status、Changelog、Memory、Known Issues、Acceptance Checklist
和 Mission Report 已同步。未修改 Governance、Workflow、Project Rules 或 ADR；
本次是现有 Service / Repository / Supabase 边界内的增量，无需新增 ADR。

## 6. Known Issues / Remaining Risks

- 作者头像 V1 使用显示名首字回退，不含上传与资料编辑，符合本 Mission Out of
  Scope。
- 作者公开显示名由首次 Author grant 时的注册名初始化；后续编辑不在本 Mission。
- 公开作者页当前通过 slug 直达，站内作者发现入口不在本 Mission。
- Supabase SQL 文件沿用历史非 TAP 格式，`supabase test db` 会报告 “No plan
  found”；Mission SQL 已通过容器内 PostgreSQL `ON_ERROR_STOP` 原生执行。
- Git Release Candidate 基线继续由 KI-018 在 Release Readiness 处理。

## 7. 自主工程决策

- 选择独立 `author_profiles`，避免公开读取私有 Profile / 注册身份表；未把
  `owner_user_id` 或草稿暴露给匿名用户。
- 选择唯一复合键和幂等 RPC，而非引入事件系统或计数缓存；改动更小，统计以事实
  关系实时计算，后续可无破坏地增加缓存。
- Invitation Relationship 复用现有 Redemption 唯一约束，不新建重复关系表；
  放弃复杂邀请树、运营统计和全站普通用户可见性。

## 8. Product Handoff / 人工验收清单

1. 打开一个 active Author 的 `/author/{slug}`，确认头像、名称、Bio 与 published
   作品。
2. 未登录点击 Follow，确认进入登录页；登录后回到同一作者页。
3. Follow 后 Followers +1，再 Unfollow 后 -1；刷新后状态一致。
4. 确认 draft Work 不出现；无 published Work 时显示空状态。
5. 用 390px 宽度确认无横向滚动。
6. 确认不存在的 slug 显示 404。

- [x] Create Work、Save Draft、Publish 与 Reader 回读人工验收通过。
- [x] Author Public Profile、Published Only 与 Draft 隔离人工验收通过。
- [x] Follow / Unfollow 与登录回跳人工验收通过。
- [x] Invitation Relationship Foundation 人工验收通过。
- [x] 移动端基础布局人工验收通过。
- [x] Product Owner 于 2026-07-03 确认 `Mission 3B. PASS`。

Mission 3B 正式关闭；Mission 3C 尚未获得开发授权。
