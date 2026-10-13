# Admin P1-08 — Unified Account Navigation Plan

状态：`P1-08 ADMIN NAVIGATION COMPLETE — P1-08F AUTHORIZATION REQUIRED`

基线：remote `main` `0991f5ea7f13bb57902bc9065283c61ad2a03a2d`

## 1. Current state

当前 Admin 是独立的 Next.js App Router 应用。实际页面只有：

| URL             | 当前功能                                          | 访问边界                                         |
| --------------- | ------------------------------------------------- | ------------------------------------------------ |
| `/`             | Site Copy 八字段读取、Review 与受控保存           | Server Component 每次读取 trusted access context |
| `/access`       | 身份 Search、Detail、Audit 与 ordinary governance | Service 每次用例重新验证 live Admin access       |
| `/auth/sign-in` | registration-name/password 登录                   | 登录后读取 Membership、Role 与 capability        |

不存在独立 Dashboard、Settings、Content、Works、Audit Explorer 或账号设置
route。`/access` 内的 Audit 是身份详情的一部分，不是全局 Audit 页面。当前 `/`
虽然在导航中标为“概览”，实际内容是“站点文案”。

### Current Component Map

| 文件                                                             | 组件/入口                                             | 当前职责                                                                            | Desktop / Mobile                                                  | 重复与去留建议                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `apps/admin/src/app/layout.tsx`                                  | `RootLayout`                                          | 安装 `AppProviders`、静态 metadata、全局 `AdminLayout` 与异步 `AdminHeaderActions`  | 同一 shell 包住 protected 页面和 sign-in                          | 保留 root providers/metadata；建议将 protected shell 移到 route group，避免 sign-in 加载后台账号 shell |
| `packages/ui/src/components/layouts.tsx`                         | `SharedLayout`                                        | Brand、desktop nav、theme、header actions、mobile `<details>`、可选 sidebar、footer | 以 768px 切换 desktop/mobile                                      | 通用 Reader/Docs 结构可保留；Admin 特化职责应拆出，避免继续扩张通用组件                                |
| `packages/ui/src/components/layouts.tsx`                         | `AdminLayout`                                         | 硬编码 `/` 与 `/access`，同时传给 Header 和 sidebar                                 | Desktop/Tablet/Mobile 都可能显示 sidebar；Mobile 另有 `<details>` | 同一导航重复 2–3 次；由新的 `AdminShell` 取代，不在此阶段移除 Reader/Docs 布局                         |
| `apps/admin/src/app/admin-header-actions.tsx`                    | `AdminHeaderActions`                                  | server-side 读取 access；有 `admin:operate` 时显示 Logout                           | Desktop “退出登录”，Mobile “退出”                                 | Logout action 保留；组件由 Identity + Account Menu foundation 取代                                     |
| `apps/admin/src/app/auth/actions.ts`                             | `signIn` / `signOut`                                  | Server Actions；登录后检查 trusted `admin:operate`；Logout 后跳转 sign-in           | 与 viewport 无关                                                  | 安全合同保留；UI 只复用 `signOut`，不得复制 Auth 逻辑                                                  |
| `apps/admin/src/app/auth/sign-in/page.tsx`                       | `AdminSignInPage`                                     | 登录表单与失败文案                                                                  | 响应式单卡片                                                      | 保留；从 protected Admin shell 中隔离                                                                  |
| `apps/admin/src/app/page.tsx`                                    | `AdminHomePage`                                       | `/` 的 Site Copy 页面、当前 Role 文案、重复 `/access` 与 Logout                     | 页面本身 shrink-safe                                              | 保留业务内容；删除未来 shell 重复入口。不是 Dashboard redesign                                         |
| `apps/admin/src/app/site-copy-editor.tsx`                        | `SiteCopyEditor`                                      | Site Copy client-side edit/review/result visual state                               | 自身响应式                                                        | 原样保留；不纳入导航组件职责                                                                           |
| `apps/admin/src/app/access/page.tsx`                             | `AccessAdministrationPage` / `AccessGovernanceView`   | Search、Detail、Audit、ordinary governance 容器                                     | 390px 已有 shrink-safe contract；XL 双栏                          | 原样保留业务页面；接入统一 page context，不重做业务 IA                                                 |
| `apps/admin/src/app/access/mutation-panel.tsx`                   | `AccessMutationPanel`                                 | ordinary account Review/confirm/result client state                                 | 单栏优先，large 双栏                                              | 原样保留；不得进入 account menu 或 navigation state                                                    |
| `apps/admin/src/app/access/loading.tsx`                          | `AccessGovernanceLoading`                             | route loading state                                                                 | 通用响应式                                                        | 保留；未来由 route metadata 提供一致 page title 文案                                                   |
| `apps/admin/src/app/error.tsx` / `loading.tsx` / `not-found.tsx` | status pages                                          | 全局错误、加载、404                                                                 | 共享状态组件                                                      | 保留；统一 shell 内行为需要回归测试                                                                    |
| `apps/admin/src/lib/identity-access.ts`                          | `createAdminIdentityAccess` / `getAdminAccessContext` | 从 cookies 创建 server Auth/Repository，解析 trusted Session 与 access              | Server only                                                       | 保留为安全根；扩展独立 shell summary loader，而非把 Session 下放 client                                |
| `apps/admin/src/lib/admin-home-data.ts`                          | `loadAdminHomeData`                                   | `/` 的 authenticated/authorized page guard 与 Site Copy read                        | Server only                                                       | 保留；shell gate 不替代页面/用例级授权                                                                 |
| `apps/admin/src/lib/identity-access-governance.ts`               | governance adapter                                    | 每次 Service 调用重新取得 live access                                               | Server only                                                       | 完整保留；导航可见性绝不替代此授权                                                                     |
| `apps/admin/src/lib/admin-presentation.ts`                       | Role/time/UI helpers                                  | 当前只有治理 Role label 与 Header action visibility                                 | Server/client-neutral pure functions                              | 抽取统一 Role display mapping；保持纯展示，不承担授权                                                  |
| `apps/admin/src/proxy.ts`                                        | `proxy`                                               | 刷新/验证 Supabase Session cookie，设置 surface header                              | 所有 matched routes                                               | 保留；它当前不是 route authorization middleware，规划也不把它误作授权层                                |
| `packages/ui/src/styles.css`                                     | shared shell styles                                   | Header、account、mobile details、admin grid、breakpoints                            | `<=767` mobile；`768–1023` compact/tablet                         | 基础 token/focus/touch styles 保留；Admin-specific shell 样式应由明确命名的组件 contract 管理          |

