# Fandom Harbor Archive Experience

Status: Proposed for UX-04 Page Experience Redesign
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `USER_JOURNEY_MAP.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `DESIGN_SYSTEM.md`, `LAYOUT_PRINCIPLES.md`
Scope: Archive experience blueprint only; not UI layout, component design, CSS, Tailwind, Figma or code implementation

## 1. Discovery Philosophy

Archive is Fandom Harbor's Discovery Space. It helps readers intentionally explore published works through story identity, author identity, metadata, warnings and reading status.

Archive is not:

- A social feed.
- A popularity board.
- A generic blog index.
- A private reader shelf.
- A Studio work management table.

Why: UX-02 separates discovery from private return. Archive exists for finding new or unfamiliar works, not for resuming known reading history.
Impact: Readers browse with control instead of being pulled by heat, novelty or social pressure.
Future Application: UX-05 Archive screens, UX-06 filter and work-card review.

## 2. User Emotion

Archive should feel:

- Discoverable.
- Calmly ordered.
- Metadata-rich but readable.
- Safe for preference and boundary decisions.
- Open to browsing without pressure.

Archive should not feel:

- Endless.
- Competitive.
- Noisy.
- Algorithmically manipulative.
- Like an admin table.

Why: Discovery in Fandom Harbor depends on trust and metadata clarity.
Impact: Readers can stay curious while still feeling in control of boundaries and reading mood.
Future Application: Discovery states, no-result recovery, metadata grouping.

## 3. Browsing Experience

Browsing should support three reader behaviors:

1. Scan: quickly understand titles, authors, warnings and summary signals.
2. Compare: judge which works fit current mood, boundary and time.
3. Recover: loosen filters, change direction or return when nothing matches.

Why: Rich archive metadata can help discovery only when it is staged and understandable.
Impact: Readers avoid both under-informed clicks and metadata overload.
Future Application: Archive browsing rhythm, search and filter strategy, mobile scanning review.

## 4. Selection Experience

Archive should help a reader decide whether a work is worth opening, not force a final reading decision on the list itself.

Required selection signals:

- Work title.
- Public author identity.
- Summary cue.
- Rating and warnings.
- Category, language and completion state.
- Key tags and relationship metadata.
- Update or publish context when relevant.

Why: Work Detail remains the commitment point. Archive prepares the decision; it does not replace it.
Impact: Archive stays scannable while Work Detail can provide full consent and entry context.
Future Application: Archive to Work handoff, Work card content hierarchy.

## 5. Content Relationship

UX-04 clarifies the future experience relationship without deciding final naming:

| Concept          | Experience Role                                                 | Relationship                                        |
| ---------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| Archive          | Public discovery and browsing of published works                | Primary place to find something new                 |
| Library / Shelf  | Private return collection or saved reading space                | Not the same as Archive; supports known works       |
| History          | Private reading memory                                          | Supports recovery and continuity                    |
| Continue Reading | Direct return to an unfinished known work                       | Highest-friction-reduction return path              |
| Works            | Archive object or authored work collection depending on context | Needs UX-04/UX-05 naming review before final labels |

Why: Current terms can overlap if Archive, Library, Works and Shelf are all treated as "lists of works."
Impact: Future IA can protect user intent: discover new work versus return to known work.
Future Application: UX-05 navigation naming exploration, UX-06 route and label polish if authorized.

## 6. Content Priority

### Primary Content

- Work title.
- Summary.
- Rating and warnings.
- Reading fit signals.

Why: These decide whether the reader should open the work.
Impact: Discovery is safer and more literary.
Future Application: Archive card hierarchy.

### Secondary Content

- Public author identity.
- Category, language and completion state.
- Key metadata groups.

Why: These clarify context and support comparison.
Impact: Readers can narrow by preference without losing story focus.
Future Application: Filter strategy and metadata grouping.

### Supporting Content

- Statistics.
- Kudos / comment counts.
- Update context.
- Extended tags.

Why: These enrich judgment but should not dominate.
Impact: Archive avoids popularity-first discovery.
Future Application: Supporting metadata treatment.

## 7. Information Rhythm

Archive rhythm should move from broad discovery to narrower choice:

```text
Intent
-> Browse / Search
-> Filter / Refine
-> Compare
-> Open Work Detail
-> Return or revise discovery
```

Why: Discovery is a loop, not a one-way conversion funnel.
Impact: Readers can explore at their own pace and recover from over-filtering.
Future Application: UX-05 Archive flow and empty-state design.

## 8. Forbidden Experience

Archive must avoid:

- Public trending as the main hierarchy.
- Infinite feed pressure.
- Social activity streams.
- Draft or private works.
- Private account identity.
- Studio controls.
- Admin moderation state for ordinary readers.
- Statistics louder than story identity.
- Hiding ratings or warnings behind decorative compression.

Why: These patterns conflict with Reader First, Privacy Before Virality and Archive Before Feed.
Impact: Archive remains a trustworthy discovery catalog.
Future Application: UX-05 Archive review, UX-06 visual QA.

## 9. UX-04 Page Decisions

| Decision                      | Why                                               | Impact                                                                 | Future Application                   |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------ |
| Archive is Discovery Space    | It serves "find something to read"                | Discovery can optimize for metadata comparison                         | Archive redesign and filter strategy |
| Return spaces stay separate   | Resume intent differs from browse intent          | Library / History / Continue can remain private and continuity-focused | UX-05 navigation exploration         |
| Metadata is a decision aid    | Warnings, tags and status are reader safety tools | Readers choose with confidence                                         | Work cards and filters               |
| Popularity remains supporting | Product rejects public competitive ranking        | Works are evaluated by fit, not heat                                   | Sort and stat placement review       |

## 10. Non-Decisions

This document does not decide:

- Final names for Archive, Library, Shelf or Works.
- Filter component design.
- Card layout or dimensions.
- Sort implementation.
- Pagination or infinite-scroll behavior.
- CSS, Tailwind, token or code changes.
- Figma frame composition.
