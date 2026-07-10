# Project Memory

- 2026-07-11: RR-1C Product Owner acceptance found local Auth users empty after a
  clean rebuild. A localhost-guarded, idempotent QA fixture now restores synthetic
  Reader/Author identities, active Memberships, Author grant/profile and invitation
  redemption. Credentials remain only in Git-ignored `.local/qa-fixture.json` mode
  `0600`; `qa:web` injects local runtime values without overwriting `.env.local`.
  Clean rebuild recovery, both logins, Reader access, Author profile/Studio, Reader
  Studio denial and zero-error browser console all pass. RR-1C remains awaiting
  Product Owner final acceptance.

- 2026-07-10: Mission RR-1C Release Candidate engineering completed. Final
  Runtime, local/remote Migration parity, clean local rebuild, six SQL suites,
  schema lint, `pnpm validate`, desktop Browser QA, 390×844 Mobile QA,
  Documentation Audit, Known Issues Review and Beta Ready Checklist all pass with
  P0 at zero. Release Candidate Git baseline is `final RR-1C Git HEAD（见最终 handoff）`. No new
  feature, migration, dependency, permission model, framework, workflow or
  governance change was introduced. RR-1C awaits Product Owner final acceptance.

- 2026-07-07: Product Owner confirmed `Mission RR-1B. PASS` after final
  Production Deployment acceptance. Production URL, HTTPS, Environment Variables,
  Production Build, Home, Archive, Search, Author, Published Work, Sitemap,
  Robots, Metadata, Canonical, Open Graph, Browser Smoke, Console, Network and
  Responsive Layout all passed. Mission RR-1B is formally closed. RR-1C Release
  Candidate remains unauthorized and unstarted.

- 2026-07-04: Mission RR-1A Release Preparation engineering completed. Runtime
  Contract, frozen dependencies, clean 14-migration local rebuild, six SQL suites,
  local schema lint, local/remote 14/14 parity, 167-test validation, all builds,
  documentation and project structure pass with P0 at zero. Release and Browser QA
  checklists now exist. KI-027 through KI-030 record dependency, workspace-root, CI
  and Supabase preflight risks. RR-1A established the preparation baseline later
  carried into RR-1B deployment acceptance.

- 2026-07-04: Product Owner confirmed `Mission 3C-3. PASS` after final Sitemap,
  Robots, Published-only, Draft exclusion/noindex, Author/Work/Archive/Search,
  metadata, canonical, Open Graph, responsive, Browser QA and clean-console
  acceptance. Mission 3C-3 and Mission 3C are formally closed. Phase 3 is
  Completed — Product Owner Accepted. RR-1 remains unauthorized and unstarted.

- 2026-07-03: Mission 3C-3 SEO Foundation engineering completed. Public
  `sitemap.xml`, `robots.txt`, canonical URLs, Open Graph and route metadata now
  cover site, Archive, Search, Published Works and public Authors. Sitemap and
  metadata reuse existing Published-only boundaries; Draft and Studio routes are
  noindex. No Migration, permission or Auth change was introduced. Local/remote
  histories remain 14/14 aligned; validation and desktop/390px Browser QA pass
  with 167 tests, zero console errors and P0 at zero. Awaiting Product Owner
  acceptance; RR-1 was not started.

- 2026-07-03: Product Owner confirmed `Mission 3C-2. PASS` after final Archive,
  Published-only isolation, pagination, four-sort, URL recovery, state,
  responsive, accessibility and clean-console acceptance. Mission 3C-2 is
  formally closed. Mission 3C-3 is named SEO Foundation and remains
  unauthorized and unstarted.

- 2026-07-03: Mission 3C-2 Browse Experience engineering completed. Public
  `/archive` now provides published-only pagination, four deterministic sorts,
  shareable URL state, complete page states and responsive accessibility. Local
  rebuild, Mission SQL, remote 14/14 Migration parity, `pnpm validate` and
  desktop/390px Browser QA pass with P0 at zero. Mission 3C-2 awaits Product
  Owner acceptance; Mission 3C-3 was not started.

项目名称：
Fandom Harbor