## 2. Problems

1. `AdminLayout` 把同一数组同时渲染为 desktop Header nav 与 sidebar；小屏又渲染
   mobile `<details>`，导航存在重复和层级不明。
2. `/` 被标为“概览”，但实际是“站点文案”；没有真正 Dashboard，current route
   也没有 active state 或 `aria-current`。
3. Header 账号区只显示 Logout。管理员无法确认当前 registration name 或 Role。
4. `AdminHeaderActions` 与各页面中的 Logout/跳转形成 UI 重复；账号行为没有唯一归属。
5. `<details>` 只复制 desktop links，不提供 page title、返回逻辑、当前 route、账号区、
   focus return、Escape/drawer 语义或 route-change close contract。
6. Tablet 把 `.admin-grid` 改为单列，但 sidebar 仍存在，导致正文前重复导航。
7. 全局 title 只有静态 `Fandom Harbor 管理后台`；route/page title 由页面各自书写，
   shell 无法建立当前位置语义。
8. 通用 `SharedLayout` 同时承担 Reader、Admin、Docs；继续加入 account menu 与 drawer
   会扩大跨应用耦合。
9. `TrustedAccessContext` 只有 identity UUID、Membership、Roles、capabilities，当前 Admin
   没有“当前账号 registration name”读取。UUID 不应成为面向用户的身份显示。
10. Header 的隐藏/显示是 presentation helper，但 page authorization 分散在 home loader
    与 governance Service。这一现状安全但容易被未来 UI 误解，需要在架构上明确分层。

## 3. Scope

P1-08 建立一个 Admin 专用、数据可信且响应式的 Shell：

- 显示当前 registration name、当前 Admin Role label 与唯一 Logout 入口。
- 统一 desktop Header、desktop navigation、mobile Header、mobile navigation、account
  identity area 与 current route/page context。
- 由一份 typed navigation/page configuration 驱动 `/` 与 `/access`。
- 为返回主站以及 capability-aware Author Studio 入口预留真实 cross-surface link；只在
  URL 可由既有 `NEXT_PUBLIC_SITE_URL` 安全解析且 live capability 允许时显示。
- 保持 page/use-case 的 server-side authorization 不变。

## 4. Out of scope

- Dashboard cards、Dashboard 数据/指标、Dashboard 视觉或新 Dashboard IA。
- 不存在的 Content、Works、Settings、Audit Explorer 或 account settings 页面。
- 新 Role/capability、Role precedence 的数据库语义、Auth contract 或 Session 结构。
- DB Migration、RLS、RPC、Policy、Grant、MFA、P1-07C 安全逻辑。
- Production/QA/Vercel mutation、deployment 或 release。

## 5. Identity data flow

### IDENTITY DATA FLOW = CURRENT

```text
HttpOnly cookies
  -> createServerAuthProvider(...).getSession()
  -> Supabase getUser() + session identity consistency check
  -> TrustedSession { identity.id, expiresAt }
  -> createSupabaseAccessContextRepository.getForIdentity(identity)
       -> memberships.state
       -> non-revoked role_grants.role
  -> createTrustedAccessContext
       -> Membership + Roles
       -> derived capabilities
  -> Server Component / Service authorization
```

- **Trusted server-side data**：由 server cookies、provider user validation、
  `memberships` 与 active `role_grants` 生成的 `TrustedSession` / `TrustedAccessContext`。
- **Authorization data**：`membershipState`、`roles`、派生 `capabilities`。Home 要求
  `admin:operate`；governance Service 还要求 active Membership、live `admin` 或
  `super_admin` Role、`admin:operate`，且每次用例重新检查。
- **Client session data**：Admin 目前不向 client 暴露 Session 或 Role；client 组件只
  管理编辑/Review 视觉状态。这一点应保持。
- **Display-only data**：当前页面把 capability 映射为“管理员/超级管理员”，但 Header
  没有 registration name。`TrustedAccessContext.identity.id` 是可信关联键，不是 UI 名称。
- **Proxy**：只刷新/检查 Session cookie；不执行 route authorization。

### IDENTITY DATA FLOW = PROPOSED

```text
Protected Admin server layout
  -> getAdminShellSessionSummary()
       -> trusted Auth Session
       -> accessRepository.getForIdentity(identity)      [authorization source]
       -> self profile registration_name by identity.id  [display-only source]
  -> require active admin:operate before protected shell
  -> serializable AdminIdentityPresentation
       { registrationName, roleLabel, navigationVisibility }
  -> presentation components

Page loader / Service
  -> independently re-check existing trusted authorization
```

`registration_name` 应采用仓库已有的 `apps/web/src/lib/identity-access.ts` server-side
self-profile 读取模式，并封装为 Admin 专用 typed loader；不得从 client storage、JWT
display metadata、query string 或表单值取得。profile 读取只用于显示，缺失/读取失败不能
提升权限，也不能回退显示 UUID/email。实现阶段应选定明确的 safe unavailable state，
并以测试锁定。

Shell 可以依据 trusted capability 决定显示 cross-surface entry，但“看得见/看不见”都不
是授权。`/`、`/access`、Server Action 与 governance Service 继续执行现有检查。

