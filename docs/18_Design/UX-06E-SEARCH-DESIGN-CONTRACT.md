# UX-06E Search UI Audit & Design Contract

Mission: UX-06E Search Track Design Contract
Status: PASS — Product Owner Accepted / Search Track Completed and Closed
Phase: Implementation Polish
Date: 2026-07-13
Implementation Changes: Step02 route-local Search presentation only

## 1. Mission Boundary

本 Mission 只审计当前 `/search` 实现，并建立后续受控视觉与交互升级合同。

本 Mission 不修改：

- Product code、React structure、CSS、Component 或 route。
- Database、Supabase、RLS、RPC、Migration。
- Auth、Permission、Published-only rule 或 Draft isolation。
- Search Service、Gateway、Repository、RPC 或查询合同。
- Search fields、matching、limit、ordering 或 URL behavior。
- Archive、Reading、Author Profile、Studio。
- Dependency、runtime 或 production deployment configuration。

如后续实现需要扩张数据合同、修改搜索字段、匹配方式、结果上限、排序、分页或权限边界，必须停止并申请独立授权；不得把该变化并入 UX-06E Step02。

## 2. Search Product Position

Search 是 Fandom Harbor 的 **主动查询入口**。

Search 必须承担：

- Reader 使用明确关键词寻找 Published Work 或公开 Author。
- 为已知标题、作品 Slug、公开作者名称或作者 Slug 提供可分享、可恢复的查询路径。
- 在 Work 与 Author 两类公开结果之间建立清楚的信息分区。
- 从查询结果通向 Work Detail 或 Author Profile。
- 作为 Archive 浏览发现路径的互补入口。

Search 不承担：

- Archive 的连续浏览、排序控制或分页职责。
- Studio 的创建、编辑、发布或管理职责。
- Reading 的章节导航、阅读设置或沉浸长读职责。
- 推荐、热门词、个性化、排名、Feed 或 Marketplace 逻辑。
- 分类筛选、标签筛选或高级筛选。
- Draft、private owner identity、registration identity 或非公开内容展示。

Published-only 是既有数据与权限合同，不是视觉开关。任何 Search UI 升级都不得改变、绕过或重复实现该合同。

## 3. Current Implementation Audit

### 3.1 Route and Query

- Route：`/search`。
- Rendering：`force-dynamic`。
- URL：GET form，正式参数为 `q`。
- Query normalization：NFKC、首尾空白清理、连续空白合并。
- Maximum length：80 characters。
- Invalid query：超过 80 字符或包含控制字符时显示 inline alert，不调用查询。
- Gateway：`createPublicSearchGateway()` → Public Search Service → Supabase Search Repository。
- Result cap：Work 最多 20 条，Author 最多 20 条；当前无结果分页。
- Work matching：Published Work title / slug 的大小写不敏感包含匹配。
- Author matching：具备有效公开作者身份且至少有一部 Published Work 的 display name / slug 包含匹配。
- Current ordering：Work 按 `published_at desc, id`；Author 按 `display_name, slug`。
- Published-only：既有 Search RPC 只返回 `works.status = published`，Draft 不进入结果。

以上属于现有查询合同记录，不代表 UX-06E 获得修改数据层或搜索逻辑的授权。

### 3.2 Current Page Regions

当前页面顺序：

1. Search orientation card。
2. Query input / submit form。
3. Query validation message。
4. Initial、Empty 或 Results state。
5. Combined result count。
6. Published Work results section。
7. Author results section。

Loading 与 Error 使用全页 `StatusPage`，未保留 Search input 与结果分区形态。

### 3.3 Current Search Input

- 使用语义 `<form role="search">` 与 GET submission。
- Input 类型为 `search`，名称为 `q`，已有值在页面返回时保留。
- 输入具有 screen-reader label、placeholder、`maxLength=80` 与 `autocomplete=off`。
- Desktop 输入约 495 × 44px，提交按钮约 80 × 44px。
- 390px 输入与按钮均约 308 × 44px，垂直堆叠。
- 当前可见界面没有持续显示的 field label；可见提示主要依赖 placeholder 与上方说明。

### 3.4 Current Work Result

当前 Work Result 展示：

1. Work title → Work Detail。
2. Public Author → Author Profile。
3. Three-line summary。
4. Raw Work slug。

