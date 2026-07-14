# Fandom Harbor UX Principles

Status: Proposed for UX-01 Brand Experience Foundation
Scope: UX Principle layer; not page design or frontend implementation

## 1. Purpose

本文定义 Fandom Harbor V1 后续 UX Design、Figma Prototype 与 Frontend Implementation 必须遵守的体验原则。

这些原则建立在当前产品定位之上：私域、邀请制、作品归档、阅读优先、作者身份边界、可治理标签、权限安全和无社交漂移。

## 2. Principle Boundary

### Brand Direction

品牌方向回答“Fandom Harbor 应该给人什么感受”：安静、可信、文学、私域、可治理。

### UX Principle

UX 原则回答“用户使用时什么应该优先”：阅读、发现、回访、创作、治理和低干扰。

### Implementation Decision

实现决策回答“具体页面和组件如何做”：导航结构、组件布局、Token、交互状态、代码实现。本文不提前锁定这些内容。

## 3. Reader Experience Principles

### 3.1 Reader First Principle

作品和阅读连续性永远高于平台装饰、互动指标和运营展示。

Why: Fandom Harbor 的核心价值是让读者发现并舒适读完作品，而不是制造平台停留时长。
Impact: Reading 页面必须让正文、章节语境、警告和导航优先；互动入口保持下游。
Future Usage: Chapter Reading、Article Reading、Work Detail、Reader Library、Reader Preferences。

### 3.2 Content Hierarchy Principle

读者在进入作品前必须能清楚判断标题、作者、分级、预警、摘要、标签、状态和章节路径。

Why: 同人 / 原创归档依赖丰富元数据，读者需要在安全和偏好上做判断。
Impact: Work Card 和 Work Detail 不应只追求视觉简洁而隐藏关键元数据。
Future Usage: Archive、Search、Work Detail、Warning Gate、Tag Browse。

### 3.3 Emotional Reading Principle

阅读体验应支持安静、沉浸、可停留，而不是不断提醒用户互动。

Why: 长文阅读需要情绪连续性；过多按钮、统计和提示会破坏文本节奏。
Impact: Kudos、评论、收藏、推荐和分享类入口不成为阅读中视觉焦点。
Future Usage: Reading Toolbar、Chapter Footer、Post-reading Actions、Comments。

### 3.4 Minimal Interaction Principle

完成阅读、筛选和回访所需的交互应尽量少，状态应尽量明确。

Why: 读者常在移动端和长时间阅读中使用产品，额外操作会增加疲劳。
Impact: 搜索筛选、章节跳转、阅读偏好、书签和继续阅读应直接、可恢复。
Future Usage: Archive Filters、Search、Reader Shelf、Continue Reading、Chapter Navigation。

### 3.5 Premium Editorial Experience Principle

“高级感”来自清晰排版、留白、秩序和内容节奏，而不是奢侈品式装饰。

Why: Fandom Harbor 是文学归档，不是美妆电商或品牌橱窗。
Impact: 页面避免浮夸 hero、促销式卡片、过量阴影、装饰渐变和大面积无意义图片。
Future Usage: Landing、Archive、Work Detail、Author Profile、Figma Prototype。

## 4. Author Experience Principles

### 4.1 Author Control Principle

Author 应清楚知道作品当前状态、保存结果、发布边界和读者可见范围。

Why: 作品发布是高责任行为，尤其涉及草稿、已发布内容和未来版本历史。
Impact: Studio 不应提供模糊成功、虚假保存或不明确的发布状态。
Future Usage: Studio Dashboard、Work Editor、Publish Flow、Revision Flow。

### 4.2 Pen Name Separation Principle

作者的公开笔名体验必须与私有账号身份分离。

Why: 当前产品决策明确保护 private account identity 与 reader-facing pen name。
Impact: Author Profile、Work byline 和 Studio 身份提示都要避免暴露私有账号事实。
Future Usage: Author Profile、Work Detail、Studio Header、Admin Identity Review。

### 4.3 Archive Stewardship Principle

作者工作台应像归档管理和创作维护空间，而不是内容增长后台。

Why: Fandom Harbor 不追求粉丝运营和公开热度竞争。
Impact: Studio 信息层级优先作品状态、章节、元数据、保存和发布，而不是流量面板。
Future Usage: Studio IA、Work List、Draft Editor、Chapter Management。

### 4.4 Gentle Recovery Principle

写作和发布流程必须给出明确恢复路径。

Why: 长文创作和发布有高情绪成本，用户对丢失和误操作敏感。
Impact: 错误、离开、保存失败和 Not Found 状态需要稳定、明确、非技术化语言。
Future Usage: Editor Error、Save Status、Publish Confirmation、Revision Restore。

## 5. Navigation Principles

### 5.1 Archive Navigation Principle

导航结构应围绕进入、发现、阅读、回访、创作和治理，而不是围绕组织架构或技术边界。

Why: 用户不关心 apps/web、service gateway 或数据库状态；他们关心能否找到和读到作品。
Impact: Reader 导航不应暴露后台概念；Author Studio 与 Reader 空间要边界清楚但可回到阅读。
Future Usage: UX-02 Information Architecture、Global Navigation、Mobile Navigation。

### 5.2 Contextual Return Principle