## 6. Role display rule

底层值不变，统一 presentation mapping：

| 状态/Role                           | 中文 label | Admin Header 规则                                                               |
| ----------------------------------- | ---------- | ------------------------------------------------------------------------------- |
| unauthenticated / Guest             | 未登录     | 不渲染 protected account area；显示 sign-in 页面                                |
| active Membership、无 elevated Role | 读者       | 无 Admin 入口；不得进入 Admin Header                                            |
| `author`                            | 作者       | 单独无 Admin 入口；同时有 Admin Role 时只作为 capability-aware Studio link 条件 |
| `admin`                             | 管理员     | 允许显示                                                                        |
| `super_admin`                       | 超级管理员 | 允许显示                                                                        |

多 Role 的 Admin display precedence 只用于展示：
`super_admin > admin > author > reader`。授权仍检查 Set 中实际 Role/capability，不使用
display label 或 precedence。Account menu 可列出额外有效 Role，但 trigger 只显示最高
Admin Role，避免 `akumie · 超级管理员 · 作者` 在窄 Header 失控。

## 7. Desktop IA

当前真实功能的唯一一级 Admin IA：

1. `站点文案` → `/`（修正当前不准确的“概览”）。
2. `身份与权限` → `/access`。
3. Account area → registration name、Role、Logout。

Cross-surface links 与 Admin primary navigation 分区：

- `返回主站`：指向既有 canonical Web site URL，不伪造 Admin 内部 route。
- `创作中心`：仅当 trusted live capabilities 含 `work:author` 时显示，目标为 Web
  `/studio`；目标 URL 未配置时 fail closed 不显示。

不创建“内容/作品”“站点设置”“审计/系统”等占位导航。未来真实 route 出现后再增加。
P1-08C 的实际选择是 Sidebar 作为唯一 Desktop primary navigation；Header 只保留 Product
identity、当前页面 context、Theme 与 Account Menu。原因是 Sidebar 能随未来真实 Admin
route 扩展，且不会让长 registration name 与 primary links 在 Header 争宽。Header 中原有
重复 links 已移除。cross-surface links 未加入：Admin 当前没有同时满足 canonical Web URL
与 server-resolved capability presentation 的安全来源，P1-08C 不硬编码 host，也不让 client
推断授权。

## 8. Mobile IA

P1-08D 的 canonical Mobile/Tablet IA 适用于 `<=1023px`：

1. 顶部三分区 Header：左侧为确定性 Back 或“管理后台”产品 context，中间为 canonical
   page title，右侧只有一个 Navigation trigger。
2. 同一个 `AdminMobileNavigation` drawer 同时承载两项 primary navigation 与独立 Account
   section，避免第二套 account trigger/menu。
3. Account section 展示完整 registration name、Admin Role 与唯一 canonical Logout；不显示
   UUID、email、MFA、capability 或 Auth metadata。
4. 当前项使用文案 + `aria-current="page"` + 背景、字重与实体 marker，不只依赖颜色。
5. `/` 不显示 Back；`/access` 及只有 list/search query 的 variant 返回 `/`；带
   `subject` 的 Detail 只删除 `subject`，保留 `q`、`cursor`、`auditCursor` 等现有 query，
   回到同一 list/search context。未知 `/access/*` fail-safe 到 canonical `/access` context。
6. Drawer 采用 modal dialog contract：focus 进入 Close、Tab trap、Escape/backdrop close、
   关闭后 focus 返回 trigger、背景 inert、body scroll lock。

320px 时 account trigger 采用图标/紧凑按钮并提供完整 accessible name；375/390/430px
保持同一信息顺序，不通过隐藏 Logout 或 Role 来腾空间。长 registration name 只在 trigger
截断，打开的 account surface 必须换行展示完整名称。

## 9. Navigation behavior rules

### A. 登录后默认落点

保持现有 `/`，即“站点文案”。P1-08 不把它改造成 Dashboard，也不新增 `/dashboard`。

### B. 当前 route 高亮

使用同一 `adminNavigationConfig` 的 exact/prefix match rule；`/` 必须 exact match，
`/access` 包含其 query-driven Detail/Audit 状态。active link 使用 `aria-current="page"`。

### C. 子页面返回逻辑

当前只有 `/access` query detail，采用确定性 URL 变换而非盲目 `history.back()`。未来真实
子 route 必须在 page config 中显式声明 parent/back target。

### D. Desktop / Mobile config

共享同一 typed config、label、href、match 与 capability predicate；只改变呈现组件。

### E. Logout

唯一 Account Menu Server Action 继续调用现有 `signOut()`，成功后
`/auth/sign-in`。页面内重复 Logout 在对应实现阶段移除。

### F. Session 失效

protected server loader/page loader 继续跳转 `/auth/sign-in`。不得先把 protected shell
或 identity data 发送到 client。

### G. Unauthorized route

保持 `/auth/sign-in?error=forbidden` 合同；导航 visibility 不替代 route/use-case guard。
sign-in 时无 Admin capability 继续执行现有 sign-out 后 redirect。

### H. Account dropdown

Trigger 再次点击关闭；outside pointer、Escape、route change、Logout submission 后关闭；
关闭后 focus 返回 trigger。同一时间只允许 account surface 或 nav drawer 打开。

### I. Keyboard / accessibility

Tab 顺序与视觉顺序一致；Enter/Space 打开；Arrow keys 仅在采用真正 ARIA menu pattern
时实现，否则使用普通 disclosure + links/buttons 语义，不混用不完整 menu semantics。

## 10. Proposed component architecture

