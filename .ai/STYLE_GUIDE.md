# Concrete Style Guide

This file is the quick-reference contract for UI dimensions and visual behavior. `UI_DESIGN_SYSTEM.md` defines principles; `DESIGN_DECISIONS.md` records rationale; experience lives under `docs/05_UI/`, reusable rules under `docs/06_Design_System/`, and implementation contracts under `docs/07_Component/`.

## Reading

- Default body size: 18px equivalent; system default must not fall below 17px on mobile.
- Reader-controlled font range: approximately 16–24px without layout breakage.
- Default line height: 1.78; supported range approximately 1.5–2.0.
- Default measure: 68ch; supported range approximately 52–80ch; prose never stretches across a desktop viewport.
- Paragraph spacing and indentation must be mutually coherent and user preference must not create both accidentally.
- Chapter navigation has labeled previous/next actions and never depends on swipe or hover alone.

## Controls and spacing

- Standard button/input height: 40px desktop; primary touch controls at least 44×44px.
- Compact Admin controls: minimum 36px and only where density does not harm safety/accessibility.
- Control radius: 6px. Card/dialog radius: 10px. Avoid indiscriminate pill shapes.
- Base spacing unit: 4px. Common form field gap: 12px; related group gap: 20–24px; major section gap: 32–48px.
- Visible focus ring uses the semantic focus token and is never removed without an equivalent.

## Mobile navigation

- Reader/Web primary mobile navigation contains at most five top-level destinations.
- Reading view prioritizes chapter context and reading controls over global navigation.
- Author workflows may use staged sections; no essential action is hover-only.
- Admin small-screen navigation uses a labeled drawer/side-sheet; destructive actions never hide in unlabeled gestures.

## Admin tables

- Default row height: approximately 44px; optional compact density: 36px after user choice.
- Headers remain readable and keyboard-operable; sticky behavior must not obscure focus.
- Bulk actions display selected count and scope, and distinguish current page from all results.
- Small-screen fallback preserves field labels and confirmation context.

## Tags

- Tag text target: 13–14px minimum with adequate contrast; touchable tags meet 44px target through surrounding hit area when interactive.
- Tags wrap naturally; large groups use intentional expansion without hiding ratings/warnings.
- Type is communicated by label/structure, never arbitrary rainbow color alone.
- Canonical, alias, pending and deprecated states have consistent text and icon treatment.
- Relationship/CP tags remain distinguishable from generic additional tags.

## Forms and cards

- Labels are persistent; placeholders are examples, not label replacements.
- Errors appear inline and in a summary for long forms, with focus links.
- Cards use border/spacing before heavy shadow. Work cards prioritize title, pen name, rating/warnings, summary and metadata before counts.
- Destructive confirmations name the object and consequence and require a reason when the action is audited.

## Responsive and accessibility

- Starting breakpoints: 640, 768, 1024, 1280 and 1536px; content behavior, not device branding, determines final use.
- Target WCAG 2.2 AA. Never use color alone for rating, warning, moderation or validation state.
- Respect zoom, font scaling, reduced motion, safe areas, keyboard and screen-reader navigation.

Any value changed during implementation must update this file and, when the rationale changes, `DESIGN_DECISIONS.md`.
