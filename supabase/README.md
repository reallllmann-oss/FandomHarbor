# Supabase Boundary

Home of ordered SQL migrations, RLS/grants, reviewed database functions and transactional SQL verification scripts. Dashboard-only schema changes are prohibited.

Phase 1C identity/access and Phase 2 content-domain migrations are tracked locally. The Phase 2 Auth P0 migrations add case-insensitive registration names, classified invitation preflight and an `auth.users` trigger that atomically creates Profile, active Membership, Redemption and audit state. Invalid invitations roll back the Auth user insert. No hosted Supabase project is created or modified by these files.

On 2026-07-02, `supabase db reset` applied all nine Migrations successfully. `phase_1c_identity_access.sql`, `phase_2_content_domain.sql` and `phase_2_auth_registration.sql` passed against local PostgreSQL; a real local Auth signup and password login also returned sessions with email confirmation disabled.

The Supabase project currently configured in `.env.local` is remote and does not contain the registration RPCs. It returns `PGRST202`; remote deployment and Auth configuration verification remain a Phase 2 P0 blocker.
