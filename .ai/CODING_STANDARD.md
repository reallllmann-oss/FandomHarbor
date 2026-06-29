# Coding Standard

These standards apply to the approved Next.js/TypeScript monorepo described in `TECH_STACK.md`.

## General

- Prefer clear, small, single-purpose modules and descriptive names.
- Reuse shared behavior; do not duplicate components, schemas, validation, or authorization logic.
- Keep domain rules independent from presentation code where practical.
- Validate all external input at the system boundary.
- Handle loading, empty, error, denied, and success states explicitly.
- Do not commit secrets, credentials, generated build output, or local environment files.
- Avoid speculative abstractions and unrequested features.
- TypeScript must run in strict mode. Avoid `any`; narrow `unknown` at boundaries.
- Server-only modules must be clearly isolated and must never be imported by client bundles.
- React Server Components are the default; `"use client"` requires an interaction or browser-API reason.
- Zod schemas define runtime boundaries. Do not cast untrusted data into trusted types.
- All user-visible text must be prepared for localization even if the first release is single-language.

## Quality

- New behavior requires proportionate automated tests.
- Bug fixes should include a regression test where feasible.
- Formatting, static checks, tests, and builds must pass before a task is marked complete.
- Accessibility and responsive behavior are acceptance criteria for user-facing features.
- Comments explain why a non-obvious choice exists, not what straightforward code does.
- Test names describe behavior and permissions, not implementation details.
- A failing check is fixed or explicitly documented as a blocker; checks are never silently disabled.

## Project boundaries

- `apps/web`: public introduction, authentication gate, Reader Frontend and Author Dashboard.
- `apps/admin`: Admin and Super Admin Dashboard; desktop-optimized but safe and usable on smaller screens.
- `apps/docs`: future read-only renderer for approved documentation; it must not become a second editable source.
- `packages/ui`: reusable design-system primitives and composed shared UI.
- `packages/editor`: TipTap schema, validation, sanitization, rendering and content migrations.
- `packages/auth`: shared Supabase auth clients and trusted identity/capability helpers.
- `packages/config`: shared tooling configuration.
- `packages/database`: database client, generated types, migrations support, and data-access boundaries.
- `packages/services`: approved application services and external-provider adapters, not miscellaneous logic.
- `packages/types`: stable cross-app types without a clearer runtime/schema owner.
- `packages/constants`: reviewed non-secret domain constants; never policy or environment secrets.
- `packages/utils`: framework-independent, tested utilities.

No `apps/shared` implementation is permitted. Cross-application code belongs in a purpose-specific package so ownership and dependencies remain explicit.

## Next.js rules

- Server reads stay close to the route that owns them; client-side refetching is added only when UX needs it.
- Same-application mutations may use Server Actions; externally callable, upload, webhook, or explicit HTTP contracts use Route Handlers.
- Authentication checks at routing boundaries improve UX, but sensitive reads and writes still enforce server authorization and RLS.
- Cache scope and invalidation must be documented. Authenticated or user-specific responses must never enter a shared cache.
- Use route groups by experience/domain, not by arbitrary component type.

## Dependency rules

- Apps may depend on packages; packages must never depend on apps.
- Domain/database packages must not import UI packages.
- New dependencies require a documented need, maintenance/security check, and approval in the task review.
- Deep imports across package internals are prohibited; use public package exports.

Detailed conventions and naming examples belong in `docs/02_Architecture/SYSTEM_ARCHITECTURE.md` and are finalized when scaffolding is approved.
