# Admin P1-07C-4A9 — Option B Release Candidate & Protected Preview Acceptance

Date: 2026-09-28  
Verdict: `PASS`  
Branch: `codex/admin-p1-07c-option-b-rc`  
Canonical Product RC: `f42217d913d44517b53935a68488100610bdff0f`

## Acceptance boundary

This acceptance freezes one immutable Product RC and accepts its dedicated,
protected, QA-only Preview. The later documentation closure commit does not
replace the Product RC. Real-user MFA enrollment, commissioning,
`grant_super_admin`, a fresh Pre-Cutover Backup, Migration D, Production
deployment, Formal Admin resume and Web Admin Entry remain separately gated.

## Release candidate and deployment

| Item                 | Accepted evidence                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Product RC           | `f42217d913d44517b53935a68488100610bdff0f`                                                                  |
| A8 fix ancestor      | `00f2afb7b3b4de3c447cb112917b9ec14e66fe7d`                                                                  |
| Preview project      | `fandom-harbor-admin-p1-preview`                                                                            |
| Deployment           | `dpl_8kJwa2PxAtB6kmFktmdaHHpbdFpL`                                                                          |
| Preview URL          | `https://fandom-harbor-admin-p1-preview-ccgzw0zpl-fandom-harbor.vercel.app/`                                |
| Source               | exact RC SHA and `codex/admin-p1-07c-option-b-rc`                                                           |
| Deployment state     | `READY`; target is Preview, not Production                                                                  |
| Protection           | Vercel Authentication covers all previews; anonymous request redirects to Vercel SSO                        |
| Production isolation | sentinel Production branch `admin-production-disabled`; zero Production deployment in the dedicated project |

The two existing Supabase client environment variables were safely updated in
place through the official Vercel API. Both remain `sensitive` and scoped only
to `preview`; no Production env scope was added. No delete/recreate path and no
false Secret Rotation declaration were used. The resulting deployment booted
against QA `gqtchjrmpuxibxmurvfd`, and the authenticated smoke returned the QA
synthetic identity and QA database state. No Production binding was observed.

## Minimum protected Preview smoke

The smoke reused the A8 heavy hosted evidence and exercised only the 4A9
minimum:

| Check                 | Result                                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Protected access      | PASS — authorized browser entered the app; anonymous access redirected to Vercel SSO                                 |
| Preview boot          | PASS — sign-in and Admin shell loaded without runtime error                                                          |
| QA Auth               | PASS — disposable QA identity logged in                                                                              |
| Trusted server claims | PASS — server-authenticated Admin shell showed live active Membership and Admin capability                           |
| Search                | PASS — exact registration-name query returned the single expected QA identity                                        |
| Detail                | PASS — exact user, active Membership and Reader/Admin roles rendered                                                 |
| Audit read            | PASS — the governed empty state rendered normally                                                                    |
| Elevated exposure     | PASS — Guest had no Admin shell; ordinary Admin had no executable elevated write or hidden `grant_super_admin` entry |

No product defect was found. Product code was not changed. A8 remains the
authority for hosted exact retry, concurrency, five-minute TOTP evidence,
TOCTOU denial, ordinary regression and the other heavy validation already
completed at Product RC ancestry.

## Synthetic cleanup recovery

The disposable fixture was
`qa_p1_4a9_preview_mukneuyfb518dc` / user
`08b5c8cd-2938-465c-95d2-e1956cfe4555`. Before cleanup, the smoke had
confirmed one Auth identity with its Profile, active Membership and active
Admin role. The transport interruption occurred as cleanup began, so no
unsupported assumption was made about partial completion.

Recovery first queried the exact synthetic user ID. The prior exact Auth Admin
delete had completed successfully; no second remote delete was necessary. The
local Keychain entry was absent and the remaining ephemeral trace file was
removed. Final QA counts are:

| Artifact                         | Active count |
| -------------------------------- | -----------: |
| Auth users                       |            0 |
| identities                       |            0 |
| sessions                         |            0 |
| MFA factors                      |            0 |
| profiles                         |            0 |
| Membership                       |            0 |
| Roles                            |            0 |
| invitations / redemptions        |            0 |
| active elevated intents          |            0 |
| temporary policy bindings        |            0 |
| synthetic Audit / Ledger history |            0 |

`ACTIVE 4A9 SYNTHETIC ARTIFACTS = 0`.

## Environment freeze and validation

- QA `gqtchjrmpuxibxmurvfd` remains at 20 migrations: Pre-D
  `20260818120000` applied and Migration D `20260819225318` not applied.
- Production `szfhngifsipsrxcpekti` remains at 19 migrations: Pre-D and D not
  applied. No Production database, Auth, env or deployment mutation occurred.
- Deployment/build evidence is the exact-SHA `READY` Preview. The quota-saving
  closure reuses A8's full Services, Database, Auth, Admin, Typecheck and Lint
  evidence instead of rerunning it.
- Closure validation is limited to `git diff --check`, a sensitive-data scan,
  documentation links/format validation and final workspace status.
- ADR-024, Pre-D and Migration D are unchanged. PR #4 remains OPEN / UNMERGED.
  Formal Admin remains paused and Web Admin Entry remains closed.

## Next authorization boundary

This PASS means only `CANONICAL OPTION B RC FROZEN` and
`PROTECTED PREVIEW ACCEPTED`. Product Owner authorization is still required for
real `Phase2RemoteInviter` and `akumie` TOTP enrollment, real commissioning and
`grant_super_admin`, a fresh current-state Pre-Cutover Backup, the final
P1-07C-4A rerun, Migration D, Production deployment, Formal Admin resume, Web
Admin Entry opening and PR merge.
