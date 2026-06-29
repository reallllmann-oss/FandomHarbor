# Auth Package Boundary

Owns provider-neutral `TrustedIdentity`, `TrustedSession`, membership/role capabilities and the current Supabase browser/server auth adapter. Supabase `User`, `Session` and client types remain inside the provider implementation.

It does not treat UI hiding as authorization, embed service credentials, or replace PostgreSQL RLS and server/database authorization. Phase 1C supports verified email/password only; other authentication methods require an explicit decision.
