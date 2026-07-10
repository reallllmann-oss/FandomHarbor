# Sprint 002F — Minimal Publish Workflow

Status: **Completed**

## Identity

- Product Phase: Phase 2 — Publishing
- Priority: V1 Create → Edit → Save → Publish → Read closure
- Product Owner authorization: 2026-07-01
- Dependency: Sprint 002E-Step02 Draft Body Save completed
- Execution mode: Continuous Sprint Mode

## Mission

让 Author 可以把自己的 draft Work 发布为 published，并立即进入 Reader 已发布页面，完成 V1 最小闭环。

## Step01 — Publish Path

### Objective

在不新增 Migration、RPC、RLS 或 Schema 的前提下，建立最小 Publish UI、Server Action、Service、Repository 和错误处理。

### Data flow

```text
Draft Editor Form
→ submitDraftEditor Server Action
→ StudioDraftEditorGateway
→ createDraftWorkEditorService
→ DraftWorkEditorStore
→ Supabase Repository
```

- 保存与发布共用同一个表单动作，`intent` 为 `save` 或 `publish`。
- Publish 时先持久化当前 textarea 正文，再执行发布状态流转。
- owner 仍然只来自 trusted identity + Supabase session/RLS。

### Publish lifecycle

- 如果 draft Work 没有 Chapter：
  - 创建默认首章：`position = 1`、`slug = chapter-1`、`title = 第一章`
  - 同时写入当前正文
- 如果已有首章：
  - 更新同一 Chapter 的正文
- 然后将：
  - 首章 `status` 设为 `published`
  - 首章 `published_at` 写入时间
  - Work `status` 设为 `published`
  - Work `published_at` 写入时间

### Boundaries

- 不新增 RPC。
- 不修改表结构、约束或 RLS。
- 不触发 Revision、Version History、Schedule Publish、Archive、Delete 或 Workflow Engine。
- 不发布其他 Chapter；只保证当前首章可读。

### UI behavior

- 编辑页的“发布到 Reader”按钮已启用。
- 发布前如果正文为空，返回明确错误。
- 发布成功后直接跳转到公开章节页：

```text
/works/[workSlug]/chapters/[chapterSlug]
```

- 保存失败与发布失败都返回 honest error；不伪造成功。

## Step02 — Public Read Closure

### Objective

确保刚发布的内容不只数据库已 published，而且 Reader 页面确实能读到。

### Reader gateway adjustment

- 新增 `createHybridReaderContentGateway`
- 读取优先级：
  - 先读数据库中的 published 资源
  - 没命中时回退到既有 fixture published 资源

### Updated routes

- `/works`
- `/works/[slug]`
- `/works/[slug]/chapters/[chapterSlug]`

### Outcome

- 新发布的 Work 会出现在 Reader Library 中。
- 新发布的 Work detail 和 Chapter reading page 可以真实读取。
- 历史 fixture published 内容仍然可用。

## Acceptance

- [x] Author 可从自己的 draft 编辑页触发 Publish。
- [x] Publish 成功后 Work 变为 `published`。
- [x] `published_at` 正确写入。
- [x] Reader 只能读取 published Work/Chapter。
- [x] draft Work 仍然不会暴露给 Reader。
- [x] Publish 成功后可直接进入 Reader 已发布章节页。
- [x] 不新增 Migration、RPC、RLS、Schema、package 或依赖。
- [x] 本地 Supabase reset 与 Phase 2 SQL suite 通过。
- [x] `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm --filter web build` 通过。

## Verification

- Workspace lint passed.
- Workspace typecheck passed.
- Workspace tests passed.
- Web production build passed.
- `supabase db reset --local --no-seed` passed.
- `phase_2_content_domain.sql` passed with publish coverage:
  - Reader cannot publish
  - owner Author can publish own draft Work
  - empty draft Work can gain a first Chapter and then publish
  - published Reader counts increase only after publish

## Deferred

- Revision / Version History
- Schedule Publish
- Archive / Delete
- Workflow Engine / Moderation
- Multi-Chapter publish workflow
- Article publish workflow

## Next Sprint

推荐进入 Sprint 002G — Public Reading，继续收口：

- published 内容列表/目录一致性
- published Article 路径与读取
- Reader Library 完整度
- 发布后导航、空状态和回退路径
