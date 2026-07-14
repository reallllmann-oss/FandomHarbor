# Fandom Harbor UX Implementation Guidelines

Status: Completed for UX-06A; awaiting Product Owner acceptance
Phase: Implementation Polish Foundation
Depends on: UX-01 至 UX-05E、`IMPLEMENTATION_DESIGN_SYSTEM.md`、`COMPONENT_STRATEGY.md`
Scope: 后续 UX Implementation 的统一规则；不修改现有 UI 或业务行为

## 1. Purpose

本文定义 UX-06B 及后续实现必须遵守的响应式、可访问性、阅读保护和视觉一致性规则。页面 polish 只能改善表现与使用质量，不能改变产品功能、权限、数据或发布语义。

## 2. Implementation Order

每个页面 Mission 按以下顺序执行：

1. Confirm frozen experience goal。
2. Inventory current behavior and states。
3. Identify Token and component impact。
4. Preserve data、permission、route、Server Action contracts。
5. Implement the smallest visual change set。
6. Verify responsive、accessibility、theme and regression。
7. Update design and implementation records。

Why: 先确认行为事实可以避免视觉调整误伤已完成主链路。
Impact: 每个页面都可以独立发布、回滚和验收。
Application: UX-06B Homepage 以及后续 Reading、Archive、Author、Studio Mission。

## 3. Responsive Principles

### 3.1 Mobile Is a Primary State

- Reader 与 Author 核心流程从 320px logical width 起验证。
- Desktop 只增加 supporting context，不延长阅读行宽。
- 内容顺序、DOM 顺序与 keyboard 顺序保持一致。
- 关键 Rating、Warning、Save、Publish 状态不能因响应式折叠消失。
- Primary touch targets 至少满足 44 x 44px；compact control 只能用于安全的高密度桌面场景。

### 3.2 Content-driven Breakpoints

- 现有 640、768、1024、1280、1536px 是起点，不是设备清单。
- 在标题换行失控、metadata 无法扫描、form action 被遮挡或阅读 measure 失衡时才调整 layout。
- 禁止使用 viewport width 缩放字体。
- 固定格式元素必须有稳定尺寸或 responsive constraint，动态内容不能导致 layout shift。

### 3.3 Page-specific Density

- Homepage：first viewport 先表达品牌入口和下一行动。
- Archive：允许更高扫描密度，但低于 forum、feed 或 marketplace。
- Reading：prose 周围低密度，controls 只保持可达。
- Author：作品脉络高于 profile decoration。
- Studio：可提高任务密度，但状态与错误恢复必须留有空间。

Why: 同一 breakpoint 不能替代不同任务空间的内容判断。
Impact: 页面共享系统而不共享错误的密度模板。
Application: 每个页面的 responsive acceptance matrix。

## 4. Accessibility Rules

目标为 WCAG 2.2 AA，并将可访问性作为完成条件。

### Structure and Navigation

- 保持单一清晰 `h1` 与逻辑 heading hierarchy。
- 使用 landmark、skip link、语义 nav 和可预测 tab order。
- 当前导航、当前章节和 selected state 使用语义属性表达。
- 所有关键操作可由 keyboard 完成，不依赖 hover、swipe 或隐藏 gesture。

### Controls and Forms

- Label 永久可见；placeholder 不能替代 label。
- Error 同时提供字段级说明；长表单需要可定位的 summary。
- Focus ring 可见且在 light / dark theme 中与 border 区分。
- Disabled、pending、invalid、read-only 不只通过 opacity 或颜色表达。
- Icon-only control 需要 accessible name 与 tooltip；decorative icon 对辅助技术隐藏。

### Feedback and State

- Save、Publish、Error、Recovery 使用适当 live region，避免重复播报。
- Warning、Rating、Moderation、Validation 不使用 color-only meaning。
- Loading、empty、error、denied、not found、success 状态必须有明确恢复路径。
- Theme change、font scaling 与 200% zoom 不重置阅读位置或阻塞 action。

### Motion

- 尊重 `prefers-reduced-motion`。
- Motion 不能移动长文基线、延迟阅读或成为状态唯一证据。
- Loading feedback 及时，但不使用持续装饰动画制造等待感。

## 5. Reading Experience Protection

Reading 是最高优先级体验，任何全站组件进入 Reading 时都必须重新审查干扰程度。

### Must Preserve

- `--reader-font-size`、`--reader-line-height`、`--reader-measure` 及现有 preference contract。
- Prose 是主列，desktop 不拉伸正文。
- Work / Chapter identity、必要 Rating / Warning 位于正文前。
- Previous / Next、chapter position 和 return path 清晰可达。
- Bookmark、preference 与 post-reading interaction 保持辅助层级。
- Light / dark surface 都需长时间阅读对比度验证。

### Must Avoid

