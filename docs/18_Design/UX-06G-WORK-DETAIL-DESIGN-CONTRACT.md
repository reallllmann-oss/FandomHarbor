# UX-06G Work Detail UI Audit & Design Contract

Mission: UX-06G Step04 Work Detail Release Acceptance
Status: Completed / Awaiting Product Owner Final Review
Phase: Implementation Polish
Date: 2026-07-14
Implementation Changes: Step04 documentation only；Step02 route-local presentation retained

## 1. Mission Boundary

本 Mission 只审计当前 `/works/[slug]` 页面，并建立后续受控视觉与交互升级合同。

本 Mission 不修改：

- Product code、React structure、CSS、Component 或 route。
- Database、Supabase、RLS、RPC、Migration。
- Auth、Permission、Published-only rule 或 Draft isolation。
- Work Detail Gateway、Service、Repository、查询或数据合同。
- Work、Author、Chapter fields、metadata、ordering 或 Reading behavior。
- Archive、Search、Author Profile、Reading、Studio。
- Dependency、runtime 或 production deployment configuration。

如后续实现需要匿名开放 Work Detail、新增字段、扩大 metadata、改变章节选择、Continue Reading、下载、权限或 Published-only 边界，必须停止并申请独立授权；不得并入 UX-06G Step02。

## 2. Work Detail Product Position

Work Detail 是 Fandom Harbor 的 **Literary Work Decision Space**，承担发现与沉浸阅读之间的作品理解和阅读决策。

Work Detail 必须承担：

- 公开 Published Work 的详情表达。
- Reader 理解作品身份、作者归属和简介的入口。
- Reader 判断是否开始或继续阅读的入口。
- Archive / Search / Author Profile 之后的作品承接。
- Reading 之前的章节与阅读路径交接。
- 在不暴露 Draft、私人身份或 Studio 行为的前提下，表达 Published context。

Work Detail 不承担：

- Studio 创建、编辑、发布、管理或 analytics。
- Reading 章节正文、导航、设置、bookmark 或沉浸阅读。
- Archive 浏览、排序或分页。
- Search 主动查询。
- Author Profile 的作者身份聚合与完整作品集合。
- 推荐、排名、Feed、Marketplace、评论、点赞、收藏广场或社交功能。

“公开作品详情”描述的是 Published Work 的公开内容语义，不自动改变当前访问权限。现有实现仍要求有效 Session 与 `archive:read` capability；Guest 会进入登录页。Step02 必须保留该 Auth / Permission 合同。如需匿名访问，必须建立独立授权 Mission。

## 3. Current Implementation Audit

### 3.1 Route and Access

- Route：`/works/[slug]`。
- Rendering：`force-dynamic`。
- Work metadata：`generateMetadata()` 使用现有 Public Search Gateway 查找 Published Work。
- Page data：`createHybridReaderContentGateway()` → Content Service → runtime / fixture Content Store。
- Author attribution：现有 Social Relationship Gateway 的 Published Work author mapping。
- Session：无 Session 时 `redirect('/auth/sign-in')`。
- Capability：无 `archive:read` 时 `redirect('/access')`。
- Guest 进入 Work Detail 后登录页没有保留 `next=/works/[slug]`；登录成功落到既有默认 `/archive`。
- Published Work / Chapter 不存在时进入 `notFound()`。

### 3.2 Current Data Contract

当前 `WorkReadingData` 提供：

- `work`：`id`、`title`、`slug`、`summary`、`status`、`publishedAt`、`updatedAt`、`createdAt`、`categoryId`。
- `chapters`：`id`、`title`、`slug`、`position`、`status`、`publishedAt`、时间字段与正文。
- `tags`：既有 governed Content Tag 对象。
- 作者映射：`displayName`、`authorSlug` 等既有公开作者字段。

当前 UI 使用：

- Work title、summary、author、tag name。
- Published Chapter count、固定「已发布」状态和 `updatedAt`。
- Chapter position、title、slug。
- Reading History 里的现有 Continue Reading 状态。

当前合同不提供可直接展示的 rating、warnings、language、completion state、comment count、kudos、recommendation 或 ranking。`categoryId` 不是 Reader-facing category label。Step02 不得伪造、推导或新增这些字段。

### 3.3 Current Page Regions

当前页面顺序：

1. Breadcrumb：`阅读目录 / Work title`，返回 `/works` Reader Library。
2. 通用 `reading-card`：English `Work` eyebrow、title、summary、author、tags、统计。
3. Continue Reading：仅在当前浏览器存在有效历史时显示。
4. Primary actions：开始阅读、下载 TXT。
5. Chapter section：English `Contents`、章节目录、ordered list 或无章节文案。

### 3.4 Work Identity and Published Context

