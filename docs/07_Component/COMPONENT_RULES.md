# Component Rules

Status: Proposed

## Ownership

- `packages/ui` owns tokens, shadcn-based primitives and truly shared archive components.
- Apps own domain composition and routes.
- A component enters shared UI only after its API is domain-neutral or intentionally a shared archive pattern.
- Copy-pasted variants and deep styling overrides are prohibited; add a reviewed variant or compose locally.

## Required component states

Default, hover where relevant, active, focus-visible, disabled, loading, invalid and read-only. Data components also define empty, error, denied and stale/conflict states.

## Core component families

- Foundations: Button, Link, Input, Textarea, Select/Combobox, Checkbox, Radio, Switch, Dialog, Drawer, Popover, Tooltip, Tabs, Toast, Skeleton.
- Archive: WorkCard, MetadataList, Tag/CanonicalTag, RatingBadge, WarningNotice, PenNameLink, SeriesList, ChapterNavigation.
- Reading: ReadingShell, ReaderToolbar, ChapterBody, Footnote/Endnote, ProgressRestore.
- Authoring: RichTextEditor, PublicationChecklist, RevisionStatus, MetadataEditor, AutosaveIndicator.
- Admin: DataTable, FilterBar, BulkActionBar, AuditTimeline, ReportStatus, PermissionGuard, DestructiveActionDialog.

## Forms

- React Hook Form manages complex client state; Zod is the shared validation contract.
- Server repeats validation and authorization. Client success never proves server validity.
- Show inline errors plus a form-level summary for long forms.
- Preserve safe user input after server errors and warn before losing dirty state.
- Destructive/high-risk forms require object-specific confirmation and reason where audited.

## Tables and collections

- Use semantic tables for tabular data, not div grids.
- Sorting/filtering/pagination state is explicit and accessible.
- Bulk selection announces count and scope; “all results” is distinct from “this page.”
- Mobile fallback preserves labels and action safety.

## Icons

- Lucide is the only default icon set.
- Icons reinforce labels; icon-only controls need tooltips and accessible names.
- Do not use different icons for the same action across apps.

## Rich content

- TipTap toolbar groups semantic actions and exposes active state.
- Unsupported pasted formatting is removed or normalized predictably.
- Editor, preview and reader rendering share the same document schema and rendering rules.
- Never render user-provided raw HTML directly.

## Review tests

Components are reviewed in light/dark themes, keyboard, screen reader semantics, zoom, long translated content, reduced motion, touch, error/loading and dense-real-data scenarios.
