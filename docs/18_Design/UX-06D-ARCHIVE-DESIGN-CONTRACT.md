# UX-06D Archive UI Audit & Design Contract

Mission: UX-06D Step01 Archive UI Audit & Design Contract
Status: Completed / Product Owner Accepted
Phase: Implementation Polish
Date: 2026-07-12
Implementation Changes: NONE

## 1. Mission Boundary

本 Mission 只审计当前 `/archive` 实现并建立后续视觉升级合同。

本 Mission 不修改：

- Product code、React structure、CSS、Component 或 route。
- Database、Supabase、RLS、RPC、Migration。
- Auth、Permission、Published-only rule。
- Archive data gateway、Repository 或 `BrowseWork` contract。
- Search、Reading、Author Profile、Studio。
- Sort、pagination、filter、search 或 recommendation behavior。
- Dependency、runtime 或 deployment configuration。

## 2. Archive Product Position

Archive 是 Fandom Harbor 的 **Curated Story Discovery Space**。

Archive 必须承担：

- 公共作品浏览入口。
- Reader 发现 Published Works 的主要入口。
- 通过故事身份、公开作者身份、摘要和可用元数据支持比较与选择。
- 从 Homepage 品牌入口通向 Work Detail 决策页的发现层。

Archive 不承担：

- Studio 作品管理。
- Draft / private content 展示。
- Reader 私人书架或 Continue Reading 的主职责。
- Search 的主动查询职责。
- Reading 的长文沉浸职责。
- Author Profile 的创作者身份聚合职责。
- 推荐算法、热度榜、社交 Feed 或 Marketplace 排名。

Published-only 是数据与权限合同，不是视觉开关。任何 Archive UI 变化都不得放宽它。

## 3. Current Implementation Audit

### 3.1 Route and Data

- Route：`/archive`。
- Rendering：`force-dynamic`。
- Gateway：`createPublicBrowseGateway()` → Public Browse Service → Supabase Browse Repository。
- Page size：12。
- Sort：newest、oldest、title-asc、title-desc。
- URL state：`page` 与 `sort`。
- Invalid page：非正整数恢复为 1；超出 page count 重定向到最后有效页。
- Current `BrowseWork` fields：title、slug、summary、public author name / slug、published date。
- Published-only：由现有 browse RPC / Repository 边界保证；页面不读取 Draft。

### 3.2 Current Page Regions

当前页面顺序：

1. Archive orientation card。
2. Sort form。
3. Published Works result heading / count / current sort and page。
4. Work card grid。
5. Pagination。
6. Local Reader Shelf / Bookmarks / Recent Reading。

### 3.3 Current Work Card

当前每张卡片展示：

1. `Published Work` eyebrow。
2. Work title → Work Detail。
3. Public Author → Author Profile。
4. Three-line summary。
5. Published date。

当前卡片不展示 rating、warnings、category、language、completion、tags 或 statistics，因为现有 `BrowseWork` contract 不提供这些字段。本 Mission 禁止伪造、补写或扩张数据合同。

### 3.4 Current States

- Loading：全页 `StatusPage`，说明正在读取 Published Works 与页码。
- Error：assertive alert、Retry 与返回 Archive 默认页。
- Empty：`aria-live="polite"`，明确 Draft / unpublished 不会出现。
- Results：真实数量、当前 item range、sort 与 page context。
- Pagination：上一页 / 当前页 / 下一页；首尾使用诚实 disabled 文案。

### 3.5 Current Responsive Evidence

- 1440 × 900：4 个 Published cards，每张约 292 × 270px；zero horizontal overflow。
- 390 × 844：单列 cards，宽约 358px；sort select / button 为 308 × 44px；zero horizontal overflow。
- Mobile sort form 垂直堆叠；pagination container 宽 358px。
- `page=999&sort=oldest` 自动恢复为 `page=1&sort=oldest`。
- Browser console errors：0。

## 4. Page Goal

Archive 的页面目标是：让 Reader 在不受热度、Feed 或管理噪音影响的情况下，快速理解、比较并选择一个 Published Work，然后进入 Work Detail。

成功标准：

- Reader 一眼理解这里是 Published Work discovery。
- Reader 能稳定扫描 title、author、summary 与安全 / 阅读适配信息。
- Sort 和 pagination 可找到但不压过作品。
- Work Detail 是主要下一步；Author Profile 是补充上下文。
- 空、加载、错误和分页边界均有诚实恢复路径。

## 5. Information Priority

### Primary

1. Work title。
2. Summary / story cue。
3. Rating and warnings（仅当既有数据合同真实提供）。
4. 明确的 Work Detail entry。

### Secondary

1. Public author identity。
2. Category、language、completion status（仅当合同真实提供）。
3. Publish / update context。

### Supporting

