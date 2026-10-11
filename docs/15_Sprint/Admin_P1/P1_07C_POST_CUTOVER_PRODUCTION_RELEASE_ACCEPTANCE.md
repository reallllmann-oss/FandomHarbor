# P1-07C Post-Cutover Production Release Acceptance

Date: 2026-10-11

Status: `PASS / WEB ADMIN ENTRY OPEN / PR MERGE NOT AUTHORIZED`

## 1. Release authority

Product Owner separately authorized `OPEN WEB ADMIN ENTRY` after the exact
Production deployment and manual pre-open smoke had passed. This authorization
did not authorize Product changes, database/Auth/Role mutation, a third Super
Admin, PR merge or unrelated Production work.

| Item                  | Accepted state                                                      |
| --------------------- | ------------------------------------------------------------------- |
| Vercel Project        | `fandom-harbor-admin` / `prj_XceBjIPkuK3vomhnWBA03DGaY8zx` / active |
| Production deployment | `dpl_BUPHP53EPYXEE7pyoqXKDHHoWcsX` / `READY`                        |
| Canonical Product RC  | `f42217d913d44517b53935a68488100610bdff0f`                          |
| Production Supabase   | `szfhngifsipsrxcpekti` / `ACTIVE_HEALTHY`                           |
| Migration state       | exactly 21; Pre-D and Migration D applied                           |
| Recovery point        | `20261010-085250_P1-07C_MIGRATION_D_POST_CUTOVER`                   |

The previous deployment `dpl_DQYJVPBrfXkQ4ydsPcDBCT1WnMXL` remains historical
`BLOCKED — PROJECT PAUSED` evidence. It was not retried, changed or deleted.

## 2. Exact deployment and entry binding

Vercel control-plane readback proved that the Production deployment is
`READY`, targets `production`, and carries both `gitSource.sha` and
`githubCommitSha` equal to the canonical Product RC. Its Git source is branch
`codex/admin-p1-07c-option-b-rc` at the exact RC SHA.

The canonical Production Admin alias
`fandom-harbor-admin.vercel.app` was already assigned by the successful
Production deployment to `dpl_BUPHP53EPYXEE7pyoqXKDHHoWcsX`. The domain is
verified and has no redirect. Therefore the authorized entry opening retained
the exact existing binding instead of performing a redundant alias mutation.
No feature flag, hidden route or product-code change was introduced.

Web Admin Entry transitioned to `OPEN / ENABLED` at
`2026-10-11T21:55:51+0800`. The canonical sign-in route is:

`https://fandom-harbor-admin.vercel.app/auth/sign-in`

## 3. Pre-open and post-open live acceptance

Before opening, Product Owner manually accepted the immutable deployment URL:

- deployed runtime reachable and correct Production runtime;
- authenticated read;
- independent `Phase2RemoteInviter` and `akumie` login;
- Super Admin recognition and protected Admin reads for both identities;
- Search, Detail and Audit reads for both identities;
- no observed Production mutation.

After opening, Product Owner used the canonical alias and accepted:

- public/Admin entry reachable;
- Guest `/access` request redirected to the normal sign-in flow;
- `Phase2RemoteInviter` Admin Entry and protected read;
- `akumie` independent Admin Entry and protected read;
- no unexpected redirect, `404`, `5xx` or deployment error.

Result: `LIVE PRODUCTION ADMIN ACCEPTANCE = PASS`.

## 4. Authorization boundary

The exact RC continues to derive Admin access from live Membership and Role
facts. The sign-in action rejects identities without `admin:operate`; protected
reads repeat the live access check. Guest, Reader and Author cannot enter the
Admin governance surface. An Author does not gain Super Admin capability.

Ordinary Admin cannot self-elevate or mutate an elevated target. The UI exposes
no executable elevated mutation controls, the Service rejects elevated targets,
and Migration D keeps the legacy elevated branches closed. No stale
commissioning helper, debug route or `/__mfa` path was exposed by this release.

Targeted unchanged-RC regression passed:

- Admin auth and page contracts: 2 files / 15 tests;
- governance Service boundary: 1 file / 57 tests;
- database/cutover contract: 1 file / 30 tests.

Result: `ORDINARY AUTHORIZATION BOUNDARY = PASS`.

## 5. Final Production state

Final read-only verification returned:

| Item                       | Final state                   |
| -------------------------- | ----------------------------- |
| Production health          | `ACTIVE_HEALTHY`              |
| Migration count            | 21                            |
| Migration D                | applied exactly once          |
| `Phase2RemoteInviter`      | active `author + super_admin` |
| `akumie`                   | active `super_admin`          |
| Active Super Admin count   | 2                             |
| Third Super Admin          | 0                             |
| Grant/Audit/Ledger/Consume | `1/1/1/1`                     |
| Unconsumed intent          | 0                             |

No Production database, Auth, Role or business mutation was executed during
release opening or closure. No additional backup was created; the authoritative
Post-Cutover Backup remains
`20261010-085250_P1-07C_MIGRATION_D_POST_CUTOVER`.

## 6. Product and follow-up boundary

Product code remains the exact canonical RC. This closure changes documentation
only. The requested UI improvement, “后台右上角显示当前账号名 + Role 标签”, is
recorded as a future Product/UI requirement and was not implemented here.

P1-08 Unified Account Navigation also remains future Product work. Opening the
canonical direct Admin URL does not add an Admin link to Reader navigation or
alter capability-derived authorization.

PR merge remains `NOT AUTHORIZED`. The next boundary is explicit Product Owner
PR merge authorization only.

## 7. Verdict

`POST-CUTOVER PRODUCTION RELEASE = PASS`

`READY FOR PRODUCT OWNER PR MERGE AUTHORIZATION`
