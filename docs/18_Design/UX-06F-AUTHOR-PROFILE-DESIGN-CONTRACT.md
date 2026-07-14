# UX-06F Author Profile UI Audit & Design Contract

Mission: UX-06F Step01 Author Profile UI Audit & Design Contract
Status: Step01–Step03 PASS / Step04 Release Acceptance Completed
Phase: Implementation Polish
Date: 2026-07-13
Implementation Changes: NONE

## 1. Mission Boundary

本 Mission 只审计当前公开 `/author/[slug]` 页面，并建立后续受控视觉与交互升级合同。

本 Mission 不修改：

- Product code、React structure、CSS、Component 或 route。
- Database、Supabase、RLS、RPC、Migration。
- Auth、Permission、Published-only rule 或 Draft isolation。
- Follow / Unfollow 业务逻辑、授权条件、action 或 revalidation。
- Author Profile Gateway、Service、Repository、RPC 或查询合同。
- Author fields、Work fields、ordering、result count 或 URL behavior。
- Archive、Search、Work Detail、Reading、Studio。
- Dependency、runtime 或 production deployment configuration。

如后续实现需要新增作者字段、扩大作品元数据、改变公开身份、关注关系、查询、排序、权限或 Published-only 边界，必须停止并申请独立授权；不得并入 UX-06F Step02。

## 2. Author Profile Product Position

Author Profile 是 Fandom Harbor 的 **Literary Creator Identity Space**，承担公开作者身份与 Published Works 集合的承接。

Author Profile 必须承担：

- 公开作者身份展示。
- Reader 认识公开笔名与作者简介的入口。
- Reader 查看该作者 Published Work 集合的入口。
- Archive / Search / Work Detail 之后的作者上下文承接。
- 从作者上下文进入 Work Detail，再进入 Reading 的路径。
- 在不暴露私人账号身份的前提下，表达作者与公开作品的关系。

Author Profile 不承担：

- Studio 创建、编辑、发布或管理。
- Reader 私人书架、bookmark、history 或 Continue Reading。
- Search 主动查询、Archive 浏览排序或分页。
- Reading 章节导航、设置或沉浸正文。
- 推荐、排名、Feed、Marketplace、粉丝列表、关注列表、私信、评论、动态或社交广场。
- Draft、private owner identity、注册信息或其他越权内容展示。

Published-only 与公开 / 私人身份分离是数据和权限合同，不是视觉开关。任何 Author Profile UI 变化均不得放宽它们。

## 3. Current Implementation Audit

### 3.1 Route and Data

- Route：`/author/[slug]`。
- Rendering：`force-dynamic`。
- Public read：`createSocialRelationshipGateway()` → Social Relationship Service → Supabase Social Relationship Repository → `get_public_author_profile` RPC。
- Metadata：公开 profile 存在时生成 indexable title / description / canonical；不存在时使用 private not-found metadata。
- Public author eligibility：active Author role + active Membership。
- Public works：RPC 仅聚合 `w.status = 'published'`，按 `published_at desc, id` 排序。
- 公开作者即使当前 Published Work 为 0，也可以直接进入 Profile；Empty State 是合法产品状态。
- Guest 可读取公开 Profile；Follow / Unfollow 需要 active Reader capability。
- 特殊本地 fallback `fandom-harbor-archive` 只聚合既有 published fixtures，并隐藏 Follow action。

### 3.2 Current Data Contract

当前 `PublicAuthorProfile` 提供：

- `displayName`、`bio`、`slug`。
- `publishedWorkCount`。
- `followerCount`、`followingCount`、`isFollowing`。
- `userId`，仅供 server-side action / self comparison，不得展示。
- `works`：`id`、`title`、`slug`、`summary`、`publishedAt`。

当前 UI 未展示 `userId`、raw slug 或 `publishedAt`。当前 Work contract 不提供 rating、warnings、category、language、completion、tags、chapter count 或 statistics；Step02 不得伪造或新增这些字段。

### 3.3 Current Page Regions

当前页面顺序：

