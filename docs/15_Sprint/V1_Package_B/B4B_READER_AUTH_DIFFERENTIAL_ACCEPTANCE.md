# B4b — Reader Auth differential acceptance and release closeout

Date: 2026-11-06 (Asia/Shanghai)

Status: **RC REVIEW / WEB BUILD PASS — PREVIEW RELEASE AND HOSTED ACCEPTANCE PENDING**.

Baseline branch: `codex/v1-package-b0-auth-architecture`.
Baseline HEAD: `b9f5d37dda6f04c50c570b0f5338ebdfeea33bb5`.
Only permitted Hosted project: Preview `bniqsjnjqesnpcfkpqcz`.

## Evidence reuse and scope

The two Preview Super Admin email migrations and Gate E are complete. Their
accepted UID/Role/Membership/TOTP evidence is reused. The old B3 dual-arm
application workflow is discontinued under the PO decision; it is neither
repaired nor represented as having completed successfully.

Retained Operation `9e685b3c-2df9-4dee-9aa1-5c7320c531fc` remains
`recovery_required`, with accepted Active=1 and custom Audit=9. It is a separate
legacy issue, not a prerequisite for ordinary Reader Auth while the B3 Gate is
OFF. No Ledger, Audit or identity writes were made by this work package.

The original local/Hosted evidence is reused; earlier planning-only and
NOT-RUN headings do not override later accepted addenda:

- `B2_FINAL_ACCEPTANCE.md`: local invitation/reservation, activation, recovery,
  password/email change, privacy and server-only boundary acceptance.
- `B4A1C_F2_HOSTED_AUTH_E2E_PREFLIGHT.md`, F2-R2 retained evidence: Hosted Reader
  recovery succeeded; the new password worked and old password failed.
- `B4A1C_F2_R3_HOSTED_AUTH_FINAL_ACCEPTANCE.md`: Hosted invitation registration,
  confirmation/resend, atomic activation and secure email change passed; synthetic
  resources were subsequently quarantined without deleting their audit history.
- `B2_UX_01_LOCAL_ACCEPTANCE.md` and `B2_FIX_02_PREVIEW_DEPLOYMENT_ACCEPTANCE.md`,
  B2-UX-02 addendum: local message-state tests and protected Preview deployment
  acceptance. Post-fix real resend/final email-change UI feedback remained NOT RUN.

## Reader capability matrix

| Capability                                                               | Evidence accepted                                                                                  | Remaining difference                                                                                                                                                                                                           |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Invitation + real-email registration + OTP activation                    | Local and Hosted happy path PASS; reservation/one-time redemption/concurrency local contracts PASS | Existing Preview mode is intentionally `legacy`; new-email signup is not presently enabled. Do not reopen a completed signup experiment solely for this closeout.                                                              |
| Registration-name/password login                                         | Existing local/Preview evidence retained; current server resolver reads the Auth email             | New returned-UID and cookie-publication hardening below is LOCAL PASS, not yet published.                                                                                                                                      |
| Forgot-password request and native recovery OTP                          | Existing Chinese template/SMTP and Hosted Reader recovery PASS                                     | New recovery UID/session binding requires a focused new-RC Hosted check. Delivery to the migrated Super Admin inboxes is not a Reader prerequisite and was not tested.                                                         |
| Recovery grant + new password                                            | Existing UID-bound ten-minute HMAC contract and Hosted new/old password evidence retained          | Recovery now requires the resolved UID, OTP user, issued Session and authoritative Auth read to agree before issuing the grant.                                                                                                |
| Ordinary password change                                                 | Existing native update implementation/local contract retained                                      | New reauthentication UID guard and truthful session-revocation feedback need focused Preview acceptance. Do not claim an unchanged-password ordinary edit was independently Hosted-tested where only recovery evidence exists. |
| Ordinary secure email change                                             | Hosted two-arm Auth/Identity continuity PASS; corrected feedback locally tested and deployed       | This round changes the pre-update reauthentication UID guard. Its valid request path and already-deployed pending/final feedback need a bounded Hosted UI check. This is not the discontinued B3 migration workflow.           |
| OTP expiry/replay, reservation expiry/retry, outage and provider failure | Reuse accepted local negative tests and relevant prior Hosted evidence                             | Do not infer every failure mode was exercised Hosted. Uncovered Hosted fault paths remain NOT RUN, not silently PASS or automatically new code blockers.                                                                       |

The only remote action in this round was a read-only query of
`public.get_registration_mode()`. It returned `legacy` at
2026-11-06 22:55:31 Beijing time. No mode was changed. The accepted email-required
signup chain was exercised during an earlier authorized controlled window.

## Confirmed defects and local repairs

### 1. Returned identity was not completely bound to the intended subject

- Web resolved-email login used the returned Session without comparing it to the
  registration-name resolver's UID.
- Recovery could issue a grant for `data.user.id` without verifying equality to
  the resolved UID or the recovery Session's UID.
- Current-password reauthentication before password/email updates did not verify
  the returned user and Session UID against the original authenticated user.

