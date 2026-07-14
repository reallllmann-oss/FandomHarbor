# Fandom Harbor UX Phase Roadmap

Status: Proposed UX Design Intelligence Roadmap
Last Updated: 2026-07-14

## 1. Purpose

本文记录 Fandom Harbor V1 从 UX-01 到 UX-06 的设计推进路径。

本 Roadmap 只定义 UX 阶段顺序、每阶段目标、输入与输出，不自动授权任何后续 Mission，不包含 UI Implementation、代码修改、数据库修改或业务功能新增。

## 2. UX Phase Direction

Fandom Harbor 当前已经完成 V1 Beta 功能闭环。UX Design Intelligence 阶段的目标，是把现有 Reader -> Author -> Studio -> Publish -> Reading 闭环转化为更有品牌识别、更舒适、更适合长期阅读和归档的产品体验。

总体方向：

1. 先建立品牌和体验原则。
2. 再整理信息架构。
3. 再建立视觉系统方向。
4. 再进入关键页面原型。
5. 再细化交互与状态。
6. 最后进入前端实现准备。

## 3. UX Mission Roadmap

| Mission | Name                                    | Status                                         | Primary Output                                                         |
| ------- | --------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| UX-01   | Brand Experience Foundation             | PASS — Accepted                                | 品牌体验基础、视觉 DNA、UX 原则、参考分析                              |
| UX-02   | Information Architecture Intelligence   | PASS — Accepted                                | 全站信息架构、导航模型、页面层级、角色路径                             |
| UX-03   | Design System Intelligence              | PASS — Accepted                                | 设计语言、排版、色彩、布局、组件哲学、阅读体验原则                     |
| UX-04   | Page Experience Redesign                | PASS — Accepted                                | 六个核心页面体验蓝图与跨页面关系                                       |
| UX-05   | Figma Intelligence                      | PASS — Accepted                                | Homepage Figma Exploration 分析与视觉方向                              |
| UX-05B  | Reading Visual Intelligence             | PASS — Accepted                                | Reading Page 视觉方向与 UX-06 指引                                     |
| UX-05C  | Archive Visual Intelligence             | PASS — Accepted                                | Archive Page 视觉方向、Discovery Space 职责与 UX-06 指引               |
| UX-05D  | Author Visual Intelligence              | PASS — Accepted                                | Author Profile 视觉方向、Creator Identity 职责与 UX-06 指引            |
| UX-05E  | Studio Visual Intelligence              | PASS — Accepted                                | Studio 视觉方向、Creator Workspace 职责与 UX-06 指引                   |
| UX-06   | Implementation Polish                   | Reading Track Release Ready                    | 渐进式 Frontend Implementation Polish                                  |
| UX-06A  | Design System Implementation Foundation | PASS — Accepted                                | Token、Component、Styling Architecture 与 UX Implementation Foundation |
| UX-06B  | Homepage Implementation                 | PASS — Homepage Track Completed                | Homepage 的受控渐进实施 Mission                                        |
| UX-06C  | Reading Implementation                  | PASS — Completed / Release Ready               | Private Literary Reading Space 的渐进实施                              |
| UX-06D  | Archive Implementation                  | PASS — Completed / Release Ready               | Curated Story Discovery Space；Product Owner Accepted                  |
| UX-06E  | Search Implementation                   | PASS — Completed / Release Ready / PO Accepted | 主动查询 Published Work / Author 的受控渐进实施                        |
| UX-06F  | Author Profile Implementation           | PASS — Completed / Release Ready / PO Accepted | Literary Creator Identity Space；Ready for Release = YES               |
| UX-06G  | Work Detail Implementation              | PASS — Completed / Release Ready / PO Accepted | Literary Work Decision Space；Ready for Release = YES                  |
| UX-06H  | Homepage Implementation                 | Step04 Slim Completed / Awaiting Final Review  | Quiet Editorial Harbor Entrance；Ready for Release = YES               |
| UX-06I  | Global Shell / Navigation               | PASS / Product Owner Accepted / Closed         | 三分区全局壳层、移动导航与 capability-gated Studio                     |
| UX-06J  | Release UI Sweep / V1 UI Consistency    | PASS / Product Owner Accepted / Closed         | 主路径 UI 一致性审计与低风险 Release 修复                              |

## 4. UX-01 — Brand Experience Foundation

Status: PASS — Product Owner Accepted

Objective:

建立 Fandom Harbor V1 的品牌体验基础层，作为后续 UX Design、Figma Prototype 和 Frontend Implementation 的唯一设计依据。

Completed outputs:

- `BRAND_EXPERIENCE.md`
- `VISUAL_DNA.md`
- `UX_PRINCIPLES.md`
- `DESIGN_REFERENCE_ANALYSIS.md`
- `UX-01_ACCEPTANCE.md`

Confirmed boundary:

- 不修改代码。
- 不修改 UI 页面。
- 不修改组件。
- 不修改 CSS / Tailwind / Token。
- 不创建 Figma 文件。
- 不修改数据库或业务逻辑。

## 5. UX-02 — Information Architecture Intelligence

Status: PASS — Product Owner Accepted

Objective:

基于 UX-01 的品牌体验基础，重新梳理 Fandom Harbor V1 的信息架构、导航模型、页面关系和角色路径。

Completed focus:

- Visitor / Gate / Auth 进入路径。
- Reader Archive / Search / Work / Chapter / Library 路径。
- Author Studio / Works / Editor / Publish 路径。
- Admin / Super Admin 的治理入口边界。
- Mobile-first navigation strategy。
- Reader 与 Author 空间之间的切换关系。

Completed outputs:

- `INFORMATION_ARCHITECTURE.md`
- `USER_JOURNEY_MAP.md`
- `PAGE_EXPERIENCE_STRATEGY.md`
- `UX-02_ACCEPTANCE.md`

Not in scope unless separately authorized:

- 页面 UI 实现。
- Figma 文件生成。
- Component 或 CSS 修改。
- 新业务功能。

Accepted follow-up notes:

- Archive / Library / Works / Shelf 语义关系已在 UX-04 按体验角色继续拆分；最终命名不在 UX-04 锁定。
- UX-03 开始前重新确认 Mission 命名和阶段目标。

## 6. UX-03 — Design System Intelligence

Status: PASS — Product Owner Accepted

Objective:

将 UX-01 的 Visual DNA 和 UX-02 的信息架构转化为更具体的 Design System Intelligence，但仍不直接修改 Design Token 或前端代码。

Completed focus:

- Typography candidates。
- Color direction candidates。
- Layout rhythm and spacing direction。
- Brand asset and image style direction。
- Motion style direction。
- IA-driven hierarchy support。
- Reference validation and moodboard logic。

Completed outputs:

- `DESIGN_SYSTEM.md`
- `TYPOGRAPHY_SYSTEM.md`
- `COLOR_SYSTEM.md`
- `LAYOUT_PRINCIPLES.md`
- `READING_EXPERIENCE_GUIDELINES.md`
- `UX-03_ACCEPTANCE.md`

Not in scope unless separately authorized:

- Design Token 文件修改。
- Tailwind / CSS 修改。
- Component 创建或修改。
- 页面 UI 实现。
- Figma 文件生成。

Acceptance notes:

- Documentation: PASS.
- Design Foundation: PASS.
- Consistency with UX-01 and UX-02: PASS.
- Boundary: PASS.
- Documentation Governance: PASS.

## 7. UX-04 — Page Experience Redesign

Status: PASS — Product Owner Accepted

Objective:

基于 UX-02 信息架构和 UX-03 视觉系统方向，重新定义关键页面体验策略与页面重设计方向。

Completed focus:

- Homepage as private archive threshold。
- Archive as Discovery Space。
- Work Detail as story decision and reading-entry page。
- Reading Page as highest-priority focus experience。
- Author Profile as public creator identity through published works。
- Studio as author creation, management and publishing workspace。
- Page relationship: Homepage -> Discovery -> Story Decision -> Reading -> Return。
- Author relationship: Author -> Creation -> Publishing -> Public Identity。

Completed outputs:

- `HOMEPAGE_EXPERIENCE.md`
- `ARCHIVE_EXPERIENCE.md`
- `WORK_EXPERIENCE.md`
- `READING_EXPERIENCE.md`
- `AUTHOR_EXPERIENCE.md`
- `STUDIO_EXPERIENCE.md`
- `UX-04_ACCEPTANCE.md`

Not in scope unless separately authorized:

- React / Next.js 页面修改。
- Component、CSS、Tailwind 或 Design Token 修改。
- Figma 文件生成。
- 页面 UI 实现。
- 数据库、Supabase、Migration 或业务逻辑修改。

Acceptance notes:

- Documentation: PASS.
- Page Experience: PASS.
- UX Consistency with UX-01, UX-02 and UX-03: PASS.
- Boundary: PASS.
- Documentation Governance: PASS.