项目目录名：
FandomHarbor

项目类型：
升级版 AO3 私域作品归档站

核心角色：

1. Super Admin 超级管理员
2. Admin 管理员
3. Author 作者
4. Reader 读者

访问规则：
半公开。
未认证用户可以看到介绍页，但不能查看正文。
通过邀请码后可以进入站内。
第一版统一为：通过门禁后可看站内内容。
作者权限只能由管理员手动开通。

内容类型：

- 长篇小说
- 短篇小说
- 随笔
- 图片
- 外部链接
- PDF
- EPUB

以上是产品规划能力，不代表全部进入 MVP。首发格式范围由 KI-003 确认；建议先完成安全、可靠的文本作品闭环。

作者系统：
作者可以有多个笔名 / 马甲。
真实账号在后台可见。
读者只看到作者选择展示的笔名。

AO3 核心功能：

- 自由标签 + 管理员规范化
- CP / 关系标签
- 作品分级
- 可选预警
- 搜索筛选
- 评论
- 回复评论
- 匿名评论
- Kudos
- 收藏
- 推荐

不做：

- 私信
- 关注作者
- 粉丝系统
- 社交动态
- 转发
- 公开社交排行榜

邀请码：
作者可以生成邀请码。
邀请码可以限制有效期和可用次数；当前 Phase 1C 不允许邀请码携带或授予角色权限。
管理员可以撤销邀请码。
邀请码必须形成邀请链。
邀请码只能控制进入门禁的范围，不能自动授予 Author、Admin 或 Super Admin。

举报系统：
超级管理员和管理员收到举报。
作者也知道有人举报。
举报必须填写理由。
举报可以上传截图。
后台需要有处理流程：
待处理 / 处理中 / 已驳回 / 已处理。

版本管理：
作品修改保留历史版本。
可以查看 Diff。
管理员可以恢复旧版本。

数据面板：
管理员后台需要展示：

- 阅读人数
- 阅读次数
- 收藏数
- Kudos
- 评论数
- 推荐数
- 阅读来源
- 热门标签
- 热门 CP
- 活跃作者
- 新增作品

最重要的产品优化目标：

1. UI 比 AO3 更现代
2. 移动端体验比 AO3 更好
3. 阅读体验比 AO3 更好

固定技术栈：

- Next.js App Router + TypeScript
- Supabase + PostgreSQL
- Tailwind CSS + shadcn/ui
- TipTap
- Zod + React Hook Form
- TanStack Query
- Lucide Icons
- Vercel

应用边界：

- apps/web：访客、读者、作者
- apps/admin：管理员、超级管理员
- apps/docs：未来只读项目文档在线浏览入口；根目录 docs 与 .ai 仍是唯一事实源
- 共享实现进入职责明确的 packages，不使用 apps/shared

共享包边界：

- ui、editor、auth、database、services、types、constants、config、utils

文档结构：

