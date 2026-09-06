# Admin P1-05B-3 Mutation and Cleanup Remote QA Evidence

Status: `P1-05B-3R2 PASS / WAITING FOR PRODUCT OWNER EVIDENCE COMMIT AUTHORIZATION`

Date: 2026-08-22

Baseline: `f00743c4e8ae7604b1b8114f29cf7fdec32f2e63`

Branch: `codex/admin-p1-04-ordinary-mutations`

This evidence records both P1-05B-3 attempts against dedicated non-Production QA
Attempt 2 only. R2 verified the committed Action-to-Service composition fix and
completed the full ordinary mutation, idempotency, Conflict, concurrency,
authorization, protected-boundary and cleanup matrix. The original fail-closed
Attempt 1 remains preserved below as historical evidence. P1-05B-3R1 remains
`LOCAL FIX PASS / COMMITTED` at the R2 baseline.

## Current authority — R2 final functional QA

### Target, write window and fixtures

| Item                        | R2 result                                           |
| --------------------------- | --------------------------------------------------- |
| Branch / HEAD               | `codex/admin-p1-04-ordinary-mutations` / `f00743c…` |
| QA                          | `hicfnlwzmnbxhimyeviy` / `ACTIVE_HEALTHY`           |
| Production / Attempt 1      | not used, read or modified                          |
| Preflight                   | clean; 20/20 exact; zero synthetic state            |
| Temporary write ACL         | v2 `3/12`, authenticated only                       |
| Legacy / read / private ACL | `0/12` / `3/12` authenticated only / `0/36`         |
| Local Admin                 | current HEAD, QA2 URL and publishable key only      |
| Secret handling             | server-only fixture channel; none in browser or Git |

R2 used ten new QA-only identities: one bootstrap controller, one active Admin
operator, five ordinary targets for Membership/Role/concurrency coverage, and
three protected targets (Admin, Super Admin and elevated-account Membership).
Only the operator had a login credential. All registration names used the
`qa_p1_synthetic_` namespace and all UUIDs were generated for this QA run.

### Formal application chain and mutation matrix

The original `active -> suspended` scenario ran through the local page, Review,
Action raw request, Service canonical parser, live authorization, strict
Repository and `set_ordinary_membership_state_v2`. It returned `Saved`; Detail
refreshed to `Suspended`; one Ledger and one matching business Audit were present.
`INVALID_INPUT` did not recur. The server trace records both Review and Confirm
Action invocations from the current build.

| Case                                     | Result                                    |
| ---------------------------------------- | ----------------------------------------- |
| Membership `active -> suspended`         | Saved                                     |
| Membership same-state request            | Unchanged; zero state/Audit delta         |
| Membership `suspended -> active`         | Saved                                     |
| Revoked ordinary case and restore        | Saved / Saved                             |
| Author Grant                             | Saved; exactly one active grant           |
| Author Grant again                       | Unchanged; no duplicate grant/Audit       |
| Author Revoke                            | Saved                                     |
| Author Revoke again                      | Unchanged; no fake Audit                  |
| Same requestId, same payload             | two identical Saved responses; one effect |
| Same requestId, changed payload          | `22023 / REQUEST_ID_MISMATCH`; zero delta |
| Stale expected-state                     | Conflict; latest state preserved          |
| Concurrency A, same request              | exactly-once Saved replay                 |
| Concurrency B, same intent/different IDs | Saved then Unchanged by observed order    |
| Concurrency C, competing state           | Saved + Conflict; no stale overwrite      |

The pre-cleanup database proof found 17 unique request Ledger rows: 11 Saved,
four Unchanged and two Conflict. It found exactly 11 request-linked business
Audit rows, zero duplicate Ledger request IDs, zero duplicate business Audits and
no orphan Audit or Ledger. Detail showed one active Author for each intended
post-write target and Audit matched actor, target, action and reason.

The successful UI Confirm plus the controlled Service regression prove that a
legal call reruns Session, active Membership, current Admin/Super Admin Role and
`admin:operate` exactly once before reaching its Port. The successful Audit actor
was the synthetic Admin operator. Review approval alone did not bypass this gate.

### Atomicity and protected boundaries

