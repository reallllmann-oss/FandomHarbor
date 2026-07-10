# Sprint 002C — Author Studio Foundation

## Step01 — Studio Foundation

## Identity

- Product Phase: Phase 2 — Publishing
- Product outcome: 为作者作品、章节、文章与后续发布流程建立统一 Studio 入口
- Approval status: Accepted — Product Owner 于 2026-06-30 完成工程验收
- Dependency: Sprint 002A Content Domain 与 Phase 1 `work:author` capability
- Known blocker: Sprint 002A DB Runtime Pending；本 Step 不重试 Supabase

## Mandatory startup gate

- Environment Check: Passed — Workspace 与 Web 本地开发环境正常
- Toolchain Check: Passed — Node、pnpm、Git、Turbo、Vitest、TypeScript 可用
- Version Check: Passed — Node 24.18.0、pnpm 11.7.0 符合 Runtime Contract
- Dependency Check: Passed — frozen/offline install；manifest、lockfile与 workspace 配置未变化

## Scope

### In

- `/studio`、`/studio/works`、`/studio/articles`
- Author-only Studio layout：Sidebar、Header、Content Layout、Breadcrumb
- Works/Articles fixture 列表、状态、更新时间及创建/编辑禁用占位
- `StudioContentGateway → Studio Content Service → StudioContentStore` 注入边界
- 单元测试、Author/Web/Phase 文档与项目状态

### Out

- 编辑器、章节编辑、创建写入、发布动作、封面上传
- 统计 Dashboard、评论管理、Storage、数据库写入
- 新权限角色、权限模型、数据库 Schema 或 Supabase Runtime

## Authorization

- Studio layout 与数据 Service 继续使用现有 `work:author` capability。
- Visitor 跳转 `/auth/sign-in`；无 Author capability 的 active Reader 跳转 `/archive`。
- `/author` 作为旧入口重定向 `/studio`；邀请码管理继续保留 `/author/invitations`。
- 不增加 `studio:*` role/capability，也不在客户端建立授权判断。

## Data boundary

- 页面调用 `StudioContentGateway`，Gateway 调用 `createStudioContentService`。
- Service 注入可信身份的 `ownerUserId`，页面与 fixture 均不自行决定作者身份。
- 当前 `StudioContentStore` 使用 Work/Article fixture 并返回 draft/published 样本。
- Reader fixture Store 显式过滤 `published`，Studio 草稿不会出现在 Reader 路由。
- 真实 Supabase Studio Store 暂不实现：当前列级 grant 有意隐藏 `owner_user_id`，owner-only 列表需要后续获批的数据库读取合同，不能用 published feed 冒充。

## Acceptance

Status: **Accepted**

- [x] 三条 Studio 路由与旧 Author 入口重定向存在。
- [x] Studio 使用统一 Sidebar、Header、Content Layout 与 Breadcrumb。
- [x] Works/Articles 列表展示标题、状态、slug、更新时间和禁用占位动作。
- [x] 数据流复用 002A 类型与既有 Author capability，并可注入 Store。
- [x] Reader 路由仅暴露 published Work、Article 与 Chapter，不会读取 Studio draft fixture。
- [x] Service/Gateway 测试覆盖可信 owner 注入、排序和非 Author 拒绝。
- [x] Workspace lint/type/test/build 与浏览器守卫回归完成。

## Verification

- 全仓 lint、typecheck、48 个 Vitest 与三套 Next.js production build 通过；最小修复后的 Web production build 再次通过。
- Services 9 个测试与 Web 20 个测试通过；验收中发现的 draft Chapter 隔离缺口已通过 published 状态过滤和目录/阅读/导航测试收口。
- 浏览器实测确认 `/studio`、`/studio/works` 与旧 `/author` 在未登录状态下安全跳转 `/auth/sign-in`，无控制台错误。
- 已登录 Author 布局的浏览器实测仍依赖可用的本地身份/数据库 Runtime；没有为测试绕过现有认证边界。
- Sprint 002A DB Runtime Pending 保持不变；未启动 Supabase、未连接远程库。

## Acceptance outcome

- Product Owner 于 2026-06-30 确认 Sprint 002C-Step01 工程验收通过。
- 后续 Step02 已独立授权并验收；Step01 验收本身不构成 Step03 或更后续开发授权。

## Step01 rollback