1. Author identity card：initials avatar、English eyebrow、display name、bio。
2. Follow / Sign-in action（非 self、非特殊 archive author）。
3. 三项统计：作品、关注者、关注中。
4. Published Works card：heading、empty 或 two-column work grid。
5. Work items：title、重复作者自链接、summary、Work Detail entry。

### 3.4 Follow / Unfollow Behavior

- Guest：显示 44px「登录后关注」，保留 `next=/author/[slug]`。
- Reader：显示当前 `isFollowing` 状态；本地 QA Reader 当前为「已关注 · 取消」。
- Author 查看自己：不显示 Follow / Unfollow。
- 特殊 `fandom-harbor-archive`：不显示 Follow / Unfollow。
- Button 有明确 accessible name、pending disabled state 与 route-local error。
- Follow action 需要 active `archive:read` capability；禁止 self-follow；成功后 revalidate 当前 Profile。

本 Mission 未触发 Follow / Unfollow 写入，也未改变当前关注状态。

### 3.5 Current States

- Default / Results：公开身份、关系状态、计数与 Published Works。
- Empty：明确作者当前没有公开作品，但没有后续 Archive / Search recovery。
- Loading：全页 `StatusPage`，说明正在读取作者资料与已发布作品。
- Error：`role="alert"` + `aria-live="assertive"` 包裹 `StatusPage`，仅提供 Retry。
- Not Found：Profile 不存在时进入既有 not-found boundary。

### 3.6 Cross-page Entry Evidence

- Archive public author link → `/author/harbor-qa-author`：PASS。
- Search Author Result → `/author/harbor-qa-author`：PASS。
- Work Detail public author link → `/author/harbor-qa-author`：Reader PASS。
- Author Profile Work entry → `/works/qa-reading-short`：Reader PASS。
- Guest 点击 Work entry 后遵守既有登录边界；本 Mission 不改变 Work Detail 权限。

### 3.7 Responsive and Accessibility Evidence

- 1280px：document 1280 / 1280、main 1216 / 1216，zero horizontal overflow。
- 390 × 844：document 390 / 390、main 358 / 358，zero horizontal overflow。
- 390px Guest follow entry：308 × 44px。
- 390px repeated author self-link：约 115 × 17px。
- 390px「查看作品」entry：约 64 × 24px。
- Heading：1 个 H1、1 个 H2、每部作品 1 个 H3。
- Published Works 使用 labeled section 与 semantic list。
- Initials 使用 named `role="img"`；统计使用 `dl`；Follow action 使用 native form / button。
- Browser console errors：0。

### 3.8 Role and Isolation Evidence

- Guest access：PASS。
- Reader access：PASS；当前 Follow state 可确认。
- Author access：PASS；self Profile 不显示 Follow action，页面主体不显示 Studio 管理动作。
- Profile 只显示 4 个当前 Published Works；`Hidden Draft Work` 不出现。
- Draft Work direct route：not found presentation，PASS。
- Draft Chapter `sealed-draft` direct route：not found presentation，PASS。
- 私人 registration identity、owner ID、email、Draft status 与 Studio action 均未泄露。

## 4. Page Goal

Author Profile 的页面目标是：让 Reader 在不进入社交竞争或后台管理语境的情况下，理解一个公开作者身份、阅读其公开简介、浏览其 Published Works，并进入具体 Work Detail。

成功标准：

- Reader 一眼理解这是公开创作者身份，而不是普通账号或社交主页。
- Public display name 与 bio 建立可信、克制的作者上下文。
- Published Works 是作者身份的主要表达，不被关注数字压过。
- Work title、summary 与可用 publish context 支持故事判断。
- Follow / Unfollow 如保留，应是安静的 supporting relationship action。
- Empty、Loading、Error 与 long-content 状态均诚实、可恢复。
- 私人账号身份、Draft 与 Studio 管理始终不可见。

## 5. Information Priority

### Primary

1. Public display name。
2. Public bio / creator context。
3. Published Works body of work。
4. Work title、summary 与 Work Detail entry。

### Secondary

