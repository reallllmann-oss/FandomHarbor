# Fandom Harbor Studio Experience

Status: Proposed for UX-04 Page Experience Redesign
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `USER_JOURNEY_MAP.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `DESIGN_SYSTEM.md`, `LAYOUT_PRINCIPLES.md`
Scope: Studio experience blueprint only; not UI layout, component design, CSS, Tailwind, Figma or code implementation

## 1. Author Workspace Philosophy

Studio is the author's protected workroom for creating, maintaining and publishing archive works. It should feel efficient, clear and trustworthy, but not like a generic CMS or growth dashboard.

Studio should protect:

- Draft safety.
- Save clarity.
- Publish consequence.
- Metadata completeness.
- Author identity boundary.
- Reader-facing verification.

Why: UX-01 defines the Author emotion target as "my works are seriously preserved and my identity boundary is respected."
Impact: Authors feel they are maintaining literary archive objects, not managing platform content inventory.
Future Application: UX-05 Studio screens, UX-06 save/publish/state QA.

## 2. User Emotion

Studio should make authors feel:

- In control.
- Safe to draft.
- Clear about current status.
- Confident before publishing.
- Able to recover from errors.
- Connected to reader-facing results after publish.

Studio should not make authors feel:

- Like they are inside an admin backend.
- Pressured by growth metrics.
- Unsure whether work is saved.
- Unsure whether content is public.
- Buried under CMS modules.

Why: Creation has higher emotional risk than browsing because it involves loss, visibility and authorship.
Impact: Better author trust and fewer accidental publishing mistakes.
Future Application: Studio overview, draft flow, publish flow, error states.

## 3. Creation Flow

Creation should begin as a safe draft, not a public post.

Required creation experience:

- Clear author capability context.
- Clear work creation intent.
- Metadata requirements explained as reader-facing responsibility.
- Save state visible and trustworthy.
- No pressure to publish before readiness.

Why: Fandom Harbor treats works as archive objects that need stable identity and metadata.
Impact: Authors can start without fear of accidental exposure or incomplete publication.
Future Application: New work flow, draft state, metadata completeness review.

## 4. Management Flow

Management should help authors understand what exists, what state it is in, and what needs attention.

Required management experience:

- Work status.
- Draft / published distinction.
- Chapter structure.
- Metadata completeness.
- Last meaningful state or update context.
- Recovery from empty or error states.

Why: Studio should organize stewardship, not backend administration.
Impact: Authors can maintain works calmly and make fewer state mistakes.
Future Application: Studio work list, work management, chapter management.

## 5. Publishing Flow

Publishing should feel deliberate, reviewable and recoverable.

Required publishing experience:

- Clear publish intent.
- Clear reader-facing consequence.
- Rating, warning and metadata readiness.
- Save-before-publish confidence.
- Confirmation that does not obscure responsibility.
- Reader-facing verification path after publish.

Why: Publishing changes visibility and creates reader responsibility.
Impact: Authors trust the system and understand what readers will see.
Future Application: Publish review, success state, preview / reader return.

## 6. Author Identity Relationship

Studio should explain the author's working identity without exposing private identity to reader-facing surfaces.

Studio may show:

- Current author capability.
- Public pen name context where relevant.
- Work ownership and publication state.

Studio must protect:

- Private account facts.
- Reader-facing identity separation.
- Draft privacy.

Why: The author needs confidence that private and public identities remain separate.
Impact: Author safety and trust increase across creation and publication.
Future Application: Studio header/context, profile preview, publish review.

## 7. Content Priority

### Primary Content

- Works and drafts.
- Save / publish state.
- Chapter structure.
- Metadata completeness.

Why: These define the author's actual responsibility.
Impact: Studio supports creation and stewardship rather than dashboard browsing.
Future Application: Studio IA and workflow screens.

### Secondary Content

- Public identity context.
- Reader-facing preview or return path.
- Validation and recovery guidance.

Why: These reduce mistakes and build confidence.
Impact: Authors understand consequences before and after publishing.
Future Application: Publish flow, preview path, error recovery.

### Supporting Content

- Statistics or reader response context, if present.
- Help and guidance.
- Archive policy reminders.

Why: These may be useful but should not dominate creative work.
Impact: Studio avoids growth-dashboard drift.
Future Application: Secondary panels or downstream context.

## 8. Experience Flow

```text
Author enters Studio
-> Understand current work state
-> Create or manage work
-> Review metadata and chapters
-> Save with clarity
-> Publish deliberately
-> Verify reader-facing identity and work
```

Author identity relationship:

```text
Author
-> Creation
-> Publishing
-> Public Identity
```

Why: Studio connects private creation to public archive presence through deliberate state transitions.
Impact: Authors understand both task progress and visibility consequences.
Future Application: UX-05 Studio prototype flow, UX-06 publish QA.

## 9. Forbidden Experience

Studio must avoid:

- Generic CMS module clutter.
- Admin user-management concepts.
- Growth analytics as the primary dashboard.
- Reader private history or private behavior.
- Ambiguous save state.
- Ambiguous publish state.
- Social creator-performance framing.
- Hiding validation until final publish.

Why: These patterns undermine author trust and move Studio away from creation stewardship.
Impact: Studio remains efficient, calm and aligned with Fandom Harbor's archive values.
Future Application: UX-05 Studio review, UX-06 author-workflow QA.

## 10. UX-04 Page Decisions

| Decision                            | Why                                                   | Impact                                             | Future Application              |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ------------------------------- |
| Studio is a workroom, not CMS       | Authors maintain archive works, not content inventory | Reduces dashboard drift                            | Studio redesign direction       |
| Save and publish states are primary | Loss and accidental exposure are high-risk emotions   | Builds author trust                                | UX-05 state design and UX-06 QA |
| Metadata is author responsibility   | Metadata supports reader consent and discovery        | Better archive quality                             | Creation and publish review     |
| Analytics stay supporting           | Growth metrics distort author experience              | Studio remains aligned with private archive values | Future secondary content review |

## 11. Frozen Chapter Management and Publish Selection

Author Studio and Work Editor must follow `STUDIO_CHAPTER_MANAGEMENT_RULES.md`。

Frozen experience requirements:

- Single-chapter works may retain a simple editor and publish flow。
- Multi-chapter works require a collapsible management structure；they cannot remain as an unordered fully expanded stack。
- The active editing chapter stays expanded and explicitly identified；other saved chapters may collapse。
- Chapter entries expose number、title、save state and relevant saved / published time context。
- `Add Chapter` remains clear。
- Publishing multiple chapters supports Select All for eligible chapters only and communicates none、partial and all selection states。
- Published、ineligible、invalid and unsaved chapters cannot be accidentally batch-published。
- Zero selection cannot trigger `Publish Selected Chapters`。

Why: Chapter growth must not weaken editing focus or publishing confidence。
Impact: Studio scales from a simple work editor to safe multi-chapter stewardship without becoming a CMS list。
Future Application: A separately authorized Author Studio / Chapter Management implementation Mission。

This section freezes UX behavior，not layout、component、database、permission or publish implementation。

## 12. Non-Decisions

This document does not decide:

- Studio layout.
- Sidebar design.
- Form components.
- Editor implementation.
- Save or publish business logic.
- Analytics features.
- CSS, Tailwind, token or code changes.
- Figma frame composition.