| 建议组件/模块                                | 职责                                                                       | Boundary / data ownership                                                                | 不得承担                                               |
| -------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `AdminProtectedLayout`（route group layout） | 取得 trusted shell summary；unauthenticated/forbidden redirect；安装 shell | Server Component；拥有 initial trusted presentation model                                | 不替代 page/Service live authorization                 |
| `getAdminShellSessionSummary`                | Session、access、self profile registration name 的单一 server resolver     | Server-only；返回最小 serializable projection                                            | 不向 client 返回 UUID、Session、token、完整 access Set |
| `adminNavigationConfig`                      | `/`、`/access`、page label、match、parent/cross-surface policy             | 纯数据；desktop/mobile 共用                                                              | 不执行 authorization 或 DB read                        |
| `AdminShell`                                 | Header、main container、footer/safe area 的 Admin 专用组合                 | 以 Server Component 为主                                                                 | 不包含 Dashboard/business layout                       |
| `AdminHeader`                                | Brand/current page context、desktop nav、mobile triggers、account slot     | presentation；接收最小 props                                                             | 不读取 Session/DB                                      |
| `AdminNavigation`                            | desktop links、active route、cross-surface links                           | 小型 Client Component 可用 `usePathname`; data 来自 server                               | active state 不作为权限判断                            |
| `AdminMobileNavigation`                      | drawer/sheet open/close、focus/Escape、route-change close                  | Client Component；只拥有 UI state                                                        | 不拥有 identity/access truth                           |
| `AdminAccountMenu`                           | trigger、identity/Role 展示、Logout form、focus lifecycle                  | Client interaction shell + server-provided presentation props；form 调现有 Server Action | 不登录、不刷新 Role、不解析 JWT                        |
| `AdminIdentityBadge`                         | registration name 与 Role label 的 desktop/mobile presentation             | 可为纯 Server/presentational component                                                   | 不根据 label 授权                                      |
| `AdminPageHeader`                            | page title、可选 description/back action 的一致结构                        | presentation；由 page config/页面传值                                                    | 不设计 Dashboard cards                                 |
| `adminRoleLabel` / `selectAdminDisplayRole`  | 底层 Role 到中文 label 的纯映射                                            | 纯函数 + exhaustive tests                                                                | 不修改 Role，不生成 capability                         |

建议用 route group（如 `app/(protected)/layout.tsx`）隔离 protected shell 与
`app/auth/sign-in/page.tsx`，route group 不改变 public URL。业务 page 文件可在实现阶段机械
移动到 group 内，但必须单独验证 URL 不变、metadata/loading/error 边界不漂移。

## 11. Server / client boundary

### Server

- 验证 Session、解析 Membership/Role/capability。
- 读取 self `profiles.registration_name` 并生成 display-only projection。
- protected route redirect、page/use-case authorization、cross-surface visibility 初值。
- 提交 Logout Server Action。

### Client

- `usePathname` 计算 presentation active state。
- account popover 与 mobile drawer 的 open/close、focus return、Escape/outside interaction。
- 响应式纯视觉状态；不得持有原始 Session/JWT/cookie。

传给 client 的最小模型只包含 `registrationName`、中文 `roleLabel`、已过滤的 nav items。
即使 client props 被篡改，server route/Action/Service 仍必须拒绝未授权操作。

## 12. Responsive behavior

当前 Tailwind 4 使用默认 breakpoints；本地 CSS 另有 `<=767px` 与
`768–1023px` 两段。现有 Admin content 为 `px-4`、`sm:px-6`、`lg:px-8`，touch target
多为 `min-h-11`（44px）。建议不引入无必要的第三套 breakpoint vocabulary：

| Viewport   | Header / navigation                                                                                  | Identity                                            | Content                                         |
| ---------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| 320px      | 单行 compact header；title `min-width:0`；nav/account 各至少 44×44；drawer 全宽或 `min(22rem,100vw)` | trigger 不显示长名字；account sheet 完整换行        | 16px padding；任何固定宽度不得超过可用宽度      |
| 375px      | 同 320；保留 page title + 两个操作目标                                                               | 可显示 initials-free account icon + accessible name | 16px padding                                    |
| 390px      | 作为既有 Admin regression 主合同；不横向滚动                                                         | 同上                                                | 16px padding；保持现有 shrink-safe cards        |
| 430px      | 不提前压入 desktop nav；保持 mobile IA                                                               | 可选短 registration name，但不是验收依赖            | 16px padding                                    |
| 768–1023px | 与 Mobile 相同的 drawer；不显示 Sidebar，避免两项 nav + account + 长名称争宽                         | drawer Account section 显示完整名称与 Role          | 24px padding；无 sidebar 重复                   |
| `>=1024px` | Sidebar 显示两项 primary nav；Header 显示 Product/page context/account，不重复 links                 | name max width 8–12rem，ellipsis；menu 展示完整值   | 32px padding；main width 维持 `max-w-screen-xl` |

Header 顶/左右/抽屉底部使用 `env(safe-area-inset-*)`；不可只用 viewport 高度而忽略
mobile browser chrome。Role badge 必须有文本；ellipsis 元素提供打开后的完整名称，不依赖
`title` 属性作为唯一获取方式。

## 13. Accessibility

- 保留 skip link 与明显的 `focus-visible` ring。
- 所有 icon-only trigger 提供动态 `aria-label`、`aria-expanded`、`aria-controls`。
- active route 使用 `aria-current="page"`，同时有形态/字重标记，不只靠颜色。
- drawer 打开后 focus 移到标题或首个可操作项；Tab 不逃逸；Escape 关闭并返回 trigger。
- account disclosure 若不是 ARIA menu，就使用 button + region + 普通 link/form button，避免
  错误的 `menu/menuitem` keyboard contract。
- Logout 永远是可聚焦、至少 44×44 的真实 button；pending 时有可读状态并防重复提交。
- Screen reader trigger 文案包含当前 identity 与 Role，例如“账号：akumie，超级管理员”。
- reduced motion、200% zoom、长 registration name、中文/ASCII 混合文本、320px 无横向滚动
  纳入 acceptance。

## 14. Dashboard future compatibility

Dashboard redesign 状态：`HOLD`。