1. Published Work count。
2. Work publish context（只使用当前真实 `publishedAt`）。
3. Follow / Unfollow 当前状态，如现有能力适用。
4. Archive / Search arrival context 与恢复路径。

### Supporting

1. Follower / following counts，如继续展示必须保持非竞争、非排名、非主要身份层级。
2. Initials avatar，只作公共身份辅助，不主导页面。
3. Empty / Loading / Error guidance。

`userId`、registration name、email、private account metadata、Draft state 与 Studio capability 不属于公开信息层级，禁止展示。

## 6. Page Regions Contract

### A. Public Identity Orientation

- 一个 H1，以 public display name 为身份锚点。
- 使用 Reader-facing 文案表达公开创作者身份，不使用内部阶段、CMS 或账号管理语言。
- Initials / image 只能辅助身份，不形成 influencer-style avatar hero。
- 不显示 private identity、role grant、membership、owner ID 或 Studio action。

### B. Author Bio

- Bio 是作者语境与文学气质的主要线索，视觉层级高于社交计数。
- 保留换行，支持长文本自然折行。
- Bio 为空时使用安静、非错误式缺省文案。
- 不新增简介字段、链接字段、社交账号或富文本合同。

### C. Relationship Action

- 保留现有 Guest sign-in、Reader Follow / Unfollow、self hidden 与 archive fixture hidden 行为。
- 不改变 action、capability、redirect、pending、error 或 revalidation。
- Action 至少 44px，accessible name 必须明确当前意图。
- `isFollowing` 状态应可读，不只依赖颜色。
- Follow 是 supporting action，不与 display name 或 Published Works 争夺主层级。
- Follower / following counts 不得变成热度、排名、增长或粉丝经济表达。
- 不新增 follower list、following list、notifications、recommendations、messages 或 activity。

### D. Published Works Context

- 使用 H2 清楚说明这是该作者的公开作品集合。
- `publishedWorkCount` 只表达公开集合规模，不表达生产力排名或热度。
- 明确 Draft / unpublished 不进入集合，但不把权限合同重复为警告墙。
- 不新增 sort、filter、search、pagination、recommendation 或 ranking。

### E. Body of Work

- 使用语义 list。
- 每个 Work 应表达为作者 body of work 的一部分，而不是商品、帖子或库存 tile。
- Work title 是 Primary entry，并应直接链接 Work Detail。
- Summary 是故事判断线索，不退化为极弱系统说明。
- 可使用当前已存在的 `publishedAt` 作为克制 publish context。
- 当前页面已知作者无需在每项重复 self-link；Step02 可通过 presentation 降低冗余，但不得修改跨页面作者合同。
- 不展示 Draft、Studio action、engagement、rank、rating 或不存在的 metadata。

### F. Recovery Space

- Empty 可提供低压力 Archive / Search recovery，帮助继续公共发现。
- Error 可提供 Retry 与返回 Archive / Search 的既有 route recovery。
- 不引入推荐作品、热门作者、自动查询或新数据请求。

## 7. Author Identity Contract

- Public display name 是唯一公开身份锚点。
- Public bio 可补充创作者语境，但不演变为促销简介。
- Initials avatar 是派生展示，不代表新增图片、头像上传或媒体合同。
- Public identity 必须与 registration identity、email、account role、Membership 和 Studio owner context 分离。
- Author 自己查看 Profile 时仍是公开页面，不增加 owner-only management module。
- 长 display name 必须自然换行，不挤压 Follow action或制造横向溢出。

## 8. Work Card Information Hierarchy

建议阅读顺序：

1. Work title / Work Detail entry。
2. Summary / story cue。
3. Existing publish context。
4. Supporting author continuity（只在不重复当前页面身份时使用）。

规则：

- Title / primary entry 至少 44px，并保持明确 focus-visible。
- Work title、summary 与 slug-safe route 支持长内容换行。
- `publishedAt` 已在当前合同中，可用于 Step02；不得新增字段。
- 不展示不存在的 rating、warnings、category、language、completion、tags 或 chapter count。
- 如未来需要这些字段，必须建立独立数据合同 Mission。
- 不引入 sorting、filtering、search、pagination、infinite scroll 或 recommendations。

