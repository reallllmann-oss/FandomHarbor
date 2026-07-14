# UX-06E Step03 Search States & Responsive QA Acceptance

Status: **Completed / Awaiting Product Owner Review**
Date: 2026-07-13
Phase: Implementation Polish

## 1. Mission

基于 UX-06E Step02 已完成的 Search Layout Upgrade，集中复验 `/search` 的 Initial、Query、Empty、Invalid、Loading、Error、Work Results、Author Results、响应式、主题、可访问性与角色边界，并只在必要时实施 Search route-local 最小修补。

本 Mission 不重新设计 Search，不扩张搜索功能，不改变 Search 数据、权限或查询合同。

## 2. Product Implementation Change

本轮修改了产品实现，且只有一个 route-local 最小修补：

- `apps/web/src/app/search/error.tsx`
  - 将 `清空并重新搜索` 从同段 Next.js client navigation 改为原生完整导航。
  - 原因：受控 Error QA 发现，错误边界捕获异常后，同 route client navigation 虽把 URL 改为 `/search`，但不会重置 segment error boundary，页面仍停留在 Error State。
  - 修补后，入口会完整重建 `/search`，正确回到 Initial State。

未修改 `page.tsx`、`loading.tsx` 或 Search CSS；未修改其他页面。

## 3. Search States QA

| State          | Result | Evidence                                                               |
| -------------- | ------ | ---------------------------------------------------------------------- |
| Initial        | PASS   | 单一 H1、visible label、用途说明、Archive / Homepage recovery 完整     |
| Valid Query    | PASS   | GET `q`、结果 context、输入保留、Work / Author 独立结果区正常          |
| Empty Result   | PASS   | 清楚说明无公开结果；原 query 保留；两个 recovery links 均为 44px       |
| Invalid Query  | PASS   | 81 字符 URL query 显示 inline alert，不调用 Search，不渲染结果         |
| Long Query     | PASS   | 80 字符为有效边界；390px 下 main 358 / 358，无横向溢出                 |
| Loading        | PASS   | `aria-busy="true"`；Search orientation / query / results skeleton 连续 |
| Error          | PASS   | 单一 `role="alert"`；无技术细节；Retry / clear / Archive 均为 44px     |
| Work Results   | PASS   | 3 个 Published QA Works；title、summary、author、publish date 层级稳定 |
| Author Results | PASS   | 公开 display name、bio、Published Work count 与 Profile entry 稳定     |
| Mobile         | PASS   | 390 × 844 单列、零溢出、全部主要 Search targets ≥44px                  |
| Light / Dark   | PASS   | 两种主题文字与背景可读；切换后均保持 390px 零溢出                      |

Loading 通过真实 GET form submission 捕获：Loading URL 为 `/search?q=QA+Fixture`，busy shell、loading query 与 loading results 同时存在，最终平稳进入 3 个 Work Results。

Error 通过临时 localhost Web 进程指向不存在的本地端口触发；该过程未修改环境文件、数据、Search 实现合同或远程 Supabase。

## 4. Query and URL Contract

- `/search`：Initial State，PASS。
- `/search?q=`：保持空 query URL 并进入 Initial State，PASS。
- 80-character query：有效，进入 Empty State，PASS。
- 81-character query：显示 80-character inline validation，结果区不渲染，PASS。
- NFKC / whitespace normalization：`ＱＡ  Fixture` 在 result context 规范化为 `QA Fixture`，返回 3 个 Published Works，PASS。
- URL 中原始 `q` 与输入值继续保留，未改变 server-driven GET behavior。
- `maxLength=80`、normalization、control-character rejection、matching、ordering 与 result cap 均未修改。

## 5. Results and Recovery

- Work title → Work Detail：Reader 进入 `/works/qa-reading-short`，PASS。
- Work 内 public Author → Author Profile：Reader 进入 `/author/harbor-qa-author`，PASS。
- Author Result → Author Profile：Guest / Author 进入公开 Profile，PASS。
- Archive recovery → `/archive`：PASS。
- Homepage recovery → `/`：PASS。
- Error Retry：保持单一 Error State 并重新请求，PASS。
- Error clear：修补后完整导航至 `/search` Initial State，PASS。
- 未出现 recommendation、ranking、Feed、history、filter、Marketplace 或 Studio action。

