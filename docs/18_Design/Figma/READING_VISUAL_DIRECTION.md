# Fandom Harbor Reading Visual Direction

Status: Completed for UX-05B Reading Visual Intelligence; awaiting Product Owner acceptance
Phase: UX Design Intelligence
Scope: Reading Page visual direction only; not final UI, Figma production, implementation, CSS, Tailwind, component design, pixel specification or code

## 1. Reading Page Purpose

Reading Page is Fandom Harbor's core product experience. It is the space where the reader leaves discovery and decision-making behind and enters the story.

The page should feel like a private, continuous story space, not a generic web article.

Reading Page exists to:

- Protect prose focus.
- Preserve story atmosphere.
- Keep chapter orientation available.
- Support long reading comfort.
- Maintain private return and recovery.
- Keep interaction downstream from reading.

Why: UX-01 defines Reading Before Interface, UX-02 defines Reading Space as narrower than Product Space, UX-03 makes reading experience the highest typography and layout priority, and UX-04 defines Reading Page as the highest-priority page.
Impact: Readers can stay with the story rather than feeling they are navigating a platform.
Application: UX-06 Reading Page polish, reading QA, reader preference review and visual regression criteria.

## 2. Core Experience Goal

The core experience goal is:

**Private Literary Reading Space**

Reader should feel:

- Quiet.
- Focused.
- Private.
- Emotionally continuous.
- Safe to read for a long time.
- Connected to the story and author context.

Reader should not feel:

- Inside a blog article.
- Inside a news reading page.
- Inside a CMS-rendered content page.
- Inside a social feed.
- Inside a forum thread.
- Inside a dashboard.

Why: Product Owner direction explicitly asks for Apple Books-like quiet focus while preserving Fandom Harbor's literary website warmth.
Impact: Reading becomes a distinct product moment, not only content display.
Application: UX-06 should treat Reading Page as a reading environment with supportive controls, not as a normal route template.

## 3. Apple Books Reference Analysis

This Mission uses Apple Books as an abstract product-quality reference, not as a UI pattern to copy.

### 3.1 Learn: Calm Reading Environment

Useful principle:

- Reading environment should reduce surrounding product noise.
- Background and chrome should support the text instead of competing with it.
- Controls should feel available but not constantly present.

Why: Calmness helps the reader cross from browsing into immersion.
Impact: The story gains emotional priority and long reading fatigue decreases.
Application: UX-06 should keep global navigation and non-reading modules visually secondary during reading.

### 3.2 Learn: Focused Typography

Useful principle:

- Text rhythm should feel stable, readable and durable across long sessions.
- Chapter identity and body text should have clear hierarchy.
- UI labels should not visually compete with prose.

Why: The reading experience is mostly typography and spacing, not decoration.
Impact: Reader attention stays on the story while still understanding chapter context.
Application: UX-06 should preserve prose hierarchy and avoid UI typography overpowering story text.

### 3.3 Learn: Minimal Interaction

Useful principle:

- Interaction should support reading, navigation and comfort.
- Settings, preferences, bookmarking and chapter movement should not create dashboard density.
- Interaction should feel reversible and low-pressure.

Why: Reading controls matter, but they should not become the main page.
Impact: Readers can adjust comfort or move chapters without losing immersion.
Application: UX-06 should keep preferences, bookmark and chapter navigation supportive and calm.

### 3.4 Do Not Copy

Fandom Harbor should not copy:

- Apple Books product logic.
- Library / bookstore / purchase metaphors.
- Native app chrome.
- Page-turn skeuomorphism.
- Exact toolbar or settings UI form.
- Closed ecosystem assumptions.

Why: Fandom Harbor is a private web-based literary archive, not an e-book store or native reader.
Impact: The product keeps its archive identity and web reading accessibility.
Application: UX-06 should translate calm principles, not recreate Apple Books UI.

## 4. Fandom Harbor Reading Identity

### 4.1 Literary Warmth

Reading Page should keep a human literary temperature:

- Work and chapter identity should feel authored, not system-generated.
- Typography should support prose emotion.
- Metadata should protect consent without making the page clinical.

Why: Fandom Harbor is an archive of works and authors, not only a text renderer.
Impact: Readers feel they are entering a story with context and care.
Application: UX-06 should retain work title, chapter context, author relationship and warning clarity without crowding prose.

### 4.2 Author Connection

Author connection should be present but quiet:

- Public author identity may support attribution and warmth.
- Author identity should not become a social profile entry inside reading.
- Private account identity must never appear.

Why: UX-01 and UX-02 protect pen-name separation while supporting trust and attribution.
Impact: Readers know whose story they are reading without being pushed into social exploration.
Application: UX-06 should keep author context readable and downstream from prose focus.

### 4.3 Story Atmosphere

Story atmosphere should come from text, spacing and continuity:

- The prose carries the mood.
- The page should not impose heavy decorative imagery.
- Chapter transitions should feel calm and continuous.
- End-of-chapter actions should allow continue, return or rest.

Why: Overdecorated reading pages turn story atmosphere into page theme rather than author expression.
Impact: Different works can retain their own emotional tone inside one product system.
Application: UX-06 should avoid decorative backgrounds, promotional blocks and intrusive motion around prose.

## 5. Visual Direction

Reading Visual Direction:

**Private Literary Reading Space**

This direction extends Homepage's **Quiet Editorial Harbor** into the core reading surface. Homepage welcomes the user into the harbor; Reading Page becomes the quiet inner room where the story takes over.

## 6. Typography Feeling

