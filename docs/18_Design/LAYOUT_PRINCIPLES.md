# Fandom Harbor Layout Principles

Status: Proposed for UX-03 Design System Intelligence
Depends on: `INFORMATION_ARCHITECTURE.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `VISUAL_DNA.md`, `UX_PRINCIPLES.md`
Scope: Layout principles only; not page layout, component layout, CSS, Tailwind or implementation

## 1. Purpose

本文定义 Fandom Harbor V1 的 layout intelligence：空间哲学、内容节奏、密度规则、响应式思考。

本文件不创建页面布局，不定义 grid、breakpoint、component、CSS 或 Tailwind。现有 `docs/06_Design_System/GRID.md`、`SPACING.md`、`RESPONSIVE_RULES.md` 和 `.ai/STYLE_GUIDE.md` 仍是当前具体规则归属。

## 2. Space Philosophy

Fandom Harbor 的空间应像编辑过的文学目录和可停留的阅读空间。留白不是装饰，而是帮助用户呼吸、判断、阅读和恢复。

Core direction:

- Space should separate meaning.
- Space should protect prose.
- Space should reveal hierarchy.
- Space should reduce anxiety in Studio.
- Space should support mobile touch and safe areas.

Why: 作品归档天然信息复杂，没有空间层级会变成论坛密度或后台表格。
Impact: Reader 更容易选择和阅读，Author 更容易理解状态和操作后果。
Application: Archive、Work Detail、Reading Page、Studio。

## 3. Content Rhythm

Each task space needs a different rhythm.

| Task Space | Rhythm Direction            | Why                             | Impact                               | Application       |
| ---------- | --------------------------- | ------------------------------- | ------------------------------------ | ----------------- |
| Entry      | Calm threshold rhythm       | Users need trust before action  | Home feels invited, not commercial   | Homepage / Gate   |
| Discovery  | Scannable catalog rhythm    | Readers compare works           | Metadata can be read quickly         | Archive / Search  |
| Decision   | Editorial evaluation rhythm | Readers decide whether to start | Warnings, summary and chapters align | Work Detail       |
| Reading    | Long-form prose rhythm      | Reading is core                 | Interface recedes                    | Reading Page      |
| Return     | Private continuity rhythm   | Users resume known content      | Less friction, more trust            | Library / History |
| Creation   | Task and state rhythm       | Authors manage responsibility   | Save / publish states become clear   | Studio            |

## 4. Density Rules

### 4.1 Reading Density

Reading density should be low around prose and moderate around chapter controls.

Why: Dense UI harms long-form reading.
Impact: Reader can stay with text.
Application: Reading Page, Article Reading.

Rule direction:

- Prose should not compete with side modules.
- Chapter controls should be reachable but not dominant.
- Comments and interactions should sit downstream.

### 4.2 Discovery Density

Discovery density should be higher than reading density but lower than forum or dashboard density.

Why: Archive needs comparison and metadata, but not feed pressure.
Impact: Readers can scan without feeling crowded.
Application: Archive, Search, metadata pages.

Rule direction:

- Work cards prioritize title, author, warnings, summary and core metadata.
- Long tag groups need staged display.
- Statistics stay supporting.

### 4.3 Decision Density

Work Detail density should be structured: important metadata first, story invitation second, chapter path clear.

Why: Work Detail is the consent and commitment point.
Impact: Reader understands safety, context and entry path.
Application: Work Detail.

### 4.4 Creation Density

Studio density should be task-based, not admin-table based.

Why: Authors need control and confidence rather than backend compression.
Impact: Fewer accidental publishes, clearer save and draft state.
Application: Studio overview, editor, publish flow.

## 5. Content Width Philosophy

Content width should follow task intent.

Direction:

- Reading: constrained measure, never full-width desktop prose.
- Work Detail: editorial content width with metadata groups.
- Archive: comparison-friendly width without infinite feed behavior.
- Studio: enough width for forms and status, but not dashboard sprawl.
- Author Profile: literary profile width, not social timeline width.

Why: Width shapes emotional experience. Wide prose feels exhausting; over-constrained metadata becomes unreadable.
Impact: Each page feels designed for its task.
Application: UX-04 page redesign, UX-05 Figma frames, UX-06 visual QA.

Non-decision:

- UX-03 does not set exact max-width values, grid columns or breakpoints.

## 6. White Space Usage

White space should be intentional:

- Around prose: breathing and immersion.
- Around warnings: clarity and consent.
- Around metadata groups: scanning and grouping.
- Around forms: task separation and confidence.
- Around errors: recovery and calm.

White space should not:

- Create marketing emptiness.
- Hide key warnings or metadata.
- Inflate compact controls.
- Make Archive inefficient on mobile.

Why: Fandom Harbor needs editorial quality without losing archive utility.
Impact: Pages feel premium and useful, not sparse or crowded.
Application: Homepage、Archive、Work Detail、Studio。

## 7. Responsive Thinking

Responsive layout should be content-driven, not device-brand-driven.

Direction:

- Mobile is primary for Reader and Author core journeys.
- Reading controls must respect safe areas and not obscure text.
- Metadata collapses progressively but never hides rating or warnings.
- Studio tasks may become staged sections on smaller screens.
- Admin / governance density stays safe even if compact.

Why: Fandom Harbor’s current product goal includes mobile reading better than AO3.
Impact: UX remains understandable and safe across screen sizes.
Application: Reading Page、Archive filters、Work Detail、Studio。

Non-decision:

- UX-03 does not change breakpoints or implement responsive behavior.

## 8. Editorial Experience Rules

- Page sections should feel like editorial structure, not floating dashboard modules.
- Cards should frame repeated items, not every page region.
- Primary content deserves stable space before supporting content.
- Metadata should be grouped by meaning.
- Avoid dense sidebars inside reading experiences.
- Avoid social feed scroll rhythm for Archive.

## 9. Reading First Rules

- Reading measure wins over desktop space filling.
- Chapter context and previous / next navigation stay available.
- Global navigation should recede during reading.
- Reader preferences support comfort without becoming a settings dashboard.
- Reading history and bookmarks remain private return aids.

## 10. Future Usage

UX-04 should use these principles to shape page experience directions. UX-05 should use them to structure Figma frames. UX-06 should use them for responsive and density QA.

## 11. Non-Decisions

This document does not decide:

- Grid templates.
- Breakpoints.
- Max-width values.
- Page layouts.
- Component layouts.
- CSS, Tailwind or token changes.
- Figma layout frames.