## 9. Empty State Contract

- 明确“该作者目前没有公开发布的作品”。
- Empty 是有效公开作者状态，不应表现为权限错误或 Profile 缺失。
- 不向普通 Reader 显示「前往 Studio 发布」或其他管理 CTA。
- 可提供 Archive / Search / Homepage 的低压力恢复入口。
- 不伪造作品、不展示 Draft、不推荐热门内容。

## 10. Loading State Contract

- 说明正在读取公开作者身份与 Published Works。
- Step02 可建立 route-local identity + works loading composition，保持最终页面几何连续。
- 不伪造作者名、bio、关注数字或 Work 内容。
- 使用 `aria-busy` / status 时避免重复播报。
- 不改变数据获取、缓存、Suspense 或 route architecture。

## 11. Error State Contract

- Error 与 Empty / Not Found 清楚区分。
- 保留 Retry，并可增加 Archive / Search 的既有 route recovery。
- 不暴露 Database、Supabase、RPC、Repository 或 stack details。
- 只保留一个明确 assertive announcement owner。
- 不自动替换作者、推荐作者或改变 slug。

## 12. Mobile Contract

- 390px zero horizontal overflow 是最低基线。
- Identity → Bio → Relationship → Published Works → Recovery 顺序稳定。
- Avatar / initials 不挤压长 display name 或 Follow action。
- Follow / Unfollow、Work title entry 与 recovery actions 至少 44px。
- Work list 使用自然单列，不压缩为窄小商品 tiles。
- 长作者名、长 bio、长作品标题与 summary 自然换行，不依赖 hover。
- 统计如保留，必须在长数字和本地化文案下保持可读，可换行或降为 supporting group。
- 不在 Author Profile Track 重写全站 Header。

## 13. Accessibility and Semantic Contract

- 保持单一 H1；Published Works 使用 H2；每项 Work 使用 H3。
- Identity、Relationship、Published Works、Empty / Error / Recovery 应有清楚语义归属。
- Follow / Unfollow 必须保留 native button、current-state wording、pending disabled 与 error announcement。
- Work title / primary action、Follow action 和 recovery actions 至少 44px。
- Focus-visible 不能只依赖颜色或 hover。
- Initials visual 继续提供可理解 accessible name；若未来只是装饰，应重新定义语义而不是重复 H1。
- Loading、Empty 与 Error 避免 nested live regions 或重复播报。

## 14. Long-content Contract

- H1 当前已有 `break-words`，应保留。
- Bio、Work title 与 summary 必须覆盖含空格长文和连续长 token，不产生 overflow。
- Bio 保留显式换行，但不得因超长内容推开 Follow action。
- Work title 不应依赖固定行数截断身份；summary 可克制截断，但必须保留足够故事判断信息。
- 当前正式 Fixture 不包含极端长作者名 / bio / title；Step02 必须用非持久化 QA 方法验证，不得伪造正式产品数据。

## 15. Published-only and Identity Boundary

- Profile public read 不要求登录，但只返回 active public Author identity。
- `works` 与 `publishedWorkCount` 必须继续只计算 `status = 'published'`。
- Draft Work 与 Draft Chapter 不得进入 Profile、count、metadata 或 Work list。
- `userId` 只用于 server-side follow / self rules，禁止渲染。
- Registration name、email、Membership、Role Grant、Invitation 与 Studio owner details 禁止渲染。
- Step02 不修改 RPC、RLS、Repository、Service、Gateway、Auth、Permission 或 data contract。

## 16. Cross-page Boundaries

### Archive

Archive 是 `Curated Story Discovery Space`，承担 Published Work 浏览、排序与分页；Author Profile 承接 public author attribution 与 body of work。Author Profile 不复制 Archive controls。

### Search

Search 是 `Active Story & Author Discovery`，承担主动 query；Author Profile 承接 Author Result。Author Profile 不增加 query input、search history、filters 或 recommendation。

### Work Detail

