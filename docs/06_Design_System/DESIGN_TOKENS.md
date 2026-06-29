# Consolidated Design Tokens

Specialized files in this directory are authoritative for their domains. This document is the consolidated overview and must remain synchronized with Color, Typography, Spacing, Grid, Radius, Elevation, Motion, Responsive, Dark Mode, Accessibility, Reader Layout and Admin Layout rules.

Status: Proposed starting values; contrast and device validation required before implementation.

## Color roles

Colors are semantic variables. Product code must not use raw palette values.

| Token | Light proposal | Purpose |
|---|---|---|
| `background` | `#F7F5F1` | Warm archive canvas |
| `foreground` | `#24211F` | Primary text |
| `surface` | `#FFFFFF` | Cards, dialogs, reading sheet |
| `surface-muted` | `#EFECE6` | Secondary regions |
| `muted-foreground` | `#68615B` | Secondary text, must pass contrast |
| `border` | `#D8D1C8` | Dividers and controls |
| `primary` | `#71364D` | Brand/action burgundy |
| `primary-foreground` | `#FFFFFF` | Text on primary |
| `accent` | `#2F6262` | Secondary teal accent |
| `danger` | `#A33131` | Destructive/error |
| `warning` | `#946200` | Warning state |
| `success` | `#2F6A45` | Confirmed/success |
| `focus` | `#356FB6` | High-visibility focus ring |

Dark mode uses the same semantic roles with tested dark surfaces; do not mechanically invert. Rating and archive-warning colors require accompanying text/icon and separate contrast validation.

## Typography

| Role | Proposal |
|---|---|
| UI sans | system sans stack initially; brand font requires performance/language review |
| Reading serif | language-capable system serif initially; user can select sans |
| Mono | system mono for IDs/diff technical detail only |
| UI base | 16px / 1.5 |
| Reading base | 18px / 1.78, user-adjustable |
| Small metadata | minimum 13–14px with adequate contrast |
| Reading measure | default 68ch; adjustable range approximately 52–80ch |

Type scale proposal: 12, 14, 16, 18, 20, 24, 30, 36, 48. Use semantic roles rather than choosing sizes ad hoc.

## Spacing and shape

- Base spacing unit: 4px; scale 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.
- Control height: 40px default, 44px touch-focused, 32–36px only for dense desktop Admin contexts.
- Radius: 6px controls, 10px cards/dialogs; avoid excessive pill shapes for ordinary content.
- Borders define archival structure more often than heavy shadows.
- Elevation: flat, raised, overlay; no arbitrary per-page shadow variants.

## Layout

- Content shell max: ~1280px.
- Reading column: semantic `reading-measure`, not a fixed page width.
- Form column: ~720px for comprehension.
- Admin grid: 12-column desktop; list/table density remains user-readable.
- Breakpoints are implementation decisions validated against content, not device brands; proposed starting points: 640, 768, 1024, 1280, 1536px.

## Motion and z-index

- Duration: instant 0, fast 120ms, normal 180ms, deliberate 240ms.
- Easing roles: enter, exit, move; no page-specific curves.
- Z-index semantic levels: base, sticky, dropdown, overlay, modal, toast. Components do not invent numeric escalation.

## Token change protocol

Token changes require visual regression review across Reader, Author and Admin representative screens. Raw-value exceptions require a documented system-level reason.
