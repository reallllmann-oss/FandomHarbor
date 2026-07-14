# Fandom Harbor Component Foundation Strategy

Status: Completed for UX-06A; awaiting Product Owner acceptance
Phase: Implementation Polish Foundation
Depends on: `IMPLEMENTATION_DESIGN_SYSTEM.md`, `docs/07_Component/COMPONENT_RULES.md`, UX-04 Page Experience, UX-05 Visual Directions
Scope: Component responsibilities and migration strategy only; no component creation or modification

## 1. Component Philosophy

Fandom Harbor 的 Component 应承载稳定意图，而不是只封装一串 class。共享的判断标准是：跨两个以上页面重复、语义稳定、状态契约稳定，并且不依赖页面查询或权限实现。

Why: 视觉统一来自一致的行为与层级，不来自把所有 JSX 都放进 `packages/ui`。
Impact: 页面可以保留领域表达，同时避免 Button、Metadata、Notice、Container 被重复实现。
Application: UX-06B 及后续逐页实施前的 component impact review。

## 2. Ownership Model

### `packages/ui` Owns

- Design Token 和 shared style contract。
- shadcn / Radix-based accessible primitives。
- 跨页面稳定的 Button、Field、Notice、Status、Navigation、Content Container。
- 真正共享的 archive / reading pattern，其 API 不读取业务数据。

### `apps/web` Owns

- Homepage、Archive、Work、Reading、Author、Studio 的页面组合。
- Server Component 数据读取、Server Action wiring 和 permission-aware composition。
- 只在单一体验中出现且语义尚未稳定的局部结构。

### Explicit Boundary

- UI Component 不访问 Supabase、Repository、Session 或 RLS。
- UI Component 不判断 Author 权限；页面向组件传入已确定的状态和可见 action。
- Domain component 可以接受 Work、Chapter 等 view model，但不能把 persistence contract 带入 UI package。

## 3. Shared Component Candidates

候选顺序代表实施优先级，不代表 UX-06A 已创建组件。

### Priority 1: Foundations

| Candidate                 | Responsibility                                               | Existing Signal                            |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------ |
| Button / ActionLink       | 明确 command、link 与 variant；统一 focus、disabled、pending | Shared Button 已存在，但页面按钮仍大量手写 |
| Field / FieldMessage      | 绑定 label、help、error、required、invalid                   | Auth 与 Studio 重复表单结构                |
| Input / Textarea / Select | 统一 control height、surface、focus、invalid、disabled       | 多页面重复相同 class string                |
| StatusBadge               | 表达 draft、published、saved 等文字状态                      | 多处 `rounded-full` 状态标签重复           |
| Notice                    | warning、error、success、info 的语义与 live-region contract  | 状态颜色与反馈呈现尚未统一                 |
| ContentContainer          | 管理 general、editorial、reading、form measure               | 当前 max-width 与 `reading-card` 语义混用  |
| Surface                   | 只表达明确分组层级，不成为万能 Card                          | `reading-card` / `stat-card` 使用范围过宽  |

### Priority 2: Product Patterns

| Candidate                    | Responsibility                                 | Future Usage                           |
| ---------------------------- | ---------------------------------------------- | -------------------------------------- |
| SiteNavigation               | intent-based global navigation 与 active state | Homepage、Archive、Author              |
| PageHeader / EditorialHeader | 页面身份、说明、主要 action 的稳定层级         | Archive、Work、Author、Studio          |
| WorkPreview                  | 标题、Pen Name、摘要、预警与核心 metadata      | Homepage preview、Archive、Author      |
| MetadataGroup                | 按语义分组 Rating、Warning、Category、Tags     | Archive、Work Detail、Studio readiness |
| WarningNotice                | 阅读前的非羞辱性分级与预警                     | Work、Reading                          |
| EmptyState / ErrorState      | 清楚说明状态并提供恢复路径                     | Archive、Library、Studio               |
| ChapterNavigation            | previous、next、position、disabled contract    | Reading                                |
| ReadingShell                 | 阅读宽度、正文上下文与 chrome boundary         | Chapter、Article                       |
| StudioStatePanel             | save、validation、publish readiness、recovery  | Studio                                 |

Why: 这些 pattern 对应 Fandom Harbor 的作品、元数据、阅读和创作职责，不是通用 SaaS 模块。
Impact: 后续页面能共享语言，但 Homepage 不会被 Card grid、Studio 不会被 Dashboard widget 绑架。
Application: 按页面 Mission 选择最小必要候选进入实现。

## 4. Component Responsibility Rules

每个组件实现前必须回答：