## 6. Responsive QA

| Viewport   | Document width | Main width  | Overflow | Result |
| ---------- | -------------- | ----------- | -------- | ------ |
| 1440 × 900 | 1440 / 1440    | 1216 / 1216 | 0        | PASS   |
| 1280 × 800 | 1280 / 1280    | 1216 / 1216 | 0        | PASS   |
| 768 × 1024 | 768 / 768      | 720 / 720   | 0        | PASS   |
| 390 × 844  | 390 / 390      | 358 / 358   | 0        | PASS   |

四档均验证 Query、Work Results、result entries 与 heading structure。390px 下 input、submit、Work title、Work author、Work entry、Author title、Author entry 与 recovery actions 均达到至少 44px。

QA Fixture 提供的 Long-form Work title 与长简介在 390px 自然换行；Author result 使用 `overflow-wrap: anywhere`、`min-width: 0` 与单列移动端合同，实测公开 Author result 无溢出。

## 7. Accessibility QA

- 单一 H1：PASS。
- H2 / H3 hierarchy：PASS；Query / Context / result regions 使用 H2，单项 title 使用 H3。
- Named regions：Query、Initial recovery、Query context、Work Results、Author Results 均通过 `aria-labelledby` 建立名称。
- Native `<label for>` 与 Search input：PASS。
- `role="search"`、button / link accessible names：PASS。
- Input、submit 与结果入口具有明确 2px focus-visible outline：PASS。
- 44px mobile tap target：PASS。
- Empty 使用 polite announcement；Loading 使用 `aria-busy` 与 screen-reader status；Error 仅有一个 assertive owner：PASS。

## 8. Roles, Published-only and Draft Isolation

- Guest 可访问 Search：PASS。
- Reader 登录并访问 Search：PASS。
- Author 登录并访问 Search：PASS。
- Reader 查询 `QA Fixture`：仅返回 3 个 Published QA Works，PASS。
- Guest / Reader / Author 均未看到 Draft-only Work，PASS。
- Reader / Author 查询 `Hidden Draft Work`：Work 0、Author 0，PASS。
- Reader / Author 查询 Draft Chapter `Sealed Draft`：Work 0、Author 0，PASS。
- Author result 不展示 owner ID、registration identity 或其他越权字段，PASS。
- Browser console errors：0。

`pnpm qa:fixture` 与 `pnpm qa:credentials` 只用于 localhost QA。具体密码不写入本验收文档；凭据继续由 Git-ignored 本地文件管理。未连接或修改远程 Supabase。

## 9. Step02 Remaining Issues

- SE-AUDIT-001 至 SE-AUDIT-008：继续保持 Resolved。
- Step03 新发现的 Error clear recovery 问题：已通过 `error.tsx` 最小修补关闭。
- Step02 不再存在进入 Step04 前必须处理的 P0 / P1 问题。

P0：0。
P1：0。

## 10. Boundary Confirmation

未修改：

- Search Gateway、Service、Repository、RPC 或查询合同。
- 搜索字段、normalization、80-character limit、matching、ordering 或 result cap。
- Database、Supabase schema、Migration、RLS、Auth、Permission、Role、Membership 或 Invitation。
- Archive、Reading、Studio、Author Profile 或全站 Design System。
- Dependency 或 deployment configuration。

## 11. Validation

- `pnpm qa:fixture`：PASS。
- `pnpm qa:credentials`：PASS。
- Browser QA：PASS。
- Browser console errors：0。
- Web lint：PASS。
- Web typecheck：PASS。
- Web tests：79 / 79 PASS。
- Web production build：PASS。
- `pnpm validate`：PASS。
- Workspace tests：167 / 167 PASS。
- Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。

## 12. Decision

UX-06E Step03 Search States & Responsive QA 已完成状态、角色、浏览器与完整 validation 验收。

Search Ready for Step04: **YES**。

UX-06E Step04 未授权、未开始；等待 Product Owner 验收。
