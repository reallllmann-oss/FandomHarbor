# Reader Documentation

Status: Sprint 002H Bookshelf / Library completed

## Reading routes

- `/works`: active Member 的作品与独立文章目录。
- `/works/[slug]`: 作品摘要与已发布章节目录。
- `/works/[slug]/chapters/[chapterSlug]`: 章节正文、上一章/下一章与可展开目录。
- `/articles/[slug]`: 独立文章正文。

所有路由继续要求 `archive:read` capability；Visitor 跳转登录，inactive/suspended/revoked Membership 跳转门禁页。页面不建立第二套权限判断。

Sprint 002G 完成后，以上四个公开读取路由统一经 hybrid published gateway 读取：优先使用数据库中的 published 内容，未命中时才回退到 fixture 中的 published 内容。Reader 不会暴露 draft Work、draft Chapter 或 draft Article。

Sprint 002H 完成后，`/works` 同时承担 Reader Library Hub：它在 published-only 前提下提供继续阅读、最近书签、本地书架摘要与最小客户端筛选，而 `/archive` 保持本地书签与最近阅读的详细列表。

## Reader Library Hub

- `/works` 新增三张本地回访卡片：
  - Continue Reading
  - Local Shelf Summary
  - Quick Return / Latest Bookmark
- 页面支持客户端筛选：
  - 全部内容
  - 仅作品
  - 仅文章
- 页面支持按标题或摘要做本地搜索，不触发数据库写入或新的查询合同。
- 本地存储不可用时，Library Hub 安全回退为 published 内容目录，不阻塞阅读。

## Reading controls

- Light/Dark 复用全站 Theme Provider。
- 字号变量：17px、19px、21px。
- 行高变量：1.65、1.8、2.0。
- 阅读宽度变量：58ch、68ch、78ch。
- 控件支持键盘焦点和 `aria-pressed`，移动端保持至少 44px 触控高度。
- Canonical localStorage key：`fandom-harbor.reader-preferences.v1`。
- Key 内保存 `theme`、`fontSize`、`lineHeight` 与 `measure`；不保存账号、作品、章节或阅读历史。
- 偏好只作用于当前浏览器 origin，不依赖登录、不写数据库，也不进行跨设备同步。
- Storage 缺失、损坏或被浏览器拒绝时使用安全默认值，正文阅读不受影响。
- Light/Dark 通过共享 `useAppTheme` 适配器与全站 Theme Provider 同步；Theme Provider 继续维护自身兼容状态。

## Chapter navigation

- 阅读页展示“第 N / 共 M 章”，并提供可聚焦的章节目录直达入口。
- 上一章/下一章卡片分别展示目标标题；第一章和末章显示明确的不可用状态。
- 章节目录默认可见，当前章节同时使用视觉标识和 `aria-current="page"`。

## Local reading history

- Canonical localStorage key：`fandom-harbor.reading-history.v1`。
- 状态结构为 `{ version: 1, entries: ReadingHistoryEntry[] }`，最多保留最近 30 条有效记录。
- `work` 记录作品 slug、标题与最近访问时间。
- `chapter` 记录作品/章节 slug 与标题、章节序号、总章数、派生进度百分比和最近阅读时间。
- `article` 记录文章 slug、标题与最近阅读时间。
- 同一作品、章节或文章按内容身份更新，记录按 `lastReadAt` 倒序排列。
- 存储不包含账号 ID，不依赖登录、不写数据库，也不跨设备同步；损坏数据、未知版本或 Storage 拒绝访问时安全回退为空历史。

## Continue Reading

- 作品详情页从本地历史选择该作品最近阅读的、仍存在于当前已发布目录中的章节。
- 有有效记录时展示章节标题、章节位置、基础进度和“从上次章节继续”入口；无记录时保留原“开始阅读”入口。
- 章节页、文章页和作品详情页仅在客户端挂载后写入历史，不改变 Server Component 数据流或 Membership 门禁。

## Step 03 verification

- Workspace lint、typecheck、38 个 Vitest 与三套 Next.js production build 通过。
- Web 共 4 个测试文件、12 个测试通过，其中 Reading History 新增 5 个测试。
- 浏览器确认公开首页无回归、控制台无错误，未登录作品详情继续跳转 `/auth/sign-in`。
- 已登录 Continue Reading 视觉回归等待本地身份/数据库 Runtime 可用；存储、查询和失效章节过滤由自动化测试覆盖，未绕过门禁。
- Sprint 002A DB Runtime Pending 状态保持；没有调用 Supabase、写数据库或连接生产库。

## Local bookmarks

