# Project Status

## 当前阶段

Mission RR-1C — PASS（Product Owner Accepted）/ Beta Ready

## 当前状态

`RR-1C 已通过最终人工验收并正式关闭；Release Candidate 达到 Beta Ready`

## 已完成

- Milestone v0.1 已发布到 GitHub。
- Phase 1 Foundation 与 Sprint 002A Website Shell 已完成并归档。
- Auth Boundary、Identity Model、Invitation System、Membership、Role Model、Audit 与 Supabase Boundary 已固化。
- Landing、Reader List、Reader Detail、Reader Shell、Author Empty State、Admin Dashboard、Mock Data 与 Shared Layout 已交付。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 已通过。
- Phase 2 / Sprint 002A brief 已由 Product Owner 批准，四项启动门禁已通过。
- 七张内容表、Migration/RLS/约束/索引、TypeScript Service/Repository 边界、Vitest/SQL 测试和 ADR-019 已完成。
- 全仓 lint、typecheck、Vitest 与三套 Next.js production build 已通过。
- 作品详情、章节阅读与独立文章阅读路由已接入可替换的 `ReaderContentGateway → Content Service → ContentStore` 数据流。
- 结构化正文安全渲染、上一章/下一章、章节目录、Light/Dark、字号、行高与阅读宽度控制已完成。
- Sprint 002B-Step01 单元测试与浏览器公共壳/主题/登录守卫检查已通过。
- Sprint 002B-Step02 已实现版本化 localStorage 阅读偏好、Storage 安全回退和更清晰的章节进度/边界/当前章节状态；全仓门禁与浏览器回归通过。
- Sprint 002B-Step03 已实现本地 work/chapter/article 阅读历史、时间/章节位置记录与作品详情页 Continue Reading；不依赖登录且不写数据库。
- Sprint 002B-Step03 全仓 lint、typecheck、38 个 Vitest、三套 production build 与浏览器公共壳/登录守卫回归通过。
- Sprint 002B-Step04 已实现本地章节/文章书签、当前书签状态和 `/archive` 本地书架；书架聚合书签与最近阅读且不写数据库。
- Sprint 002B-Step04 全仓 lint、typecheck、43 个 Vitest、三套 production build 与浏览器公共壳/书架登录守卫回归通过。
- Sprint 002B-Step05 已完成作品/章节/文章/本地书架空状态与失效链接审计、全局 404/error 恢复路径、阅读控件与书签/书架无障碍打磨。
- Sprint 002B-Step05 全仓 lint、typecheck、43 个 Vitest、三套 production build 与浏览器 404/主题刷新/书架登录守卫回归通过。
- Sprint 002C-Step01 已建立 Studio Service/Store 注入边界、Author fixture 与 `/studio` route tree；全仓门禁和未登录浏览器守卫回归通过。
- Sprint 002C-Step01 草稿章节隔离缺口已修复，Reader published-only 合同覆盖 Work、Article 与 Chapter。
- Sprint 002C-Step01 全仓 lint、typecheck、48 个 Vitest、三套 production build 通过；最小修复后的 Web production build 再次通过。
- Product Owner 于 2026-06-30 确认 Sprint 002C-Step01 工程验收通过。
- Sprint 002C-Step02 已新增 owner-scoped `/studio/works/[workId]` 只读详情、作品元信息、章节摘要、Not Found 边界与 disabled 操作占位。
- Step02 的 owner ID 继续由 TrustedAccessContext 注入；其他作者详情返回 null，Reader published-only 合同保持通过。
- Step02 全仓 lint、typecheck、52 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-06-30 确认 Sprint 002C-Step02 工程验收通过。
- Sprint 002C-Step03 已新增 owner-scoped `/studio/articles/[articleId]` 只读详情、文章元信息、关联信息、Not Found 边界与 disabled 操作占位。
- Step03 的 owner ID 继续由 TrustedAccessContext 注入；其他作者文章详情返回 null，Reader article published-only 合同保持通过。
- Step03 全仓 lint、typecheck、55 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-07-01 确认 Sprint 002C-Step03 工程验收通过。
- Sprint 002C-Step04 已补齐 Studio 空列表、详情级 Not Found、无章节/全草稿章节状态与返回 Studio/列表的恢复路径。
- Step04 继续以 trusted owner、Reader published-only 和 disabled action contract 保持只读边界。
- Step04 全仓 lint、typecheck、58 个 Vitest 与 Web production build 通过。
- Product Owner 于 2026-07-01 确认 Sprint 002C-Step04 工程验收通过。
- Sprint 002C-Step05 已完成 Freeze & Handoff；Step01-Step04 全部 Accepted，Sprint 002C 可正式关闭。
- Studio 当前冻结能力包括首页、Works/Articles 列表、Work/Article 只读详情、空/错误/边界状态、恢复导航、Reader published-only 与 Trusted Identity Contract。
- Phase 2 Architecture Review 已完成：只读架构可维护，但真实写入仍受 owner-only Repository、DB Runtime、正文校验、Revision 与状态机阻塞。
- Product Owner 于 2026-07-01 批准 Sprint 002D Author Creation Experience UI Shell 开发手册；Step01 随后获得独立授权。
- Sprint 002D-Step01 已新增 `/studio/works/new`、客户端表单状态/校验、Category/Tag fixture、封面/loading 占位和 disabled 保存/发布 Action Bar。
- Step01 不包含 Service 写入、Repository、Supabase、Mutation、POST、RPC、SQL 或虚假保存成功状态。
- Step01 全仓 lint、typecheck、64/64 Vitest 与 Web production build 通过；`/studio/works/new` 已进入 production 路由表。
- Product Owner 将 Sprint 002D-Step02 调整为 Create Work Draft Persistence，替代原 Create Article UI Shell，并批准最小词表与原子 RPC 的 Level 3 变更。
- Step02 已新增 5 个 V1 Category、10 个 `additional/canonical` Tag、`create_author_work_draft` RPC，以及 Server Action → Gateway → Service → Repository 写入链路。
- RPC 只允许 active Author，owner 固定为 `auth.uid()`，status 固定为 `draft`，`published_at` 固定为 null；Work 与 `work_tags` 在单一事务内写入。
- `/studio/works/new` 已改为读取数据库 Category/Tag UUID，保存草稿可用并提供 pending/错误/成功状态；Publish 继续 disabled。
- Step02 全仓 lint、typecheck、74/74 Vitest 与 Web production build 通过；生产路由表包含 `/studio/works/new`。
- Local Supabase Runtime Validation 已完成：六条 Migration 从零重建通过，V1 词表重复执行为 0 新增行，Category/Tag 数量为 5/10。
- `phase_2_content_domain.sql` 在真实本地 PostgreSQL 通过，覆盖 Author 创建、anon/Reader 拒绝、非法 Category、deprecated Tag、无部分 Work 与 `works`/`work_tags` 原子性。
- Runtime Validation 发现并修复 RPC 对受限 `id`/`owner_user_id` 列的越权 `INSERT ... RETURNING *`；修复未放宽 grant 或 RLS。
- Sprint 002D-Step02 正式 Accepted；Sprint 002A 数据库实测也已完成。
- Product Owner 将快速上线 V1 下一阶段调整为 Sprint 002E Minimal Draft Editor，优先完成 Write → Save → Publish → Read 闭环。
- Sprint 002E-Step01 已复用 `chapters.content` 建立 owner-only Draft Editor 读取合同和 `/studio/works/[workId]/edit`。
- 编辑页展示真实 draft Work 的 title、summary、category、tags、status 与首个 Chapter 正文；无 Chapter 时提供空 textarea。
- textarea 只在浏览器页面内编辑，保存与发布均 disabled；没有新增 Mutation、RPC、Migration、RLS 或 Schema。
- Create Work Draft 成功后直接跳转新 Work 的编辑路由。
- Sprint 002E-Step01 全仓 lint、typecheck、81/81 Vitest 与 Web production build 通过；production route table 包含 `/studio/works/[workId]/edit`。
- Sprint 002E-Step02 已新增最小 `chapters` 正文更新 grant、owner-only Draft Body Save Server Action、首章创建/同章更新 Repository 路径与成功/失败反馈。
- Step02 不新增 RPC、不修改表结构、不修改 RLS，也不会改变 `work.status`、设置 `published_at` 或触发 Publish。
- Local Supabase `db reset --local --no-seed` 与 `phase_2_content_domain.sql` 真实通过，覆盖 anon/Reader/非 owner 拒绝、owner 更新、首存创建首章、同章更新与 published-only 合同。
- Sprint 002E-Step02 全仓 lint、typecheck、86/86 Vitest 与 Web production build 通过；`/studio/works/[workId]/edit` 保持在 production route table。
- Sprint 002F 已完成最小 Publish Workflow：`/studio/works/[workId]/edit` 现在支持 `save | publish` 双意图提交，发布前会保存当前正文。
- Publish 通过现有 Service/Repository 边界直接更新 `works` 与首章 `chapters` 的 `status/published_at`，不新增 RPC、Migration、Schema 或 RLS。
- Reader 已接入 hybrid published gateway；数据库中的新发布 Work 可立即出现在 `/works`、`/works/[slug]` 与 `/works/[slug]/chapters/[chapterSlug]`，fixture published 内容继续可读。
- Local Supabase reset 与扩展后的 Phase 2 SQL suite 再次真实通过，覆盖 Reader 拒绝发布、owner 发布 draft、空作品首章创建后发布以及 Reader published-only 计数变化。
- Sprint 002F 全仓 lint、typecheck、测试与 Web production build 通过。
- Sprint 002G 已完成 Public Reading 收口：`/articles/[slug]` 现已切换到与 Work/Chapter 一致的 hybrid published gateway。
- Reader 公共读取统一遵循“数据库 published 优先、fixture published 回退”，draft Work、Chapter、Article 均不会泄漏到公开页面。
- Sprint 002G 全仓 lint、typecheck、测试与 Web production build 通过；本 Sprint 无数据库侧变更，因此沿用 Sprint 002F 最近一次真实 Runtime Validation。
- Sprint 002H 已完成 Bookshelf / Library：`/works` 现在作为 Reader Library Hub，整合了继续阅读、最近书签、本地书架摘要与 published 内容浏览。
- `/archive` 继续保持本地书签与最近阅读详情页；`/works` 与 `/archive` 形成“浏览入口 + 回访详情”双入口结构。
- Sprint 002H 新增客户端筛选与 Library 纯逻辑测试；全仓 lint、typecheck、测试与 Web production build 通过。
- Phase 2 人工验收发现的注册 P0 已修复：注册改为注册名、至少 8 位密码和邀请码，登录改为注册名与密码，不再要求或发送邮箱验证。
- `profiles.registration_name` 作为大小写不敏感唯一的站内身份标识；Auth metadata 只承载注册事务输入，不作为会话权限或角色事实源。
- Auth 用户创建 Trigger 在同一事务校验并锁定邀请码，创建 Profile、active Membership、Redemption 与审计记录；失败会回滚 Auth 用户。
- 2026-07-02 本地 Supabase 从零重建、三套 SQL 脚本、真实 Auth 注册/登录、lint、typecheck、完整 Vitest 与 Web/Admin/Docs production build 全部通过。
- Phase 2 Product Handoff 已生成，包含启动方式、入口、QA 账号、路由、建议验收流程、已知限制与人工验收记录。
- 当前本地 Supabase 已准备 `Phase2Reader`、`Phase2Author` 与 QA 邀请码；两组账号通过 Auth API 登录验证，数据库重置后失效。
- Product Owner 已使用远程注册账号 `Auther001` 完成注册名 + 密码登录，并在手工 Author grant 后成功进入 Studio。
- Phase 2 Auth P0 已解除，Phase 2 人工验收状态为 Pass。
- Product Owner 于 2026-07-02 将 Phase 3 调整为 V1 Fast Launch Strategy。
- Phase 3 已重组为 Phase 3A Beta Blocking、Phase 3B Beta Operations 与 Phase 3C
  Beta Polish；原 Sprint 3.10 已迁为独立 Release Readiness `RR-1`。
