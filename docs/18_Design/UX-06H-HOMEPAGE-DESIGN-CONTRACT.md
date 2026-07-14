# UX-06H Homepage UI Audit & Design Contract

Mission: UX-06H Step04 Homepage Release Acceptance Slim
Status: Completed / Awaiting Product Owner Final Review
Phase: Implementation Polish
Date: 2026-07-14
Implementation Changes: NONE

Sections 1–24 retain the Step01 audit / frozen contract；Sections 25–29 record the Step02 implementation；Sections 30–33 record the Step03 Slim QA；Sections 34–37 record the final Release Acceptance.

## 1. Step01 Mission Boundary

Step01 只审计当前 `/` Homepage，实现现状、页面关系、状态表达与响应式基础，并建立 UX-06H Step02 的受控设计合同。

本 Mission 不修改：

- Homepage Product code、React structure、CSS、Component、route 或 runtime behavior。
- Database、Supabase、RLS、RPC、Migration。
- Auth、Permission、Invitation、Role、login return、Published-only 或 Draft isolation。
- Homepage Gateway、Service、Repository、query、sort、limit 或 `BrowseWork` contract。
- Archive、Search、Author Profile、Work Detail、Reading、Studio 或 shared Header / Footer。
- Dependency、Design System、production deployment configuration 或正式产品数据。

Homepage 当前已有 UX-06B Step01–Step04 Product Owner Accepted baseline。UX-06H 不否定该成果，而是在 Archive、Search、Author Profile 与 Work Detail 已分别建立清楚产品空间后，重新冻结 Homepage 的入口职责、页面边界与下一轮受控升级范围。

## 2. Homepage Product Position

Homepage 是 Fandom Harbor 的 **Quiet Editorial Harbor Entrance**。

Homepage 必须承担：

- 站点入口门面与品牌第一印象。
- 新 Reader 理解 Fandom Harbor 是什么、可以做什么的 Orientation。
- 前往 Archive 与 Search 的公共发现起点。
- 通过少量真实 Published Work 预览进入 Work Detail 的邀请。
- 前往既有登录、注册与邀请路径的入口。
- 为 Returning Reader 提供克制的 Reader Library 回访提示。

Homepage 不承担：

- Archive 的完整浏览、排序或分页。
- Search 的主动 query、匹配或结果职责。
- Author Profile 的作者身份聚合。
- Work Detail 的完整阅读判断、章节概览或 Download。
- Reading 的正文、章节导航、设置、书签或沉浸阅读。
- Studio 管理、编辑、发布、分析或 Draft 展示。
- 推荐、排名、Feed、Marketplace、社交广场或个性化算法。

Published-only 是现有数据合同，不是 Homepage presentation option。任何后续 UI 调整均不得放宽 Published-only 或暴露 Draft Work / Draft Chapter。

## 3. Current Implementation Audit

### 3.1 Route and Data

- Route：`/`。
- Rendering：`force-dynamic`。
- Data source：现有 `createPublicBrowseGateway(readPublicRuntimeConfig())`。
- Query：`list({ page: 1, sort: "newest" })`。
- Homepage limit：对既有结果执行 `slice(0, 3)`。
- Work contract：既有 `BrowseWork`；Homepage 不建立专用 Repository 或数据模型。
- 当前字段：id、slug、title、summary、public author name / slug、publishedAt。
- Published-only / Draft isolation：由现有 Public Browse Gateway / Repository 边界保证。
- Session state：Homepage page 本身不读取 Session；shared Root Layout 负责 Header account / capability navigation。

`newest` 前三部是 Latest Published Works，不是编辑推荐、算法推荐、热度榜或排名结果。

### 3.2 Current Page Regions

当前页面共有五个 labelled regions：

1. Brand Hero / Orientation。
2. Quiet Discovery / product principles。
3. Recently Archived / Latest Published Works preview。
4. Reader Return / Reader Library entry。
5. Calm Closing / supporting entries。

Shared Reader Layout 另提供：

- Header brand、Archive、Search、theme 与 account action。
- Author capability 存在时的 capability-gated Studio navigation。
- 全站 Footer：`Fandom Harbor · 私域作品归档`。

### 3.3 Current Hero and Primary Entries

Hero 当前表达：

- `Private Literary Archive` eyebrow。
- `Fandom Harbor` 单一 H1。
- 私域港湾与长久阅读说明。
- Archive、Reader Library、登录 Reader 三个 44px actions。

Hero 的 Archive 与 Reader return 意图清楚，但静态「登录 Reader」在已登录 Reader / Author 状态仍显示，未反映 shared Header 已知的会话状态。

### 3.4 Current Latest Works Preview

