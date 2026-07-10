# Phase 3 Acceptance

Status: Phase 3 Completed — Product Owner Accepted

## Mission 3C-3 SEO Foundation acceptance

- [x] `sitemap.xml` 与 `robots.txt` 正常生成和访问。
- [x] Sitemap 仅包含 Published Works 与公开 Author，Draft fixture 不存在于结果。
- [x] 站点、Archive、Search、Author 与 Published Work Metadata 完成。
- [x] Title、Description、Canonical、Robots 与 Open Graph 字段正确。
- [x] Draft / 不存在 Work 与 Studio 私有路由输出 noindex。
- [x] 390px 无横向溢出，既有响应式布局未回归。
- [x] 本地/远程 Migration 继续为 14/14 对齐，本 Mission 无 Migration。
- [x] `pnpm validate` 与 Browser QA 通过，Console errors 为 0，P0 为 0。
- [x] Product Owner 于 2026-07-04 完成人工验收并确认 Mission 3C-3 PASS。

工程证据见 [Mission 3C-3 Acceptance Report](MISSION_3C_3_REPORT.md)。

## Phase 3 completion acceptance

- [x] Mission 3A、Mission 3B 与 Mission 3C 全部完成。
- [x] Mission 3C-1 Search MVP、3C-2 Browse Experience、3C-3 SEO Foundation
      全部通过 Product Owner 人工验收。
- [x] Phase 3 已于 2026-07-04 标记 Completed — Product Owner Accepted。
- [x] Release Readiness `RR-1` 未授权、未开始。

## Mission 3C-2 Browse Experience acceptance

- [x] 公开 `/archive` 与 Published Works 列表完成。
- [x] 每页 12 项 Pagination 与四种 Sorting 完成。
- [x] URL `page` / `sort` 同步、分享恢复及越界页纠正完成。
- [x] Draft 与未发布作品隔离测试通过。
- [x] Empty、Loading、Error、Responsive 与 Accessibility 完成。
- [x] 本地/远程 14/14 Migration 对齐，匿名远程 RPC HTTP 200。
- [x] `pnpm validate` 与 Desktop / 390px Browser QA 通过，Console errors 为 0。
- [x] Product Owner 于 2026-07-03 人工验收并确认 Mission 3C-2 PASS。

工程证据见 [Mission 3C-2 Acceptance Report](MISSION_3C_2_REPORT.md)。

## Mission 3C-1 Search MVP acceptance

- [x] 公开 `/search` 页面、搜索输入框与导航入口可用。
- [x] Published Work 标题和 Work Slug 搜索通过。
- [x] 公开 Author 名称和 Author Slug 搜索通过。
- [x] Draft 与未发布作品数据库隔离测试通过。
- [x] URL `q` 参数、初始、Empty、Loading 与 Error 状态完成。
- [x] 390px 无横向溢出，搜索按钮为 44px，语义 Search / Status 通过。
- [x] 本地与远程 13/13 Migration 对齐，匿名远程 RPC HTTP 200。
- [x] `pnpm validate` 全部通过，P0 为零。
- [x] Product Owner 于 2026-07-03 完成人工验收并确认 Mission 3C-1 PASS。

工程证据见 [Mission 3C-1 Acceptance Report](MISSION_3C_1_REPORT.md)。

## Phase 3 acceptance fix mission

- [x] R-01 作者主页入口。
- [x] R-02 作者主页 Published Work 列表。
- [x] R-03 全站登录状态入口。
- [x] R-04 Reader / Archive / 作者主页作者信息。
- [x] A-01 章节标题与发布选择 V1。
- [x] A-02 作品标签新增、移除、替换与校验。
- [x] A-03 Published Work TXT 下载。
- [x] A-04 Studio Draft / Published 真实列表。
- [x] A-05 草稿继续编辑与发布。
- [x] A-06 Chapter 列表、新建、编辑、保存与管理入口；删除因无既有权限保持未开放。
- [x] 本地/远程 11/11 Migration 对齐，新公开作者 RPC HTTP 200。
- [x] `/studio/works` 私有列过滤 P0 已通过 authenticated-only owner-scoped RPC 修复；本地/远程 12/12 Migration 对齐。
- [x] Product Owner 于 2026-07-03 完成人工验收并确认本 Mission PASS。

工程证据与人工验收入口见
[Phase 3 Acceptance Fix Report](PHASE_3_ACCEPTANCE_FIX_REPORT.md)。

## Phase 3A exit criteria

- [x] 3A-0、3A-1、3A-2 工程执行完成。
- [x] 实际产生的 3A-3 格式门禁 P0 已修复并回归通过。
- [x] 工程验收范围内 Beta P0 数量为零。
- [x] 远程注册、登录、Studio、Reader 与关键权限拒绝路径稳定。
- [x] Product Owner 确认 Beta 可以稳定上线。

Product Owner 于 2026-07-02 确认：`Mission 3A. PASS`。

工程证据与人工验收入口见
[Mission 3A Engineering Report & Product Handoff](MISSION_3A_REPORT.md)。

Phase 3B 和 Phase 3C 不阻塞 Beta 上线；各 Sprint 按各自 Acceptance 单独验收。
RR-1 独立于 Phase 3，作为正式发布准备与决策门禁。

## Mission 3B acceptance

- [x] 未登录用户可访问作者公开主页。
- [x] 公开主页只展示 published Work，并覆盖 Empty / Loading / Error / 404。
- [x] Follow / Unfollow、登录回跳与 Followers / Following 计数通过。
- [x] 重复 Follow / Unfollow 保持幂等，禁止 Self Follow。
- [x] Inviter / Invitee 关系与直接邀请计数复用唯一 Redemption 事实源。
- [x] 390px 响应式、语义结构与无横向溢出通过。
- [x] 验收修复后本地与远程 12/12 Migration 对齐，完整 Validation 通过。
- [x] Product Owner 于 2026-07-03 完成人工验收并确认 Mission 3B PASS。

工程证据与人工验收入口见
[Mission 3B Acceptance Report](MISSION_3B_REPORT.md)。

## Universal gates

- [ ] Research, requirements, architecture, database, API and UI artifacts are approved or explicitly N/A with reason.
- [ ] Security, privacy, accessibility, mobile and maintainability reviews pass.
- [ ] Phase-internal Sprints meet `.ai/ACCEPTANCE_CHECKLIST.md`.
- [ ] Memory, ADRs/decisions, detailed docs, known issues and changelog are reconciled.
- [ ] Product owner approves Phase completion.