Remote failure injection was `NOT APPLICABLE BY CURRENT CONTRACT` and was not
created.
The existing local authoritative write and dblink concurrency suites passed with
their transaction rollback and exact cleanup assertions. They cover business +
Audit rollback, business + Ledger rollback, no orphan rows, serialization and
same-request exactly-once behavior. Admin, Super Admin and elevated Membership
targets each returned `42501 / ELEVATED_MUTATION_DEFERRED` with zero business,
Audit or Ledger delta. All three legacy RPCs returned authenticated privilege
denied.

Local regression results were Admin 88/88, Services 180/180 and Database 143/143.
The targeted ordinary-write SQL suite and the local-only dblink concurrency suite
both passed when run as their required `supabase_admin` role.

### Exact cleanup and safety closure

After capturing the pre-cleanup inventory, R2 deleted exactly the ten fixture
UUIDs and their 17 Ledger, 12 fixture-related Audit, eight Role, ten Membership,
ten Profile, one invitation and one redemption rows. The credentialed operator
was removed through the server-only Auth Admin channel; non-login control users
were removed by the exact privileged cleanup path. The temporary credential and
runner directory were then deleted outside the repository.

Post-cleanup proof is Auth/identity/session/refresh `0/0/0/0`, synthetic
Profile/Membership/Role/Audit/Ledger/requestId `0/0/0/0/0/0`, invitation/redemption
`0/0`, and namespace count zero. Non-fixture Profile/Membership/Role/Audit/Ledger
returned to `0/0/0/1/0`; Site Copy state/revisions remained `1/1`. The Migration
catalog is still 20/20 exact and QA2 is `ACTIVE_HEALTHY`.

The three authenticated v2 grants were revoked after cleanup. Final ACL is legacy
`0/12`, v2 `0/12`, read `3/12` authenticated only and private `0/36`; QA writes
are closed. Production credentials/data/operations are `NO/NO/NONE`; Attempt 1 is
unchanged. No product, Service, Repository, Migration, SQL function, RLS, schema
or Auth contract was modified. No stage, Commit, Push, PR, Merge, Deployment,
Unpause, P1-06, P1-07 or P1.1 occurred.

P1-05B-3R2 is `PASS`. P1-05 is `READY FOR FINAL CLOSURE AUDIT`, which remains a
separate Product Owner gate.

## Historical Attempt 1 — preserved fail-closed evidence

## 1. Target and preflight

| Item                         | Result                                             |
| ---------------------------- | -------------------------------------------------- |
| QA display name              | `fandom-harbor-admin-p1-qa-2`                      |
| QA Project ref               | `hicfnlwzmnbxhimyeviy`                             |
| Region / health              | `ap-southeast-1` / `ACTIVE_HEALTHY`                |
| Repository / remote catalog  | 20 / 20 exact                                      |
| Production ref               | `szfhngifsipsrxcpekti` — not used                  |
| Attempt 1 ref                | `gqtchjrmpuxibxmurvfd` — not used or changed       |
| Worktree                     | clean at the accepted baseline                     |
| Synthetic sessions / refresh | `0 / 0`                                            |
| ACL                          | old `0/12`; v2 `3/12`; read `3/12`; private `0/36` |

The retained B-2 fixture was exact: 15 Auth/Profile/Membership identities, 10
Role Grants, 15 fixture-related Audit rows plus one non-fixture P0 seed Audit,
and zero request Ledger rows. The non-fixture profile count was zero and its
canonical hash remained
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
No Production credential or Production data was read or used.

## 2. Formal-chain stop-gate result

Admin A authenticated through the local Admin app configured only for Attempt 2.
The ordinary Reader target G loaded through the read Service and displayed the
database expected-state token. The UI prepared an `active -> suspended` Review
with a normalized reason and request ID
`37cfb85c-fbd4-4aac-a8aa-eff637fdecf6`. Confirm returned the sanitized
application error `INVALID_INPUT`, rather than the required `Saved` result.

Immediate read-only evidence proved fail-closed behavior:

| Fact                         | Before | After  | Result    |
| ---------------------------- | ------ | ------ | --------- |
| Target G Membership          | active | active | unchanged |
| Request Ledger row           | 0      | 0      | no orphan |
| Request-linked Audit row     | 0      | 0      | no orphan |
| Global Audit / Ledger counts | 16 / 0 | 16 / 0 | unchanged |

