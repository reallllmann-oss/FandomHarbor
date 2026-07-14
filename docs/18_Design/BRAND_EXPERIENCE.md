# Fandom Harbor Brand Experience

Status: Proposed for UX-01 Brand Experience Foundation
Scope: Brand Direction only; not an implementation specification

## 1. Purpose

本文定义 Fandom Harbor V1 从“功能闭环平台”进入“有独立品牌体验的文学阅读产品”时的品牌体验基础。

本文件只回答品牌方向、用户情绪和设计哲学，不锁定字体、颜色、组件、页面结构或 Design Token。后续 UX-02 到 UX-06 必须引用本文件，但具体实现仍需在对应阶段完成信息架构、原型、视觉系统和前端实现决策。

## 2. Product Context

Fandom Harbor 当前定位已经明确：

- 私域、邀请制、可信任的原创 / 同人作品归档站。
- 保留 AO3 的归档精神、元数据表达、标签治理、分级预警、评论、Kudos、收藏与推荐等阅读相关能力。
- 不做论坛、博客、社交平台、动态流、粉丝系统或公开竞争排行榜。
- 当前 V1 Beta 功能闭环为 Reader → Author → Studio → Publish → Reading。
- 后续 UX 阶段的核心任务，是让这个闭环从“能用”走向“愿意长期阅读、发布和维护”。

## 3. Brand Positioning

Fandom Harbor 是一个安静、可信、可治理的私域文学港湾：它为长篇作品、同人创作和私密社群提供稳定归档、舒适阅读和克制互动。

它不是流量型内容平台，而是作品的长期居所。它的价值来自阅读舒适度、归档完整性、作者控制感、身份边界和站主治理能力。

### Why

当前产品最强的差异化不是“发布文章”，而是邀请制门禁、丰富元数据、阅读优先、作者笔名隔离、Admin 治理与权限安全的组合。品牌定位必须把这些能力合成一个清晰感受：这里像一个被认真照看的私人图书馆，而不是一个内容流。

### Impact

所有页面都应优先传达可信、克制、文学性和可归档性。视觉上避免廉价社区感、营销工具感、游戏化激励感和普通 SaaS 后台感。

### Future Usage

用于 Landing、Archive、Search、Work Detail、Chapter Reading、Author Profile、Studio 和 Admin 的体验判断。任何新页面若强化社交热度、公开排名或强刺激留存，都应回到本定位重新评审。

## 4. Brand Personality

| Personality | Definition                         | Why                                 | Impact                                           | Future Usage                           |
| ----------- | ---------------------------------- | ----------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Calm        | 安静、不催促、不制造焦虑           | 长文阅读需要低干扰环境              | 降低视觉噪音，避免过度提醒和连续弹窗             | Reading、Archive、Search、Bookmark     |
| Literary    | 尊重文本、作者和作品语境           | 产品核心是作品归档，不是内容消费流  | 标题、摘要、章节、警告和元数据有清晰阅读节奏     | Work Detail、Chapter、Author Profile   |
| Trustworthy | 权限、身份和警告信息可理解         | 私域站点依赖信任和边界              | 权限状态、预警、错误和审核语言应明确而不恐吓     | Auth、Warnings、Moderation、Admin      |
| Curated     | 信息经过整理，但不抹平作者表达     | 标签治理要与自由标签共存            | 标签、筛选、列表和推荐应支持探索而不强行排序     | Archive、Search、Tags、Recommendations |
| Intimate    | 面向受邀社群，不追求广场感         | 邀请制和身份隔离是产品根基          | 体验应像进入一个受保护的阅读空间                 | Gate、Reader Home、Library             |
| Editorial   | 像编辑过的文学目录，而不是商品货架 | V1 需要从功能平台转为品牌化阅读产品 | 内容展示重标题、摘要、元数据和节奏，而非按钮密度 | Archive、Landing、Work Cards           |

## 5. Emotional Keywords

Primary emotional keywords:

- 安心
- 安静
- 被邀请
- 可停留
- 有秩序
- 有文学感
- 可信任
- 适合长读

Secondary emotional keywords:

- 精致
- 私密
- 可发现
- 可回访
- 作者被尊重
- 标签有方向
- 管理有边界

Rejected emotional directions:

- 热闹
- 刺激
- 竞技
- 上瘾
- 广场化
- 营销化
- 平台增长感
- 泛社区感

## 6. User Emotion Target

### Reader