现有 `SearchWorkResult` 还真实提供 `publishedAt`，但当前 UI 未展示。当前页面不展示 rating、warnings、category、language、completion、tags 或 statistics；本 Mission 禁止新增这些字段。

### 3.5 Current Author Result

当前 Author Result 展示：

1. Public display name → Author Profile。
2. Public bio 或缺省说明。
3. Published Work count。
4. Raw Author slug。

Author 结果只包含具有有效公开作者身份且至少有 Published Work 的作者，不承担全站用户目录职责。

### 3.6 Current States

- Initial：提示从明确关键词开始，并说明不保存历史、不提供推荐或热门词。
- Empty：说明没有公开结果，并明确 Draft / unpublished 不会出现。
- Loading：全页 `StatusPage`，说明正在检查公开作品与作者资料。
- Error：assertive alert，提供 Retry 与清空查询后重新搜索。
- Invalid：输入区下方 inline `role="alert"`。
- Results：combined result count 使用 `role="status"`；Work 与 Author 分区按实际存在情况显示。

### 3.7 Current Responsive and Browser Evidence

- Desktop 1280 × 720：zero horizontal overflow；input / submit 均为 44px 高。
- 390 × 844：zero horizontal overflow；main client / scroll width 均为 358px；input / submit 均为 308 × 44px。
- 390px 同时存在 Work 与 Author 结果时保持单列，Work card 约 308px 宽，Author card 约 308px 宽。
- Work title 在长标题移动端样本中约 50px 高；同卡 Author inline link 约 17px 高。
- 独立 Author result title link 约 22px 高。
- Browser console errors：0。
- 本地无效旧 cookie 产生 Supabase SSR warning，但未形成 Search 页面 error；该环境噪声不归入 UX-06E 产品实现修复。

### 3.8 Basic QA Evidence

- `/search` 默认进入：PASS。
- `?q=长篇` Work query：PASS，返回 1 个公开 Work。
- `?q=Mission3AAuthor0702A` Author query：PASS，返回公开 Author。
- `?q=Harbor` 无结果：PASS。
- Work Result entry：PASS，进入既有 Work Detail route。
- Author Result entry：PASS，进入既有 Author Profile route。
- Published-only：PASS，结果文案与既有 RPC / tests 均确认只读取 Published Work。
- Draft isolation：PASS，`Hidden Draft Work` 查询返回无公开结果；Migration contract 继续要求 `w.status = 'published'`。
- 390 × 844：PASS，zero overflow，输入与提交 44px。
- Browser console errors：0。

Loading 与 Error 本轮通过 route component、语义与恢复路径审查；没有通过修改数据源、制造 RPC 故障或写入数据库来人为触发状态。

## 4. Page Goal

Search 的页面目标是：让 Reader 用一个明确关键词，快速确认是否存在相关 Published Work 或公开 Author，并进入对应的故事判断或创作者身份页面。

成功标准：

- Reader 一眼理解这里是主动查询，不是 Archive 浏览或推荐入口。
- 查询输入是页面最高优先级操作，标签、边界和提交反馈清楚。
- Work 与 Author 结果不混成同质卡片流。
- Work Detail 是作品结果的主要下一步；Author Profile 是作者结果的主要下一步。
- Empty、Loading、Error 与 invalid query 都诚实说明状态，并提供低压力恢复路径。
- Published-only 与 Draft isolation 在任何视觉状态中保持成立。

## 5. Information Priority

### Primary

1. 当前 query 与搜索输入。
2. Work title / Author public display name。
3. Work Detail / Author Profile 的明确入口。
4. Work summary 或 Author bio。

### Secondary

1. Work 的 public author attribution。
2. Work publish context（仅使用当前真实 `publishedAt`）。
3. Author 的 Published Work count。
4. Work / Author 结果分区与各自语义。

### Supporting

1. Combined result count。
2. Slug matching cue。
3. Published-only explanation。
4. Query length / invalid input guidance。

Raw slug 不应成为视觉主信息；它可以支持已知标识查询，但不得压过文学标题、公开作者身份与内容线索。

## 6. Page Regions Contract

### A. Search Orientation

- 一个 H1。
- 用简短语言说明主动查询目标与 Published-only 边界。
- 不使用 `MVP`、内部工程阶段或数据库 vocabulary。
- 不转化为 marketing hero、推荐入口或高级搜索控制台。

