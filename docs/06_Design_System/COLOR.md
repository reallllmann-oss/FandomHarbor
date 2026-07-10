# Color System

Status: Proposed

Semantic roles are authoritative: `background`, `foreground`, `surface`, `surface-muted`, `muted-foreground`, `border`, `primary`, `accent`, `danger`, `warning`, `success` and `focus`. Product code must not select raw palette colors.

Rules:

- Body text, interactive text and controls target WCAG 2.2 AA contrast.
- Rating, warning, moderation and validation states use text/icon/shape in addition to color.
- `primary` represents deliberate product actions, not arbitrary decoration.
- `danger` is reserved for destructive/error meaning; `warning` does not imply guilt.
- Focus color must remain distinguishable from borders and backgrounds in both themes.
- Tag types do not become a rainbow taxonomy; labels and structure carry meaning.

Initial light values remain cataloged in `DESIGN_TOKENS.md`; final values require contrast verification before implementation.