Reader 应感到“我可以慢慢找，也可以安心读完”。阅读前，Reader 能快速判断作品是否适合自己；阅读中，界面退到文本之后；阅读后，回访、书签和历史不会变成公开压力。

### Author

Author 应感到“我的作品被认真保存，我的身份边界被尊重”。Studio 不应像营销后台，而应像一个清晰的创作和归档工作台。

### Admin / Super Admin

Admin 应感到“我能治理，但不会误伤”。后台品牌体验不追求文学装饰，而追求清楚、审慎、可追溯和低误操作。

### Visitor

Visitor 应感到“这里是一个需要被邀请进入的归档空间”。门禁体验应说明规则和价值，不应像普通注册增长漏斗。

## 7. Experience Statement

Fandom Harbor should feel like entering a private literary harbor: quiet enough for deep reading, structured enough for serious discovery, and trustworthy enough for authors and owners to preserve works over time.

中文体验陈述：

Fandom Harbor 应像一个安静、被妥善维护的私域文学港湾：读者可以安心进入作品，作者可以稳妥保存创作，站主可以清楚治理边界，而所有互动都服务于阅读和归档本身。

## 8. Design Philosophy

### 8.1 Reading Before Interface

界面服务文本，不抢文本。阅读页的视觉优先级必须是标题、作者、分级 / 预警、章节语境和正文。

Why: Fandom Harbor 的核心成功指标不是点击量，而是读者能舒适完成长文阅读。
Impact: 减少装饰、降低侧栏和统计干扰、让正文拥有稳定宽度与节奏。
Future Usage: Chapter Reading、Article Reading、Work Detail、Reader Preferences。

### 8.2 Archive Before Feed

内容展示应像可检索归档，而不是无限信息流。排序、筛选和标签用于发现，不用于制造热度竞争。

Why: 产品明确禁止社交 feed、公开排行榜和 engagement manipulation。
Impact: Work Card 不把 Kudos、评论、推荐数放在主视觉；Archive 强调元数据和筛选清晰度。
Future Usage: Archive、Search、Tag Browse、Recommendations。

### 8.3 Privacy Before Virality

私域、邀请、阅读历史和身份隔离要被体验层尊重。用户不应被推动公开自己的阅读或创作关系。

Why: 私域信任是 Fandom Harbor 区别于公开平台的根基。
Impact: 回访、历史、书架和推荐表达保持克制，避免公开社交压力。
Future Usage: Reader Library、Bookmark、History、Author Pen Name、Invitation。

### 8.4 Editorial Calm Before Decoration

品牌感来自排版、节奏、留白、语气和内容秩序，而不是大量插画、渐变或装饰元素。

Why: 文学产品需要耐读，过强装饰会削弱文本和警告信息。
Impact: 视觉方向更接近高级编辑体验，而非社区皮肤或营销首页。
Future Usage: Landing、Archive、Work Detail、Author Profile、Design System。

### 8.5 Governable Freedom

作者可以表达复杂标签和作品语境，系统必须帮助读者理解与筛选，而不是强行压缩成平台模板。

Why: 同人和原创归档需要丰富元数据；管理员规范化不能抹掉作者意图。
Impact: 标签类型、警告、关系和分类要有清晰层级，但不使用杂乱彩虹色区分。
Future Usage: Tags、Search Filters、Work Metadata、Admin Tag Governance。

## 9. Direction Boundaries

### Brand Direction

- Fandom Harbor 是私域文学归档和阅读产品。
- 品牌气质是安静、可信、文学、克制、可治理。
- 体验应支持长读、发现、回访、创作和治理。

### UX Principle

- Reader first.
- Archive before feed.
- Minimal interruption.
- Metadata should clarify, not overwhelm.
- Premium editorial experience without luxury-commerce mimicry.

### Implementation Decision

本文件不决定：

- 具体字体家族。
- 具体色值。
- 具体组件形态。
- 具体页面布局。
- 具体动画曲线。
- 具体 Token 命名或 Tailwind 类。

以上内容应由 UX-03、UX-04、UX-05、UX-06 在引用本文件的基础上分别完成。

## 10. Acceptance Notes

本文件可用于后续 UX Mission 的验收判断：

- 新设计是否仍以作品和阅读为中心。
- 新页面是否避免社交平台、论坛、博客或 SaaS 后台模板感。
- 新视觉是否表达私域、文学、可信和安静。
- 新交互是否保护邀请制、身份隔离和阅读隐私。
- 新展示是否把元数据作为发现工具，而不是热度竞争工具。
