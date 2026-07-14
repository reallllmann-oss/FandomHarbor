# UX-06I 全局壳层与导航验收

任务：UX-06I Global Shell / Navigation
状态：PASS / Product Owner Accepted
日期：2026-07-14

## 1. 最终决定

Global Shell / Navigation Ready for Product Owner Review = YES。

Product Owner Acceptance = PASS。

P0 = 0。
P1 = 0。

## 2. 已完成内容

- 桌面端保持左侧品牌、中间主要导航、右侧显示与账号的三分区结构。
- 移动端增加默认收起、正常文档流内展开的“浏览站点”导航。
- Desktop 与 Mobile 复用同一导航数组，避免路由或角色入口漂移。
- Archive、Search 对 Guest / Reader / Author 可见。
- Studio 只在现有 `work:author` capability 存在时出现。
- 右侧区域继续显示主题与真实账号状态，并增加明确组语义。
- 新增角色导航纯函数测试。

## 3. 角色回归

### Guest

- Homepage、Archive、Search、登录页：PASS。
- Header 显示主题与登录：PASS。
- Desktop / Mobile Studio 入口均为 0：PASS。
- `/studio` 继续遵守既有登录边界：PASS。

### Reader

- 使用 localhost QA Fixture 密码登录：PASS。
- Header 显示注册名与退出：PASS。
- Desktop / Mobile Studio 入口均为 0：PASS。
- 直访 `/studio` 重定向 `/archive`：PASS。

### Author

- 使用 localhost QA Fixture 密码登录：PASS。
- Desktop / Mobile Studio 入口均为 1：PASS。
- `/studio` 与内部 Studio 导航可用：PASS。
- Homepage、Search、Work Detail、Reading、Author Profile 继续共享全局壳层：PASS。

### Admin

- 本任务未新增或修改 Admin 专用导航。
- Web 端 Studio 可见性继续只依赖现有 `work:author` capability。
- `apps/admin` 独立壳层保持不变。

## 4. 路由回归

- Homepage：PASS；UX-06H 五段结构、三项 Latest Published Works 与页面级 Studio action = 0 未改。
- Archive：PASS。
- Search：PASS。
- Work Detail：PASS。
- Published Chapter Reading：PASS。
- Author Profile：PASS。
- Author Studio：PASS。
- Reader Studio denial：PASS。
- Guest Auth state：PASS。

## 5. 响应式、主题与可访问性

- 1280 Desktop：三列为左右等宽、中区居中；PASS。
- 390 × 844：移动导航默认收起；PASS。
- 390 × 844 展开：Archive / Search / Studio（Author）按 capability 显示；PASS。
- 移动导航触发器：44px。
- 移动导航链接：44px。
- Desktop / Mobile horizontal overflow：0。
- Light / Dark 既有主题状态：PASS；主题合同未改。
- Brand / Navigation / Utility-Account 三个区域语义：PASS。
- 右侧“显示与账号”组语义：PASS。
- 浏览器控制台错误：0。

## 6. 自动验证

- Web tests：81 / 81 PASS（新增 2 个全局导航测试）。
- Web typecheck：PASS。
- UI typecheck：PASS。
- UI lint：PASS；保留既有非阻塞 `pages` 目录提示。
- 完整 `pnpm validate`：PASS。
- Workspace tests：169 / 169 PASS。
- Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。

## 7. QA 环境

- URL：`http://127.0.0.1:3000`。
- 登录：`http://127.0.0.1:3000/auth/sign-in`。
- 环境：Local Supabase QA Fixture。
- Fixture 已通过 `pnpm qa:fixture` 重建。
- 凭据存在、仅限本地且文件权限安全；密码未写入 tracked 文档。
- 服务器运行本任务最新实现。

## 8. 变更边界

- Database / Supabase Schema / Migration / RLS / RPC：无变更。
- Auth / Session / Cookie / Invitation / Role：无变更。
- Published-only / Draft isolation：无变更。
- Homepage、Archive、Search、Work、Reading、Author、Studio 产品逻辑：无变更。
- 新 dependency：无。

## 9. 保留风险

- 移动端采用原生 `details`，默认收起且不自动标记当前 route；Product Owner 已接受该 V1 安全最小实现。当前路由高亮记录为后续优化项，不阻塞 UX-06I。
- 本任务未新增 Admin Web 导航；Admin 继续使用独立应用壳层。
- Next.js workspace-root inference 提示仍存在，属于既有非阻塞工程提示。

## 10. 停止规则

UX-06I 已通过 Product Owner 验收并正式关闭。停止在当前状态，不进入下一项 UX 任务，等待 Product Owner 下一条明确指令。
