# Local QA Fixture

Status: Active — RR-1C acceptance support

Environment: Local development and Product Owner acceptance only

## Purpose

Restore the minimum authenticated acceptance identities after a local Supabase
clean rebuild. This fixture does not change Auth architecture, Permission Model,
RLS, migrations or production data.

## Accounts

| Capability | Login registration name | Expected access                                |
| ---------- | ----------------------- | ---------------------------------------------- |
| Reader     | `Harbor QA Reader`      | Reader pages; no Studio capability             |
| Author     | `Harbor QA Author`      | Reader pages, public Author profile and Studio |

Passwords and the plaintext invitation code are intentionally absent from this
document. They are generated into `.local/qa-fixture.json`, which is Git-ignored
and written with local file mode `0600`.

## Create or repair

With the local Supabase stack running:

```bash
pnpm qa:fixture
```

For a clean local database rebuild followed by fixture restoration:

```bash
pnpm qa:reset
```

Run the Web app against local Supabase without replacing `.env.local`:

```bash
pnpm qa:web
```

Open `http://localhost:3000/auth/sign-in` and use the registration names above.
Read the matching password only from `.local/qa-fixture.json` on the same machine.

## Safety contract

- The fixture command reads Supabase runtime values from the local CLI status.
- It refuses any API host other than `localhost`, `127.0.0.1` or `::1`.
- It never uses the linked project, production URL or production data.
- It is idempotent: repeated execution repairs the same local fixture state.
- It creates two active Memberships, one active Author grant, one public Author
  profile and one Reader-to-Author invitation redemption.
- `qa:web` injects local runtime values only into its child process and does not
  overwrite `.env.local`.

## Verification baseline

- Author and Reader password login: PASS.
- Reader published-content page access: PASS.
- Author public profile: PASS.
- Author Studio access: PASS.
- Reader Studio denial/redirect: PASS.
- Browser console errors during fixture QA: 0.
- Fixture recreation after `supabase db reset --local --no-seed`: PASS.