每项使用语义 `article`，信息顺序为：

1. `Published` + 日期。
2. Work title → Work Detail。
3. Public author → Author Profile。
4. Summary / empty-summary fallback。
5. `走近这个故事` → Work Detail。

当前使用真实 Published Work，并保持标题、作者、摘要、发布日期与 Work Detail / Author Profile href。没有 popularity、engagement、rating、ranking、cover marketplace 或 Draft state。

### 3.5 Current States

- Default：五段 Homepage + 最多三部 Latest Published Works。
- Empty：诚实说明 Archive 尚无公开作品，并明确 Draft 不会出现；当前没有恢复 action。
- Loading：使用 root-level generic `StatusPage`，文案为正在打开 Fandom Harbor / 准备阅读空间。
- Error：使用 root-level generic Error Boundary，提供 Retry 与 `/works`；不是 Homepage-specific state。
- Not Found：使用 root-level generic Not Found；不属于 Homepage 正常状态。

Homepage 位于 App Router root，当前 Loading / Error 同时服务其他 root descendants。UX-06H Step02 不得为了获得 route-local state 而重构 route group、错误架构或数据获取逻辑；如未来需要专属边界，应独立授权。

### 3.6 Current Responsive and Theme Evidence

- 1280 × 800：main / Homepage shell 1216px；五个 labelled regions、三项 Work preview；zero horizontal overflow。
- 390 × 844：main / shell 358px；Hero actions 为 358 × 44px；Work previews 单列；zero horizontal overflow。
- 长 Fixture Work title 在 390px 自然换行，无异常 clipping。
- Light / Dark semantic colors：PASS。
- Single H1、H2 section headings、H3 Work titles、named navigation 与 labelled regions：PASS。
- Browser console errors：0。

## 4. Page Goal

Homepage 的页面目标是：让首次进入者在短时间内理解 Fandom Harbor 是一个安静、可信、以公开作品发现与长期阅读为中心的文学港湾，并清楚选择「发现故事」「主动搜索」「回到阅读」或「进入账号路径」。

成功标准：

- 第一视口先建立品牌与产品用途，不先展示作品库存。
- Archive 是主要公共发现入口；Search 是清楚但次一级的主动查询入口。
- Latest Works 只作为进入 Work Detail 的有限邀请，不变成完整目录。
- Guest 能理解登录 / 注册 / 邀请的既有路径。
- Reader / Author 不会被静态 Guest CTA 误导。
- 页面不产生推荐、热度、Feed、Studio 管理或 Reading 正文感。

## 5. Information Priority

### Primary

1. Fandom Harbor 品牌身份与文学港湾定位。
2. Archive discovery primary entry。
3. 当前访问者可理解的下一步意图。

### Secondary

1. Search active discovery entry。
2. 最多三部 Latest Published Works。
3. Reader Library return path。
4. Login / Sign-up / invitation access context。

### Supporting

1. Reading-first、archive trust 与 quiet discovery principles。
2. Public author attribution 与 publish date。
3. Closing / recovery links 与 shared Footer。

Homepage 不使用 popularity、rank、engagement、recommendation badge 或不存在的 metadata 建立层级。

## 6. Page Regions Contract

### A. Brand Orientation

- 只保留一个 H1。
- 第一视口回答「这里是什么」与「从哪里开始」。
- 保持 Quiet Editorial Harbor，而不是 SaaS marketing hero、retail campaign 或社交首页。
- Primary action 指向 Archive；Search、Reader return 与 Auth 属于 secondary intent。
- 不显示 Studio management action、Draft state、后台术语或 capability explanation。

### B. Discovery Orientation

- 用少量信息解释阅读优先、作品归档和安静发现。
- 不发展为 feature grid、产品卖点墙或 governance manual。
- Archive 与 Search 的职责必须区分：Browse versus Query。

### C. Latest Published Works

- 只展示既有 newest Published results 的前三部。
- 明确这是 Latest / Recently Published，不称 Featured、Recommended、Popular 或 Trending。
- 每项以 Work identity、story cue、public author、publish context 和 Work Detail entry 为顺序。
- 不新增 filter、sort、pagination、carousel、infinite scroll、ranking 或 recommendation。

### D. Reader Return and Access

- Reader Library 是私人回访提示，不与公开 Latest Works 混为同一列表。
- Shared Header 是当前 session / capability 状态 owner；Homepage 不新增 Session fetch 或角色逻辑。
- Guest 的登录、注册与邀请说明应使用既有 routes 和真实流程，不修改 Auth、Invitation 或 redirect。
- 在没有新增 session data 的前提下，Step02 必须避免对已登录用户持续展示具有错误含义的静态「登录 Reader」主 CTA。

