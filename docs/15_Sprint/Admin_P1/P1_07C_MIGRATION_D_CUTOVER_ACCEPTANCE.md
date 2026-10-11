# Admin P1-07C Migration D Cutover Acceptance

Status: `PASS / MIGRATION D APPLIED AND VERIFIED / POST-CUTOVER BACKUP AVAILABLE`

Execution date: 2026-10-10（Asia/Shanghai）

This gate applied exactly the accepted Migration D to the exact Production
project, completed minimum Post-D acceptance, created a fresh verified
Post-Cutover Backup and stopped. It did not deploy an application, resume Formal
Admin, open the Web Admin Entry, merge a PR or perform a new elevated mutation.

## 1. Final pre-execution gate

| Item                     | Verified value                                                        |
| ------------------------ | --------------------------------------------------------------------- |
| Production               | `fandom-harbor` / `szfhngifsipsrxcpekti` / `ACTIVE_HEALTHY`           |
| Starting migration state | exactly 20; Pre-D applied; Migration D absent                         |
| Canonical Product RC     | `f42217d913d44517b53935a68488100610bdff0f`                            |
| Starting closure HEAD    | `222f2d510ea1a1fc493ac12d98dd9c5dfb5aa96c`                            |
| Product code drift       | NO — RC to closure changes were docs/evidence only                    |
| Migration D              | `20260819225318_admin_p1_identity_access_cutover.sql`                 |
| Migration D SHA-256      | `b44ed44145b25cdf4524f1e7fbdec802a2bb84972ce07c467e4ff4edbc95d69e`    |
| Migration ordering       | Pre-D is 20; D is direct successor 21; no inserted migration          |
| Active Super Admins      | exactly 2; no third                                                   |
| Commissioning            | Grant/Audit/Ledger/Consume `1/1/1/1`; unconsumed intent `0`           |
| Pre-Cutover Backup       | `20261010-003942_P1-07C-4A10D_R1_POST_COMMISSIONING`; reverified PASS |

Result: `MIGRATION D IMMUTABILITY = PASS` and final execution gate `PASS`.

## 2. Exact Migration D execution

An isolated temporary Supabase workdir contained exactly 21 migrations and was
linked only to `szfhngifsipsrxcpekti`; the repository worktree's QA link was not
changed. `supabase migration list` showed the first 20 versions matched local
and remote, with only `20260819225318` pending. `supabase db push --dry-run`
named only the exact Migration D file.

Supabase CLI `2.108.0` executed one normal linked push:

- start: `2026-10-10T00:48:37Z` / `2026-10-10T08:48:37+0800`;
- completion: `2026-10-10T00:48:44Z` / `2026-10-10T08:48:44+0800`;
- applied file: `20260819225318_admin_p1_identity_access_cutover.sql`;
- exit: `0`;
- execution count: exactly one; no retry.

The CLI emitted a local migration-catalog cache certificate warning after the
SQL apply and also reported `Finished supabase db push`. Independent management
API and SQL verification removed ambiguity: Production had exactly 21 migration
rows, Pre-D once, D once, latest version `20260819225318`, and remained
`ACTIVE_HEALTHY`. No second apply, repair or manual SQL completion occurred.

The Production database password was read from macOS Keychain into the process
environment only. It was not placed in arguments, output, files, documentation
or Git.

Result: `MIGRATION D EXECUTION = PASS`.

## 3. Post-D database acceptance

| Surface                                   | Final execute matrix                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| Legacy ordinary RPCs, 3 × 4 app roles     | `0/12`                                                   |
| Ordinary v2 RPCs, 3 × 4 app roles         | `3/12`; only `authenticated`                             |
| Read RPCs, 3 × 4 app roles                | `3/12`; only `authenticated`                             |
| Private helpers/executor, 9 × 4 app roles | `0/36`                                                   |
| Elevated public RPCs, 4 × 4 app roles     | `4/16`; only `authenticated`, with runtime policy checks |

All 22 inspected functions had the expected exact signature, `postgres` owner,
empty fixed `search_path`, volatility and invoker/definer mode. The three legacy
write RPCs remain present but execute-closed; no stale executable legacy bypass
exists. The ordinary v2 RPCs are the only newly executable cutover surface.

`profiles`, `memberships`, `role_grants`, `audit_logs`, the private request
ledger, commissioning policy and elevated intents retain RLS. The private tables
expose no direct select or write privilege to `PUBLIC`, `anon`, `authenticated`
or `service_role`; public governance tables expose authenticated read only and
no direct application-role write.

