# Database Package Boundary

Owns reviewed repository and provider-adapter boundaries for the current Supabase PostgreSQL provider. Raw clients are internal; pages consume access-context/content repositories and service contracts instead of invoking Supabase directly. Phase 2 / Sprint 002A adds typed rows for all seven content tables plus a runtime-validating Supabase content Repository adapter. Sprint 002D-Step02 adds the Zod-validating `createAuthorWorkDraft` adapter backed by the atomic `create_author_work_draft` RPC.

Sprint 002E-Step01 adds an owner-RLS-backed read Repository for draft Work metadata, Category/Tags and ordered Chapters. Sprint 002E-Step02 extends that adapter with the first approved Chapter-body write path: it reuses existing owner RLS, adds only a minimal `UPDATE (content, content_schema_version)` grant Migration and either creates the first draft Chapter or updates the same first Chapter. Sprint 002F adds the minimal publish adapter path: it reuses the same owner grants, promotes the first Chapter and Work to `published`, and introduces no new RPC or schema object.

SQL migrations, RLS policies, database functions and transactional SQL tests live under `supabase/`. This package contains static contract tests but does not apply migrations or create cloud resources.