- 新增 `3B-3 Invitation Relationship`，仅提供 Table、Tree Table 或简单
  Parent / Child 邀请关系，不包含复杂可视化或统计平台。
- Phase 3 Sprint Plan、Phase 文档和 Roadmap 已完成规划同步；未修改业务代码，
  未开始任何 Sprint。
- Product Owner 于 2026-07-02 批准 Mission Authorization v1，并一次性授权
  Mission 3A 的 3A-0、3A-1、3A-2 与必要时的 3A-3。
- Mission 3A 已完成环境与质量门禁、9/9 远程 Migration 对齐、Auth 配置验真、
  远程注册/登录/Studio/Create/Save/Publish/Read、未登录与 Reader 权限拒绝、
  390×844 移动端 QA。
- 全仓格式 P0 已修复；`pnpm validate`、本地 Supabase reset、三套 SQL suite、
  Web/Admin/Docs build 与浏览器回归通过。
- Mission 3A 工程范围内当前 P0 为零。
- Product Owner 于 2026-07-02 确认：`Mission 3A. PASS`。
- Product Owner 已授权并完成 Mission 3B：公开作者主页、Follow / Unfollow 与
  Invitation Relationship Foundation。
- 新增公开作者身份隔离、幂等关注关系、own-only 邀请关系摘要与 published-only
  作者作品读取；未引入通知、推荐、动态流或新的权限模型。