## 8. UX-05 — Figma Intelligence

Status: PASS — Product Owner Accepted

Objective:

基于 UX-01 至 UX-04 的设计基础，分析 Product Owner 提供的 Homepage Figma Exploration 素材，并建立 Homepage Visual Direction。

Completed focus:

- Homepage Figma Exploration 素材分析。
- Brand Expression / Layout Rhythm / Typography Feeling / Space Usage / Content Hierarchy / Emotional Experience / Reading-first Alignment 评估。
- Selected Direction 与 Rejected Direction 记录。
- Homepage Visual Direction。
- UX-06 Implementation Guidance。

Completed outputs:

- `Figma/FIGMA_DESIGN_REVIEW.md`
- `Figma/HOMEPAGE_VISUAL_DIRECTION.md`
- `UX-05_ACCEPTANCE.md`

Current recommended visual direction:

- Quiet Editorial Harbor。

Not in scope unless separately authorized:

- React / Next.js 页面修改。
- Component、CSS、Tailwind 或 Design Token 修改。
- 生产 UI 创建。
- 最终 Figma 页面或 prototype 生成。
- 数据库、Supabase、Migration 或业务逻辑修改。

Acceptance notes:

- Documentation: PASS.
- Visual Direction: PASS.
- Design Continuity: PASS.
- Boundary: PASS.
- Documentation Governance: PASS.

Next Product Owner decision:

- Continue UX-05 Reading / Other Pages Visual Direction, or
- Enter UX-06 Implementation Polish.

## 9. UX-05B — Reading Visual Intelligence

Status: PASS — Product Owner Accepted

Objective:

基于 UX-01 至 UX-05 的设计基础和 Product Owner 的 Reading Page Experience Direction，建立 Reading Page Visual Direction。

Completed focus:

- Reading Environment。
- Typography Feeling。
- Space Usage。
- Content Focus。
- Emotional Continuity。
- Chapter Transition。
- Apple Books reference abstraction。
- Fandom Harbor reading identity。
- UX-06 implementation guidance。

Completed outputs:

- `Figma/READING_VISUAL_DIRECTION.md`
- `UX-05B_ACCEPTANCE.md`

Current recommended visual direction:

- Private Literary Reading Space。

Not in scope unless separately authorized:

- React / Next.js 页面修改。
- Component、CSS、Tailwind 或 Design Token 修改。
- 生产 UI 创建。
- 最终 Figma 页面或 prototype 生成。
- 具体像素尺寸定义。
- 数据库、Supabase、Migration 或业务逻辑修改。

Acceptance notes:

- Documentation: PASS.
- Reading Experience: PASS.
- Reference Usage: PASS.
- Brand Continuity: PASS.
- Design Decision: PASS.
- Boundary: PASS.
- Documentation Governance: PASS.

Next recommended Product Owner decision:

- Continue UX-05 Other Pages Visual Direction:
- Author Visual Direction.
- Studio Visual Direction.

## 10. UX-05C — Archive Visual Intelligence

Status: PASS — Product Owner Accepted

Objective:

基于 UX-01 至 UX-05B 的设计基础，在没有额外 Figma reference 的情况下，自主推导 Archive Page Visual Direction，并将 Archive 从传统内容列表转化为符合 Fandom Harbor 的故事发现空间。

Completed focus:

- Archive Experience。
- Discovery Experience。
- Browsing Experience。
- Selection Experience。
- Content Relationship。
- Archive identity: what Archive is and is not。
- Archive / Library / Works / Continue Reading relationship。
- Homepage / Archive / Reading visual continuity。
- UX-06 implementation guidance。

Completed outputs:

- `Figma/ARCHIVE_VISUAL_DIRECTION.md`
- `UX-05C_ACCEPTANCE.md`

Current recommended visual direction:

- Curated Story Discovery Space。

Not in scope unless separately authorized:

- React / Next.js 页面修改。
- Component、CSS、Tailwind 或 Design Token 修改。
- 生产 UI 创建。
- 最终 Figma 页面或 prototype 生成。
- 具体像素尺寸定义。
- 最终 Archive / Library / Works / Shelf 命名锁定。
- 数据库、Supabase、Migration 或业务逻辑修改。

Acceptance notes:

- Documentation: PASS.
- Archive Experience: PASS.
- Information Architecture: PASS.
- Design Continuity: PASS.
- Boundary: PASS.
- Documentation Governance: PASS.

Next recommended Product Owner decision:

- Continue UX-05 Other Pages Visual Direction:
- Studio Visual Direction.
- Enter UX-06 Implementation Polish only after Product Owner confirms the remaining visual direction scope is sufficient.

## 11. UX-05D — Author Visual Intelligence

Status: PASS — Product Owner Accepted

Objective:

基于 UX-01 至 UX-05C 的设计基础，在没有额外 Figma reference 的情况下，自主推导 Author Profile Visual Direction，并将 Author Profile 从传统作者资料页、用户主页或社交主页转化为符合 Fandom Harbor 的 Creator Identity Space。

Completed focus:

- Author Profile Experience。
- Creator Identity。
- Author Relationship。
- Work Relationship。
- Reader Connection。
- Author page identity: what Author Profile is and is not。
- Author / Work relationship。
- Homepage / Archive / Author / Reading visual continuity。
- UX-06 implementation guidance。

Completed outputs:

- `Figma/AUTHOR_VISUAL_DIRECTION.md`
- `UX-05D_ACCEPTANCE.md`

Current recommended visual direction:

- Literary Creator Identity Space。

Not in scope unless separately authorized:

- React / Next.js 页面修改。
- Component、CSS、Tailwind 或 Design Token 修改。
- 生产 UI 创建。
- 最终 Figma 页面或 prototype 生成。
- 具体像素尺寸定义。
- 头像上传或图片处理行为。
- Follow、subscribe、notification、fan mechanics 或社交功能。
- 数据库、Supabase、Migration 或业务逻辑修改。

Acceptance notes:

- Documentation: PASS.
- Author Experience: PASS.
- Creator Identity: PASS.
- Experience Relationship: PASS.
- Design Continuity: PASS.
- Boundary: PASS.
- Documentation Governance: PASS.

Decision outcome:

- UX-05E Studio Visual Intelligence was authorized, completed and accepted.
- UX-05 Phase is closed; UX-06 Implementation Polish remains pending explicit Product Owner authorization.

## 12. UX-05E — Studio Visual Intelligence

Status: PASS — Product Owner Accepted

Objective:

基于 UX-01 至 UX-05D 的设计基础，在没有额外 Figma reference 的情况下，自主推导 Studio Visual Direction，并将 Studio 从传统 CMS 后台、数据管理面板、SaaS Dashboard 或管理工具集合转化为符合 Fandom Harbor 的 Creator Workspace。

Completed focus:

- Studio Experience。
- Creator Workflow。
- Work Management。
- Draft Management。
- Publishing Flow。
- Author Control。
- Studio page identity: what Studio is and is not。
- Create / Edit / Organize / Publish workflow experience。
- Efficiency + Fandom Harbor Warmth brand balance。
- Homepage / Archive / Author / Reading / Studio visual continuity。
- UX-06 implementation guidance。

Completed outputs:

- `Figma/STUDIO_VISUAL_DIRECTION.md`
- `UX-05E_ACCEPTANCE.md`

Current recommended visual direction:

- Protected Creator Workspace。

Not in scope unless separately authorized:

- React / Next.js 页面修改。
- Component、CSS、Tailwind 或 Design Token 修改。
- 生产 UI 创建。
- 最终 Figma 页面或 prototype 生成。
- 具体像素尺寸定义。
- Editor implementation。
- Save / autosave / validation / publish business logic。
- Analytics features。
- 数据库、Supabase、Migration 或业务逻辑修改。

Acceptance result:

- Documentation: PASS。
- Studio Experience: PASS。
- Creator Workspace: PASS。
- Experience Relationship: PASS。
- UX-05 Completion: PASS。
- Boundary: PASS。
- Documentation Governance: PASS。

Next recommended Product Owner decision:

- Authorize UX-06 Implementation Polish when ready.

## 13. UX-06 — Implementation Polish

Status: Homepage Track Completed — Product Owner Accepted / UX-06C Awaiting Authorization

Recommended objective:

将已验收的 UX Foundation、IA、Design System Intelligence、Page Redesign 和 Figma Intelligence 转化为前端实现 polish 前的规格和验收清单。

Expected focus:

- Warning and rating presentation。
- Filter and metadata expansion。
- Reader preference controls。
- Bookmark / Kudos / Comment placement principles。
- Studio save / publish feedback。
- Permission denied and not found recovery。
- Reduced motion and accessibility behavior。
- Frontend implementation scope。
- Component impact review。
- Token change proposal, if needed。
- Responsive and accessibility QA plan。
- Visual regression checklist。
- Out-of-scope protection before coding。

Expected outputs:

- Frontend handoff spec。
- Implementation acceptance checklist。
- Visual QA checklist。
- UX-06 acceptance record。

## 14. UX-06A — Design System Implementation Foundation

Status: PASS — Product Owner Accepted

Objective:

将 UX-03 Design System Intelligence 与 UX-05 Visual Directions 映射为可执行的 Frontend Foundation，在不修改现有页面、Component、CSS、Tailwind、业务逻辑和权限数据链路的前提下，建立后续页面 Mission 的统一实施规则。

Completed focus:

- Current Styling Architecture review。
- Design Token implementation strategy。
- Typography、Color、Spacing、Radius、Elevation 与 Motion mapping。
- Component ownership、candidate 与 responsibility strategy。
- Responsive、Accessibility、Reading Protection 与 Visual Consistency rules。
- Preserve / migrate / do-not-touch migration boundary。
- Homepage、Archive、Work、Reading、Author、Studio 的渐进迁移顺序。

Completed outputs:

- `IMPLEMENTATION_DESIGN_SYSTEM.md`
- `COMPONENT_STRATEGY.md`
- `UX_IMPLEMENTATION_GUIDELINES.md`
- `UX-06A_ACCEPTANCE.md`

Accepted implementation readiness:

- Strategy ready。
- Existing Tailwind 4 + `packages/ui` path retained。
- Existing Reader preference contract retained。
- Token / Component / page code unchanged。
- UX-06B requires separate Mission Authorization。

Not in scope:

- Homepage 或 Reading Page 重写。
- React Component 创建、删除或修改。
- CSS、Tailwind 或 Design Token 修改。
- 技术栈、依赖、package manifest 或 lockfile 修改。
- Auth、Permission、Database、Supabase、RLS、Server Action 或业务逻辑修改。

Decision outcome:

- UX-06A Design System Implementation Foundation accepted.
- Authorize UX-06B Homepage Implementation when ready.

## 15. UX-06B — Homepage Implementation

Status: Step 01 PASS; Step 02 PASS; Step 03 PASS; Step 04 PASS — Homepage Track Completed

Current identity:

- Quiet Editorial Harbor。

Step 01 objective:

在不完成最终 Homepage 内容、不改变 Root Layout、SEO、Session、数据和业务入口的前提下，建立 Homepage Page Shell、Layout Structure、Content Region Framework 与 Responsive Foundation。

Completed implementation:

- Route-local `HomepageShell`。
- Reusable-within-route `HomepageSection` semantic primitive。
- Entry Hero、Archive Foundation、Preview Shelf、Calm Closing 四区结构。
- Desktop / Mobile editorial rhythm 与 full-width mobile actions。
- Homepage legacy gradient hero 与 dashboard-card composition removal。
- Existing Reader、Archive、Author、Auth、Access 与 Work links preserved。

Validation:

- Web TypeScript: PASS。
- Web ESLint: PASS。
- Web Vitest: 79 / 79 PASS。
- Web production build: PASS。
- Desktop Browser QA: PASS。
- 390 x 844 Mobile QA: PASS。
- Dark theme QA: PASS。
- Horizontal overflow: none。
- Homepage console errors: zero。
- Reader `/works` existing sign-in boundary preserved。
- Archive and Author entry routes render successfully。
- No database、Supabase、Auth、permission、Reader、Archive、Author、Studio or business logic change。

Completed output:

- `UX-06B-STEP01_ACCEPTANCE.md`

Decision outcome:

- UX-06B Homepage Implementation Step 01 accepted.
- UX-06B Step 02 Homepage Content Structure was authorized and completed.

Step 02 completed implementation:

- Brand Introduction Region。
- Story Discovery Entry。
- Published Work preview using the existing public browse gateway。
- Reading Entry Region。
- Closing / Author / Access paths。
- Primary / Secondary / Supporting content hierarchy。
- Route-local `HomepageWorkPreview` component。
- Published-only newest-three selection without recommendation algorithm。

Step 02 validation:

- Web TypeScript: PASS。
- Web ESLint: PASS。
- Web Vitest: 79 / 79 PASS。
- Web production build: PASS。
- Homepage real Published Work display: PASS — three newest items。
- Reader existing sign-in boundary: PASS。
- Archive published browse: PASS。
- Author public profile: PASS。
- Desktop / 390 x 844 Mobile: PASS。
- Horizontal overflow: none。
- Homepage console errors: zero。
- No ranking、feed、CMS module、database、Supabase、Auth、permission or business logic change。

Step 02 output:

- `UX-06B-STEP02_ACCEPTANCE.md`

Decision outcome:

- UX-06B Homepage Implementation Step 02 accepted.
- UX-06B Step 03 Homepage Visual Refinement was authorized and completed.

Step 03 completed implementation:

- Removed full-page section border repetition so whitespace and quiet surfaces carry hierarchy。
- Refined Hero、Section heading、body and Work preview typography without adding a font dependency。
- Narrowed editorial reading measures and increased deliberate section / preview breathing room。
- Retained the existing semantic background、foreground、muted、primary、border and focus colors only。
- Added restrained color / underline feedback without transform、parallax or decorative animation。
- Kept mobile command buttons full-width while allowing supporting text links to retain natural width。

Step 03 validation:

- Web TypeScript: PASS。
- Web ESLint: PASS。
- Web Vitest: 79 / 79 PASS。
- Web production build: PASS。
- Desktop 1280 x 720: PASS。
- Tablet 768 x 1024: PASS。
- Mobile 390 x 844: PASS。
- Light / Dark theme: PASS。
- Horizontal overflow: none at all tested widths。
- Homepage Published Work display: PASS — three newest items。
- Homepage console errors: zero。
- Reader and Author existing sign-in boundaries: PASS。
- Archive public entry: PASS。
- No React structure、Component、database、Supabase、Auth、permission or business logic change。

Step 03 output:

- `UX-06B-STEP03_ACCEPTANCE.md`

Decision outcome:

- UX-06B Homepage Implementation Step 03 accepted by the Product Owner.
- UX-06B Step 04 Responsive + Final Homepage QA was authorized and completed.

Step 04 completed audit:

- 1440 x 900 Desktop、1280 x 720 Laptop、768 x 1024 Tablet 与 390 x 844 Mobile 均无水平溢出、Heading 截断或 Section 顺序变化。
- H1 / H2 / H3 层级、`zh-CN`、Main / Navigation / Region / Footer landmarks、accessible names、unique IDs 与 visible focus 均通过。
- Light / Dark 正文、muted text、primary action 均超过 WCAG AA；focus indicator 最低对比度为 3.19:1。
- Homepage 无图片与外部字体请求；稳定内容几何在一秒采样中无变化，生产环境 TTFB 为 14–30ms local sample。
- `pnpm validate` 通过 Format、Lint、TypeScript、全仓测试与 Web / Admin / Docs production builds。
- Guest Homepage、Register、Login、Archive、Reader Works / Work / Chapter、Author Profile、Author Studio 与 Reader Studio denial 均通过。
- 有效 Fixture Invitation 完成一次真实本地注册，Reader / Author Fixture 登录成功，浏览器 console errors 为零。
- 未修改 Homepage、Component、CSS、Database、Supabase、Auth、Permission 或业务逻辑。

Step 04 output:

- `UX-06B-STEP04_ACCEPTANCE.md`

Decision outcome:

- Product Owner accepted Homepage Release Readiness.
- UX-06B Homepage Track Completed.
- UX-06C Reading Track remains unauthorized.

## 16. Governance

- UX-01 已完成并验收。
- UX-02 已完成并通过 Product Owner 验收。
- UX-03 已完成并通过 Product Owner 验收。
- UX-04 已完成并通过 Product Owner 验收。
- UX-05 Homepage Figma Intelligence 已完成并通过 Product Owner 验收。
- UX-05B Reading Visual Intelligence 已完成并通过 Product Owner 验收。
- UX-05C Archive Visual Intelligence 已完成并通过 Product Owner 验收。
- UX-05D Author Visual Intelligence 已完成并通过 Product Owner 验收。
- UX-05E Studio Visual Intelligence 已完成并通过 Product Owner 验收。
- UX-05 Visual Intelligence Phase 已关闭，核心页面视觉方向已完整建立。
- UX-06A Design System Implementation Foundation 已完成并通过 Product Owner 验收。
- UX-06B Homepage Implementation Step 01 已完成并通过 Product Owner 验收。
- UX-06B Step 02 Homepage Content Structure 已完成并通过 Product Owner 验收。
- UX-06B Step 03 Homepage Visual Refinement 已完成并通过 Product Owner 验收。
- UX-06B Step 04 Responsive + Final Homepage QA 已完成并通过 Product Owner 最终验收。
- UX-06B Homepage Track 已正式完成。
- UX-06C Step 01 Reading Layout Foundation 与 Additional Mobile Reading Foundation 已通过 Product Owner 验收。
- UX-06C Step 02 Typography & Reading Rhythm 已完成并通过 Product Owner 验收。
- UX-06C Step 03 Reading Interaction 已完成并通过 Product Owner 验收。
- UX-06C Step 04 已使用 Long Watch 完成 1440 / 768 / 390 Long-form QA 与全站回归，并通过 Product Owner 验收。
- UX-06C Step04A QA Fixture Library Foundation 已完成并通过 Product Owner 验收。
- 未经新 Mission Authorization，不得自动进入其他页面 Implementation Track。
- 每个 UX Mission 完成后必须记录 acceptance。
- 任何进入 React / Next.js、Component、Tailwind / CSS、Design Token、Figma 文件生成、数据库、Supabase、Migration 或业务逻辑的动作，都必须由对应 Mission 明确授权。