- `AdminShell` 只负责 global frame、page context 与 content slot，不知道 cards/grid/data。
- `AdminPageHeader` 与业务页面主体解耦；未来 card layout 可在 `/` 或新授权 route 内独立变化。
- Navigation config 不由 Dashboard cards 生成，也不把 `/` 假称为 Dashboard。
- content padding 由 shell token/contract 提供，业务 grid 可在其内部独立响应式升级。
- Account data resolver 与 menu 不依赖 `/` 页面，未来 Dashboard 不需要再次重构 identity。

## 15. Implementation stages

### P1-08B — Identity + Account Menu Foundation

- **Likely files**：`apps/admin/src/lib/identity-access.ts`、新 shell identity/presentation
  module、`apps/admin/src/app/admin-header-actions.tsx` 或替代组件、
  `apps/admin/src/app/layout.tsx` / protected route group、Role presentation tests。
- **Goal**：server-side registration name + trusted Role projection；desktop/mobile Account
  trigger；唯一 Logout；sign-in 与 protected shell 隔离。
- **Tests**：Admin/Super Admin label、multi-role precedence、profile missing/error、Guest/
  Reader/Author denial、Logout redirect、client props 不影响 authorization。
- **Acceptance**：真实 Admin 可见 username + Role + Logout；不显示 UUID/email/MFA；现有
  route/Action/Service authorization 不变。
- **Risk**：route group 移动的 loading/error/metadata 边界；重复 DB reads；self profile
  RLS/error semantics。
- **Effort**：Medium（2–3 engineering days + focused review）。

### P1-08C — Unified Desktop Navigation

- **Likely files**：新 `admin-navigation-config.ts`、`AdminShell`、`AdminHeader`、
  `AdminNavigation`；`packages/ui/src/components/layouts.tsx` 与 styles 的最小兼容调整；
  `apps/admin/src/app/page.tsx` 删除重复 links/Logout。
- **Goal**：一份 config；准确 labels；active route；Sidebar 成为唯一 Desktop primary
  navigation；Header 移除重复 links。cross-surface links 仅在安全来源完整时加入。
- **Tests**：exact/prefix match、`aria-current`、cross-surface fail-closed URL、页面内重复
  Logout 不存在、`/` 与 `/access` URL 不变。
- **Acceptance**：desktop 只有一个 primary navigation，当前 route 明确，页面业务不变。
- **Risk**：共享 `SharedLayout` 的 Reader/Docs regression；canonical Web URL 配置漂移。
- **Effort**：Medium（2–3 engineering days）。

### P1-08D — Mobile Navigation

- **Likely files**：新 `AdminMobileNavigation`、account interaction primitive、Admin shell
  styles/tests。
- **Goal**：真实 drawer/sheet、page title/back、active route、account surface、safe area、
  long-name handling。
- **Tests**：open/close、mutual exclusion、Escape、outside interaction、focus return、route
  change close、deterministic `/access` back URL。
- **Acceptance**：320/375/390/430 无横向滚动；所有目标 >=44px；keyboard/screen reader
  contract 完整。
- **Risk**：focus trap 与 React hydration；mobile browser viewport/safe area 差异。
- **Effort**：Medium–Large（3–4 engineering days + device QA）。

### P1-08E — Responsive / Accessibility / Regression

- **Likely files**：Admin contract tests、`packages/ui/src/styles.css` 或 Admin-owned style
  module、最小 Playwright smoke（若复用现有 harness）、planning/acceptance evidence。
- **Goal**：跨 viewport、keyboard、zoom、session/authorization、Reader/Docs shared UI
  regression closure。
- **Tests**：targeted Vitest + lint/typecheck/build；少量 Playwright shell smoke，不建立重型
  browser suite。
- **Acceptance**：responsive/accessibility matrix PASS；Product Owner protected Preview
  visual smoke 另行授权；Dashboard 仍无变化。
- **Risk**：CSS global selector 对 Web/Docs 的无意影响；人工 screen-reader/device coverage。
- **Effort**：Medium（2–3 engineering days + manual acceptance）。

## 16. Test plan

最小自动化矩阵：

1. Pure unit：Role label 与 precedence、navigation config/match/back URL。
2. Server loader：unauthenticated、inactive、Reader、Author、Admin、Super Admin、multi-role、
   profile unavailable；确认只返回最小 presentation projection。
3. Existing Auth actions：成功登录、forbidden sign-out、Logout redirect 保持。
4. Component contract：identity 文本、Role 文本、无 UUID/email/MFA、唯一 Logout form。
5. Desktop nav：准确两个真实 route、active state、cross-surface capability predicate。
6. Mobile interaction：toggle、Escape、focus、outside click、route close、drawer/account 互斥。
7. Accessibility basics：`aria-current`、expanded/controls、landmark labels、touch target、
   focus visible、reduced motion。
8. Responsive contract：320/375/390/430、768、1024、1440；长 registration name、200%
   zoom、无水平滚动。
9. Regression：Admin targeted tests + `lint` + `typecheck` + `build`；共享 UI 变更时增加
   Web/Docs targeted tests。
10. 最小 browser smoke 只覆盖登录后 identity、desktop/mobile navigation、Logout 与
    unauthorized redirect。仓库已有 Playwright，可复用；不为本阶段设计重型 E2E 平台。

## 17. Acceptance gates

- P1-08B 未获单独授权前不得修改 Product code。
- username 来自 server-side self profile；Role/capability 来自 trusted server access。
- 任何 client state/label/navigation visibility 均不承担 authorization。
- `/`、`/access`、`/auth/sign-in` 行为与 URL 不漂移。
- Admin/Super Admin 显示准确；Guest/Reader/Author 不获得 Admin shell。
- Desktop 无重复 nav/sidebar；Mobile 不是 desktop links 的机械压缩。
- 320–1440 target matrix、keyboard/focus/screen reader basics PASS。
- Dashboard redesign 保持 `HOLD`；无 DB/Auth/P1-07C security change。
- Preview/deployment/Production acceptance 必须是未来独立授权边界。