### E. Quiet Closing and Footer

- Closing 用于低压力恢复，不制造 conversion pressure。
- 可指向 Archive、Search、existing Auth / Access paths。
- 不把 `/author` 误写成公共作者目录；当前 `/author` 会重定向 `/studio`，Step02 应移除或改用真实公共发现目的地。
- Shared Footer 保持 supporting，不在本 Track 修改全站 Footer 实现。

## 7. Hero / Orientation Contract

- 品牌名是视觉锚点，产品说明必须同时覆盖公开发现与长期阅读，不把站点误解为只有 private library。
- Hero copy 控制在可快速扫描的一个核心陈述与少量 supporting sentence。
- Archive primary action 保持 44px 和明确 accessible name。
- Search 可在 Hero 后首个 discovery region 明确出现；不需要在 Hero 复制搜索框。
- Auth 与 Reader return 不与 Archive 同时争夺 primary visual weight。
- Desktop 可横向排列 actions；390px 必须单列、全宽、至少 44px。

## 8. Primary Entry Contract

- Public discovery primary：Archive。
- Active discovery secondary：Search。
- Private return：Reader Library / `/works`，继续遵守现有 sign-in boundary。
- Account entry：shared Header login 与现有 `/auth/sign-in`、`/auth/sign-up`、`/access` routes。
- Work preview entry：Work Detail。
- 不新增 personalized CTA、recent-work server query、recommendation 或 role-specific Homepage data fetch。

## 9. Latest Works Contract

- 正式称为 Latest Published Works / 最近公开作品，不称 Featured recommendation。
- 保留 `newest` 与三项上限；Step02 不修改 query、sort 或 limit。
- 只使用既有 `BrowseWork` 字段。
- Title 是最强 Work entry；Author 是 supporting public identity。
- Summary 提供 story cue；空 summary 使用当前诚实 fallback。
- Date 是 publish context，不是 freshness ranking badge。
- 避免 title 与重复 CTA 形成两个同权主入口；Step02 可通过 presentation 合并层级，但必须保留可理解 href。

## 10. Archive and Search Entry Contract

- Archive：完整 Published Work browse、sort、pagination。
- Search：Reader 主动输入关键词查找 Published Work / public Author。
- Homepage：只提供 Orientation 与入口，不复制 Archive controls 或 Search form。
- 两个入口必须可理解、可键盘访问，并在 390px 达到 44px target。

## 11. Auth Entry Contract

- Guest 必须能从 shared Header 或 Homepage context 到达 `/auth/sign-in`。
- Sign-in 页面已有 `/auth/sign-up` 入口；Homepage 可在不改变 Auth 逻辑的情况下更清楚表达账号创建路径。
- `/access` 是登录后且尚未取得 archive access 的邀请码兑换路径，不应被描述为对所有 Guest 直接可用的注册替代。
- 已登录 Reader / Author 不应看到误导性的 Guest primary CTA。
- 不修改登录、注册、邀请、角色、permission、redirect 或 login return。

## 12. Empty State Contract

- 明确当前没有 Published Works，而不是系统错误或权限错误。
- 继续说明 Draft / unpublished 不会公开显示。
- 可提供 Search、Auth 或 Homepage orientation 中真实存在的低压力恢复路径。
- 不伪造 Work、不显示 Draft、不填充推荐内容。

## 13. Loading State Contract

- 说明正在准备 Homepage orientation 与公开作品入口。
- 不伪造 Work title、author、summary 或数量。
- 保留 `aria-busy` / status 的单一 announcement owner。
- Step02 在不重构 root route state ownership 的前提下只能调整 Homepage content 的静态连续性；route-specific Loading architecture 需要独立授权。

## 14. Error State Contract

- Error 与 Empty 清楚区分。
- 不暴露 Supabase、Database、RPC、Repository 或 stack detail。
- 应提供 Retry，并以 Homepage / Archive / Search 等公共路径作为合理 recovery；当前 root Error 只有 Reader Library，记录为共享边界问题。
- UX-06H Step02 不得修改会影响其他页面的 shared root Error，除非 Product Owner 另行授权跨页 state task。

## 15. Mobile Contract

- 390px zero horizontal overflow 是最低基线。
- Orientation → Discovery → Latest Works → Reader Return → Closing 顺序稳定。
- Primary、discovery、Work、Author、Auth 与 recovery entries 至少 44px。
- Work title、author、summary、Hero copy 与 CTA 不依赖 hover。
- 长标题、长作者名、长 summary 与连续长 token 自然换行。
- Work preview 保持单列编辑式节奏，不压缩为商品 tiles。
- 不在 Homepage Track 重写 shared Header 或 Footer。