- Work title 是唯一 H1，层级明确。
- Summary 紧随 title，但使用 supporting muted style；空字符串仍会渲染空 paragraph，没有缺省文案。
- Author 是可点击公开身份，但在 1280 与 390 下高度约 16.5px。
- Tags 以带 `aria-label` 的 `div` 呈现，不是语义 list；只展示 name。
- 统计使用 `dl`，显示章节数、固定「已发布」和更新时间。
- 当前页面展示 `updatedAt`，未使用已有 `publishedAt` 表达首次发布语境。
- English `Work`、`Contents`、`Chapter` 与中文页面主体混用。

### 3.5 Reading and Chapter Entry

- 有公开章节时，`chapters[0]` 是「开始阅读」入口。
- Continue Reading 仅使用本地 Reading History；不改变 server data 或权限。
- 有历史时「继续阅读」「开始阅读」与第一章目录入口会同时出现。
- 下载 TXT 与开始阅读并列，但视觉上未充分表达其 supporting utility 身份。
- Chapter list 使用 `ol`，每项链接至少 44px，position 与 title 清楚。
- Draft Chapter 不进入章节目录、开始阅读或 Continue Reading 可用 slug 集合。

### 3.6 Current States

- Default：Work identity、summary、author、metadata、reading action 与章节目录。
- Continue：在 Default 上增加 browser-local Continue Reading aside。
- No Chapters：保留 Work identity，章节目录显示「这部作品暂时没有已发布章节」，不显示开始阅读。
- No Summary：当前 Fixture 无覆盖；实现会留下空 summary paragraph。
- Loading：没有 route-local Work Detail loading，使用全局「正在打开 Fandom Harbor」StatusPage。
- Error：没有 route-local Work Detail error，使用全局 Error；提供 Retry 与返回 `/works`。
- Not Found：使用全局 Not Found；unknown、Draft Work 与 Draft Chapter 共享不泄露状态。
- Not Found recovery 文案将 `/archive` 描述为「本地书架」，与当前 Archive 的公共发现定位不一致。

### 3.7 Cross-page Entry Evidence

- Archive → `/works/qa-reading-short`：PASS。
- Search Work Result → `/works/qa-reading-short`：PASS。
- Author Profile Published Work → `/works/qa-reading-short`：PASS。
- Work Detail author → `/author/harbor-qa-author`：PASS。
- Work Detail「开始阅读」→ `/works/qa-reading-short/chapters/quick-check`：PASS。
- Work Detail recovery 当前只显式返回 `/works` Reader Library；没有 route-local Archive / Search / Author Profile recovery group。

### 3.8 Role, Isolation and Responsive Evidence

- Guest：进入登录页，符合当前权限实现；登录后不自动返回原 Work。
- Reader：Work Detail、Author Profile 与 Reading 入口 PASS。
- Author：Work Detail 与 Reading 入口 PASS；page-local Studio actions = 0。
- Published Work：PASS。
- Draft Work：Not Found presentation，PASS。
- Draft Chapter：Not Found presentation，PASS。
- Long-form fixture 只显示 3 个 Published Chapters；`sealed-draft` 不出现。
- 1280px：document 1280 / 1280、main 1216 / 1216，zero horizontal overflow。
- 390 × 844：document 390 / 390、main 358 / 358，zero horizontal overflow。
- 390px 开始阅读、下载与 Chapter entries：至少 44px。
- 390px Breadcrumb / Author link：约 16.5px 高。
- H1：1；章节目录使用 H2；Chapter list 使用 semantic ordered list。
- Browser console errors：0。

## 4. Page Goal

Work Detail 的页面目标是：让 Reader 在进入正文之前，快速理解“这是什么作品、由谁创作、内容大意是什么、当前有哪些公开章节、从哪里开始或继续”，并能在不改变权限或数据合同的情况下做出明确阅读决策。

成功标准：

- Work title、summary 与 author attribution 建立清楚作品身份。
- Published context 诚实表达当前公开状态，不暗示不存在的 rating、warning 或 completion 信息。
- Start / Continue Reading 构成明确的主路径，Download 保持 supporting utility。
- Chapter list 支持理解作品结构，而不复制 Reading 的沉浸导航。
- Empty、Loading、Error 与 Not Found 状态都可理解、可恢复且不泄露技术信息。
- Archive / Search / Author Profile 的到达关系清楚，Reader 可继续发现或返回作者。
- Draft、私人账号和 Studio 管理始终不可见。

## 5. Information Priority

### Primary

1. Work title。
2. Summary / story premise。
3. Start / Continue Reading decision。
4. Published Chapter structure。

### Secondary

1. Public author attribution / Author Profile entry。
2. Published context：只使用当前已有且语义可靠的字段。
3. Existing governed tags。
4. Chapter count 与更新时间 / 发布时间语境。

### Supporting

1. Download TXT。
2. Recovery to Archive / Search / Author Profile。
3. Empty、Loading、Error、Not Found guidance。
4. Browser-local Reading History signal。

Studio actions、private owner identity、Draft state、ranking、engagement、recommendation 与不存在的 metadata 不属于 Work Detail 信息层级。

## 6. Page Regions Contract

### A. Work Orientation