- 与产品负责人的沟通默认使用简体中文；正式产品文档使用中文内容，文件名保持英文
- 数据库、代码、API、变量和目录命名使用英文；不为统一语言而翻译已有文档
- `.ai/LANGUAGE_POLICY.md` 是每次新会话的强制启动上下文
- `.ai/ENVIRONMENT_POLICY.md` 是每次新会话的强制启动上下文；环境问题不等于产品、架构或 Sprint 失败
- 环境问题发生后停止操作、记录并汇报；同一根因仅允许一次经 Product Owner 批准的受控重试，重试失败后必须停止
- `.ai/WORKFLOW.md` 是每次新会话的强制启动上下文，定义 Tech Lead 自主决策与必须升级审批的边界
- 从 Sprint 002E 起，Codex 可在完成 Sprint/Step 后自动更新 Product Owner 指定的 README、Sprint、Architecture 与 `.ai` 路径，记录有证据的状态、验收、验证、边界、风险和下一步；最终报告必须披露自动记录文件与 Level 3 状态。
- 自动文档权限不授权业务代码、依赖、package/lockfile、Migration/RLS/SQL/RPC、权限模型、发布、上传/存储、删除、生产部署、技术栈或大范围重构。
- 每个 Sprint 必须先完成 Environment Check → Toolchain Check → Version Check → Dependency Check，全部通过后才能开发
- 环境问题必须优先查明根因，不得把重试当作第一处理动作
- Runtime Contract：Node.js 24.x LTS、当前批准版本 24.18.0、NVM、pnpm 11.7.0、官方 npm registry
- 本地、Codex、CI、Git Hooks、Playwright、Vercel 必须从环境层遵守同一运行时；工具只能检查，不能切换 Node
- docs 使用 00_Project 到 18_Research 的冻结数字分类
- 05_UI 描述体验，06_Design_System 定义复用规则，07_Component 定义实现契约
- 03_Database 使用 ERD/Migration/Policies/RLS/Seed/Indexes/Lifecycle 注册
- 04_API 使用 REST/ServerActions/Realtime/Webhooks/Events/Errors/Contracts 分类
- 17_Architecture_Decisions 保存永久 ADR，.ai/DECISIONS 保存精简记忆
- Phase 是产品阶段，Sprint 是 Phase 内工程执行单位
- 当前 Product Phase Roadmap 为 Phase 0、0.5、0.6、1–8

架构方向：

- 模块化单体，不提前拆微服务
- React Server Components 优先
- 服务端权限校验 + PostgreSQL RLS 双层强制
- TipTap JSON 为文本内容源，版本不可变，HTML/纯文本为派生数据
- RuntimeConfig、Auth provider、Database/Repository 与 ObjectStorage 是平台隔离边界；页面不得直接读取 `process.env` 或调用 Supabase client
- 当前 V1 身份方案为注册名/password：注册必须同时提供有效邀请码，密码至少 8 位，不要求用户邮箱或邮箱验证；active Membership 继续派生 Reader capability。
- Author/Admin/Super Admin 只允许手工授权与撤销；邀请兑换不得提权，所有安全关键变更必须审计

开发状态：

