# Local QA Fixture

Status: Accepted — RR-1C Product Owner Accepted

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

## View local credentials

Run this command from the project root on the same machine that created the
fixture:

```bash
pnpm qa:credentials
```

The command displays the local Author/Reader registration names, passwords,
Author profile path and invitation code in the current terminal only. It refuses
files that are not marked `local-only` or are readable by other system users.

For every Mission that enters manual QA, running this command and validating the
accounts is mandatory. A previously passing Fixture record is not sufficient
evidence for a new handoff. Follow
[Manual QA Handoff](MANUAL_QA_HANDOFF.md) for the complete delivery gate.

Do not copy the output into issues, commits, screenshots, chat messages or public
documentation. If the command reports that credentials do not exist, run
`pnpm qa:fixture` first. If it reports unsafe permissions, run:

```bash
chmod 600 .local/qa-fixture.json
```

## Create or repair

With the local Supabase stack running:

```bash
pnpm qa:fixture
```

This command also creates the Reading QA Fixture Library:

- `/works/qa-reading-short`
- `/works/qa-reading-longform`
- `/works/qa-reading-empty`
- one Draft-only Work that remains visible only to its QA Author

Remove only the Reading QA content while preserving QA identities:

```bash
pnpm qa:fixture:clean
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
Read the matching password with `pnpm qa:credentials` on the same machine.

## Acceptance account guide

### Author

1. Start the local Web app with `pnpm qa:web`.
2. Open `http://localhost:3000/auth/sign-in`.
3. Use the Author registration name and password shown by
   `pnpm qa:credentials`.
4. Verify `/author/harbor-qa-author` and `/studio`.

### Reader

1. Sign out from the Author account.
2. Use the Reader registration name and password shown by
   `pnpm qa:credentials`.
3. Verify `/works` can be opened.
4. Verify `/studio` redirects the Reader away because the account has no Author
   grant.

## Safety contract

- The fixture command reads Supabase runtime values from the local CLI status.
- It refuses any API host other than `localhost`, `127.0.0.1` or `::1`.
- It never uses the linked project, production URL or production data.
- It is idempotent: repeated execution repairs the same local fixture state.
- It creates two active Memberships, one active Author grant, one public Author
  profile and one Reader-to-Author invitation redemption.
- Reading fixtures use fixed QA-only UUIDs and `qa-reading-*` slugs. Creation first
  removes only those fixed records and then recreates the exact Library.
- Long-form text is synthetic, generated locally and never sourced from user work.
- `qa:fixture:clean` removes only the fixed Reading QA Works, Chapters and Work Tag
  links; it does not remove identities, credentials or role grants.
- `qa:web` injects local runtime values only into its child process and does not
  overwrite `.env.local`.
- `qa:credentials` reads only the Git-ignored local credential file and performs
  no database or network operation.

## Verification baseline

- Author and Reader password login: PASS.
- Reader published-content page access: PASS.
- Author public profile: PASS.
- Author Studio access: PASS.
- Reader Studio denial/redirect: PASS.
- Browser console errors during fixture QA: 0.
- Fixture recreation after `supabase db reset --local --no-seed`: PASS.
- Reading Fixture repeated creation and exact-count validation: PASS.
- Reading Fixture content-only cleanup and recreation: PASS.
- Reader published-only access and Draft isolation: PASS.

Any future Fixture, password, login, invitation or QA environment failure is a P0
handoff blocker. Run `pnpm qa:fixture` to repair the existing local state, or
`pnpm qa:reset` when a clean rebuild is required, then repeat credential and login
validation before reporting the Mission ready for manual acceptance.