## 17. UX-06C — Reading Track

Status: Step 01–Step05 PASS — Product Owner Accepted / Completed / Release Ready

Current identity:

- Private Literary Reading Space。

Step 01 completed implementation:

- Route-local `ReadingPageLayout`。
- `ReadingContextRegion` for breadcrumb、chapter position、return path and bookmark controls。
- `ReadingContentRegion` for the existing preference canvas、chapter header and story document。
- `ReadingContinuationRegion` for previous / next navigation and chapter directory。
- Pure-presentational `ChapterHeader` with Work / Author supporting identity。
- Reading context and continuation use a stable editorial measure while prose continues to use the existing reader preference measure。
- Reading settings accessible label no longer introduces an H2 before the Chapter H1。
- Reading grid contains intrinsic child widths and uninterrupted prose wraps within the mobile viewport without changing preference values。
- Mobile Reading Navigation provides always-visible Return to Work plus collapsible Homepage、Archive、Shelf、Search、previous / next and Chapter Directory access。
- Mobile navigation expands in document flow and closes back to full reading width；Desktop keeps the existing context and continuation rhythm with the directory closed by default。
- Global Header frozen as Left Brand、Center Navigation and Right Utility & Account at 1440、1280 and 768 widths；390 Mobile retains Brand and right-side Theme / Account while simplifying the center navigation。
- Reader navigation order is Archive、Search、then existing capability-gated Studio。The brand is the only Homepage entry in the Header。

Preserved contracts:

- Existing session and `archive:read` capability checks。
- Hybrid published-only Chapter gateway and Draft isolation。
- Reading preference CSS variables and localStorage contract。
- Reading history tracker、bookmark behavior、chapter navigation and directory。
- Homepage、Archive、Work Detail、Author and Studio behavior。
- Existing Auth、Reader / Author role、Studio capability and theme preference behavior。

Step 01 validation:

- Web TypeScript: PASS。
- Web ESLint: PASS。
- Web Vitest: 79 / 79 PASS。
- Web production build: PASS。
- Authenticated Chapter route and Published Chapter content: PASS。
- Reading context / settings / article / continuation semantics: PASS。
- 390 × 844 mobile Reading Navigation open / close、chapter selection、site exits and zero horizontal overflow: PASS。
- 1280 × 720 desktop low-distraction Reading behavior: PASS。
- Header four-viewport responsive structure and Guest / Reader / Author states: PASS。
- Database、Supabase、Migration、Auth、Permission and business logic changes: NONE。

Step 01 output:

- `UX-06C-STEP01_ACCEPTANCE.md`
- `UX-06C-STEP01-ADDITIONAL_ACCEPTANCE.md`

Step 02 completed implementation:

- Route-local system-serif fallback for prose and Chapter title；no font dependency。
- Existing 17 / 19 / 21px、1.65 / 1.8 / 2 and 58 / 68 / 78ch Reader preference values preserved。
- Chapter title uses discrete 36px Desktop、32px Tablet and 30px Mobile sizes。
- Paragraph、in-prose heading、list and blockquote rhythm refined for long reading。
- Chapter opening spacing refined without decoration or content changes。
- Complete Reading controls are hidden by default behind one quiet `Aa / 阅读设置` disclosure button。
- Existing font size、line height、measure and light / dark controls remain available in an on-demand labeled region；preference values and storage are unchanged。

Step 02 validation:

- 1440 Desktop、768 Tablet and 390 Mobile: PASS。
- Standard 19px / 1.8 / 68ch reading baseline: PASS。
- Maximum preference at 390 Mobile and preference persistence: PASS。
- Heading hierarchy、Light / Dark contrast、reduced motion and reflow safety: PASS。
- Default-closed settings、open / adjust / close、preference persistence and light / dark compatibility: PASS。
- Settings disclosure semantics、44px target and focus treatment: PASS。
- Reading Navigation、Chapter Directory、permission and published-only contracts: PRESERVED。
- Database、Supabase、Migration、Auth、Permission and business logic changes: NONE。

Step 02 output:

- `UX-06C-STEP02_ACCEPTANCE.md`

Step 03 completed implementation:

- Chapter Directory、Mobile Reading Navigation 与 Reading Settings 使用一个页面级 active panel state，一次只展开一个辅助面板。
- Chapter Directory 与 Mobile Navigation 继续默认关闭并进入正常文档流，不覆盖正文。
- 明确关闭命令在关闭后将焦点返回原触发按钮。
- 当前章节继续使用 `aria-current="page"`；章节切换继续使用既有 Published Chapter routes。
- Chapter end 增加克制的“继续下一章 / 故事暂至此处”语义，不引入动画或新的业务状态。
- Reader preference 值、localStorage、theme、bookmark、history、permission 与 published-only contract 保持不变。

Step 03 validation:

- 1440 Desktop 与 390 Mobile：PASS。
- Chapter Directory open / close / current / switch：PASS。
- Reading Settings default hidden / open / adjust / close：PASS。
- Mobile Return to Work、Homepage、Archive、Shelf、Search：PASS。
- Settings / Navigation mutual exclusion、focus return、44px touch targets 与 zero overflow：PASS。
- Guest、Reader、Author、Studio denial / access、Work Detail、Archive 与 Chapter Reading regression：PASS。
- 新页面 browser error log：0。
- Database、Supabase、Migration、Auth、Permission and business logic changes：NONE。

Step 03 output:

- `UX-06C-STEP03_ACCEPTANCE.md`

Step 03 acceptance:

- Product Owner Decision: PASS。
- Reading Interaction、Chapter Navigation、Reading Settings、Chapter Transition、Scroll、Responsive、Accessibility、Function Safety 与 Boundary 均通过验收。
- Step 03 正式关闭。

Step 04 completed QA:

- 1440 Desktop、768 Tablet 与 390 Mobile 的真实短章节布局、滚动与状态 QA：PASS。
- Work Detail → Chapter → Settings → Directory → Next Chapter → Continue Reading：PASS。
- Reader preference 调整、关闭、跨章节 reload 持久化与默认值恢复：PASS。
- Unknown Chapter、Draft Chapter、Unpublished Work 与 Guest permission boundary：PASS。
- Homepage、Archive、Author、Studio、Reader denial 与 Author access regression：PASS。
- Browser errors：0。
- Database / Supabase / Permission / business logic / code changes：NONE。

Step 04 original hold reason:

- Local Database 只有 1 个短 Published Chapter；内置 Published Fixtures 也只有 2–3 段。
- 没有可覆盖 20–30 分钟阅读量的 non-production 中长篇样本。
- 不在本 Mission 内写数据库、增加 QA Route 或改变 Fixture 内容。

Step04A Fixture resolution:

- 扩展现有 `pnpm qa:fixture`，没有建立第二套 QA system。
- 4 个 QA Works / 6 个 QA Chapters，覆盖 Short、Long-form、Multi Chapter、Empty 与 Draft Isolation。
- Long-form Chapter 包含 150 段、约 14,242 rendered characters；Medium Chapter 包含 60 段。
- `pnpm qa:fixture:clean` 只清 Reading QA 内容，保留 identities、credentials、Membership 和 Author grant。
- Reader Archive / Work / Chapter、Author Studio / Profile、Draft isolation、Desktop 1440 与 Mobile 390 validation：PASS。
- Step04 HOLD 的数据前置问题已解决；Step04 仍需重新执行后才能变为 PASS。
- Product Owner 已确认 UX-06C Step04A PASS；Reading QA Infrastructure 已建立并冻结。

Step 04 Long-form rerun:

- `pnpm qa:fixture` 与 `pnpm qa:credentials`：PASS。
- Long Watch 150 段完整渲染；1440、768、390 的连续 Typography、长滚动与 zero overflow：PASS。
- Reading Settings、Chapter Directory、Mobile Navigation、三章 Previous / Next 与末章边界：PASS。
- Homepage、Archive、Reading、Author、Studio 与 Reader / Author role regression：PASS。
- Browser errors：0；implementation fixes：NONE。
- Product Owner Decision：PASS；UX-06C Step04 正式关闭。

Step 04 output:

- `UX-06C-STEP04_ACCEPTANCE.md`

Next required action:

- UX-06C Step04 已完成 Product Owner 最终验收。
- UX-06C Step05 Reading Release Readiness 已通过 Product Owner 验收；Ready for Release：YES。
- UX-06C Reading Track 已正式关闭并标记为 Completed / Release Ready。
- 等待 Product Owner 授权下一条 UX Track；不得自动进入其他 Track、发布动作或新 Mission。

Step 05 Release Readiness:

- Reading Release Audit 与 1440 / 1280 / 768 / 390 Responsive：PASS。
- Keyboard、focus、heading、landmark、Reduced Motion、WCAG AA 与 touch targets：PASS。
- Long Watch rendering、scroll stability、layout stability 与 browser console：PASS。
- Homepage、Archive、Reading、Author、Studio、Search、Reader Permission 与 Draft Isolation：PASS。
- `pnpm validate`：PASS；Web tests 79 / 79；Web / Admin / Docs production builds：PASS。
- P0：0；P1：0；implementation changes：NONE。
- Release Decision：Reading Ready for Release = YES。
- Output：`UX-06C-STEP05_ACCEPTANCE.md`。
- Product Owner Decision：PASS；UX-06C Reading Track Completed / Release Ready。

## 18. Frozen Author Studio Chapter Management Foundation

Status: Accepted / Frozen — Documentation Only

Frozen output:

- `STUDIO_CHAPTER_MANAGEMENT_RULES.md`
- Multi-chapter works require collapsible management with one explicit active editing chapter。
- Other saved chapters may collapse；chapter identity、save state and saved / published time remain visible。
- Add Chapter remains a clear command。
- Multi-chapter publication requires eligible-only Select All and none / partial / all selection states。
- Published、ineligible、invalid and unsaved chapters cannot be batch-published；zero selection cannot publish。
- Mobile prioritizes the active editor and avoids flattened chapter sprawl、horizontal overflow and compressed save / publish actions。

Implementation status:

- Not authorized。
- Requires a future independent Author Studio / Chapter Management Mission。
- Does not alter Database、Supabase、RLS、Auth、permissions、routes、publish lifecycle or Reader behavior。

## 19. UX-06D — Archive Track

Status: PASS — Archive Track Completed / Release Ready / Product Owner Accepted

Current identity:

- Curated Story Discovery Space。

Track completion:

- Audited `/archive` route、Published-only gateway、four sorts、URL state、12-item pagination and invalid-page recovery。
- Audited orientation、results、work cards、pagination、Local Reader Shelf、empty、loading and error regions。
- 1440 Desktop and 390 Mobile current-state validation：PASS；zero overflow、44px sort controls、browser errors 0。
- Confirmed current `BrowseWork` exposes title、author、summary and published date only；Step02 may not invent or add metadata without separate authorization。
- Recorded seven P2 design / QA findings；none requires code change before Step02 planning。
- Product code、Database、Supabase、RLS、RPC、Migration、Auth、Permission、Published-only and dependencies：UNCHANGED。
- Step02 Archive Layout Upgrade：Completed / PASS。
- Step03 Archive States & Responsive QA：Completed / PASS。
- Step04 final Release Acceptance：PASS — Product Owner Accepted；Archive Ready for Release = YES。

Frozen boundary:

- Archive is public Published Work discovery and the primary Reader browse entry。
- Archive is not Studio management、Search query、Reading space、Author directory、private shelf primary surface、ranking or feed。
- Local Reader Shelf behavior remains；a future authorized Step02 may only clarify its secondary visual hierarchy。
- Step02 must preserve existing sort、pagination、gateway、Published-only and permission contracts。

Track outputs:

- `UX-06D-ARCHIVE-DESIGN-CONTRACT.md`
- `UX-06D-STEP02_ACCEPTANCE.md`
- `UX-06D-STEP03_ACCEPTANCE.md`
- `UX-06D-STEP04_ACCEPTANCE.md`

Next required action:

- Product Owner Final Decision：PASS。
- UX-06D Archive Track：Completed / Closed / Release Ready。
- Archive Ready for Release：YES。
- Wait for the next explicit Product Owner Mission；do not start a new UX Track automatically。

## 20. UX-06E — Search Track

Status: Step01–Step04 PASS — Product Owner Accepted / Completed / Release Ready

Current identity:

- Active Query Entry for Published Work and Public Author。

Step01 completed audit:

- 审计 `/search` route、GET `q` URL、normalization、80-character boundary、Work / Author matching、result cap 与既有 ordering。
- 审计 Initial、Invalid、Empty、Loading、Error 与 Results states。
- 审计 Work title / summary / public author / slug 与 Author display name / bio / Published Work count / slug 层级。
- 完成 1280 Desktop 与 390 × 844 Mobile QA；zero overflow，input / submit 为 44px，browser errors 为 0。
- Work Result 与 Author Result 入口通过；Published-only 与 `Hidden Draft Work` isolation 通过。
- 冻结 Search 为主动 query，Archive 为 Published Work browse / sort / pagination 的互补边界。
- 记录 8 个 P2 design / accessibility findings；没有要求 Step02 前先改代码的 P0 / P1 阻塞。

Step01 output:

- `UX-06E-SEARCH-DESIGN-CONTRACT.md`

Frozen Step01 boundary:

- Search 只查询 Published Work 与具有公开 Published Work 的 Author。
- Search 不改变数据权限、不改变 Published-only、不展示 Draft 或 private identity。
- Search 不承担 Archive pagination、Studio management 或 Reading immersion。
- Search 不承担 recommendation、ranking、Feed、Marketplace、advanced filtering 或 search history。
- Step02 只能做 route-local Layout / visual hierarchy / states / responsive upgrade。
- Database、Supabase、RLS、RPC、Migration、Gateway、Service、Repository、query fields、matching、ordering、result cap 与 pagination architecture 均未授权修改。

Step02 recommended scope:

- 建立 Orientation → Primary Query → Query Context → Work Results → Author Results → Recovery 的页面节奏。
- 移除 `Search MVP` 等内部工程语言，建立 Reader-facing 主动查询语气。
- 增加 visible input label，并保持 GET、`q`、query retention 与 80-character contract。
- 仅使用现有 Work / Author fields 优化信息层级，可使用现有 `publishedAt`，不得新增字段。
- 区分 Work 与 Author result treatment，补足 44px entries、Empty Archive recovery、Search-shaped Loading 与单一 Error announcement owner。
- 验证 1440 / 1280 / 768 / 390、Light / Dark、keyboard、focus、long content 与 zero overflow。

Step01 decision:

- Search Ready for Step02 = YES。
- Product Owner 已通过后续 Mission 授权确认 Step01 验收。

Step02 completed scope:

- 建立 Orientation → Query → Query Context / State → Work Results → Author Results 的 route-local 页面节奏。
- 增加 visible label，保留 GET `q`、80-character、normalization 与 query retention。
- 使用既有 Work / Author fields 优化信息层级；没有新增字段或改变 matching、ordering、result cap。
- 区分 Work / Author result treatment，并将主要 entry 补足为至少 44px。
- 为 Initial / Empty 增加 Archive / Homepage recovery；Loading 保留 Search shape；Error 使用单一 announcement owner。
- 通过 1440 / 1280 / 768 / 390、Light / Dark、Guest / Reader / Author、Published-only、Draft isolation 与 zero browser error QA。
- SE-AUDIT-001 至 SE-AUDIT-008 均已解决；P0 / P1 为 0。

Step02 output:

- `UX-06E-STEP02_ACCEPTANCE.md`

Step02 boundary:

- 仅修改 Search route-local UI / CSS 与 Loading / Error presentation。
- Database、Supabase schema、RLS、RPC、Migration、Auth、Permission、Gateway、Service、Repository、query contract、dependency 与 deployment 均未改变。
- `pnpm validate`、167 / 167 workspace tests、Web 79 / 79 与 Web / Admin / Docs production builds 通过。
- Search Layout Ready for Step03 = YES。
- Product Owner 已通过独立 Mission 授权并启动 Step03，视为 Step02 已验收。

Step03 completed QA:

- 复验 Initial、Valid Query、Empty、Invalid、80 / 81-character、Loading、Error、Work Results 与 Author Results。
- 复验 GET `q`、empty q、query retention、NFKC / whitespace normalization。
- 通过 1440 / 1280 / 768 / 390、Light / Dark、focus、heading、named regions、44px 与 zero overflow。
- 通过 Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、Work / Author entries 与 zero browser error。
- 发现并修复 Error clear 的同 route error-boundary retention：只将 `search/error.tsx` 的清空入口改为原生完整导航。
- Database、Supabase schema、RLS、RPC、Migration、Auth、Permission、Gateway、Service、Repository、query contract、dependency 与 deployment 均未改变。

Step03 output:

- `UX-06E-STEP03_ACCEPTANCE.md`

