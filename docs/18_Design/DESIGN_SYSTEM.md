# Fandom Harbor Design System Intelligence

Status: Proposed for UX-03 Design System Intelligence
Depends on: `BRAND_EXPERIENCE.md`, `VISUAL_DNA.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `PAGE_EXPERIENCE_STRATEGY.md`
Scope: Design language direction only; not token implementation, component implementation, CSS, Tailwind, Figma or page design

## 1. Purpose

本文建立 Fandom Harbor V1 的 Design System Intelligence，用于指导后续 UX-04 Page Experience Redesign、UX-05 Figma Intelligence 和 UX-06 Implementation Polish。

本文件不替代 `docs/06_Design_System/` 的现有 token 归属文件，不修改 Design Token，不创建组件，不定义 CSS。它定义未来设计系统应该表达什么、支持什么体验、避免什么漂移。

## 2. Foundation

UX-03 继承：

- UX-01: Fandom Harbor 是安静、可信、文学、私域、可治理的作品归档与阅读产品。
- UX-02: 产品体验由 Entry、Discovery、Decision、Reading、Return、Creation 六类任务空间构成。
- Existing Design System: 现有语义 token、阅读布局、可访问性和 spacing 规则继续有效；UX-03 不直接变更它们。

Why: Design System 必须从品牌和 IA 出发，而不是从组件库或 dashboard 模板出发。
Impact: 后续页面设计能保持统一气质，同时支持不同任务空间的信息密度。
Application: UX-04 页面重设计、UX-05 Figma 原型、UX-06 polish handoff。

## 3. Design Philosophy

Fandom Harbor 的 Design System 应像“被妥善维护的私域文学港湾”：它安静、清楚、有秩序，允许复杂元数据存在，但始终让作品和阅读成为中心。

Core philosophy:

- Reading before interface.
- Archive before feed.
- Editorial calm before decoration.
- Semantic clarity before visual novelty.
- Privacy and governance before virality.
- Warm restraint before platform spectacle.

### Why

Fandom Harbor 的差异化不是普通内容管理，而是作品归档、阅读舒适度、作者身份边界、邀请制信任和可治理元数据的组合。

### Impact

视觉系统应降低噪音、强化层级、保护阅读，避免把 Archive 做成论坛列表，把 Studio 做成 SaaS 后台，把 Author Profile 做成社交主页。

### Application

Homepage、Archive、Work Detail、Reading Page、Author Profile、Studio、Admin 治理界面。

## 4. Fandom Harbor Design Language

### 4.1 Quiet Editorial

设计语言应接近高级编辑体验：清晰标题、稳定正文、克制留白、可扫描元数据。

Why: 文学产品的品牌感应由文字、秩序和节奏建立。
Impact: 用户感到这里适合阅读和保存作品，而不是快速消费内容。
Application: Work Detail、Reading Page、Archive、Author Profile。

### 4.2 Private Archive

设计语言应表达“受保护的归档空间”，而不是开放广场。

Why: 邀请制和身份边界是产品根基。
Impact: Auth、Gate、Library、History 和 Studio 都应显得可信且有边界。
Application: Homepage、Gate、Reader Library、Studio。

### 4.3 Precise Metadata

复杂元数据要被设计系统承载，而不是被装饰隐藏。

Why: 标签、分级、预警、关系和状态是 Fandom Harbor 的发现能力。
Impact: Metadata 的层级、分组和状态表达必须清楚，不能变成彩色噪音。
Application: Archive、Search、Work Detail、Admin Tag Governance。

### 4.4 Soft Authority

权限、警告、保存、发布和治理状态需要明确，但语气和视觉不能恐吓。

Why: 私域产品需要用户信任系统边界。
Impact: Warning、Error、Permission、Publish、Moderation 状态应清楚、审慎、可恢复。
Application: Warning display、Permission pages、Studio save/publish、Admin workflows。

## 5. Design Personality

| Personality | Design Meaning             | Why                    | Impact                     | Application                |
| ----------- | -------------------------- | ---------------------- | -------------------------- | -------------------------- |
| Calm        | 低噪音、低刺激、低压迫     | 长读需要安静           | 阅读和发现都更耐用         | Reading、Archive           |
| Literary    | 排版和内容顺序尊重作品     | 产品核心是故事         | 页面像文学目录而非商品货架 | Work、Author               |
| Trustworthy | 状态、权限、错误可理解     | 私域和治理依赖信任     | 用户知道系统在保护边界     | Gate、Studio、Admin        |
| Curated     | 信息被组织但不抹平作者表达 | 标签治理要尊重自由标签 | 元数据更可扫描             | Archive、Search            |
| Intimate    | 受邀空间，非公共广场       | 邀请制是体验的一部分   | 回访和身份更私密           | Home、Library              |
| Editorial   | 文字、留白、层级承载品牌   | 避免装饰化品牌         | 视觉更长期耐看             | All reader-facing surfaces |

## 6. Core Principles

### 6.1 The Story Is the Center

Design System 的所有样式和组件原则都应服务 Story Content。

Why: UX-02 将 Story Content 定义为 Primary Content。
Impact: 标题、摘要、正文、章节结构、分级和预警永远高于统计与互动。
Application: Work Card、Work Detail、Reading Page。

### 6.2 Metadata Should Clarify, Not Decorate

Metadata 应表达类型、状态和选择依据，而不是变成视觉装饰。

Why: Fandom Harbor 的归档价值来自可发现和可治理的元数据。
Impact: Tag、Warning、Rating、Status、Category 需要语义结构和可读性。
Application: Archive、Search、Work Detail、Admin tag screens。

### 6.3 Reading Space Is Narrower Than Product Space

Reading Page 的设计系统应更克制，允许全站视觉语言退后。

Why: 阅读是核心体验，界面不应抢走情绪连续性。
Impact: Reading typography、measure、spacing、motion、navigation 都要降低干扰。
Application: Chapter Reading、Article Reading。

### 6.4 Creation Space Needs State Clarity

Studio 的设计语言应支持保存、发布、草稿、错误和恢复，而不是追求 dashboard 密度。

Why: Author 对丢失和误发布敏感。
Impact: 状态反馈、表单层级、验证和恢复路径成为 Studio 的设计重点。
Application: Studio overview、Work editor、Publish flow。

### 6.5 Components Should Carry Intent

Button、Card、Navigation、Content Block、Metadata 都应先表达意图，再表达形态。

Why: 同一个视觉元素在 Discovery、Reading、Return、Creation 中承担不同任务。
Impact: 后续组件设计不会被单一 dashboard 或 marketing 风格绑架。
Application: UX-04 页面重设计、UX-06 component review。

## 7. Visual Expression

Fandom Harbor 的视觉表达应由以下顺序建立：

1. Information hierarchy.
2. Typography rhythm.
3. Reading measure and spacing.
4. Semantic color.
5. Component states.
6. Quiet motion.
7. Sparse visual assets.

视觉表达不应依赖：

- 大面积渐变。
- 装饰性图案堆叠。
- 论坛式密集边框。
- SaaS dashboard cards everywhere。
- 社交平台 feed 节奏。
- 电商促销 CTA。

## 8. Component Philosophy

本文只定义组件哲学，不创建组件。

### 8.1 Button

Button should express deliberate action, not visual excitement.

Why: 保存、发布、登录、继续阅读都需要用户明确理解后果。
Impact: Primary action 应少而准；danger action 应清楚说明后果；secondary action 不应抢正文。
Application: Gate、Work entry、Reader controls、Studio save/publish。

### 8.2 Card

Cards should group archive information, not become decorative containers for every section.

Why: 过度卡片化会让 Fandom Harbor 变成普通 SaaS 或电商页面。
Impact: Work card 应优先标题、作者、摘要、分级、预警和元数据；统计和互动靠后。
Application: Archive、Search、Library、Author Profile。

### 8.3 Navigation

Navigation should be intent-based: enter, discover, read, return, create.

Why: UX-02 明确导航不应反映技术结构或 CMS 模块。
Impact: 用户能按任务移动，而不是学习系统内部结构。
Application: Homepage、Archive、Library、Studio。

### 8.4 Content Block

Content blocks should create editorial rhythm and preserve meaning.

Why: 作品详情、作者介绍、章节上下文都依赖内容顺序。
Impact: 页面能承载长标题、复杂摘要、大标签组和状态信息。
Application: Work Detail、Author Profile、Studio forms。

### 8.5 Metadata

Metadata components should be semantic, grouped and readable.

Why: Metadata 是发现工具，也是读者安全判断的一部分。
Impact: Rating、Warning、Category、Status、Tags 应通过结构和文字表达，不能只靠颜色。
Application: Archive、Search、Work Detail、Admin governance。

## 9. Visual Consistency Rules

- Use semantic roles before raw visual choices.
- Prioritize story, warnings and reading path over decoration.
- Keep reader-facing surfaces editorial and calm.
- Keep Studio task-based and state-clear.
- Keep metadata compact but readable.
- Keep interaction states accessible and recoverable.
- Keep public author identity separate from private account identity.
- Never use popularity metrics as the dominant visual system.

## 10. Future Usage

UX-03 Design System Intelligence should guide:

- UX-04 Page Experience Redesign: page-specific hierarchy and design language.
- UX-05 Figma Intelligence: screen patterns, prototype hierarchy and visual consistency.
- UX-06 Implementation Polish: component review, visual QA and design handoff.
- Existing `docs/06_Design_System/`: future token updates, if separately authorized.

## 11. Non-Decisions

This document does not decide:

- Specific color values.
- Specific font files or font loading.
- Tailwind classes.
- CSS variables.
- Component implementation.
- Page layout.
- Figma frames.
- Route changes.
- Database, Supabase or business logic.
