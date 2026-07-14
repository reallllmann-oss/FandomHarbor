# Fandom Harbor Typography System Intelligence

Status: Proposed for UX-03 Design System Intelligence
Depends on: `VISUAL_DNA.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `READING_EXPERIENCE_GUIDELINES.md`
Scope: Typography direction only; not font file selection, CSS, Tailwind, token implementation or frontend changes

## 1. Purpose

本文定义 Fandom Harbor V1 的 Typography System Intelligence。

目标是说明未来 typography 如何支持阅读舒适度、文学感、品牌表达和信息层级，不在本阶段锁定具体字体文件、font stack、CSS、Design Token 或实现方案。

## 2. Typography Direction

Fandom Harbor 的 typography 应由两种能力组成：

1. Literary reading rhythm: 让正文、章节和长篇阅读舒服、稳定、可持续。
2. Editorial information hierarchy: 让标题、摘要、警告、标签、状态和操作可扫描、可理解。

Why: Fandom Harbor 同时是阅读产品和归档产品，不能只追求正文美感，也不能只追求 UI 密度。
Impact: Reader 能沉浸阅读，也能在 Archive / Work Detail 快速判断作品是否适合。
Application: Reading Page、Work Detail、Archive、Studio。

## 3. Display Typography

Display typography is reserved for brand thresholds and major editorial moments.

Use direction:

- Homepage brand entrance.
- Major page title where user needs orientation.
- Author public identity moments.
- Not for dense forms, metadata or repeated cards.

Design personality:

- Calm.
- Literary.
- Warmly authoritative.
- Never loud, gamified or promotional.

Why: Display type should create brand memory without turning pages into marketing layouts.
Impact: Fandom Harbor feels distinct while preserving reading focus.
Application: Homepage、Author Profile、major section introductions in future redesign.

Non-decision:

- No specific display font is selected in UX-03.
- No font size, line-height or token value is changed.

## 4. Heading Typography

Heading typography should create a stable editorial outline.

Hierarchy rules:

- Page heading: tells user where they are.
- Section heading: defines task or content group.
- Content heading: names works, chapters, authors or Studio objects.
- Subheading: explains context without competing with title.

Why: UX-02 defines multiple task spaces; headings must help users move through Entry, Discovery, Decision, Reading, Return and Creation.
Impact: Users understand page structure without relying on visual decoration.
Application: Archive sections、Work Detail、Reading context、Studio forms。

Rules:

- Heading hierarchy should be semantic, not purely visual.
- Work titles can be expressive but must remain readable with long mixed-language text.
- Section headings should not inflate inside compact cards or metadata groups.
- Headings must not rely on all-caps or extreme letter spacing for identity.

## 5. Body Typography

Body typography supports explanatory copy, summaries, descriptions, forms and errors.

Direction:

- Clear system sans direction for UI copy.
- Comfortable reading length for summaries.
- High contrast and stable line height.
- Plain, respectful language.

Why: Summary, warning explanations, empty states and Studio validation all carry trust.
Impact: Users can understand context and recover from states without technical friction.
Application: Work summary、Gate copy、Empty states、Studio help text、Error messages。

Rules:

- Summary text should feel like a story invitation, not product copy.
- Help text must be readable and not hidden in tiny metadata type.
- Error copy must be calm and actionable.
- UI body copy should never overpower prose in Reading Space.

## 6. Reading Typography

Reading typography is the highest-priority typography layer.

Direction:

- It should support long-form prose in Chinese, English and mixed-language fandom text.
- It may support serif / sans reading preference in the future.
- It should preserve stable measure, generous line height and comfortable paragraph rhythm.
- It should respect user scaling and browser zoom.

Why: Reading Page is the core emotional experience of Fandom Harbor.
Impact: Reader can stay with the story longer, with less fatigue and less interface awareness.
Application: Chapter Reading、Article Reading、Reader preferences。

Principles:

- Prose owns the primary column.
- Reading text must not stretch across the desktop viewport.
- Reading line height should feel breathable, not sparse.
- Paragraph rhythm should not accidentally combine heavy indentation and heavy spacing.
- Chapter title, author context and warnings must be legible before prose.
- Comments and recommendations remain typographically downstream of prose.

Current implementation note:

Existing `docs/06_Design_System/READER_LAYOUT_RULES.md` and `.ai/STYLE_GUIDE.md` remain the current concrete rule sources for reading measure, line height and reader preferences. UX-03 does not change them.

## 7. Metadata Typography

Metadata typography must be compact but readable.

Direction:

- Use clear hierarchy for rating, warnings, category, status, language, tags and relationships.
- Avoid tiny decorative chips that collapse under long tags.
- Preserve mixed-language readability.

Why: Metadata is a decision tool, not decoration.
Impact: Readers can compare works and understand boundaries without being overwhelmed.
Application: Archive、Search、Work Detail、Admin tag governance。

Rules:

- Warning and rating text must remain more prominent than optional tags.
- Relationship / CP tags must remain distinguishable from additional tags through structure, label or grouping.
- Metadata should wrap intentionally.
- Color cannot be the only differentiator.

## 8. Editorial Typography Principles

| Principle                 | Why                                                      | Impact                                     | Application            |
| ------------------------- | -------------------------------------------------------- | ------------------------------------------ | ---------------------- |
| Text creates brand        | Fandom Harbor brand should come from language and rhythm | Reduces need for heavy decoration          | Homepage、Work、Author |
| Hierarchy before style    | Users need to understand task and content order          | Improves IA clarity                        | All pages              |
| Reading has priority      | Long-form prose is the core experience                   | Prevents UI typography from stealing focus | Reading                |
| Metadata remains readable | Archive discovery depends on metadata                    | Improves selection confidence              | Archive、Work          |
| Mixed language is normal  | Fandom content often mixes scripts and symbols           | Avoids layout and legibility failures      | Titles、Tags、Body     |

## 9. Future Usage

UX-04 should use this document to decide page-level type hierarchy. UX-05 should use it to build Figma text styles. UX-06 should use it to check implementation polish.

## 10. Non-Decisions

This document does not decide:

- Font vendor.
- Font files.
- Exact font stack.
- Token values.
- CSS classes.
- Tailwind utilities.
- Component text styles.
- Figma text style names.