- 本地 10 条 Migration 从零重建、Mission 3B SQL、全仓 Validation 与 Browser QA
  通过；远程第 10 条 Migration 已应用并与本地 10/10 对齐。
- Phase 3 验收修复已补齐公开作者入口、作者作品、全站登录状态、作者信息、TXT 下载及真实 Studio Draft / Published 列表。
- Studio 已开放授权范围内的 Chapter 列表、新建、标题/正文编辑、保存、发布选择和标签关联编辑。
- 新增最小只读 `get_published_work_authors` RPC；仅返回 Published Work 的 `work_slug`、有效 Author `author_slug` 与 `display_name`。
- 第 11 条 Migration 已部署远程，本地/远程 11/11 对齐；远程 RPC HTTP 200。
- `/studio/works` 验收阻塞根因为 Repository 过滤不可读的 `owner_user_id`，导致 PostgreSQL column privilege 错误。
- 新增 authenticated-only `list_my_studio_works` 与 `get_my_studio_work`，只返回 active Author 自有 Draft / Published Work，不暴露 `owner_user_id`。
- 第 12 条 Migration 已部署远程，本地/远程 12/12 对齐；匿名远程调用被 HTTP 401 拒绝。
- Product Owner 于 2026-07-03 完成最终浏览器验收并确认 `Mission 3B. PASS`。
- Create Work、Save Draft、Publish、Reader 回读、Author Public Profile、Published
  Only、Draft 隔离、Follow / Unfollow、登录回跳、Invitation Relationship 与移动端
  基础布局全部通过。
