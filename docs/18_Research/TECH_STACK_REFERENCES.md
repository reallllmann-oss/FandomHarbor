# Technology Stack Research Notes

Status: Verified against official documentation on 2026-06-28. Recheck at implementation/version-pin time.

## Next.js App Router

Official App Router documentation identifies file-system routing and React Server Components/Suspense/Server Functions as core capabilities. Architecture therefore defaults to Server Components and introduces client state deliberately.

Source: https://nextjs.org/docs/app

## Supabase Auth with Next.js

Official guidance separates browser and server clients for SSR, uses cookie-aware server handling, and warns against trusting unvalidated session state for server protection. It also warns that caching responses carrying refreshed auth cookies can cross-contaminate sessions. Fandom Harbor therefore validates trusted identity server-side and avoids shared caching for user-specific responses.

Source: https://supabase.com/docs/guides/auth/server-side/nextjs

## Supabase/PostgreSQL RLS

Official guidance requires RLS on exposed tables and explains that policies act on each access. Fandom Harbor treats RLS plus grants as the database authorization boundary and tests both allowed and forbidden cases.

Source: https://supabase.com/docs/guides/database/postgres/row-level-security

## TanStack Query

Server-rendering guidance supports prefetch/dehydrate/hydration but highlights the complexity of mixing server and client ownership. Fandom Harbor reserves it for genuinely client-managed server state rather than duplicating every Server Component read.

Source: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr

## TipTap and Next.js

TipTap's Next.js guidance requires client-aware editor setup and SSR care. The editor is therefore an isolated interactive boundary; structured JSON is validated and server rendering uses a trusted shared schema.

Source: https://tiptap.dev/docs/editor/getting-started/install/nextjs

## shadcn/ui

shadcn/ui distributes component source into the application rather than operating only as a black-box package. Fandom Harbor owns and governs customized primitives in `packages/ui` so Web, Admin and any future Docs UI do not drift.

Source: https://ui.shadcn.com/docs