删除 `/studio` route tree、Studio gateway/fixture Service 增量并恢复 `/author` 空状态即可。无 Migration、远程资源或数据需要回滚。

## Step02 — Studio Work Detail Read-Only Foundation

Status: **Accepted**

### Objective

为 Author Studio 增加 owner-scoped 作品详情只读壳层，不提供任何创建、编辑、发布、归档或数据库写入能力。

### Implemented scope

- 新增 `/studio/works/[workId]`，并从作品列表提供“查看详情”入口。
- 展示作品标题、简介、状态、章节数量、创建时间和最近更新时间。
- 只读章节列表展示标题、状态、排序序号和最近更新时间，Studio 可查看当前作者的 draft Chapter。
- 新建章节、编辑作品、发布作品和归档作品均为 disabled 占位。
- 不存在或不属于当前作者的 `workId` 统一进入现有 Not Found 恢复页。

### Authorization and data boundary

- 继续复用 `work:author`；未登录跳转 `/auth/sign-in`，非 Author Reader 返回 `/archive`。
- 数据流保持 `StudioContentGateway → createStudioContentService → StudioContentStore`。
- `getWork` 的 `ownerUserId` 只由 Service 从 `TrustedAccessContext.identity.id` 注入；URL 仅提供 `workId`。
- Fixture Store 同时以 owner ID 与 work ID 约束详情，并以 owner ID 约束 Works/Articles 列表；其他作者获得 `null` 或空列表。
- Studio 详情可见当前作者的 draft Work/Chapter；Reader Store 继续对 Work、Article、Chapter 执行 published-only 过滤。
- 未实现 Supabase 查询、Migration、RLS、Database Contract 或任何写入适配器。

### Acceptance criteria

- [x] `/studio/works/[workId]` 已进入 Web 路由树。
- [x] Author 可查看 owner-scoped Work 详情及有序章节摘要。
- [x] 未登录和非 Author 守卫继续复用 Step01 边界。
- [x] 不存在及其他作者 Work 不会返回详情。
- [x] draft Work/Chapter 仅在 Studio 可见，Reader 隔离测试保持通过。
- [x] 四项后续操作均为 disabled 占位且无写入路径。
- [x] lint、typecheck、52 个 Vitest 与 Web production build 通过。

### Verification

- Services 10 个测试通过，覆盖可信 owner 注入和非 Author 拒绝。
- Web 23 个测试通过，覆盖 owner-scoped 详情、draft Work/Chapter、其他作者隔离、未知 work ID 与 Reader draft 隔离。
- lint、typecheck、52/52 Vitest 与 Web production build 全部通过。
- package.json、pnpm-lock.yaml 与 Supabase 配置未变化；DB Runtime Pending 保持不变。

### Acceptance outcome

- Product Owner 于 2026-06-30 确认 Sprint 002C-Step02 工程验收通过。
- `/studio/works/[workId]` 只读详情页进入 production 路由表，并可由 `/studio/works` 的“查看详情”入口访问。
- owner ID 仅由可信身份上下文注入；URL 只传 `workId`。
- 其他作者作品与未知 `workId` 均返回 Not Found。
- 当前作者可在 Studio 查看自己的 draft/published Work 与 draft/published Chapter；Reader 前台保持 published-only。
- 新建章节、编辑、发布、归档入口全部保持 disabled，不触发写入。
- 下一步等待明确授权后再进入 Sprint 002C-Step03；本次验收不构成后续开发授权。

### Step02 rollback

删除 `/studio/works/[workId]`、作品列表详情入口及 Studio `getWork` 增量即可。无数据库、远程资源或数据需要回滚。

### Next authorization boundary

Step03 已获得独立授权并进入工程实现；Step02 验收本身不构成 Step04 或更后续开发授权。

## Step03 — Studio Article Detail Read-Only Foundation

Status: **Accepted**

### Objective

为 Author Studio 增加 owner-scoped 文章详情只读壳层，不提供任何创建、编辑、发布、归档、删除、草稿保存、编辑器或数据库写入能力。

### Implemented scope

- 新增 `/studio/articles/[articleId]`，并从文章列表提供“查看详情”入口。
- 展示文章标题、摘要、状态、所属作品说明、分类说明、标签状态、创建时间和最近更新时间。
- 新建文章、编辑文章、发布文章和归档文章均为 disabled 占位。
- 不存在或不属于当前作者的 `articleId` 统一进入现有 Not Found 恢复页。

