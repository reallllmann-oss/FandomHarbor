# Sprint 002B — Reading Experience Foundation / Step 01

## Identity

- Product Phase: Phase 2 — Publishing
- Product outcome: 建立作品详情、章节阅读与独立文章阅读基础
- Approval status: Product Owner 于 2026-06-30 明确批准
- Dependency: Sprint 002A Content Service/Repository 类型与合同
- Known blocker: Sprint 002A 数据库实测因 Public ECR 429/TLS timeout 暂挂，不在本 Sprint 重试

## Mandatory startup gate

- Environment Check: Passed — Web 开发所需 workspace、DNS/TLS、官方 npm registry 正常
- Toolchain Check: Passed — Node、pnpm、Git、Turbo、Vitest、TypeScript 可用
- Version Check: Passed — Node 24.18.0、pnpm 11.7.0、Next.js 16.2.9 符合 Runtime Contract
- Dependency Check: Passed — frozen/offline install；manifest、lockfile 与 workspace 配置未变化

## Scope

### In

- 作品详情页、章节阅读页、独立文章阅读页
- 结构化 JSON 正文的安全 React 渲染
- 上一章/下一章、章节目录
- Light/Dark、字号、行高与阅读宽度基础控制
- `ReaderContentGateway → Content Service → ContentStore` 可替换数据流
- 只读 fixture store、单元测试与 Reader 文档

### Out

- 评论、Kudos、收藏、通知、推荐、阅读历史
- Author Dashboard、编辑器、发布/Revision 工作流
- 新 API、数据库 Schema、权限模型、依赖或远程 Supabase
- Sprint 002A Public ECR 重试

## Workflow evidence

- Research: 复核现有 Reader route、Theme Provider、Reader layout rules 与 002A Content Service/Repository
- Requirement: Product Owner Sprint 002B-Step01 brief
- Architecture: 保持现有 App Router；只新增资源自然子路由，不改变应用边界
- Database: N/A — 不改 schema/migration/RLS，002A 实测状态保持
- API: N/A — 不新增 REST、Server Action、Realtime、Webhook 或 Event
- UI: Reader route、正文、导航与显示变量按 Reader Layout Rules 实现
- Review: 无原始 HTML、无页面直连 provider、无权限旁路、无社区/作者范围漂移

## Acceptance

- [x] 作品详情展示标题、摘要与章节目录。
- [x] 章节页展示标题、正文、上一章/下一章与目录入口。
- [x] 独立文章页展示标题、摘要与正文。
- [x] 阅读页提供 Light/Dark、字号、行高与宽度基础控制。
- [x] 数据经 002A Content Service 合同，fixture 可在一个边界替换。
- [x] Reader gateway 单元测试覆盖列表、导航与 not-found。
- [x] Workspace lint/type/test/build 与浏览器 QA 记录完成；受保护页面的已登录视觉检查待本地身份/数据库 Runtime 可用后补充。

## Verification

- Workspace lint、typecheck、Vitest 与三套 Next.js production build 通过。
- Web Vitest 共 2 个文件、4 个测试通过，覆盖数据流/章节导航/not-found 与结构化正文转义。
- 浏览器确认公共壳与 Light/Dark 切换正常、控制台无错误，未登录访问 `/works` 正确跳转 `/auth/sign-in`。
- 未绕过现有 Membership 门禁；受保护阅读页的已登录浏览器 QA 等待批准的本地身份/数据库 Runtime。
- Sprint 002A 数据库实测阻塞保持原状，本 Step 未调用 `supabase start`、未切换 registry、未连接生产库。

## Rollback

本 Step 只增加/更新 Web route、fixture、样式和文档。回滚删除新增 route/reader helper，并恢复旧作品列表/详情页即可；不涉及数据迁移或远程资源。
