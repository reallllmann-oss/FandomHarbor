# Fandom Harbor Work Detail Experience

Status: Proposed for UX-04 Page Experience Redesign
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `USER_JOURNEY_MAP.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `DESIGN_SYSTEM.md`, `TYPOGRAPHY_SYSTEM.md`
Scope: Work Detail experience blueprint only; not UI layout, component design, CSS, Tailwind, Figma or code implementation

## 1. Story Introduction

Work Detail is the reader's decision page. It introduces the story, sets consent boundaries, explains author context and offers the correct reading entry.

It should feel like opening a carefully prepared literary record, not like inspecting a database row.

Why: UX-02 defines Work Detail as the commitment point between discovery and reading.
Impact: Readers begin reading with clarity, safety and emotional readiness.
Future Application: UX-05 Work Detail screen, UX-06 metadata and warning QA.

## 2. User Emotion

Work Detail should make readers feel:

- Clear about what the work is.
- Safe about rating and warnings.
- Curious about the story.
- Confident about where to begin.
- Respectful of the author's public identity.

It should not make readers feel:

- Pressured by popularity.
- Buried under tags.
- Unsure whether warnings apply.
- Distracted by platform actions.
- Exposed to private author information.

Why: The reader is deciding whether to enter a long-form experience.
Impact: Good Work Detail reduces abandonment caused by uncertainty and reduces accidental exposure to unwanted content.
Future Application: Reading entry hierarchy, metadata staging, warning presentation.

## 3. Decision Support

Work Detail must support four decisions:

1. Is this story interesting to me?
2. Is this story safe and appropriate for me right now?
3. Where should I start or continue?
4. Do I want to understand this author or related works?

Decision-support information:

| Information                | Role                  | Why                                                          |
| -------------------------- | --------------------- | ------------------------------------------------------------ |
| Title and summary          | Story invitation      | Helps reader understand premise and tone                     |
| Rating and warnings        | Consent boundary      | Must be visible before reading                               |
| Public author identity     | Trust and attribution | Connects work to creator without exposing private account    |
| Category, language, status | Expectation setting   | Helps reader judge scope and context                         |
| Tags and relationships     | Discovery refinement  | Expresses fandom-specific meaning                            |
| Chapter list / entry       | Reading path          | Converts decision into reading action                        |
| Continue Reading           | Private continuity    | Lets returning readers resume without re-deciding everything |

Why: Work Detail carries more responsibility than a simple details page.
Impact: Readers can choose deliberately and recover if they are returning mid-work.
Future Application: UX-05 decision hierarchy, UX-06 reader consent review.

## 4. Reading Entry

Reading entry should be deliberate and context-aware:

- First-time readers need a clear start point.
- Returning readers need a clear continuation point.
- Long works need visible chapter structure.
- Completed or in-progress works need status clarity.

Why: Reading is the core experience, and Work Detail is the handoff into that experience.
Impact: Readers can enter prose without route confusion or unnecessary extra steps.
Future Application: Start / continue behavior review, chapter entry states.

## 5. Author Connection

Author information on Work Detail should support trust and literary context, not social status.

Allowed author connection:

- Public display name / pen name.
- Link to public author profile.
- Author context that supports work understanding.

Forbidden author connection:

- Private account identity.
- Registration email or admin facts.
- Follower or fan framing.
- Creator growth metrics as a primary element.

Why: UX-01 and UX-02 protect pen-name separation and reject social drift.
Impact: Readers can understand the author relationship without collapsing privacy boundaries.
Future Application: Work byline, Author Profile transition, Studio identity review.

## 6. Content Priority

### Primary Content

- Work title.
- Summary.
- Rating and warnings.
- Reading entry.
- Chapter structure.

Why: These define the story and enable safe reading.
Impact: Reader understands and can begin.
Future Application: Work Detail core hierarchy.

### Secondary Content

- Public author identity.
- Category, language, status.
- Key tags and relationship metadata.
- Update / publish context.

Why: These support judgment and discovery.
Impact: Reader gains confidence without losing the story thread.
Future Application: Metadata grouping and author handoff.

### Supporting Content

- Statistics.
- Kudos, comments and recommendations.
- Extended metadata.
- Related works when applicable.

Why: These can enrich the archive but should follow the reading decision.
Impact: Work Detail avoids becoming a popularity page.
Future Application: Downstream interaction placement.

## 7. Experience Flow

```text
Arrive from Archive / Author / Return
-> Understand story identity
-> Review rating and warnings
-> Read summary and metadata
-> Choose start or continue
-> Enter Reading
-> Return for context or author exploration
```

Why: Work Detail is the bridge from discovery to immersion.
Impact: The page can serve both first-time and returning readers without mixing intents.
Future Application: UX-05 prototype flow and Work-to-Reading transition.

## 8. Forbidden Experience

Work Detail must avoid:

- Hiding warning and rating information.
- Making statistics the main visual anchor.
- Turning tags into unstructured noise.
- Showing draft chapters to readers.
- Exposing private author account data.
- Showing Studio edit controls to ordinary readers.
- Placing comments or engagement before story evaluation.
- Treating the page as a generic blog article header.

Why: Work Detail must protect consent and reading readiness.
Impact: Readers can trust that the product will not surprise them with hidden boundaries or platform pressure.
Future Application: UX-05 Work Detail review, UX-06 QA checklist.

## 9. UX-04 Page Decisions

| Decision                          | Why                                                   | Impact                                      | Future Application                     |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| Work Detail is the decision point | Archive cannot carry full consent and chapter context | Reader begins reading with clarity          | Work Detail design and reading entry   |
| Warnings precede reading          | Consent is required before prose                      | Supports trust and safety                   | Warning hierarchy and review           |
| Summary is a story invitation     | The page should feel literary, not database-like      | Reader connects emotionally before starting | Editorial content sequence             |
| Interaction is downstream         | Engagement should follow story understanding          | Avoids social pressure before reading       | Kudos/comment/recommendation placement |

## 10. Non-Decisions

This document does not decide:

- Layout columns.
- Warning component design.
- Tag visual style.
- Chapter list implementation.
- Copy finalization.
- CSS, Tailwind, token or code changes.
- Figma frame composition.