- 使用一个 H1 作为 Work identity anchor。
- 可保留克制的作品类型 eyebrow，但必须面向 Reader，不使用内部系统或 CMS 语言。
- Arrival-neutral，不假设 Reader 一定来自 Archive、Search 或 Author Profile。
- 不显示 Studio manage / edit / publish action。

### B. Story Premise

- Summary 是阅读判断主线，不应降为微弱系统备注。
- 空 summary 使用安静、诚实的缺省文案，不制造内容。
- 不新增 synopsis、warning、rating 或 description 字段。

### C. Author Attribution

- 显示现有 public author display name，并链接 Author Profile。
- Author entry 至少 44px，具备明确 focus-visible。
- 不展示 registration name、email、user ID、Membership、role grant 或 Studio owner context。
- Work Detail 只表达归属，不复制 Author Profile 的 bio、统计、Follow 或完整 Published Works 集合。

### D. Published Context

- 明确当前页面只展示 Published Work 与 Published Chapters。
- 可使用现有 `publishedAt`、`updatedAt`、Chapter count 与 tag names；必须准确标注语义。
- `categoryId` 不能直接展示，也不能推导 category label。
- 不伪造 rating、warnings、language、completion 或 popularity。

### E. Reading Decision

- Continue Reading 如存在，是 returning-reader primary path。
- Start Reading 是 first-time / restart path；与 Continue 同时存在时层级必须清楚。
- Download TXT 是 supporting utility，不与进入 Reading 的主决策争夺层级。
- 所有 entry 保留现有 href、history、download 与权限行为。

### F. Chapter Overview

- 使用 H2 与 semantic ordered list。
- 每项显示既有 position 与 title，并直接进入对应 Reading route。
- Entry 至少 44px，支持长 Chapter title 换行与 focus-visible。
- 不在 Work Detail 增加 Reading settings、previous / next、bookmark 或正文预览。

### G. Recovery

- 提供 arrival-neutral 的 Archive / Search 公共发现恢复。
- Author Profile entry 已在 attribution 中承担作者返回路径，不重复为强 CTA。
- `/works` Reader Library 可作为已登录 Reader 的 private return，但不能替代 Archive 的公共发现语义。
- 不实现 origin tracking、智能返回、推荐或新 URL state。

## 7. Work Identity Contract

- Work title 是唯一作品身份主锚点和页面 H1。
- Title 不依赖固定单行或省略来维持布局。
- 不展示 raw slug、owner ID、internal status code 或 Studio identifier。
- Work identity 应像文学作品记录，而不是数据库详情、商品页或库存卡片。
- 当前 `reading-card` 可在 Step02 route-local presentation 中降级，但不得修改 shared Design System 或其他页面。

## 8. Author Attribution Contract

- 使用当前 public author mapping；author unavailable 时不伪造「官方作者」。
- Author name / link 是 secondary identity path，不压过 Work title 与 reading decision。
- 可点击区域至少 44px，并保持自然文本视觉权重。
- 不增加 avatar、bio、Follow、follower count、author works preview 或社交模块。

## 9. Summary Contract

- Summary 支持 Reader 判断 premise 与 tone，是 Primary information。
- 有内容时保留完整自然换行；不得因通用卡片高度而强制截断。
- 空内容时显示「这部作品暂未留下简介」或等价安静文案。
- 不把 tag、chapter title 或 metadata 拼接成伪 summary。
- 长 summary 与连续长 token 必须在 390px 下不产生水平溢出。

## 10. Published Context Contract

- `status = published` 是数据权限合同，不是可由 UI 切换的 filter。
- 页面可展示「已发布」以及现有日期，但必须区分 publish 与 update 语义。
- Chapter count 只计算当前 gateway 返回的 Published Chapters。
- Tags 只使用当前结果；不得增加筛选、搜索、推荐或 tag navigation。
- UX-04 中的 rating / warnings 属于未来数据合同方向；当前 Step02 不得伪造或新增。

## 11. Chapter and Reading Entry Contract

- `chapters[0]` 与现有排序保持不变；Step02 不重排章节。
- Continue Reading 继续使用 browser-local history，不改 localStorage key、算法或可用章节校验。
- Start、Continue、Chapter entry 与 Download href / behavior 均保持不变。
- Reading entry 文案必须区分「继续」与「开始」，不只依赖位置或颜色。
- 无 Published Chapter 时不显示无效 Start / Download action。
- Work Detail 只提供阅读入口和章节概览；正文与沉浸控制留在 Reading。

## 12. Recovery and Return Contract

- Work Detail 必须支持回到 Archive 与 Search 的既有 routes。
- Author link 是返回作者上下文的主要路径。
- Reader Library `/works` 是当前登录 Reader 的 private return path，不应被描述为 Archive。
- 不实现来源参数、历史堆栈判断或自动 back navigation。
- Guest 登录后的 return behavior 属于 Auth contract；Step02 不修改。

## 13. Empty and Not Found Contract

