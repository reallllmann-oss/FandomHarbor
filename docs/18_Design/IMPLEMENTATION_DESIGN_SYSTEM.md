# Fandom Harbor Design System Implementation Foundation

Status: Completed for UX-06A; awaiting Product Owner acceptance
Phase: UX Design Intelligence -> Implementation Polish
Depends on: UX-01 至 UX-05E 已验收设计文档、`.ai/STYLE_GUIDE.md`、`docs/06_Design_System/`、`docs/07_Component/`
Scope: Design System 实施策略与迁移边界；不修改 Token、CSS、Tailwind、Component 或页面

## 1. Purpose

本文将 UX-03 Design System Intelligence 映射为可执行的 Frontend Foundation，供 UX-06B 及后续页面 Mission 使用。

本 Mission 的成功标准是建立清晰的样式归属、Token 分层和迁移顺序，不是立即替换现有 UI。Create、Edit、Save、Publish、Read 主链路以及权限、数据和发布逻辑保持冻结。

## 2. Current Styling Analysis

### 2.1 Current Stack

- `apps/web` 使用 Next.js App Router、React 和 Tailwind CSS 4。
- `apps/web/src/app/globals.css` 通过 `@import "tailwindcss"` 加载 Tailwind，并导入 `@fandom-harbor/ui/styles.css`。
- `packages/ui/src/styles.css` 是当前共享颜色变量、Radius 与基础全局样式入口。
- `packages/ui` 已提供 `Button`、共享 Layout、Status Page、Theme Provider 与 Theme Toggle。
- Reader 的字体大小、行高和阅读宽度通过 `--reader-font-size`、`--reader-line-height`、`--reader-measure` 实现，并由浏览器本地偏好驱动。
- 页面样式主要由 Tailwind utility、共享 CSS class 和少量页面级 class 组合完成。

Why: 现有技术路径与批准的 Tailwind + `packages/ui` 架构一致，不需要引入新 Framework。
Impact: UX-06 可以渐进实施，不需要重建样式系统或中断现有功能。
Application: 所有后续 Reader、Author 与 Studio 页面 Mission。

### 2.2 Existing Strengths to Preserve

- 已有 light / dark semantic variables 和系统主题切换。
- 已有 `background`、`foreground`、`surface`、`border`、`primary`、`focus` 等基础角色。
- 已有 `rounded-control`、`rounded-card` 和共享 Button variant 基础。
- 已有全局 reduced-motion 防护和可见 focus pattern。
- Reader 已实现可调 measure、字体大小、行高与主题，并遵守 accepted Reader baseline。
- `packages/ui` 已是跨 App 的合法共享边界，Apps 不需要建立新的 shared 目录。

### 2.3 Recorded Gaps

以下内容只记录，不在 UX-06A 修复：

1. `docs/06_Design_System/` 定义了 `accent`、`danger`、`warning`、`success`、Elevation、Motion 和完整 Typography 角色，但当前共享 CSS 尚未完整暴露这些语义角色。
2. 页面使用了 `text-destructive` 等状态 utility，而当前共享 `@theme` 映射未展示对应 Token；后续实现前必须核对实际生成结果与视觉可访问性。
3. `packages/ui` 组件覆盖较薄，大量按钮、表单控件、状态标签和内容容器仍在页面内重复拼接 class。
4. `reading-card` 被用于 Auth、Archive、Author、Search 和 Studio，名称与职责已经超出 Reading；`stat-card` 同时承担作品项、状态块和工作区模块，语义不够稳定。
5. Reader 专属 CSS 位于 `apps/web/globals.css`，职责合理但规则较集中；未来只能按 Reading Mission 渐进拆分，不能在基础阶段整体搬迁。
6. 页面存在少量 arbitrary values、`rounded-full` 和 `shadow-lg`。其中部分有真实布局或状态用途，不能机械删除；需要按组件语义逐项审查。

Why: 这些差距会造成同一设计语言在不同页面被重复解释。
Impact: 若直接重做页面，Token 与组件债务会被复制到新 UI。
Application: UX-06B 开始前的 Token gap checklist 与组件影响评审。

## 3. Styling Architecture Rules

样式归属固定为四层：

| Layer                    | Ownership                                      | Responsibility                                        | Prohibited                        |
| ------------------------ | ---------------------------------------------- | ----------------------------------------------------- | --------------------------------- |
| Design decision          | `docs/18_Design/`                              | 品牌、体验、视觉方向与实施边界                        | 写入 CSS 实现细节                 |
| Concrete system contract | `.ai/STYLE_GUIDE.md`, `docs/06_Design_System/` | 可验证的尺寸、语义角色、响应式与可访问性规则          | 页面临时值成为事实源              |
| Shared implementation    | `packages/ui`                                  | Token、基础组件、真正共享的 archive / reading pattern | 业务查询、权限或页面路由          |
| Page composition         | `apps/web`                                     | 组合页面内容、数据状态与领域流程                      | 创建第二套 Token 或 fork 基础组件 |

新增样式规则必须先判断归属：跨页面视觉角色进入 `packages/ui`；单一页面的结构组合留在 App；Reader 偏好只控制阅读体验变量，不成为全站 Token。

## 4. Design Token Strategy

### 4.1 Token Layers

未来 Token 使用三层模型：

1. Foundation values：颜色值、字体栈、间距尺度等底层值，只能存在于设计系统实现内部。
2. Semantic roles：`background`、`foreground`、`surface`、`primary`、`warning`、`success` 等产品语义，供组件和 utility 使用。
3. Experience aliases：仅在确有必要时表达 `reading-surface`、`studio-state` 等体验角色，并必须映射到语义层，不能形成独立 palette。