Work Detail 是具体故事判断页；Author Profile 从 body of work 提供明确 Work Detail entry。Work Detail byline 可返回 Author Profile。Author Profile 不复制章节目录或作品完整 metadata surface。

### Reading

Reading 是 `Private Literary Reading Space`。Author Profile 只通过 Work Detail 间接进入 Reading，不展示章节正文、navigation、settings、bookmark 或 history。

### Studio

Studio 是 owner-scoped creator workspace。Author Profile 即使由作者本人访问，仍不展示 edit、manage、publish、analytics、Draft 或 private account controls。全站 capability-gated Studio navigation 不属于 Profile page-local action。

## 17. Audit Findings

### AP-AUDIT-001 — Social-profile Signals Dominate Creator Identity

Severity: P2 product / visual hierarchy。

80px initials avatar、Follow CTA 与作品 / 关注者 / 关注中三项统计位于 Published Works 之前，使页面首先接近普通社交 Profile。现有 Follow 业务必须保留，但 Step02 应把 public identity、bio 与 body of work 提升为主层级，并把关系动作与数字降为 supporting context。

### AP-AUDIT-002 — Generic Card Stack Weakens Literary Identity

Severity: P2 visual identity。

Identity 与 Published Works 均使用通用 `reading-card`，Work 再嵌套两列 border cards；`Author Profile` English eyebrow 与中文主体混用。结构清楚但偏通用账号页 / inventory grid，尚未充分表达 Literary Creator Identity Space。

### AP-AUDIT-003 — Work Primary Entry and Touch Targets Are Weak

Severity: P2 accessibility / navigation。

Work title 当前不是 link，唯一 Work Detail entry「查看作品」在 390px 约 64 × 24px；重复 author self-link 约 115 × 17px。Step02 应让 title 成为明确的 44px primary entry，并同步提升必要 interaction targets，不改变 href。

### AP-AUDIT-004 — Repeated Self-attribution Adds Noise

Severity: P2 information hierarchy。

每张 Work card 重复显示当前 Profile 作者并链接回同一页面。该信息在作者 body of work 内没有新增上下文，反而分散 title、summary 与 Work Detail 路径的注意力。

### AP-AUDIT-005 — Public Work Contract Is Metadata-light in Presentation

Severity: P2 information completeness / Step02 constraint。

当前合同提供 title、summary 与 `publishedAt`，但页面未显示 publish context；rating、warnings、category、language、completion、tags 等字段不存在。Step02 可使用现有 `publishedAt`，不得扩张合同或伪造安全 / 分类元数据。

### AP-AUDIT-006 — Empty State Has No Discovery Recovery

Severity: P2 recovery。

Empty copy 能诚实说明没有公开作品，但没有 Archive / Search / Homepage recovery。Step02 可复用既有 route 提供低压力下一步，不得增加推荐逻辑或 Studio CTA。

### AP-AUDIT-007 — Loading Does Not Preserve Author Profile Shape

Severity: P2 visual stability。

真实 Loading 使用全页 StatusPage，identity、bio、relationship 与 works 几何暂时全部消失。Step02 可建立 route-local 静态 loading composition，但不得伪造作者与作品数据。

### AP-AUDIT-008 — Error Announcement and Recovery Are Narrow

Severity: P2 accessibility / recovery。

Error 同时使用 `aria-live="assertive"` 与 `role="alert"` 包裹 StatusPage，存在重复播报风险；当前只有 Retry，没有返回 Archive / Search 的恢复入口。

### AP-AUDIT-009 — Long-content Coverage Is Incomplete

Severity: P2 responsive QA。

当前 H1 已有 `break-words`，390px Fixture 无溢出；但正式 Fixture 不覆盖极端长 display name、bio 与 Work title，bio / Work title 也没有一致的显式 long-token wrap contract。Step02 需要非持久化 stress QA，不得伪造正式数据。

### AP-AUDIT-010 — Arrival Context Is Not Reflected on the Page

Severity: P2 navigation continuity。

Archive、Search、Work Detail 均能进入 Profile，但 Profile 页面没有明确的公共发现恢复区或 arrival-neutral navigation cue。Reader 只能依赖全站 Header / browser back；Step02 可增加克制的 Archive / Search recovery，不得建立新的导航系统。

