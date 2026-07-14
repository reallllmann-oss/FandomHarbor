# Fandom Harbor Reading Experience Guidelines

Status: Proposed for UX-03 Design System Intelligence
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `PAGE_EXPERIENCE_STRATEGY.md`
Scope: Reading experience principles only; not reading page implementation, CSS, Tailwind, component design or token changes

## 1. Purpose

Reading Page 是 Fandom Harbor 的核心体验。本文定义未来阅读体验应遵循的 typography、width、spacing、focus、distraction control 和 chapter flow 原则。

本文件不修改现有 Reader 页面，不创建 UI，不定义 CSS，不变更当前 reading variables 或 Design Tokens。

## 2. Reading Focus

Reading Page should make the story feel primary and the product feel trustworthy but quiet.

Core focus:

- Prose first.
- Chapter context second.
- Navigation and preferences supportive.
- Interactions downstream.
- Product chrome minimal.

Why: UX-01 明确 Reading Before Interface，UX-02 明确 Reading Space 是核心沉浸空间。
Impact: Reader 可以持续阅读，不被平台结构、统计或互动打断。
Application: Chapter Reading、Article Reading、future reading redesign。

## 3. Text Experience

### 3.1 Reading Typography

Direction:

- Reading typography should feel literary, stable and comfortable.
- It should support Chinese, English, mixed tags, punctuation and long paragraphs.
- It should preserve browser zoom and user preference compatibility.
- It should not feel like dashboard UI text.

Why: 长文阅读对字体节奏、行高和宽度敏感。
Impact: Reader fatigue decreases and story immersion improves.
Application: Chapter body、Article body、Reader preferences。

### 3.2 Reading Hierarchy

Required order:

1. Work / chapter identity.
2. Rating and warning context when needed.
3. Prose.
4. Chapter navigation.
5. Downstream interaction.

Why: Reader needs safety and context before immersion.
Impact: Warnings are visible without becoming punitive; prose remains primary.
Application: Work to chapter transition、Reading Page。

### 3.3 Paragraph Rhythm

Direction:

- Paragraph rhythm should be breathable.
- Indentation and spacing should not both become heavy.
- Long paragraphs should remain readable at supported widths.
- User preference changes must not break rhythm.

Why: Prose rhythm is the actual reading experience.
Impact: Reading remains comfortable across devices and preferences.
Application: Body text, user reading settings.

## 4. Width and Measure

Reading width should be constrained by reading comfort, not viewport width.

Direction:

- Desktop should add calm space, not stretch prose.
- Mobile should protect line length and avoid cramped controls.
- Supporting panels should not compress body text below comfort.

Why: Wide prose makes long reading exhausting; overly narrow prose disrupts rhythm.
Impact: Reading page feels intentional on desktop and mobile.
Application: Chapter Reading、Article Reading、UX-04 redesign。

Current rule reference:

Existing `.ai/STYLE_GUIDE.md` and `docs/06_Design_System/READER_LAYOUT_RULES.md` remain the concrete sources for current reading measure. UX-03 does not change those values.

## 5. Spacing

Reading spacing should serve orientation and calm.

Direction:

- More breathing space around title, warning context and prose start.
- Stable spacing between paragraphs.
- Clear separation between prose and chapter navigation.
- Compact but readable preference controls.
- Safe area awareness on mobile.

Why: Spacing controls emotional pace and prevents accidental interaction.
Impact: Reader feels less rushed and more oriented.
Application: Reading Page, Chapter navigation, Reader controls.

## 6. Distraction Control

Reading Page should actively suppress non-reading competition.

Forbidden or minimized:

- Popularity modules beside prose.
- Social feed blocks.
- Persistent promotional banners.
- Decorative animation around text.
- Dense global navigation competing with chapter context.
- Studio / Admin controls for ordinary readers.

Allowed but secondary:

- Bookmark.
- Reading preferences.
- Chapter list / previous / next.
- Return to Work.
- Post-reading interactions.

Why: Reading is the emotional core and must not become a general product dashboard.
Impact: Reader remains in the story.
Application: UX-04 Reading redesign, UX-06 implementation QA.

## 7. Chapter Flow

Chapter flow should make long-form movement clear and calm.

Principles:

- Previous / next chapter navigation must be explicit.
- Chapter position should be understandable.
- The current chapter should be identifiable.
- End-of-chapter state should support either continue, return, or rest.
- Chapter navigation must not depend on hover, gestures or hidden controls.

Why: Long works require orientation across sessions.
Impact: Reader can continue without friction and recover if interrupted.
Application: Chapter Reading、Work Detail、Continue Reading。

## 8. Reader Preferences

Reader preferences should support comfort without becoming a configuration product.

Direction:

- Preferences are supportive controls.
- They should be understandable without technical language.
- Changes should feel immediate and reversible.
- Preference storage remains private and non-authoritative.

Why: Readers vary in comfort needs, but reading should stay simple.
Impact: More sustainable long reading without UI complexity.
Application: Font size、line height、measure、theme controls。

## 9. Emotional Reading Principle

The reading experience should feel:

- Quiet.
- Trusted.
- Unhurried.
- Focused.
- Recoverable.
- Private.

It should not feel:

- Gamified.
- Ranked.
- Urgent.
- Feed-driven.
- Over-managed.
- Promotional.

Why: Fandom Harbor’s product success is comfortable completion and return, not engagement manipulation.
Impact: Reader builds a durable relationship with the archive.
Application: All Reading Space decisions.

## 10. Long Reading Principle

Long reading requires consistency over novelty.

Rules:

- Avoid visual changes that surprise during reading.
- Avoid motion that shifts text position.
- Avoid inserting unrelated modules between chapter content and navigation.
- Avoid aggressive prompts before the reader finishes.
- Keep recovery paths clear when content is missing or access changes.

Why: Long-form readers need trust that the reading surface will stay stable.
Impact: Reading feels safe over long sessions and repeat visits.
Application: Chapter Reading, Article Reading, Reader return flows.

## 11. Future Usage

UX-04 should use this document to redesign Reading Page experience. UX-05 should use it to create reading-focused Figma screens. UX-06 should use it as reading QA criteria.

## 12. Non-Decisions

This document does not decide:

- Reading toolbar layout.
- Typography token values.
- CSS or Tailwind.
- Component implementation.
- Sticky behavior.
- Animation timing.
- Reader preference storage changes.
- Database or business logic.