Typography should feel:

- Literary.
- Stable.
- Comfortable.
- Long-form ready.
- Mixed-language capable.
- Hierarchical without being decorative.

Reading hierarchy:

1. Work / chapter identity.
2. Rating and warning context when needed.
3. Prose.
4. Chapter navigation.
5. Downstream interaction.

Why: Typography is the primary interface of Reading Page.
Impact: Readers can enter and sustain focus while still understanding context.
Application: UX-06 should check that prose owns the page and UI text remains supportive.

## 7. Space Philosophy

Reading space should feel like a protected margin around the story.

Direction:

- Use breathing room to create focus.
- Keep prose measure comfortable instead of filling the viewport.
- Let chapter context and controls sit near the reading task without crowding it.
- Keep supporting content away from the middle of the reading flow.

Why: Space is what separates Reading Page from article templates and forum threads.
Impact: The reader feels unhurried and emotionally settled.
Application: UX-06 should preserve reading measure, paragraph rhythm and separation between prose and controls.

## 8. Background Direction

Background should support reading comfort and private atmosphere.

Direction:

- Paper-like calm for normal reading contexts.
- Harbor Night-like depth for dark reading contexts.
- Low visual noise.
- No decorative image background behind prose.
- No high-contrast theatrical surfaces that compete with text.

Why: Background mood affects fatigue and privacy feeling.
Impact: The page feels calm across long sessions and different reading conditions.
Application: UX-06 should treat background as a reading surface, not a branding canvas.

## 9. Navigation Philosophy

Navigation should be present as orientation, not as product chrome.

Reading navigation should support:

- Return to Work.
- Previous / next chapter.
- Chapter position.
- Reader preferences.
- Private return or recovery when needed.

Navigation should avoid:

- Dominant global nav.
- Large menu systems.
- Discovery modules inside the reading surface.
- Studio or Admin controls for ordinary readers.

Why: Reading Space is narrower than Product Space.
Impact: Readers stay oriented without feeling pulled back into browsing or management.
Application: UX-06 should review navigation visibility, hierarchy and interruption level.

## 10. Interaction Density

Interaction density should be low during reading and slightly higher after reading context.

Allowed but secondary:

- Bookmark.
- Reading preferences.
- Chapter navigation.
- Return to Work.
- Post-reading Kudos, comments and recommendations.

Forbidden as reading-center elements:

- Popularity stats beside prose.
- Comment feed alongside prose.
- Recommendation feed before chapter completion.
- Promotional banners.
- Public ranking cues.

Why: Interaction should serve reading, not compete with it.
Impact: Emotional continuity survives across paragraphs and chapters.
Application: UX-06 should keep interaction placement downstream and low-pressure.

## 11. Chapter Transition

Chapter transition should feel like moving within one story space, not loading a new article.

Direction:

- End-of-chapter state should allow continue, return or rest.
- Previous / next movement should be clear and calm.
- Reader should never be trapped at the end of a chapter.
- Transition should not insert unrelated modules between prose and continuation.

Why: Long works depend on continuity across chapters and sessions.
Impact: Readers remain in the story world and trust the archive for long-form reading.
Application: UX-06 should treat chapter navigation and post-reading actions as part of reading flow QA.

## 12. Forbidden Experience

Reading Page must not become:

| Forbidden Direction | Why It Fails Fandom Harbor                                     | UX-06 Guardrail                                         |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Blog Article        | Treats story as a post and often foregrounds page template     | Avoid blog header, author promo and related-post rhythm |
| News Reading        | Introduces urgency, skim behavior and publication-site chrome  | Avoid news-like byline density and sidebar modules      |
| CMS Content Page    | Feels system-rendered and generic                              | Preserve literary hierarchy and story atmosphere        |
| Social Platform     | Pulls attention toward comments, reactions and public identity | Keep interactions downstream and low-pressure           |
| Forum Reading       | Dense, thread-like, discussion-first                           | Do not let comment or metadata blocks crowd prose       |
| Dashboard View      | Turns reading into state management                            | Keep settings and controls supportive, not panel-dense  |
| Visual Theme Page   | Imposes decorative mood over author text                       | Let prose carry atmosphere                              |

## 13. UX-06 Implementation Guidance

UX-06 should preserve:

- Prose as the primary visual object.
- Comfortable reading measure and paragraph rhythm.
- Clear but quiet work / chapter context.
- Rating and warning clarity before or near entry.
- Low-distraction navigation.
- Reader preferences as supportive controls.
- Private return and recovery.
- Downstream interaction placement.
- Reduced motion and no layout-shifting animation around text.

UX-06 must not break:

- Reading First priority.
- Long reading comfort.
- Emotional continuity between chapters.
- Author identity boundary.
- No popularity dominance.
- No social feed drift.
- No blog/news/CMS visual category drift.

Validation questions for UX-06:

1. Does the page feel like a private story space rather than a web article?
2. Can the reader understand work, chapter and warning context without losing focus?
3. Does prose remain visually primary on desktop and mobile?
4. Are controls supportive rather than dominant?
5. Can the reader continue, return or rest at chapter end?
6. Does the page maintain Fandom Harbor warmth beyond Apple Books-like minimalism?

## 14. Non-Decisions

This document does not decide:

- Final Figma layout.
- Final Reading Page UI.
- Component specifications.
- Exact font files.
- Exact color values.
- Pixel dimensions.
- Breakpoints.
- CSS, Tailwind or token changes.
- Reader preference storage.
- Route, database, Supabase or business logic changes.