1. Key tags / relationship metadata（仅当合同真实提供）。
2. Statistics（若未来授权，必须保持非竞争、非主层级）。
3. Result count、sort、page context。

禁止以缺失数据的视觉占位伪装完整元数据。Step02 必须只呈现当前真实合同中的字段。

## 6. Page Regions Contract

### A. Archive Orientation

- 一个 H1。
- 简明说明 Published-only 与 discovery purpose。
- 不使用 marketing hero、feature grid 或 Studio vocabulary。

### B. Browse Controls

- Sort 是 supporting control，不成为大面积 dashboard toolbar。
- 保持原生 label、select、submit 与 URL state。
- Step02 不新增 filters、search input 或 recommendation controls。

### C. Result Context

- H2 标识 Published Works。
- 展示 total、visible range、sort 和 page。
- 状态更新继续可被辅助技术感知，但避免重复播报。

### D. Work Results

- 使用语义 list。
- 每项保持一致但不过度卡片化的 editorial rhythm。
- Desktop 支持比较；Mobile 保持自然单列扫描。
- 不引入 cover-grid marketplace 或 infinite feed。

### E. Pagination

- 位于结果之后。
- Previous / current / next 顺序稳定。
- 保留 URL sort state、`rel` 与 disabled boundary copy。
- 不改为 infinite scroll。

### F. Return Space

- Local Shelf 属于 private return，不属于 Archive primary discovery。
- 当前功能不得在 Step01 删除或迁移。
- Step02 可在不改 ReaderShelf 行为的前提下，通过分区、间距、标题与视觉权重明确降为独立 secondary region。

## 7. Work Card Contract

卡片阅读顺序：

1. Work identity / title。
2. Story promise / summary。
3. Public author attribution。
4. Available reading-fit metadata。
5. Publish context。

规则：

- Title 是最强入口。
- Author link 清晰但不比 title 更强。
- Summary 不能退化为极弱说明文字。
- `Published Work` 重复标签不得制造库存 / CMS 感。
- 卡片高度不以强制等高牺牲内容节奏。
- 当前无 rating / warnings 等字段时，不造假、不隐藏限制；数据扩张需独立授权。
- 不展示 Studio actions、Draft state、private identity 或 popularity rank。

## 8. Sort Contract

- 保留四个既有 sort values 和 server-driven GET form。
- Default 为 newest。
- Label 必须持续可见。
- Current sort 在结果 context 中可确认。
- Mobile control width 和 44px target 保持。
- 不增加 filter chips、category、tag、rating 或 language controls。

## 9. Pagination Contract

- 保留 12 items per page 与 offset pagination。
- 保留 invalid / out-of-range recovery。
- 首尾状态使用不可交互、可理解文案。
- Mobile 必须验证真实 Previous + current + Next 三项同时出现时不拥挤、不换行错序。
- KI-024 offset consistency 是 accepted post-Beta risk；Step02 不改变 pagination architecture。

## 10. Empty, Loading and Error Contract

### Empty

- 明确“暂无 Published Works”，不暗示 Draft 消失或权限错误。
- 保留 Published-only 解释。
- Step02 可增加低压力的 Homepage / Search recovery link，但不得新增搜索逻辑。

### Loading

- 保持真实、短暂、无伪数据。
- Step02 可使用与最终 Archive regions 更接近的低噪声 loading composition，降低全页状态到结果页的视觉跳变；不得伪造卡片内容。

### Error

- 保留 `role="alert"`、Retry 与 Archive default recovery。
- 文案不暴露 Database、RPC、Supabase 或技术堆栈。
- 不把错误伪装为空结果。

## 11. Mobile Contract

- 390px zero horizontal overflow 是最低基线。
- Orientation、sort、results、cards、pagination 与 return region 垂直顺序稳定。
- Sort select / button 与 pagination actions 至少 44px。
- Work title、author、summary 不依赖 hover。
- Long title / author / summary 自然换行，不截断关键身份。
- Metadata groups 在未来存在时必须分组换行，不成为彩色 tag wall。
- 不把桌面多列卡片压缩为窄小 tiles。

## 12. Cross-Page Boundaries

### Search

Search 承担主动 query。Archive 只做既有 sort + pagination browse；Step02 不在 Archive 复制 Search input 或 search logic。

### Reading

Archive 是 comparison space；Reading 是 `Private Literary Reading Space`。Archive 不带入阅读设置、章节导航或长文正文。

### Author Profile

Archive 只提供 public author attribution 与前往 Profile 的上下文入口。Author Profile 承担 creator identity 和 published body of work；Archive 不变成 author directory。

### Studio

Studio 是 owner-scoped creator workspace。Archive 不展示 edit、manage、publish、draft、analytics 或 private identity。

## 13. Audit Findings

### AR-AUDIT-001 — Discovery / Return Boundary Is Visually Weak

