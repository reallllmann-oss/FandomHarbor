# Admin P0 DEPLOY-01 Preview Acceptance

Date: 2026-08-12

Mission: `Fandom Harbor Admin P0 DEPLOY-01 — Preview Deployment and Cross-App Acceptance`

Current status: `DEPLOY-01 — PASS`

Final DEPLOY-01 status: `PREVIEW ACCEPTANCE COMPLETE — LOCAL EVIDENCE COMMIT ONLY`

## Deployment baseline

- Accepted source commit: `5463032a2aa5d98c8299c8d6e3dfeaae60818042`.
- Web Preview: `dpl_BWz2a76nfU6BP5HZkrjwSkswSc6W`, READY, Preview, source commit exactly equal to the accepted source commit.
- Admin Preview: `dpl_3ayj6Rg8Y9qTk3xJ9Ef8ezn7XNHC`, READY, Preview, source commit exactly equal to the accepted source commit.
- Web Production remained `dpl_4ixvPAwxqnAq2gm1GCgREmRxPSQT` from commit `8f8dbbcb4ec2f34919de3424c070efe3de007e39`.
- Admin Production remained `dpl_AVTGLwSF48DoEeLSqyadUQjoMFhs` from commit `e137c31f260d761fc2fdd6ebd9f7f0e30cf5630a`.
- Web and Admin Production aliases did not change. Neither Preview received a Production target or Production alias.
- Admin Production Branch remained `admin-production-disabled`.
- No Redeploy, Retry, Promotion, PR, Merge, Production deployment, domain, DNS, environment-variable or Vercel project-setting change was performed.

## Safe re-entry limitation and controlled-attempt history

The safe re-entry review remained `INCOMPLETE`. The Admin project was unintentionally left unpaused from `2026-08-03T15:52:27Z` until the pause request at `2026-08-11T15:50:20Z`; `paused=true` was confirmed at `2026-08-11T15:50:22Z`. The approximately 7-day, 23-hour, 57-minute and 53-second window exceeded the available retention of relevant request and runtime logs. Therefore the review could not prove the absence of activity across the entire window.

Within the evidence that remained available, no unexplained Deployment, Promotion, Alias, Site Copy, Revision, Audit, identity, permission or business-data change was found. The Production and Preview baselines remained unchanged, Site Copy remained at the then-current original-content baseline, and Admin was paused before any later controlled attempt. This limitation is preserved explicitly and is not upgraded to a complete historical proof.

The later controlled attempts stopped safely when their gates could not be completed:

- The third manual Preview attempt was stopped because Chrome navigation could not be confirmed. Admin was unpaused for approximately 3 minutes and 11 seconds, but there was no login, Review, Save or Site Copy change. Admin was paused and the Guard was removed.
- The fourth manual Preview attempt restored the original copy to Version 5. Its automated Web Preview HTTPS requests timed out, so cross-application display of the temporary Version 4 copy was not proven. Admin was paused and the Guard was removed.
- A subsequent DEPLOY-01A attempt stopped before Review because the supplied temporary navigation labels exceeded the frozen field limits. No save occurred, no Version 6 was created, Admin was paused and the Guard was removed.
- DEPLOY-01B initially stopped because no controlled authenticated Admin context was available. No semantic request was sent and no data changed.

## Prior incomplete browser attempt

The fourth DEPLOY-01 manual Preview attempt safely restored the original copy to Version 5 and paused the Admin project. During that attempt, automated Web Preview requests timed out while establishing HTTPS connections, so they could not prove that Web Preview had displayed the temporary Version 4 copy.

- Version 5 contained the exact original eight fields.
- Revision and Site Copy Audit totals were five each.
- Admin was paused and its one-time Guard was removed.
- Production and Preview deployment baselines remained unchanged.
- No DEPLOY-01 evidence commit was created.

DEPLOY-01A therefore started with a paused-state readability gate instead of reusing any prior Guard or unpaused window.

## DEPLOY-01A readability and Reader evidence

While Admin remained paused, the Product Owner opened the ordinary Web Preview URL in Chrome and confirmed:

