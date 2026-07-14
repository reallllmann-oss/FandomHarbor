# UX-06D Step03 Archive States & Responsive QA Acceptance

Status: **PASS — Product Owner Accepted**
Date: 2026-07-13
Phase: Implementation Polish

## 1. Mission

基于 Step02 Archive Layout Upgrade，对 `/archive` 的真实状态、异常边界、四档响应式、可访问性、权限与 Published-only 合同进行集中复验，只在发现明确问题时实施 route-local 最小修补。

## 2. Product Implementation Change

本轮修改了产品实现，但仅有一项 Archive route-local CSS 修补：

- 文件：`apps/web/src/app/globals.css`
- 原因：390px 实测中，单行作品标题、作者和「查看作品」入口点击高度约为 15–28px，未达到 Mission 要求的 44px mobile tap target。
- 修补：为 `.archive-work-title a`、`.archive-author-link`、`.archive-work-entry` 设置 `inline-flex`、垂直居中与 44px minimum height。

未修改 `archive/page.tsx`、`archive/loading.tsx` 或 `archive/error.tsx`；未修改其他页面或共享 Design System。

## 3. Archive States QA

| State                  | Result                | Evidence                                                                      |
| ---------------------- | --------------------- | ----------------------------------------------------------------------------- |
| Default Published list | PASS                  | 4 个 Published Works，结构、入口与 Private Return 正常                        |
| Empty                  | PASS — contract audit | 文案明确 Published-only；Homepage / Search href 正确且目的地实测可访问        |
| Loading                | PASS                  | 浏览器真实捕获 Orientation、Controls skeleton、Results skeleton；最终布局连续 |
| Error                  | PASS — contract audit | `role=alert`、assertive live region、Retry 与 Archive recovery；无技术细节    |
| Pagination             | PASS                  | 首 / 尾禁用状态清楚；当前 4-item Fixture 为单页                               |
| Invalid page           | PASS                  | 安全按第一页渲染，不中断页面                                                  |
| Out-of-range page      | PASS                  | 重定向到有效第一页并保留 sort                                                 |
| Sort                   | PASS                  | newest、oldest、title-asc、title-desc 顺序正确                                |
| Mobile                 | PASS                  | 390×844 无溢出、无异常截断、Archive 入口最小 44px                             |

现有 Published Fixture 非空，且 Mission 禁止新增 QA 数据或伪造正式产品数据，因此 Empty 没有通过改写数据源进行 runtime 触发。Error 也没有通过破坏 Repository / Gateway 或停用依赖人为触发。两者通过 route component 语义、文案、动作和真实恢复目的地复验，不伪造 runtime PASS。

## 4. Pagination / Sort / URL State

- `/archive`：PASS。
- `?sort=newest`：PASS。
- `?sort=oldest`：PASS。
- `?sort=title-asc`：PASS，标题 A–Z。
- `?sort=title-desc`：PASS，标题 Z–A。
- `?sort=az` / `?sort=za`：按既有 invalid-sort policy 安全回退 newest；它们不是 `BrowseSort` 正式值，未修改 Service contract。
- `?page=1`：PASS。
- 非法 page：PASS，按第一页安全渲染。
- `?page=999&sort=oldest`：PASS，恢复为 `?page=1&sort=oldest`。
- sort + page 共存：PASS。
- 第一页 / 最后一页 disabled state：PASS。

AR-AUDIT-007 继续保留：Fixture 只有 4 个 Published Works，无法真实形成 Previous 与 Next 同时可用的多页状态；本轮未新增数据或伪造多页 PASS。

## 5. Responsive QA

| Viewport   | Overflow | Text clipping | Minimum Archive target | Result |
| ---------- | -------: | ------------- | ---------------------: | ------ |
| 1440 × 900 |        0 | NONE          |                   44px | PASS   |
| 1280 × 800 |        0 | NONE          |                   44px | PASS   |
| 768 × 1024 |        0 | NONE          |                   44px | PASS   |
| 390 × 844  |        0 | NONE          |                   44px | PASS   |

作品列表在 1440 / 1280 为双栏，在 768 / 390 为单栏；排序控件、作品标题、作者、作品入口与分页状态均保持可读、可操作。

## 6. Accessibility QA

- 单一 H1；Controls / Results / Private Return 使用明确 H2；Work title 使用 H3。
- Browse Controls 与 Results 使用 named region；Pagination 使用 named navigation。
- Native select 与「排序方式」label 正确关联。
- Work / Author / recovery link 文案可理解。
- Archive 可操作入口保留明确 `:focus-visible` outline。
- Archive mobile targets 最小 44px。
- Loading 使用 `aria-busy` / polite live region；Error 使用 alert / assertive live region；Empty 文案可理解。

Result: **PASS**。

## 7. Published-only & Permission Regression

- Guest 可访问 Archive：PASS。
- Reader 可访问 Archive：PASS。
- Author 可访问 Archive：PASS。
- Archive 不出现 Draft Work：PASS。
- Reader 访问 Draft Work：404 PASS。
- Reader 访问 Draft Chapter：404 PASS。
- Published Work Detail：PASS。
- Author Profile：PASS。
- Author Archive 不出现管理 / 编辑 / 发布动作：PASS。
- ReaderShelf 仍呈现本地 Bookmarks / Recent Reading 内容：PASS。
- Browser console errors：0。

## 8. Step02 Remaining Issues

- AR-AUDIT-003（P2）：`BrowseWork` metadata-light，继续保留。
- AR-AUDIT-007（P2 / QA coverage）：真实多页 Fixture 不足，继续保留。
- KI-024：Mission 明确禁止处理，继续保留。

P0：0。
P1：0。

不存在进入 Step04 前必须处理的 P0 / P1。

## 9. Validation

- `pnpm qa:fixture`：PASS。
- `pnpm qa:credentials`：PASS；凭据有效，本文不记录具体密码。
- Web lint：PASS。
- Web typecheck：PASS。
- Web tests：79 / 79 PASS。
- Web build：PASS。
- `pnpm validate`：PASS。
- `git diff --check`：PASS。

## 10. Manual QA Handoff

QA Environment：`http://localhost:3000/archive`。
QA identities：`Harbor QA Reader`、`Harbor QA Author`。
具体密码通过本地 `pnpm qa:credentials` 获取，不写入验收报告。

Manual QA Checklist：

- [ ] Guest 检查默认 Archive、四种正式排序与首 / 尾分页状态。
- [ ] 检查非法 / 越界 page 与 sort + page URL state。
- [ ] 在 1440、1280、768、390 检查无溢出、无截断与 44px 操作目标。
- [ ] Reader 检查 Published Work、Work Detail、Author Profile 与两个 Draft 404。
- [ ] Author 检查 Archive 不出现 Draft 或 Studio 管理动作。
- [ ] 检查 Loading 连续性、Empty 文案及 Homepage / Search recovery。
- [ ] 检查 Error 文案、Retry 与返回 Archive 动作。
- [ ] 检查 ReaderShelf Bookmarks / Recent Reading 呈现不变。
- [ ] 检查 Browser console error 为 0。

## 11. Decision

UX-06D Step03 Archive States & Responsive QA 已完成。

Archive Ready for Step04 = **YES**。

Step04 未授权、未开始；等待 Product Owner 验收。
