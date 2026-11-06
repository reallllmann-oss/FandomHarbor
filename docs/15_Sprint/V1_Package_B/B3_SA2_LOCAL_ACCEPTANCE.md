# B3-SA2 Local Acceptance

Status: **PASS — LOCAL IMPLEMENTATION / HOSTED NOT RUN**

Date: 2026-10-21

## Scope

- Restricted to the two exact P1-07C commissioning identities.
- Local additive ledger, server-only orchestration, loopback-only simulated sender, and an unlinked local feature-gated page.
- No Hosted Preview or Production access, email delivery, commit, push, deploy, or ADR status change.

## Gate results

| Gate                          | Result | Evidence                                                                                                                                                                                                         |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — contract                  | PASS   | One globally active non-terminal operation; immutable UID/session/email HMAC context; expiration after an external step enters recovery; only the two P1-07C identities remain eligible.                         |
| B — server-only orchestration | PASS   | Isolated password session, trusted UID/session/AAL2/fresh TOTP checks, current/new native arm ordering, `email_otp` only, authoritative ambiguity reconciliation, and fail-closed recovery.                      |
| C — protected local page      | PASS   | Not linked in Admin navigation; disabled outside development/test; every state-changing action rechecks trusted identity and operation context.                                                                  |
| D — completion/recovery       | PASS   | Global session revocation precedes `awaiting_reauth`; elevated intents are invalidated; completion requires a distinct live AAL2 session, fresh password/TOTP, protected Admin read, and continuity fingerprint. |
| E — targeted verification     | PASS   | 45 focused TypeScript tests, two SQL scenarios, affected-package type checks, targeted ESLint, Admin production build, database lint, ACL/catalog checks.                                                        |

## Focused results

- Admin orchestration/page contracts: 21 passed.
- Database repository/migration contracts: 13 passed.
- Domain service contracts: 11 passed.
- SQL state machine: passed and rolled back.
- SQL cross-UID concurrency: exactly one operation succeeded; fixture rows removed.
- Database lint: no error-level findings.
- Catalog: 10 binding RPCs use `SECURITY DEFINER`, empty `search_path`, and `service_role`-only execution; no operation or audit rows remain.
- Admin TypeScript, targeted ESLint, and production build: passed.

## Explicit limits before B3-SA3

- No integrated Hosted Preview run and no real Super Admin identity or real mailbox was used.
- The GoTrue current/new arm behavior is reused from B3-1; this iteration validates the new orchestration and recovery contract without repeating that experiment.
- B3-SA3 still requires controlled Preview configuration, synthetic high-privilege continuity fixtures, simulated/approved mail delivery, and proof that old access JWTs cannot pass live sensitive-operation checks after session revocation.
- The migration remains local and uncommitted. ADR-025 remains Proposed.