## 16. Accessibility and Semantic Contract

- 一个 H1；region headings 使用 H2；Work titles 使用 H3。
- 五段内容继续使用 labelled regions。
- 多组链接使用可区分的 navigation labels。
- 所有主要与次要交互至少 44px；不能以文字行高替代触控区域。
- Focus-visible 必须在 Light / Dark 下清楚，不只依赖 hover 或颜色变化。
- Empty / Loading / Error 避免 nested live regions 或重复 assertive announcement。
- Work / Author link accessible names 必须表达目的地，不依赖箭头或视觉位置。

## 17. Long-content Contract

- Hero title、section heading、Work title、author 与 summary 不产生横向溢出。
- Work title 不因固定高度截断身份。
- Summary 可控制阅读长度，但不得删除理解故事所需的基本线索。
- 当前 Fixture 覆盖中等长度英文 Work title，390px wrap protection PASS；不覆盖极端长 author、summary 或连续 token。
- Step02 可使用非持久化 stress QA；不得扩张正式数据或伪造正式内容。

## 18. Published-only and Draft Isolation

- Homepage 继续复用 Public Browse Gateway 的 Published-only result。
- 三项 Latest preview 只能来自 Published Works。
- Draft Work title、slug、summary、author association 与 Draft Chapter 不得进入 Homepage HTML、count、link 或 recovery。
- Guest、Reader、Author 均遵守同一 Published-only preview。
- Step02 不修改 Database、Supabase、RLS、RPC、Repository、Service、Gateway、query、Auth 或 Permission。

## 19. Cross-page Boundaries

### Archive

Archive 是 Curated Story Discovery Space，承担完整浏览、排序与分页。Homepage 只展示最多三部 Latest Published Works 和 Archive 入口。

### Search

Search 是 Active Story & Author Discovery，承担主动 query。Homepage 只提供 Search entry，不复制 input、results、limit 或 state machine。

### Author Profile

Author Profile 是 Literary Creator Identity Space。Homepage 只在 Work preview 中提供 public author attribution，不建立作者目录、作者排名或 Profile aggregation。

### Work Detail

Work Detail 是 Literary Work Decision Space。Homepage Work preview 只提供 story cue 与入口，不复制 Chapter Overview、Reading Decision、Download 或完整 metadata。

### Reading

Reading 是 Private Literary Reading Space。Homepage 只提供 Reader Library return，不展示正文、Chapter navigation、settings、bookmark 或 history details。

### Studio

Studio 是 owner-scoped creator workspace。Homepage page-local content 不展示 edit、manage、publish、Draft 或 analytics。Shared Header 的 capability-gated Studio navigation 属于既有全站合同；Homepage closing 不得用「认识创作者」文案暗中指向 `/studio`。

## 20. Audit Findings

### HP-AUDIT-001 — Hero Does Not Reflect Existing Access State

Severity: P2 orientation / interaction clarity。

Guest、Reader 与 Author 都看到静态「登录 Reader」。Reader / Author 已由 shared Header 显示当前身份，Hero CTA 与真实状态冲突。Step02 应在不新增 Homepage Session fetch 的前提下，让 shared Header 成为唯一账号状态 owner，并移除或重写误导性静态 CTA。

### HP-AUDIT-002 — Brand Promise Under-explains Public Discovery

Severity: P2 product positioning。

`Private Literary Archive` 与「私域港湾」气质明确，但首次用户不容易立即理解 Homepage 同时提供公开 Published Work 发现、Search 与 Work Detail 路径。Step02 可在不扩大功能的前提下收敛 Orientation copy。

### HP-AUDIT-003 — Mixed English System Labels Weaken Voice Consistency

Severity: P2 content consistency。

`Private Literary Archive`、`Discover Quietly`、`Recently Archived`、`Published`、`Return to Reading`、`Reader Library` 与中文主体混用。品牌名、Archive / Search 等固定产品名可保留，但重复 English eyebrows 形成系统标签感。

### HP-AUDIT-004 — Secondary and Work Entries Miss the 44px Baseline

Severity: P2 accessibility / mobile interaction。

390px 实测 Hero actions 为 44px，但 discovery、Author、Work CTA 与 closing links 多为 17–21px；短 Work title 约 28px。Step02 应扩大必要点击区域，保留既有 href 与 focus-visible。

### HP-AUDIT-005 — Work Preview Has Duplicate Primary Destinations

Severity: P2 information hierarchy。

Title 与「走近这个故事」同时进入同一 Work Detail，且 `Published` 在每项重复。结构并非 feed，但两个同权入口与重复状态标签削弱编辑式故事邀请感。

### HP-AUDIT-006 — Auth and Invitation Journey Is Not Self-explanatory