- Prose 旁的 popularity、comment feed、recommendation rail。
- Persistent promotional banner 或高存在感 global navigation。
- 在章节正文与 continuation 之间插入无关模块。
- Decorative image、gradient、parallax 或 motion 作为阅读背景。
- Blog、News、Forum 或 CMS article template 的 header rhythm。

### Chapter Flow Acceptance

- 章节结束后可 continue、return 或 rest。
- Disabled previous / next 状态可理解且不伪装成 link。
- 长标题、无下一章、目录很长、访问变化与内容缺失均有稳定布局和恢复路径。

Why: 阅读页的价值来自情绪连续性，而不是组件数量。
Impact: Design System 进入 Reading 后不会反客为主。
Application: Reading implementation、visual QA 和 regression tests。

## 6. Visual Consistency Rules

- 使用 semantic role，不在页面定义 raw palette。
- Typography hierarchy 由内容角色决定，不由页面偏好决定。
- Primary action 少而明确；`primary` color 不作装饰。
- Card 仅用于重复对象、Modal 或真实 framed tool；page section 保持 unframed。
- Metadata 按意义分组，Warning 与 Rating 高于 optional Tag 和 statistics。
- Border、surface、spacing 优先于 heavy shadow。
- Radius 服从 component family，避免 indiscriminate pill。
- Lucide 是唯一默认 icon language。
- Public Pen Name 与 private account identity 永远分离。
- Popularity metrics 不成为视觉主层级。

## 7. Experience-specific Rules

| Space    | Visual Contract                 | Implementation Guardrail                                      |
| -------- | ------------------------------- | ------------------------------------------------------------- |
| Homepage | Quiet Editorial Harbor          | 品牌阈值先于作品预览；禁止 SaaS hero / feature grid           |
| Archive  | Curated Story Discovery Space   | 支持选择而非促销；禁止 ranking / marketplace / feed           |
| Work     | Story decision support          | Warning、summary、author、reading entry 清楚                  |
| Reading  | Private Literary Reading Space  | prose first、low interaction density、continuous chapter flow |
| Author   | Literary Creator Identity Space | published works 表达身份；禁止 follower economy               |
| Studio   | Protected Creator Workspace     | save / publish / recovery 清楚；禁止 CMS dashboard drift      |

### 7.1 Studio Chapter Management Guardrail

Future Author Studio / Work Editor implementation must follow `STUDIO_CHAPTER_MANAGEMENT_RULES.md`：

- One chapter may use the simple flow；more than one requires collapsible chapter management。
- The active chapter remains expanded and explicitly identified；other saved chapters may collapse。
- Select All selects only currently publishable chapters and exposes none、partial and all states。
- Published、ineligible、invalid and unsaved chapters remain outside the publish selection。
- Zero selection cannot publish。
- Mobile prioritizes the active editor and prevents flattened chapter sprawl、horizontal overflow and action compression。

This is an implementation guardrail，not authorization to alter lifecycle、permission、Server Action、database、RLS or Reader behavior。

## 8. Functional Safety Boundary

视觉实现不得改变：

- Route 与 URL contract。
- Auth、Membership、Capability、permission redirect。
- Server Action input、field name、validation、pending / result semantics。
- Repository、Gateway、RLS、Migration、Supabase contract。
- Draft / Published 生命周期和 Reader published-only boundary。
- Reading preference、history、bookmark storage contract。
- Create、Edit、Save、Publish、Read 主链路。

发现相关问题时，记录影响、证据与建议 Mission，不在视觉 polish 中顺手修复。

## 9. Verification Matrix

每个页面 Implementation Mission 至少验证：

| Dimension     | Required Checks                                            |
| ------------- | ---------------------------------------------------------- |
| Functional    | 原主链路、links、forms、redirects、loading / error 状态    |
| Responsive    | mobile、tablet、desktop、long content、safe area           |
| Accessibility | keyboard、focus、headings、labels、live regions、contrast  |
| Reading       | measure、zoom、font scale、chapter flow、distraction level |
| Theme         | light、dark、system、no illegible semantic state           |
| Motion        | reduced motion、no layout-shifting animation               |
| Visual        | hierarchy、spacing、overflow、overlap、no template drift   |
| Boundary      | no permission、data、business、dependency or route change  |

## 10. Migration and Review Rules

- 一次只改一个已授权页面或稳定 component family。
- 不以 Design System 为由一次性迁移全站。
- 旧实现与新实现并存期间，Token 意义必须唯一。
- 新 shared component 必须先在真实页面验证，再扩大消费者。
- 删除 legacy style 前必须证明无消费者并完成 visual regression。
- 任何需要新依赖、技术栈、权限、数据库或业务决策的方案立即停止并等待授权。

## 11. UX-06A Boundary

本文是 implementation guidance，不是 UX-06B 开工授权。UX-06A 完成后仍需 Product Owner 验收；Homepage 实施必须由独立 UX-06B Mission Authorization 启动。
