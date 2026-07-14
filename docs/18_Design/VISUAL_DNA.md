# Fandom Harbor Visual DNA

Status: Proposed for UX-01 Brand Experience Foundation
Scope: Visual Direction only; not Design Token or UI implementation

## 1. Purpose

本文定义 Fandom Harbor V1 品牌体验的视觉 DNA，用于指导后续 UX Design、Figma Prototype 与 Frontend Implementation。

本文件描述视觉判断的方向、理由、体验影响和未来使用场景，不提前锁定 CSS、Tailwind、Design Token、组件实现或具体页面。

## 2. Visual Keywords

Primary visual keywords:

- Quiet editorial
- Private archive
- Literary calm
- Precise metadata
- Soft authority
- Long-form comfort
- Intentional whitespace
- Warm restraint

中文视觉关键词：

- 安静编辑感
- 私域归档感
- 文学阅读感
- 元数据清晰
- 柔和但有秩序
- 适合长读
- 留白有意图
- 温和克制

Rejected visual directions:

- 普通 SaaS 仪表盘
- 论坛列表密度
- 博客模板
- 社交 feed
- 电商促销页
- 游戏化任务页
- 大面积装饰渐变
- 过度卡片化

## 3. Typography Direction

### Direction

Fandom Harbor 的排版应以长文阅读舒适度为核心，同时保留清晰的编辑层级。正文应有文学感和稳定节奏；元数据、标签、警告和导航应更理性、更可扫描。

推荐方向：

- Reading type: language-capable serif / sans option, with calm rhythm and generous line height.
- UI type: clean system sans, optimized for labels, filters, buttons and metadata.
- Editorial hierarchy: title and chapter context can be expressive, but not decorative.
- Metadata scale: compact but readable; never below accessibility and contrast expectations.
- Mixed-language readiness: Chinese, English, numbers, fandom tags and relationship notation must coexist without visual collapse.

### Why

Fandom Harbor 的主要使用场景是长文阅读、作品筛选和作者归档。排版必须同时支持沉浸阅读和复杂信息扫描。

### Impact

Reader 能更轻松进入正文；Archive 和 Search 中的大量标签、分级、警告、作者名和摘要不会互相抢权重；Author Studio 保持工作台清晰度。

### Future Usage

- Chapter Reading: 正文、章节标题、目录、上一章 / 下一章。
- Work Detail: 标题、摘要、作者、分级、警告、标签。
- Archive/Search: 卡片标题、摘要、筛选和元数据。
- Studio: 表单、状态、章节列表和保存反馈。

### Not Implementation Decision

不在本阶段指定具体字体品牌、字号 Token、字体加载策略或 fallback 细节。现有 `docs/06_Design_System/TYPOGRAPHY.md` 与 `.ai/STYLE_GUIDE.md` 仍是具体规则的当前来源。

## 4. Color Philosophy

### Direction

Fandom Harbor 的颜色应像安静的阅读空间：低噪音、高可读、少而准。颜色不负责制造兴奋感，而负责建立层级、状态、信任和阅读舒适度。

推荐方向：

- Base palette: warm neutral or soft paper-like neutral, but avoid heavy beige/sand domination.
- Text contrast: body and interactive content must remain AA-ready.
- Accent: restrained, editorial, used for meaningful action and focus.
- Warning / rating / moderation: semantic and accessible, never color-only.
- Dark mode: true reading comfort, not pure black novelty mode.
- Tags: structure and labels first, subtle color second.

### Why

产品需要同时承载文学阅读、权限状态、预警、标签和后台治理。颜色如果过多，会削弱文本和状态判断。

### Impact

阅读页更耐看；警告和错误状态更可信；标签不会变成杂乱的彩色噪音；Admin 操作保持审慎。

### Future Usage

- Reading themes.
- Rating and warning states.
- Tag category and canonical state.
- Auth gate, permission denied and moderation flows.
- Focus, success, danger and recovery paths.

### Not Implementation Decision

不在本阶段指定 raw palette、semantic token 值或深浅色具体色阶。后续如变更 token，应同步 `COLOR.md`、`DESIGN_TOKENS.md` 和 `.ai/STYLE_GUIDE.md`。

## 5. Layout Rhythm

### Direction

布局节奏应像编辑过的目录和章节，而不是信息流瀑布。页面应有明确的进入、扫描、判断、阅读和回访路径。

推荐方向：

- Reading pages: single primary prose column; support context but never crowd text.
- Discovery pages: list/card rhythm should support comparison, not endless feed consumption.
- Work detail: metadata before content, but avoid making metadata heavier than summary and chapter path.
- Studio: task-based layout with clear stages and low ambiguity.
- Admin: dense enough for operations, but every risky decision needs context and confirmation.