Severity: P2 onboarding clarity。

Hero 只有 Sign-in；Sign-up 隐藏在登录页；closing「使用邀请入口」对 Guest 实际先重定向 Sign-in。Step02 可使用既有 `/auth/sign-in`、`/auth/sign-up`、`/access` 更准确说明真实顺序，但不得修改 Auth / Invitation logic。

### HP-AUDIT-007 — Homepage Loading and Error Are Generic Root States

Severity: P2 state identity / architecture boundary。

Loading 只说准备阅读空间；Error 只提供 Reader Library recovery，均不能表达 Homepage orientation / discovery。由于它们是 root shared states，Step02 不得直接改成 Homepage-only 文案而影响其他 routes；需要独立 state-ownership 授权才能彻底关闭。

### HP-AUDIT-008 — Empty Published Works State Has No Recovery

Severity: P2 recovery。

Empty copy 诚实且保持 Draft isolation，但没有 Search、Auth 或其他低压力下一步。Step02 可只使用既有 routes 增加 recovery。

### HP-AUDIT-009 — Closing Author Entry Has a Misleading Destination

Severity: P2 navigation semantics。

「认识创作者」指向 `/author`，而当前 `/author` 无公共作者目录，会重定向 `/studio`。这与 Homepage 不承担 Studio 管理、Author Profile aggregation 的边界冲突。Step02 应移除该入口或改用 Search 等真实公共发现目的地，不新增作者目录。

### HP-AUDIT-010 — Extreme Long-content Coverage Is Incomplete

Severity: P2 responsive QA。

当前 Fixture 的长 Work title 在 390px 正常换行且 zero overflow，但没有极端长作者名、summary、Hero copy 或连续 token。Step02 需要非持久化 stress QA，不得扩张正式数据合同。

## 21. Existing Strengths to Preserve

- UX-06B 已接受的 Quiet Editorial Harbor identity。
- 一个 H1、五个 labelled regions、H2 / H3 hierarchy 与 named navigation。
- Archive-first discovery，Search 作为主动查询补充。
- Latest Published Works 使用真实 `BrowseWork`，最多三项且顺序确定。
- Public author attribution、Work Detail link 与 honest summary fallback。
- Published-only、Draft Work / Chapter isolation。
- Guest-readable Homepage、Reader / Author access 与 page-local Studio actions = 0。
- Shared Header capability-gated navigation 与 account state。
- Hero 44px actions、focus-visible、Light / Dark semantic colors。
- 1280 / 390 zero overflow 与 Mobile single-column preview。
- No ranking、recommendation、Feed、Marketplace、social metrics 或 cover commerce。
- Browser console errors = 0。

## 22. UX-06H Step02 Recommended Scope

Step02 只建议执行以下受控 Homepage presentation upgrade：

1. 保留五段基础，收敛为 `Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery`。
2. 优化 Hero positioning 与 action hierarchy，使 Archive 为明确 primary，Search / Reader return / Auth 为 secondary intents。
3. 在不新增 Homepage Session fetch 的前提下移除已登录状态仍显示「登录 Reader」的矛盾；继续由 shared Header 表达 account / capability state。
4. 统一 Reader-facing 语言，保留必要品牌 / 产品专名，降低重复 English eyebrow 与 `Published` system-label feeling。
5. 使用现有三个 `BrowseWork` preview 优化 title、summary、author、publishedAt 与 Work Detail entry 层级，不修改 query、sort、limit 或字段。
6. 将 discovery、Work、Author、Auth 与 recovery links 提升到至少 44px，并保留 focus-visible。
7. 减少 Work Detail 重复主入口，不改变 href 或 Work Detail behavior。
8. 修正「认识创作者」→ `/author` 的错误语义；只使用 Search / existing public routes，不新增 Author directory。
9. 为 Empty 增加诚实 recovery；Loading / Error 只记录 shared root 边界，不在 Step02 跨页修改。
10. 验证 1440 / 1280 / 768 / 390、Light / Dark、keyboard、focus、long content、zero overflow、Guest / Reader / Author、Published-only 与 Draft isolation。

Step02 明确不得：

- 修改 Homepage data fetch、Gateway、Service、Repository、query、newest order 或三项上限。
- 新增 session-aware Homepage query、personalization、recommendation、ranking、Feed、filter、search form 或 author directory。
- 修改 Auth、Invitation、login return、Permission、Published-only 或 Draft isolation。
- 修改 shared Header / Footer、root Loading / Error architecture 或其他页面。
- 新增 metadata、dependency、Design System replacement 或 production configuration。

## 23. Validation Result