Severity: P2 design clarity。

Local Reader Shelf 与公共 Published Works 出现在同一连续 `site-stack`，且都使用相近 card treatment。虽然文案说明两者不同，视觉上仍可能把 public discovery 与 private return 理解为同一 Archive inventory。

### AR-AUDIT-002 — Work Cards Read as Generic Inventory Tiles

Severity: P2 visual identity。

Desktop auto-fit 形成四列相同 `stat-card`，`Published Work` 重复 eyebrow、边框卡片和简短 metadata 让页面接近 inventory / marketplace grid，未充分表达 Curated Story Discovery Space。

### AR-AUDIT-003 — Current Browse Contract Is Metadata-Light

Severity: P2 information completeness / Step02 constraint。

当前只有 title、author、summary、published date，无法实现既有蓝图中的 rating、warnings、category、language、completion 和 tags。Step02 不得扩张数据合同；只能先优化现有真实信息，未来 metadata expansion 必须另行授权。

### AR-AUDIT-004 — Mixed Product Language Weakens Editorial Cohesion

Severity: P2 content consistency。

`Archive Browse`、`Published Works`、`Published Work`、`Local Reader Shelf` 与中文正文混用，且 repeated system labels 强于作品气氛。Step02 可在不改变路由和业务含义的前提下统一页面级展示语言。

### AR-AUDIT-005 — Empty State Has No Next Action

Severity: P2 recovery。

Empty copy 诚实说明 Published-only，但没有 Homepage / Search 恢复入口。Step02 可复用现有路由增加低压力恢复链接。

### AR-AUDIT-006 — Loading Does Not Preserve Archive Shape

Severity: P2 visual stability。

全页 StatusPage 清晰且可访问，但与最终 orientation + controls + results 布局差异较大，加载完成时可能产生明显页面形态切换。Step02 可做 route-local 低噪声 loading composition。

### AR-AUDIT-007 — Multi-page Mobile Pagination Needs Real-data QA

Severity: P2 QA coverage。

当前 Fixture 只有 4 个 Published Works，无法真实呈现 Previous + current + Next 同时可用的 390px 状态。现有实现无溢出，越界恢复正确；Step02 仍需在不建立第二套 QA system 的前提下验证多页状态，若现有数据不足则不得伪造 PASS。

## 14. Existing Strengths to Preserve

- Published-only boundary。
- Public author identity separation。
- Native labeled sort control。
- Shareable / recoverable URL state。
- Deterministic four-sort behavior。
- Honest first / last pagination states。
- Invalid and out-of-range page recovery。
- Semantic headings、list、status 与 pagination navigation。
- Accessible loading / error / empty foundations。
- Mobile zero overflow and 44px sort controls。
- No trending、ranking、feed、Studio controls or Draft leak。

## 15. UX-06D Step02 Recommended Scope

Step02 可执行范围建议：

1. 建立 route-local Archive visual classes / primitives，不改 gateway 或 React data flow。
2. 重构页面视觉分区：Orientation → Browse Controls → Result Context → Editorial Work List / Grid → Pagination → clearly secondary Local Shelf。
3. 使用当前 `BrowseWork` 字段优化 work card hierarchy、spacing、summary、author 与 publish context。
4. 降低 repeated `Published Work` system label 和 generic inventory-card feeling。
5. 统一页面展示语言与 Curated Story Discovery Space 语气。
6. 优化 1440 / 1280 / 768 / 390 的 card rhythm、sort layout 与 pagination safety。
7. 完善 Empty recovery 与 route-local Loading visual continuity；保留 Error contract。
8. 验证 keyboard focus、heading、status、landmark、touch targets、Light / Dark 与 zero overflow。
9. 完整回归 Homepage、Search、Work Detail、Reading、Author、Studio、Reader Permission 与 Draft isolation。

Step02 不得：

- 新增 metadata 字段、filter、search、recommendation 或 pagination architecture。
- 修改 `BrowseWork`、RPC、Repository、Database、Permission 或 Published-only。
- 删除或迁移 ReaderShelf 功能；只能调整其页面内视觉层级。
- 修改 Search、Reading、Author Profile 或 Studio 实现。

## 16. Step01 Decision

Archive 当前功能基线可继续作为 Step02 输入；没有必须先改代码才能建立设计合同的阻塞。

Archive Ready for Step02: **YES**。

UX-06D Step01 完成后停止，等待 Product Owner 验收与 Step02 独立授权。

## 17. Step02 Implementation Record

Status: **Completed / Product Owner Accepted**
Date: 2026-07-13

Step02 已在不扩大数据、权限或产品能力的前提下实现本合同规定的 Archive Layout Upgrade：

