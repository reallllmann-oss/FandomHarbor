# Fandom Harbor Reading Page Experience

Status: Proposed for UX-04 Page Experience Redesign
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `USER_JOURNEY_MAP.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `TYPOGRAPHY_SYSTEM.md`, `READING_EXPERIENCE_GUIDELINES.md`
Scope: Reading Page experience blueprint only; not UI layout, component design, CSS, Tailwind, Figma or code implementation

## 1. Reading Focus

Reading Page is the highest-priority Fandom Harbor experience. It is where the product should become quiet enough for the story to take over.

The page should protect:

- Prose focus.
- Chapter orientation.
- Reader comfort.
- Emotional continuity.
- Private recovery.

Why: UX-01 defines Reading Before Interface, and UX-03 confirms Reading Experience as the core design-system priority.
Impact: The product succeeds when readers can stay with long-form text without platform interruption.
Future Application: UX-05 Reading screens, UX-06 reading QA and polish.

## 2. User Emotion

Reading Page should feel:

- Quiet.
- Focused.
- Trusted.
- Unhurried.
- Comfortable for long sessions.
- Recoverable if interrupted.

Reading Page should not feel:

- Crowded.
- Gamified.
- Feed-driven.
- Promotional.
- Dashboard-like.
- Over-managed.

Why: Reading emotion is the heart of Fandom Harbor's brand promise.
Impact: Readers form a durable relationship with the archive instead of only completing a task.
Future Application: Reading flow, reader preferences, post-chapter states.

## 3. Long Form Experience

Long-form reading requires consistency over novelty:

- The prose remains the primary content.
- Work and chapter context remain understandable.
- Reading controls support comfort without becoming a settings product.
- Previous / next movement is clear and available.
- Return paths exist without dominating the page.
- Interactions wait until the reader has context to use them.

Why: Long works are read across sessions, devices and emotional states.
Impact: Readers can pause, resume and finish without reconstructing context manually.
Future Application: Reading preferences, chapter navigation, return-state behavior.

## 4. Text Experience

Reading text should be treated as the main surface of the product.

Direction:

- Typography must support literary rhythm and mixed-language prose.
- Paragraph rhythm should feel breathable.
- Reading measure should follow comfort, not viewport width.
- Warning and chapter context should be legible before prose.
- Comments and recommendations remain typographically downstream.

Why: UX-03 typography and reading guidelines place prose above UI typography.
Impact: The interface recedes and fatigue decreases.
Future Application: UX-05 text hierarchy, UX-06 prose rendering QA.

## 5. Chapter Flow

Chapter flow should support orientation and emotional continuity:

```text
Enter chapter with context
-> Settle into prose
-> Reach chapter end
-> Continue, return, or rest
-> Resume later if needed
```

Required experience:

- Current work and chapter identity.
- Chapter position or relationship.
- Previous and next movement.
- Return to Work Detail.
- Recovery when chapter is unavailable or access changes.

Why: Chapter navigation is not a utility afterthought; it is part of long reading trust.
Impact: Readers can continue without friction and recover calmly from interruption.
Future Application: Chapter navigation, post-chapter states, unavailable-content states.

## 6. Emotional Continuity

The Reading Page should preserve the emotional state created by the story.

Experience rules:

- Avoid sudden promotional or social prompts inside the reading flow.
- Avoid motion that shifts text position or delays reading.
- Avoid unrelated modules between prose and chapter movement.
- Keep feedback quiet and reversible when possible.
- Let post-reading actions appear after reading context, not during immersion.

Why: Emotional reading depends on not breaking the reader's attention at the wrong moment.
Impact: The product feels respectful of the story rather than hungry for interaction.
Future Application: UX-05 reading end state, UX-06 motion and interaction QA.

## 7. Distraction Control

Forbidden or minimized during reading:

- Dominant global navigation.
- Popularity stats beside prose.
- Social feed modules.
- Persistent promotional banners.
- Decorative animation around text.
- Studio or Admin controls for ordinary readers.
- Dense metadata panels competing with prose.

Allowed but secondary:

- Bookmark.
- Reading preferences.
- Previous / next chapter.
- Return to Work.
- Post-reading Kudos, comments or recommendations.

Why: Reading Space must be narrower than Product Space.
Impact: Readers can trust that Reading Page exists for reading, not platform activity.
Future Application: UX-05 Reading screen scope, UX-06 visual review.

## 8. Content Priority

### Primary Content

- Prose content.
- Work / chapter identity.
- Required rating and warning context.

Why: These support safe, contextual reading.
Impact: Reader can enter the text without losing boundaries.
Future Application: Reading Page hierarchy.

### Secondary Content

- Chapter position.
- Previous / next chapter.
- Reader preferences.
- Return to Work.

Why: These support orientation and comfort.
Impact: Reader stays in control without interface dominance.
Future Application: Reading controls and navigation states.

### Supporting Content

- Bookmark.
- Kudos / comments / recommendations.
- Related recovery paths.

Why: These support return and interaction after reading context.
Impact: Engagement remains attached to reading instead of replacing it.
Future Application: Post-reading actions.

## 9. UX-04 Page Decisions

| Decision                              | Why                                            | Impact                                               | Future Application                   |
| ------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| Reading is the highest-priority page  | It is the core emotional product moment        | Prose receives strongest protection                  | UX-05 Reading prototype and UX-06 QA |
| Product chrome recedes                | Global structure can interrupt long reading    | Better focus and lower fatigue                       | Navigation and control review        |
| Chapter flow is part of reading trust | Long works require orientation across sessions | Readers can continue and recover                     | Previous/next and return states      |
| Interactions are downstream           | Social pressure harms immersion                | Kudos/comments support rather than interrupt reading | Post-reading interaction strategy    |

## 10. Non-Decisions

This document does not decide:

- Reading layout.
- Toolbar placement.
- Typography values.
- Reading preference storage.
- Sticky behavior.
- Animation timing.
- CSS, Tailwind, token or code changes.
- Figma frame composition.
