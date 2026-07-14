# Fandom Harbor Homepage Experience

Status: Proposed for UX-04 Page Experience Redesign
Depends on: `BRAND_EXPERIENCE.md`, `UX_PRINCIPLES.md`, `INFORMATION_ARCHITECTURE.md`, `PAGE_EXPERIENCE_STRATEGY.md`, `DESIGN_SYSTEM.md`, `LAYOUT_PRINCIPLES.md`
Scope: Homepage experience blueprint only; not UI layout, component design, CSS, Tailwind, Figma or code implementation

## 1. Homepage Purpose

Homepage is the threshold into Fandom Harbor. It should explain that the product is a private literary archive, help the user understand their access state, and route them toward the next meaningful action.

Homepage is not a work list, marketing landing page, public community front page or feature catalog.

Why: UX-01 defines Fandom Harbor as an invited, quiet and trustworthy archive. The first page must establish trust before discovery or reading.
Impact: New users feel invited and oriented; returning readers can continue without re-learning the product.
Future Application: UX-05 Homepage frame, signed-out entrance, signed-in reader return, author entry.

## 2. User Emotion

The Homepage should make users feel:

- Invited, not converted.
- Calm, not stimulated.
- Oriented, not overwhelmed.
- Protected, not publicly exposed.
- Ready to read or return, not pushed into a feed.

Rejected emotions:

- Growth funnel pressure.
- Public plaza energy.
- Trending or ranking anxiety.
- Generic SaaS confidence theater.
- Community front-page noise.

Why: The Homepage carries the first expression of the private archive brand.
Impact: Users understand that Fandom Harbor values reading continuity and trust over engagement loops.
Future Application: Entry copy direction, access-state hierarchy, return-state prioritization.

## 3. Experience Goal

Homepage should answer three questions quickly:

1. What is Fandom Harbor?
2. What can I do here based on my current access?
3. Where should I go next?

Primary goals by user state:

| User State        | Primary Goal                                     | Secondary Goal                                          |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------- |
| Visitor           | Understand private archive value and access path | Learn that invitation and trust are part of the product |
| New Reader        | Move into discovery with confidence              | Understand reading boundaries and metadata trust        |
| Returning Reader  | Resume reading privately                         | Discover new works only if they choose to               |
| Authorized Author | Reach Studio or return to reader space           | Understand that creation is a protected workroom        |

Why: UX-02 separates Entry, Discovery, Return and Creation spaces. Homepage must route by intent, not by a flat feature list.
Impact: The first action feels natural for different user memories and permissions.
Future Application: Homepage state design, navigation priority, auth and return entry.

## 4. Content Hierarchy

### Primary Content

Primary Homepage content should establish product identity and next action:

- Fandom Harbor as a private literary archive.
- Access state: visitor, reader, returning reader or authorized author.
- Primary next path: enter, discover, continue reading or create.

Why: Home is an entry threshold, not a content destination.
Impact: Users can leave Home for the right experience instead of scanning unrelated modules.
Future Application: UX-05 first viewport hierarchy and signed-in variants.

### Secondary Content

Secondary content should support trust and orientation:

- Invitation and access explanation.
- Reading-first product promise.
- Archive and metadata value.
- Author Studio entry when authorized.

Why: Users need enough context to trust the private space, but not a long product pitch.
Impact: Home feels useful and calm rather than promotional.
Future Application: Gate messaging, homepage supporting sections, author capability state.

### Supporting Content

Supporting content may include:

- Recent return cues for signed-in readers.
- Quiet discovery prompts.
- Empty or unavailable states.
- Help or recovery paths when access is unclear.

Why: Supporting content should help continuation and recovery without becoming the main page.
Impact: Returning users are respected without exposing private reading behavior publicly.
Future Application: Continue Reading module, private return state, access recovery.

## 5. Experience Flow

Recommended experience logic:

```text
Arrive
-> Understand private archive context
-> Recognize access / memory state
-> Choose one primary path
-> Enter Discovery, Return, Reading or Creation
```

Primary cross-page relationship:

```text
Homepage
-> Discovery
-> Story Decision
-> Reading
-> Return
```

Author relationship:

```text
Homepage
-> Studio
-> Creation
-> Publishing
-> Public Identity
```

Why: The Homepage should be a gateway into task spaces, not a destination competing with Archive.
Impact: Homepage rhythm stays focused and future page designs can preserve clear handoff points.
Future Application: UX-05 prototype flow, UX-06 navigation QA.

## 6. Information Rhythm

Homepage rhythm should move from trust to intent:

1. Brand threshold.
2. Access and state clarity.
3. Reader action: continue or discover.
4. Author action when applicable.
5. Quiet supporting context.

Why: Entry rhythm must avoid both marketing sprawl and work-list density.
Impact: Users can understand the product in a small number of decisions.
Future Application: Homepage wireframe ordering in UX-05, signed-in state variants.

## 7. Forbidden Experience

Homepage must avoid:

- Becoming a public work list.
- Public trending, rankings or competitive social proof.
- Gated story body previews for unauthenticated visitors.
- Generic feature grids as the main narrative.
- Forum-style latest activity.
- Public reader behavior.
- Admin, database or backend concepts for ordinary users.
- Overdecorated brand moments that delay reading.

Why: These patterns move Fandom Harbor toward social, SaaS or feed logic.
Impact: The brand remains private, literary and reading-first.
Future Application: UX-05 Homepage review checklist, UX-06 implementation boundary.

## 8. UX-04 Page Decisions

| Decision                                 | Why                                                       | Impact                                           | Future Application                              |
| ---------------------------------------- | --------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| Homepage is the brand threshold          | Invitation and trust are core to the product              | Users know they are entering a protected archive | Homepage first screen and auth entry            |
| Homepage routes by user state            | Visitor, Reader and Author have different intent          | Reduces friction and confusion                   | Signed-out, signed-in and author-capable states |
| Continue Reading is a private return cue | Returning readers need continuity, not discovery pressure | Supports long-form reading trust                 | Homepage signed-in experience                   |
| Archive is the discovery destination     | Home should not duplicate Archive                         | Keeps discovery intentional and organized        | Homepage to Archive handoff                     |

## 9. Non-Decisions

This document does not decide:

- Homepage layout.
- Hero structure.
- Copy finalization.
- Component selection.
- Exact navigation labels.
- Image direction or assets.
- CSS, Tailwind, token or code changes.
- Figma frame composition.
