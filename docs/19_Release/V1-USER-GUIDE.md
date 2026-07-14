# Fandom Harbor V1 使用教程

状态：V1 文档已完成；线上入口待 Preview Deployment 生成后补充
适用版本：2026-07-14 已验收 V1 baseline

## 1. 访问与测试入口

本轮部署类型为 `Local only`，尚未生成新的 Preview / Production URL。

- 本地 Web：`http://127.0.0.1:3000`
- Homepage：`/`
- Archive：`/archive`
- Search：`/search`
- 普通登录：`/auth/sign-in`
- 注册：`/auth/sign-up`
- Author Studio：`/studio`

适合提供给测试用户的页面是 Homepage、Archive、Search、Published Work、Published Chapter、公开 Author Profile、Sign-in 与 Sign-up。`/studio` 只面向 Author；Admin 使用独立 Admin App，不应把 Admin 地址当作普通测试入口公开传播。

确认线上版本时，应同时检查：地址栏为 Product Owner 提供的 Preview / Production 域名、HTTPS 正常、页面标题为 Fandom Harbor，并将部署页面显示的 commit 与本次 Release baseline 对照。当前没有可供对照的新线上 URL。

## 2. 账号类型与权限边界

### Guest

未登录可以访问 Homepage、Archive、Search 与公开 Author Profile，查看公开作品发现信息。需要账号的阅读或私人入口会引导登录。Guest 没有 Studio、Admin、角色管理或草稿访问权限。

### Reader

Reader 可以登录、浏览 Archive、使用 Search、查看 Published Work / Chapter，并使用本地阅读历史与书签。Reader 不具备 `work:author`，页首不显示 Studio；直访 `/studio` 按当前逻辑重定向 `/archive`。Reader 看不到任何 Draft Work 或 Draft Chapter。

### Author

Author 同时具有 Reader 侧能力，并可以进入 `/studio` 创建作品草稿、保存正文和章节、管理标签、选择发布章节，再从 Reader 侧检查公开结果。Author 只能管理自己的内容，不能访问其他 Author 的草稿，不能获得 Admin 能力，也不能绕过 Published-only 边界。

### Admin

Admin 使用独立 Admin App / Admin Shell，不使用 Web 端 Reader / Author 页面作为后台。Admin 与普通账号使用同一 Supabase 注册名/密码身份体系，但只有 active Membership 且具备 `admin` 或 `super_admin` Role Grant 的账号才能进入。

普通 Admin 可以管理 Membership，并授予或撤销 Author；不能授予 Admin / Super Admin。后台当前主要是身份与权限管理骨架，不是完整内容审核或站点配置中心。

### Super Admin

Super Admin 具有 Admin 能力，并可授予或撤销 `admin` / `super_admin`。系统阻止撤销或停用最后一个有效 Super Admin。角色、Membership 与授权操作要求填写原因，并写入 audit log。

## 3. Author 使用教程

1. 打开 `/auth/sign-in`，使用注册名和密码登录。
2. 登录后从页首进入 Studio，或直访 `/studio`。
3. 打开「作品管理」→「新建作品」，填写标题、简介、分类与标签。
4. 点击「保存草稿」。新建页只负责建立草稿，不在该表单直接发布。
5. 从作品列表进入作品详情，选择「管理章节、标签与发布」。
6. 在编辑页可保存标签、新建章节草稿、修改章节标题与正文。
7. 在「选择发布章节」中勾选允许公开的章节，点击「发布所选章节」。未勾选章节保持或转为草稿。
8. 发布后从作品详情选择「Reader 查看」，或到 Archive / Author Profile 核对公开结果。

Author 不能管理其他人的作品、授予角色、进入 Admin App、删除当前未开放的 Chapter，或把 Draft 内容直接暴露到 Reader 路径。

## 4. Reader 使用教程

1. 在 `/auth/sign-in` 使用注册名与密码登录。
2. 从 `/archive` 按发布时间或标题浏览 Published Works。
3. 从 `/search` 输入关键词，查找公开作品或公开作者。
4. 进入 Work Detail 后选择已发布章节开始阅读。
5. 阅读设置可调整主题、字号、行高与阅读宽度；书签和历史保存在当前浏览器。
6. Reader 没有 Studio，因为该账号没有 `work:author` capability。直访 `/studio` 会到 `/archive`。

Reader 不能读取 Draft、编辑作品、发布章节、管理角色或进入 Admin。

## 5. 邀请码与注册

V1 注册仍需要邀请码。

1. 在 `/auth/sign-up` 填写注册名、密码与邀请码。
2. 邀请码由有权创建邀请的现有成员按项目受控流程提供；不要在公开聊天或文档传播真实邀请码。
3. 邀请码失败的常见原因包括：格式错误、已过期、已撤销、使用次数耗尽或远程 Migration / Environment 不完整。
4. 当前未实现无需邀请码的公开注册窗口。
5. 本地 QA 邀请码只能通过安全凭据命令查看，不属于正式或公开邀请码。

## 6. Light / Dark

页首提供主题切换按钮。切换后偏好保存在当前浏览器；换浏览器、清理站点数据或使用隐私窗口时可能回到默认主题。

## 7. FAQ

### 登录失败怎么办？

确认正在使用正确的 Web 或 Admin 入口、注册名没有多余空格、密码属于当前环境。测试账号应先确认当前访问的是 Local、Preview 还是 Production；不同环境账号不一定互通。

### 注册失败怎么办？

检查注册名与密码规则，以及邀请码是否有效、未过期、未撤销且仍有可用次数。不要反复公开粘贴邀请码。

### Reader 为什么看不到 Studio？

Studio 只对具有 Author capability 的账号显示。Reader 直访 `/studio` 会重定向 `/archive`，这是 V1 的预期权限行为。

### Author 为什么看不到某个草稿？

Studio 查询按 owner 隔离。确认草稿属于当前登录 Author，并确认当前访问环境与创建草稿时一致。

### 已发布内容为什么 Reader 侧看不到？

确认 Work 已进入 published 状态，并在「选择发布章节」中勾选了对应章节。未勾选章节仍是 Draft；也应检查访问环境、公开路径与缓存刷新。

### Admin 登录入口和普通入口一样吗？

不一样。普通用户使用 Web `/auth/sign-in`；Admin 使用独立 Admin App 的 `/auth/sign-in`。账号体系相同，但应用、Shell、域名和 capability 检查独立。

### 如何确认当前是 Preview 还是 Production？

以 Product Owner 提供的域名和 Vercel deployment 信息为准，并核对 commit。不要只根据页面外观判断。当前任务没有生成 Preview URL。

### 测试账号和正式账号如何区分？

Local QA 账号只由 `pnpm qa:fixture` 生成，凭据只通过 `pnpm qa:credentials` 在本机查看。Preview / Production 正式账号由 Product Owner 单独管理，不应复用本地凭据。

## 8. 安全注意事项

- 不在文档、Issue、截图或聊天中保存真实密码。
- 不记录 Supabase secret、service role key、Vercel token 或数据库密码。
- 不随意公开 Admin 域名或 Admin 登录链接。
- 测试账号与正式账号分开管理。
- Admin / Super Admin 授权属于高风险操作，必须由有权人员执行、填写原因并保留审计记录。
- 不允许普通 Admin 或普通用户绕过 UI 直接修改数据库。

详细 Admin 操作见 `V1-ADMIN-GUIDE.md`。
