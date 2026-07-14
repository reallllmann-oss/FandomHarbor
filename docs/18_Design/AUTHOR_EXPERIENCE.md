# Fandom Harbor Author Profile Experience

Status: Proposed for UX-04 Page Experience Redesign
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `USER_JOURNEY_MAP.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `DESIGN_SYSTEM.md`, `TYPOGRAPHY_SYSTEM.md`
Scope: Author Profile experience blueprint only; not UI layout, component design, CSS, Tailwind, Figma or code implementation

## 1. Creator Identity

Author Profile is a public creator identity space inside the archive. It should help readers understand a public pen name and discover that author's published works.

Author Profile is not:

- A personal account page.
- A social profile.
- A fan hub.
- A follower-growth surface.
- A Studio management page.

Why: UX-01 and UX-02 define strict separation between public pen name and private account identity.
Impact: Authors can build a body of work without exposing private account facts or entering social-status loops.
Future Application: UX-05 Author Profile screen, UX-06 identity-boundary QA.

## 2. User Emotion

Author Profile should make readers feel:

- The author has a coherent public identity.
- The author's works are easy to explore.
- The space is respectful and literary.
- The archive protects identity boundaries.

Author Profile should make authors feel:

- Represented by their published works.
- Safe from private identity leakage.
- Not pressured into social performance.

Why: The profile supports trust and discovery through works, not popularity mechanics.
Impact: Readers can move from author context to works while authors remain protected.
Future Application: Public author framing, byline transition, work grouping.

## 3. Published Works

Published works should be the center of Author Profile.

Required work signals:

- Work title.
- Summary or story cue.
- Rating and warning context.
- Completion / publication state.
- Key metadata enough for selection.

Why: Author identity in Fandom Harbor is proven through preserved works, not activity streams.
Impact: The profile remains archive-first and supports reader discovery.
Future Application: Author works section, related works browsing.

## 4. Author Relationship

The relationship between reader and author should be quiet and archive-oriented:

- Reader sees public attribution.
- Reader can find more published works.
- Reader can move back to a work or reading context.
- Author can trust that only public identity appears.

Why: Fandom Harbor should avoid turning author pages into social status surfaces.
Impact: Author Profile supports literary context without drifting into followers, timelines or fan metrics.
Future Application: Profile-to-Work handoff, byline behavior, public identity review.

## 5. Content Priority

### Primary Content

- Public pen name or display name.
- Published works.
- Work selection signals.

Why: The purpose is public creator identity through works.
Impact: Reader understands the author and can choose what to read next.
Future Application: Author Profile hierarchy.

### Secondary Content

- Public bio or author context when available.
- Archive-relevant metadata across works.
- Links back to Work Detail.

Why: These deepen trust and orientation without becoming social content.
Impact: The page feels literary and useful.
Future Application: Author context and work grouping.

### Supporting Content

- Supporting statistics if needed.
- Recommendations or related author context only when tied to works.

Why: Supporting content should not replace published works as the primary identity.
Impact: Avoids popularity-first author presentation.
Future Application: Supporting metadata review.

## 6. Experience Flow

```text
Arrive from Work byline / Archive / direct link
-> Understand public author identity
-> Browse published works
-> Select Work Detail
-> Enter Reading or continue discovery
```

Why: Author Profile should be a bridge between public identity and story discovery.
Impact: Readers move through works instead of social activity.
Future Application: UX-05 Author flow and cross-page navigation.

## 7. Forbidden Experience

Author Profile must avoid:

- Registration name, account email or private account facts.
- Draft works.
- Studio edit controls for ordinary readers.
- Follower counts as primary identity.
- Social timeline or activity feed.
- Public ranking and creator competition.
- Fan-club framing.
- Admin-only identity context.

Why: These patterns break pen-name separation and create social drift.
Impact: Authors retain trust in the archive, and readers understand identity through works.
Future Application: UX-05 Author Profile review, UX-06 privacy QA.

## 8. UX-04 Page Decisions

| Decision                                        | Why                                             | Impact                                          | Future Application               |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| Author Profile is public identity through works | Fandom Harbor is archive-first                  | Profile supports discovery without social drift | Author profile redesign          |
| Private account identity never appears          | Pen-name separation is a product trust boundary | Authors feel protected                          | Identity review and QA           |
| Published works are primary                     | Works are the center of the archive graph       | Readers move toward story decisions             | Work grouping and byline handoff |
| Social mechanics are excluded                   | Followers and timelines change product category | Prevents forum/social profile drift             | UX-05 and UX-06 boundary review  |

## 9. Non-Decisions

This document does not decide:

- Profile layout.
- Avatar treatment.
- Bio component.
- Follow or subscription features.
- Visual style.
- CSS, Tailwind, token or code changes.
- Figma frame composition.