- `pnpm qa:fixture`：PASS；localhost only。
- `pnpm qa:credentials --check`：PASS；具体密码未记录。
- Homepage default：PASS；五个 labelled regions、三项 Latest Published Works。
- Homepage → Archive：href / destination PASS。
- Homepage → Search：href / destination PASS。
- Homepage → Work Detail：Published Work href 与 Reader / Author target route PASS；Guest 保留既有 Sign-in boundary。
- Homepage → Auth：Sign-in PASS；Sign-in → Sign-up 既有路径存在；Guest `/access` 保留既有 Sign-in boundary。
- Guest：PASS。
- Reader：PASS；Hero 静态 Login finding 已记录。
- Author：PASS；shared Header Studio = 1，Homepage page-local Studio action = 0；Hero 静态 Login finding 已记录。
- Published-only：PASS；Homepage 三项均为 Published Works。
- Draft Work isolation：PASS；Draft title / slug 不进入 Homepage，直接访问不泄露。
- Draft Chapter isolation：PASS；直接访问不泄露。
- 1280 × 800：PASS；1216px shell，zero overflow。
- 390 × 844：PASS；358px shell，zero overflow；secondary target finding 已记录。
- Light / Dark：PASS。
- Loading：真实 root Loading 已捕获；generic state finding 已记录。
- Empty / Error：source contract 已审计；未伪造空数据或破坏依赖制造错误。
- Browser console errors：0。
- Web lint / typecheck / tests / production build：PASS；Web 79 / 79 tests。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。
- Existing Next.js workspace-root inference warning：non-blocking，未在本 Mission 修改。

## 24. Step01 Decision

- P0：0。
- P1：0。
- P2 findings：HP-AUDIT-001–010。
- Product implementation changed：NO。
- Data、Auth、Permission、Published-only、Gateway、Service、Repository、query contract changed：NO。
- Database、Supabase、RLS、RPC、Migration changed：NO。
- Homepage Ready for Step02：YES。
- UX-06H Step02：未授权、未开始。

完成 Step01 后停止，等待 Product Owner 验收。

## 25. Step02 Authorized Implementation

Product Owner 已授权 UX-06H Step02。实现严格沿用 Step01 的 Quiet Editorial Harbor Entrance 合同，并把 `/` 固化为：

`Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery`

本步只修改 Homepage 路由内的 React presentation 与 Homepage CSS：

- Hero 收敛为「浏览公开作品」Primary 与「查找作品与作者」Secondary，不再静态展示具有 Guest 含义的「登录 Reader」。
- Discovery 使用 Archive、Search 与 Latest Works 三条真实路径，明确 Homepage 不提供推荐、排名或 Feed。
- Latest Works 继续读取现有 Public Browse Gateway 的 `newest` 结果并保持 `slice(0, 3)`；标题成为唯一 Work Detail 主入口，作者继续进入公开 Author Profile。
- Reader Return 与 Account Access 分区说明 Reader Library、登录、注册和邀请的既有边界；shared Header 继续是 session / capability state 的唯一 owner。
- Quiet Recovery 移除错误指向 `/author` 的「认识创作者」，改用 Archive、Search 与页面开头。
- Empty presentation 增加 Archive、Search 与 Sign-up 恢复入口；Draft 不公开的说明保持不变。
- 补齐 44px interaction target、focus-visible、长文本换行与 390px 单列保护。

## 26. Step02 Frozen Data and Product Boundaries

Step02 未修改：

- `createPublicBrowseGateway(readPublicRuntimeConfig()).list({ page: 1, sort: "newest" })`。
- Homepage 的三项上限、`BrowseWork` 字段、Published-only 与 Draft isolation。
- Database、Supabase、RLS、RPC、Migration 或远程环境。
- Auth、Permission、Invitation、role、login return 或 shared Header capability logic。
- Gateway、Service、Repository、query contract、sort、ranking 或 algorithm。
- Root `loading.tsx` / `error.tsx`、shared Header / Footer 或其他页面。
- Dependency、Design System、production deployment configuration。

Homepage 仍不承担 Archive 完整浏览、Search query、Author Profile 聚合、Work Detail 阅读决策、Reading 沉浸阅读、Studio 管理、推荐、排名、Feed、Marketplace 或社交功能。

## 27. Step02 Finding Disposition