### Authorization and data boundary

- 继续复用 `work:author`；未登录跳转 `/auth/sign-in`，非 Author Reader 返回 `/archive`。
- 数据流保持 `StudioContentGateway → createStudioContentService → StudioContentStore`。
- `getArticle` 的 `ownerUserId` 只由 Service 从 `TrustedAccessContext.identity.id` 注入；URL 仅提供 `articleId`。
- Fixture Store 同时以 owner ID 与 article ID 约束详情；其他作者获得 `null`。
- Studio 详情可见当前作者的 draft/published Article；Reader Store 继续仅返回 published Article。
- Article 领域类型当前没有作品关联字段，详情页以“独立文章”呈现所属作品；当前 fixture 暂无文章标签，分类只显示安全的人类可读名称，不暴露 `categoryId`。
- 未实现 Supabase 查询、Migration、RLS、Database Contract 或任何写入适配器。

### Acceptance criteria

- [x] `/studio/articles/[articleId]` 已进入 Web 路由树。
- [x] Author 可查看 owner-scoped Article 详情。
- [x] 未登录和非 Author 守卫继续复用 Step01/Step02 边界。
- [x] 不存在及其他作者 Article 不会返回详情。
- [x] draft Article 仅在 Studio 可见，Reader 隔离测试保持通过。
- [x] 四项后续操作均为 disabled 占位且无写入路径。
- [x] lint、typecheck、55 个 Vitest 与 Web production build 通过。

### Verification

- lint、typecheck、55/55 Vitest 与 Web production build 全部通过。
- Services 10 个测试通过，覆盖可信 owner 注入和非 Author 拒绝。
- Web 26 个测试通过，覆盖 owner-scoped Article 详情、draft Article Studio 可见、其他作者隔离、未知 article ID 与 Reader draft Article 隔离。
- Web production build 路由表包含 `/studio/articles/[articleId]`。
- package.json、pnpm-lock.yaml 与 Supabase 配置未变化；未执行 Supabase，DB Runtime Pending 保持不变。

### Acceptance outcome

- Product Owner 于 2026-07-01 确认 Sprint 002C-Step03 工程验收通过。
- `/studio/articles/[articleId]` 只读详情页进入 production 路由表，并可由 `/studio/articles` 的“查看详情”入口访问。
- owner ID 仅由 `TrustedAccessContext.identity.id` 注入；URL 只传 `articleId`。
- 其他作者文章与未知 `articleId` 均返回 Not Found；Reader 继续保持 published-only。
- 新建文章、编辑文章、发布文章和归档文章入口全部保持 disabled，不触发写入。
- lint、typecheck、55/55 Vitest 与 Web production build 全部通过。

### Step03 rollback

删除 `/studio/articles/[articleId]`、文章列表详情入口及 Studio `getArticle` 增量即可。无数据库、远程资源或数据需要回滚。

### Next authorization boundary

Step04 已获得独立授权并完成工程实现；Step03 验收本身不构成 Step05 或更后续开发授权。

## Step04 — Studio Empty / Error / Boundary States

Status: **Accepted**

### Objective

补齐 Studio 只读后台的空列表、内容不存在、owner 边界、空章节、全草稿章节与明确导航回退体验，不提供任何写入能力。

### Implemented scope

- Works 与 Articles 空列表显示明确空状态、disabled 创建入口和“返回 Studio”入口。
- Work/Article 详情使用各自的 Studio Not Found 状态，说明内容不存在或不属于当前作者，并提供返回列表与 Studio 的恢复路径。
- Work 详情区分“没有章节”与“全部章节为草稿”；全草稿状态明确说明仅 Studio 可见、Reader 暂无可阅读章节。
- Work/Article 详情均提供返回对应列表与 Studio 的明确导航。
- 只读操作统一复用 disabled action contract，不接收提交或写入回调。

### Authorization and data boundary

- 继续复用 `work:author` 与现有 `StudioContentGateway → createStudioContentService → StudioContentStore` 边界。
- owner ID 继续只来自 `TrustedAccessContext.identity.id`；URL 只传 `workId` 或 `articleId`。
- 不存在及其他作者内容继续返回 `null` 并进入安全 Not Found，不显示内部 ID、`owner_user_id` 或数据库字段。
- Studio fixture 增加全草稿章节作品用于边界验证；Reader Store 继续仅返回 published Work、Article 与 Chapter。
- 未实现 Supabase 查询、Migration、RLS、Database Contract、编辑器或任何写入适配器。

