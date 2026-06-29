# Fandom Harbor Design System

Status: Proposed for Phase 0.6 freeze

This directory is the single source of truth for reusable visual rules. `docs/05_UI/` describes experience and visual direction; `docs/06_Design_System/` defines tokens and layout rules; `docs/07_Component/` defines component implementation contracts.

## Token ownership

- `COLOR.md` — semantic colors and state usage
- `TYPOGRAPHY.md` — UI and reading type roles
- `SPACING.md` — spacing scale and composition rhythm
- `GRID.md` — page/container/grid structure
- `RADIUS.md` — corner geometry
- `ELEVATION.md` — border/shadow/overlay depth
- `MOTION.md` — duration, easing and reduced motion
- `RESPONSIVE_RULES.md` — content-driven breakpoints and adaptation
- `DARK_MODE.md` — dark-theme semantics
- `ACCESSIBILITY_RULES.md` — cross-system accessibility contract
- `READER_LAYOUT_RULES.md` — long-form reading layout
- `ADMIN_LAYOUT_RULES.md` — operational layout and density
- `DESIGN_TOKENS.md` — consolidated token overview

Apps and components consume semantic roles rather than raw values. A token change updates its owner file, `DESIGN_TOKENS.md`, `.ai/STYLE_GUIDE.md` when applicable, and visual regression evidence.

