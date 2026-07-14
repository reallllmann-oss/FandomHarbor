# Fandom Harbor Color System Intelligence

Status: Proposed for UX-03 Design System Intelligence
Depends on: `BRAND_EXPERIENCE.md`, `VISUAL_DNA.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`
Scope: Color philosophy and semantic direction only; not palette values, token implementation, CSS, Tailwind or visual QA

## 1. Purpose

本文定义 Fandom Harbor V1 的 Color System Intelligence。

本阶段只定义 semantic color direction、情绪意义和使用规则，不指定具体色值，不修改 `docs/06_Design_System/COLOR.md`、`DESIGN_TOKENS.md`、CSS、Tailwind 或代码。

## 2. Color Philosophy

Fandom Harbor 的颜色应像安静的私域文学港湾：低噪音、高可读、温和、有边界。

Color should:

- Support reading comfort.
- Clarify hierarchy.
- Carry semantic meaning.
- Build trust.
- Avoid feed, game, SaaS and commerce energy.

Color should not:

- Become decoration for its own sake.
- Create rainbow tag taxonomy.
- Make warnings feel punitive.
- Push popularity or urgency.
- Replace text, icon or structure for state.

Why: Fandom Harbor 同时承载阅读、预警、权限、保存、发布和治理状态。颜色必须帮助理解，而不是制造刺激。
Impact: Reader 更安心，Author 更信任保存与发布状态，Admin 更容易判断风险。
Application: Reading themes、Archive metadata、Warnings、Studio states、Permission pages。

## 3. Semantic Color Directions

These names are conceptual directions for UX-03. They are not token names and not final palette values.

### 3.1 Harbor Night

Meaning: depth, privacy, protected quiet, long reading at night.

Use direction:

- Deep text or dark surface direction.
- Dark reading mode direction.
- Serious state framing where trust matters.

Why: The brand metaphor is a private harbor, not a public plaza.
Impact: Creates a sense of protected depth without becoming heavy or theatrical.
Application: Dark mode, footer-like quiet regions, serious permission context.

### 3.2 Paper Surface

Meaning: reading surface, calm editorial base, prose comfort.

Use direction:

- Primary reading background direction.
- Work detail content surface.
- Long-form text areas.

Why: The product exists for works that should feel readable and preserved.
Impact: Reduces fatigue and supports literary calm.
Application: Reading Page、Work Detail、Article Reading。

### 3.3 Morning Light

Meaning: gentle entrance, clarity, welcome, non-commercial warmth.

Use direction:

- Homepage threshold.
- Empty states.
- Invitation and onboarding moments.

Why: Entry should feel calm and invited, not conversion-driven.
Impact: Visitor and new Reader can understand the archive without pressure.
Application: Homepage、Gate、empty states。

### 3.4 Ink Stone

Meaning: primary text authority, readable foreground, literary seriousness.

Use direction:

- Main text hierarchy.
- Work titles.
- Critical metadata labels.

Why: Text is the brand carrier.
Impact: Typography feels grounded and serious.
Application: Titles、body text、metadata labels。

### 3.5 Tidal Teal

Meaning: deliberate action, calm movement, navigational confidence.

Use direction:

- Primary actions.
- Focused navigation cues.
- Continue reading and publish-ready movement.

Why: Actions should feel intentional, not loud.
Impact: Users can identify next action without urgency manipulation.
Application: Buttons、links、current navigation、focus-adjacent affordances。

### 3.6 Lantern Amber

Meaning: caution, rating / warning attention, warm notice.

Use direction:

- Warning context.
- Important but non-punitive alerts.
- Reading boundary notices.

Why: Warnings should protect reader consent without shaming.
Impact: Users see important content boundaries clearly and calmly.
Application: Rating / warning display、Studio validation notices。

### 3.7 Safe Mooring

Meaning: saved, stable, published, complete, successful recovery.

Use direction:

- Save success.
- Published state.
- Recovery complete.

Why: Author and Reader need clear confidence signals.
Impact: Reduces uncertainty after save, publish or recovery.
Application: Studio save state、Publish success、Bookmark state。

### 3.8 Red Signal

Meaning: destructive, error, blocked, irreversible risk.

Use direction:

- Destructive confirmation.
- Error state.
- Permission or security block when necessary.

Why: Danger should be reserved and meaningful.
Impact: Users do not become numb to warning colors.
Application: Delete future flow、errors、security-sensitive states。

## 4. Primary Color Direction

Primary color direction should represent deliberate product action and navigational confidence.

Recommended semantic direction: Tidal Teal or another calm harbor-linked accent.

Why: Primary action should move users through archive tasks without marketing energy.
Impact: Continue Reading, Save, Publish and Sign In feel intentional but not aggressive.
Application: Buttons, key links, selected navigation, focus reinforcement.

Non-decision:

- No hue, hex, RGB or token value is selected.

## 5. Secondary Color Direction

Secondary color direction should support surfaces, metadata groups and quiet hierarchy.

Recommended semantic directions:

- Paper Surface.
- Morning Light.
- soft neutral editorial surfaces.

Why: Secondary colors carry the reading and archive environment.
Impact: Pages can separate content groups without card-heavy dashboard styling.
Application: Work detail sections, Archive groups, Studio form sections.

## 6. Accent Color Direction

Accent color should be used sparingly and semantically.

Accent categories:

- Tidal Teal: action / movement.
- Lantern Amber: caution / warning.
- Safe Mooring: success / stability.
- Red Signal: danger / destructive.

Why: Accent overload creates visual noise and weakens state meaning.
Impact: Users understand states faster and trust system feedback.
Application: Warnings, save states, publish states, permission and error states.

## 7. Background Direction

Background should support reading and editorial rhythm.

Direction:

- Reading surfaces should be calm and low contrast against page chrome.
- Discovery surfaces should allow metadata grouping without dense dashboard blocks.
- Studio surfaces should separate tasks and states without feeling like admin software.

Why: Background color affects reading fatigue and perceived product category.
Impact: Fandom Harbor feels like an archive and reading product, not a dashboard.
Application: Reading Page、Archive、Studio。

## 8. Text Hierarchy

Text hierarchy should use contrast, weight, size and spacing before relying on color.

Direction:

- Primary text: strong enough for long reading.
- Secondary text: clear but quieter for metadata and support.
- Muted text: only for genuinely supporting information.
- Warning text: visible and accessible with icon / label / structure.

Why: Color-only hierarchy fails accessibility and weakens semantic consistency.
Impact: Readers can scan safely and read comfortably.
Application: Work cards、Warnings、Metadata、Errors、Studio help text。

## 9. Usage Rules

- Every color role must have semantic purpose.
- Warning, rating, moderation and validation must not rely on color alone.
- Tags should not become rainbow-coded taxonomy.
- Primary color should not be used as decoration.
- Danger color should be rare and reserved.
- Dark mode should support reading comfort, not novelty.
- Contrast must be validated before implementation.
- Existing `docs/06_Design_System/COLOR.md` remains authoritative for current token ownership.

## 10. Future Usage

UX-04 should use this document to define page mood and hierarchy. UX-05 should use it to propose Figma semantic styles. UX-06 should use it to review whether final implementation preserves meaning, contrast and brand restraint.

## 11. Non-Decisions

This document does not decide:

- Hex values.
- CSS variables.
- Tailwind theme values.
- Design Token names.
- Light / dark palette implementation.
- Figma color style names.
- Component colors.
