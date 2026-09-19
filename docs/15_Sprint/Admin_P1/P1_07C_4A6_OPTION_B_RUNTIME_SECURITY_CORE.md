# Admin P1-07C-4A6 — Option B Runtime Security Core

- Status: `PASS — RUNTIME SECURITY CORE IMPLEMENTED / PRE-D NOT AUTHORIZED`
- Date: 2026-09-20
- Baseline: `c75f68f5aea2ed66dd412cd4d9979c96e4aaf2ee`
- Governing ADR: [ADR-024](../../17_Architecture_Decisions/ADR-024.md)
- Allowed operation: `grant_super_admin`
- Initial actor / exact target: `Phase2RemoteInviter` / `akumie`

## Result

The formal TypeScript runtime implements the narrow ADR-024 security contract
without creating a SQL Migration or exposing a UI path. Supabase `getClaims()` is
the only Auth source used by the server adapter: it verifies the current access
token before the adapter normalizes `sub`, `aal`, object-form `amr` timestamps and
`session_id`. Raw JWTs, tokens, Cookies and factor secrets do not cross the Auth
package boundary.

The provider-neutral Service contract then requires AAL2, the latest qualifying
TOTP AMR timestamp with an inclusive age of `0..300` seconds, the exact private
policy actor and target, the original Session, requestId, expected-state token,
normalized reason and a deterministic payload fingerprint. `aal2` without a
fresh object-form TOTP entry remains a denial. Client-supplied actor, AAL, AMR,
MFA time or Session fields are rejected rather than treated as evidence.

This result is deliberately limited to runtime enforcement and adapter contracts.
The future private database adapter must repeat all checks and atomically claim
the shared request namespace, consume the intent, execute the grant, write one
business Audit and write one ledger result. No in-memory check is represented as
database atomic consumption.

## Changelog-first Supabase review

The current Supabase Changelog was checked first on 2026-09-20. No new Auth
breaking change invalidates A5's evidence for verified claims, TOTP AMR,
`session_id` or the pinned Supabase JS/Auth/SSR stack. Runtime implementation
continues to rely on the exact repository versions documented by A5:

| Component               | Version   |
| ----------------------- | --------- |
| `@supabase/supabase-js` | `2.108.2` |
| `@supabase/auth-js`     | `2.108.2` |
| `@supabase/ssr`         | `0.12.0`  |

## Trusted Auth boundary

`createServerAuthProvider()` now has a server-only trusted-evidence method. It:

1. calls Supabase Auth `getClaims()` and never decodes an unverified browser
   value;
2. accepts only non-nil UUID `sub` and `session_id` values;
3. accepts only `aal1` or `aal2`;
4. requires object-form AMR entries with a string method and safe integer Unix
   timestamp, while preserving missing AMR as an explicit no-method state;
5. returns only normalized non-secret evidence; and
6. maps verification/provider failures to stable safe errors without forwarding
   provider details.

String-only or malformed AMR is rejected. The security core selects the maximum
timestamp among entries whose method is exactly `totp`; it never assumes array
position and never uses a browser clock. The single canonical freshness constant
is `MAX_TOTP_AGE_SECONDS = 300`; age `300` is accepted and `301` is rejected.

## Exact commissioning and intent contract

The only expressible operation is `grant_super_admin`. No generic role operation,
Admin grant, Super Admin revoke, user delete or arbitrary target capability was
added.

Actor authentication and actor authorization are separate:

- the actor identity and Session come only from trusted Auth evidence;
- an injected private policy port resolves the authorized actor stable ID, exact
  target stable ID and opaque authorization reference;
- runtime compares both trusted actor and client business target with that
  policy; and
- no username, user ID, service role or hard-coded bypass authorizes the actor.

The intent model freezes:

- opaque intent ID and requestId;
- actor ID, authorization reference and `session_id`;
- operation and fixed desired role `super_admin`;
- exact target and expected-state token;
- normalized reason and payload fingerprint;
- issue/expiry time, prior TOTP time and challenge-not-before boundary; and
- future consumed state.

Confirmation requires a fresh TOTP time that is later than the frozen prior TOTP
time and not earlier than the intent's challenge boundary. Actor, Session,
requestId, operation, target, expected state, reason and fingerprint must all
match. Expired, consumed and mismatched intents fail closed before the consume
port.

## Canonical fingerprint and shared request namespace

The SHA-256 payload fingerprint hashes a versioned, fixed-order server-created
tuple:

1. format version;
2. trusted actor user ID;
3. `grant_super_admin`;
4. exact target user ID;
5. fixed desired role `super_admin`;
6. expected-state token; and
7. normalized reason.

It does not hash caller JSON and therefore does not depend on property order.
requestId reuses the existing non-nil UUID vocabulary. The port maps same
requestId/different fingerprint to `REQUEST_ID_CONFLICT`; the future Pre-D
implementation must extend the existing private ledger and shared advisory-lock
namespace rather than introduce a second ledger.

## Future private adapter boundary

`ElevatedIntentPort` provides only three narrow seams:

- issue the exact `grant_super_admin` intent;
- read an opaque intent for runtime defense-in-depth validation; and
- consume/execute the exact intent.

Its result vocabulary distinguishes expected-state conflict, requestId conflict,
expired, consumed and mismatched intent states. Runtime validates before calling
consume, but database enforcement remains authoritative for races. The future
adapter must provide live `auth.sessions`, Membership, Super Admin role, verified
factor, exact policy, target and expected-state checks inside the same transaction
as intent consumption, role grant, Audit and ledger result.

`ONE-TIME CONSUMPTION RUNTIME CONTRACT IMPLEMENTED`.

`DATABASE ATOMIC CONSUMPTION IMPLEMENTED = NO`.

## Failure and logging safety

The public runtime uses closed, stable failure codes for authentication, AAL2,
fresh/stale TOTP, invalid evidence/Session, actor/operation/target denial,
expected-state/requestId conflict, intent expiry/consumption/mismatch and generic
internal failure. Unknown provider/port errors become a safe internal failure;
their message and object details are not returned.

The implementation does not log access/refresh tokens, raw JWTs, Cookies, TOTP
codes/secrets, MFA seeds/QR payloads, factor IDs, service keys or credentials.
Only future non-secret correlation fields described by ADR-024 are present in the
runtime contract.

## Validation

The dedicated Auth and elevated-security suites cover verified-claim parsing,
AAL2, fresh/stale/boundary TOTP, missing/malformed AMR, exact actor/target,
operation allow-list, requestId and expected-state validation, deterministic
fingerprints, same/different Session behavior, client-evidence injection,
post-intent TOTP, expiry, consumption, payload drift and safe failure mapping.

Existing Auth, Services, ordinary governance, database/repository, Admin,
TypeScript, ESLint, build, Prettier, diff, link and sensitive scans are rerun as
the closure gate. Their exact final counts are recorded in the local commit
report; no database, hosted QA, Preview or Production operation is part of this
evidence.

## Unchanged release gates

- ADR-024 is byte-for-byte unchanged.
- No formal SQL Migration exists and Migration D is unchanged and blocked.
- No database adapter, RPC, RLS, ACL, schema or Auth configuration changed.
- No real MFA enrollment, real intent issue/consume or `grant_super_admin`
  occurred.
- `Phase2RemoteInviter` and `akumie` were not mutated.
- PR #4 remains open/unmerged, Formal Admin Production remains paused and Web
  Admin Entry remains closed.

The next boundary requires separate Product Owner authorization for the formal
Pre-D private database adapter/Migration implementation and its complete local
security, concurrency, rollback and C → Pre-D → D validation. Hosted QA, real-user
enrollment, commissioning and Migration D remain later independent gates.