### B. Query Input

- 是页面 Primary interaction。
- 保留 GET、`q`、URL synchronization、query retention 与现有提交行为。
- 提供持续可见、语义关联的简洁 label；placeholder 只作示例，不独自承担字段说明。
- Desktop 可横向排列；Mobile 垂直堆叠并保持 full-width。
- Input 与 submit 至少 44px 高，focus-visible 清楚。

### C. Query Context

- 成功查询后确认当前 query 与总结果数量。
- Invalid state 紧邻输入，使用可理解语言，不暴露 Service / RPC。
- 不增加搜索历史、热门词、自动补全、推荐词或 analytics。

### D. Work Results

- 使用独立 labeled section 与语义 list。
- Title 是 Primary entry；summary 是故事判断线索；public author 是身份上下文。
- 可使用当前已存在的 `publishedAt` 作为克制的 publish context。
- Slug 只作 supporting cue，不表现为库存编号或工程记录。
- 不新增 metadata、排序控件、filter、pagination 或 infinite scroll。

### E. Author Results

- 使用独立 labeled section 与语义 list。
- Public display name 是 Primary entry；bio 是身份线索；Published Work count 是 supporting context。
- Author result 不得模拟社交 Profile card、关注热度、粉丝排名或 Marketplace seller。
- 不展示 private account identity、owner ID 或注册身份。

### F. Recovery Space

- Empty 提供修改 query 的自然路径，并可增加低压力 Archive browse link。
- Error 保留 Retry 与返回空 Search 的路径。
- 恢复入口不得引入推荐、自动扩展 query 或新的数据请求合同。

## 7. Search Input Contract

- 正式 query parameter 继续为 `q`。
- 保留 server-driven GET submission；Step02 不改为即时搜索或 client-side debounce。
- 保留 NFKC、空白 normalization、80-character maximum 与 control-character rejection。
- 保留当前输入值，使 Reader 能直接修正关键词。
- 可见 label、placeholder、helper copy 不重复堆叠。
- Submit 文案清楚，pending / loading 不伪造结果。
- 不新增 category、tag、rating、language、author-only、work-only 或 advanced controls。
- 不保存 query history，不建立 personalization。

## 8. Query Results Contract

- Work 与 Author 必须分区，不合并为 ranking feed。
- 保留当前既有 result cap、matching 与 ordering；Step02 无权修改。
- Combined count 只说明当前返回结果，不表达全站热度或相关性分数。
- 若一类结果为零，另一类仍可独立展示；不得用空容器占位。
- 不增加 relevance score、highlight engine、sorting UI、pagination、infinite scroll 或 recommendations。
- 结果中只呈现既有公开合同真实提供的字段。

## 9. Work Result Information Hierarchy

建议阅读顺序：

1. Work title。
2. Summary / story cue。
3. Public author attribution。
4. Publish context。
5. Slug cue（仅在保持 supporting hierarchy 时）。

规则：

- Title link 必须清楚、可聚焦，并具备至少 44px 可操作区域。
- Summary 不应因 muted styling 退化为系统说明。
- Author link 不比 title 更强，但必须具备可用 touch target。
- 当前真实 `publishedAt` 可在 Step02 使用；不得新增字段。
- 不展示 Draft state、Studio actions、rank、engagement 或 popularity。

## 10. Author Result Information Hierarchy

建议阅读顺序：

1. Public display name。
2. Public bio / identity cue。
3. Published Work count。
4. Slug cue（supporting）。

规则：

- Display name / Profile entry 必须具备至少 44px 可操作区域。
- Bio 为空时使用安静、非错误式缺省文案。
- Published Work count 只表达公开作品规模，不变成热度或排名。
- 不增加 follow、activity、fan metrics、private identity 或 Studio entry。

## 11. Empty State Contract

- 标题明确“没有找到公开结果”。
- 说明 Reader 可以修正 title / author / slug query。
- 明确 Draft 与 unpublished 不进入结果，避免误解为权限错误。
- 保持输入中的原 query，支持直接修改。
- Step02 可增加 Archive browse link，帮助从主动查询切换到公共浏览。
- 不提供推荐作品、热门作者、相似词或自动扩大匹配。

## 12. Loading State Contract