### No Published Chapters

- 保留 Work identity 与 summary；明确作品当前没有可读的公开章节。
- 不把它表现为 Work 不存在、权限错误或 Draft。
- 可提供 Archive / Search / Author Profile recovery。
- 不显示 Studio CTA、Draft Chapter 或伪造开始阅读入口。

### Not Found

- Unknown、Draft Work 与越权内容继续使用统一、不泄露的 Not Found presentation。
- 文案不确认 Draft、owner、权限或数据库事实。
- Recovery 必须使用准确的 Archive / Search / Reader Library 命名。
- 不改变 `notFound()`、Auth、Permission 或 Published-only 行为。

## 14. Loading State Contract

- 说明正在准备作品身份、公开章节与阅读入口。
- Step02 可增加 route-local Work-shaped loading composition，维持 identity / decision / chapters 几何连续。
- 不伪造具体 Work title、author、tags、dates 或 Chapter title。
- 使用 `aria-busy` / status 时避免重复 live announcement。
- 不改变 Suspense、fetch、cache、Gateway 或 route architecture。

## 15. Error State Contract

- Error 与 No Chapters / Not Found 清楚区分。
- 保留 Retry，并提供 Archive / Search recovery。
- 不暴露 Supabase、RPC、Repository、stack、slug lookup 或权限细节。
- 只保留一个明确 assertive announcement owner。
- Step02 只可新增 route-local presentation，不得改变错误来源或数据行为。

## 16. Mobile Contract

- 390px zero horizontal overflow 是最低基线。
- Work Identity → Summary → Author / Published Context → Reading Decision → Chapters → Recovery 顺序稳定。
- Work title、summary、author name、tag name 与 Chapter title 自然换行。
- Start / Continue、Download、Author、Chapter 与 recovery actions 至少 44px。
- `dl` metadata 在窄屏可换行，不挤压数字或日期。
- 不把章节压缩为多列小卡片，不依赖 hover 才显示阅读入口。
- 不在 Work Detail Track 重写全站 Header。

## 17. Accessibility and Semantic Contract

- 保持单一 H1；Chapter Overview 使用 H2；Continue Reading 如出现使用合理 H2 层级。
- Work identity、Reading Decision、Chapter Overview 与 Recovery 应有清楚语义归属。
- Chapter collection 使用 `ol`；tags 如继续成组展示，应使用可理解的列表语义。
- Author、Breadcrumb / recovery、Start / Continue、Download 与 Chapter entries 至少 44px。
- Focus-visible 不能只依赖颜色或 hover。
- Link / Button 文案必须表达目标；Reading entry 不使用含糊的「打开」。
- Loading、Error 与 Not Found 避免 nested live regions 或重复播报。

## 18. Long-content Contract

- Work title、summary、author name、tag name 与 Chapter title 必须支持长文本和连续长 token。
- Breadcrumb 可换行或在不丢失 destination 的情况下收敛，不能推动页面横向溢出。
- Summary 为空时必须有明确 fallback；不能留下无意义空白。
- 当前 Fixture 覆盖多章节与普通长度内容，但不覆盖极端长 title / summary / Chapter title；Step02 需使用非持久化 stress QA，不得伪造正式产品数据。

## 19. Published-only and Draft Isolation

- Work Detail 必须继续通过现有 Reader Content Gateway 读取 Published Work。
- Chapter list、count、Start、Continue 和 Download 只能使用 Published Chapters。
- Draft Work 与 Draft Chapter 不得进入页面、metadata、history validation 或 Download。
- Unknown 与 Draft 内容继续 fail closed；UI 不得泄露 Draft existence。
- Step02 不修改 Database、Supabase、RLS、RPC、Repository、Service、Gateway、Auth、Permission 或 query contract。

## 20. Cross-page Boundaries

### Archive

Archive 是 `Curated Story Discovery Space`，承担 Published Work 浏览、排序与分页；Work Detail 承接单一作品的理解与阅读决策。Work Detail 不复制 sort、pagination 或 Archive results。

### Search

Search 是 `Active Story & Author Discovery`，承担主动 query；Work Detail 承接 Work Result。Work Detail 不增加 query input、filter、search history 或 recommendation。

### Author Profile

Author Profile 是 `Literary Creator Identity Space`，承担作者身份与 Published Works body of work；Work Detail 只显示作者归属并提供 Profile entry，不复制 bio、Follow、counts 或作品集合。

### Reading

Reading 是 `Private Literary Reading Space`。Work Detail 只提供 Start / Continue 与 Chapter entry，不展示正文、navigation、settings、bookmark 或 reading controls。

### Studio

Studio 是 owner-scoped creator workspace。Author 查看自己的 Work Detail 时仍是 Reader-facing 页面，不增加 edit、manage、publish、Draft、analytics 或 owner-only action。

## 21. Audit Findings

### WD-AUDIT-001 — Public Positioning and Access Boundary Are Not Explicit