## 18. Existing Strengths to Preserve

- Guest-readable public Author Profile。
- Active public Author eligibility。
- Published-only Work aggregation and deterministic ordering。
- Draft Work / Chapter isolation。
- Public / private identity separation；`userId` 不渲染。
- Author self-follow prevention and self action hiding。
- Guest sign-in return、Reader Follow state、pending / error foundations。
- One H1、Published Works H2、Work H3、semantic list 与 statistics `dl`。
- Honest no-bio and no-published-work fallbacks。
- Archive、Search、Work Detail 与 Profile 双向入口。
- 1280 / 390 zero overflow。
- Guest Follow entry 与 Follow button 44px foundation。
- No Studio page-local actions、Draft、Feed、ranking、Marketplace、messages 或 comments。

## 19. UX-06F Step02 Recommended Scope

Step02 可执行范围建议：

1. 建立 route-local Author Profile shell / presentation classes，不改 data flow。
2. 重构视觉节奏：Public Identity → Bio → quiet Relationship → Published Works Context → Body of Work → Recovery。
3. 降低 generic social-profile header、统计面板和 nested inventory-card feeling；保持 Follow 功能不变。
4. 统一 Reader-facing 中文语气，移除 `Author Profile` 等内部 / 混合展示语言。
5. 使用现有 display name、bio、counts、title、summary、`publishedAt` 优化信息层级。
6. 让 Work title 成为主要 Work Detail entry，并把 Follow、Work 与 recovery actions 补足为至少 44px。
7. 降低重复 author self-link；不改变 Archive / Search / Work Detail 的作者链接合同。
8. 完善 Empty recovery、Profile-shaped Loading 与单一 Error announcement owner。
9. 验证 1440 / 1280 / 768 / 390、Light / Dark、keyboard、focus、heading、regions、touch targets、long name / bio / title 与 zero overflow。
10. 回归 Guest / Reader / Author、Follow state、self state、Archive / Search / Work Detail entries、Published-only、Draft isolation 与 browser console。

Step02 不得：

- 修改 Follow / Unfollow 业务、action、authorization、RPC、counts semantics 或 revalidation。
- 新增 follower list、following list、subscription、notification、message、comment、activity、Feed 或 social plaza。
- 新增作者 / 作品字段、metadata、sort、filter、search、pagination、recommendation 或 ranking。
- 修改 Database、Supabase、RLS、RPC、Migration、Gateway、Service、Repository 或 Permission。
- 修改 Archive、Search、Work Detail、Reading、Studio 或全站 Header 实现。
- 引入 dependency、全站 Design System replacement 或 production configuration change。

## 20. Validation Result

- `pnpm qa:fixture`：PASS；localhost only。
- `pnpm qa:credentials`：PASS；具体密码未记录。
- Guest / Reader / Author browser QA：PASS。
- Archive / Search / Work Detail → Author Profile：PASS。
- Author Profile → Published Work：Reader PASS。
- Current Follow / self state：PASS；未执行 Follow 数据写入。
- Published-only、Draft Work / Chapter isolation：PASS。
- 1280 / 390、zero overflow：PASS。
- Browser console errors：0。
- Web lint / typecheck / test / build：PASS；Web 79 / 79 tests。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。
- Product implementation changes：NONE。
- Database / Supabase / RLS / RPC / Migration changes：NONE。

## 21. Step01 Decision

当前 Author Profile 功能基线可继续作为 Step02 输入；没有必须先修改产品代码、Follow 业务或扩张数据合同才能建立受控 Layout Upgrade 的 P0 / P1 阻塞。

Author Profile Ready for Step02：**YES**。

UX-06F Step01 完成后停止，等待 Product Owner 验收与 Step02 独立授权。

## 22. Step02 Implementation Record

UX-06F Step02 已在本合同边界内完成 Author Profile route-local Layout Upgrade：

