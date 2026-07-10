# Author Documentation

Status: Sprint 002C-Step01 through Step04 accepted; Step05 Freeze & Handoff complete; Sprint 002C frozen

Sprint 002D-Step02 Create Work Draft Persistence is Accepted. Sprint 002E-Step02 Draft Body Save and Sprint 002F Minimal Publish Workflow are complete.

## Routes

- `/studio`: Author Studio 统一入口，不提供统计 Dashboard。
- `/studio/works`: 作者作品列表、状态和创建/编辑占位。
- `/studio/works/new`: 从数据库读取 Category/Tag，提供客户端与服务端校验，并允许 Author 原子保存 Work Draft；发布不可用。
- `/studio/works/[workId]`: 当前作者作品详情、元信息与章节摘要只读页。
- `/studio/works/[workId]/edit`: 当前 Author 的 draft Work 最小编辑器；正文 textarea 可真实保存到首个 Chapter，并可直接发布到 Reader。
- `/studio/articles`: 作者独立文章列表、状态和创建/编辑占位。
- `/studio/articles/[articleId]`: 当前作者文章详情、元信息、状态与关联信息只读页。
- `/author`: 重定向到 `/studio`。
- `/author/invitations`: 保留现有作者邀请码管理。

## Layout

- Studio route tree 共享 Sidebar、Header 与 Content Layout。
- Sidebar 提供 Studio 首页、作品管理和文章管理。
- Header 提供邀请码管理与返回 Reader。
- 每个页面提供 `aria-label="面包屑"` 的 Breadcrumb，并用 `aria-current="page"` 标记当前位置。

## Data and permission boundary

- Studio 继续复用 `Work`、`Article`、`ContentStatus` 与 `work:author` capability。
- 数据流为 `StudioContentGateway → createStudioContentService → StudioContentStore`。
- Service 从 TrustedAccessContext 注入 `ownerUserId`；页面不接受或构造 owner 身份。
- Work Detail 的 URL 只提供 `workId`；Service 注入 owner ID，Store 对 owner 与 work 同时匹配。
- Article Detail 的 URL 只提供 `articleId`；Service 注入 owner ID，Store 对 owner 与 article 同时匹配。
- Studio 只读列表/详情仍使用 draft/published fixture；Create Work Draft 已使用独立 Supabase Repository。
- 草稿写入流为 `Server Action → Studio Work Draft Gateway → createWorkDraftService → AuthorWorkDraftStore → create_author_work_draft RPC`。
- owner 不来自页面、URL、query 或 FormData；RPC 固定使用 `auth.uid()`，Service 与 Server Action 复核 `work:author`。
- Studio 可显示当前作者 draft Work/Chapter/Article；Reader 继续只读取 published Work/Article/Chapter。
- 当前数据库隐藏 `owner_user_id`，因此本 Step 不实现不安全的 owner-only Supabase 查询，也不把公开 published feed 冒充作者列表。

## Empty, error and boundary states

- 无作品或文章时，列表显示明确空状态并提供返回 Studio 的路径；Work 创建入口已开放。
- Work/Article 不存在或不属于当前作者时，使用对应的 Studio Not Found，不显示 URL ID、owner 字段或数据库细节。
- Work 详情区分无章节与全部章节为草稿；全草稿章节仅在 Studio 可见，Reader 不提供阅读入口。
- Work/Article 详情与 Not Found 均提供返回对应列表及 Studio 的明确导航。
- Work Draft 保存已开放；Draft Body Save 也已开放。发布、归档及其他创建入口继续 disabled。
- Draft Editor 只读取 `status = draft` 的 Work；正文来自按 position 排序的首个 Chapter，owner 由现有 RLS 判定。
- 正文保存流为 `Server Action → StudioDraftEditorGateway → createDraftWorkEditorService → DraftWorkEditorStore → Supabase Repository`。
- 无 Chapter 时首次保存会创建 `position = 1` 的默认首章；有 Chapter 时只更新同一首章正文，不会发布作品。
- Publish 流继续复用同一 Gateway/Service/Repository 边界；发布时会保存当前正文，再将 Work 与首章流转到 `published`，随后跳转到 Reader 已发布章节页。

## Deferred

以下能力未实现，且全部需要新的授权：

- 完整 Edit Work、Create/Edit Article。
- Archive、Delete。
- Studio Owner Read Repository、Rich Text Editor。

章节编辑、封面、统计 Dashboard、评论管理、数据库写入与 Pen Name authorship 同样未开放。

## Handoff

Sprint 002F 已完成最小 Publish Workflow，并通过本地 Supabase SQL 实测。多章节发布、Article 发布、Revision 与状态机仍需后续独立授权。
