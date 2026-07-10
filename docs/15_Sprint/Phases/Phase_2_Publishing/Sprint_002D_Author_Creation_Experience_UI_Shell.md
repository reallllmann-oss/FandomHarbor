# Sprint 002D — Author Creation Experience UI Shell

Status: **Step02 Accepted**

## Identity

- Product Phase: Phase 2 — Publishing
- Sprint outcome: 建立 Author Studio 创建体验，并以最小安全写入链路开放 Work Draft Persistence
- Approval status: Product Owner 于 2026-07-01 批准本开发手册与 Sprint 规划
- Implementation authorization: Step01 已完成；Product Owner 于 2026-07-01 授权 Step02 替代原 Create Article UI Shell，并追加最小词表/RPC Level 3 授权
- Dependencies: Sprint 002C Frozen；复用现有 `work:author`、Trusted Identity、Reader published-only 与 Studio owner-scoped read contracts
- Runtime validation: 2026-07-01 本地数据库从零重建、Migration、V1 词表、RPC、权限矩阵和事务回滚测试全部通过

## Mandatory startup gate

- Environment Check: Passed — workspace 与 Web 本地环境正常
- Toolchain Check: Passed — Node、pnpm、Git、Turbo、Vitest 与 TypeScript 可用
- Version Check: Passed — Node 24.18.0、pnpm 11.7.0 符合 Runtime Contract
- Dependency Check: Passed — manifest、lockfile、Supabase 配置与既有哈希未变化
- Development authorized only after all four checks pass: **Yes — 仅限 Step01**

## Architecture boundary

Sprint 002D 最初按纯 UI Shell 规划。Product Owner 后续将 Step02 调整为 V1 Work Draft Persistence；该授权只开放 Work Draft 创建，不代表 Edit/Publish 已就绪。

Phase 2 Architecture Review 已确认以下真实写入阻塞仍存在：

- owner-only Runtime Repository 尚未建立；
- 002A Migration/RLS 尚未完成数据库实测；
- 正文 schema 校验与 normalization 尚未建立；
- Revision、状态机、乐观并发和发布事务尚未建立；
- Chapter/Article 正文更新的 Database Contract 尚未授权。

Step02 新增的唯一写入例外：

- `/studio/works/new` 读取数据库 Category/Tag；
- 通过 Server Action、Service、Repository 与 PostgreSQL RPC 原子创建 draft Work 和 `work_tags`；
- owner 固定来自 `auth.uid()`，status 固定为 `draft`，`published_at` 固定为 null。

## Permanent Sprint constraints

除上述 Work Draft 创建外，Sprint 002D 继续禁止：

- Edit、Publish、Archive 或 Delete；
- Article/Chapter 写入；
- 修改 RLS、现有表结构或 tag type；
- Revision、发布状态转换或自动保存；
- 修改 `package.json`、`pnpm-lock.yaml` 或新增第三方依赖；
- 从 URL、query、client props 或 request body 接受 owner/author 身份；
- 破坏 Reader published-only 合同。

## Shared authorization contract

- 所有 Studio 路由继续复用 `work:author` capability。
- 未登录访问跳转 `/auth/sign-in`。
- 非 Author Reader 返回 `/archive`。
- Edit 路由 URL 只传 `workId` 或 `articleId`；owner ID 只来自 `TrustedAccessContext.identity.id`。
- 当前作者可以读取自己的 draft/published fixture；其他作者与未知资源返回 Not Found。

## Shared verification contract

