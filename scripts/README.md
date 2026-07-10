# Scripts Boundary

Project automation must be idempotent where practical, fail clearly, avoid hidden
remote state changes and never embed secrets.

## Local QA fixture

- `pnpm qa:credentials` displays the Git-ignored local acceptance credentials in
  the current terminal after verifying the file is local-only and mode `0600`.
- `pnpm qa:fixture` creates or repairs the synthetic local Reader/Author acceptance
  identities, active memberships, Author grant, Author public profile and invitation
  relationship.
- `pnpm qa:reset` performs a local-only clean rebuild and then restores the same
  fixture.
- The command refuses non-local Supabase URLs and never reads or writes linked remote
  data.
- Passwords and the plaintext invitation code are generated into
  `.local/qa-fixture.json`, mode `0600`; `.local/` is Git-ignored.
- `pnpm qa:web` starts only the Web app with the local Supabase URL/key injected into
  that process. It does not overwrite the existing `.env.local`.
