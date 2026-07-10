# Sprint 002E — Minimal Draft Editor

Status: **Step02 Completed**

## Identity

- Product Phase: Phase 2 — Publishing
- Priority: V1 Write → Save → Publish → Read closure
- Product Owner authorization: 2026-07-01
- Dependency: Sprint 002D-Step02 Create Work Draft Persistence Accepted
- Current authorization: Step02 complete; Publish and later workflow Steps remain separately gated

## Step01 — Draft Editor Data Contract & Edit Shell

### Objective

为当前 Author 的 draft Work 建立最小正文读取合同和可输入但不可保存的编辑页面壳，为下一步正文草稿保存准备安全边界。

### Outcome

- `/studio/works/[workId]/edit` 已建立 owner-only 读取路由。
- `works` 继续只保存容器元信息；正文继续复用 `chapters.content`。
- 编辑页读取按 `position` 排序的首个 Chapter；没有 Chapter 时显示空 textarea。
- 未登录跳转 `/auth/sign-in`，非 Author 返回 `/archive`，无效/未知/published/非 owner 资源返回 Not Found。

## Step02 — Draft Body Save

### Objective

让 owner Author 可以在 `/studio/works/[workId]/edit` 真实保存 draft 正文，但不开放 Publish。

### Approved database change

- 新增最小 Migration：`20260701113000_chapters_body_update_grant.sql`
- 仅追加：

```sql
grant update (
  content,
  content_schema_version
) on public.chapters to authenticated;
```

- 不修改表结构。
- 不修改现有 RLS policy。
- 不放宽 owner/admin 边界。
- 不新增 RPC。

### Data contract

```text
Route
→ Server Action
→ StudioDraftEditorGateway
→ createDraftWorkEditorService
→ DraftWorkEditorStore
→ Supabase Repository
→ existing Work/Chapter RLS
```

- Service 继续要求 `work:author`。
- owner 不来自 URL、query、client props 或 request body。
- Repository 先读取 `status = draft` 的 Work，再读取当前首章：
  - 存在首章：只更新同一 Chapter 的 `content` 与保持中的 `content_schema_version`
  - 不存在首章：创建 `position = 1`、`slug = chapter-1`、`title = 第一章`、`status = draft` 的默认首章
- 不修改 `work.status`
- 不设置 `published_at`
- 不触发 Publish

### UI behavior

- 编辑页 textarea 继续使用 plain-text 输入体验。
- “保存正文”已启用，提交时显示 pending 状态。
- 保存成功后重定向回同一编辑页，并显示真实成功提示。
- “发布”继续 disabled。
- 错误时显示可访问的失败提示；不伪造保存成功。

### Reader and security boundary

- Reader published-only 数据流未修改。
- `works`、`chapters`、`articles` 的 published-only 合同保持成立。
- Reader、anon 与非 owner 不能更新 Chapter 正文。
- owner 只能保存自己的 draft Work 首章正文。

### Tests

- Service：
  - Author 允许保存 draft body
  - 非 Author 在 Store 调用前拒绝
- Repository：
  - 非法 `workId` 在 provider 调用前拒绝
  - 无首章时创建首章
  - 有首章时更新同一 Chapter
- Web：
  - Server Action 覆盖未登录、非 Author、owner 成功、Not Found 与失败提示
  - `plainTextToContentDocument` 与 `contentDocumentToPlainText` 双向覆盖
- SQL Runtime：
  - anon 不可更新 Chapter 正文
  - Reader 不可更新 Chapter 正文
  - owner Author 可更新自己的 draft Chapter 正文
  - owner Author 不可更新其他作者 Chapter 正文
  - 无章节 draft Work 可创建默认首章
  - 同一 Chapter 可后续继续更新
  - 保存正文不会发布 Work

### Runtime validation

- `supabase db reset --local --no-seed` 真实执行并应用最新 Migration。
- `phase_2_content_domain.sql` 在本地 PostgreSQL 真实通过。
- Runtime 覆盖 Category/Tag seed、draft RPC、chapter body grant 和 published-only 合同。

### Acceptance

- [x] `/studio/works/[workId]/edit` 已在 production route table 中。
- [x] owner Author 可读取并保存自己的 draft Work 正文。
- [x] 未登录跳转 `/auth/sign-in`。
- [x] 非 Author 返回 `/archive`。
- [x] 非 owner、未知、published Work 返回 Not Found。
- [x] 无章节时首次保存创建默认首章。
- [x] 有章节时更新同一 Chapter。
- [x] 写入 `chapters.content` 并保持 `content_schema_version`。
- [x] 不改变 `work.status`，不设置 `published_at`，不触发 Publish。
- [x] Reader published-only 合同不受影响。
- [x] 不新增 RPC，不修改表结构、RLS、package 或 lockfile。
- [x] `pnpm lint`、`pnpm typecheck`、86/86 Vitest 与 Web production build 通过。
- [x] 本地 Supabase Migration reset 与 SQL suite 通过。

## Deferred

- Publish、Archive、Delete。
- 自动保存、审核、Revision 与状态机。
- 富文本/Markdown、图片、封面和成年内容字段。
- Chapter 管理、多章节编辑壳与 Work Detail Polish。
- 后续 Read 闭环的 published Reader 切换。

## Next authorization boundary

Sprint 002E 的后续步骤如进入 Publish、状态流转、Revision、章节管理、RLS/Schema/RPC 扩展，必须获得新的明确授权。