- Phase 0 Project OS 已完成
- Phase 0.5 Freeze Product Blueprint 已完成
- Phase 0.6 Product Freeze Review 已批准并冻结
- Phase 1 Sprint 1 Project Foundation 已完成
- Phase 1C Identity Access Core 工程实现完成：平台边界、Auth、Invitation、Membership、Role Grant、Audit、RLS、Web/Admin 壳层与测试已写入
- Sprint 002A Website Shell 已完成：Landing、Reader List/Detail、Reader Shell、Author Empty State、Admin Dashboard、Mock Data 与 Shared Layout 已交付
- Milestone v0.1 已发布到 GitHub，当前仓库基线固定为 Phase 1 Foundation + Sprint 002A Website Shell
- Frozen install、Type、Lint、Test、Build 已通过；Supabase CLI、Docker 与本地 Runtime 可用。
- 未创建 Supabase/Resend/Vercel 云资源，未配置生产 SMTP，未建立生产 Super Admin
- Phase 2 / Sprint 002A Content Domain Foundation 已于 2026-06-30 获 Product Owner 明确批准并开始：只建立 works/chapters/articles/category/tag 的 Migration、RLS、TypeScript 边界、测试与文档
- Phase 2 内容读取继续受 active Membership 门禁保护；Author 所有权与 Admin/Super Admin 管理复用 Phase 1 `role_grants`，不建立第二套权限体系
- `owner_user_id` 是隐藏的授权字段而非公开署名；公开 Pen Name/authorship 仍属于后续独立模型
- Sprint 002A 工程与数据库验证均已通过：ordered Migrations 可从零重建，Phase 2 事务 SQL 权限脚本通过。
- Sprint 002B-Step01 已完成作品详情、章节阅读、独立文章阅读、结构化正文渲染、章节导航与基础阅读显示控制；页面继续复用 Phase 1 Membership 门禁
- Reader 数据经 `ReaderContentGateway → Content Service → ContentStore`，当前只读 fixture 可在单一边界替换为后续 Supabase Repository
- Sprint 002B 未重试 Supabase、未连接远程生产库，也未新增依赖、权限体系、社区能力、推荐或作者后台
- Sprint 002B-Step02 使用 `fandom-harbor.reader-preferences.v1` 在当前浏览器保存 Light/Dark、字号、行高与阅读宽度；不依赖登录、不写数据库、不记录阅读行为
- 章节页明确展示章节进度、第一章/末章导航边界、目录直达入口，并用视觉标识与 `aria-current` 标记当前章节
- Sprint 002B-Step03 使用 `fandom-harbor.reading-history.v1` 保存最近访问的 work、chapter 与 article；章节记录包含位置、总章数和派生百分比，最多保留 30 条
- Continue Reading 位于作品详情页，只跳转到该作品最近阅读且仍存在于当前已发布目录的章节；历史不绑定账号、不写数据库、不代表书签或收藏
- Sprint 002D-Step02 已替代原 Create Article UI Shell，优先交付 Create Work Draft Persistence。
- V1 内容词表由生产 Migration 幂等写入：5 个 Category 与 10 个 `additional/canonical` Tag，均使用稳定 UUID。
- Work Draft 写入使用 `Server Action → Gateway → createWorkDraftService → createAuthorWorkDraft Repository → create_author_work_draft RPC`；页面不得直连 Supabase mutation。
- `create_author_work_draft` 在单一事务创建 Work 与 `work_tags`，owner 固定为 `auth.uid()`，status 固定为 `draft`，`published_at` 固定为 null。
- Publish、Edit、Archive、Delete、Article/Chapter 写入仍未开放；Work Draft Runtime 与 SQL 实测已通过。
- Sprint 002E 正式调整为 Minimal Draft Editor，优先推进 Write → Save → Publish → Read 闭环，不先做 Work Detail Polish。
- Sprint 002E-Step01 复用 `chapters.content` 作为正文来源；V1 编辑壳读取按 position 排序的首个 Chapter，没有 Chapter 时显示空正文。
- Draft Editor 经 `StudioDraftEditorGateway → createDraftWorkEditorService → DraftWorkEditorStore → Supabase Repository` 读取；Service 校验 Author，数据库 session/RLS 校验 owner。
- `/studio/works/[workId]/edit` 的 textarea 仅保存浏览器页面状态，保存正文与 Publish 均 disabled；Step01 不新增写入、RPC、Migration、RLS 或 Schema。
- Sprint 002E-Step02 已用最小列级 grant 打通 Draft Body Save：owner Author 可保存首章正文，没有 Chapter 时首次保存自动创建 `position = 1` 的默认首章。
- Step02 不新增 RPC、不修改表结构/RLS，不会改变 `work.status` 或触发 Publish；Reader published-only 合同保持成立。
- Sprint 002F 已打通最小 Publish 闭环：同一编辑表单支持发布，发布时会先保存当前正文，再把 Work 和首章流转到 `published`。
- Reader 现在通过 hybrid gateway 优先读取数据库中的 published 内容，未命中时回退到 fixture published 内容；新发布作品可立即进入 `/works/[slug]/chapters/[chapterSlug]` 阅读。
- Sprint 002B-Step04 使用 `fandom-harbor.reader-bookmarks.v1` 保存章节与文章书签；`/archive` 本地书架聚合书签和 Step03 最近阅读
- 本地书签最多保留 100 条，支持添加/取消与明确当前状态；不绑定账号、不写数据库、不等同于云端收藏
- Sprint 002B-Step05 固化阅读 QA：书架水合/空/Storage 错误状态、规范 slug 过滤、全局 404/error 恢复路径、命名阅读设置区、动态 Bookmark aria-label/status
- Sprint 002C-Step01 使用现有 `work:author` capability 建立 `/studio`、`/studio/works`、`/studio/articles` 与共享 Author Studio layout
- Studio 数据经 `StudioContentGateway → createStudioContentService → StudioContentStore`，Service 注入 trusted owner ID；当前使用含 draft/published 的 Author fixture
- Reader fixture 对 Work、Article 与 Chapter 显式过滤 published；真实 owner-only Supabase Studio Store 因 `owner_user_id` 列级隐私合同待后续批准，不用公开 feed 冒充
- Sprint 002C-Step02 已 Accepted：`/studio/works/[workId]` 提供 owner-scoped 作品与章节摘要只读详情；owner ID 由 Service 从 trusted context 注入，其他作者与未知 workId 返回 Not Found
- Studio 可查看当前 fixture 作者的 draft Work/Chapter，Reader 仍只读取 published；新建章节、编辑、发布、归档均保持 disabled
- Sprint 002C-Step03 已 Accepted：`/studio/articles/[articleId]` 提供 owner-scoped 文章元信息只读详情；owner ID 来自 `TrustedAccessContext.identity.id`，其他作者与未知 articleId 返回 Not Found
- Studio 可查看当前 fixture 作者的 draft Article，Reader 仍只读取 published Article；新建文章、编辑、发布、归档均保持 disabled
- Sprint 002C-Step04 已 Accepted：补齐 Studio 空列表、Work/Article 专用 Not Found、无章节/全草稿章节提示与返回 Studio/列表导航；错误状态不暴露内部 ID 或数据库字段
- Studio 写入入口统一保持 disabled 且不接收写入回调；Reader 对 draft Work、Article、Chapter 的 published-only 隔离继续通过
- Sprint 002C-Step05 已完成 Freeze & Handoff：002C 冻结为只读 Author Studio Foundation，可正式关闭；Create/Edit、Draft Save、Publish、Archive、Delete、Supabase Runtime、Owner Repository 与 Rich Text Editor 均需新授权
- Sprint 002C Freeze 时记录的两个 002D 候选方向中，Product Owner 已选择非写入的 Author Creation Experience UI Shell；Database Runtime Recovery 仍独立待授权
- Sprint 002D 最初选择 Author Creation Experience UI Shell；Product Owner 后续明确调整 Step02 优先级，仅开放 Work Draft Persistence。
- Sprint 002D 的手册批准与实现授权保持分离；Step02 只授权 Create Work Draft，任何 Edit/Publish/其他写入仍需再次明确批准。
- Sprint 002D-Step01 已完成 `/studio/works/new` UI Shell；Step02 已将 metadata fixture 替换为数据库读取，并只启用“保存草稿”。
- Reader published-only 与 Trusted Identity 状态保持不变；002A DB Runtime Pending 已于 2026-07-01 验证关闭。

