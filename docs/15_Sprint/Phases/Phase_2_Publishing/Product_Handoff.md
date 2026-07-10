# Phase 2 Product Handoff

状态：Pass — Product Owner Accepted  
交付日期：2026-07-02  
验收范围：Phase 2 V1 最小闭环（注册 / 登录 → Reader 阅读 → Author 创建草稿 → 保存正文 → 发布 → 阅读 → 本地书架回访）

> 本文是开发团队交付给 QA / Product Owner 的人工验收说明。工程完成不等于产品验收通过；人工验收结论由 Product Owner 填写在文末。

> 2026-07-02 历史回归记录：远程 Supabase 当时缺少 Phase 2 Auth Migration，因此重新打开 P0。该部署缺口现已修复，但 Product Owner 真实注册验收尚未完成。

> 2026-07-02 远程准备更新：九条 Migration 已部署，Email Confirm 已关闭，RPC 与 QA 邀请码已验证，Web 已重启并读取远程环境。等待 Product Owner 完成真实注册与登录；同一新账号进入 Studio 前仍需按产品规则手工授予 Author。

> 2026-07-02 Author grant 更新：Product Owner 已使用 `Auther001` 完成远程注册与登录；该 active Membership 已获得手工 Author grant。等待 Product Owner 刷新或重新登录后进入 Studio，并确认最终结果。

> 2026-07-02 最终验收：Product Owner 已确认 `Auther001` 成功进入 Studio。远程注册 → 登录 → Studio 链路通过，Phase 2 Auth P0 已解除，Phase 2 状态更新为 Pass。

## 1. 如何启动项目

### 1.1 环境要求

- Node.js：`24.18.0`（允许 Node.js 24.x）
- pnpm：`11.7.0`
- Supabase CLI：当前已验证 `2.108.0`
- Docker Desktop：本地 Supabase 必需

### 1.2 本地 QA 环境

当前仓库的 `.env.local` 指向远程 Supabase；本文提供的 QA 账号位于本地 Supabase。人工验收前必须确认 Web 应用与测试账号使用同一个 Supabase 环境，不能混用。

1. 在仓库根目录启动本地 Supabase：

   ```bash
   supabase start
   ```

2. 查看本地 Supabase 环境信息：

   ```bash
   supabase status -o env
   ```

3. 将输出中的：

   - `API_URL` 作为 `NEXT_PUBLIC_SUPABASE_URL`
   - `PUBLISHABLE_KEY` 作为 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   同步到：

   - 根目录 `.env.local`
   - `apps/web/.env.local`
   - `apps/admin/.env.local`

4. 启动前台 Web 应用：

   ```bash
   pnpm --filter @fandom-harbor/web dev
   ```

5. 如需同时查看 Web、Admin 与 Docs：

   ```bash
   pnpm dev
   ```

   三个应用并发启动时端口不固定，必须以终端中每个应用打印的 `Local:` 地址为准。

### 1.3 启动异常优先检查

- 登录始终失败：先确认应用使用的是本地 Supabase URL，而不是远程 URL。
- 环境变量显示 `undefined`：确认三份 `.env.local` 已同步，然后重启应用。
- 页面端口不对：不要按 `3000 / 3001 / 3002` 猜应用，以终端 `Local:` 为准。
- 执行过 `supabase db reset`：本地 QA 账号和邀请码会被清除，需要重新准备测试数据。

## 2. 从哪个网址进入

前台验收入口：Web 应用终端打印的 `Local:` 地址。

当前单独启动 Web 时通常为：

```text
http://localhost:3000
```

如果端口被占用，以终端实际地址为准。

Supabase Studio 仅用于辅助查看本地数据，不是产品验收入口：

```text
http://127.0.0.1:54323
```

## 3. 从哪个页面开始

推荐从登录页开始：

```text
/auth/sign-in
```

登录后的默认落点：

- Reader：`/archive`
- Author：先到 `/archive`，再进入 `/studio`

主验收入口：

- Reader 阅读目录：`/works`
- Author 工作台：`/studio`
- 新建作品：`/studio/works/new`

## 4. 测试账号

以下账号只用于当前本机 Supabase QA 环境，不是生产或远程环境账号。

| 角色   | 注册名         | 密码              | 预期权限                                                          |
| ------ | -------------- | ----------------- | ----------------------------------------------------------------- |
| Reader | `Phase2Reader` | `Fandom-QA-2026!` | 可进入归档、阅读已发布内容、使用本地书架；不可进入 Studio         |
| Author | `Phase2Author` | `Fandom-QA-2026!` | 包含 Reader 权限；可进入 Studio、创建作品草稿、保存首章正文并发布 |

注册流程测试邀请码：

```text
FandomHarbor-Phase2-QA-Invite-2026
```