- 说明正在查询 Published Work 与公开 Author。
- 尽量保留 Search orientation、query input context 与结果区几何，降低全页状态切换。
- 不伪造 Work / Author 内容，不展示无法确定的结果数量。
- 使用 `aria-busy` / live status 时避免重复播报。
- 不改变 Search data fetch 或新增 client loading architecture。

## 13. Error State Contract

- Error 与 Empty 必须清楚区分。
- 保留 Retry 与清空后重新搜索两条恢复路径。
- 不暴露 Database、Supabase、RPC、Repository 或 stack details。
- 只使用一个明确 assertive announcement owner，避免 nested live region 重复播报。
- 不自动把失败 query 替换成推荐 query。

## 14. Mobile Contract

- 390px zero horizontal overflow 是最低基线。
- Orientation → Query → Context / State → Work Results → Author Results 顺序稳定。
- Input、submit、Work title entry、Author entry 至少 44px。
- Query、长 Work title、Author name、bio、summary 与 slug 自然换行。
- Desktop 多列结果在 Mobile 变为自然单列，不压缩为窄 tile。
- 不依赖 hover，不隐藏关键结果身份。
- 继续遵守已冻结的 Mobile Header 简化规则；不得在 Search Track 重写全站 Header。

## 15. Cross-Page Boundaries

### Archive

Search 是主动 query；Archive 是 `Curated Story Discovery Space`，承担 Published Work 浏览、正式排序与分页。Search 不复制 Archive sort / pagination，Archive 不复制 Search input / query logic。

### Reading

Search 只帮助定位作品或作者；Reading 是 `Private Literary Reading Space`。Search 不展示章节正文、阅读设置、bookmark、history 或章节导航。

### Author Profile

Search 只提供 public identity result 与前往 Profile 的入口。Author Profile 承担 creator identity、bio 与 Published Works 聚合；Search 不变成 Author directory 或社交 Profile feed。

### Studio

Studio 是 owner-scoped creator workspace。Search 不展示 Draft、edit、manage、publish、analytics、owner identity 或 private account data。

## 16. Audit Findings

### SE-AUDIT-001 — Internal MVP and Slug Language Weakens Product Voice

Severity: P2 content / visual identity。

`Search MVP`、`Published Works` 与 raw `Slug` 在页面中重复出现，使公共查询入口接近工程验收界面。Step02 可在不改变查询字段和 URL 合同的前提下，统一为 Reader-facing 的中文主动查询语气，并将 slug 降为 supporting cue。

### SE-AUDIT-002 — Search Uses Generic Stacked Cards

Severity: P2 visual hierarchy。

Orientation、Initial / Empty、Work Results 与 Author Results 都复用大面积 `reading-card`，内部结果再嵌套相同 border card。页面结构清楚，但接近通用信息面板，尚未形成 Fandom Harbor 的安静主动查询节奏。

### SE-AUDIT-003 — Result Information Hierarchy Is Metadata-led

Severity: P2 information hierarchy。

Work summary、Author bio 与 attribution 使用相近 muted styling，raw slug 始终出现；`publishedAt` 已在现有 Work contract 中却未使用。当前层级更像诊断结果记录，而不是从 query 到 story / creator 的判断路径。

### SE-AUDIT-004 — Result Entry Touch Targets Are Inconsistent

Severity: P2 accessibility / mobile。

390px 实测中，Work 长标题 link 可达约 50px，但 Work card 内 Author link 约 17px，独立 Author result title link 约 22px。输入与 submit 已为 44px；Step02 应在 route-local presentation 中把主要 Work / Author entry 补足至至少 44px，不改变 href 或行为。

### SE-AUDIT-005 — Visible Input Label Is Missing

Severity: P2 accessibility / clarity。

Search input 有正确 screen-reader label，但视觉用户主要依赖 placeholder 与上方段落判断字段用途。Step02 可增加持续可见的简洁 label，并避免与 orientation copy 重复。

### SE-AUDIT-006 — Empty State Has No Browse Recovery

Severity: P2 recovery。

Empty copy 诚实说明 Published-only，但只有保留输入以便修改，没有从主动查询切换到 Archive 浏览发现的明确入口。Step02 可增加既有 `/archive` 的低压力链接，不新增推荐或搜索逻辑。

### SE-AUDIT-007 — Loading Does Not Preserve Search Shape

Severity: P2 visual stability。