### Acceptance criteria

- [x] 无作品与无文章时有明确空状态和 disabled 创建入口。
- [x] 不存在及其他作者 Work/Article 使用明确、安全的 Not Found 状态。
- [x] 无章节与全草稿章节状态可区分。
- [x] 详情与错误状态提供返回 Studio 和对应列表的恢复路径。
- [x] Reader 不读取 draft Work、Article 或 Chapter。
- [x] 创建、编辑、发布与归档入口保持 disabled 且没有写入回调。
- [x] lint、typecheck、58 个 Vitest 与 Web production build 通过。

### Verification

- lint、typecheck 与 58/58 Vitest 全部强制无缓存通过。
- Web 29 个测试通过，新增覆盖全草稿 Work 的 Studio 可见性、draft Work/Chapter Reader 隔离及 disabled action contract。
- Web production build 通过，Studio 列表与 Work/Article 动态详情路由保持在生产路由表中。
- package.json、pnpm-lock.yaml 与 Supabase 配置未变化；未执行 Supabase，DB Runtime Pending 保持不变。

### Acceptance outcome

- Product Owner 于 2026-07-01 确认 Sprint 002C-Step04 工程验收通过。
- Works/Articles 空状态、Work/Article 安全 Not Found、无章节/全草稿章节边界和恢复导航均通过验收。
- 其他作者内容不泄漏，Reader 保持 published-only，页面不暴露内部 ID、`owner_user_id` 或数据库字段。
- 所有创建、编辑、发布与归档入口保持 disabled；lint、typecheck、58/58 Vitest 与 Web production build 全部通过。

### Step04 rollback

删除 Studio 状态组件、详情级 Not Found、全草稿 fixture 与对应测试，并恢复列表/详情原有文案即可。无数据库、远程资源或数据需要回滚。

### Next authorization boundary

Step05 已获得独立授权并完成 Freeze & Handoff；Step04 验收本身不授权 Sprint 002D。

## Step05 — Freeze & Handoff

Status: **Complete / Sprint Frozen**

### Objective

冻结 Sprint 002C 的只读 Author Studio Foundation，统一文档、项目状态、能力边界与下一阶段候选入口，不新增产品功能。

### Frozen capabilities

- Studio 首页与统一 Sidebar、Header、Content Layout、Breadcrumb。
- Works List 与 Articles List。
- Work Detail（Read Only）与 Article Detail（Read Only）。
- 空列表、详情 Not Found、无章节与全草稿章节边界状态。
- 返回 Studio、返回 Works/Articles 列表及 Reader 的明确导航。
- Reader published-only Contract：Reader 只读取 published Work、Article 与 Chapter。
- Trusted Identity Contract：owner ID 只来自 `TrustedAccessContext.identity.id`，URL 不提供 owner 身份。
- `StudioContentGateway → createStudioContentService → StudioContentStore` 可替换数据边界；当前继续使用 fixture。

### Explicitly not implemented

- Create Work、Edit Work、Create Article、Edit Article。
- Draft Save、Publish、Archive、Delete。
- Supabase Runtime、Owner Repository、Rich Text Editor。
- 以上能力均不属于 Sprint 002C，必须获得新的 Sprint 授权后才能实现。

### Handoff options

下一 Sprint 建议为 **Sprint 002D**，且只能在 Product Owner 重新授权后选择一个方向：

- A：Draft Creation / Editing UI Shell。
- B：Database Runtime Recovery。

当前不默认选择方向，也不启动 Sprint 002D。

### Freeze verification

- Sprint 002C-Step01、Step02、Step03 与 Step04 均为 Accepted。
- Step05 仅修改文档与状态记录，没有新增页面、组件、功能或测试。
- lint、typecheck、58/58 Vitest 与 Web production build 通过。
- package.json、pnpm-lock.yaml、Supabase Runtime、Migration、RLS 与 Database Contract 均未变化。
- 未执行 Supabase；Sprint 002A DB Runtime Pending 保持不变。

### Final status

Sprint 002C — Author Studio Foundation 已完成 Freeze & Handoff，可以正式关闭。后续工作必须从新的 Sprint 002D 明确授权开始。