- 建立 Public Identity → Bio → Quiet Relationship → Published Works Context → Body of Work → Recovery 节奏。
- display name、bio 与 Published Works 成为主层级；avatar、公开计数与 Follow 降为 supporting context。
- Work title 与「查看作品」成为 44px Work Detail entries；使用既有 `publishedAt`，移除重复 self-attribution。
- 完成 Empty recovery、Profile-shaped Loading 与 single-owner Error recovery。
- Guest / Reader / Author、Archive / Search / Work Detail 往返、Published-only、Draft isolation、四档 viewport、Light / Dark、focus 与 console 0 通过。
- AP-AUDIT-001–008、010 已关闭；AP-AUDIT-009 的实现保护已完成，现有 Fixture 缺少极端长内容的运行态证据记录为 `AP-QA-001`，供未来获授权的 Step03 复核。
- 没有修改 Follow / Unfollow 业务、Author Profile data contract、Database、Supabase、RLS、RPC、Migration、Gateway、Service、Repository、Auth、Permission 或其他页面。

详细验收证据见 `UX-06F-STEP02_ACCEPTANCE.md`。

Author Profile Layout Ready for Step03：**YES**。UX-06F Step03 未授权，不得自动开始。

## 23. Step03 States & Responsive QA Record

Date: 2026-07-14

UX-06F Step03 已对 Step02 冻结实现完成集中复验：

- Public Identity、Bio、Quiet Relationship、Published Works Context、Body of Work 与 Recovery 结构保持稳定。
- Guest、Reader followed / unfollowed / pending、Author self 与恢复后的 Follow 状态全部 PASS。
- Archive / Search / Work Detail 往返、Published-only、Draft Work / Chapter isolation 全部 PASS。
- 真实 client navigation 捕获 Profile-shaped Loading；Empty 因无零作品公开 Author 而保持实现审计；Error 按禁止破坏依赖的边界完成合同审计。
- 1440 × 900、1280 × 800、768 × 1024、390 × 844、Light / Dark、keyboard、focus-visible、44px targets 与 zero overflow 全部 PASS。
- AP-AUDIT-001–008、010 保持 Closed；AP-AUDIT-009 implementation protection 保持完成。
- `AP-QA-001` 保留为非阻塞 QA Fixture 增强项，不是产品 finding 或数据扩张授权。
- Browser console errors = 0；P0 = 0，P1 = 0。
- 本轮未修改产品实现、Follow 业务、data contract、permission 或数据层。

详细证据见 `UX-06F-STEP03_ACCEPTANCE.md`。

Author Profile Ready for Step04：**YES**。UX-06F Step04 未授权，不得自动开始。

## 24. Step04 Release Acceptance Record

Date: 2026-07-14

UX-06F Step04 已完成 Author Profile Track 最终 Release Acceptance：

- Step01 Design Contract、Step02 Layout Upgrade 与 Step03 States / Responsive QA 均进入最终 Release baseline。
- Author Profile 最终定位为 Literary Creator Identity Space。
- 最终结构冻结为 Public Identity → Bio → Quiet Relationship → Published Works Context → Body of Work → Recovery。
- Guest、Reader Followed / Unfollowed / Pending、Author self 与最终 Follow Fixture 恢复全部 PASS。
- Published Works、Work Detail 往返、Archive / Search recovery、Published-only 与 Draft isolation 全部 PASS。
- Empty / Error contracts 与真实 Profile-shaped Loading 全部 PASS。
- 1440 / 1280 / 768 / 390、Light / Dark、named regions、semantic list、keyboard focus、44px targets 与 zero overflow 全部 PASS。
- Browser console errors = 0；P0 = 0，P1 = 0，Author Profile product P2 / post-Beta finding = 0。
- AP-QA-001 保留为非阻塞 QA Fixture 增强项，不构成 Release 或 Beta 阻塞。
- 本轮未修改产品实现、Follow 业务、data contract、permission 或数据层。

详细证据见 `UX-06F-STEP04_ACCEPTANCE.md`。

Author Profile Ready for Release：**YES**。等待 Product Owner 最终验收；不得继续优化 Author Profile 或启动新的 UX Track。