1. Intent：它帮助用户理解或完成什么？
2. Content hierarchy：Primary、Secondary、Supporting 内容是什么？
3. States：default、hover、focus-visible、disabled、pending、invalid、read-only 是否适用？
4. Accessibility：语义元素、名称、keyboard、live region、touch target 如何保证？
5. Responsive：内容换行、顺序、long title、mixed language、zoom 如何处理？
6. Ownership：它属于 `packages/ui` 还是页面 composition？
7. Boundary：它是否不知晓数据库、权限和路由内部实现？

只有职责稳定后才能共享。不能为了减少文件数量制造大而全组件。

## 5. Core Pattern Guidance

### Navigation

- 以 Enter、Discover、Read、Return、Create 等用户意图组织。
- 权限决定入口是否出现，但权限判断留在 trusted page boundary。
- Reading 中全局 Navigation 退后，Chapter context 优先。
- Mobile top-level destinations 保持受控，不依赖 hover。

### Button and Actions

- 一个区域只有一个视觉主行动，除非任务明确需要并列决定。
- Link navigation 与 form command 保持语义元素正确。
- Save、Publish、Delete 等 action 必须表达 pending、result 与 consequence。
- Icon 采用 Lucide；icon-only control 必须有 accessible name 和 tooltip。

### Card / Surface

- Card 仅用于重复对象、Modal 或真正需要边界的工具。
- 页面 section 不自动成为 Card。
- WorkPreview、StatusPanel、Notice 等通过职责命名，避免 catch-all `Card` API。
- 禁止 Card 嵌套 Card 和 dashboard-style module grid 漂移。

### Typography Block

- PageHeader、EditorialHeader、ReadingHeader 使用语义 heading order。
- 不把 font size 当作 heading level。
- 支持长标题、中文、英文和 mixed-language，不以截断掩盖主要内容。

### Content Container

- General shell、editorial content、reading measure、form measure 分开表达。
- Desktop 宽度增加 supporting context，不拉长 prose。
- Container 不内置页面 padding 之外的业务布局。

### Metadata

- Rating 与 Warning 高于 optional Tag。
- Category、Status、Relationship、Tag 按意义分组。
- 不使用 rainbow taxonomy；颜色必须配合文字或结构。
- 大量 Tag 允许 staged display，但不能隐藏关键 Warning。

## 6. Avoided Component Patterns

- `UniversalCard`：通过大量 props 承担所有页面区块。
- `PageBuilderSection`：用配置对象重建固定页面结构。
- `DashboardWidget`：把 Homepage、Archive 或 Studio 统一为指标卡。
- `PermissionAwareButton`：在 UI primitive 内自行读取身份或能力。
- `DataFetchingComponent`：共享视觉组件直接查询数据。
- Page-local Button/Input forks：重复复制基础交互样式。
- Variant explosion：用几十个视觉 variant 掩盖职责不清。
- Premature compound abstraction：在只有一个消费者时创建复杂 compound API。
- Component-level raw Token system：组件内部定义独立 palette、spacing 或 z-index。

## 7. Migration Strategy

1. 先对目标页面做 component inventory，不改行为。
2. 复用现有 `packages/ui` 能力；缺失能力按 Priority 1 最小补充。
3. 保留页面的数据读取、Server Action、form field name、permission guard 和 route contract。
4. 一次迁移一个稳定 pattern，并对 loading、empty、error、denied 和 success 状态回归。
5. 在至少两个真实消费者验证 API 后，再提升为 shared product pattern。
6. legacy class 只有在无消费者后删除；不以重命名为理由扩大 diff。

## 8. Page Migration Guidance

| Page        | Preserve                          | First Component Opportunity                  | Avoid                           |
| ----------- | --------------------------------- | -------------------------------------------- | ------------------------------- |
| Homepage    | access-state routing              | PageHeader、ActionLink、curated WorkPreview  | feature grid、full catalog      |
| Archive     | query/pagination/read boundary    | WorkPreview、MetadataGroup、Filter control   | marketplace cards、feed         |
| Work Detail | warnings/chapter entry            | WarningNotice、MetadataGroup、Chapter list   | commerce CTA                    |
| Reading     | Reader variables/history/bookmark | ReadingShell、ChapterNavigation              | toolbar dashboard、sidebar feed |
| Author      | public pen-name boundary          | EditorialHeader、WorkPreview                 | social profile components       |
| Studio      | owner guards/save/publish actions | Field、StatusBadge、Notice、StudioStatePanel | CMS widgets、analytics cards    |

## 9. UX-06A Boundary

本文不授权创建、删除或修改 Component。组件候选必须在对应页面 Mission 中按最小范围实施，并通过功能、响应式与可访问性验证。