- Web Preview was reachable without a token, cookie, credential, verification code or Protection Bypass query parameter.
- The homepage, navigation and footer displayed the Version 5 original eight fields.
- An authenticated Reader who directly visited Web Preview `/studio` was redirected to Web Preview `/archive`.
- CTA destinations, navigation order and paths, Studio visibility rules and Footer legal links remained unchanged.

All Chrome interaction was performed manually by the Product Owner. No credential, token, cookie, verification code, account name or other sensitive identity detail was recorded.

## Corrected temporary-value contract

The first DEPLOY-01A controlled attempt stopped before Review because the original Mission values `Archive Preview`, `Search Preview` and `Studio Preview` exceeded the frozen 12-code-point navigation-label limit. The client correctly prevented Review; no save request, Revision, Audit or Version 6 was created. Admin was immediately paused and the Guard was removed.

The Product Owner corrected the temporary navigation labels to:

- `Archive QA` — 10 Unicode code points.
- `Search QA` — 9 Unicode code points.
- `Studio QA` — 9 Unicode code points.

Before the successful controlled attempt, all eight temporary fields and the reason passed NFC, trim, control-character, newline and Unicode code-point validation in both the application contract and the database validation function. Services regression tests passed 70/70.

## Version 6 temporary save

After a new readability/baseline precheck, a fresh one-time Guard was established. Admin was unpaused only after the Guard was verified. The Product Owner manually logged in, entered the corrected values, reviewed exactly eight changes and saved through the normal Admin Preview flow.

Persistent evidence confirmed:

| Item                  | Version 6 result                       |
| --------------------- | -------------------------------------- |
| Version               | `6`                                    |
| Revision              | `0203677a-9547-439e-aeb6-314918b2a3f5` |
| Base Version          | `5`                                    |
| Audit ID              | `80`                                   |
| Audit action          | `site_copy.updated`                    |
| Audit changed fields  | `8`                                    |
| Reason                | `DEPLOY-01 Preview跨应用补充验收`      |
| Revision total        | `6`                                    |
| Site Copy Audit total | `6`                                    |

The Version 6 full snapshot was:

1. `Fandom Harbor Preview Acceptance`
2. `DEPLOY-01 Preview临时文案，仅用于跨应用读取验收，完成后立即恢复。`
3. `浏览Preview作品`
4. `查找Preview作品与作者`
5. `Archive QA`
6. `Search QA`
7. `Studio QA`
8. `Fandom Harbor · DEPLOY-01 Preview验收`

The Product Owner then fully refreshed the ordinary Web Preview URL and explicitly confirmed that Web Preview displayed all eight Version 6 values. The Product Owner also confirmed that:

- The first CTA still targeted `/archive`.
- The second CTA still targeted `/search`.
- Navigation quantity, order and paths did not change.
- Footer legal links did not change.
- The observed page was Web Preview, not Web Production.

This supplies the cross-application evidence that was missing from the fourth DEPLOY-01 attempt.

## Version 7 normal restoration

Immediately after the Web Preview Version 6 confirmation, restoration became the only active operation. The Product Owner used the same Admin Preview session and the normal Review and Save flow to restore the Version 5 original eight fields with reason `DEPLOY-01 Preview补充验收恢复原始文案`.

Persistent evidence confirmed:

| Item                  | Version 7 result                        |
| --------------------- | --------------------------------------- |
| Version               | `7`                                     |
| Revision              | `00434206-1745-41a0-9236-b37b5e4c411a`  |
| Base Version          | `6`                                     |
| Audit ID              | `81`                                    |
| Audit action          | `site_copy.updated`                     |
| Audit changed fields  | `8`                                     |
| Reason                | `DEPLOY-01 Preview补充验收恢复原始文案` |
| Revision total        | `7`                                     |
| Site Copy Audit total | `7`                                     |

The Current Pointer points to Version 7. Version 7 contains the exact original eight fields:

1. `Fandom Harbor`
2. `一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。`
3. `浏览公开作品`
4. `查找作品与作者`
5. `Archive`
6. `Search`
7. `Studio`
8. `Fandom Harbor · 私域作品归档`

The Public RPC returned Version 7 and the same exact eight fields. After a complete Web Preview refresh, the Product Owner explicitly confirmed that Web Preview again displayed the original eight fields.

