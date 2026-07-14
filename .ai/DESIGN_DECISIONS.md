# Design Decisions

This file records product experience, interaction, UI and reading decisions. Architecture, database, technology, permission and long-term engineering decisions remain in `DECISIONS.md`.

## DD-001 — Reading is the visual priority

- Date: 2026-06-28
- Status: Accepted in Phase 0.5; reaffirmed during Phase 0.6 review
- Decision: Work and chapter pages prioritize prose, warnings, chapter context and navigation before engagement statistics or decoration.
- Consequence: Reading measure, typography and interruption-free navigation are system-level assets.

## DD-002 — Modern archive, not AO3 visual imitation

- Date: 2026-06-28
- Status: Accepted in Phase 0.5; reaffirmed during Phase 0.6 review
- Decision: Preserve AO3's archival product philosophy while using a modern, minimal, elegant and responsive visual system.
- Consequence: Metadata remains rich and scannable without copying AO3 layouts or styling.

## DD-003 — Mobile is a primary design target

- Date: 2026-06-28
- Status: Accepted in Phase 0.5; reaffirmed during Phase 0.6 review
- Decision: Reader and Author core journeys are designed mobile-first. Admin is desktop-optimized but must remain safe and understandable on small screens.
- Consequence: Hover-only actions, desktop-only navigation and full-width prose are prohibited.

## DD-004 — Archive interactions do not become a feed

- Date: 2026-06-28
- Status: Accepted in Phase 0.5; reaffirmed during Phase 0.6 review
- Decision: Kudos, bookmarks, recommendations and comments remain attached to works/reading; they do not generate social feeds or competitive ranking surfaces.
- Consequence: Statistics are supporting metadata, not the dominant visual hierarchy.

## DD-005 — Semantic tokens and governed components

- Date: 2026-06-28
- Status: Accepted in Phase 0.5; refined by D-020 during Phase 0.6 review
- Decision: Apps consume semantic tokens and shared components from `packages/ui`; raw visual values and app-local forks require review.
- Consequence: `STYLE_GUIDE.md`, `docs/05_UI/`, `docs/06_Design_System/` and `docs/07_Component/` define the concrete system without mixing experience, tokens and implementation.

## DD-006 — Warnings are informative, accessible and non-shaming

- Date: 2026-06-28
- Status: Accepted in Phase 0.5; reaffirmed during Phase 0.6 review
- Decision: Rating and warning information appears before content, never relies on color alone, and uses neutral language.
- Consequence: Warning conceal/reveal patterns must remain keyboard/screen-reader accessible.

## DD-007 — Registration asks only for the credentials the product uses

- Date: 2026-07-02
- Status: Accepted during Phase 2 product acceptance
- Decision: Registration shows exactly registration name, password and invitation code. Login shows registration name and password. Password guidance states only “at least 8 characters”; no email verification or complexity language appears.
- Consequence: Invitation and field errors use explicit accessible alerts, and Auth implementation details such as the internal Supabase identifier remain invisible to users.

## DD-008 — Global header uses three explicit regions

- Date: 2026-07-12
- Status: Accepted and frozen during UX-06C Step 01
- Decision: At 768px and above, the global header separates the clickable `Fandom Harbor` brand anchor, primary navigation and utility/account controls into Left Brand、Center Navigation and Right Utility & Account regions. Reader primary navigation is ordered Archive、Search、then capability-gated Studio. Home is represented only by the brand anchor; theme stays in the right region.
- Rationale: A stable three-part hierarchy keeps brand、product movement and account state legible without making the header feel like a mixed toolbar.
- Consequence: Mobile may hide or simplify the center navigation, but the brand remains left and theme/account controls remain right. Theme and primary header targets keep a 44px minimum touch area. Auth、role、Studio access and theme persistence contracts do not change.

## DD-009 — Multi-chapter Studio preserves editing focus and safe batch publication

- Date: 2026-07-12
- Status: Accepted and frozen as supplemental Studio UX foundation
- Decision: A work with more than one chapter uses collapsible chapter management with one explicitly identified active editing chapter。Multi-chapter publication provides Select All for currently eligible chapters only，with none、partial and all states；zero selection cannot publish。
- Rationale: Flattened chapter editors destroy editing orientation，while repetitive manual selection adds friction and indiscriminate bulk selection weakens publication safety。
- Consequence: Published、ineligible、invalid and unsaved chapters cannot enter batch publication selection。Single-chapter works may retain the simple flow。Exact layout and implementation require a future independently authorized Author Studio / Chapter Management Mission。

## DD-010 — Reading controls use progressive disclosure

- Date: 2026-07-12
- Status: Accepted and frozen during UX-06C Step 02
- Decision: Chapter Reading defaults to Story Content with one quiet `Aa / 阅读设置` disclosure control。Font size、line height、measure and light / dark controls appear only after explicit activation and can be closed without resetting preferences。
- Rationale: Permanent controls compete with the first reading view and make the page feel like a control panel rather than a Private Literary Reading Space。
- Consequence: The disclosure target remains keyboard and screen-reader operable、at least 44px high and in document flow。Existing preference values、storage、theme behavior and Reader contracts do not change。

## DD-011 — Reading auxiliary panels are mutually exclusive

- Date: 2026-07-12
- Status: Accepted and frozen during UX-06C Step 03
- Decision: Chapter Directory、Mobile Reading Navigation and Reading Settings share one route-local active-panel state，so only one supporting surface can be open at a time。Directory panels open in document flow and explicit close actions restore focus to their trigger。
- Rationale: Multiple simultaneous controls compete with Story Content and make the Reading Page feel like an interface workspace rather than a Private Literary Reading Space。
- Consequence: Chapter switching returns to the default reading state；current Chapter remains marked with `aria-current`，and existing preference、route、permission、bookmark and history contracts do not change。

## Change protocol

New design decisions use sequential `DD-xxx` IDs with status, rationale and consequences. Never hide an experience change inside a component implementation. Superseded decisions remain in history and link to their replacement.