Severity: P2 product semantics / governance boundary。

Work metadata 与发现入口是公开 Published-only，但详情页面要求 Session 与 `archive:read`。Guest 被送往登录页且没有 Work return parameter。Step02 必须如实保持并表达当前访问合同；匿名开放或登录回跳属于 Auth / Permission 变更，必须另行授权。

### WD-AUDIT-002 — Generic Card Presentation Weakens Literary Decision Identity

Severity: P2 visual identity。

Work identity 使用通用 `reading-card`，Chapter 使用通用 `stat-card`；English `Work / Contents / Chapter` 与中文主体混用。页面清楚但偏数据库详情 / inventory card stack，尚未形成 Literary Work Decision Space 的编辑式节奏。

### WD-AUDIT-003 — Story Premise and Published Context Need Clearer Hierarchy

Severity: P2 information hierarchy。

Summary 作为 muted supporting paragraph，Published context 只显示固定状态、章节数与更新时间。已有 `publishedAt` 未使用，tags 只以 pills 展示。Step02 可重排并使用当前真实字段，但不得增加 metadata。

### WD-AUDIT-004 — Author and Return Entries Miss the 44px Baseline

Severity: P2 accessibility / navigation。

1280 与 390 下 Author link 和 Breadcrumb link 均约 16.5px 高；Start、Download 与 Chapter entries 已达到 44px。Step02 应扩大必要点击区域并保留原 href、语义和视觉克制。

### WD-AUDIT-005 — Recovery Path Uses Reader Library as the Only Explicit Return

Severity: P2 navigation continuity。

Breadcrumb 只返回 `/works`，没有 route-local Archive / Search recovery；`/works` 当前是登录 Reader Library，不等同于 Archive。Step02 可增加 arrival-neutral recovery，不实现来源跟踪或新 URL 状态。

### WD-AUDIT-006 — Start, Continue and Download Hierarchy Is Ambiguous

Severity: P2 interaction hierarchy。

存在历史时 Continue、Start、第一章 entry 同时出现；Download 与 Start 并列。所有行为均有效，但 returning-reader primary path、restart path 与 utility path 的层级不够清楚。Step02 只调整 presentation 与文案层级，不改行为。

### WD-AUDIT-007 — No-Chapter and No-Summary States Are Under-specified

Severity: P2 state clarity。

No Chapters 能诚实显示，但没有下一步 recovery；No Summary 没有 Fixture 覆盖，代码会留下空 paragraph。Step02 可增加现有字段 fallback 和 recovery，不伪造正式数据。

### WD-AUDIT-008 — Loading, Error and Not Found Are Generic

Severity: P2 state / recovery。

Work Detail 没有 route-local states；Loading 不保留作品页几何，Error 只返回 `/works`，Not Found 把 `/archive` 命名为「本地书架」。Step02 可建立 route-local presentation，但不得改变 fetch、error、notFound 或权限合同。

### WD-AUDIT-009 — Current Data Contract Cannot Fulfil Rating / Warning Aspirations

Severity: P2 data-contract constraint。

UX-04 体验蓝图提到 rating、warnings、category、language 与 completion，但当前 Work Detail 合同没有可展示字段或 category label。Step02 必须保持 metadata-light；未来若要增加，需要独立数据合同 Mission。

### WD-AUDIT-010 — Long-content Runtime Coverage Is Incomplete

Severity: P2 responsive QA。

普通 Fixture 在 390px 下 zero overflow，但当前 Fixture 不覆盖极端长 Work title、summary、author、tag 或 Chapter title。Step02 需要非持久化 stress QA，并增加 route-local wrap protection，不得扩张 Fixture 为正式数据。

## 22. Existing Strengths to Preserve

- 单一 Work H1 与清楚 Chapter H2。
- Published-only Work / Chapter gateway 和 fail-closed Not Found。
- Draft Work / Chapter isolation。
- Public author attribution 与 Author Profile route。
- Start Reading、Continue Reading、Chapter entries 与 Download 的既有行为。
- Chapter semantic ordered list 与 position ordering。
- Metadata `dl` 与 tag group accessible label foundation。
- Start、Download 与 Chapter entries 的 44px baseline。
- 1280 / 390 zero horizontal overflow。
- Reader / Author access、无 page-local Studio action、private identity 不泄露。
- Archive、Search、Author Profile → Work Detail 和 Work Detail → Author / Reading 路径。
- Zero browser console errors。

## 23. UX-06G Step02 Recommended Scope

Step02 只建议执行以下受控 Work Detail route-local Layout Upgrade：