全页 `StatusPage` 清楚，但查询提交后 Search input、query context 与结果分区全部暂时消失。Step02 可建立 route-local、低噪声的 Search loading composition；不得伪造结果或改变数据获取。

### SE-AUDIT-008 — Error Announcement Ownership Can Be Simplified

Severity: P2 accessibility semantics。

Error 外层同时使用 `aria-live="assertive"` 与 `role="alert"`，内部再渲染完整 StatusPage。当前恢复动作完整，但 Step02 应明确唯一 assertive announcement owner，避免辅助技术重复播报。

## 17. Existing Strengths to Preserve

- GET-based shareable `q` URL。
- Query retention、normalization、80-character boundary 与 inline validation。
- Published-only 与 Draft isolation。
- Public author identity separation。
- Work / Author 独立语义 sections 与 lists。
- Initial、Empty、Loading、Error、Invalid 与 Results states。
- Honest “no history / no recommendations / no popular terms” boundary。
- Work Detail 与 Author Profile 路径。
- Search form accessible name、heading hierarchy 与 result live status。
- Desktop / 390px zero overflow。
- 44px input / submit controls。
- No filters、ranking、feed、Marketplace、Studio actions 或 private identity leak。

## 18. UX-06E Step02 Recommended Scope

Step02 可执行范围建议：

1. 建立 route-local Search shell / presentation classes，不改 Gateway、Service、Repository、RPC 或 data flow。
2. 重构视觉分区：Orientation → Primary Query → Query Context → Work Results → Author Results → Recovery。
3. 移除 `Search MVP` 等内部阶段语言，统一 Reader-facing 中文语气；保留搜索字段和 Slug 匹配能力。
4. 为 Search input 增加可见 label，保留 GET、`q`、80-character、normalization 与 query retention。
5. 使用现有 Work / Author 字段优化标题、summary / bio、public author、published date、count 与 slug 的信息层级。
6. 区分 Work 与 Author 的编辑式 result treatment，降低 generic nested-card feeling。
7. 将 Work / Author primary entries 补足为至少 44px，强化 focus-visible，不改变 href。
8. 为 Empty 增加 Archive recovery；为 Loading 保留 Search shape；简化 Error live announcement ownership。
9. 验证 1440 / 1280 / 768 / 390、Light / Dark、keyboard、focus、heading、landmark、touch targets、long query / title / author / slug 与 zero overflow。
10. 回归 Archive、Work Detail、Author Profile、Reading、Studio、Published-only 与 Draft isolation。

Step02 不得：

- 新增字段、filters、autocomplete、fuzzy / full-text search、highlight、recommendation、ranking、history、analytics 或 Feed。
- 修改 query matching、result cap、ordering、pagination 或 Search URL contract。
- 修改 Database、Supabase、RLS、RPC、Migration、Gateway、Service、Repository 或 Permission。
- 修改 Archive、Reading、Author Profile、Studio 或全站 Header 实现。
- 引入 dependency、全站 Design System replacement 或 production configuration change。

## 19. Validation Result

- `pnpm validate`：PASS。
- Format check：PASS。
- Workspace lint：PASS。
- Workspace TypeScript：PASS。
- Workspace tests：PASS，167 tests；Web 79 / 79。
- Web / Admin / Docs production builds：PASS。
- Search Desktop / 390 Mobile Browser QA：PASS。
- Browser console errors：0。
- Product implementation changes：NONE。
- Database / Supabase / RLS / RPC / Migration execution or changes：NONE。

## 20. Step01 Decision

当前 Search 功能基线可继续作为 Step02 输入；没有必须先改代码或扩张数据合同才能建立受控 Layout Upgrade 的阻塞。

Search Ready for Step02: **YES**。

UX-06E Step01 完成后停止，等待 Product Owner 验收与 Step02 独立授权。

## 21. UX-06E Step02 Implementation Record

Product Owner 已授权并完成 UX-06E Step02 Search Layout Upgrade。实现严格位于 Step01 Design Contract 边界内：