## 18. Risks and blockers

| 风险                                                    | 影响                                                 | 控制                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Admin registration name 尚未进入 `TrustedAccessContext` | Header 无现成 username                               | server-side self-profile display resolver；不扩大 Auth contract，不显示 UUID fallback |
| root layout 同时包住 sign-in                            | protected identity loader 可能在 public sign-in 运行 | route group 隔离；URL 不变的 contract tests                                           |
| shared `SharedLayout` 同时服务 Web/Admin/Docs           | Admin 改动可能回归其他 surface                       | Admin-specific composition；共享层只做最小 primitive 调整并跑 targeted regression     |
| layout 与 page loader 重复 access read                  | 延迟/额外 DB call                                    | 请求级 memoization 可评估，但不得用 stale client cache 替代 live authorization        |
| cross-origin Web/Studio link URL                        | 错误环境可能跳错 host                                | 只用已解析的 `NEXT_PUBLIC_SITE_URL`，缺失/非法 fail closed；不硬编码 deployment URL   |
| mobile drawer focus implementation                      | keyboard/screen reader regression                    | 采用单一已验证 primitive 或完整 disclosure/dialog contract；测试 focus lifecycle      |
| current route 来自 client `usePathname`                 | hydration 后才标 active                              | 只影响 presentation；无授权影响；SSR 可通过明确初始 path contract 后续优化            |
| static global metadata                                  | browser title 无 page context                        | 在 B/C 阶段增加 route metadata，但不把 metadata 与 authorization 耦合                 |

当前没有要求先修改 Product code 才能进入 P1-08B 的 blocker。需要 Product Owner 单独授权
下一阶段，并在实现前确认 account-menu interaction primitive 与 Admin route-group 文件布局。

## 19. P1-08A closure boundary

- Product code changed：`NO`
- Auth/DB/config changed：`NO`
- Production/QA/Vercel mutation：`NO`
- Dashboard redesign：`HOLD`
- Completion meaning：`P1-08 SCOPE / IA / ARCHITECTURE READY`
- Does not mean：`P1-08 IMPLEMENTATION STARTED`
- Recommended next authorization boundary：
  `P1-08B — Identity + Account Menu Foundation`

## 20. P1-08B implementation closure（2026-10-12）

状态：`TRUSTED CURRENT ACCOUNT IDENTITY VISIBLE / ROLE LABEL VISIBLE / CANONICAL ACCOUNT MENU + LOGOUT READY`

### Actual architecture choice

P1-08B 采用 Option B：新增独立、最小化的 `AdminCurrentIdentity`
presentation model：

```ts
interface AdminCurrentIdentity {
  registrationName: string;
  displayRole: "管理员" | "超级管理员";
}
```

`TrustedAccessContext` 未修改。registration name 是可信 server lookup 得到的
display-safe 数据，但不是 authorization field；把它留在 presentation model 可避免 UI
需求污染 security authorization object，也不会把 UUID、email、MFA、AMR、JWT、
`session_id`、capabilities 或 Auth metadata 发送给 client。

### Trusted lookup path

1. `createServerAuthProvider(...).getSession()` 验证 cookie Session/user。
2. `getAdminAccessContext()` 以 verified `session.identity` 读取 Membership 与 active Roles。
3. 只有 active、具有真实 `admin`/`super_admin` Role 且含 `admin:operate` 的 context 才继续。
4. server-only loader 以该 trusted `identity.id` 查询当前用户自己的
   `profiles.registration_name`；API 不接受 client subject/user id。
5. missing/invalid profile、读取错误、inactive 或 unauthorized context 均 fail closed，不以
   UUID/email/metadata 回退显示。

Header 与首页在同一 RSC request 内通过 request-scoped `React cache` 复用既有 access
read；Profile display 增加一次必要 self read。`/access` governance Service 继续逐用例独立
执行 live authorization，未为减少查询而削弱安全检查。

### Role and Account Menu

- Admin Account Role 只从真实 Role Set 选择，优先级固定为
  `super_admin > admin`；不会从 active Membership 合成 `reader`。
- `author + super_admin` 显示“超级管理员”；`admin + author` 显示“管理员”。
- `AdminAccountMenu` 是 client interaction component，但只接收上方两个 presentation
  fields。Trigger 显示 registration name + Admin Role；长名称截断，panel 展示完整值。
- Trigger 是原生 button，含 `aria-expanded`、`aria-controls` 与完整 accessible label；
  支持原生 Enter/Space、点击切换、outside pointer close、Escape close、打开后 focus 到
  Logout、Escape 后 focus 返回 trigger。
- trigger 与 Logout target 均至少 44×44；Mobile panel 使用 safe-area-aware fixed
  positioning。本阶段未实现 drawer、active route、page title 或 Desktop IA 重构。

### Logout and shell boundary

- Account Menu 中的 form 直接复用既有 `signOut` Server Action；Auth provider sign-out 与
  `/auth/sign-in` redirect 合同未改变。
- 首页重复 Logout 已移除；Account Menu 成为 protected Admin 的 canonical Logout。
- 未进行 route-group 迁移。Root Header action 仍为 async Server Component：Guest、
  unauthorized、missing identity 或读取错误时返回 `null`，因此 `/auth/sign-in` 不出现
  Account Menu；现有 protected pages 继续执行各自 authorization/redirect。

### Validation

- Identity/Role/Menu/Auth focused tests：6 files / 33 tests PASS。
- Full Admin targeted tests：13 files / 119 tests PASS。
- Admin typecheck：PASS。
- Admin lint：PASS。
- Admin production build：PASS。
- Chrome viewport smoke：375/390/430/1024 全部无横向溢出；长 registration name
  trigger 截断、Role 可见、panel 在 viewport 内、trigger/Logout 均为 44px。
