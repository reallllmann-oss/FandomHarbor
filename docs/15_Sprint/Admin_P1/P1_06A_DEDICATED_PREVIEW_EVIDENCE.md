# Admin P1-06A Dedicated Protected Preview Acceptance Evidence

Status: `PASS / READY FOR PRODUCT OWNER EVIDENCE COMMIT AUTHORIZATION`

- Date: 2026-08-23
- Branch: `codex/admin-p1-04-ordinary-mutations`
- Evidence HEAD: `b0148e051c622e0a0fce0141be8cbcbccee9401d`

## 1. Closure authority

| Item                    | Accepted result                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Dedicated project       | `fandom-harbor-admin-p1-preview` / `prj_iPXj0F7YvyAeBfBRIJ0BuHkHgKwW`               |
| Canonical Preview       | `dpl_84CzqyvoypWY213ESquzM9B6Ekap`                                                  |
| Target / environment    | `preview` / `preview`                                                               |
| Source                  | `b0148e051c622e0a0fce0141be8cbcbccee9401d` / `codex/admin-p1-04-ordinary-mutations` |
| Build                   | `READY / PASS`                                                                      |
| Protection              | Vercel Authentication covers all previews / PASS                                    |
| Automation bypass       | `0`                                                                                 |
| QA runtime              | QA2 `hicfnlwzmnbxhimyeviy` / PASS                                                   |
| Formal Admin Production | unchanged / `paused=true`                                                           |
| Web Admin entry         | closed                                                                              |

The canonical deployment hostname is
`fandom-harbor-admin-p1-preview-ibq5qi7te-fandom-harbor.vercel.app`. It must
remain a protected Preview and must not be promoted, reclassified or aliased as
Production without a separate Product Owner authorization.

## 2. Product Owner human acceptance

The Product Owner completed the protected Preview sequence in a clean Safari
Private window. Unauthenticated access was intercepted by Vercel Authentication;
human Vercel authentication succeeded; the Fandom Harbor Admin sign-in page
loaded; the temporary QA2 Admin signed in; and the Admin overview displayed an
active Admin, `admin:operate` and database Version 1.

The Product Owner then opened `/access`, found the QA-only smoke identity, loaded
its read-only identity data and executed no Save, Confirm, Membership or Role
mutation. Version 1 and the QA-only identity establish the accepted QA2 runtime
binding. Production Site Copy remains Version 7; Production and Attempt 1 runtime
binding were not used.

The initial human smoke found a Subjects / Subject Detail overflow caused by a
long registration identity and intrinsic `min-width` behavior. Commit
`b0148e051c622e0a0fce0141be8cbcbccee9401d` added the accepted responsive fix.
Human re-verification of the fixed Preview passed:

- long registration name and UUID are fully readable with safe wrapping;
- Subjects has no overflow and Subject Detail has no overlap;
- no unintended horizontal overflow remains;
- wide desktop two-column layout and deferred-capability rendering are normal.

Therefore `/access` read-only smoke and responsive visual acceptance are PASS.

## 3. QA2 smoke cleanup and safety state

The exact temporary identity
`qa_p1_preview_smoke_mt5dojjo_24dbc86a` was resolved to one Auth user, one
identity, one active Membership and one active Admin role. It had no Super Admin
role, no Audit or Ledger/requestId rows, no invitation artifacts and no grants or
revocations affecting another user.

Two sessions and two refresh tokens were revoked first. The exact Auth user was
then deleted in a guarded transaction; existing cascades removed only its
identity, Profile, Membership and Admin role. The non-fixture baseline remained
one P0 Audit, zero Ledger and 20 Migrations. The Keychain item
`FandomHarbor QA2 P1-06A Smoke mt5dojjo_24dbc86a` was deleted without reading or
printing its password.