- 建立 `Orientation → Browse Controls → Results → Pagination → Private Return` 页面节奏。
- 以编辑式作品列表替代 generic inventory-card feeling，并仅使用现有 title、summary、author、published date。
- 将 Local Reader Shelf 明确降为「私人回访」区域；未删除、迁移或改变其浏览器本地行为。
- 统一 Archive 页面级中文标签与克制的发现语气。
- 为 Empty 增加 Homepage / Search 恢复入口；为 Loading 建立 route-local 静态骨架连续性。
- 保留原有四种排序、GET URL state、分页与越界恢复、Published-only gateway、Reader Permission 和 Draft Isolation。
- 完成 1440、1280、768、390 responsive、Guest / Reader / Author、Work / Author link 与零错误控制台回归。

已解决：AR-AUDIT-001、002、004、005、006。

保持为后续独立范围：

- AR-AUDIT-003：`BrowseWork` metadata-light contract；Step02 未新增字段。
- AR-AUDIT-007：现有 Fixture 只有 4 个 Published Works，无法真实形成多页双向分页；未伪造 PASS，现有单页与越界恢复已通过。
- KI-024：不属于本 Mission，未处理。

详细验收记录见 `UX-06D-STEP02_ACCEPTANCE.md`。Step03 未授权、未开始。

## 18. Step03 States & Responsive QA Record

Status: **Completed / Product Owner Accepted**
Date: 2026-07-13

Step03 对 Step02 实现进行了状态、响应式、可访问性和权限边界集中复验，并仅应用一项 route-local CSS 修补：

- 将 Archive 作品标题、作者和「查看作品」入口的最小点击高度统一为 44px，解决 390px 实测中部分入口仅 15–28px 的 tap target 问题。
- 未修改 `page.tsx`、`loading.tsx`、`error.tsx`、数据层、排序合同、分页架构、权限或其他页面。
- 真实捕获 Archive Loading composition，确认 Orientation、Controls skeleton 与 Results skeleton 在最终内容前保持连续。
- Empty 与 Error 通过实现结构、语义和恢复动作审查；现有 Published Fixture 非空，且本 Mission 禁止伪造正式数据，因此没有为 Empty / Error 改写数据源或人为制造产品故障。
- Homepage 与 Search 恢复目的地均可访问；Error 的 Retry / Archive recovery 不泄露技术细节。
- 默认、newest、oldest、title-asc、title-desc、page=1、非法 page、越界 page 与 sort + page 共存全部通过。
- Mission 清单中的 `sort=az` / `sort=za` 不是既有 `BrowseSort` 正式值，按既有安全合同回退 newest；正式字母排序继续使用 `title-asc` / `title-desc`，未扩张 Service contract。
- 1440×900、1280×800、768×1024、390×844 均为 zero overflow、zero abnormal clipping、minimum Archive interaction target 44px。
- Guest、Reader、Author Archive、Published-only、Draft Work / Chapter 404、Work Detail、Author Profile 与 ReaderShelf 回归通过；browser console error 为 0。

Step02 保留项继续保留：AR-AUDIT-003、AR-AUDIT-007、KI-024。P0 = 0，P1 = 0。

详细记录见 `UX-06D-STEP03_ACCEPTANCE.md`。Archive Ready for Step04 = YES；Step04 未授权、未开始。

## 19. Step04 Archive Release Acceptance Record

Status: **PASS — Product Owner Accepted / Archive Track Closed**
Date: 2026-07-13

UX-06D Step01、Step02、Step03 的工程输出已完成并在本轮重新纳入最终 Release Audit。Archive 最终保持：

- `Curated Story Discovery Space`，承担公共 Published Work 浏览与 Reader 内容发现。
- Orientation → Browse Controls → Results → Work List → Pagination → Private Return / ReaderShelf。
- 正式排序合同：`newest`、`oldest`、`title-asc`、`title-desc`。
- 不承担 Studio management、Search query、immersive Reading、Author identity aggregation、recommendation、ranking、feed 或 marketplace。

最终 Release QA：

- Default、真实 Loading、Empty / Error contract、Pagination、invalid / out-of-range page、Sort 与 Mobile：PASS。
- 1440×900、1280×800、768×1024、390×844：zero overflow、zero abnormal clipping、minimum Archive target 44px。
- Heading、named regions、select label、pagination label、focus-visible 与 link wording：PASS。
- Guest、Reader、Author、Published-only、Draft Work / Chapter 404、Work Detail、Author Profile 与 ReaderShelf：PASS。
- Browser console errors：0；P0：0；P1：0。
- 本轮未修改产品实现。

AR-AUDIT-003、AR-AUDIT-007 与 KI-024 继续作为 P2 / post-Beta 风险保留，本轮未处理。

详细记录见 `UX-06D-STEP04_ACCEPTANCE.md`。Product Owner Final Decision：PASS；Archive Ready for Release = YES。UX-06D Archive Track 已关闭，不自动开启新的 UX Track。