No Pointer was directly updated, and no immutable Revision or Audit was deleted or rewritten.

## Guard and pause evidence

The successful controlled window used a fresh one-time Guard with a hard cutoff of `2026-08-12T13:44:31.869Z`.

- Admin unpause confirmed: `2026-08-12T13:01:10.903Z`.
- Restore Pointer update: `2026-08-12T13:14:25.409752Z`.
- Pause requested: `2026-08-12T13:15:44.362Z`.
- `paused=true` confirmed: `2026-08-12T13:15:46.591Z`.
- Total unpaused duration: approximately 14 minutes 36 seconds.
- The Guard was unloaded only after `paused=true` was confirmed.
- All one-time Guard files and its LaunchAgent were removed; no DEPLOY-01A Guard remains.

Admin Production remains paused.

## Data isolation

The two legitimate Site Copy saves added exactly two immutable Revisions and two Site Copy Audits: Version 6 temporary content and Version 7 restoration. Other observed counts remained unchanged:

| Data set        | Before | After |
| --------------- | -----: | ----: |
| Auth users      |     37 |    37 |
| Profiles        |     36 |    36 |
| Memberships     |     36 |    36 |
| Role grants     |      5 |     5 |
| Works           |     10 |    10 |
| Chapters        |     32 |    32 |
| Articles        |      0 |     0 |
| Invitations     |     35 |    35 |
| Storage objects |      0 |     0 |
| Audit logs      |     79 |    81 |

No Auth, Role, Membership, capability, content, invitation or Storage mutation was performed by DEPLOY-01A.

## DEPLOY-01A result

`DEPLOY-01A CROSS-APP PREVIEW ACCEPTANCE — PASS`

- WEB PREVIEW REACHABLE BY PRODUCT OWNER
- VERSION 5 ORIGINAL COPY VERIFIED
- READER `/studio` REDIRECT VERIFIED
- VERSION 6 TEMPORARY COPY SAVED
- WEB PREVIEW VERSION 6 DISPLAY VERIFIED
- VERSION 7 ORIGINAL COPY RESTORED
- WEB PREVIEW ORIGINAL COPY RESTORED
- PUBLIC RPC ORIGINAL COPY RESTORED
- REVISION / AUDIT / POINTER CONSISTENT
- WEB PRODUCTION UNCHANGED
- ADMIN PRODUCTION UNCHANGED
- NO PRODUCTION PROMOTION
- ADMIN PROJECT PAUSED AGAIN
- GUARD CLEANED
- NO PUSH
- NO EVIDENCE COMMIT YET

## DEPLOY-01B local authenticated harness history

A temporary, untracked, localhost-only Admin harness was prepared to exercise the accepted Admin Service, Repository and RPC path while the online Admin project remained paused. It listened only on `127.0.0.1:3101`, reused a normal manually authenticated Admin browser session, exposed three independent manually confirmed actions, and never used a Service Role key or direct SQL mutation.

Two harness defects stopped safely before any successful semantic request:

1. The first read-only render used an unavailable initial action state and displayed the generic Admin error boundary. No action button had been clicked and no semantic RPC was called. The initial state was moved to a client-local temporary module boundary.
2. On the first Unchanged click, Next.js rejected the Server Action module because a `"use server"` file exported a non-async object. The local POST returned HTTP 500 before entering `runUnchanged`; `save_site_copy` was not called. The Server Action module was then restricted to async-function exports, with fixed inputs, types and helpers moved into temporary modules without `"use server"`. TypeScript, lint, unit tests and a real Next.js production build passed before retry.

The request ID from the pre-RPC HTTP 500 remained unused. A new request ID was used for the successful Unchanged acceptance. Neither identifier is recorded in full in this evidence.

## Unchanged acceptance

The Product Owner manually invoked only the fixed Unchanged action after the repaired page was visibly ready.

- Expected Version was `7` and all eight normalized fields exactly matched Version 7.
- Reason was `DEPLOY-01B Unchanged语义验收`.
- The local Server Action and remote `save_site_copy` call returned HTTP 200 and the closed service result was `Unchanged`.
- Version remained `7`; Revision and Site Copy Audit totals remained `7` each.
- The Current Pointer, Version 7 Revision, Audit ID `81` and all eight fields remained unchanged.
- No Version 8 was created.

