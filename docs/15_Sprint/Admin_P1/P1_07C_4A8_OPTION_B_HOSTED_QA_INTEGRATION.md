# Admin P1-07C-4A8 — Option B Hosted QA Integration Acceptance

- Status: `PASS — HOSTED QA ONLY; MIGRATION D BLOCKED`
- Date: 2026-09-23
- QA project: `gqtchjrmpuxibxmurvfd` (`ACTIVE_HEALTHY`)
- QA migrations: `19/21 → 20/21`; only Pre-D `20260818120000_admin_p1_option_b_elevated_access_pred.sql` applied
- Runtime exact-retry repair: `00f2afb7b3b4de3c447cb112917b9ec14e66fe7d`
- Production: `szfhngifsipsrxcpekti`, `19` applied migrations; Pre-D and D not applied
- Governing decision: [ADR-024](../../17_Architecture_Decisions/ADR-024.md) unchanged
- Migration D: `20260819225318_admin_p1_identity_access_cutover.sql` unchanged, SHA-256 `b44ed44145b25cdf4524f1e7fbdec802a2bb84972ce07c467e4ff4edbc95d69e`, not applied

## Hosted result

The A6 runtime → strict A7 repository → hosted Pre-D database path completed
with disposable, invitation-created QA Auth users, two verified TOTP factors per
actor and target, an AAL2 actor Session, and a temporary exact synthetic
commissioning policy binding. No real account, Production credential or
Production mutation was used. The narrow exact-retry repair above was already
committed before the final race and ordinary-governance continuation. This
continuation made no product runtime, migration or ADR change.

The first synthetic confirmation returned canonical `Saved`; the exact same
request/intent returned the same result. One target Super Admin Grant, one
business Audit, one shared request Ledger and one consumed intent were observed
for that request. Same-request/same-payload intent reuse, changed-payload
rejection and parallel same-intent confirmation also passed with those same
one-each mutation counts. Second execution, original-Session refresh and
Session restore/reload returned the prior canonical result without another
mutation. Different actor, different Session, target, operation and requestId
substitution were rejected. These are **reused current A8 Hosted evidence**;
they were not re-run during the final continuation.

The genuine hosted TOTP/AAL2 path accepted fresh evidence. A password-only
Session was rejected, and a real wait beyond 300 seconds followed by token
refresh was rejected as `STALE_TOTP`; refresh did not renew MFA freshness.
Restore/reload did not produce a new mutation or new freshness. The inclusive
exact-300-second rule is covered by the deterministic A6 Service test and the
database's `> 300` predicate, rather than a network-timing-sensitive hosted
call at the boundary. Client-controlled timestamps were not used.

## Final two race proofs

| Race                                                 | Controlled boundary                                                                                                                                                                             | Hosted result                                        | Database facts                                                                                                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target changes after intent issuance                 | After a valid intent, a QA-only setup inserted an Author Role into the synthetic target's authoritative `role_grants`; the intent itself was untouched.                                         | `Conflict`; exact replay returned the same Conflict. | Super Admin Grant `0`, Saved Audit `0`, Saved Ledger `0`, Saved consume `0`; one terminal Conflict intent and one Conflict Ledger, without an Audit reference. |
| Actor authorization revoked after runtime validation | The disposable test port paused **after** A6 validation but **before** the real A7 database consume call. QA setup revoked the synthetic actor's live Super Admin Role, then released the call. | Database rejected with `UNAUTHORIZED_ACTOR`.         | Super Admin Grant `0`, Saved Audit `0`, Ledger `0`, consumed intent `0`.                                                                                       |

Neither race used a product debug route or weakened runtime check. The pause
existed only in an untracked disposable test harness, which was removed after
testing. A race failure requiring a product repair was not observed.

## Ordinary governance regression on hosted Pre-D

The synthetic authorized actor read Search, Detail and Audit through the three
existing RPCs. Reader and Author Sessions were denied read access. The
authenticated legacy ordinary RPCs granted/revoked Author and moved the
ordinary target's Membership active → suspended → active; their four expected
business Audits were observed. Legacy Super Admin elevation and an ordinary
Admin's self-elevation were denied. This is the **pre-D** compatibility state;
legacy ordinary execute remains open until D, and elevated legacy branches
remain closed.

The three ordinary v2 write RPCs remained closed to every application role.
To verify their database contract without changing Grants, a QA-only
privileged SQL test set a synthetic actor context and executed Grant Author,
Revoke Author and Membership suspend/restore. Four `Saved` results produced
four Ledger rows and four linked Audits. Same-request/same-payload replay
returned the canonical result; changed payload returned
`REQUEST_ID_MISMATCH`. This is a **privileged database regression**, not a
claim that an authenticated browser can execute v2 before Migration D.

## Final catalog and cleanup

Hosted function execute snapshot (counts are functions with execute privilege):

| Boundary                 | Functions | PUBLIC | anon | authenticated | service_role |
| ------------------------ | --------: | -----: | ---: | ------------: | -----------: |
| Elevated public RPC      |         4 |      0 |    0 |             4 |            0 |
| Elevated private helpers |         6 |      0 |    0 |             0 |            0 |
| Ordinary read RPC        |         3 |      0 |    0 |             3 |            0 |
| Ordinary v2 write RPC    |         3 |      0 |    0 |             0 |            0 |
| Legacy ordinary RPC      |         3 |      0 |    0 |             3 |            0 |

The private commissioning policy, elevated intents and shared request Ledger
have RLS enabled and no direct `anon`, `authenticated` or `service_role` table
privilege. Four elevated public functions are strict authenticated-only
`SECURITY DEFINER` boundaries with empty search paths and database-derived
actor/Session/policy checks. The service-role key was used only for disposable
QA Auth setup/cleanup. Supabase infrastructure privileges must not be confused
with a product-supported commissioning path; the product flow does not depend
on service-role bypass.

Final prefix-scoped synthetic cleanup: active Auth users, identities, Sessions,
MFA factors, Memberships, Roles, invitations, enabled policy bindings and live
unconsumed intents are all `0`. Soft-deleted synthetic Auth identities were
removed after verifying their users were deleted and had no Session, factor or
active governance state. Immutable evidence remains: six historical intents,
nine Ledger rows and 30 Audit rows across this A8 synthetic prefix. Four
successful elevated Ledger rows have four linked Audits; their metadata keys
contain no password, JWT, Cookie, access/refresh token, TOTP code or secret.

The ordinary regression's temporary process timed out while waiting for its
cleanup marker **after** its business assertions passed. The corresponding
role, Membership, policy and invitation cleanup had already completed; a
separate disposable Auth-admin cleanup then succeeded, and the final zero-active
inventory above was verified. This timing issue was in the temporary harness,
not the product implementation.

## Release boundary

QA remains `20/21`. Production remains at 19 migrations, with Pre-D and D not
applied. Migration D, real-user MFA/commissioning, Production migration and
write, Preview/Production deployment, Admin unpause, Web Admin Entry opening,
PR #4 merge and P1.1 remain unauthorized. A hosted QA PASS is not a Production
cutover authorization. Protected Preview, both real controlled users' primary
and backup TOTP enrollment and independent acceptance, a fresh pre-cutover
backup, and the P1-07C-4A rerun remain separate Product Owner gates.