### Why

Reader 需要快速判断作品是否适合自己，然后进入长读；Author 和 Admin 需要完成有责任边界的工作流。

### Impact

用户不需要在页面中猜测下一步；长标题、大标签组、空状态和错误状态都有稳定位置；页面不会因为内容量变化失去节奏。

### Future Usage

- UX-02 Information Architecture.
- Archive/Search result rhythm.
- Work Detail and Chapter navigation.
- Studio creation/editing flow.
- Admin report and tag governance screens.

### Not Implementation Decision

不锁定网格列数、断点、卡片尺寸、固定导航或具体 layout component。

## 6. Space Philosophy

### Direction

留白是品牌表达的一部分，但不是装饰空白。Fandom Harbor 的留白应服务阅读呼吸、内容分组、决策安全和移动端触控。

推荐方向：

- Reading: generous vertical rhythm around title, warnings and body.
- Metadata: compact grouping with enough separation to distinguish type.
- Forms: related fields close，section transitions clear。
- Lists: avoid over-spaced marketing cards; preserve scan efficiency.
- Mobile: touch area and safe area are more important than decorative symmetry.

### Why

作品归档页面天然信息多。没有留白会像旧式论坛；留白过度又会削弱目录、搜索和移动效率。

### Impact

Reader 能持续阅读；Archive/Search 能比较作品；Author 表单不会显得压迫；Admin 审核减少误读。

### Future Usage

- Work Card and metadata groups.
- Reader preferences and chapter controls.
- Author Studio forms.
- Admin tables and report detail.

### Not Implementation Decision

现有 `SPACING.md` 和 `.ai/STYLE_GUIDE.md` 的 4px scale、44px touch target、major section gap 等仍是当前具体约束。本文件只定义空间气质。

## 7. Image / Illustration Direction

### Direction

Fandom Harbor 的视觉资产应支持“文学港湾”和“私域归档”的感觉，而不是创建强插画 IP 或泛二次元社区感。

推荐方向：

- Prefer editorial, atmospheric, textural or archive-adjacent imagery.
- Use illustration sparingly for onboarding, empty state and brand moments.
- Avoid generic SaaS blob illustrations and stock reading photos.
- Avoid fandom-specific imagery that implies one fandom owns the platform.
- If cover imagery appears later, it should support work identity without breaking reading hierarchy.

### Why

平台承载多 fandom、多作者、多作品类型。强风格插画会把产品误导成单一社区或营销站。

### Impact

品牌能保持包容和长期耐看；作品自身内容有表达空间；空状态不会抢过正文。

### Future Usage

- Landing brand atmosphere.
- Invitation gate.
- Empty states.
- Author profile / work cover future review.
- Documentation and Figma prototype mood references.

### Not Implementation Decision

不决定是否生成图片、不决定图片比例、不决定插画风格包、不决定封面上传策略。文件格式、上传和安全仍受 KI-003 等后续决策约束。

## 8. Motion Direction

### Direction

动效应解释状态和层级，而不是吸引注意。阅读空间中的动效必须短、轻、可被减少。

推荐方向：

- Page transitions: subtle and optional; never delay reading.
- Controls: state feedback clear but quiet.
- Metadata expansion: support orientation, not theatrical reveal.
- Loading states: stable, no bouncing loop or gamified waiting.
- Reduced motion: remove nonessential transform and decorative motion.

### Why

长文阅读对视觉干扰敏感；同时，复杂元数据、筛选、保存和发布需要状态反馈。

### Impact

Reader 不被打断；Author 保存和发布能获得明确反馈；Admin 操作保持可信和审慎。

### Future Usage

- Filter expansion.
- Warning reveal.
- Reader preference controls.
- Studio save/publish states.
- Admin moderation status changes.

### Not Implementation Decision

不指定 duration、easing、animation library 或 CSS 实现。现有 `MOTION.md` 是具体动效规则的归属文件。

## 9. Visual DNA Usage Rules

后续设计产出应按以下顺序判断：

1. 是否保护阅读优先。
2. 是否表达私域归档，而不是公开社区流量。
3. 是否让复杂元数据更清楚。
4. 是否让作者和管理员感到可控。
5. 是否在移动端仍可读、可点、可理解。
6. 是否避免提前锁死后续实现。

## 10. Brand Direction / UX Principle / Implementation Decision Boundary

### Brand Direction

安静、文学、私域、可信、编辑感、长期归档。

### UX Principle

阅读优先、内容层级优先、最小打扰、元数据可扫描、移动端可持续使用。

### Implementation Decision

具体 token、CSS、组件、页面、动画参数和资产生成方式均不是本文件的决策范围。