- 验收期间发现的发布链路与 Studio owner-read 问题已修复并复验，不再构成阻塞。
- 2026-07-03 再次执行 `pnpm validate` 通过；本地数据库与远程数据库均为 12/12
  Migration，当前已知 P0 为零。
- Mission 3C-1 新增公开 `/search`、GET URL 参数同步、Published Work 标题/Slug
  与公开 Author 名称/Slug 搜索，以及初始、Empty、Loading、Error 状态。
- Search RPC 只返回 Published Work 与既有公开 Author 字段；Draft、私有 owner、
  注册身份和正文不进入结果，未修改 RLS、Permission Model 或 Auth。
- 本地第 13 条 Migration 从零应用和 Search SQL 通过；远程部署后本地/远程
  13/13 对齐，匿名 RPC HTTP 200。
- `pnpm validate`、桌面与 390px Browser QA 通过；浏览器 Error 为 0。
- Product Owner 于 2026-07-03 完成 Search、Published Work / Slug、Author /
  Author Slug、Draft 隔离、URL、状态、响应式、Accessibility 与 Console 人工验收，
  确认 `Mission 3C-1. PASS`。
- Mission 3C-2 已完成公开 `/archive`、Published Works 分页、最新/最早/标题排序、
  `page` / `sort` URL 恢复、越界页纠正及 Empty / Loading / Error 状态。
