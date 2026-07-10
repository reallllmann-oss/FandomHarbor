# Mission 3C-1 验收报告

Status: PASS — Product Owner Accepted  
Date: 2026-07-03  
Mission: Phase 3C-1 — Search MVP

## 1. 修改文件列表

- Web：`apps/web/src/app/search/*`、`apps/web/src/lib/public-search.ts`、首页与
  Reader 导航搜索入口。
- Service：`packages/services/src/search-domain.ts`、测试与公开导出。
- Repository：`packages/database/src/search-repository.ts`、测试、Migration
  contract 与公开导出。
- Database：`20260703110000_search_mvp.sql`、`phase_3c_search_mvp.sql`。
- Documentation：Roadmap、Project Status、Changelog、Acceptance Checklist、
  Memory、Known Issues、Sprint Plan 与本报告。

## 2. 功能完成情况

- 新增公开 `/search`，未登录用户可使用。
- 使用 GET 表单和 `q` 参数同步关键词；刷新、复制链接和返回均保留查询。
- 支持 Published Work 标题、Work Slug、公开 Author 名称和 Author Slug。
- 结果分为已发布作品与作者；作品结果链接到 Reader Work，作者结果链接到公开主页。
- 完成初始指引、无结果、非法输入、Loading、Error 与恢复入口。
- 添加首页和桌面 Reader Navigation 搜索入口。

## 3. 数据与权限边界

- RPC：`public.search_public_catalog(text, integer)`。
- 只返回 Published Work 元数据及既有公开 Author 字段。
- 仅包含 active Membership 且 Author grant 有效的公开作者与其 Published Work。
- Draft 和未发布 Work 不参与匹配；不返回 `owner_user_id`、注册身份、角色明细或正文。
- 未修改表结构、RLS、Policy、Permission Model、Auth 或技术栈。

## 4. 测试结果

- Web：15 files / 76 tests 通过。
- Database：7 files / 35 tests 通过。
- Services：5 files / 25 tests 通过。
- Auth 13、Admin 2、Config 3、UI 1：通过。
- PostgreSQL Search SQL：匿名标题、Work Slug、Author、空输入和 Draft 隔离通过。

## 5. Runtime / Migration / Validation

- 本地 Supabase 从零应用 13 条 Migration：通过。
- 第 13 条 Migration 已部署远程；本地/远程 13/13 对齐。
- 远程匿名 Search RPC：HTTP 200，并命中已发布 Mission 3A Work 与公开 Author。
- `pnpm validate`：format、lint、typecheck、test、Web/Admin/Docs build 全部通过。
- Web production route 包含 `/search`；P0 = 0，无 Regression、无 TODO。
- Supabase CLI 在 Migration 成功应用后仍出现既有 pg-delta catalog cache
  证书警告；Migration history 与远程 RPC 已独立复核，不影响结果。

## 6. Browser QA

- 未登录打开 `/search`：通过。
- 输入 `Mission` 后 URL 变为 `/search?q=Mission`：通过。
- 标题与公开作者同时返回：通过。
- Work Slug 与 Author Slug 搜索：通过。
- 空结果状态：通过。
- 390×844：无横向溢出，输入框可见，按钮高度 44px。
- Search、Searchbox、Status、Region、Heading 语义可识别；浏览器 Error 为 0。

## 7. 文档同步与 ADR

Roadmap、Project Status、Changelog、Mission Report、Known Issues、Acceptance
Checklist、Memory 与 Sprint Plan 已同步。本 Mission 沿用现有公开数据、Service、
Repository 与 RPC 边界，没有新的永久架构决策，因此无需 ADR。

## 8. Known Issues / Remaining Risks

- KI-023：当前为最多 20 条的普通 contains 查询；目录扩大或延迟升高时再评估索引、
  分页或排序，均不在本 Mission。
- Search 不搜索正文、简介、标签或章节，不做模糊匹配、推荐、历史或 Analytics。
- 只有至少一部 Published Work 的 active Author 会出现在 Author 搜索结果。
- Git Release Candidate 归档仍由 KI-018 在 Release Readiness 处理。

## 9. 人工验收清单

- [x] 未登录可从首页或导航进入 Search。
- [x] Published Work 标题与 Work Slug 搜索正确。
- [x] Author 名称与 Author Slug 搜索正确。
- [x] Draft / 未发布作品不会出现。
- [x] 初始、空结果、Loading 与 Error 状态符合预期。
- [x] URL `q` 参数可复制、刷新和返回。
- [x] 手机宽度、Accessibility 与浏览器 Console 验收通过。
- [x] Product Owner 于 2026-07-03 确认 `Mission 3C-1. PASS`。

Mission 3C-1 正式关闭；Mission 3C-2 Browse Experience 未授权、未开始。