The API history contains the live Auth and Detail reads but no call to
`set_ordinary_membership_state_v2` for this Confirm. A read-only source trace
identifies the blocking contract mismatch: the Action adapter's confirm path
constructs an already-parsed command containing branded Domain value objects,
then passes that command into the Service, whose public boundary correctly parses
unknown input again and requires raw string fields. The second parse rejects the
branded fields as `INVALID_INPUT` before the write Port. Existing adapter unit
tests mock the Service and therefore do not exercise this composition boundary.
This is an implementation defect; this Mission did not authorize a code fix.

## 3. Matrix disposition

| Case                                   | B-3 result                                                |
| -------------------------------------- | --------------------------------------------------------- |
| Membership Saved / Unchanged / revoked | BLOCKED at first Saved Confirm                            |
| Author Grant Saved / Unchanged         | NOT RUN after stop gate                                   |
| Author Revoke Saved / Unchanged        | NOT RUN after stop gate                                   |
| Same-request replay / payload mismatch | NOT RUN after stop gate                                   |
| Conflict / stale overwrite             | NOT RUN after stop gate                                   |
| Concurrency / exactly once             | NOT RUN after stop gate                                   |
| Successful-path live authorization     | NOT RUN — parser stopped before live check and write Port |
| Elevated boundary recheck              | NOT RUN after stop gate; B-2 remains historical           |
| Legacy call recheck                    | no call after stop gate; final ACL proves `0/12`          |

Audit- and Ledger-failure injection were independently classified as safely
blocked. The repository's existing local SQL suites create temporary failure
triggers. P1-05B-3 explicitly forbids creating triggers, temporary schema objects
or ad-hoc remote patches, and the repository contains no approved remote failure
injector. Neither failure case was attempted remotely.

## 4. Emergency close-writes and cleanup

Immediately after the stop-gate evidence, Attempt 2 alone received the exact
P1-05A close-writes action: authenticated execute was revoked from the three
ordinary v2 signatures. No broad grant, legacy reopen, helper exposure, Migration,
RLS, function or schema change occurred.

The retained synthetic inventory was then removed by exact UUID and
`qa_p1_synthetic_` namespace. Immutable Audit/Ledger cleanup used the existing
P1 concurrency-harness cleanup mechanism inside one transaction and remained
limited to the 15 approved UUIDs. The 15 Auth users were deleted with the official
server-side Admin API after the browser signed out. Fourteen synthetic login
credentials and the local QA2 database credential were removed from Keychain.

Post-cleanup proof:

| Artifact                                       |                                                              Final |
| ---------------------------------------------- | -----------------------------------------------------------------: |
| Synthetic Auth users / identities              |                                                              0 / 0 |
| Synthetic Sessions / refresh tokens            |                                                              0 / 0 |
| Synthetic Profiles / namespace rows            |                                                              0 / 0 |
| Synthetic Memberships / Role Grants            |                                                              0 / 0 |
| Synthetic Audit / Ledger / request IDs         |                                                          0 / 0 / 0 |
| Synthetic invitation redemptions / invitations |                                                              0 / 0 |
| Non-fixture Profiles / Memberships / Roles     |                                                          0 / 0 / 0 |
| Non-fixture Audit / Ledger                     |                                                              1 / 0 |
| Non-fixture profile hash                       | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Migration catalog                              |                                                      20 / 20 exact |
| QA health                                      |                                                   `ACTIVE_HEALTHY` |

Final ACL is old `0/12`, v2 `0/12`, read `3/12` authenticated only and nine
private helpers/executor `0/36`. This is QA safety closure, not the desired future
Production cutover state.

## 5. Safety and disposition

- Production credential/data/side effect: `NO / NO / NO`.
- Attempt 1 modified: `NO`.
- Secret exposure: `NO`.
- Product code, tests, Migration, schema, RPC, RLS or Auth model changed: `NO`.
- Stage/Commit/Push/PR/Merge/Deployment: `NO`.
- Admin Production remains `paused=true`; Web Admin entry remains closed; P0
  Production Site Copy remains Version 7.
- P1-06, P1-07 and P1.1 were not started.

At that historical point P1-05B-3 was
`BLOCKED / WAITING FOR PRODUCT OWNER DECISION`, and P1-05 was not ready for final
closure audit. The next authorized work was a local implementation
diagnosis/fix and regression gate for the Action-to-Service command boundary,
followed by a separately authorized fresh synthetic-fixture QA rerun. Ordinary
write execute must remain closed until that decision.