- Browse RPC 仅返回 Published Work 与既有公开 Author 字段，Draft、owner 与注册身份
  不进入结果；未修改表结构、RLS、Permission Model 或 Auth。
- 本地从零重建与 Browse SQL 通过；第 14 条 Migration 已部署远程，本地/远程
  14/14 对齐，匿名 RPC HTTP 200。
- `pnpm validate`、桌面与 390px Browser QA 通过；162 项测试通过，Console Error
  为 0，P0 为 0。
- Mission 3C-3 已完成 `sitemap.xml`、`robots.txt`、站点级 Metadata、Canonical、
  Open Graph，以及 Archive、Search、Author 与 Published Work 页面 Metadata。
- Sitemap 只包含 Published Works 与其公开 Author；Draft 直接访问输出
  `noindex, nofollow`，Studio 私有路由同样保持不可索引。
- 未新增 Migration、RLS、权限模型、第三方依赖或架构；本地/远程 Migration
  继续为 14/14 对齐。
- `pnpm validate`、桌面与 390px Browser QA 通过；167 项测试通过，Console Error
  为 0，P0 为 0。
- Product Owner 于 2026-07-04 完成 Mission 3C-3 最终人工验收并确认 PASS；
  Sitemap、Robots、Published-only、Author / Work 收录、Metadata、Canonical、
  Open Graph、Draft noindex、Browser QA、Console 与 Responsive 全部通过。
- Mission 3C-3 正式关闭；Mission 3A、Mission 3B 与 Mission 3C 均已完成验收，
  Phase 3 状态为 Completed（Product Owner Accepted）。
- Mission RR-1A 已完成 Runtime、Migration、Validation、Build、Documentation 与
  Project Structure Audit，并建立 Release Checklist 与 Browser QA Checklist。
- 本地 Supabase 已从零应用 14 条 Migration；六套 SQL、local schema lint 与
  Local / Remote 14/14 parity 通过。
- `pnpm validate` 全绿，167 项测试及 Web / Admin / Docs build 通过；P0 为零。
- Known Issues 已按 RR-1B、RR-1C、Go / No-Go 产品决策、Beta 限制与未来功能分类。
- Mission RR-1B 已完成 Production Deployment 并通过 Product Owner 最终人工验收。
- Production URL、HTTPS、Environment Variables、Production Build、首页、Archive、
  Search、Author、Published Work、`/sitemap.xml`、`/robots.txt`、Metadata、
  Canonical、Open Graph、Browser Smoke、Console、Network 与 Responsive Layout
  均通过验收。
- Mission RR-1B 正式关闭；随后 RR-1C Release Candidate 已获授权并完成工程收口。
- Mission RR-1C 已完成 Final Runtime Audit、Final Validation Audit、Final Browser
  QA、Final Mobile QA、Final Documentation Audit、Final Known Issues Review、Final
  Release Checklist 与 Beta Ready Checklist。
- 本地 Supabase clean rebuild 从零应用 14 条 Migration；本地/远程 Migration
  history 14/14 对齐；六套 SQL suites 与 local schema lint 通过。
- `pnpm validate` 全绿，167 项测试及 Web / Admin / Docs build 通过；P0 为零。
- 桌面与 390×844 移动端 QA 均通过；未登录正文与 Studio 守卫符合当前权限模型。
- Product Owner accepted Release Candidate baseline 为
  `8495bded5e0c78985be7410cceb902cd2c090421`。
- RR-1C 最终验收发现 local clean rebuild 后 Auth Users 为空；localhost-only
  QA Fixture 已完成工程修复，能够幂等恢复 Reader、Author、active Membership、
  Author grant/profile 与 Invitation Redemption。
- Fixture clean rebuild recovery、Reader/Author 登录、Reader Access、Author Public
  Profile、Author Studio 与 Reader Studio 拒绝路径已通过浏览器验证，Console Error 为 0。
