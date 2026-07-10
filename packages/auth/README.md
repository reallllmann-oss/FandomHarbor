# Auth Package Boundary

Owns provider-neutral `TrustedIdentity`, `TrustedSession`, membership/role capabilities and the current Supabase browser/server auth adapter. Supabase `User`, `Session` and client types remain inside the provider implementation.

It does not treat UI hiding as authorization, embed service credentials, or replace PostgreSQL RLS and server/database authorization. The current V1 contract uses registration-name/password credentials with invitation-gated atomic signup. Supabase receives an internal non-deliverable identifier; users do not provide or verify an email. Other authentication methods require an explicit decision.