Step03 gate:

- P0 = 0，P1 = 0。
- Web lint / typecheck / 79 tests / build 与 `pnpm validate`、167 / 167 workspace tests、全部 production builds 通过。
- Search Ready for Step04 = YES。
- Product Owner 已通过独立 Mission 授权并启动 Step04，视为 Step03 已验收。

Step04 completed Release QA:

- 确认 Search 最终定位为 `Active Story & Author Discovery`，Archive 继续承担 Published Work browse / sort / pagination。
- 复核 Initial、Valid Query、Empty、Invalid、80 / 81-character、Loading、Error、Work / Author Results、Mobile、Light / Dark。
- 复核 GET `q`、URL retention、NFKC / whitespace normalization、既有 matching / ordering / result cap，不修改查询合同。
- 通过 1440 / 1280 / 768 / 390、44px、focus、heading、regions、label、zero overflow 与 clean-session console 0。
- 通过 Guest / Reader / Author、Published-only、Draft Work / Chapter isolation、Work / Author routes。
- SE-AUDIT-001 至 SE-AUDIT-008 与 Step03 Error clear finding 均保持 Closed；P0 = 0，P1 = 0。
- Step04 未修改产品实现、数据、权限、Search query contract、dependency 或 deployment configuration。

Step04 output:

- `UX-06E-STEP04_ACCEPTANCE.md`

Step04 release gate:

- Browser Release QA：PASS。
- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Search Ready for Release = YES；Product Owner Final Decision：PASS。
- UX-06E Search Track 已完成并关闭。
- 不得继续优化 Search，不得自动进入新 UX Track、发布动作或额外 Search 工作；等待 Product Owner 提供下一条明确 Mission。

## 21. UX-06F — Author Profile Track

Status: PASS — Completed / Release Ready / Product Owner Accepted

Current identity:

- Literary Creator Identity Space。
- 公开作者身份、bio 与 Published Works body of work 的承接页。

Step01 completed audit:

- 审计 `/author/[slug]` route、public Author eligibility、Guest read、Follow state 与 self state。
- 审计 identity、bio、avatar initials、作品 / 关注者 / 关注中 counts、Published Works、Empty、Loading、Error 与 Not Found。
- 确认 `get_public_author_profile` 只聚合 `w.status = 'published'`；Draft Work / Chapter 不进入 Profile。
- 验证 Archive / Search / Work Detail → Author Profile 与 Author Profile → Work Detail 路径。
- 通过 Guest / Reader / Author、1280 / 390、zero overflow 与 browser console error 0。
- Reader 当前「已关注」状态可确认；Author self Profile 不显示 Follow action；本 Mission 未触发关注数据写入。
- 记录 10 个 P2 design / accessibility / QA findings；没有要求 Step02 前先改代码的 P0 / P1 阻塞。

Step01 output:

- `UX-06F-AUTHOR-PROFILE-DESIGN-CONTRACT.md`

Frozen boundary:

- Author Profile 是公开 creator identity 与 Published Works body of work，不是 normal user / social profile。
- 不承担 Studio management、Reader Shelf、Search query、Archive pagination 或 Reading immersion。
- 不承担 recommendation、ranking、Feed、Marketplace、follower list、messages、comments 或 social plaza。
- Step02 只能做 route-local layout、hierarchy、states、touch targets 与 responsive polish。
- Follow / Unfollow business、Database、Supabase、RLS、RPC、Migration、Gateway、Service、Repository、data fields、query contract 与 permission 均未授权修改。

Step02 recommended direction:

- 建立 Public Identity → Bio → quiet Relationship → Published Works → Body of Work → Recovery 节奏。
- 降低 avatar / social counts / generic card dominance，保持 Follow 业务不变。
- 让 Work title 成为 44px primary entry，使用现有 `publishedAt`，降低重复 self-attribution。
- 完善 Empty recovery、Profile-shaped Loading、single-owner Error 与 long-content safety。
- 验证四档 viewport、themes、keyboard、focus、roles、Published-only 与 Draft isolation。

Step01 gate:

- Browser baseline：PASS；P0 = 0，P1 = 0。
- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Author Profile Ready for Step02 = YES。
- Step02 后续已通过独立 Mission 授权并完成。

Step02 completed scope:

- 建立 Public Identity → Bio → Quiet Relationship → Published Works Context → Body of Work → Recovery 页面节奏。
- 降低 avatar、counts、Follow 与 generic card dominance；保持 Follow / Unfollow 业务完全不变。
- Work title 与「查看作品」均成为 44px Work Detail entry；展示既有 `publishedAt`，移除重复作者 self-link。
- 完成 Empty Archive / Search recovery、Profile-shaped Loading 与 single-owner Error recovery。
- 通过 Guest / Reader / Author、cross-page entries、Published-only、Draft isolation、four viewports、themes、focus 与 console 0。

Step02 output:

- `UX-06F-STEP02_ACCEPTANCE.md`

Step02 finding disposition:

- AP-AUDIT-001–008、010：Closed。
- AP-AUDIT-009：implementation protection complete；现有 Fixture 的极端长内容运行态证据缺口记录为 `AP-QA-001`，建议 Step03 复核，不是产品阻塞或数据扩张授权。
- P0 = 0，P1 = 0；无 Author Profile post-Beta product finding。

Step02 gate:

- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Author Profile Layout Ready for Step03 = YES。
- Step03 后续已通过独立 Mission 授权并完成。

Step03 completed scope:

- 复验 Public Identity、Bio、Quiet Relationship、Published Works Context、Body of Work 与 Recovery。
- 实际验证 Guest、Reader followed / unfollowed / pending、Author self 与 Follow Fixture 状态恢复。
- 复验 Empty / Error contracts，并在真实 client navigation 捕获 Profile-shaped Loading。
- 复验 Archive / Search / Work Detail 往返、Published-only 与 Draft Work / Chapter isolation。
- 复验 1440 × 900、1280 × 800、768 × 1024、390 × 844、Light / Dark、keyboard、focus 与 44px targets。

Step03 output:

- `UX-06F-STEP03_ACCEPTANCE.md`

Step03 finding status:

- AP-AUDIT-001–008、010：Closed，未发现回归。
- AP-AUDIT-009 implementation protection：PASS。
- AP-QA-001：保留为非阻塞 QA Fixture 增强项；不构成 Step04 或 Beta 阻塞。
- Author Profile P2 / post-Beta product finding = 0。
- P0 = 0，P1 = 0。

Step03 gate:

- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Product implementation changes：NONE。
- Author Profile Ready for Step04 = YES。
- Step04 后续已通过独立 Mission 授权并完成。

Step04 completed scope:

- 将 Step01 Design Contract、Step02 Layout Upgrade 与 Step03 States QA 纳入最终 Release baseline。
- 最终确认 Literary Creator Identity Space 定位与 Public Identity → Bio → Quiet Relationship → Published Works Context → Body of Work → Recovery 结构。
- 最终复验 Guest、Reader Followed / Unfollowed / Pending、Author self 与 Follow Fixture 稳定状态恢复。
- 最终复验 Empty / Error contracts、真实 Loading、Archive / Search / Work Detail 往返、Published-only 与 Draft isolation。
- 最终复验 1440 / 1280 / 768 / 390、Light / Dark、semantics、focus、44px targets 与 browser console 0。

Step04 output:

- `UX-06F-STEP04_ACCEPTANCE.md`

Step04 final finding status:

- P0 = 0，P1 = 0。
- Author Profile product P2 / post-Beta finding = 0。
- AP-QA-001 保留为 non-blocking QA Fixture enhancement，不构成 Release / Beta 阻塞。

Step04 release gate:

- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Product implementation changes：NONE。
- Author Profile Ready for Release = YES。
- Product Owner Final Decision：PASS；Author Profile Ready for Release = YES。
- UX-06F Author Profile Track 已完成并关闭，不得继续优化 Author Profile。

## 22. UX-06G — Work Detail Track

Status: Step04 Completed / Awaiting Product Owner Final Review

Current position:

- Literary Work Decision Space。
- Archive / Search / Author Profile 与 Reading 之间的作品理解和阅读决策页。

Step01 completed audit:

- 审计 `/works/[slug]` route、Session / `archive:read` gate、Work identity、summary、author attribution、tags、Published context、Continue / Start、Download 与 Chapter list。
- 审计 No Chapters、No Summary implementation、Loading、Error、Not Found 与 390px mobile。
- 验证 Archive / Search / Author Profile → Work Detail、Work Detail → Author Profile / Reading。
- 验证 Guest 登录边界、Reader / Author access、Published-only、Draft Work / Chapter isolation 与 page-local Studio action = 0。
- 通过 1280 / 390 zero overflow、single H1、semantic Chapter list 与 browser console error 0。
- 记录 10 个 P2 design / accessibility / state / data-contract findings；P0 = 0，P1 = 0。