每个实现 Step 完成后必须执行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter web build
```

每个 Step 完成后必须输出：

- 修改文件列表；
- 功能说明；
- 数据边界说明；
- 权限说明；
- 测试覆盖；
- 自动化验证结果；
- package、lockfile 与 Supabase 是否变化；
- 是否可以进入工程验收；
- 是否需要下一 Step 授权。

## Step01 — Create Work UI Shell

Status: **Engineering Complete / Ready for Engineering Acceptance**

### Objective

新增 `/studio/works/new`，提供可输入但不可提交的作品创建表单壳层。

### In scope

- 作品标题、简介、分类与标签字段；
- 封面占位；
- disabled“保存草稿”与“发布”；
- 返回 Studio 与返回作品列表；
- 继续复用 Studio Author 守卫。

### Out of scope

- 真实创建、Service 写入、Supabase、Repository；
- package/lockfile、数据库或权限合同变更。

### Acceptance

- [x] `/studio/works/new` 已进入 Web route tree。
- [x] Author 可访问；未登录跳 `/auth/sign-in`；非 Author 返回 `/archive`。
- [x] 标题、简介、分类与标签可输入、修改和清空。
- [x] 标题必填、长度与控制字符校验，以及简介最大长度校验均在客户端运行。
- [x] 保存草稿与发布均 disabled，Action Bar 不接受写入回调。
- [x] 分类与标签只来自本地 fixture；封面仅为占位。
- [x] 不存在 Service 写入、Repository、Supabase、Mutation、POST、RPC、SQL 或成功保存模拟。
- [x] Reader published-only 不受影响。

### Implemented UI structure

- `/studio/works` 的新建入口与空状态入口均导航至 `/studio/works/new`。
- 页面包含 Breadcrumb、说明 Header、作品信息表单、封面占位、UI Shell 状态说明和 sticky Action Bar。
- 表单提供标题/简介字数统计、分类 Select、标签多选、明确焦点/hover 状态和清空按钮。
- Route segment 提供只读 loading skeleton。
- 当前领域没有成年内容字段，因此本 Step 未添加成年内容控件。

### Data and permission boundary

- Route 继续使用 `getWebAccessContext()` 和 `work:author` capability。
- 页面不接收 owner ID，也不创建 Gateway/Service/Store/Repository。
- Category/Tag 使用 `studio-form-fixtures.ts` 的本地选项，只进入客户端内存状态。
- `<form>` 没有 action/method；submit 被本地阻止，保存/发布按钮为 `type="button"` 且 disabled。

### Tests and verification

- 新增 5 个 validation 测试，覆盖空白标题、标题长度、控制字符、简介长度与有效表单状态。
- disabled action contract 新增 Create Work 保存/发布覆盖。
- Web 定向测试 35/35 与 Web typecheck 通过。
- 全仓 lint、typecheck 与 64/64 Vitest 均以 0 cached 通过。
- Web production build 通过，路由表包含 `/studio/works/new`。
- package.json、pnpm-lock.yaml 与 Supabase 配置未变化；未执行 Supabase。

### Next authorization boundary

Step01 在当时停止于工程验收边界；Product Owner 后续已独立授权并重新定义 Step02，历史 Step01 范围保持不变。

## Step02 — Create Work Draft Persistence

Status: **Engineering Complete / Database Runtime Verification Pending**

### Objective

让已登录 Author 在 `/studio/works/new` 原子保存真实 Work Draft，同时继续禁用 Publish。

### In scope

- 通过生产 Migration 幂等写入 5 个 Category 与 10 个 `additional/canonical` Tag；
- 新增 `create_author_work_draft` RPC，在一个数据库事务中创建 `works` 与 `work_tags`；
- owner 仅取 `auth.uid()`，status 固定 `draft`，`published_at` 固定 null；
- Category 必须存在；Tag 必须存在且不是 deprecated；
- `createWorkDraft` Server Action 与 Gateway → Service → Repository 边界；
- 页面从 Supabase Repository 读取 Category/Tag UUID；
- 保存 pending、成功跳转和可访问失败状态；
- Publish 继续 disabled。

### Out of scope

- Publish、审核、编辑器、封面上传、成年内容字段；
- Edit/Archive/Delete 与 Article/Chapter 写入；
- RLS、现有表结构、tag type、package 或 lockfile 变更。

### Acceptance

- [x] Service 与 Server Action 双层检查 `work:author`。
- [x] Repository 使用 Zod 验证 title、summary、Category/Tag UUID。
- [x] RPC 固定 trusted owner 与 draft 生命周期。
- [x] Work 和 Tag 关联位于同一 PostgreSQL 函数事务。
- [x] 页面不再使用本地 metadata fixture。
- [x] Publish 无写入路径且继续 disabled。
- [x] Vitest 覆盖 Author、非 Author、未登录、输入验证和失败状态。
- [x] 全仓 lint、typecheck、74/74 Vitest 与 Web production build 通过。
- [x] Migration 与 SQL 权限脚本在本地 PostgreSQL 真实执行通过。
- [x] Author RPC 创建真实执行通过；非 Author/anon 拒绝通过。
- [x] 非法 Category、deprecated Tag 回滚与无部分 Work 通过。
- [x] `works` 与 `work_tags` 原子事务通过。
- [x] Product Owner 要求的 Runtime Validation 完成，Step02 Accepted。

## Step03 — Edit Work / Article UI Shell

Status: **Not Authorized**

### Objective

新增 owner-scoped 编辑壳层：

- `/studio/works/[workId]/edit`
- `/studio/articles/[articleId]/edit`

### In scope

- 从现有 Studio fixture 读取并预填当前作者内容；
- Cancel / Back；
- Preview Placeholder；
- disabled Save 与 Publish。

### Out of scope

- 真实更新、状态修改、发布、Supabase 或 Repository。

### Acceptance

- 当前作者可进入自己的 draft/published Work/Article；
- 其他作者与未知资源返回 Not Found；
- URL 只传资源 ID，owner ID 来自 Trusted Identity；
- 所有保存和发布动作 disabled。

## Step04 — Form Experience Foundation

Status: **Not Authorized**

### Objective

在不产生写入的前提下补齐创建/编辑表单体验。

### In scope

- client validation、必填与长度校验；
- 字数统计与 validation error message；
- unsaved changes UI 提示；
- loading skeleton 与 error banner。

### Out of scope

- 保存、自动保存、Server Action、Supabase 或 Repository。

### Acceptance

- 表单校验只在客户端运行；
- 不触发任何写入路径；
- 测试覆盖 validation 与 disabled submit。

## Step05 — Draft Workflow Shell

Status: **Not Authorized**

### Objective

解释 Draft → Editing → Ready → Publish 创作流程，但不改变任何真实状态。

### In scope

- 状态说明；
- disabled action bar；
- “将在后续 Sprint 开放”提示；
- workflow timeline / status panel。

### Out of scope

- 真实状态转换、Publish、Archive、Delete、Revision 或 Supabase。

### Acceptance

- 用户能够理解创作流程；
- 所有动作 disabled；
- 不存在写入路径。

## Step06 — Freeze & Handoff

Status: **Not Authorized**

### Objective

仅做 Sprint 002D 文档收口，不新增功能。

### Required documentation

- `README.md`；
- `docs/10_Author/README.md`；
- Phase 2 README；
- 本 Sprint 文档；
- `.ai/PROJECT_STATUS.md`；
- `.ai/CHANGELOG.md`；
- `.ai/MEMORY.md`。

### Freeze record

完成后记录：

- Create Work UI Shell；
- Create Work Draft Persistence；
- Edit UI Shell；
- Form Experience；
- Draft Workflow Shell。

继续明确未完成：

- Edit、Publish、Archive、Delete 与 Article/Chapter 写入；
- Studio owner-only Read Repository；
- Revision、正文 schema 校验与状态机。

## Final authorization boundary

本文件记录 Sprint 002D 的范围、顺序、边界和验收合同；Step02 已完成工程与 Runtime 验证并正式 Accepted。Step03 及后续 Step 仍需 Product Owner 分别明确授权。
