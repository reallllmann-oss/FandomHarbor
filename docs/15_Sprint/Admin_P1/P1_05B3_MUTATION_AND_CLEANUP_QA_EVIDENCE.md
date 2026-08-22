# Admin P1-05B-3 Mutation and Cleanup Remote QA Evidence

Status: `BLOCKED / WAITING FOR PRODUCT OWNER DECISION`

Date: 2026-08-22

Baseline: `3f45ce7459e67e7f6b8844024bfd64181a1a8374`

Branch: `codex/admin-p1-04-ordinary-mutations`

This evidence records the authorized P1-05B-3 execution against dedicated
non-Production QA Attempt 2 only. The first formal ordinary mutation reached the
Mission stop gate before any business write. The remaining mutation, idempotency,
Conflict, concurrency and elevated-recheck matrix was therefore not continued.

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

P1-05B-3 is `BLOCKED / WAITING FOR PRODUCT OWNER DECISION`. P1-05 is not ready
for final closure audit. The next authorized work must be a local implementation
diagnosis/fix and regression gate for the Action-to-Service command boundary,
followed by a separately authorized fresh synthetic-fixture QA rerun. Ordinary
write execute must remain closed until that decision.