Step01 output:

- `UX-06G-WORK-DETAIL-DESIGN-CONTRACT.md`

Frozen boundary:

- Work Detail 是作品理解与阅读决策页，不是 Archive browse、Search query、Author aggregation、Reading immersion 或 Studio management。
- 当前 Guest → Sign-in 与 `archive:read` capability gate 保持不变；“公开作品详情”不授权修改 Auth / Permission。
- Published-only、Draft isolation、Chapter order、Continue Reading、Download、Gateway、Service、Repository 与 query contract 保持不变。
- 当前合同没有可展示的 rating、warnings、language、completion 或 category label；Step02 不得伪造或扩张 metadata。
- 不承担 recommendation、ranking、Feed、Marketplace、comments、collection plaza 或 social features。

Step02 recommended direction:

- 建立 Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery 节奏。
- 降低 generic `reading-card / stat-card` inventory 感，仅做 Work route-local presentation。
- 提升 summary、author attribution 与 reading decision 层级；明确 Continue / Start / Download 主次。
- 将 Author、return 与 recovery entries 提升到至少 44px。
- 使用现有 `publishedAt / updatedAt / chapter count / tags`，不增加字段。
- 完善 no-summary / no-chapter fallback、Work-shaped Loading、route-local Error / Not Found recovery。
- 验证四档 viewport、Light / Dark、keyboard、focus、long content、roles 与 Draft isolation。

Step01 gate:

- Localhost Fixture / role / route QA：PASS；P0 = 0，P1 = 0。
- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Product implementation changes：NONE。
- Work Detail Ready for Step02 = YES。
- Product Owner 已通过独立 Mission 授权并启动 Step02，视为 Step01 已进入冻结实施基线。

Step02 completed scope:

- 建立 Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery。
- 使用现有字段强化作品身份、summary、public author attribution 与 Published context，不扩张 metadata。
- 明确 Continue / Start / Download 主次，保留 history、first chapter、download 与所有 href 行为。
- 新增 route-local Loading、Error、Not Found 与 no-summary / no-chapter presentation。
- 将 Work route 的 Author、breadcrumb、reading、Chapter 与 recovery entries 提升到至少 44px。
- 增加 long-content wrap protection，并完成 1440 / 1280 / 768 / 390、Light / Dark、semantics 与 zero-overflow QA。

Step02 output:

- `UX-06G-WORK-DETAIL-DESIGN-CONTRACT.md` Implementation Record。
- `UX-06G-STEP02_ACCEPTANCE.md`。

Step02 boundary:

- Database、Supabase、Migration、RLS、RPC、Gateway、Service、Repository 与 query contract 未修改。
- Auth、Permission、Guest gate、login return、Published-only、Draft isolation 未修改。
- Reading History、Chapter order、Start selection、Download 与 Reading behavior 未修改。
- Archive、Search、Author Profile、Reading、Studio 与 shared Header 未修改。
- Work Detail 不承担 browse、query、author aggregation、immersive reading、management、recommendation、ranking、Feed、Marketplace、comments 或 social features。

Step02 finding disposition:

- WD-AUDIT-002–008 在 presentation 范围内关闭。
- WD-AUDIT-001 与 WD-AUDIT-009 作为 Auth / data-contract 边界保留，不是产品缺陷。
- WD-AUDIT-010 implementation protection 完成；极端长内容 Fixture 缺口转为 non-blocking `WD-QA-001`。
- P0 = 0，P1 = 0，remaining product P2 = 0。

Step02 gate:

- Guest / Reader / Author、cross-route entries、Start / Continue / Download、Published-only、Draft isolation：PASS。
- Default、No Chapters、Loading、Not Found、Light / Dark、1440 / 1280 / 768 / 390、console 0：PASS。
- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Product implementation changes：YES；Work Detail route-local presentation only。
- Work Detail Layout Ready for Step03 = YES。
- Product Owner 已通过独立 Mission 授权并启动 Step03，视为 Step02 已进入冻结 QA 基线。

Step03 completed QA:

- 六段结构 Orientation → Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery：PASS。
- Default、No Published Chapters、Loading / Error source contract、Not Found、Mobile：PASS。
- Start、Continue、Download、Author Profile、Reading、Archive / Search / Reader Library recovery：PASS。
- Guest、Reader、Author、Auth / Permission frozen boundary、Published-only、Draft Work / Chapter isolation：PASS。
- `reading-history-client.tsx` Step02 diff 确认仅限 Continue Reading presentation；history data logic、selection 与 Reading 未改变。
- 1440 / 1280 / 768 / 390 zero overflow、minimum target 44px、Light / Dark、semantics、focus-visible、console 0：PASS。
- Current long-form Fixture 与 wrap protection PASS；极端长内容覆盖继续记录为 WD-QA-001。

Step03 finding status:

- WD-AUDIT-001：Accepted / Frozen；不阻塞 Step04。
- WD-AUDIT-009：Accepted / Frozen；不阻塞 Step04。
- WD-AUDIT-010：PASS。
- WD-QA-001：Retained / Non-blocking Fixture enhancement。
- Step02 remaining product issues = 0；P0 = 0，P1 = 0。

Step03 output:

- `UX-06G-WORK-DETAIL-DESIGN-CONTRACT.md` Step03 QA Record。
- `UX-06G-STEP03_ACCEPTANCE.md`。

Step03 gate:

- `pnpm qa:fixture`、local credential check：PASS；localhost only，未输出密码。
- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Product implementation changes：NONE；QA / documentation-only Mission。
- Work Detail Ready for Step04 = YES。
- Product Owner 已通过独立 Mission 授权并启动 Step04，视为 Step03 已进入冻结 Release baseline。

Step04 final acceptance:

- Step01 Work Detail UI Audit & Design Contract：PASS。
- Step02 Work Detail Layout Upgrade：PASS。
- Step03 Work Detail States & Responsive QA：PASS。
- Work Detail 最终定位：Literary Work Decision Space。
- 最终结构：Work Orientation → Story Premise → Author / Published Context → Reading Decision → Chapter Overview → Recovery。
- Default、Guest、Reader、Author、No Chapters、Loading、Error contract、Not Found、Long content、Mobile、Light / Dark：PASS。
- Start、Continue、Download、Reading、Author、discovery 与 recovery routes：PASS。
- Published-only、Draft Work / Chapter isolation、page-local Studio action = 0、private identity leak = 0：PASS。
- 1440 / 1280 / 768 / 390、zero overflow、minimum 44px、semantics、focus 与 console 0：PASS。
- `reading-history-client.tsx` 边界最终确认仅限 Continue Reading presentation；history data logic 与 Reading 未改变。

Step04 final findings:

- WD-AUDIT-001：Accepted / Frozen；不阻塞 Release。
- WD-AUDIT-009：Accepted / Frozen；不阻塞 Release。
- WD-AUDIT-010：PASS。
- WD-QA-001：Retained / Non-blocking Fixture enhancement。
- Step02 remaining product issues = 0；P0 = 0，P1 = 0。

Step04 output:

- `UX-06G-WORK-DETAIL-DESIGN-CONTRACT.md` Release Acceptance record。
- `UX-06G-STEP04_ACCEPTANCE.md`。

Step04 gate:

- `pnpm qa:fixture`、local credential check：PASS；localhost only，未输出密码。
- Web lint / typecheck / 79 tests / build：PASS。
- 完整 `pnpm validate`、167 / 167 workspace tests、Web / Admin / Docs production builds：PASS。
- `git diff --check`：PASS。
- Product implementation changes：NONE；Release QA / documentation-only Mission。
- Work Detail Ready for Release = YES。
- Product Owner Final Acceptance：PASS；UX-06G Work Detail Track 已完成并关闭。

## 18. UX-06H — Homepage Track

Status: Step04 Slim Completed / Awaiting Product Owner Final Review

Objective:

在 UX-06B 已接受 Homepage baseline 之上，重新审计 Homepage 作为品牌门面、公共发现起点、Latest Published Works 邀请、Reader return 与 Auth 入口的职责，并冻结后续受控升级合同。

Step01 completed:

- 审计 `/` Hero、Discovery principles、Latest Works、Reader Return、Auth、Closing、shared Loading / Error 与 Footer。
- 冻结 Homepage 定位为 Quiet Editorial Harbor Entrance。
- 冻结 `Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery` 建议节奏。
- 确认 Homepage 使用既有 Public Browse Gateway、`newest`、最多三项与 `BrowseWork`；不是 recommendation、ranking 或 Feed。
- 确认 Archive / Search / Work Detail / Auth routes、Guest / Reader / Author、Published-only 与 Draft Work / Chapter isolation。
- 确认 1280 / 390、Light / Dark、single H1、five labelled regions、zero overflow 与 browser console 0。
- 记录 HP-AUDIT-001–010：access-state CTA、positioning、mixed language、44px targets、duplicate Work entry、Auth journey、shared states、Empty recovery、misleading `/author` destination 与 long-content coverage。
- P0 = 0，P1 = 0；所有 finding 为 Step02 可控 presentation 或 frozen shared-state boundary。