- Auth、Role authorization、governance contract、DB schema、Migration、Dashboard、
  Production/QA/Vercel 均未改变。

`P1-08B SECURITY BOUNDARY = PASS`

下一授权边界仅为：`P1-08C — Unified Desktop Navigation`。

## 21. P1-08C implementation closure（2026-10-12）

状态：`DESKTOP NAVIGATION UNIFIED / ONE NAVIGATION CONFIG / ACTIVE ROUTE + PAGE CONTEXT READY`

### Canonical config and route presentation

- 唯一 typed source 为 `apps/admin/src/lib/admin-navigation.ts` 中的
  `adminNavigationConfig`。它只含真实 route：`/` → `站点文案`、`/access` →
  `身份与权限`，并保存 exact/segment match 与 optional accessibility label。
- `/` 只 exact active；`/access`、`/access?q=...`、`/access?subject=...` 与 segment
  detail variants 都保持 `身份与权限` active；`/accessibility`、sign-in 与不存在 route
  不误激活。
- `AdminShell` 只使用 `usePathname()` 解析 presentation state，再把 active href/page label
  传入 shared layout。它不读取 Auth、Role 或 capability，也不承担 authorization。
- Desktop active link 使用 `aria-current="page"`、700 font weight 与实体 leading marker，
  不仅依赖颜色。Header page context 明确显示“当前页面：站点文案/身份与权限”。

### Desktop, tablet and mobile boundary

- Sidebar 是 `>=1024px` 唯一可见 primary navigation；Header 只承担 Product identity、
  page context、Theme 与 P1-08B Account Menu，不再重复 `/`、`/access` links。
- `768–1023px` 隐藏 Sidebar，继续使用既有原生 `<details>` fallback；`<=767px` 同样保留
  该 fallback。Desktop Sidebar 与 fallback 都直接映射同一 `adminNavigationConfig`，不再
  hardcode route/label。
- P1-08D 的 drawer/sheet、focus lifecycle、back system 与完整 Mobile page-title architecture
  未实现。Dashboard 业务主体、cards、metrics 与 IA 保持 `HOLD`。
- `返回主站` 与 `创作中心` 未加入：当前 Admin 没有足够安全、明确的 canonical URL +
  trusted server capability presentation source，故 fail closed；未硬编码 Production host。

### Security and regression

- P1-08B `AdminCurrentIdentity`、Account Menu、Role precedence 与 canonical Logout 保持原样；
  sign-in 不显示 protected navigation/page context/Account Menu。
- `TrustedAccessContext`、page/Action/Service authorization、governance contract、Auth、Role、
  DB schema 与 Migration 均未修改。pathname/config 仅用于展示。
- 现有 `React cache` 仍只用于同一 server request 的 access/read reuse；没有新增
  module/global mutable identity cache，也没有 cross-request/cross-session identity state。
- Temporary component harness = `NOT USED`，原因是当前依赖树没有 `vite` executable；
  未安装 dependency、未修改 package contract。验证改用成功构建的 Admin production
  server + real compiled CSS。

### Validation

- Navigation/active/shell/Account/identity focused tests：PASS。
- Full Admin targeted tests：15 files / 133 tests PASS。
- Admin typecheck、lint、production build：PASS。
- Google Chrome production-build presentation smoke：Desktop 1024/1280/1440 对 `/` 与
  `/access` 共 6 项 PASS；Tablet 768/834 对两条 route 共 4 项 PASS。确认唯一可见 primary
  navigation、正确 active/`aria-current`、长账号名稳定、无横向 overflow、内容/Sidebar
  不重叠，Tablet fallback 可展开。
- Production、dedicated remote QA 与 Vercel 未访问；Database、Auth 与 Role 均未修改。

`P1-08C SECURITY BOUNDARY = PASS`

### Recorded future boundary

P1-08F 记录为 `Cross-Surface Account Identity`：未来 Reader、Author Studio、Admin 右上角
均显示 `registration name + contextual Role`；mixed-role identity 必须按当前 surface context
显示 Role，而不是全站永远显示最高权限。该要求本阶段仅记录，未修改 Web 或 Author Studio。

下一授权边界仅为：`P1-08D — Mobile Navigation`。

## 22. P1-08D implementation closure（2026-10-12）

状态：`ADMIN MOBILE NAVIGATION READY / MOBILE PAGE CONTEXT + BACK BEHAVIOR READY`

### Mobile Header and breakpoint

- `<=1023px` 使用 Mobile/Tablet Header + drawer：左侧 Back/产品 context、中间 canonical
  page title、右侧唯一 Menu trigger。`>=1024px` 保持 P1-08C Sidebar 与 Desktop Account
  Menu，不显示 Mobile leading 或 drawer navigation。
- `/` 标题为“站点文案”且不显示 Back；`/access` 及所有 query/detail variant 标题始终为
  “身份与权限”，不会把 query 值当标题。
- Admin 不再渲染 shared native `<details>` fallback；Reader/Docs 的通用 fallback 未改变。

### Deterministic back hierarchy

- `/access` 与 `/access?q=...` 返回 `/`。
- `/access?...&subject=<id>` 只删除 `subject`，保留 `q` 与其他现有 query，返回同一
  list/search context。
- 未知 `/access/*` fail-safe 到 canonical `/access` context；其他未知 route 返回 `/`。
  实现不使用 `router.back()`，也不参与 authorization。

### Drawer, account and accessibility

- `AdminMobileNavigation` 直接映射 `adminNavigationConfig`，复用 P1-08C active matcher；
  current link 有 `aria-current="page"`、字重、背景与实体 marker。
- Drawer 是 `aria-modal` dialog，支持 backdrop/Escape/导航关闭、打开后 focus 到 Close、
  Tab/Shift+Tab trap、关闭后 focus 返回 trigger。打开期间 body scroll lock，main/footer/
  Header 背景 targets 使用 `inert`，backdrop 阻断误触。
