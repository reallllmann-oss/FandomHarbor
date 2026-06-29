# UI Design Bible

Status: Proposed

## 1. Character

Modern, minimal, elegant, archival, comfortable, responsive, reading-first and mobile-first. Inherit AO3's respect for metadata and creator control—not its visual styling.

The interface should feel like a well-kept private library: calm enough for long reading, precise enough for research-like filtering, and serious enough for moderation work.

## 2. Experience hierarchy

1. Content and warnings
2. Reading/navigation continuity
3. Metadata and discovery
4. Authoring clarity
5. Administration efficiency
6. Decorative expression

Decoration must never compete with prose, ratings, warnings or action state.

## 3. Reading layout

- Prose remains the visual focus and never becomes an unbounded full-width desktop column.
- Reading typography and measure are comfortable and user-adjustable; exact reusable values belong to `../06_Design_System/TYPOGRAPHY.md` and `READER_LAYOUT_RULES.md`.
- Persistent but unobtrusive chapter context and previous/next navigation.
- Reader controls: font scale, line height, measure/theme; persist privately.
- Metadata appears before reading, with warnings/rating unmistakable and keyboard accessible.
- Long tag groups support readable wrapping and intentional expansion, not tiny chips everywhere.

## 4. Responsive model

- Mobile is the first design context; exact breakpoints and touch dimensions belong to `../06_Design_System/RESPONSIVE_RULES.md` and `ACCESSIBILITY_RULES.md`.
- Reader actions remain safe-area-aware and comfortably reachable.
- Desktop adds whitespace and supporting panels; it does not inflate line length.
- Author forms become staged sections on mobile and may use side navigation on desktop.
- Admin is desktop-optimized; small screens preserve review safety and prohibit accidental truncated decisions.

## 5. Accessibility

- Accessibility is part of the intended experience; the normative target and reusable rules live in `../06_Design_System/ACCESSIBILITY_RULES.md`.
- One logical heading hierarchy, landmarks, visible focus and skip navigation.
- Every icon-only control has an accessible name; decorative Lucide icons are hidden.
- Color never carries status alone. Rating/warning/moderation states include text/icon/shape.
- Dialog focus is trapped/restored; errors are summarized and linked to fields.
- Respect zoom, font scaling, reduced motion, high contrast and keyboard-only use.
- Rich editor exposes semantic controls and a non-visual validation/status path.

## 6. Motion

- Motion explains state change, location or hierarchy; it never delays reading.
- Default transitions are short and subtle. No parallax or attention loops in reading views.
- Reduced-motion removes nonessential transform/animation.

## 7. Product-specific patterns

- Work card: title, pen name, essential metadata, summary, tags, stats; no feed-like engagement emphasis.
- Warning gate: informative, reversible and not shame-oriented.
- Canonical tag: distinguish canonical label, aliases and type.
- Revision compare: clear before/after identity, semantic change emphasis and restore consequence.
- Report workflow: evidence and action chronology, reporter privacy and explicit reasoning.
- Audit event: who/what/when/target/reason/correlation, with restricted private fields.

## 8. Content and language

- Use plain, respectful language. Avoid gamified labels and urgency manipulation.
- Destructive actions name the object and consequence.
- Permission errors explain what is unavailable without revealing hidden resource existence.
- Empty states teach the next archive-relevant action; they do not push social engagement.

## 9. Design review gate

Review content hierarchy, every state, mobile/desktop, keyboard, screen reader semantics, contrast, long localization strings, large tag sets, long titles, empty/huge chapters, slow/error paths and permission-denied behavior before implementation.