Result: `UNCHANGED PASSED`.

## Stale Version Conflict acceptance

The Product Owner manually invoked only the fixed Conflict action using a previously unused request ID, Expected Version `6`, the Version 6 base Revision, a valid fixed candidate payload and reason `DEPLOY-01B Stale Version Conflict验收`, while the actual current Version was `7`.

- The local Server Action and remote `save_site_copy` call returned HTTP 200 and the closed service result was `Conflict` with current Version `7`.
- The candidate content was not persisted.
- Version remained `7`; Revision and Site Copy Audit totals remained `7` each.
- The Current Pointer, Audit ID `81` and original eight fields remained unchanged.
- No Version 8 was created.

Result: `STALE VERSION CONFLICT PASSED`.

## requestId idempotency acceptance

The Product Owner manually replayed the complete original Version 7 restoration request through the same Admin Service, Repository and RPC path. The replay used the exact original request ID, Expected Version `6`, Version 6 base Revision, original eight fields, and reason `DEPLOY-01 Preview补充验收恢复原始文案`. No new request ID or current-Version-adjusted payload was substituted.

- The remote `save_site_copy` call returned HTTP 200 and the original successful Version 7 result.
- The original request ID still mapped to exactly one Revision and one Audit.
- Revision and Site Copy Audit totals remained `7` each.
- The Current Pointer remained on the original Version 7 Revision and Audit ID `81`.
- No duplicate Revision, duplicate Audit, Pointer update or Version 8 was created.

Result: `REQUEST ID IDEMPOTENCY PASSED`.

## Final invariant and local cleanup evidence

The final database and public-read audit confirmed:

- Site Copy Version `7`, the original Version 7 Revision and Audit ID `81`.
- Seven immutable Revisions and seven Site Copy Audits.
- No Version 8.
- The exact original eight fields in the Current Pointer snapshot and `get_public_site_copy` projection.
- Web and Admin Production Deployment, source commit and aliases unchanged.
- Both accepted Preview Deployments still READY at source commit `5463032a2aa5d98c8299c8d6e3dfeaae60818042`.
- Online Admin project `paused=true`; Admin Production Branch remained `admin-production-disabled`.
- Emergency Restore was never invoked.

The Product Owner ended the localhost Admin session using a temporary current-browser-only cookie cleanup action. It did not call the provider's global sign-out operation and did not revoke other devices or online sessions. The action redirected to the local login page, after which the localhost server was stopped and port `3101` no longer listened.

All six untracked temporary harness files and the temporary route directory were removed. No harness route, Server Action, fixed payload, helper or harness test remains. No product code, Migration, RPC, RLS, Grant, configuration, environment file or lockfile was changed by DEPLOY-01B.

## Final DEPLOY-01 result

`DEPLOY-01 — PASS`

- DEPLOY-01A CROSS-APP PREVIEW ACCEPTANCE PASS
- UNCHANGED PASSED
- STALE VERSION CONFLICT PASSED
- REQUEST ID IDEMPOTENCY PASSED
- VERSION 7 ORIGINAL COPY PRESERVED
- NO VERSION 8 CREATED
- REVISION AUDIT POINTER CONSISTENT
- PUBLIC RPC ORIGINAL COPY VERIFIED
- READER `/studio` REDIRECT VERIFIED
- LOCAL ADMIN SESSION ENDED
- LOCAL HARNESS REMOVED
- LOCAL SERVER STOPPED
- WEB PRODUCTION UNCHANGED
- ADMIN PRODUCTION UNCHANGED
- ADMIN PROJECT PAUSED
- GUARD CLEANED
- SAFE REENTRY INCOMPLETE LIMITATION DOCUMENTED
- EVIDENCE-ONLY LOCAL COMMIT CREATED
- NO PUSH
- NO MERGE
- NO PRODUCTION PROMOTION

## Stop boundary

DEPLOY-01 does not authorize Production release. The evidence commit is local only and must not be pushed. No Merge, Preview redeploy, Production deployment, Promotion, Admin Production restoration, domain, DNS, environment, Auth, Role, Membership or business-data change is authorized by this result.