| Finding      | Step02 status          | Evidence                                                                                 |
| ------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| HP-AUDIT-001 | Closed                 | 移除静态 Login Hero CTA；shared Header 继续表达 Guest / Reader / Author 状态             |
| HP-AUDIT-002 | Closed                 | Orientation 同时明确公开故事发现与长期阅读                                               |
| HP-AUDIT-003 | Closed                 | Reader-facing eyebrows 与 publish context 中文化；品牌及 Archive / Search 专名保留       |
| HP-AUDIT-004 | Closed                 | Homepage main links、Work title 与 Author entry 实测最小 44px                            |
| HP-AUDIT-005 | Closed                 | 每项 Latest Work 只保留一个 Work Detail link                                             |
| HP-AUDIT-006 | Closed                 | 使用既有 Sign-in / Sign-up / Access 路径说明真实顺序；Guest `/access` 仍遵守既有登录边界 |
| HP-AUDIT-007 | Frozen / Not Modified  | Root Loading / Error 为共享架构；Step02 未越权修改                                       |
| HP-AUDIT-008 | Closed in presentation | Empty 增加三条真实 recovery；Fixture 有公开作品，因此未伪造运行时 Empty                  |
| HP-AUDIT-009 | Closed                 | 移除 misleading `/author` root entry                                                     |
| HP-AUDIT-010 | Protection PASS        | title、author、summary、Hero / section copy 与连续 token 均有 wrap protection            |

`HP-QA-001`：当前 Fixture 不含极端长 author name、summary 或连续长 token。现有中长英文标题在 390px 通过，保护规则已实现；该项保留为非阻塞 QA Fixture 增强，不扩张正式数据合同。

## 28. Step02 Validation Result

- `pnpm qa:fixture`：PASS；只重建 localhost QA Fixture。
- `pnpm qa:credentials --check`：PASS；凭据保持本地、Git-ignored，文档未记录密码。
- Guest / Reader / Author Homepage：PASS；三种角色均显示三项 Latest Published Works，Homepage page-local Studio action = 0。
- Author shared Header Studio：PASS；继续由既有 capability contract 控制。
- Homepage → Archive / Search / Work Detail：实际导航 PASS。
- Sign-in / Sign-up / Access：既有路径与 Guest Access → Sign-in boundary PASS。
- Published-only：PASS；Homepage 未出现 Draft Work。
- Draft Work / Draft Chapter direct public isolation：Reader / Author 均进入公开 Not Found recovery，未泄露标题或内容。
- Empty：source presentation PASS；当前 Fixture 有 Published Works，未删除或伪造数据制造运行时 Empty。
- 1440 / 1280 / 768 / 390：PASS；五个 labelled regions、三项 Latest Works、zero horizontal overflow。
- 390px Hero actions：全宽；Homepage 交互最小高度 44px。
- Light / Dark：PASS。
- Keyboard focus-visible：PASS；2px solid outline + 3px offset。
- Semantic structure：一个 H1、section H2、path / Work H3、named navigation 与 labelled regions PASS。
- Browser console errors：0。
- Web lint / typecheck / 79 tests / production build：PASS。
- 完整 `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。
- Local QA server 在重复角色切换时记录既有 `@supabase/ssr` stale chunked-cookie warning；登录、退出、角色与隔离结果均正常，Browser console errors 仍为 0。该观察属于本地浏览器会话 / Auth frozen boundary，不由 Homepage Step02 修改。

## 29. Step02 Decision

- P0：0。
- P1：0。
- Homepage presentation findings：HP-AUDIT-001–006、008–009 Closed；HP-AUDIT-010 Protection PASS。
- Frozen shared-state boundary：HP-AUDIT-007，non-blocking。
- Remaining QA Fixture item：HP-QA-001，non-blocking。
- Product implementation changed：YES；仅 `/` route-local React presentation 与 Homepage CSS。
- Data、Auth、Permission、Published-only、Gateway、Service、Repository、query contract changed：NO。
- Database、Supabase、RLS、RPC、Migration changed：NO。
- Homepage Layout Ready for Step03：YES。
- UX-06H Step03：未授权、未开始。

完成 Step02 后停止，等待 Product Owner 验收。

## 30. Step03 Slim QA Boundary

UX-06H Step03 按 Product Owner 生效的 UX 收口瘦身模式执行，只验证 Step02 直接影响的 Homepage route-local presentation：

- `apps/web/src/app/page.tsx`。
- `apps/web/src/app/homepage-content.tsx`。
- `apps/web/src/app/globals.css` 中 Homepage styles。

本轮不重新设计、不重复深度审计、不扩大跨页回归。已 Release Ready 的 Archive、Search、Work Detail 与 Auth 页面只验证 Homepage 入口 destination smoke；Root Loading / Error、shared Header / Footer、Auth / Session 和远程 Supabase 只记录边界，不修改。

## 31. Step03 Slim QA Result

- Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery：PASS。
- Homepage default：PASS；一个 H1、五个 labelled regions、四组 named navigation。
- Homepage → Archive / Search：PASS。
- Homepage → Published Work Detail：href PASS；Guest 继续遵守既有 Sign-in boundary。
- Homepage → Sign-in / Sign-up：PASS。
- Reader Library / Access：Guest 均按既有合同进入 Sign-in；PASS。
- Guest：PASS；shared Header 显示 Sign-in，Homepage page-local Studio = 0。
- Reader：PASS；三项 Latest Published Works，Homepage page-local Studio = 0。
- Author：PASS；shared Header Studio = 1，Homepage page-local Studio = 0。
- Published-only：PASS；Homepage 未出现 Draft Work title、slug 或 content。
- Draft Work / Draft Chapter isolation：Reader direct public route 均进入公开 Not Found recovery；PASS。
- `newest`、`slice(0, 3)`、`BrowseWork` 与 Public Browse Gateway source contract：保持不变。
- 1440 × 900、1280 × 800、768 × 1024、390 × 844：PASS；每档五个 regions、三项 works、horizontal overflow = 0。
- Light / Dark：PASS；两种主题 horizontal overflow = 0。
- Accessibility：single H1、H2 / H3、labelled regions、named navigation、44px minimum targets 与 2px focus-visible outline + 3px offset PASS。
- Browser console errors：0。

## 32. Step03 Retained Boundaries

- HP-AUDIT-007：Root Loading / Error shared architecture 继续 Frozen；本轮未修改，non-blocking。
- HP-QA-001：当前 Fixture 仍没有极端长 author name、summary 或 continuous token；现有布局未发生破裂，继续作为 non-blocking Fixture enhancement。
- Shared Header / Footer：保持不变。
- Auth / Permission / Invitation / login return：保持不变。
- Stale chunked-cookie warning：本轮 fresh localhost QA 未复现；Reader / Author 登录、退出、角色 capability、Published-only 与 Draft isolation 均正常，因此无实际功能影响，继续归入冻结的 Auth / localhost session boundary。
- Remote Supabase：未连接、未修改。

## 33. Step03 Decision

- Product implementation changed：NO。
- Data layer changed：NO。
- P0：0。
- P1：0。
- Homepage Step02 regression：0。
- `pnpm qa:fixture` / local credential safety check：PASS。
- Web lint / typecheck / 79 tests / production build：PASS。
- 完整 `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。
- Homepage Ready for Step04：YES。
- UX-06H Step04：未授权、未开始。

