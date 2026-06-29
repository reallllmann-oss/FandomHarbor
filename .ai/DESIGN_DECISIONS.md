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

## Change protocol

New design decisions use sequential `DD-xxx` IDs with status, rationale and consequences. Never hide an experience change inside a component implementation. Superseded decisions remain in history and link to their replacement.