Product code 不直接使用 raw color；arbitrary spacing 或尺寸必须有内容约束理由。Theme 只替换语义值，不改变组件含义。

Why: Fandom Harbor 需要不同任务空间，但不能让每个页面拥有自己的视觉系统。
Impact: Homepage、Archive、Reading、Author、Studio 可以改变密度和节奏，同时保持品牌连续。
Application: `packages/ui/src/styles.css` 的未来受控扩展及页面组件 variant。

### 4.2 Color Implementation Strategy

语义映射方向：

| Brand Direction               | Implementation Role                      | Usage Boundary                               |
| ----------------------------- | ---------------------------------------- | -------------------------------------------- |
| Paper Surface / Morning Light | `background`, `surface`, `surface-muted` | 阅读、入口、安静分组                         |
| Ink Stone                     | `foreground`, `muted-foreground`         | 正文、标题、辅助信息                         |
| Tidal Teal                    | `primary` 或经验收的 action role         | deliberate action、导航、focus reinforcement |
| Lantern Amber                 | `warning`                                | 分级、预警、非惩罚提示                       |
| Safe Mooring                  | `success`                                | 保存、发布、恢复完成                         |
| Red Signal                    | `danger` / `destructive`                 | 错误与不可逆风险                             |
| Harbor Night                  | dark theme semantic values               | 深色阅读环境与私域深度                       |

最终命名需与现有 `docs/06_Design_System/COLOR.md` 和 Tailwind utility 保持单一映射。颜色不能单独表达状态；文字、图标或结构必须同行。

### 4.3 Typography Implementation Strategy

第一阶段继续使用现有 language-capable system sans 与 system serif，不新增字体依赖。实施角色为：

- Display：仅品牌入口与创作者身份关键时刻。
- Heading：页面、区段、内容对象的语义层级。
- Body：UI 说明、摘要、表单与恢复文案。
- Reading：长文本正文，独立支持 serif / sans 偏好。
- Metadata：分级、预警、标签、状态，保持最低可读尺度。

字体角色应由共享 variant 或语义 class 表达；页面不得通过任意字号模拟标题层级。现有 Reader variables 保持向后兼容。

### 4.4 Spacing Strategy

- 继续采用 4px 基础尺度和已批准 spacing scale。
- 优先表达关系：control internal、field relationship、group、section、page region、reading rhythm。
- 页面可以组合 spacing utility，但重复出现的关系应上升为组件 contract。
- Reading 使用 prose rhythm；Archive 使用可扫描节奏；Studio 使用 task-and-state rhythm，三者不共享单一密度 preset。
- 触控目标与 safe area 不因视觉紧凑而缩小。

### 4.5 Radius and Elevation Strategy

- 保留 `control` 与 `card` 现有角色，补充 overlay / round 只能在后续授权中进行。
- `round` 仅用于头像、紧凑状态或明确 pill control，不用于所有 Tag 和 Button。
- 默认通过 border、surface 与 spacing 建立层级。
- Shadow 只映射 `raised`、`sticky`、`overlay`、`modal` 等语义 elevation；页面不得自行升级 z-index 或阴影强度。

### 4.6 Motion Strategy

- 运动只解释状态、层级或位置，不制造注意力竞争。
- 使用 instant、fast、normal、deliberate 共享时长角色，后续实现需与 `MOTION.md` 一致。
- Reading 禁止视差、自动循环和导致文字位移的动效。
- 所有非必要 Motion 必须服从 `prefers-reduced-motion`；现有全局保护保持不变。

## 5. Future Migration Plan

### Phase 1: Foundation Audit

- 建立 Token gap 清单和状态 utility 对照。
- 验证 light / dark 对比度、focus、warning、success、danger。
- 不改变页面结构。

### Phase 2: Shared Primitive Completion

- 先补 Button、form control、status / notice、container 等高重复基础能力。
- 每个新增 shared component 必须有明确职责、状态和可访问性 contract。
- 保持现有 DOM、Server Action、权限与数据 flow。

### Phase 3: Mission-based Page Migration

- UX-06B 从 Homepage 开始，一次只迁移一个页面体验。
- Reading、Archive、Author、Studio 分别按自己的已验收 Visual Direction 执行。
- 旧 class 只有在所有消费者迁移并完成回归后才能删除。

### Phase 4: Consolidation

- 删除无消费者的 legacy style。
- 更新 `docs/06_Design_System/`、`docs/07_Component/` 与视觉回归基线。
- 验证所有核心页面的 mobile、dark、zoom、keyboard 和 reduced motion。

## 6. Preserve / Migrate / Do Not Touch

| Category                                               | Decision                            |
| ------------------------------------------------------ | ----------------------------------- |
| Tailwind 4 + PostCSS                                   | Preserve                            |
| `packages/ui` ownership                                | Preserve and strengthen             |
| Reader preference variables and local storage contract | Preserve                            |
| Theme provider and semantic theme model                | Preserve                            |
| Page-local repeated control styling                    | Migrate gradually                   |
| `reading-card` / `stat-card` catch-all usage           | Replace by responsibility over time |
| Auth, permission, Server Action, Repository, RLS       | Do not touch                        |
| Create / Edit / Save / Publish / Read behavior         | Do not touch                        |
| Dependencies, package manifests, lockfile              | Do not touch                        |

## 7. Implementation Boundary

UX-06A 未修改任何 Token、CSS、Tailwind、Component 或页面。任何后续实施若需要改变具体颜色值、字体资源、业务状态、路由、权限、数据库或发布流程，必须进入对应授权 Mission；不能以 Design System 迁移为理由夹带。