邀请码当前最多允许 20 次使用，有效期为创建后 30 天。它只授予 active Membership / Reader，不授予 Author、Admin 或 Super Admin。

账号与邀请码已在 2026-07-02 的当前本地 Supabase 中创建，并通过 Auth API 验证登录成功。执行数据库重置后它们会失效。

## 5. 页面路由清单

### 5.1 Web 前台与身份

| 路由            | 权限                   | 用途 / 预期结果                                                     |
| --------------- | ---------------------- | ------------------------------------------------------------------- |
| `/`             | Visitor                | 产品首页与示例作品预览                                              |
| `/auth/sign-in` | Visitor                | 使用注册名 + 密码登录                                               |
| `/auth/sign-up` | Visitor                | 使用注册名 + 密码 + 邀请码注册；不需要邮箱验证                      |
| `/access`       | 已登录但无 Reader 权限 | 旧邀请码兑换入口；当前正常注册会直接获得 Reader，通常不会停留在此页 |
| `/archive`      | Reader                 | 本地书架、最近阅读、书签与退出登录                                  |

### 5.2 Reader

| 路由                                   | 权限   | 用途 / 可用样例                                                    |
| -------------------------------------- | ------ | ------------------------------------------------------------------ |
| `/works`                               | Reader | 阅读目录、作品/文章筛选、继续阅读与本地书架摘要                    |
| `/works/[slug]`                        | Reader | 作品详情；样例：`/works/glass-harbor`                              |
| `/works/[slug]/chapters/[chapterSlug]` | Reader | 章节阅读；样例：`/works/glass-harbor/chapters/below-the-tide-line` |
| `/articles/[slug]`                     | Reader | 独立文章阅读；样例：`/articles/why-an-archive-needs-quiet`         |

### 5.3 Author Studio

| 路由                           | 权限   | 用途 / 可用样例                |
| ------------------------------ | ------ | ------------------------------ |
| `/author`                      | Author | 兼容入口，自动跳转 `/studio`   |
| `/author/invitations`          | Author | 创建和查看邀请码               |
| `/studio`                      | Author | Author Studio 首页             |
| `/studio/works`                | Author | Fixture 作品管理列表           |
| `/studio/works/new`            | Author | 创建真实数据库 Work 草稿       |
| `/studio/works/[workId]`       | Author | Fixture 作品只读详情           |
| `/studio/works/[workId]/edit`  | Author | 真实数据库草稿编辑、保存与发布 |
| `/studio/articles`             | Author | Fixture 文章管理列表           |
| `/studio/articles/[articleId]` | Author | Fixture 文章只读详情           |

Fixture 详情样例：

- Work：`/studio/works/33000000-0000-4000-8000-000000000001`
- Draft Work：`/studio/works/33000000-0000-4000-8000-000000000003`
- Article：`/studio/articles/35000000-0000-4000-8000-000000000001`
- Draft Article：`/studio/articles/35000000-0000-4000-8000-000000000002`

### 5.4 非本次 Phase 2 主验收入口

| 应用  | 路由                            | 说明                                                            |
| ----- | ------------------------------- | --------------------------------------------------------------- |
| Admin | `/`、`/auth/sign-in`、`/access` | Phase 1 管理壳；本次未提供 Admin QA 账号，不作为 Phase 2 主验收 |
| Docs  | `/`                             | 预留只读文档应用，不作为 Phase 2 产品验收                       |

## 6. 建议验收流程

### A. Visitor 与身份边界

1. 退出登录后打开 `/`，确认首页可访问。
2. 打开 `/works`，确认跳转 `/auth/sign-in`。
3. 使用 `Phase2Reader` 登录，确认进入 `/archive`。
4. 退出后打开 `/auth/sign-up`，用新的唯一注册名、测试邀请码和至少 8 位密码注册。
5. 确认注册后不要求邮箱验证，并可直接使用注册名登录。
6. 新注册账号访问 `/studio`，应被送回 `/archive`，证明邀请码不会授予 Author。

### B. Reader 阅读闭环

1. 使用 `Phase2Reader` 登录并进入 `/works`。
2. 检查 Work / Article 类型筛选和关键词筛选。
3. 打开 `/works/glass-harbor`，确认只显示已发布章节。
4. 阅读第一章并切换上一章 / 下一章、章节目录。
5. 调整浅色 / 深色、字号、行高和阅读宽度，刷新后确认偏好保留。
6. 添加章节书签，返回 `/archive`，确认书签与最近阅读出现。
7. 打开 `/articles/why-an-archive-needs-quiet`，确认文章正文、书签和阅读历史可用。
8. 使用无效 slug，确认出现安全的 Not Found 页面且可返回。

### C. Author 创建、保存与发布闭环