## Last updated

- 2026-07-03: Product Owner confirmed `Mission 3C-1. PASS` after final browser,
  responsive, accessibility, console, URL synchronization, Published Work /
  Author search and Draft-isolation acceptance. Mission 3C-1 is formally
  closed. Mission 3C-2 is named Browse Experience and remains unauthorized and
  unstarted.

- 2026-07-03: Mission 3C-1 Search MVP engineering completed. Public `/search`
  supports GET/URL-synchronized Published Work title/slug and public Author
  name/slug matching. Drafts remain excluded by the database contract. The
  implementation uses existing Service / Repository boundaries and one narrow
  public read RPC; no schema, RLS, role, Auth, dependency or infrastructure
  change was introduced. Local/remote Migration histories are 13/13, full
  validation and desktop/390px Browser QA pass, P0 is zero, and Mission 3C-2
  remains unauthorized and unstarted.

- 2026-07-03: Product Owner completed final browser acceptance and confirmed
  `Mission 3B. PASS`. Create/Save/Publish/Reader readback, public Author profile,
  published-only and draft isolation, Follow / Unfollow, login return,
  Invitation Relationship and mobile baseline all passed. Acceptance-found
  publishing and Studio owner-read issues were repaired and re-verified. Full
  validation passes, P0 is zero, and local/remote Migration histories are 12/12.
  Mission 3B is closed; Mission 3C remains unauthorized and unstarted.

- 2026-07-03: Fixed the Phase 3 `/studio/works` P0. PostgREST filtering on the
  intentionally hidden `owner_user_id` caused legitimate Author reads to fail;
  removing the filter was rejected because Reader RLS can see all Published
  Works. Authenticated-only `list_my_studio_works` and `get_my_studio_work`
  now return only the active Author own Draft/Published management fields and
  never expose owner IDs. The Migration is deployed and local/remote histories
  are 12/12 aligned; Product Owner remote browser confirmation remains pending.

