# Admin P1-05 Final Closure Audit

Status: `PASS / READY FOR PRODUCT OWNER CLOSURE COMMIT AUTHORIZATION`

Audit date: 2026-08-22
Branch: `codex/admin-p1-04-ordinary-mutations`
Audited HEAD: `065e7626119789845471351cfbc1e71329c5735e`
Parent: `f00743c4e8ae7604b1b8114f29cf7fdec32f2e63`

This is a local final audit. It created no new remote evidence and performed no
Supabase Auth, SQL, RPC, ACL, Migration, fixture, login, QA write-window,
Production or deployment operation. Remote conclusions below come only from the
already committed lifecycle evidence.

## Decision

- P1-05 `Local + Dedicated Non-Production Remote QA`: `PASS / READY TO CLOSE`.
- P1-05 final closure evidence: `READY FOR PRODUCT OWNER COMMIT AUTHORIZATION`.
- P1-06 Protected Admin Preview Acceptance: `READY FOR PRODUCT OWNER
AUTHORIZATION / NOT STARTED`.
- P1-07: `NOT AUTHORIZED / NOT STARTED`.
- P1.1 Elevated Access Governance: `DEFERRED / NOT AUTHORIZED`.
- Admin Production remains `paused=true`; Web Admin entry remains closed; P0
  Production Site Copy remains Version 7.

## Git and evidence integrity

The worktree was clean before the audit. The branch, HEAD and parent matched the
authorized baseline. Each required node is an ancestor of the audited HEAD, with
no history rewrite detected:

| Evidence gate                    | Commit                                     | Audit     |
| -------------------------------- | ------------------------------------------ | --------- |
| P1-05A preparation               | `4990440cb0a6e341ce242380480a06fe0c62ea14` | PASS      |
| P1-05B-1R1 hosted ACL correction | `4f93db9a834843da7640bdf52a31817f2ff528e1` | PASS      |
| P1-05B-1R2 clean bootstrap       | `75efba48e57381f13398b63c0cadc44c4b9b2e17` | PASS      |
| P1-05B-2 read/denial QA          | `3f45ce7459e67e7f6b8844024bfd64181a1a8374` | PASS      |
| P1-05B-3 blocked Attempt 1       | `c407cb0edd49c1a0a82a7551c4c57752d5007d11` | PRESERVED |
| P1-05B-3R1 composition fix       | `f00743c4e8ae7604b1b8114f29cf7fdec32f2e63` | PASS      |
| P1-05B-3R2 remote retry evidence | `065e7626119789845471351cfbc1e71329c5735e` | PASS      |

The authoritative evidence set is:

- [P1-05A QA Preparation](P1_05A_QA_PREPARATION.md)
- [P1-05B-1 Failure and ACL Correction](P1_05B1_BOOTSTRAP_FAILURE_AND_FIX.md)
- [P1-05B-1R2 Attempt 2 Bootstrap Evidence](P1_05B1_ATTEMPT2_BOOTSTRAP_EVIDENCE.md)
- [P1-05B-2 Read and Denial Evidence](P1_05B2_READ_DENIAL_QA_EVIDENCE.md)
- [P1-05B-3 Mutation and Cleanup Evidence](P1_05B3_MUTATION_AND_CLEANUP_QA_EVIDENCE.md)

## P1-05 lifecycle audit

### Preparation

P1-05A remains complete. It covers dedicated non-Production isolation, synthetic
fixture design, credential handling, bounded write windows, emergency fail-close,
cleanup inventory and retention, the 20-Migration plan, ACL matrices, read/write
QA, concurrency evidence and Production isolation.

### Hosted bootstrap Attempt 1 and correction

Attempt 1 remains `FAILED BOOTSTRAP`, never PASS. Migrations 1–19 applied, then
Migration D failed closed when its precondition found a direct Hosted `anon`
execute grant on a legacy RPC. Emergency close-write completed; no fixture or
business QA ran; Production was untouched.

The R1 root-cause correction remains valid. PostgreSQL PUBLIC inheritance and
Supabase Hosted direct application-role grants are distinct. Migration D now
normalizes the exact legacy grants for `PUBLIC`, `anon`, `authenticated` and
`service_role`, proves all old RPCs closed, then grants only the three ordinary v2
RPCs to `authenticated`. No Migration E or ad-hoc QA-only production workaround
exists. The Migration inventory remains exactly 20 and the Hosted-default
regression replays the real Migration D.

The desired normal post-Migration-D ACL is old `0/12`, v2 `3/12`
authenticated-only, read `3/12` authenticated-only and private `0/36`. This is
separate from the dedicated QA safety-closure state, where v2 is intentionally
`0/12`.

### Clean hosted Attempt 2 and accepted deviation

The committed evidence proves that `fandom-harbor-admin-p1-qa-2`
(`hicfnlwzmnbxhimyeviy`) was fresh, isolated and clean. It applied the exact
20/20 Migration chain, observed the Hosted privilege difference and passed D
normalization. It did not reuse Attempt 1 schema or copy Production data, Auth or
credentials, and it received no manual catalog repair.

One Attempt 2-only database password rotation remains explicitly recorded as
`QA-ONLY OPERATIONAL CREDENTIAL RECOVERY` and Product Owner accepted. No secret
was exposed and the event had no schema, Migration, ACL, business or Production
effect. This history is not removed or generalized into future authorization.