1. 建立 `Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery` 页面节奏。
2. 使用 route-local classes / presentation 降低通用 `reading-card / stat-card` 库存感，不修改 shared Design System。
3. 提升 summary、author attribution 与 reading decision 层级；保留现有数据和 href。
4. 将 Author、return 与 recovery entries 提升到至少 44px，并保留 focus-visible。
5. 明确 Continue / Start / Download 的主次，不修改 Reading History、download 或 chapter selection。
6. 使用现有 `publishedAt / updatedAt / chapter count / tags` 建立克制 Published context，不增加字段。
7. 为 empty summary 与 no-chapter 增加诚实 fallback / recovery。
8. 增加 route-local Work-shaped Loading、Work-specific Error 与准确 Not Found recovery presentation。
9. 验证 1440、1280、768、390、Light / Dark、keyboard、focus、long content 与 zero overflow。
10. 复验 Guest redirect、Reader / Author、Published-only、Draft isolation 与跨页入口。

Step02 明确不得：

- 改变 Guest / Session / capability / login return 行为。
- 修改 Gateway、Service、Repository、query、Chapter order、history、download 或 Reading。
- 新增 rating、warnings、category label、language、completion 或其他 metadata。
- 新增 recommendation、comments、collections、social、filter、sort 或 search。
- 修改 Archive、Search、Author Profile、Reading、Studio 或 shared Header。

## 24. Validation Result

- `pnpm qa:fixture`：PASS；localhost only。
- Local QA credentials：存在、local-only、permission-safe；具体密码未记录。
- Archive → Work Detail：PASS。
- Search Work Result → Work Detail：PASS。
- Author Profile → Work Detail：PASS。
- Work Detail → Author Profile：PASS。
- Work Detail → Reading：PASS。
- Guest：登录边界 PASS；不会自动回到原 Work 的现状已记录。
- Reader：PASS。
- Author：PASS；page-local Studio actions = 0。
- No Chapters fixture：PASS；recovery finding 已记录。
- No Summary：当前 Fixture 无覆盖；实现审计 finding 已记录。
- Published-only：PASS。
- Draft Work / Chapter isolation：PASS。
- 1280 / 390 zero horizontal overflow：PASS。
- Browser console errors：0。
- Web lint / typecheck / tests / build：PASS。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。

## 25. Step01 Decision

- P0：0。
- P1：0。
- P2 findings：WD-AUDIT-001–010。
- Product implementation changed：NO。
- Data、Auth、Permission、Published-only、Gateway、Service、Repository、query contract changed：NO。
- Work Detail Ready for Step02：YES。
- UX-06G Step02：未授权、未开始。

完成 Step01 后停止，等待 Product Owner 验收。

## 26. UX-06G Step02 Implementation Record

UX-06G Step02 已在 Step01 冻结合同内完成受控 Work Detail route-local Layout Upgrade。

最终页面节奏：

`Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery`

本次实现：

1. 将 Work identity、作品简介、作者归属和 Published context 拆为清楚的编辑式层级，降低通用卡片与库存列表感。
2. 仅使用现有 title、summary、author、tags、publishedAt、updatedAt 与 Chapter count；没有新增、推导或伪造 metadata。
3. 将 Continue、Start、Download 分为 returning-reader、restart 与 utility 层级；所有 href、历史读取、首章选择与下载行为保持不变。
4. 使用有序章节列表表达 Published Chapter 顺序，保留 Gateway 提供的现有 ordering。
5. 为无简介提供诚实 fallback，为无公开章节提供明确不可读状态和 Archive / Search / Reader Library recovery。
6. 新增 Work-shaped route-local Loading、Work-specific Error 与准确、不泄露资源存在性的 Not Found presentation。
7. 将 Author、breadcrumb、reading actions、Chapter entries 与 recovery links 的点击高度提升到至少 44px，并保留可见焦点与语义结构。
8. 增加 route-local long-content wrap protection，并在 1440、1280、768、390 下保持 zero horizontal overflow。

## 27. Step02 Finding Disposition

| Finding      | Step02 disposition                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| WD-AUDIT-001 | Accepted boundary；Guest sign-in、`archive:read` 与 login return behavior 原样保留，未伪装为匿名访问                                       |
| WD-AUDIT-002 | Closed；Work Orientation、Story Premise 与 Reading Decision 建立清楚主次                                                                   |
| WD-AUDIT-003 | Closed；Public author attribution 独立成区并提供至少 44px 入口                                                                             |
| WD-AUDIT-004 | Closed；summary 成为阅读判断核心内容，空值使用诚实 fallback                                                                                |
| WD-AUDIT-005 | Closed；Published context 使用现有字段建立克制语义，不扩张合同                                                                             |
| WD-AUDIT-006 | Closed；Continue / Start / Download 视觉主次明确，行为不变                                                                                 |
| WD-AUDIT-007 | Closed for presentation；No Chapters runtime recovery 与 No Summary source fallback 已完成                                                 |
| WD-AUDIT-008 | Closed for presentation；route-local Loading / Error / Not Found 已建立，错误来源、fetch 与权限行为不变                                    |
| WD-AUDIT-009 | Accepted data-contract boundary；rating、warnings、language、completion、category label 等仍不存在，不属于 Step02                          |
| WD-AUDIT-010 | Closed for implementation；route-local wrap protection 与四档 zero-overflow 已通过。极端长内容 Fixture 覆盖记录为 non-blocking `WD-QA-001` |