- Menu、Back、Close、navigation links 与 Logout 均至少 44px。panel 使用 `100dvh` 与
  `env(safe-area-inset-top/right/bottom)`；长 registration name 在 drawer 内完整换行。
- Drawer Account section 只展示 registration name 与 contextual Admin Role，并直接复用
  既有 `signOut` Server Action。全 shell 只有一个 Logout form、一个 Mobile trigger 与一个
  Mobile navigation surface。

### Security and regression

- Client 只负责 pathname presentation、query-based back target 与 drawer interaction。
  Session、identity、Role、capability 与 authorization 仍由既有 server boundary 所有。
- `TrustedAccessContext`、page/Action/Service authorization、request-scoped React cache、
  Auth、Role、capability、DB schema、Migration 与 governance contract 均未改变；无
  cross-request identity cache。
- Dashboard 业务主体、cards、metrics 与 IA 未触碰，继续 `HOLD`。P1-08F 仍仅记录未来
  Reader/Author/Admin surface-contextual identity/Role，不在本阶段实现。

### Validation

- Full Admin targeted tests：16 files / 146 tests PASS。
- Admin typecheck、lint、production build：PASS。
- Google Chrome + production compiled CSS：320/375/390/430/768/834/1024/1280 全部
  PASS；确认 breakpoint、Header/title/Back、drawer、Account/Role、active marker、44px、
  safe-area CSS、长名称与零横向 overflow。
- Focus trap、focus return、Escape、backdrop、body lock/inert 与 navigation-close 由真实
  component tests 覆盖；P1-08B Desktop Account Menu 与 P1-08C Sidebar regression PASS。
- 未访问或修改 Production/QA/Vercel；未新增 dependency。

`P1-08D SECURITY BOUNDARY = PASS`

下一授权边界仅为：`P1-08E — Responsive / Accessibility / Regression Closure`。

## 23. P1-08E responsive / accessibility / regression closure（2026-10-13）

状态：`P1-08 ADMIN NAVIGATION = COMPLETE / P1-08F CROSS-SURFACE ACCOUNT IDENTITY = PENDING`

### Final responsive and content stress matrix

- Google Chrome 使用 Admin production build 的 real compiled CSS，通过
  320/375/390/430、768/834、1024 boundary、1280/1440 九个 viewport。
- Mobile/Tablet `<=1023px` 与 Desktop `>=1024px` boundary准确；无 horizontal overflow、
  vertical clipping、Header overlap、Sidebar/content collision、drawer/account panel viewport
  collision、double scrollbar 或 fixed/sticky overlap。
- 超长 registration name 在 compact trigger 截断、Account surface 内完整换行；超长 query
  不进入 canonical page title，也不挤压 Back/title/Menu，Detail Back 仍只删除 `subject` 并
  保留其余 query context。
- 390 Mobile 与 1280 Desktop 的 light/dark theme 均保持 active state、Role、focus ring、
  drawer backdrop、Account Menu 与正文可读。当前没有 material drawer/menu animation；
  reduced-motion smoke PASS。

### Keyboard, semantics and accessibility tree

- Desktop Account Menu 保持原生 button keyboard、Enter/Space activation、outside/Escape
  close 与 focus return。Mobile drawer trigger、nav links、Close 与 Logout 均为原生可聚焦
  controls；Tab/Shift+Tab trap、Escape、backdrop、navigation close 与 focus return PASS。
- `nav` labels、single page `h1` hierarchy、trigger accessible names、`aria-expanded`、
  `aria-controls`、`aria-current="page"` 与 modal dialog name/state 均通过。
- P1-08E 发现并最小修复一项 accessibility defect：drawer 打开后，将全局 skip link 与
  drawer trigger 一并纳入 background `inert`，将纯视觉 backdrop 从 accessibility tree
  隐藏，并在 inert cleanup 后恢复 trigger focus。Chrome Accessibility Tree 复验只暴露
  dialog、Mobile nav、Close、active link、账号/Role 与 Logout，不再暴露被覆盖背景。
- macOS VoiceOver 未自动控制；`Manual VoiceOver spot-check required = YES`，作为非阻塞
  最小人工确认。Physical device smoke = `NOT EXECUTED`，未将 browser viewport 模拟冒充
  物理设备，且当前无已知 device-specific blocker。

### Security, cache and regression boundary

- verified Session → trusted access context → self `profiles.registration_name` 仍为 server-only
  display path；Role/capability/authorization 仍由 server page/Action/Service检查。Client Role
  与 pathname 只做 presentation；canonical `signOut` 与 unauthorized/sign-in redirects不变。
- `React cache` 仍只进行同一 RSC request reuse；没有 module/global mutable identity cache、
  cross-request cache 或 cross-session identity leakage。
- 唯一 `adminNavigationConfig` 仍只含 `/` → `站点文案`、`/access` → `身份与权限`，由
  Desktop/Mobile 共同消费；没有 duplicate href、`概览`、phantom route 或 hardcoded Mobile
  config。
- `TrustedAccessContext`、Auth/Role/capability contract、DB schema、Migration、governance、
  Dashboard 与 Production 均未改变。Dashboard redesign 继续 `HOLD`。

### Final gates

- Shared UI：2 test files / 5 tests PASS。
- Admin：16 test files / 146 tests PASS；focused interaction regression 4 files / 30 tests PASS。
- Typecheck、lint、Admin production build、`git diff --check` 与 sensitive scan PASS。
- 未新增 dependency、temporary helper、runtime secret；未访问或修改 Production/QA/Vercel。
- P1-08F 继续记录 future Reader/Author/Admin surface-contextual identity + Role；本阶段未修改
  Web 或 Author Studio。

`P1-08 AUTHORIZATION BOUNDARY = PASS`

下一授权边界仅为：`P1-08F — Cross-Surface Account Identity`。