1. 使用 `Phase2Author` 登录，进入 `/studio`。
2. 检查 `/studio/works`、Fixture Work 详情、`/studio/articles` 和 Fixture Article 详情。
3. 进入 `/studio/works/new`，填写唯一标题、简介、分类与标签，保存草稿。
4. 确认保存后进入 `/studio/works/[workId]/edit`。
5. 输入纯文本正文并保存，刷新页面，确认正文仍存在。
6. 点击发布，确认跳转到 Reader 章节页。
7. 返回 `/works`，确认刚发布的作品出现在已发布目录并可再次打开。
8. 再创建一个草稿但不发布，直接尝试从 Reader 访问其 slug，确认草稿不可读。

### D. 权限与失败路径

1. Reader 访问 `/studio`：应返回 `/archive`。
2. 未登录访问 `/archive`、`/works`、`/studio`：应返回登录页。
3. Author 输入无效 UUID 或他人的草稿 ID：应显示 Not Found。
4. 注册时使用错误、耗尽或重复邀请码：不得创建半成功账号。
5. 使用重复注册名（大小写变化也算重复）：应提示注册名已占用。

### E. 基础体验

1. 在桌面与窄屏各走一遍 Reader 和 Author 主流程。
2. 使用键盘完成登录、筛选、阅读设置、书签和表单提交。
3. 检查焦点可见、错误提示可读、按钮禁用状态明确。
4. 检查浏览器控制台没有阻断流程的错误。

## 7. 已知限制

### 数据与环境

- 当前仓库 `.env.local` 指向远程 Supabase；本文 QA 账号位于本地 Supabase。环境不一致时账号一定登录失败。
- 远程注册 RPC 与 Migration 已恢复；Product Owner 已完成真实注册链路验收，Auth P0 已解除。
- QA 账号和邀请码未写入 seed；`supabase db reset` 后会消失。
- 未建立生产 Vercel / Supabase 验收环境，也没有生产测试账号。
- 本地多应用端口动态分配，不能固定假设 Web 一定是 `3000`。

### Reader

- Reader 使用 hybrid gateway：数据库 published 内容优先，同时保留 published fixture 回退。
- 阅读偏好、最近阅读和书签仅保存在当前浏览器 `localStorage`，不绑定账号、不跨设备同步、不写数据库。
- 当前没有云端收藏、推荐、搜索后端、评论或 Kudos。

### Author / Publishing

- `/studio/works` 与 `/studio/articles` 仍使用 Fixture；新建的真实数据库草稿不会回写到 Studio 列表。草稿创建成功后必须依靠自动跳转保存编辑 URL。
- Work 编辑器是纯文本 `textarea`，不是 TipTap 富文本编辑器。
- 只支持首章最小闭环；没有多章节创建、排序或独立章节编辑。
- 发布只更新 Work 与首章；没有完整状态机、发布事务编排或回滚 UI。
- Article 目前只有 Fixture 列表 / 详情和 Reader 读取；创建、编辑、保存与发布未开放。
- Archive、Delete、封面上传、Pen Name 署名和 Owner Repository 完整接入未开放。
- Revision、Diff、Restore 尚未实现。因此 Phase 2 原始蓝图中的版本历史验收项不能判定通过。

### 身份与恢复

- V1 没有邮箱通道，也没有密码找回能力。
- `/access` 是旧兑换兼容页；新注册流程已经在注册事务中自动兑换邀请码并建立 active Membership。
- 本次没有 Admin / Super Admin 测试账号，也不验收管理后台。

### 文案与验收状态

- 部分首页和 Studio 说明仍保留早期 Sprint / Fixture 文案，与当前 Phase 2 最小闭环状态不完全同步。
- 自动化测试与构建已通过；远程支持的页面级注册、登录和 Studio 进入也已由 Product Owner 人工确认。
- `Acceptance.md` 中 Revision / Restore 等原始 Phase Exit Criteria 仍未完成；本次只能验收“Phase 2 V1 最小闭环”，不能把完整 Phase 蓝图标记为全部通过。

## 8. 人工验收记录

验收人：Product Owner

验收日期：2026-07-02

验收环境与 Web URL：当前 Phase 2 验收地址

结论（通过 / 有条件通过 / 不通过）：**通过（Pass）**

发现的问题：作者后台与读者后台暂未发现其他明显问题；注册 P0 已解除。

是否允许进入下一 Phase：Phase 2 已通过；Phase 3 实现仍需独立规划与明确授权。

Pass 验收证据：

1. 远程 Supabase 已部署九条 Migration。
2. 远程 Email Confirm 已关闭。
3. Product Owner 已完成一次真实远程注册。
4. `Auther001` 已使用注册名 + 密码成功登录。
5. 手工授予 Author 后已成功进入 Studio。