完成 Step03 后停止，等待 Product Owner 验收。

## 34. Step04 Accepted Baseline

- Step01 Homepage UI Audit & Design Contract：PASS。
- Step02 Homepage Layout Upgrade：PASS。
- Step03 Homepage States & Responsive QA Slim：PASS。

Step04 只固化上述已完成证据，不修改产品实现，不重复完整 QA，不扩大到共享架构或其他页面。

## 35. Final Homepage Contract

Final positioning：**Quiet Editorial Harbor Entrance**。

Final structure：

`Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery`

Homepage 是 Fandom Harbor V1 入口门面、Reader 首次理解站点的入口、Archive / Search / Work Detail / Reading 的发现起点和登录 / 注册路径提示层。Homepage 不承担 Archive 完整浏览、Search query、Author Profile 聚合、Work Detail 阅读决策、Reading 沉浸阅读、Studio 管理、推荐、排名、Feed、Marketplace 或个性化推荐。

## 36. Final Release Evidence and Boundaries

- Archive / Search / Work Detail / Sign-in / Sign-up entries：PASS。
- Guest / Reader / Author：PASS。
- Published-only / Draft Work / Draft Chapter isolation：PASS。
- 1440 / 1280 / 768 / 390、Light / Dark、Accessibility：PASS。
- Browser console errors：0。
- Shared Header / Footer：unchanged。
- Root Loading / Error：Frozen，non-blocking。
- Auth / Permission / Invitation / login return：unchanged。
- Public Browse Gateway、`newest`、three-item cap、`BrowseWork`：unchanged。
- Database、Supabase、Migration、RLS、RPC、Gateway、Service、Repository、query：unchanged。
- Remote Supabase：not connected / not modified。
- HP-AUDIT-007：Frozen / non-blocking。
- HP-QA-001：non-blocking QA Fixture enhancement。
- Stale chunked-cookie warning：Step03 未复现且无实际功能影响，non-blocking。

## 37. Final Release Decision

- Step04 product implementation changed：NO。
- Step04 data layer changed：NO。
- P0：0。
- P1：0。
- Web lint / typecheck / 79 tests / build：PASS。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs builds PASS。
- `git diff --check`：PASS。
- Homepage Ready for Release：YES。
- Ready for Product Owner Final Review：YES。
- New UX Track：not authorized。

完成 Step04 后停止，等待 Product Owner 最终验收。