| Final artifact                       |       Count |
| ------------------------------------ | ----------: |
| Smoke Auth / identity                |     `0 / 0` |
| Session / refresh token              |     `0 / 0` |
| Profile / Membership / Role          | `0 / 0 / 0` |
| Synthetic Audit / Ledger / requestId | `0 / 0 / 0` |
| Invitation/setup artifacts           |         `0` |
| Plaintext credential residue         |         `0` |

Post-cleanup QA ACL is old `0/12`, ordinary v2 `0/12`, read authenticated-only
`3/12` and private helper/executor `0/36`. QA writes remain closed. No ACL,
schema, function, Migration or non-fixture row changed.

## 4. Deployment and route cleanup

Before cleanup, the canonical fixed Preview was re-proved READY, preview-targeted,
protected and sourced from the accepted commit. The two known Production aliases
on the incorrect first deployment were then removed exactly:

- `fandom-harbor-admin-p1-preview.vercel.app`;
- `fandom-harbor-admin-p1-preview-fandom-harbor.vercel.app`.

After the active route count reached zero, incorrect deployment
`dpl_9DCjUpLGAZ7RTEKGE65JkPz8KNy2` was deleted. The dedicated project now has no
Production deployment and no active route to that deployment. The canonical
fixed Preview remains READY, protected and unpromoted. Pre-fix Preview
`dpl_HgXQHJPQ8i5eVUHweTAnZMrCqKeV` remains READY/preview for the authorized P1-06
historical rollback window.

Formal project `fandom-harbor-admin` remains paused with its existing Production
deployment and domains unchanged. Production Supabase `szfhngifsipsrxcpekti`,
Production Site Copy Version 7 and the closed Web Admin entry were untouched.

## 5. Client secret boundary

The Preview environment allowlist contains only
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, both scoped
to Preview. Equivalent variables were absent from this dedicated project's
Production scope. No service-role key, database password, management credential
or automation bypass was configured for the Preview.

Local browser static-build and runtime-source scans passed for service-role,
database credential, management token, Production/Attempt 1 ref and bypass
patterns. Human runtime evidence independently proved QA2 data rather than
Production data. Automation bypass remains zero.

`DIRECT REMOTE EXECUTOR BROWSER SCAN: NOT AVAILABLE DUE EXECUTOR NETWORK`.

`EQUIVALENT CONFIGURATION + LOCAL BUILD + HUMAN RUNTIME EVIDENCE: PASS`.

No remote executor browser-bundle PASS is claimed.

## 6. Complete incident and recovery history

1. Original P1-06A was blocked because the formal Admin Project was paused.
2. D1 diagnosed Project pause as the deployment gate.
3. A dedicated protected Preview Project was created.
4. Its first Deployment was unexpectedly classified as Production.
5. R1D2 diagnosed Vercel first-deployment target classification behavior.
6. A second Deployment was successfully created as a real Preview.
7. `vercel curl` created an unauthorized persistent automation bypass.
8. The bypass was treated as potentially compromised and revoked.
9. Executor network limitations prevented human Preview acceptance there.
10. The Product Owner completed human Vercel Protection verification.
11. One temporary QA2 smoke Admin was created.
12. Its password was corrected to the repository password policy.
13. The Product Owner logged into the QA2-bound Preview.
14. `/access` read-only smoke succeeded.
15. Human smoke exposed the responsive layout defect.
16. R1R5 fixed the overflow locally.
17. R1R6 deployed the fixed Preview.
18. The Product Owner visually reverified the fixed `/access`.
19. R1R7 revoked sessions and removed the exact smoke identity and credential.
20. R1R7 removed the incorrect Production routes and deployment.

## 7. Closure decision and next gate

P1-06A is PASS and ready only for a Product Owner-authorized docs-only evidence
Commit. No new Deployment, business mutation, Production operation, code change,
stage, Commit, Push, PR or Merge occurred in R1R7.

P1-06B is `READY FOR PRODUCT OWNER AUTHORIZATION / NOT STARTED`. P1-07 is not
started, and P1.1 remains deferred and unauthorized.