P0 = 0，P1 = 0。`WD-QA-001` 仅建议后续在授权的 QA Fixture Mission 中补充极端长 Work title、summary、author、tag 与 Chapter title，不构成 Step02 或 Step03 阻塞。

## 28. Step02 Frozen Boundary

- Database、Supabase、Migration、RLS、RPC、Gateway、Service、Repository 与 query contract：未修改。
- Auth、Permission、Guest gate、login return、Published-only 与 Draft isolation：未修改。
- Reading History、Start chapter selection、Chapter order、Download 与 Reading route behavior：未修改。
- Work、Author、Chapter fields与 metadata：未新增、未扩张。
- Archive、Search、Author Profile、Reading、Studio 与 shared Header：未修改。
- 新依赖、production deployment configuration：未修改。

## 29. Step02 Validation Result

- Local QA Fixture rebuild：PASS；仅用于 localhost。
- Local Reader / Author credentials：PASS；具体密码未写入文档或报告。
- Guest gate、Reader、Author：PASS。
- Archive / Search / Author Profile → Work Detail：PASS。
- Work Detail → Author Profile / Start Reading / Continue Reading：PASS。
- Download：PASS；行为与 URL 保持不变。
- Published-only、Draft Work isolation、Draft Chapter isolation：PASS。
- Normal、No Chapters、Loading、Not Found：PASS；No Summary fallback 与 Error presentation 完成 source-level contract verification。
- 1440、1280、768、390：PASS；zero horizontal overflow，最小交互目标 44px。
- Light / Dark：PASS。
- Single H1、heading hierarchy、named regions、ordered Chapter list、focus-visible：PASS。
- Browser console errors：0。
- Web lint、typecheck、79 / 79 tests、production build：PASS。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs production builds PASS。
- `git diff --check`：PASS。

## 30. Step02 Decision

- Product implementation changed：YES；仅 Work Detail route-local UI / CSS 与该页面专用 Continue Reading presentation。
- Data、Auth、Permission、Published-only、Gateway、Service、Repository、query contract changed：NO。
- P0：0。
- P1：0。
- Remaining product P2：0。
- Non-blocking QA Fixture enhancement：WD-QA-001。
- Work Detail Layout Ready for Step03：YES。
- UX-06G Step03：未授权、未开始。

完成 Step02 后停止，等待 Product Owner 验收。

## 31. UX-06G Step03 States & Responsive QA Record

UX-06G Step03 已基于 Step02 冻结布局完成集中复验。本轮没有发现需要授权范围内代码修补的问题，产品实现保持 Step02 baseline 不变。

复验结构：

`Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery`

结果：

- Work Orientation：single H1、作品身份锚点、辅助 Published context、page-local Studio action = 0、private identity leak = 0，PASS。
- Story Premise：summary 为阅读判断核心；空 summary 使用现有诚实 fallback；当前 Fixture 无空 summary runtime case，source contract PASS。
- Author / Published Context：公开作者入口、现有 publishedAt / updatedAt、44px target、Author Profile 路径，PASS。
- Reading Decision：Start、Continue、Download 真实入口与主次，PASS。
- Chapter Overview：semantic ordered list、Published Chapters only、44px entries、Reading route，PASS。
- Recovery：Archive、Search、Reader Library 真实点击路径，PASS。
- No Published Chapters：无效 Start / Download 不出现，说明与三条 recovery 均通过。
- Loading：route-local Work-shaped skeleton、`aria-busy`、single status owner 与六段几何 source contract PASS；暖 / 冷本地导航完成速度快于观察窗口，没有破坏依赖或伪造数据延长状态。
- Error：page-level single `role="alert"`、Retry、Archive / Search recovery 与克制文案 source contract PASS；未破坏依赖制造错误。
- Not Found：unknown、Draft Work 与 Draft Chapter 使用一致、不泄露的 Work-specific presentation，PASS。

## 32. Step03 Role and Boundary Verification

- Guest：继续进入 `/auth/sign-in`；不保留 Work return parameter，现有 Auth / Permission / login return 合同未改变。
- Reader：Work Detail、Start、Continue、Download、Author 与 recovery paths PASS。
- Author：Published Work Detail 与 Reading entry PASS；page-local Studio action = 0，private identity leak = 0。
- Published-only：long-form Work 只显示 3 个 Published Chapters。
- Draft Work：Not Found，资源存在性不泄露。
- Draft Chapter：Not Found；`sealed-draft` 不出现在正文、Chapter Overview、Start 或 Continue 可用列表。
- Work Detail data、Gateway、Service、Repository、query、Auth、Permission、Reading 与 Reading History data logic：未修改。

`reading-history-client.tsx` 边界复核：Step02 diff 仅调整 `ContinueReadingForWork` 的 class、Reader-facing eyebrow、H3 层级和 44px action presentation；`ReadingHistoryTracker`、localStorage access、record / read / write、storage event、latest Chapter lookup、available slug validation 与 href selection 均未改变。Reading 页面真实进入 PASS。

