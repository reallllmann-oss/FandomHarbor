# Web Application Boundary

Next.js App Router application for Visitor introduction/access, Reader Frontend and Author Dashboard. It must not contain Admin/Super Admin operations or cross-application reusable modules.

Admin P0 WEB-01 connects only the eight public Site Copy fields through the
accepted Public Service and Repository. Server Components share one
request-scoped Snapshot across Homepage, Header and Footer; there is no
cross-request persistent cache. Each new complete request reads the current
database pointer, while an already open page does not update in real time.

Invalid fields fall back independently to the Version 1 Baseline. No row,
repository failure or unsafe bigint transport falls back completely without
fabricating a Version. CTA destinations, navigation paths/order/visibility,
the existing Studio capability, Footer legal links and all access behavior
remain code-owned. No Site Copy RPC, Supabase transport or internal metadata
is exposed to Client Components.

Sprint 002B Step 01 provides guarded work detail, chapter reading and standalone article routes. Reader pages consume the provider-neutral Content Service through `src/lib/reader-content.ts`; the current fixture `ContentStore` is replaced at that boundary when the Supabase database is available. Structured documents render as React nodes without raw HTML.

Sprint 002B Step 02 persists Light/Dark, font-size, line-height and reading-width preferences under `fandom-harbor.reader-preferences.v1`. This local browser state contains no identity or reading-history data and never writes to the database. Chapter pages expose explicit boundary states, chapter progress, a direct directory entry and an accessible current-chapter marker.

Sprint 002C Step 01 adds the guarded `/studio`, `/studio/works` and `/studio/articles` route tree. Studio pages reuse the 002A Work/Article types and existing `work:author` capability through `StudioContentGateway → Studio Content Service → StudioContentStore`; the current Store is an author fixture boundary, not a published Reader query.

Sprint 002C Step 02 adds the owner-scoped, read-only `/studio/works/[workId]` route. The Service injects the trusted owner ID, the fixture Store matches owner and work, Studio may display that author's draft chapters, and every create/edit/publish/archive action remains disabled.

Sprint 002C Step 03 adds the owner-scoped, read-only `/studio/articles/[articleId]` route. The Service injects the trusted owner ID, the fixture Store matches owner and article, Studio may display that author's draft articles, Reader remains published-only, and every article create/edit/publish/archive action remains disabled.

Sprint 002E Step 02 enables real draft-body persistence in `/studio/works/[workId]/edit` by saving the current body into the first Chapter through the existing Studio draft editor boundary.

Sprint 002F completes the minimal publish closure. The draft editor now supports publish through the same server-owned boundary, and Reader routes use a hybrid published-content gateway so newly published database-backed Works become readable immediately without removing existing fixture-based published content.

Sprint 002G completes the public reading closure by moving `/articles/[slug]` onto the same hybrid published-content gateway. Public Reader pages now consistently prefer published database content and only fall back to published fixture content when runtime data is unavailable.

Sprint 002H completes the minimum Bookshelf / Library pass. `/works` now acts as the Reader Library Hub, combining published-only browse results with local continue-reading, recent bookmark and shelf-summary affordances, while `/archive` remains the detailed local shelf page.