- 2026-07-03: Phase 3 Reader / Studio acceptance fix engineering completed.
  Reader surfaces expose only public Author names/slugs for Published Works,
  global auth state is visible, TXT export is published-only, and Studio uses
  owner-scoped real Work/Chapter data with Draft/Published management, Chapter
  creation/editing/publication selection and tag association editing. The
  authorized narrow `get_published_work_authors` Migration is deployed; local
  and remote histories are 11/11 aligned. Chapter deletion remains closed and
  Product Owner acceptance is pending.

- 2026-07-02: Mission 3B engineering completed under the authorized Social
  Relationship Foundation scope. `/author/{slug}` is publicly readable and
  published-only; active Readers can idempotently Follow / Unfollow Authors;
  invitation relationship summaries are own-only and reuse existing Redemption
  uniqueness. Local database rebuild, Mission SQL, full Validation and desktop /
  390px Browser QA passed. The additive Migration is deployed remotely and local /
  remote histories are 10/10 aligned. Mission 3B awaits Product Owner acceptance.

- 2026-07-02: Product Owner confirmed `Mission 3A. PASS`. Phase 3A Beta Blocking
  is accepted and closed with engineering P0 at zero. Mission 3B, Mission 3C and
  RR-1 remain unauthorized; the project waits at the Mission 3B authorization gate.
- 2026-07-02: Mission 3A engineering completed under Mission Authorization v1.
  Full workspace validation, local nine-migration rebuild, three SQL suites,
  remote 9/9 migration parity, remote Auth settings, real registration/login,
  Reader denial, Author grant, Studio create/save/publish/read and 390×844
  browser QA passed. Engineering P0 is zero; Mission 3A awaits Product Owner
  acceptance. Deployed Vercel URL smoke testing and Git Release Candidate
  archiving remain KI-017/KI-018 for Release Readiness.
- 2026-07-02: Product Owner replaced the planned Phase 3 Reading direction with
  V1 Fast Launch governance. Phase 3A (`3A-*`) is the only Beta-blocking stage;
  Phase 3B (`3B-*`) contains minimal invitation operations including
  Invitation Relationship; Phase 3C (`3C-*`) contains deferrable experience
  polish; former Sprint 3.10 is independent Release Readiness `RR-1`. All Sprints
  remain unauthorized and unstarted.
- 2026-07-02: Product Owner confirmed successful Studio entry with the remotely registered `Auther001` account. The nine-migration remote environment, disabled Email Confirm, real registration, registration-name/password login and audited manual Author grant acceptance chain passed; Phase 2 is Pass and Auth P0 is resolved. Phase 3 still requires separate planning and explicit authorization.
- 2026-07-02: Product Owner completed remote registration/login as Auther001. The account has active Membership and an audited manual Author grant; Phase 2 remained Conditional Pass until the subsequent successful Studio confirmation.
- 2026-07-02: Remote project szfhngifsipsrxcpekti is linked and has all nine migrations. Registration RPCs return HTTP 200, mailer_autoconfirm is true, a bounded QA invitation is valid, and all app env URLs point to the project. Phase 2 remains Conditional Pass until Product Owner completes real registration/login and, after the required manual Author grant, enters Studio.
- 2026-07-02: Product Owner marked Phase 2 Conditional Pass after manually checking Author and Reader surfaces with no other obvious issue found. Planning for the next step is allowed, but Phase 3 implementation remains prohibited until the same remote acceptance environment passes migration deployment, Email Confirm disabled, real registration, registration-name/password login and Studio entry.
- 2026-07-02: Phase 2 Auth P0 reopened after manual regression. The configured remote Supabase lacks the registration RPCs and returns PGRST202. Local code now classifies invitation and provider failures, all nine migrations/SQL suites/real Auth signup/workspace gates pass, but Phase 3 remains prohibited until remote migration and Auth verification complete.
- 2026-07-02: Established the mandatory Phase-level Product Handoff format. Phase 2 now has startup instructions, entry URLs, local-only Reader/Author QA accounts, route inventory, manual acceptance flow, limitations and a Product Owner result section. Local QA identities disappear after database reset.
- 2026-07-02: Phase 2 Auth P0 resolved. Registration now atomically creates the Auth identity, unique registration-name Profile, active Membership, Invitation Redemption and audit state; invalid invitations leave no residual account. Login uses registration name/password and no verification email is sent.