- Product Owner 于 2026-07-11 完成最终人工验收并确认 Mission RR-1C PASS。
- QA Fixture 验收完成；Author / Reader 权限链路人工验证通过。
- Reader 访问 `/studio` 自动重定向 `/archive`；Release Candidate 达到 Beta Ready。
- Product Owner accepted Release Candidate baseline:
  `8495bded5e0c78985be7410cceb902cd2c090421`。

## 当前阻塞

- Phase 2 当前无 P0 阻塞。
- Mission 3A 无剩余工程 P0，Beta Blocking 已解除。
- Mission 3B 已正式关闭，无已知工程 P0。
- Mission 3C-1 已正式关闭，无已知工程 P0。
- Mission 3C-2 已正式关闭，无已知工程 P0。
- Mission 3C-3 已正式关闭，无已知工程 P0。
- Phase 3 已完成 Product Owner 验收，无剩余 Phase 3 阻塞。
- Mission RR-1A 发布准备基线已完成。
- Mission RR-1B 已正式关闭，无已知工程 P0。
- Mission RR-1C 已正式关闭，无已知 P0；Release Candidate 为 Beta Ready。
- KI-018 Release Candidate Git 基线已由 RR-1C 处理。
- KI-027 Moderate PostCSS advisory、KI-029 CI 缺口与 KI-030 Supabase dry-run
  临时角色认证已作为 Beta accepted risks 分类，需在后续 Go / No-Go 或未来数据库部署前复核。

## Product Owner 人工验收结论

- Phase 2：Pass。
- 作者后台与读者后台已手动检查，暂未发现其他明显问题。
- 同一远程验收环境已完成：九条 Migration → Email Confirm 关闭 → 真实注册 → 注册名/密码登录 → 手工 Author grant → 成功进入 Studio。
- Phase 2 Auth P0 已解除。
- Product Owner 已批准 Phase 3 Fast Launch 治理方向和文档更新。
- Mission 3C-1、3C-2、3C-3 均已完成 Product Owner 验收，Mission 3C 正式关闭。
- Mission 3A：PASS。
- Mission 3B：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-1：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-2：PASS — Product Owner Accepted（2026-07-03）。
- Mission 3C-3：PASS — Product Owner Accepted（2026-07-04）。
- Phase 3：Completed — Product Owner Accepted（2026-07-04）。
- Mission RR-1A：Release Preparation Baseline Complete。
- Mission RR-1B：PASS — Product Owner Accepted（2026-07-07）。
- Mission RR-1C：PASS — Product Owner Accepted / Beta Ready（2026-07-11）。
- Mission RR-1C QA Fixture：PASS — Product Owner Accepted（2026-07-11）。
- Phase 1 的数据库实测与产品验收记录仍需在独立流程中补齐，但不阻塞 v0.1 文档归档。
- 已登录 Author / Reader 的远程浏览器主链路已由 Product Owner 完整复验通过。

## 未完成

- Create/Edit Article、Work/Chapter Delete 与 Rich Text Editor。
- Revision 与状态机。
- 将 Reader fixture `ContentStore` 替换为真实 Supabase Repository（待 Sprint 002A 数据库实测恢复后另行批准）。
- 章节发布选择与标签替换的原子 RPC（本 Mission 未获授权）。
- 实现 Reader 登录流与 Dashboard 实时数据。

## 下一步

- 当前无 active Mission。
- 未获明确授权前不执行 Go / No-Go、不创建 Git tag、不进行发布动作、不进入
  UI Polish、Design Intelligence 或新 Mission。

## 最后更新

2026-07-11

- Product Owner confirmed Mission RR-1C PASS.
- QA Fixture and Author / Reader permission chains are accepted.
- Reader `/studio` redirects to `/archive`; Release Candidate is Beta Ready.
- Mission RR-1C is formally closed; no next Mission or release action is authorized.

- RR-1C local QA Fixture repair engineering complete.
- Local clean rebuild recovery, Reader/Author login and permission Browser QA pass.
- Credentials remain in a Git-ignored mode-0600 local file; no production change.

- Mission RR-1C Release Candidate engineering complete.
- Final Runtime, Migration, SQL, Validation, Browser QA, Mobile QA and
  Documentation audits pass with P0 at zero.