Result: `POST-D DATABASE ACCEPTANCE = PASS`.

## 4. Identity and commissioning preservation

| Identity / state           | Final live result                                 |
| -------------------------- | ------------------------------------------------- |
| `Phase2RemoteInviter`      | active; `author + super_admin`; verified TOTP `2` |
| `akumie`                   | active; `super_admin`; verified TOTP `2`          |
| Active Super Admin count   | `2`                                               |
| Third Super Admin          | `0`                                               |
| Grant/Audit/Ledger/Consume | `1/1/1/1`                                         |
| Unconsumed elevated intent | `0`                                               |

Migration D changed only function execute privileges. It created no duplicate
Role, Audit, ledger or consume record and changed no Membership or MFA state.

Result: `COMMISSIONING STATE PRESERVED = PASS`.

## 5. Security boundary and minimum Production smoke

Read-only Production probes confirmed:

- an ordinary authenticated identity can read its own Profile and Membership;
- the live Super Admin can search `akumie`, obtain protected Detail and read the
  target Audit projection;
- Search returned one exact target, Detail identified the elevated target and
  Audit returned the existing one-item governance history;
- Author, Reader and the non-authorized second Super Admin are denied by the
  exact commissioning policy; Guest has no execute privilege;
- Production has no active ordinary Admin for a new live denial probe; accepted
  A8 ordinary-Admin evidence and the unchanged exact actor/live-role contract
  remain authoritative;
- no elevated write, Role/Membership change, intent issuance or business
  mutation was used for smoke.

Three targeted contract files passed: trusted Auth 11 tests, elevated governance
54 tests and Migration D contract 30 tests, for 95/95 total. They revalidated
trusted claims, AAL2/fresh TOTP and Session binding, sole allowed
`grant_super_admin`, exact actor/target/request/state binding and final ACL.

Results: `POST-D SECURITY BOUNDARY = PASS` and
`POST-D MINIMAL SMOKE = PASS`.

## 6. Fresh Post-Cutover Backup

Exactly one new backup process created:

`20261010-085250_P1-07C_MIGRATION_D_POST_CUTOVER`

| Item                   | Verified value                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Timestamp              | `2026-10-10T08:52:50+0800` / `2026-10-10T00:52:50Z`                                                     |
| Directory              | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/20261010-085250_P1-07C_MIGRATION_D_POST_CUTOVER` |
| Project                | exact `szfhngifsipsrxcpekti`                                                                            |
| Migration state        | 21; Pre-D applied; D applied                                                                            |
| Identity/commissioning | two controlled Super Admins; TOTP 2 each; `1/1/1/1`; unconsumed 0                                       |
| Manifest / inventory   | PASS; pre/post inventory byte-identical                                                                 |
| Checksums              | every listed artifact PASS                                                                              |
| Archive verification   | four `pg_restore --list` and offline parses PASS                                                        |
| Permissions            | directory `0700`; all files `0600`                                                                      |
| Sensitive scan         | PASS                                                                                                    |
| Restore                | NOT EXECUTED                                                                                            |

The durable Auth subset excludes raw MFA factors, MFA recovery codes, Sessions,
refresh tokens and challenge/flow state. Sanitized factor metadata contains no
TOTP secret, QR payload or OTP. Pre-Cutover Backup
`20261010-003942_P1-07C-4A10D_R1_POST_COMMISSIONING` remains preserved and was
not overwritten.

Result: `FRESH POST-CUTOVER BACKUP = PASS`.

## 7. Preserved release boundaries

- Product/runtime/Auth/Migration source changed: NO.
- Production deployment: NOT EXECUTED.
- Formal Admin live check: unavailable; repository authority remains
  `paused=true`; state unchanged by this task.
- Web Admin Entry live check: unavailable; repository authority remains
  `disabled / closed`; state unchanged by this task.
- New commissioning, third Super Admin or existing-Super-Admin revoke: NOT
  EXECUTED.
- PR merge, force push, rebase or destructive restore: NOT EXECUTED.

## 8. Final decision

Production is `ACTIVE_HEALTHY` at exactly 21 migrations with Migration D applied
once. Post-D database acceptance, commissioning preservation, security boundary,
minimum read smoke and the fresh Post-Cutover recovery point all pass.

Final verdict:

`MIGRATION D CUTOVER = PASS`

The next boundary is Product Owner post-cutover release authorization. Formal
Admin remains paused, Web Admin Entry remains closed, Production deployment
remains unauthorized and PR #4 remains unmerged.