### Read, authorization and elevated denial

P1-05B-2 evidence remains complete:

- Admin and Super Admin Search, Detail and Audit: PASS.
- Reader, Author-only, inactive Admin, revoked Admin and invalid Session: DENIED.
- Live authorization revalidation and Review-to-Confirm permission loss: DENIED
  at the correct boundary.
- Protected Admin, protected Super Admin, elevated Membership target and last
  active Super Admin: DENIED/PROTECTED.
- All three legacy RPCs: DENIED.
- Every denial produced business, Ledger and Audit deltas of zero.

### Mutation Attempt 1, composition correction and successful retry

The first P1-05B-3 attempt remains `BLOCKED`. Its ordinary Membership
`active -> suspended` Confirm returned sanitized `INVALID_INPUT` before live
authorization, write Port, RPC or mutation. Business, Ledger and Audit deltas were
zero; cleanup completed and QA writes closed.

The current canonical composition is:

`FormData -> Action raw request -> Service parser -> branded Domain command ->`
`live authorization -> strict Repository -> v2 RPC`.

The Action does not perform canonical Domain parsing. The Service is the single
canonical parser and live security boundary. Current implementation and tests
show no double parsing, dual raw/branded public contract, unsafe cast bypass,
Action-side authorization trust or direct UI RPC fallback.

The committed R2 evidence proves that the original scenario then returned Saved
without reproducing `INVALID_INPUT`. Membership and Author Saved/Unchanged,
same-request replay, payload mismatch (`REQUEST_ID_MISMATCH`), stale Conflict,
three concurrency cases, exactly-once behavior, successful-path live
authorization, Detail/Audit consistency, elevated denial and legacy denial all
passed. Evidence contains 17 unique Ledger results (11 Saved, four Unchanged, two
Conflict) and 11 business Audit rows, without duplicate or orphan records.

## Atomicity and cleanup

`REMOTE FAILURE INJECTION: NOT AVAILABLE BY CURRENT CONTRACT`. No remote Audit or
Ledger failure injection is claimed as PASS. The current authoritative local SQL
suites prove transaction rollback, business/Audit atomicity, business/Ledger
atomicity, absence of orphan Audit/Ledger rows and dblink concurrency behavior.

Committed cleanup evidence proves all synthetic Auth identities, sessions,
refresh tokens, profiles, Memberships, Roles, Audit rows, Ledger rows and request
IDs are zero. Temporary runners and credentials were removed; the non-fixture
baseline is unchanged and the Migration catalog remains 20/20.

The final dedicated QA safety state is old `0/12`, v2 `0/12`, read `3/12`
authenticated-only, private `0/36`, writes closed and synthetic state zero. v2
`0/12` is the QA safety-closure state, not the desired formal Migration D
production contract; the latter remains v2 `3/12` authenticated-only.

## Latest-HEAD local regression

All checks below ran against the audited HEAD and only the local worktree/local
Supabase container:

| Gate                                | Result                                                    |
| ----------------------------------- | --------------------------------------------------------- |
| Admin full suite                    | 9 files / 88 tests PASS                                   |
| P1-03 Search/Detail/Audit targeted  | 2 files / 17 tests PASS                                   |
| P1-04B mutation targeted            | 2 files / 17 tests PASS                                   |
| Action/adapter composition subset   | 7 tests PASS                                              |
| P1-02F Service targeted             | 1 file / 57 tests PASS                                    |
| Services full suite                 | 11 files / 180 tests PASS                                 |
| Repository targeted                 | 1 file / 24 tests PASS                                    |
| Database full suite                 | 14 files / 143 tests PASS                                 |
| Migration contract targeted         | 1 file / 23 tests PASS                                    |
| Ordinary writes + governance SQL    | PASS                                                      |
| Hosted ACL normalization regression | PASS                                                      |
| Cutover rollback rehearsal          | PASS                                                      |
| dblink concurrency                  | PASS                                                      |
| Workspace TypeScript                | 8 tasks PASS                                              |
| Workspace ESLint                    | 8 tasks PASS; existing non-blocking package warnings only |
| Admin production build              | PASS; `/access` remains a dynamic server route            |

The production build rewrote the generated `apps/admin/next-env.d.ts` route
reference; the audit restored that generated file byte-for-byte to HEAD. No
product change remains.

## Security regression

Security scans and current implementation review found no governance fallback to
the three legacy RPCs, no direct `/access` UI RPC/table mutation, no browser
service-role client, no `unknown as` validation bypass, no unsafe branded cast, no
hardcoded secret or Production credential, no PUBLIC/anon/service-role ordinary
write grant and no private helper exposure. The separately retained legacy
`identity-access-adapter` is not imported by the P1 governance chain and its RPCs
are database-denied after cutover.

ADR-022 Option 3 and KI-033 remain unchanged. Admin/Super Admin Role mutation and
elevated-account Membership mutation are not implemented or accepted. P1-05
closure does not include or depend on P1.1.

## Closure boundary

This audit changes documentation only and leaves all changes unstaged. It does not
authorize P1-06 execution, P1-07, P1.1, remote operations, Production access,
Admin unpause, Web Admin entry enablement or deployment. The only next step is
Product Owner review and separate authorization for the P1-05 docs-only closure
commit and, independently, P1-06.