- Product Owner accepted Release Candidate baseline:
  `8495bded5e0c78985be7410cceb902cd2c090421`.
- Beta Ready Checklist and Release Candidate Report are created.
- Mission RR-1C is Product Owner Accepted and closed.

2026-07-07

- Product Owner confirmed `Mission RR-1B. PASS` after final Production
  Deployment acceptance.
- Accepted Production URL, HTTPS, Environment Variables, Production Build, Home,
  Archive, Search, Author, Published Work, Sitemap, Robots, Metadata, Canonical,
  Open Graph, Browser Smoke, Console, Network and Responsive Layout.
- Mission RR-1B is formally closed. RR-1C Release Candidate remains unauthorized
  and unstarted.

2026-07-04

- Mission RR-1A Release Preparation engineering completed with Runtime,
  Migration, Validation, Build, Documentation and Project Structure audits.
- Clean local rebuild, six SQL suites, local schema lint, local/remote 14/14
  migration parity and `pnpm validate` pass with P0 at zero.
- Release and Browser QA checklists are established; Known Issues are classified.
- RR-1A established the preparation baseline; RR-1B was later accepted and RR-1C
  remains unstarted.

- Product Owner confirmed `Mission 3C-3. PASS` after final Sitemap, Robots,
  Published-only, Author/Work inclusion, metadata, canonical, Open Graph,
  Draft-noindex, responsive, browser and clean-console acceptance.
- Mission 3C-3 and Mission 3C are formally closed. Phase 3 is Completed —
  Product Owner Accepted.
- RR-1 remains unauthorized and unstarted.

- Mission 3C-3 SEO Foundation engineering completed with sitemap, robots,
  canonical URLs, Open Graph and route-specific public metadata.
- Sitemap and metadata reuse existing Published-only read boundaries; Draft and
  Studio routes are noindex. No migration or permission change was introduced.
- Local/remote Migration histories remain 14/14 aligned; full validation and
  desktop/390px Browser QA pass with 167 tests, zero console errors and P0 at zero.
- Mission 3C-3 now awaits Product Owner acceptance; RR-1 was not started.

- Product Owner confirmed `Mission 3C-2. PASS`; Browse Experience is accepted
  and formally closed.
- Archive, Published-only isolation, pagination, four sorts, URL restoration,
  boundary correction, all page states, responsive layout, accessibility,
  Browser QA and clean console were accepted.
- Mission 3C-3 is named SEO Foundation and remains unauthorized and unstarted.

- Mission 3C-2 Browse Experience engineering completed with public
  published-only Archive pagination, deterministic sorting and shareable URL
  state.
- Local/remote Migration histories are 14/14 aligned; full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 was subsequently accepted; Mission 3C-3 was not started.

- Product Owner confirmed `Mission 3C-1. PASS`; Search MVP is accepted and closed.
- Mission 3C-2 was subsequently authorized under its approved Browse Experience brief.

- Mission 3C-1 Search MVP engineering completed with public Published Work and
  Author title/name/slug matching, URL synchronization and complete page states.
- Local/remote Migration histories are 13/13 aligned; full validation and
  desktop/390px Browser QA pass with P0 at zero.
- Mission 3C-2 is Product Owner accepted and closed.

- Product Owner confirmed `Mission 3B. PASS`; Mission 3B is accepted and closed.
- Final validation passes, P0 is zero, and local/remote Migration histories are
  12/12 aligned.
- `main` and `origin/main` point to the same commit, while the accepted Phase 2
  through Mission 3B implementation remains uncommitted under KI-018.
- Mission 3C startup check is complete. Its existing Roadmap scope is Level 2;
  development remains prohibited until formal authorization.

- Phase 3 Reader / Author Studio acceptance fixes engineering complete.
- Remote and local migration histories are 12/12 aligned; the public Author and
  owner-scoped Studio read RPCs are deployed.
- Product Owner browser acceptance completed and passed on 2026-07-03.

- Mission 3B Social Relationship Foundation engineering completed.
- Added public Author Profile, idempotent Follow / Unfollow and own-only
  Invitation Relationship summary contracts.