Step01 output:

- `UX-06H-HOMEPAGE-DESIGN-CONTRACT.md`。
- 同步 `DESIGN_STATUS.md`、`UX_PHASE_ROADMAP.md`、`.ai/PROJECT_STATUS.md`、`.ai/MEMORY.md`、`.ai/CHANGELOG.md`。

Step01 frozen boundary:

- 不修改 Homepage 产品实现、data fetch、Gateway、Service、Repository、query、sort 或三项上限。
- 不修改 Auth、Invitation、Permission、Published-only、Draft isolation、Database、Supabase、RLS、RPC 或 Migration。
- 不修改 shared Header / Footer、root Loading / Error architecture 或其他页面。
- 不新增 recommendation、ranking、Feed、Marketplace、personalization、filter、search form 或 author directory。

Step01 gate:

- Local QA Fixture / credentials check：PASS；localhost only，未输出密码。
- Homepage default、Archive / Search / Work / Auth、Guest / Reader / Author、Published-only、Draft isolation：PASS。
- 1280 / 390、Light / Dark、zero overflow 与 browser console 0：PASS。
- Web lint / typecheck / 79 tests / build、完整 `pnpm validate`、167 / 167 workspace tests、全部 production builds 与 `git diff --check`：PASS。
- Product implementation changes：NONE；documentation-only Mission。
- Homepage Ready for Step02 = YES。
- Step01 design contract is the frozen Step02 baseline。

Step02 completed:

- 将 `/` 固化为 Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery。
- Hero 只保留 Archive primary 与 Search secondary，不再静态展示「登录 Reader」；shared Header 继续负责真实 account / capability state。
- Latest Works 继续使用既有 Public Browse Gateway、`newest`、最多三项与 `BrowseWork`，每项仅保留一个 Work Detail 主入口。
- 使用既有 Reader Library、Sign-in、Sign-up、Access、Archive 与 Search routes 建立 return / recovery，不修改 Auth / Invitation behavior。
- 移除 misleading `/author` root entry；Homepage page-local Studio actions 保持 0。
- 补齐 Empty recovery、44px targets、focus-visible、长文本保护与 1440 / 1280 / 768 / 390 响应式呈现。

Step02 finding result:

- HP-AUDIT-001–006、008–009：Closed。
- HP-AUDIT-007：Frozen shared root state boundary；non-blocking。
- HP-AUDIT-010：Protection PASS。
- HP-QA-001：极端长 author / summary / continuous token Fixture coverage；non-blocking enhancement。
- P0 = 0，P1 = 0。

Step02 gate:

- Guest / Reader / Author、Archive / Search / Work Detail / Auth、Published-only、Draft Work / Chapter isolation：PASS。
- 1440 / 1280 / 768 / 390、Light / Dark、keyboard focus、44px、semantics、zero overflow、browser console 0：PASS。
- Web lint / typecheck / 79 tests / build、完整 `pnpm validate`、167 / 167 workspace tests、全部 production builds 与 `git diff --check`：PASS。
- Product implementation changes：Homepage route-local React presentation / CSS only。
- Data、Auth、Permission、Gateway、Service、Repository、query、Database、Supabase、RLS、RPC、Migration changes：NONE。
- Homepage Layout Ready for Step03 = YES。
- Step02 implementation is the frozen Step03 Slim QA baseline。

Step03 Slim completed:

- 按 UX 收口瘦身模式只验证 Step02 直接影响范围，不重复深度审计已 Release Ready 页面。
- Brand Orientation、Discovery Paths、Latest Published Works、Reader Return / Access、Quiet Recovery：PASS。
- Archive、Search、Work Detail、Sign-in、Sign-up、Reader Library 与 Access entry smoke：PASS。
- Guest / Reader / Author：PASS；Author shared Header Studio = 1，Homepage page-local Studio = 0。
- Published-only、Draft Work / Chapter isolation：PASS；Gateway、`newest`、三项上限与 `BrowseWork` 不变。
- 1440 / 1280 / 768 / 390、Light / Dark、44px、keyboard focus、semantics、zero overflow 与 browser console 0：PASS。
- HP-AUDIT-007 继续 Frozen；HP-QA-001 继续作为 non-blocking Fixture enhancement。
- Stale chunked-cookie warning 本轮未复现；登录、退出、角色能力、Published-only 与 Draft isolation 均正常。
- P0 = 0，P1 = 0，Step02 regression = 0；未触发 Allowed Fixes，product implementation / data layer changes = NONE。
- Web checks、完整 `pnpm validate`、167 / 167 workspace tests、全部 production builds 与 `git diff --check`：PASS。
- Homepage Ready for Step04 = YES。
- Step03 Slim QA is the frozen Step04 Release baseline。

Step04 Slim completed:

- Step01 Homepage UI Audit & Design Contract：PASS。
- Step02 Homepage Layout Upgrade：PASS。
- Step03 Homepage States & Responsive QA Slim：PASS。
- 固化 Homepage 为 Quiet Editorial Harbor Entrance。
- 固化 Brand Orientation → Discovery Paths → Latest Published Works → Reader Return / Access → Quiet Recovery。
- 固化 Archive / Search / Work / Auth entries、Guest / Reader / Author、Published-only 与 Draft isolation QA evidence。
- 固化 1440 / 1280 / 768 / 390、Light / Dark、Accessibility 与 browser console 0 evidence。
- Shared Header / Footer unchanged；Root Loading / Error Frozen；Auth / Permission / Invitation / login return unchanged。
- HP-AUDIT-007 Frozen / non-blocking；HP-QA-001 non-blocking Fixture enhancement；stale chunked-cookie warning 无实际功能影响。
- P0 = 0，P1 = 0。
- Product implementation / data layer changes：NONE；documentation / Release judgment only。
- Web checks、完整 `pnpm validate`、167 / 167 workspace tests、全部 production builds 与 `git diff --check`：PASS。
- Homepage Ready for Release = YES。
- 等待 Product Owner 最终验收；不继续优化 Homepage，不启动 UX-06I 或新 UX Track。

## 19. UX-06I — 全局壳层与导航

状态：PASS / Product Owner Accepted / Closed

已完成：

- 保持 Desktop 的 Brand / Primary Navigation / Utility & Account 三分区结构。
- 将 Archive、Search 与 capability-gated Studio 导航推导提取为可测试纯函数。
- 为 767px 以下新增默认收起、正常文档流内展开的移动端主要导航。
- Desktop 与 Mobile 复用同一导航数据源，Reader 不显示 Studio，Author 显示 Studio。
- 右侧主题与账号区域增加“显示与账号”组语义。
- Guest、Reader、Author、Homepage、Archive、Search、Work Detail、Reading、Author Profile、Studio 与 390 / 1280 回归通过。
- 未修改 Auth、Permission、Role、Published-only、Draft isolation、Database、Supabase、Migration、RLS、RPC、页面内容或 Studio 工作流。

输出：

- `UX-06I-GLOBAL-SHELL-NAVIGATION.md`。
- `UX-06I-STEP_ACCEPTANCE.md`。

结论：UX-06I = PASS；Global Shell / Navigation = Accepted；Product Owner Acceptance = PASS；P0 = 0、P1 = 0。移动端当前路由高亮作为非阻塞后续优化项保留。任务已关闭，不进入下一项 UX 任务。

## 20. UX-06J — Release UI Sweep / V1 UI Consistency

状态：PASS / Product Owner Accepted / Closed

已完成：

- 审计 Homepage、Archive、Search、Work Detail、Published Reading、Author Profile、Studio Entry / Overview 与 Auth。
- 验证 1280 Desktop、390 × 844 Mobile、Light / Dark、44px targets 与零横向溢出。
- 收敛 Studio Mobile 内部导航高度，并将四个 Studio 入口提升到 44px。
- 清理 Auth 工程阶段标签，并将 Sign-in / Sign-up 互链提升到 44px。
- Guest、Reader、Author、Reader Studio denial 与 Author Studio access 回归通过。
- 保持 UX-06H Homepage 与 UX-06I Global Shell 不回退。
- 未修改 Database、Supabase、Migration、RLS、RPC、Auth logic、Role、Published-only 或页面业务逻辑。

输出：

- `UX-06J-RELEASE-UI-SWEEP.md`。
- `UX-06J-STEP_ACCEPTANCE.md`。

结论：UX-06J = PASS；Release UI Sweep / V1 UI Consistency = Accepted；Product Owner Acceptance = PASS；P0 = 0、P1 = 0。非阻塞后续项为移动端当前路由高亮、Root Loading / Error 共享架构边界与极端长连续文本 Fixture coverage。任务已关闭，不进入部署、新功能或下一项任务。
