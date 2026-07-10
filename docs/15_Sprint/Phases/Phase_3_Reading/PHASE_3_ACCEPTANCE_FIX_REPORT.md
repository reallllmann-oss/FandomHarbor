# Phase 3 验收问题修复报告

Status: PASS — Product Owner Accepted  
Date: 2026-07-03  
Mission: Phase 3 Reader / Author Studio Acceptance Fix

## 1. 修复范围

| ID   | 状态                  | 交付结果                                                                                                               |
| ---- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| R-01 | 已完成                | 首页、Reader 作品卡、作品详情、章节阅读页均显示可点击作者；进入 `/author/{slug}`。                                     |
| R-02 | 已完成                | 作者公开主页只聚合 Published Work，并链接作品详情；不读取 Studio 私有数据。                                            |
| R-03 | 已完成                | 全站 Reader Shell 在未登录时显示登录/注册，在已登录时显示注册名、Studio（Author）和退出。                              |
| R-04 | 已完成                | 首页、Reader Library、作者主页及本地书架新记录展示作者入口；不会链接其他人的 Studio。                                  |
| A-01 | 已完成（V1 最小方案） | 作品管理页展示有序章节，可编辑标题，并选择随作品发布的章节；未选择章节保持或转为 Draft。                               |
| A-02 | 已完成                | 支持以逗号新增、移除和替换作品标签；过滤空值和大小写重复，并校验数量与长度。新标签复用 pending/additional 治理模型。   |
| A-03 | 已完成                | Published Work 提供 TXT 下载，按章节顺序输出标题、作者、简介、Published 章节标题与正文；不导出 Draft。                 |
| A-04 | 已完成                | Studio 作品列表切换到真实 owner-scoped Repository，同时展示 Draft 与 Published，并显示状态与管理入口。                 |
| A-05 | 已完成                | 草稿可从 Studio 列表进入管理页，继续编辑章节、保存并发布；Published Work 也可返回管理。                                |
| A-06 | 已完成（授权边界内）  | 复用 Chapter 模型开放列表、新建、标题/正文编辑、草稿保存、发布选择和返回路径。现有数据库没有章节删除权限，保持未开放。 |

## 2. Migration / RPC

- Migration：`supabase/migrations/20260703090000_published_work_public_authors.sql`
- RPC：`public.get_published_work_authors(text[])`
- 返回字段：`work_slug`、`author_slug`、`display_name`
- 权限：仅返回 Published Work 且 owner 同时具备未撤销 Author grant 与 active Membership 的公开作者字段。
- 明确不返回：`owner_user_id`、`registration_name`、邮箱、Membership、角色明细或 Studio 数据。
- 未修改表结构、RLS、Policy、角色模型、依赖或 Seed。
- RPC 已部署远程；后续 Studio owner-read P0 修复 Migration 部署后，本地与远程 Migration history 为 12/12。
- 未更新 Supabase 生成类型：仓库没有生成式 Supabase Database Types；返回值在 Repository Zod 边界显式校验。

## 3. 测试与验证

- Web Vitest：15 files / 76 tests 通过。
- Services Vitest：4 files / 21 tests 通过。
- Database Vitest：5 files / 32 tests 通过。
- Web typecheck、lint、production build：通过。
- 本地 Supabase 最终从零应用 12 条 Migration：通过。
- `phase_2_content_domain.sql`：PostgreSQL `ON_ERROR_STOP` 通过。
- `phase_3b_social_relationships.sql`：包含新 RPC published-only / draft exclusion 验证，通过。
- 远程 `get_published_work_authors` 使用 publishable key 返回 HTTP 200。
- 浏览器：未登录 Header 显示登录/注册；首页作者链接和公开作者主页 published-only 列表通过；未发现浏览器 error。

- `pnpm validate`：通过；全仓 format、lint、typecheck、test 及 Web/Admin/Docs production build 全部通过。

## 4. 权限与数据边界

- Studio 查询继续使用用户 Session、现有 RLS 与 Service 注入的 trusted owner。
- Reader 只通过 Published Work/Chapter 查询与新增只读 RPC 读取公开数据。
- 自定义标签复用既有 Author insert pending tag 和 owner-only `work_tags` 权限。
- Chapter 删除没有现有 grant / policy，本 Mission 没有扩大权限。

## 4.1 Studio 作品管理 P0 修复

人工验收发现 `/studio/works` 无法打开。导航、路由与 Author 守卫均正确；真实根因是 Studio Repository 使用不可读的私有列 `owner_user_id` 进行 PostgREST 过滤，PostgreSQL 返回 `permission denied for table works`。

不能直接移除过滤，因为 active Reader 的 Published Work 读取策略会让 Studio 混入其他作者作品。最终新增同一条受控 Migration：

- `public.list_my_studio_works(p_limit integer default 100, p_offset integer default 0)`
  - 返回：`id`、`category_id`、`title`、`slug`、`summary`、`status`、`published_at`、`created_at`、`updated_at`。
- `public.get_my_studio_work(p_work_id uuid)`
  - 返回 JSON：`work`、`category`、`chapters`、`tags`。
  - `work` 不含 `owner_user_id`。
  - `category` 仅含 `id`、`name`、`slug`、`description`。
  - `chapters` 仅含章节 ID、Work ID、顺序、标题、slug、状态、正文、schema version 与时间字段。
  - `tags` 仅含标签 ID、名称、slug、类型、治理状态、canonical ID 与描述。

两个 RPC 均为 authenticated-only，只在 `auth.uid()` 同时具备 active Membership 和有效 Author grant 时返回当前用户拥有的 Draft / Published Work。未修改表结构、RLS、Policy、角色模型或写入权限。

Migration：`supabase/migrations/20260703100000_studio_owner_read_rpcs.sql`。已部署远程，匿名调用返回 HTTP 401。本地 SQL 验证 Visitor 无执行权限、Reader 返回空、Author 只返回自己的三个 Work、其他作者详情返回空且响应不含 `owner_user_id`。

## 5. 剩余风险与限制

- 章节发布选择和标签关联复用现有 Repository 多步写入，不是新增原子 RPC；中途网络失败时需要刷新核对状态。
- Chapter 删除未开放。
- 已登录 Author 的完整浏览器写入链路已由 Product Owner 使用远程 Author 账号复验通过。
- TXT 为纯文本 V1，不包含富文本样式、封面或附件。
- Fixture 作者主页仅作为本地演示回退；真实 Published Work 使用远程公开作者映射。

## 6. 建议人工验收

1. 未登录打开 `/` 和 `/author/fandom-harbor-archive`，确认登录/注册及公开作者作品。
2. Author 登录后打开 `/studio/works`，确认 Draft 与 Published 同时显示。
3. 新建 Work 后进入 `/studio/works/{workId}/edit`，新增两个章节并修改标题/正文。
4. 新增、删除、替换标签，回到 `/works` 和作品详情确认展示。
5. 只选择部分章节发布，确认 Reader 目录和 TXT 均不包含未选 Draft Chapter。
6. 从 Reader 点击作者名称进入真实作者主页，再打开作者 Published Work。
7. 下载 TXT，核对标题、作者、简介、章节顺序和正文。
8. 返回 Studio 管理已发布作品并继续编辑。

## 7. 人工验收记录

- [x] R-01 至 R-04 通过。
- [x] A-01 至 A-06 在上述边界内通过。
- [x] TXT 内容与权限通过。
- [x] Product Owner 于 2026-07-03 确认本 Mission Pass。

此前发布链路与 Studio owner-read P0 已修复并完成复验，不再构成阻塞。