用户应随时知道自己在哪里、可以回到哪里、下一步能做什么。

Why: Archive、Search、Work、Chapter、Studio 之间存在多入口路径。
Impact: Breadcrumb、back link、continue reading、empty/error recovery 需要一致。
Future Usage: Search Result → Work、Work → Chapter、Chapter → Work、Studio → Reader。

### 5.3 Permission-Aware Navigation Principle

导航应尊重权限边界，但不能把权限隐藏变成安全策略。

Why: UI 只提供体验，权限仍由服务端和 RLS 强制。
Impact: Reader 不看到 Admin/Studio 操作；权限拒绝不泄漏隐藏资源细节。
Future Usage: Auth Gate、Studio Guard、Admin Entry、Permission Denied Pages。

## 6. Content Discovery Principles

### 6.1 Metadata as Discovery Principle

标签、分级、预警、关系、语言、状态和更新时间是发现系统的核心，不是附属信息。

Why: AO3 式归档的价值来自可表达、可治理、可筛选的元数据。
Impact: 作品列表不能只显示标题和封面；筛选必须服务真实阅读判断。
Future Usage: Archive、Search、Filters、Tag Pages、Work Cards。

### 6.2 No Popularity Dominance Principle

统计信息可以帮助判断，但不能成为主排序和主视觉。

Why: 产品明确拒绝公开竞争排行榜和社交漂移。
Impact: Kudos、评论、收藏、推荐数不应压过标题、摘要、作者和标签。
Future Usage: Work Cards、Recommendations、Author Profile、Analytics Boundary。

### 6.3 Progressive Complexity Principle

复杂筛选和长标签组应逐步展开，而不是一次性压给读者。

Why: 私域归档需要复杂元数据，但移动端和新读者需要可进入的第一层。
Impact: 基础发现路径保持轻；高级筛选、长标签组和治理状态可按需展开。
Future Usage: Archive Filters、Search Filters、Tag Governance、Work Detail。

## 7. Interaction Principles

### 7.1 State Clarity Principle

每个关键操作都要清楚表达当前状态、结果和恢复路径。

Why: 保存、发布、书签、登录、邀请、权限拒绝和举报都涉及信任。
Impact: 不显示虚假成功；不让用户猜测操作是否完成。
Future Usage: Studio Save、Publish、Bookmark、Auth、Report Workflow。

### 7.2 Low-Pressure Interaction Principle

互动不应制造社交压力或公开竞争。

Why: 私域阅读社区应让用户自由阅读和回访，而不是被迫表态。
Impact: Kudos、评论、推荐、书签的视觉和语言都应克制。
Future Usage: Post-reading Actions、Comments、Recommendations、Reader Shelf。

### 7.3 Accessible by Default Principle

键盘、屏幕阅读器、对比度、缩放、减少动效和移动触控不是补充项，而是体验基础。

Why: 长文阅读和治理操作必须对不同设备、阅读习惯和能力状态可用。
Impact: 图标按钮有名称，状态不只靠颜色，动效可减少，触控目标足够。
Future Usage: All Reader, Author, Admin and Auth surfaces.

### 7.4 Calm Error Principle

错误信息应解释发生了什么、用户能做什么，并避免泄漏权限或系统细节。

Why: 私域产品的信任来自可理解的边界和恢复路径。
Impact: Not Found、Permission Denied、Storage Failure、Save Error 都使用稳定、非恐吓语言。
Future Usage: Global Error、Auth Error、Studio Error、Reader Shelf Storage Failure。

## 8. Cross-Surface Priorities

| Surface          | Primary UX Priority    | Secondary UX Priority | Avoid                  |
| ---------------- | ---------------------- | --------------------- | ---------------------- |
| Visitor / Gate   | 私域价值与进入规则清楚 | 品牌安静可信          | 增长漏斗感、公开社区感 |
| Archive / Search | 可发现、可比较、可恢复 | 元数据扫描效率        | feed 化、热度排序主导  |
| Work Detail      | 判断是否适合阅读       | 进入章节路径          | 警告隐藏、标签失序     |
| Chapter Reading  | 正文沉浸和章节连续     | 轻量回访与偏好        | 统计、装饰、强互动打断 |
| Reader Library   | 私有回访               | 书签和历史清晰        | 公开社交化             |
| Author Studio    | 作品控制和发布安全     | 创作维护效率          | 营销后台感、虚假保存   |
| Admin            | 审慎治理和可追溯       | 操作效率              | 装饰化、误操作风险     |

## 9. UX Acceptance Questions

后续设计评审应至少回答：

1. 这个页面是否让作品和阅读优先于平台本身？
2. 用户能否在移动端清楚理解当前位置和下一步？
3. 关键状态是否明确、可恢复、非技术化？
4. 元数据是否帮助发现，而不是制造噪音？
5. 互动是否仍附着于作品和阅读，没有演变成 feed？
6. 设计是否保护私域、邀请制、身份隔离和权限边界？
7. 是否把品牌方向、UX 原则和实现决策分清楚？

## 10. Non-Decisions

本文不决定：

- 导航最终信息架构。
- 页面 wireframe。
- Figma component。
- 具体 copy。
- token、CSS、Tailwind 或 shadcn/ui component 变更。
- 数据库、权限、API、Supabase 或业务逻辑。
