# UI Design System

## Experience principles

- Long-form reading comfort takes priority over decorative density.
- Mobile is a first-class experience, not a reduced desktop layout.
- The visual language should feel contemporary, calm, private, and archival—not like a feed or popularity contest.
- Metadata must remain scannable even when works contain many tags.
- Admin screens prioritize clarity, auditability, and efficient desktop workflows.

## Baseline requirements

- Define semantic design tokens before page-specific styling: color, typography, spacing, radius, elevation, motion, and breakpoints.
- Support comfortable line length, adjustable reading typography, strong hierarchy, and stable chapter navigation.
- Meet WCAG 2.2 AA as the target for contrast, focus, keyboard access, labels, and touch targets.
- Never use color alone to communicate rating, warning, moderation, or validation state.
- Respect reduced-motion and user font scaling preferences.
- Every screen must define loading, empty, error, permission-denied, and destructive-confirmation states where applicable.

## Required design artifacts

- Brand direction and color semantics
- Typography scale and reading controls
- Spacing and layout grid
- Responsive breakpoints
- Core components and interaction states
- Web and Admin information architecture
- Accessibility acceptance checklist

Visual experience is documented in `docs/05_UI/`; reusable tokens/layout/accessibility rules in `docs/06_Design_System/`; component behavior in `docs/07_Component/`. Values remain subject to accessibility and device validation before implementation.

## Component governance

- shadcn/ui is the accessible primitive starting point; Fandom Harbor's semantic components live in `packages/ui`.
- Apps may compose domain screens but may not fork base components or hardcode new visual systems.
- Reader typography and metadata components are shared system assets, not page-local styling.
- Dense Admin tables must offer keyboard operation, responsive fallback and clear bulk-action confirmation.