## 33. Step03 Responsive, Theme and Accessibility QA

| Viewport   | Document / client width | Main width  | Work shell width | Horizontal overflow | Minimum key target |
| ---------- | ----------------------- | ----------- | ---------------- | ------------------- | ------------------ |
| 1440 × 900 | 1440 / 1440             | 1216 / 1216 | 1152 / 1152      | 0                   | 44px               |
| 1280 × 800 | 1280 / 1280             | 1216 / 1216 | 1152 / 1152      | 0                   | 44px               |
| 768 × 1024 | 768 / 768               | 720 / 720   | 720 / 720        | 0                   | 44px               |
| 390 × 844  | 390 / 390               | 358 / 358   | 358 / 358        | 0                   | 44px               |

- Light：PASS。
- Dark：PASS；390px visual QA 与 zero overflow 通过。
- Title / summary / Chapter entry：当前 Fixture zero overflow；route-local `overflow-wrap: anywhere` 保护仍成立。
- Single H1、合理 H2 / H3、named regions、semantic `ol`、可理解 link / button labels：PASS。
- `focus-visible` route-local selectors 存在；真实主题键盘焦点 ring 在 Dark Mode 可见。
- Browser console errors：0。

## 34. WD Finding Status After Step03

- WD-AUDIT-001：Accepted / Frozen；Auth / Permission / Guest login boundary，不阻塞 Step04。
- WD-AUDIT-009：Accepted / Frozen；metadata-light data contract，不阻塞 Step04。
- WD-AUDIT-010：PASS；长内容 wrap protection 与四档 zero-overflow 复核成立。
- WD-QA-001：Retained / Non-blocking；Fixture 仍无极端长 Work title、summary、author、tag、Chapter title。当前保护有效，不构成 Step03 或 Step04 阻塞。
- Step02 remaining product issue：0。
- P0：0。
- P1：0。

## 35. Step03 Validation and Decision

- `pnpm qa:fixture`：PASS；localhost only。
- `pnpm qa:credentials --check`：PASS；未输出具体密码。
- Web lint、typecheck、79 / 79 tests、production build：PASS。
- `pnpm validate`：PASS；167 / 167 workspace tests，Web / Admin / Docs builds PASS。
- `git diff --check`：PASS。
- Step03 product implementation changed：NO。
- Step03 documentation changed：YES。
- Functional / data-contract expansion：NO。
- Work Detail Ready for Step04：YES。
- UX-06G Step04：未授权、未开始。

完成 Step03 后停止，等待 Product Owner 验收。

## 36. UX-06G Step04 Release Acceptance

UX-06G Step04 已基于 Step01–Step03 冻结成果完成 Work Detail Track 最终 Release Acceptance：

- Step01 Work Detail UI Audit & Design Contract：PASS。
- Step02 Work Detail Layout Upgrade：PASS。
- Step03 Work Detail States & Responsive QA：PASS。
- Step04 Work Detail Release Acceptance：Completed / Awaiting Product Owner Final Review。

最终定位：**Literary Work Decision Space**。

最终结构：

`Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery`

最终复核：

- Default、Guest gate、Reader、Author、Published Work、No Published Chapters、Loading、Error contract、Not Found、Long content、Mobile：PASS。
- Start、Continue、Download、first Chapter、Work Detail → Reading 与 Reading 页面：PASS。
- Archive / Search / Author Profile → Work Detail、Work Detail → Author Profile、Archive / Search / Reader Library recovery：PASS。
- Published-only、Draft Work isolation、Draft Chapter isolation、page-local Studio action = 0、private identity leak = 0：PASS。
- 1440 / 1280 / 768 / 390、Light / Dark、zero horizontal overflow、minimum 44px targets、semantics、focus、console 0：PASS。
- `reading-history-client.tsx` Step02 diff 仍仅限 Continue Reading presentation；history data structure、storage、read / write、sorting、selection、synchronization 与 Reading 未改变。

最终 Finding：

- WD-AUDIT-001：Accepted / Frozen；不阻塞 Release。
- WD-AUDIT-009：Accepted / Frozen；不阻塞 Release。
- WD-AUDIT-010：PASS。
- WD-QA-001：Retained / Non-blocking QA Fixture enhancement；不阻塞 Release。
- Step02 remaining product issues：0。
- P0：0。
- P1：0。

Step04 未修改产品实现、数据层、Auth、Permission、Published-only、Reading、Reading History、Gateway、Service、Repository、query contract、Database、Supabase、RLS、RPC、Migration、dependency 或 deployment configuration。

验证：Web lint、typecheck、79 / 79 tests、production build、完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs builds 与 `git diff --check` 全部 PASS。

Work Detail Ready for Release：**YES**。

等待 Product Owner 最终验收；不得继续优化 Work Detail、启动 UX-06H 或其他 UX Track。
