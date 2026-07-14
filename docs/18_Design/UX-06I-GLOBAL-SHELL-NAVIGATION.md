# UX-06I 全局壳层与导航合同

任务：UX-06I Global Shell / Navigation
状态：PASS / Product Owner Accepted
日期：2026-07-14

## 1. 任务目标

在不改变产品逻辑、认证、权限、数据与页面内容的前提下，稳定 Fandom Harbor 的站点级壳层，让 Reader 与 Author 的主要路径共享一个安静、清楚、可复用的导航结构。

最终桌面结构固定为：

`左：Fandom Harbor → 中：主要导航 → 右：显示与账号`

视觉原则：

- 私密文学阅读空间。
- 内容优先，导航随时可用但不争夺注意力。
- 温暖、克制、安静、专业。
- 不增加推荐、Feed、社交或装饰性动效。

## 2. 实施前审计

### 2.1 已有基础

- `apps/web/src/app/layout.tsx` 是 Web 全站根布局，负责 Session 摘要、账号状态和 `ReaderLayout` 注入。
- `packages/ui/src/components/layouts.tsx` 已提供共享 `SharedLayout` / `ReaderLayout`，Homepage、Archive、Search、Work Detail、Reading、Author Profile、Auth 与 Studio 都经过该根壳层。
- UX-06C 已冻结桌面端 Brand / Navigation / Utility & Account 三分区结构。
- Studio 内部另有工作区侧栏与局部 Header，但它位于全局壳层之内，不重复站点级品牌、账号或主题职责。
- Studio 路由继续使用服务器端 `work:author` capability 守卫；Reader 直访 `/studio` 会重定向到 `/archive`。

### 2.2 发现的问题

#### GS-AUDIT-001 — 移动端主要导航完全隐藏

严重度：P1 可达性 / 导航连续性。

原实现于 767px 以下直接隐藏中心导航。Homepage、Reading 等页面虽然各自存在局部入口，但全站壳层没有稳定的移动端 Archive / Search / Studio 导航入口，页面之间的连接依赖各页自行补足。

处理：已关闭。移动端新增默认收起的原生 `details` 导航，展开后复用与桌面端完全相同的导航数组。

#### GS-AUDIT-002 — 角色导航推导内联且缺少直接测试

严重度：P2 回归风险。

Archive、Search 与 capability-gated Studio 的推导原本直接写在根布局中，行为正确但不便单独验证。

处理：已关闭。提取 `createGlobalShellNavigation` 纯函数并新增 Guest / Reader 与 Author capability 测试。

#### GS-AUDIT-003 — 右侧区域语义不够明确

严重度：P2 可访问性。

主题与账号在视觉上属于同一区域，但辅助技术缺少该组合的明确名称。

处理：已关闭。右侧区域增加“显示与账号”组语义，内部既有主题、登录、用户名与退出行为不变。

## 3. 最终壳层合同

### 3.1 左区：品牌

- 唯一站点级品牌入口为 `Fandom Harbor`。
- 目的地固定为 `/`。
- 不在 Header 中复制 Homepage CTA 或营销文案。

### 3.2 中区：主要导航

- 公共顺序固定为 Archive、Search。
- 仅当现有 Session access context 含 `work:author` capability 时追加 Studio。
- Header 不新增 Homepage 链接；品牌已是唯一 Homepage 入口。
- 不在 UI 中猜测角色，不以隐藏链接替代服务器权限守卫。

### 3.3 右区：显示与账号

- 保留现有主题明暗控制。
- Guest 显示登录入口。
- 已登录用户显示注册名与退出操作。
- 账号状态继续由根布局 Session 摘要统一拥有，各页面不重复读取或重建。

## 4. 用户状态导航

| 状态   | 中区 / 移动端导航                                               | 右区                  | Studio 直访                    |
| ------ | --------------------------------------------------------------- | --------------------- | ------------------------------ |
| Guest  | Archive、Search                                                 | 主题、登录            | 重定向到登录                   |
| Reader | Archive、Search                                                 | 主题、注册名、退出    | 重定向到 `/archive`            |
| Author | Archive、Search、Studio                                         | 主题、注册名、退出    | 允许进入 owner-scoped Studio   |
| Admin  | 若同时具有 `work:author`，行为与 Author 相同；否则不显示 Studio | 沿用现有 Session 状态 | 继续由既有 capability 守卫决定 |

本任务没有新增 Admin 专用 Web 导航，也没有改变 `apps/admin` 的独立管理壳层。

## 5. 路由覆盖

以下 Web 路由共享根级全局壳层：

- Homepage `/`。
- Archive `/archive`。
- Search `/search`。
- Reader Library `/works`。
- Work Detail `/works/[slug]`。
- Chapter Reading `/works/[slug]/chapters/[chapterSlug]`。
- Article Reading `/articles/[slug]`。
- Author Profile `/author/[slug]`。
- Auth / Access。
- Author Studio `/studio/**`。

Studio 的局部侧栏只负责工作区内部信息架构，不替代全局壳层。

## 6. 响应式合同

### 768px 及以上

- 保持三列网格：左右等宽，中区按内容宽度居中。
- 品牌在左，主要导航在中，显示与账号在右。
- 所有主要交互目标最小 44px。

### 767px 及以下

- 第一行保留品牌与显示 / 账号职责。
- 主要导航成为第二行默认收起的“浏览站点”入口。
- 展开内容留在正常文档流，不覆盖页面内容。
- Archive、Search 与 capability-gated Studio 使用同一导航数据源。
- 触发器与每个导航链接最小 44px。
- 390 × 844 必须保持零横向溢出。

## 7. 页面与业务边界

本任务没有修改：

- Homepage 五段内容结构、Published Works query、`newest` 与三项上限。
- Archive、Search、Work Detail、Reading、Author Profile 或 Studio 内容工作流。
- Auth、Invitation、Session、Cookie、login return 或角色模型。
- Studio 的服务器端 capability 守卫与 owner scope。
- Published-only、Draft Work / Draft Chapter isolation。
- Database、Supabase、Migration、RLS、RPC、Gateway、Service 或 Repository。
- 主题持久化合同与 Reader 阅读偏好。
- dependency 或部署配置。

## 8. 实施内容

- 新增纯函数 `createGlobalShellNavigation`，统一生成公共与 Author 导航。
- 根布局改为调用该函数，不再内联拼接 Studio 链接。
- 共享壳层增加移动端原生折叠导航。
- 共享 Header 右区增加“显示与账号”可访问名称。
- 新增角色导航单元测试。

## 9. 验收结论

- GS-AUDIT-001：Closed。
- GS-AUDIT-002：Closed。
- GS-AUDIT-003：Closed。
- P0：0。
- P1：0。
- 数据、权限与业务逻辑变更：无。
- UX-06I：PASS。
- Global Shell / Navigation：Accepted。
- Product Owner Acceptance：PASS。
- UX-06I Global Shell / Navigation Ready for Product Owner Review：YES。
- 移动端当前路由高亮作为后续优化项保留，不阻塞 UX-06I。
- 停止在当前状态，不进入下一项 UX 任务。
