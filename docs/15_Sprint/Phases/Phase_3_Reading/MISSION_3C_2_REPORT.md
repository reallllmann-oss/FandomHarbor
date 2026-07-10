# Mission 3C-2 验收报告

Mission: Phase 3C-2 — Browse Experience  
Status: PASS — Product Owner Accepted  
Date: 2026-07-03

## 修改文件

- `apps/web/src/app/archive/page.tsx`
- `apps/web/src/app/archive/loading.tsx`
- `apps/web/src/app/archive/error.tsx`
- `apps/web/src/lib/public-browse.ts`
- `packages/services/src/browse-domain.ts`
- `packages/services/src/browse-domain.test.ts`
- `packages/services/src/index.ts`
- `packages/database/src/browse-repository.ts`
- `packages/database/src/browse-repository.test.ts`
- `packages/database/src/browse-migration-contract.test.ts`
- `packages/database/src/index.ts`
- `packages/ui/src/components/layouts.tsx`
- `supabase/migrations/20260703120000_browse_experience.sql`
- `supabase/tests/phase_3c_browse_experience.sql`
- 本报告及 Phase 3 状态、Roadmap、Changelog、Acceptance、Memory、Known Issues 文档。

## 功能完成情况

- `/archive` 已成为未登录用户可访问的 Published Works 浏览入口。
- 支持每页 12 项的上一页、下一页分页和最新、最早、标题 A–Z、标题 Z–A 排序。
- 页码与排序写入 URL，可分享并恢复；越界页自动纠正到最后一页。
- Draft 与未发布作品不进入 Archive，公开响应不包含 owner 或注册身份字段。
- 已提供 Empty、Loading、Error 恢复状态、作者入口、响应式布局和语义化控件。
- 保留原有本地 Reader Shelf，不改变既有阅读历史与书签能力。
- Mission 3C-3 未开始。

## 工程决策

- 复用既有 Service → Repository → Supabase RPC 边界，选择最小只读 RPC，而非新增框架或搜索基础设施。
- 使用 offset 分页和确定性次级 ID 排序，改动小且满足 Beta 可分享 URL；未采用无限滚动或 cursor pagination。
- 沿用既有公开 Author 有效性规则，不新增权限模型、Auth 架构或表结构。
- 未新增 ADR：本 Mission 仅复用既有架构模式，没有永久性架构方向变更。

## 测试与 Validation

- `pnpm validate`: PASS。
- Format、Lint、Typecheck: PASS。
- Vitest: 162 tests PASS（Services 29、Database 38、Web 76、Auth 13、Admin 2、Config 3、UI 1）。
- Production Build: Web、Admin、Docs 全部 PASS；`/archive` 出现在 Web production route table。
- Mission SQL: PASS，覆盖匿名读取、分页、排序及 Draft 隔离。
- 未完成 TODO / FIXME: 0。
- P0: 0。

## Runtime 与 Migration

- Runtime: Node v24.18.0、pnpm 11.7.0、Supabase CLI 2.108.0。
- Local Supabase 从零重建 14 条 Migration: PASS。
- Migration `20260703120000_browse_experience.sql` 已部署远程。
- Local / Remote Migration: 14 / 14 对齐。
- 远程匿名 `browse_public_works` RPC: HTTP 200。
- Supabase CLI 在成功应用后仍出现既有 catalog cache certificate warning；远程 Migration 列表和匿名 RPC 已独立复核，不影响结果。

## Browser QA

- 未登录访问 `/archive`: PASS。
- 13 条 Published fixture 分为 12 + 1 两页，Draft fixture 不可见: PASS。
- 下一页 URL、标题排序、直接分享 `page + sort` URL 恢复: PASS。
- 页码 99 自动纠正至最后一页: PASS。
- 390 × 844 viewport: `clientWidth = scrollWidth = 390`，无横向溢出。
- 排序控件、提交按钮和分页链接可通过可访问名称定位。
- Browser console errors: 0。

## 文档同步

- 已同步 Project Status、Roadmap、Changelog、Mission Report、Acceptance、Memory 与 Known Issues。
- 未修改 Governance、Workflow、Project Rules 或技术栈。

## Known Issues

- KI-024：offset pagination 在浏览期间发生新发布时可能移动跨页边界；Beta 接受，若目录规模或一致性要求提高再评估 cursor pagination。
- KI-017、KI-018、KI-019 与 KI-023 等既有非 P0 项保持开放。

## Remaining Risks

- 当前分页依赖数据库实时快照；并发发布可能令后续页内容位置变化，但稳定次级排序保证相同数据集内顺序确定。
- 本 Mission 未执行部署前端 URL smoke test；该项仍归 Release Readiness 的 KI-017。
- 工作树仍由 KI-018 管理，`main` 与 `origin/main` 指向同一 commit，但已验收/待验收实现尚未形成 Release Candidate commit。

## Product Handoff / 人工验收清单

- [x] 未登录打开 `/archive`，确认 Published Works 正常显示。
- [x] 确认 Draft 与未发布作品不显示。
- [x] 验证下一页、上一页与越界页纠正。
- [x] 分别验证最新、最早、标题 A–Z、标题 Z–A。
- [x] 复制带 `page`、`sort` 的 URL，在新标签页恢复相同状态。
- [x] 验证无数据、Loading、Error 恢复状态。
- [x] 验证桌面和移动端布局、键盘操作与可访问名称。
- [x] 确认浏览器 Console 无异常。
- [x] Product Owner 于 2026-07-03 确认 PASS。

Mission 3C-2 已通过 Product Owner 人工验收并正式关闭。Mission 3C-3 SEO
Foundation 未授权、未开始。