- 2026-06-30: Started approved Phase 2 / Sprint 002A Content Domain Foundation with the works + chapters + articles model, shared categories/tags and existing-RBAC RLS boundary.
- 2026-06-30: Completed Sprint 002A engineering implementation and local checks; disposable-database execution and Product Owner acceptance remain.
- 2026-06-30: Completed Sprint 002B-Step01 reader routes, replaceable fixture data flow, safe structured-content rendering, chapter navigation and baseline reading controls; 002A database execution remains pending without further retry.
- 2026-06-30: Completed Sprint 002B-Step02 local reader-preference persistence and chapter-navigation clarity; workspace checks and browser theme/guard regression pass without database writes, new dependencies or Supabase retries.
- 2026-06-30: Completed Sprint 002B-Step03 local work/chapter/article history and work-scoped Continue Reading with safe Storage fallback; workspace checks and public-shell/auth-guard browser regression pass.
- 2026-06-30: Completed Sprint 002B-Step04 local chapter/article bookmarks and the `/archive` Reader Shelf with safe Storage fallback; workspace checks and public-shell/shelf-guard browser regression pass.
- 2026-06-30: Completed Sprint 002B-Step05 reading-state QA and accessibility polish; workspace checks, 404 recovery, theme persistence and shelf-guard browser regression pass, with protected-page manual keyboard QA waiting on local identity Runtime.
- 2026-06-30: Product Owner accepted Sprint 002C-Step01 Author Studio Foundation after the draft Chapter isolation fix; 48 Vitest tests, full workspace checks and the Web production build pass while 002A DB Runtime remains pending, and Step02 awaits explicit authorization.
- 2026-06-30: Product Owner accepted Sprint 002C-Step02 owner-scoped Work Detail read-only foundation with trusted owner injection, draft Studio visibility, other-author/unknown-work Not Found boundaries, disabled write entrypoints, 52 Vitest tests and Web production build passing while 002A DB Runtime remains pending; Step03 was later authorized and tracked separately.
- 2026-07-01: Product Owner accepted Sprint 002C-Step03 owner-scoped Article Detail read-only foundation with owner identity sourced from `TrustedAccessContext.identity.id`, draft Studio visibility, other-author/unknown-article Not Found boundaries, Reader published-only isolation and disabled write entrypoints; lint, typecheck, 55/55 Vitest tests and Web production build pass while 002A DB Runtime remains pending and Step04 remains unauthorized.
- 2026-07-01: Product Owner accepted Sprint 002C-Step04 after safe empty/error/boundary states, disabled actions and Reader isolation passed review; lint, typecheck, 58/58 Vitest tests and Web production build pass.
- 2026-07-01: Completed Sprint 002C-Step05 Freeze & Handoff with Step01-Step04 accepted, read-only Studio and trusted identity/published-only contracts frozen, all write/runtime/editor capabilities separately gated, and Sprint 002D awaiting a newly authorized direction while 002A DB Runtime remains pending.
- 2026-07-01: Product Owner approved the Sprint 002D Author Creation Experience UI Shell handbook and selected the non-writing UI direction; Step01 remains separately gated, while real Create/Edit/Publish, owner-only Repository, DB Runtime, content schema validation, Revision and state-machine work remain unauthorized.
- 2026-07-01: Completed Sprint 002D-Step01 Create Work UI Shell with client-only validation, fixture metadata, cover/loading placeholders, local clearing and disabled save/publish actions; lint, typecheck, 64/64 Vitest and Web production build pass, no write/Repository/Supabase path exists, and Step02 remains unauthorized.
- 2026-07-01: Accepted Sprint 002D-Step02 after local Supabase rebuilt all six Migrations and the Phase 2 SQL suite verified Author success, non-Author denial, invalid metadata rollback and atomic Work/Tag creation; Publish remains disabled.
- 2026-07-01: Completed Sprint 002E-Step01 Minimal Draft Editor data contract and edit shell by reusing chapters.content, existing Author capability and owner RLS; lint, typecheck, 81/81 Vitest and Web production build pass, while save/publish remain disabled and Step02 requires new authorization.
- 2026-07-01: Product Owner granted standing factual documentation authority from Sprint 002E onward; verified Sprint/Step records may be synchronized automatically within listed paths, while all Level 3 product/code/database/security boundaries remain separately gated.
- 2026-07-01: Completed Sprint 002E-Step02 Draft Body Save with the minimal `chapters` body-update grant, owner-only Server Action persistence, first-save Chapter creation and same-Chapter updates; local Supabase reset, Phase 2 SQL suite, workspace lint/typecheck, 86/86 Vitest and Web production build all pass.
- 2026-07-01: Completed Sprint 002F Minimal Publish Workflow with owner-only draft publish, publish-time body persistence, first-Chapter publish fallback, Reader hybrid published reads, local Supabase reset, extended Phase 2 SQL suite, workspace lint/typecheck, full Vitest and Web production build all passing.
- 2026-07-01: Completed Sprint 002G Public Reading by moving `/articles/[slug]` onto the same hybrid published gateway as Work/Chapter routes; Reader now consistently prefers published database content with published fixture fallback, draft isolation remains intact, and workspace lint/typecheck/full Vitest plus the Web production build pass without any new database-side change.
- 2026-07-01: Completed Sprint 002H Bookshelf / Library by turning `/works` into a Reader Library Hub with continue-reading, latest-bookmark, local shelf summaries and minimal client-side filtering; `/archive` remains the detailed local shelf, published-only isolation stays intact, and workspace lint/typecheck/full Vitest plus the Web production build pass without any new database-side change.
- 2026-06-29: Published Milestone v0.1 release baseline to GitHub and archived release documentation for Phase 1 Foundation plus Sprint 002A Website Shell.
- 2026-06-29: Set the current repository milestone to v0.1 Released and moved the planning focus to Sprint 002B.
- 2026-06-29: Completed Phase 1C engineering implementation and all locally available gates; database rebuild/SQL role-matrix execution and Product Owner phase acceptance remain.
- 2026-06-29: Established verified email/password identity, invitation-only membership admission, derived Reader capability, manual elevated role grants and audited RLS workflows under D-033/ADR-018.
- 2026-06-29: Added RuntimeConfig, Trusted Identity/Session, repository/provider isolation and the provider-neutral ObjectStorage contract; pages do not consume raw environment or Supabase clients.
- 2026-06-29: Replaced the one-operation-only rule with a root-cause retry limit: one Product Owner-approved controlled retry per root cause, then mandatory stop on repeated failure.
- 2026-06-29: Established the permanent Runtime Contract: NVM-provided Node.js 24.x, current approved Node.js 24.18.0, pnpm 11.7.0 and the official npm registry across every project entry point.
- 2026-06-29: Added the mandatory Sprint startup gate and root-cause-first environment rule; development begins only after environment, toolchain, version and dependency checks pass.
- 2026-06-28: Added the permanent escalation workflow and made it mandatory startup context; product, UX, schema, auth, permission, dependency, technology, module-removal, roadmap and architecture changes require Product Owner approval.
- 2026-06-28: Added the permanent environment-issue policy and made it mandatory startup context; environment failures block operations without changing product status or architecture.
- 2026-06-28: Revised the permanent language policy: Product Owner communication and formal product-document content use Simplified Chinese; technical and filesystem naming remain in English; no translation-only migration is required.
- 2026-06-28: Added the initial language policy and made it mandatory startup context.
- 2026-06-28: Phase 0.6 completed final documentation architecture, registries, ADRs, Phase packages and AI behavior contract. No application code or packages introduced.