Repairs compare these identities and reject missing or inconsistent evidence.
Recovery additionally performs an authoritative `getUser` read and compares the
current email to the resolved email before issuing its unchanged UID-bound grant.
No service-role password change, metadata authorization or MFA bypass was added.

### 2. SDK cookies could be published before application identity acceptance

Auth SDKs may emit Session cookies before an action has checked the returned UID.
For login, recovery and credential reauthentication, writes are now staged in a
request-local cookie adapter. Pending cookies remain readable by the SDK and
related server clients, but are not published to the browser before identity
acceptance. Rejected flows preserve the browser's original cookies and attempt
only local cleanup of the newly issued Session; no global logout is used.

Once accepted, cookie writes resume normally, including later update/refresh
events. Server Actions surface a failed cookie commit; unchanged Server Component
calls retain their existing read-only cookie behavior.

### 3. Password-change success overstated Session revocation

The previous action ignored the returned error from `signOut({scope: 'others'})`.
It could say other devices had signed out even when that call failed.

The action now clears the consumed recovery grant after a successful password
update, checks revocation, and displays a distinct alert if revocation is rejected
or uncertain. It says the password changed and asks for Session-state inspection,
without suggesting another password update or automatically repeating the call.
This does not claim that an existing access JWT instantly loses its signature
validity; Hosted checks must distinguish refresh-token revocation from JWT expiry
and any separate live-Session authorization checks.

## Exact implementation scope

Modified:

- `apps/web/src/app/auth/actions.ts`
- `apps/web/src/app/auth/actions.test.ts` (existing mock contracts only)
- `apps/web/src/app/account/security/page.tsx`
- `apps/web/src/lib/identity-access.ts`

Added:

- `apps/web/src/lib/staged-auth-cookies.ts`
- `apps/web/src/lib/staged-auth-cookies.test.ts`
- `apps/web/src/lib/staged-auth-sdk.test.ts`
- `apps/web/src/app/auth/actions-reader-security.test.ts`
- This acceptance record.

No database Migration, package/dependency, Admin application or old B3 protocol
was changed. The ordinary Reader email-change protocol remains native Auth.

## Targeted local verification

- New action-level suite: 25 cases for matching/mismatched login UID, neutral
  recovery responses, returned user/Session/current Auth consistency, missing
  Session, cookie-commit failure, unknown/legacy subjects, recovery grants,
  current-password checks and revocation success/rejection/network ambiguity.
- Cookie adapter: four cases, including chunk deletion, rejection without browser
  publication, later accepted writes and failed commits.
- Actual installed Supabase SDK with a local fake transport: one integration case
  proves a second SDK client can read the staged Session and subsequent Auth
  update cookies still reach the accepted browser Session. No Hosted request is
  made by that test.
- Related existing actions: 26 cases; existing security broker: four cases.
- **60 distinct targeted cases PASS**. Repeated cookie-only verification is not
  counted as additional coverage.
- Three selected rejection regressions were also run against the original RC:
  wrong login UID, wrong recovery user UID and rejected other-Session revocation.
  All three failed as expected; the fixed implementation was then restored
  exactly and rechecked. No original user work was reset or overwritten.
- Web TypeScript (`--noEmit --incremental false`): PASS.
- Targeted ESLint: PASS, with the existing workspace-root pages advisory only.
- Targeted formatting/diff and sensitive-pattern checks are recorded with the
  final local verification. No full test suite or production build was rerun;
  one Web build belongs in the next authorized RC release gate.

## Super Admin recovery analysis — separate scope

GoTrue v2.197.0 `UserUpdate` requires AAL2 for password changes when MFA factors
are enabled. The current Web recovery pages have no MFA-upgrade step. Reader
recovery PASS therefore cannot certify MFA Super Admin password recovery.

Sources:

- [Official GoTrue v2.197.0 UserUpdate](https://github.com/supabase/auth/blob/v2.197.0/internal/api/user.go)
- [Official password recovery API](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)

### Minimum supported self-service design

1. Verify the native recovery OTP and bind its live Session/UID to the existing
   recovery grant.
2. In the same Web origin, allow the user to challenge only one of their own
   existing verified TOTP factors through official `challengeAndVerify`.
3. Server-verify AAL2, live Session, UID and fresh TOTP before the existing native
   password update. Preserve the AAL2 Session; do not replace it with an AAL1
   password-login Session. Current ordinary reauthentication is not an adequate
   high-privilege MFA-aware implementation.
4. Use the existing revocation contract, confirm the outcome and retain audit.
   Never enroll/delete/reset a factor as an implicit part of password recovery.

The Preview-only Admin `/auth/preview-session` page cannot simply be linked from
Web as a recovery solution: separate origins have separate cookies, and the page
has exact synthetic-UID/Preview restrictions. Only the official API pattern and
reviewed evidence can be reused; no token transfer or general privilege opening
is proposed.

### Emergency recovery if no existing TOTP factor is usable

Do not replace MFA with email OTP, force an Admin API password reset or silently
remove factors. Enter a manual incident procedure with a named owner, independent
identity verification and, where available, another trusted administrator using
their own AAL2 Session. If containment or factor replacement is required, approve
the exact account, official owner channel, Session actions and audit/review scope
as a separate security operation before any write. Keep the UID and business
history; do not recreate the user. No emergency write or new privileged tool is
implemented here.

Recommendation: full self-service Super Admin recovery need not delay a
Reader-only V1 release if the PO accepts the explicit limitation and a documented
manual incident owner/path. A claim that V1 includes automatic high-privilege
recovery would require this separate gap to be closed first. No Super Admin
recovery email, password reset or repeated MFA experiment was performed.

## Next minimum Preview release package (requires separate authorization)

1. Review only the eight code/test files above, run one necessary Web build,
   secret/diff checks, and authorize the exact commit/push/normal protected Web
   Preview release. Preserve unrelated Admin/logout/Migration/QA changes. Keep
   B3 Gate OFF; no Admin binding deployment or new B3 Operation is needed.
2. Reuse the accepted Preview project/ref/protection and prior registration
   evidence, checking only release-induced drift. Prefer one eligible isolated
   ordinary Reader fixture; if one must be created/activated, authorize it
   explicitly rather than using either Super Admin or an unsafe SQL shortcut.
3. Through the new protected Web Preview, verify one registration-name login,
   one recovery OTP and native password reset, then one ordinary password change
   and the intended other-Session refresh-token rejection. PO enters credentials.
   Role/Membership/UID continuity must remain unchanged. Do not repeat the entire
   signup/MFA test history.
4. Because the ordinary email-change request was hardened, verify that request
   and the pending/final UI feedback with the already accepted two-side protocol,
   two approved controlled inboxes, one current active request and no blind resend.
   Recovery requires one mail and email change normally two; any enabled native
   security-notification mails must be counted in the separately approved budget.
5. Keep unsupported Hosted failure injection, untested provider operations and
   the discontinued B3 workflow explicitly out of PASS claims. Resolve Issue #8
   feedback acceptance from the actual result; do not automatically close it.
6. Quarantine/cleanup only approved Reader test resources and Sessions, retaining
   necessary audit. An uncertain external result requires authoritative readback
   before another write. No Production configuration/release or PR merge is
   included in this next package by implication.

Changing registration mode is unnecessary for recovery/password/email checks on
an existing eligible Reader. Any future real signup check needs a separately
approved bounded `email_required` window and its existing restoration mechanism.

## Release conclusion and preserved work

Reader functional foundations have accepted local/Hosted evidence. The concrete
release blockers from this differential review are publication and focused
Hosted acceptance of the new identity/session fixes, plus authorization of the
intended release configuration when registration is to be opened. Existing
`legacy` mode is an intentional configuration gate, not a new database defect.
Missing Hosted negative-path evidence is reported separately from confirmed code
defects; it must not be silently certified or trigger a new unlimited test cycle.

No commit, push, deployment, true mail send, Hosted mutation, Production access,
Super Admin recovery or B3 restart was performed. ADR-025 and PR/Issue states were
not modified. The 25 pre-existing worktree files were hash-recorded before this
work and must be retained unchanged.

Browser Cleanup = NOT_APPLICABLE.

## Authorized RC release continuation — 2026-11-06

The PO subsequently authorized exact B4b review, one Web production build,
commit/push, normal Preview release and scoped Hosted Reader acceptance. The
no-release statements above describe the preceding local-only review.

- Exact remote branch and local baseline HEAD matched before release.
- One Web production build passed, including compilation, TypeScript and route
  generation. The existing multiple-lockfile/workspace-root advisory remained;
  no dependency or build configuration was changed.
- The exact eight application/test files listed above remain the implementation
  scope. This record and the two Admin account-security backlog entries in the
  existing Admin P1 README are the only accompanying documentation scope.
- The existing Admin roadmap did not list the two requested entries explicitly.
  They are now recorded as pending separately authorized implementation; no Admin
  feature or Super Admin recovery action is included in the RC.
- Bounded Preview-only read at 2026-11-06 23:06:57 Beijing: registration mode is
  still `legacy`; eligible active ordinary Reader count is **0**. Historical
  approved Reader `998e8a1d-4c80-4d17-87ba-a273fd121a2b` is banned, has revoked
  Membership and an isolated `.invalid` email. No old isolation was removed.
- Hosted target selection must resolve this real fixture gap first. No password,
  email or Membership of an existing user may be changed merely to make a test
  possible; do not substitute either Super Admin. Approved Reader UID and safe
  credential/recipient records must be identified, or a dedicated legitimate
  fixture preparation scope must be agreed before Hosted writes.
- Publication can proceed independently. Hosted tests remain NOT RUN until that
  prerequisite and access to the protected Web Preview are available.

Deployment identity, immutable RC SHA, read-only protection/ref evidence and
actual Hosted results will be recorded from the release outcome. This section
does not claim a deployment or Hosted acceptance before they occur.