- Canonical localStorage key：`fandom-harbor.reader-bookmarks.v1`。
- 状态结构为 `{ version: 1, entries: ReaderBookmark[] }`，最多保留最近添加的 100 个有效书签。
- `chapter` 书签保存作品/章节 slug 与标题、章节序号和 `bookmarkedAt`。
- `article` 书签保存文章 slug、标题和 `bookmarkedAt`。
- 章节页与文章页使用 `aria-pressed` 显示当前内容是否已书签，并允许添加或取消。
- 写入失败或 Storage 不可用时按钮不会显示虚假成功状态；损坏数据与未知版本安全回退为空集合。

## Reader Shelf

- `/archive` 在保留 `archive:read` 门禁的前提下完善为“我的本地书架”。
- 章节页和文章页提供“我的本地书架”直达入口。
- 书架读取 Bookmark 与 Reading History 两个独立 key，分别展示本地书签和最近 10 条阅读记录。
- 书签可跳转章节或文章；最近阅读可跳转作品详情、章节或文章。
- 本地书架不绑定账号、不跨设备同步、不写数据库，也不等同于云端收藏功能。

## Step 04 verification

- Workspace lint、typecheck、43 个 Vitest 与三套 Next.js production build 通过。
- Web 共 5 个测试文件、17 个测试通过，其中 Reader Bookmark 新增 5 个测试。
- 浏览器确认公开首页及 Reader 入口无回归、控制台无错误，未登录 `/archive` 继续跳转 `/auth/sign-in`。
- 已登录 Bookmark/Reader Shelf 视觉回归等待本地身份/数据库 Runtime 可用；书签状态、增删、链接、坏数据与 Storage 禁用由自动化测试覆盖。
- Sprint 002A DB Runtime Pending 状态保持；没有调用 Supabase、写数据库或连接生产库。

## Step 05 QA matrix

- 作品详情：无已发布章节时显示明确空状态；失效作品 slug 进入全局缺失内容页。
- 章节阅读：失效 work/chapter slug 进入全局缺失内容页；首章/末章导航保持明确禁用状态。
- 文章阅读：失效 article slug 进入全局缺失内容页。
- 本地书架：水合读取期间显示加载状态；无书签、无阅读记录和 Storage 不可用分别显示对应状态。
- 本地失效链接：Bookmark 与 Reading History 解析只接受规范内容 slug；不合法记录被丢弃，格式合法但内容已删除的记录由全局 404 提供恢复路径。
- 运行错误：全局错误页使用 alert 语义，提供重试与返回阅读目录两条恢复路径。

## Step 05 accessibility polish

- 阅读设置区使用命名 section、隐藏标题、fieldset/legend 与原生按钮；每个选择按钮包含设置组、选项和当前状态的可访问名称。
- 阅读偏好保存状态使用 polite status，不打断正文阅读。
- Bookmark 按钮使用动态 `aria-label`、`aria-pressed` 和 polite status，明确内容名称、添加/取消状态及 Storage 不可用原因。
- Reader Shelf 首次读取使用 status；书签与最近阅读链接包含“打开书签”或“继续阅读”的完整可访问名称。
- 章节目录继续使用 `aria-current="page"`；上一章/下一章、目录入口与所有主要操作保持原生键盘焦点。

## Step 05 persistence QA

- `fandom-harbor.reader-preferences.v1` 的 Light/Dark、字号、行高与阅读宽度继续整体 round-trip。
- 缺失、损坏、未知选项或 Storage 禁用继续安全回退；刷新不写数据库，也不依赖登录状态。

## Step 05 verification

- Workspace lint、typecheck、43 个 Vitest 与三套 Next.js production build 通过。
- Browser QA：全局 404 标题与两条恢复链接通过；Light/Dark 点击切换和刷新保持通过；`/archive` 未登录守卫通过；控制台无错误。
- Browser QA：主题原生按钮可获得键盘焦点；应用内浏览器的 Enter/Space 注入未产生原生 click，记录为工具限制，不作为按键激活通过证据。
- 源码保持原生 button/link/fieldset/legend/details/summary 语义；受保护阅读页的人工键盘和完整视觉检查等待本地身份/数据库 Runtime 可用后补充。
- 字号、行高、阅读宽度和主题组合继续由 localStorage round-trip、未知值和 Storage 失败测试覆盖。
- Sprint 002A DB Runtime Pending 状态保持；没有调用 Supabase、写数据库或连接生产库。

## Data boundary

Reader route 调用 `ReaderContentGateway → createContentService(ContentStore)`。数据库不可用期间注入只读 fixture store；未来仅替换 gateway 的 store factory，不改页面、领域类型或权限模型。正文从 schema-versioned JSON 安全映射为 React nodes，不渲染原始 HTML。

## Deferred

新业务功能、云端书签/收藏、评论、Kudos、通知、推荐、跨设备同步、Author Dashboard 与编辑器不属于 Step 05。