- 建立 Orientation → Query → Query Context / State → Work Results → Author Results 的页面节奏。
- 增加 visible input label，保留 GET `q`、80-character、normalization 与 query retention。
- Work Result 使用既有 title、summary、public author 与 `publishedAt`；Author Result 使用既有 display name、bio 与 Published Work count。
- 移除内部 MVP、Published Works 与 raw Slug 的展示语言，不移除 slug matching capability。
- 为 Work / Author primary entries 建立 44px minimum target 与明确 focus-visible。
- 为 Initial / Empty 增加 Archive / Homepage recovery；Loading 保留 Search shape；Error 只保留一个 assertive announcement owner。
- 1440、1280、768、390、Light / Dark、Guest、Reader、Author、Published-only、Draft isolation 与 browser console regression 通过。

SE-AUDIT-001 至 SE-AUDIT-008 均在 Step02 授权范围内解决。没有新增 P0 / P1。

Step02 未修改 Database、Supabase schema、Migration、RLS、RPC、Permission、Search Gateway、Service、Repository、query fields、matching、ordering、result cap、pagination architecture、dependency 或 deployment configuration。

详细验收记录见 `UX-06E-STEP02_ACCEPTANCE.md`。UX-06E Step03 未授权、未开始。

## 22. UX-06E Step03 QA Record

Product Owner 通过独立 Mission 授权 UX-06E Step03，视为 Step02 已验收并成为冻结 QA 基线。

Step03 已复验：

- Initial、Valid Query、Empty、Invalid、Long Query、Loading、Error、Work Results 与 Author Results。
- 1440、1280、768、390 与 zero horizontal overflow。
- Light / Dark、keyboard focus、focus-visible、heading、named regions、label 与 44px targets。
- Guest、Reader、Author、Published-only、Draft Work isolation、Draft Chapter isolation、Work / Author entries。
- GET `q`、empty q、80 / 81-character boundary、NFKC / whitespace normalization 与 URL retention。

受控 Error QA 发现同 route client navigation 无法清除 Next.js segment error boundary。Step03 只在 `search/error.tsx` 将 `清空并重新搜索` 改为原生完整导航；修补后 `/search` 正确恢复 Initial State。

该修补不改变 Error 文案、data fetch、Gateway、Service、Repository、RPC、权限、query contract 或其他页面。`pnpm validate`、167 / 167 workspace tests 与全部 production builds 通过；P0 / P1 为 0，Search Ready for Step04 = YES。详细记录见 `UX-06E-STEP03_ACCEPTANCE.md`。

Product Owner 随后通过独立 Mission 授权 UX-06E Step04。

## 23. UX-06E Step04 Release Acceptance Record

Product Owner 通过独立 Mission 授权 UX-06E Step04，视为 Step03 已验收并成为最终 Release QA 基线。

Step04 最终复核并通过：

- `Active Story & Author Discovery` 产品定位与 Archive / Reading / Studio 边界。
- Orientation → Query → Query Context / State → Work Results → Author Results → Recovery 结构。
- Initial、Valid、Empty、Invalid、Long Query、Loading、Error、Work / Author Results、Mobile、Light / Dark。
- GET `q`、URL retention、empty q、80 / 81-character、NFKC / whitespace normalization、matching、ordering 与 result cap 冻结合同。
- Work Detail、Work Author、Author Profile、Archive / Homepage recovery、Error Retry / Clear entries。
- 1440、1280、768、390、44px、focus-visible、heading、regions、label 与 state semantics。
- Guest、Reader、Author、Published-only、Draft Work / Chapter isolation 与 clean-session console 0。

SE-AUDIT-001 至 SE-AUDIT-008 保持 Resolved；Step03 Error clear recovery 保持 Fixed / Closed。Step04 未发现新的 P0 / P1，未修改产品实现。

Web lint / typecheck / 79 tests / build、完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds 与 `git diff --check` 全部通过。Search Ready for Release = YES。

详细 Release 记录见 `UX-06E-STEP04_ACCEPTANCE.md`。不会自动开启新的 UX Track。

## 24. Product Owner Final Acceptance

Product Owner 于 2026-07-13 最终验收 UX-06E Search Track：

- Step01 Search UI Audit & Design Contract：PASS。
- Step02 Search Layout Upgrade：PASS。
- Step03 Search States & Responsive QA：PASS。
- Step04 Search Release Acceptance：PASS。
- P0 = 0，P1 = 0；所有 Search findings 已关闭；Search P2 / post-Beta risk = 0。
- Search Ready for Release = YES。

UX-06E Search Track 已完成并关闭。不得继续优化 Search，不得自动开启新的 UX Track；等待 Product Owner 提供下一条明确 Mission。
