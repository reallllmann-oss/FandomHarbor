# Database Package Boundary

Owns reviewed repository and provider-adapter boundaries for the current Supabase PostgreSQL provider. Raw clients are internal; pages consume access-context repositories and identity-access service contracts instead of invoking Supabase directly.

SQL migrations, RLS policies, database functions and transactional SQL tests live under `supabase/`. This package contains static contract tests but does not apply migrations or create cloud resources.