- Local rebuild, SQL Runtime, full `pnpm validate`, Browser QA and remote 10/10
  Migration parity passed.
- Mission 3B now waits for one Product Owner acceptance; Mission 3C and RR-1 were
  not started.

- Product Owner updated Phase 3 governance to the V1 Fast Launch Strategy.
- Reorganized the roadmap into Phase 3A Beta Blocking, Phase 3B Beta Operations,
  Phase 3C Beta Polish and independent Release Readiness.
- Renumbered current references to `3A-*`, `3B-*`, `3C-*` and `RR-1`, with legacy
  number mapping preserved in the Fast Launch plan.
- Added planned `3B-3 Invitation Relationship`.
- No Sprint was started and no business code was changed.

- Product Owner accepted Sprint 002C-Step03 on 2026-07-01.
- `/studio/articles/[articleId]` read-only Article Detail passed engineering acceptance; owner ID comes only from `TrustedAccessContext.identity.id`, while other-author and unknown article IDs return Not Found.
- Reader remains published-only and every article write entrypoint remains disabled.
- Full workspace lint/typecheck, 55/55 Vitest tests and Web production build pass.
- package.json, pnpm-lock.yaml and Supabase configuration remain unchanged; Supabase was not executed and DB Runtime remains pending.
- Sprint 002C-Step04 engineering implementation completed with explicit Studio empty, Not Found, no-chapter and draft-only chapter states plus safe recovery navigation.
- Full workspace lint/typecheck, 58/58 Vitest tests and Web production build pass; Reader remains published-only and all write entrypoints remain disabled.
- Product Owner accepted Sprint 002C-Step04 on 2026-07-01 after the empty/error/boundary-state review and forced verification passed.
- Sprint 002C-Step05 Freeze & Handoff is complete; Sprint 002C is frozen and can be formally closed.
- Sprint 002D-Step01 Create Work UI Shell engineering implementation is complete with client-only validation, fixture metadata and disabled save/publish actions.
- Product Owner authorized Sprint 002D-Step02 Create Work Draft Persistence and the minimal V1 taxonomy/RPC Level 3 changes.
- Step02 engineering now includes database-backed metadata reads and atomic draft persistence; Publish remains disabled.
- Full workspace lint/typecheck, 74/74 Vitest tests and Web production build pass.
- Local Supabase rebuild, all six Migrations, V1 taxonomy idempotence and the full Phase 2 transactional SQL suite pass.
- Sprint 002D-Step02 and Sprint 002A database validation are Accepted; Runtime Pending is removed.
- Sprint 002E-Step01 Minimal Draft Editor read contract and UI shell are engineering complete; full verification is recorded in the Sprint document.
- Sprint 002E-Step02 Draft Body Save is complete: owner Authors can save draft body content into the first Chapter, first save creates a default Chapter, Publish remains disabled, and no new RPC/schema/RLS change beyond the minimal Chapter body grant was introduced.
- Full workspace lint/typecheck, 86/86 Vitest tests, Web production build, local Supabase migration reset and the Phase 2 SQL suite pass on the current files.
- Sprint 002F Minimal Publish Workflow is complete: owner Authors can publish their own draft Work from the draft editor, Reader can immediately read the published chapter page, and the existing published-only contract remains intact.
- Full workspace lint/typecheck, full Vitest, Web production build, local Supabase reset and the extended Phase 2 SQL suite pass on the current files.
- Sprint 002G Public Reading is complete: `/articles/[slug]` now uses the same hybrid published gateway as the Work routes, Reader public reads consistently prefer database-backed published content, and draft content remains isolated.
- Full workspace lint/typecheck, full Vitest and Web production build pass on the current files; no new database-side validation was required because 002G introduced no Migration, RPC, RLS or schema change.
- Sprint 002H Bookshelf / Library is complete: `/works` now acts as the Reader Library Hub with local shelf summaries, continue-reading, latest-bookmark shortcuts and minimal client-side filtering over published content.
- Full workspace lint/typecheck, full Vitest and Web production build pass on the current files; no new database-side validation was required because 002H introduced no Migration, RPC, RLS or schema change.
