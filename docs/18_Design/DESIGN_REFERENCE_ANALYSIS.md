# Fandom Harbor Design Reference Analysis

Status: Proposed for UX-01 Brand Experience Foundation
Scope: Reference analysis for UX direction; not visual copying or implementation

## 1. Purpose

本文拆解 Apple、THREE Cosmetics、ABIB、ARgENTUM 和 Aesop 的设计语言，为 Fandom Harbor 后续品牌体验、视觉 DNA、信息架构和原型设计提供参考。

这些品牌不是 Fandom Harbor 的模板。Fandom Harbor 不做消费电子、电商、美妆或奢侈品体验。本分析只提取可迁移的体验原则：信息层级、页面节奏、留白策略、品牌表达方式、内容展示方式和用户情绪体验。

## 2. Reference Sources

Observed on 2026-07-11:

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [THREE Cosmetics official site](https://www.threecosmetics.com/en/)
- [ABIB official site](https://en.abib.com/)
- [ARgENTUM official site](https://argentum.com/)
- [Aesop official site](https://www.aesop.com/)

Note: ARgENTUM official site content was limited by maintenance state during this review. The ARgENTUM section is therefore treated as directional brand-reference analysis and should be revalidated before any visual lock in UX-03 or UX-04.

## 3. Evaluation Dimensions

每个参考对象按以下维度分析：

- Brand Feeling
- Layout System
- Typography
- Color Usage
- Content Presentation
- Applicable Learning

每个 Applicable Learning 都区分 Why、Impact 和 Future Usage，避免把参考品牌直接复制为实现方案。

## 4. Apple

### Brand Feeling

Apple 的核心感受是清晰、克制、直接和高度控制。它擅长让复杂能力看起来简单，把注意力集中在一个主叙事或一个关键任务上。

对 Fandom Harbor 的启发不是“科技感”，而是“少量信息也能有权威感”。在阅读产品中，这对应清楚的正文、章节路径、警告信息和操作状态。

### Layout System

Apple 常通过强中心轴、明确主视觉、模块化段落和严格的节奏变化建立层级。它不会把所有信息同时推到同一权重，而是让用户按顺序理解。

Fandom Harbor 可借鉴这种“每一屏只解决一个主要判断”的节奏，但不能套用巨大产品 hero 或营销式滚动叙事。

### Typography

Apple 的排版强调极高的可读性和层级控制，标题、说明、动作和辅助信息之间边界清楚。

Fandom Harbor 可借鉴其“排版即界面”的思想：让标题、摘要、预警、标签和正文各自拥有明确角色，而不是用过多装饰来制造品牌感。

### Color Usage

Apple 常使用低噪音背景、强对比文本和少量强调色。颜色承担重点和状态，不承担全部品牌表达。

Fandom Harbor 可借鉴这种克制，但需要更文学、更温和，避免变成冰冷的科技产品。

### Content Presentation

Apple 擅长减少用户同时处理的信息，让重点内容获得足够呼吸空间。辅助内容通过模块和渐进展开承接。

对 Fandom Harbor 来说，Work Detail 可以让标题、摘要、警告和章节入口分层呈现；Archive/Search 则需要比 Apple 更高的信息密度，因为归档发现依赖元数据。

### Applicable Learning

| Learning                           | Why                                | Impact                                     | Future Usage                         |
| ---------------------------------- | ---------------------------------- | ------------------------------------------ | ------------------------------------ |
| Single dominant intent per section | 阅读和筛选场景容易被元数据淹没     | 页面更容易扫描，用户知道每一块要做什么     | Work Detail、Search、Archive、Studio |
| Restraint creates trust            | 私域产品需要可信，而不是刺激       | 降低噪音，提升权限、警告和保存状态可信度   | Auth、Warnings、Permission、Studio   |
| Typography can carry brand         | Fandom Harbor 不应依赖装饰建立品牌 | 通过标题、正文、标签和说明文字形成独立气质 | Design System、Reading、Landing      |

## 5. THREE Cosmetics

### Brand Feeling

THREE 的品牌感受是自然、平衡、身体感和轻柔现代性。其官方表达强调 mind、body、skin 的整体关系，以及自然力量带来的舒适感。

Fandom Harbor 可借鉴“整体体验”的思想：阅读、发现、回访、创作和治理不应割裂，而应组成一个平静的私域归档体验。

### Layout System

THREE 的页面节奏偏轻、留白较多，内容通常以产品线、理念和图像形成柔和分区。信息不像后台系统那样密集，而是强调感受和呼吸。

Fandom Harbor 可借鉴其柔和分段和低压进入感，用于 Visitor Gate、Landing 和阅读外层氛围，但 Archive/Search 仍需保持归档效率。

### Typography

THREE 的文字感偏清雅、简洁，强调短句和理念表达。信息表达不重压迫感。

Fandom Harbor 可借鉴这种温和语气，尤其在邀请、警告、空状态和错误恢复中使用非恐吓语言。

### Color Usage

THREE 倾向自然、低饱和、肌理感较强的表达。颜色不是高强度 CTA 驱动，而是整体情绪的一部分。

Fandom Harbor 可借鉴低饱和和自然气息，但需避免变成美妆品牌或纯生活方式产品。

### Content Presentation

THREE 用产品理念和系列说明建立信任。它不是只摆商品，而是通过背后哲学让用户理解品牌。

Fandom Harbor 可在 Landing、Gate 和 About 中解释“为什么邀请制、为什么归档、为什么阅读优先”，但不应在核心阅读页重复品牌说教。

### Applicable Learning

| Learning                | Why                                    | Impact                                   | Future Usage                            |
| ----------------------- | -------------------------------------- | ---------------------------------------- | --------------------------------------- |
| Holistic calm           | Reader、Author、Admin 体验需要统一气质 | 从门禁到阅读再到 Studio 都保持低压一致性 | Brand System、Landing、Studio           |
| Gentle explanatory copy | 私域规则和警告容易显得冷硬             | 用户更容易理解边界并保持安心             | Invitation Gate、Warnings、Empty States |
| Soft segmentation       | 复杂内容需要分区但不能像后台           | 页面节奏更自然，降低阅读前负担           | Work Detail、Author Profile、About      |

## 6. ABIB

### Brand Feeling

ABIB 的品牌感受是干净、直接、功能明确和产品导向。它常以简洁标题、明确功效和组合模块让用户快速理解内容。

Fandom Harbor 可借鉴“明确、干净、少废话”的信息表达，但不能把作品展示变成商品货架。

### Layout System

ABIB 的页面倾向清楚模块、商品网格和明确操作入口。模块之间区分明显，适合浏览和快速选择。

Fandom Harbor 的 Archive/Search 可借鉴其清楚网格和模块边界，但需减少促销感、价格感和电商购买节奏。

### Typography

ABIB 的文字层级较直接，标题、短说明和产品名有清楚区分。

Fandom Harbor 可借鉴其“快速识别”的排版方式，用于标签、筛选、状态和章节列表。

### Color Usage

ABIB 常使用干净背景和局部产品色彩，让内容自身成为主角。整体不会依赖大面积强色。

Fandom Harbor 可借鉴其干净背景和局部强调，但强调对象应是作品状态、警告、筛选和阅读路径，而不是销售行动。

### Content Presentation

ABIB 擅长把组合、功效和产品列表用较短路径呈现。用户可以快速判断“这是什么”和“是否适合我”。

Fandom Harbor 可将这个能力迁移为作品判断：这是什么作品、谁写的、什么分级、有什么警告、是否完结、有哪些标签、从哪里开始读。

### Applicable Learning

| Learning                 | Why                                 | Impact                       | Future Usage                 |
| ------------------------ | ----------------------------------- | ---------------------------- | ---------------------------- |
| Fast recognition modules | Archive/Search 需要快速比较大量作品 | Reader 更快判断是否进入作品  | Work Cards、Archive、Search  |
| Clean grouping           | 复杂元数据需要分组                  | 标签、警告和状态不会互相淹没 | Metadata Blocks、Filters     |
| Functional clarity       | 用户要知道下一步能做什么            | 减少迷路和误点               | Reader Library、Studio Lists |

## 7. ARgENTUM

### Brand Feeling

ARgENTUM 的品牌感受是神秘、奢华、科学与仪式感结合。它将科学术语、银色概念、香氛和 archetype 叙事组合成强品牌世界。

Fandom Harbor 可借鉴“品牌世界感”和“仪式感”，但必须避免过度神秘化。文学归档需要清楚、可信、包容，而不是把用户带入封闭的奢侈品叙事。

### Layout System

ARgENTUM 使用产品、理念、科学说明和探索模块交替，形成较强的品牌沉浸。模块常带有探索感。

Fandom Harbor 可以在 Landing 和邀请门禁中建立“进入港湾”的仪式，但 Archive、Reading 和 Admin 必须保持功能清晰。

### Typography

ARgENTUM 的文字有明显品牌命名和高概念表达。标题常带仪式感，正文承接科学或功效说明。

Fandom Harbor 可借鉴“命名与语气一致性”，例如 Reader Library、Archive、Studio 等区域拥有稳定语义，但不应发明过多概念词。

### Color Usage

ARgENTUM 倾向深色、银色、高对比和奢华氛围。

Fandom Harbor 可在局部品牌时刻借鉴深浅对比和低饱和金属感，但阅读主体不能变暗、变重或降低长读舒适度。

### Content Presentation

ARgENTUM 将产品、科学、故事和 archetype 交织，增加探索欲。

Fandom Harbor 可借鉴“内容背后有世界观”的表达，用于解释归档理念和私域规则；不应把作品发现做成占卜式或玄学式推荐。

### Applicable Learning

| Learning                | Why                                   | Impact                                | Future Usage                  |
| ----------------------- | ------------------------------------- | ------------------------------------- | ----------------------------- |
| Controlled ritual       | 邀请制进入需要有边界感                | Gate 更像进入私域空间，而非普通注册页 | Visitor Gate、Invitation      |
| Brand world consistency | Fandom Harbor 需要独立于 AO3 的记忆点 | 语言、视觉和页面节奏更统一            | Landing、About、Design System |
| Use mystery carefully   | 过度神秘会损害权限和警告清晰度        | 品牌有氛围但不牺牲可理解性            | Warnings、Auth、Moderation    |

## 8. Aesop

### Brand Feeling

Aesop 的品牌感受是克制、文学、理性、质感和本地语境。它的产品页面、内容模块和 Library 入口共同建立一种“有知识、有审美、有秩序”的体验。

这与 Fandom Harbor 的目标最接近：文学感、安静、内容有层次、品牌不靠强装饰，而靠文字、节奏和一致语气。

### Layout System

Aesop 的页面常将商品、分类、推荐阅读、服务和品牌叙事自然穿插。它的空间不是空洞留白，而是让内容有阅读节奏。

Fandom Harbor 可借鉴其“内容与品牌叙事并存”的方式：Archive 和 Reading 是主功能，About、Library、Author Profile 可以承载更强品牌语境。

### Typography

Aesop 的文字表达具有文学性和清楚层级，标题、短说明、产品名和阅读内容之间保持秩序。

Fandom Harbor 可借鉴其文字作为品牌资产的做法。尤其在空状态、门禁、推荐阅读、作者简介和章节上下文中，copy 应克制而有温度。

### Color Usage

Aesop 常使用中性、温暖、低饱和色，并让产品和内容图片形成视觉变化。

Fandom Harbor 可借鉴温和中性与编辑感，但必须避免变成美妆零售或生活方式目录。

### Content Presentation

Aesop 重视“可读内容”本身，网站不仅展示商品，也展示 Library、Experience 和推荐阅读。这证明品牌可以通过内容秩序表达，而不是靠强视觉噱头。

Fandom Harbor 可借鉴其“内容即品牌”的方向：作品、作者、标签和归档说明应成为品牌主体。

### Applicable Learning

| Learning              | Why                                    | Impact                             | Future Usage                         |
| --------------------- | -------------------------------------- | ---------------------------------- | ------------------------------------ |
| Literary restraint    | Fandom Harbor 需要文学气质而非社区皮肤 | 页面更耐读、更可信、更有独立品牌感 | Landing、Work Detail、Author Profile |
| Content-led brand     | 作品本身应成为品牌表达                 | 减少装饰依赖，让归档内容发光       | Archive、Reading、Library            |
| Local/contextual tone | 私域社群需要被尊重的空间感             | 语言更像邀请与照看，而非增长和促销 | Gate、Empty States、Admin Notices    |

## 9. Cross-Reference Synthesis

| Reference | What to Learn                            | What to Avoid                                  |
| --------- | ---------------------------------------- | ---------------------------------------------- |
| Apple     | 清晰层级、克制、单一主意图、排版承载品牌 | 科技产品感、巨大营销 hero、过度产品发布节奏    |
| THREE     | 柔和整体体验、自然低压语气、平衡感       | 美妆生活方式化、过度自然疗愈语境               |
| ABIB      | 干净模块、快速识别、功能清晰             | 电商促销感、商品货架化、价格导向               |
| ARgENTUM  | 品牌世界感、进入仪式、概念一致性         | 过度神秘、奢侈品距离感、牺牲可理解性           |
| Aesop     | 文学克制、内容即品牌、编辑节奏           | 零售目录感、过度品牌姿态、把产品卖点套到作品上 |

## 10. Fandom Harbor Design Translation

### Information Hierarchy

Fandom Harbor 应将层级稳定为：

1. 作品 / 正文 / 阅读路径。
2. 分级、预警和权限边界。
3. 作者 / 笔名与作品语境。
4. 标签、关系、状态和发现元数据。
5. 回访、书签、Kudos、评论、推荐等下游互动。

Why: 该顺序符合 Reading First 和 No Social Drift。
Impact: Reader 不被统计或装饰干扰；Author 的作品语境被尊重。
Future Usage: UX-02 IA、Work Card、Work Detail、Reading。

### Page Rhythm

页面节奏应在“编辑感”和“归档效率”之间平衡：

- Landing / Gate 可以更有品牌仪式。
- Archive / Search 保持清晰和可扫描。
- Work Detail 让判断和进入阅读顺畅。
- Chapter Reading 最大化正文稳定性。
- Studio / Admin 回归工作效率和安全。

Why: 不同角色和页面有不同任务，不能用同一套 marketing rhythm。
Impact: 品牌统一但任务效率不被牺牲。
Future Usage: UX-02、UX-03、Figma Prototype。

### Whitespace Strategy

留白应有功能：

- 用于阅读呼吸。
- 用于区分元数据类型。
- 用于降低高风险操作误读。
- 用于移动端触控安全。

Why: Fandom Harbor 信息复杂，留白过少像论坛，留白过多像营销页。
Impact: 内容更清楚，阅读更耐久，操作更安全。
Future Usage: Design System Spacing、Reader Layout、Archive、Admin。

### Brand Expression

品牌表达优先顺序：

1. 文案语气。
2. 排版层级。
3. 留白和页面节奏。
4. 低噪音颜色。
5. 少量视觉资产。
6. 克制动效。

Why: 文学归档产品的品牌主体是内容和信任，不是装饰。
Impact: 后续视觉系统可以轻，但仍有独立识别度。
Future Usage: UX-03 Visual System、UX-04 Prototype、Frontend Polish。

### Content Presentation

作品展示应更像“文学目录 + 归档元数据”，而不是“商品卡片 + 转化按钮”。

Why: 作品不是商品，作者不是卖家，读者不是购买漏斗。
Impact: 作品摘要、警告、作者、标签和章节路径获得更合适的尊重。
Future Usage: Archive、Search、Work Detail、Author Profile。

### User Emotional Experience

目标情绪为：

- Reader: 安心进入、慢慢寻找、舒服读完。
- Author: 作品被认真保存，身份边界被尊重。
- Admin: 可治理、可追溯、低误伤。
- Visitor: 理解这里是受邀进入的私域归档。

Why: 这些情绪直接来自 Fandom Harbor 的产品定位和权限模型。
Impact: 设计不会漂移成社交平台、论坛、博客或普通 SaaS。
Future Usage: 全部 UX Mission。

## 11. Reference Guardrails

后续设计引用这些参考时必须遵守：

- 可以借鉴 Apple 的清晰，不复制科技发布页。
- 可以借鉴 THREE 的柔和，不变成美妆生活方式。
- 可以借鉴 ABIB 的干净，不变成电商货架。
- 可以借鉴 ARgENTUM 的仪式，不牺牲权限和警告清晰度。
- 可以借鉴 Aesop 的文学克制，不变成零售目录。

最终品牌判断以 Fandom Harbor 产品定位为准，而不是参考品牌的行业惯性。
