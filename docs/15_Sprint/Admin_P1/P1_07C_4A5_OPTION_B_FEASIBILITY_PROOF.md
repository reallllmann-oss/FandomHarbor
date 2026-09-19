# Admin P1-07C-4A5 — Option B Feasibility Proof

- Status: `PASS — TECHNICALLY PROVEN FEASIBLE / IMPLEMENTATION NOT AUTHORIZED`
- Date: 2026-09-20
- Baseline: `6c246eb7b6e19bac3bf85d258f6f5a2706b1e84d`
- Governing ADR: [ADR-024](../../17_Architecture_Decisions/ADR-024.md)
- Authorized elevated operation: `grant_super_admin`
- Initial actor / exact target: `Phase2RemoteInviter` / `akumie`

## Verdict

ADR-024 Option B is technically feasible in the current Fandom Harbor Auth,
Supabase client, SSR cookie and migration architecture. The proof confirms that a
TOTP verification can replace tokens while preserving the logical Auth Session,
that signed JWT claims expose database-verifiable AAL2, TOTP AMR time and
`session_id`, and that the existing request-ledger/advisory-lock design can be
extended without weakening ordinary-mutation guarantees. A disposable sequential
upgrade also completed C → Pre-D probe → unchanged D.

This PASS is not implementation authority. The runtime adapter, UI, final Pre-D
Migration, hosted QA, real-user enrollment, commissioning, backup, D cutover and
Production release remain separate Product Owner gates. Migration D remains
blocked.

## Sources and exact stack

Supabase Changelog was checked first on 2026-09-20. No current Auth breaking
change invalidates the relied-on MFA/session contract. The proof then used:

| Component                   | Evidence version |
| --------------------------- | ---------------- |
| `@supabase/supabase-js`     | `2.108.2`        |
| `@supabase/auth-js`         | `2.108.2`        |
| `@supabase/ssr`             | `0.12.0`         |
| Supabase CLI                | `2.108.0`        |
| Disposable local GoTrue     | `v2.191.0`       |
| Disposable local PostgreSQL | `17.6.1.139`     |
| Node.js                     | `24.18.0`        |

Current official contracts reviewed:

- [Supabase MFA](https://supabase.com/docs/guides/auth/auth-mfa)
- [TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp)
- [User Sessions](https://supabase.com/docs/guides/auth/sessions)
- [JWT Claims](https://supabase.com/docs/guides/auth/jwt-fields)

The exact `auth-js` source shows that successful MFA verify saves the returned
replacement session and emits `MFA_CHALLENGE_VERIFIED`. The project SSR adapter
uses `createServerClient` with `getAll`/`setAll` cookie propagation, but the current
Fandom Harbor `AuthProvider` intentionally exposes only identity and expiry. A
future implementation must add a narrow server-only MFA/session interface; it
must not expose credentials, raw tokens or trusted client booleans.

Repository `supabase/config.toml` currently disables local TOTP enrollment and
verification. The experiment enabled TOTP only in a disposable, repository-external
local config. Enabling the intended hosted non-Production and eventual Production
Auth setting remains an explicitly authorized implementation/release step.

## Experiments

All Auth experiments used random disposable local identities and in-process TOTP
material. No password, TOTP seed/code, access/refresh token, Cookie, service key or
identity identifier was printed, persisted in Git or copied into this evidence.
All disposable containers were stopped without backup after observation.

| Experiment                           | Environment / precondition                                                                                                                  | Observed result                                                                                                      | Conclusion                                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| First TOTP challenge + verify        | Exact JS/SSR versions above; synthetic AAL1 password Session                                                                                | access and refresh tokens were replaced; user ID and `session_id` stayed equal; JWT became `aal2`; TOTP AMR appeared | logical Session preservation PASS; token replacement is not Session replacement                                              |
| SSR cookie persistence               | Same cookie adapter shape as repository; instantiate a new server client after verify                                                       | Session restored with same user, same `session_id`, AAL2 and same TOTP AMR timestamp                                 | reload/session restore PASS                                                                                                  |
| Explicit token refresh               | Refresh the verified Session                                                                                                                | same user and `session_id`; AAL2 and TOTP AMR timestamp retained                                                     | refresh does not manufacture fresh MFA; original evidence ages normally                                                      |
| Repeated TOTP verification           | New challenge/verify in the same Session after the first verification                                                                       | same `session_id`; TOTP AMR timestamp advanced                                                                       | operation-specific fresh MFA can be distinguished from prior MFA                                                             |
| Other browser Session                | Same synthetic user had a second, distinct Session before enrollment verify                                                                 | second Session had a different `session_id` and was rejected after enrollment verification                           | intent must bind the current Session; other Session reuse is rejected                                                        |
| Database claim validation            | Authenticated RPC in disposable local schema read signed claims and live `auth.sessions`                                                    | user matched, `aal2=true`, TOTP present, TOTP age ≤300 seconds, live Session row present                             | server/database validation is available without client self-report                                                           |
| Shared request namespace concurrency | Two local transactions used the existing request-lock key shape; elevated claim held the lock while ordinary claim raced with the same UUID | first returned claimed; second returned existing; exactly one intent row and zero ordinary rows                      | one requestId cannot concurrently represent ordinary and elevated payloads when both paths cross-check under the shared lock |
| Sequential migration probe           | Clean 19-Migration schema; disposable Pre-D structural probe inserted between C and byte-identical D                                        | CLI applied Pre-D then D; history reached 21; D completed                                                            | C → Pre-D → D ordering compatibility PASS                                                                                    |

## Proof A — AAL2 and Session preservation

`SESSION PRESERVATION FEASIBILITY = PASS`.

- The user ID and `session_id` were stable across TOTP verify, explicit refresh and
  SSR-cookie reload.
- TOTP verify returned replacement access and refresh tokens; code must persist
  those tokens through the SSR cookie adapter before confirmation.
- The current Session remained usable and was present in `auth.sessions`.
- Enrollment verification invalidated the other pre-existing browser Session,
  consistent with current client and official contracts. This does not break the
  original-Session intent because the verified Session itself kept its ID.
- A future implementation must fail closed if hosted QA shows a changed
  `session_id`, missing Session row or cookie write failure.

Logical Session preservation, token replacement and unrelated Session
invalidation are therefore separate facts and must remain separate in tests.

## Proof B — fresh TOTP AMR

`FRESH TOTP AMR FEASIBILITY = PASS`.

- The signed JWT contained `aal=aal2`, `session_id` and object-form AMR entries
  with trusted `method` and Unix `timestamp` values.
- Password and TOTP were distinguishable by `method`.
- Repeating a TOTP challenge/verify advanced the TOTP timestamp.
- Refresh and reload retained the original TOTP timestamp instead of renewing it,
  so an old AAL2 token does not become fresh merely through refresh.
- Database code can select the maximum timestamp among entries whose method is
  `totp` and compare it with authoritative database time and the intent's
  challenge-not-before boundary.

Implementation must not blindly depend on array position. It must select the
latest qualifying object-form TOTP entry, reject string-only AMR or malformed
claims, require its timestamp to be later than the intent's frozen prior TOTP
timestamp, and require an age from 0 through 300 seconds. Any unsupported AMR
shape is fail closed.

## Proof C — Session-bound intent and requestId

`ELEVATED INTENT FEASIBILITY = PASS`.

The future private intent can bind signed `auth.uid()` and JWT `session_id` to a
live `auth.sessions` row, and bind the exact operation, target, requestId,
expected-state token, desired role, reason fingerprint, prior TOTP timestamp and
expiry. Exact server/database policy must resolve the only initial target to
`akumie`; a browser-supplied target is never authority.

The existing ordinary executor already obtains
`fandom-harbor:identity-access-request:<requestId>` before reading the ledger, and
the ledger has a global primary key on `request_id`. Pre-D implementation must:

1. extend the ledger operation constraint with `grant_super_admin`;
2. make intent `request_id` unique;
3. make both ordinary and elevated paths check ledger and intent while holding
   the same advisory lock;
4. retain tombstones for expired/failed consumed namespaces; and
5. atomically consume intent, grant role, write one business Audit and store one
   ledger result.

The concurrency probe confirmed first-claim wins and the competing path observes
the existing namespace. Target, operation, actor, Session or payload mismatch must
return a stable mismatch/forbidden outcome with zero role/Audit change.

## Proof D — refresh, reload and invalidation

| Situation                                   | Required result                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| Immediately after TOTP verify               | allow only after all live DB checks pass                                       |
| Token refresh                               | allow only if same `session_id` and retained TOTP time is still ≤5 minutes     |
| Browser reload / Session restore            | same rule; cookie restoration is not new MFA                                   |
| More than five minutes after TOTP           | reject and consume/expire according to the frozen intent policy                |
| Logout then login                           | reject old intent because Session ID changes or the old Session row disappears |
| Same user, different browser/device Session | reject because `session_id` differs                                            |
| User or Role/Membership state changes       | reject on live authorization/expected-state check                              |

An intent is never bound only to user ID. Session disappearance, ID mismatch,
malformed AMR, stale TOTP, payload drift, target drift, expiry or prior consumption
all fail before business writes.

## Proof E — Pre-D compatibility

`PRE-D → D ORDERING COMPATIBILITY = PASS`.

The disposable upgrade began with the exact 19 migrations through C. A local-only
structural probe, versioned between C and D, performed the changes that affect D's
assumptions: extended the ledger operation constraint, added private intent state,
preserved the exact three legacy signatures/catalog attributes while making their
elevated branches fail closed, kept ordinary delegation available before D, and
added a differently named elevated RPC with private helpers denied to application
roles. The original D file was byte-identical before and after the probe.

`supabase migration up --local` then applied Pre-D followed by unchanged D. Final
catalog evidence:

- migration history: `21`, with both Pre-D and D recorded in order;
- D's six named public functions: exactly `6`;
- legacy owner/security/volatility/search-path contract: PASS;
- legacy execute after D: `0/12`;
- ordinary v2 execute after D: `3/12` authenticated-only;
- added differently named elevated RPC survived D without broad grant;
- intent table application-role table privileges: `0`;
- private legacy delegates application-role execute: `0`;
- ledger constraint included `grant_super_admin`;
- D SHA-256 remained
  `b44ed44145b25cdf4524f1e7fbdec802a2bb84972ce07c467e4ff4edbc95d69e`.

D checks the six existing names/signatures and their catalog attributes, the v2
precondition, and existing private-helper denies; it does not fingerprint function
bodies or reject a differently named elevated RPC/private intent objects. Pattern
1 can therefore preserve those assumptions while closing legacy elevated branches.

`MIGRATION D MODIFICATION REQUIRED = NO`.

The production implementation still needs a new unique timestamp strictly between
C and D, exact body/capability tests, Hosted ACL verification, clean rebuild,
C→Pre-D→D upgrade, rollback, concurrency and failure-injection suites. The probe
file was disposable and was never added to the repository.

### Failure boundary

- Pre-D itself must be one atomic Migration. Failure leaves neither catalog
  changes nor a successful history row.
- The intended state after Pre-D and before D is safe: legacy elevated branches
  are closed, ordinary legacy behavior remains, and only the exact Option B path
  is available.
- If later D fails, its transaction rolls back to that safe Pre-D state; it must
  not reopen legacy elevated access.
- Rollback/remediation may revoke the new elevated RPC and expire intents, but may
  never restore an elevated legacy bypass.

## Redundancy and lost-factor boundary

The two-Super-Admin gate remains role + credential control + active Membership +
independent MFA operability, not a database count. `Phase2RemoteInviter` must prove
the exact Option B flow; `akumie` must receive the grant, enroll/verify its own
primary and backup TOTP, achieve AAL2 in its own Session and pass an independent
Admin smoke before redundancy is accepted.

Lost-factor recovery does not authorize a role grant. It must require another
verified factor/AAL2 or separately governed platform break-glass. An ordinary
Admin cannot recover into `grant_super_admin`, the target cannot self-promote, and
service-role/backend secrets are not a routine commissioning channel. If both
controlled Super Admins lose all factors, elevated mutation remains closed while
Product Owner authorizes platform recovery and independent evidence.

## Remaining authorization gates

Feasibility has no unresolved technical blocker. The following are deliberately
unimplemented release gates:

1. Product Owner authorization for a narrow Option B implementation phase;
2. server-only Auth/session adapter, Review/MFA/confirm UI and exact target policy;
3. formal Pre-D Migration and complete local security/concurrency tests;
4. dedicated hosted non-Production TOTP/SSR/ACL/rollback verification;
5. protected Preview and new immutable release SHA;
6. separately authorized Production Auth setting and Pre-D apply;
7. real `Phase2RemoteInviter` enrollment and compliant commissioning of `akumie`;
8. `akumie` independent TOTP/AAL2/Admin operability proof;
9. fresh current-state Pre-Cutover Backup and P1-07C-4A rerun; and
10. separately authorized Migration D execution and post-cutover validation.

PR #4 remains open/unmerged, Formal Admin Production remains paused, Web Admin
Entry remains closed, and no Production or real-user Auth change occurred.
