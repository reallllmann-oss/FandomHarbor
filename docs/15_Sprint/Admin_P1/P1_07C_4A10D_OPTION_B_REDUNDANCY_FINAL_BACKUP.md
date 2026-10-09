# Admin P1-07C-4A10D Option B Redundancy and Final Pre-Cutover Backup

Status: `PASS / DUAL SUPER ADMIN REDUNDANCY / FRESH PRE-CUTOVER BACKUP VERIFIED`

Evidence date: 2026-10-10（Asia/Shanghai）

This closure records the post-commissioning Production state and the fresh
recovery point required before the final P1-07C-4A rerun. It does not apply
Migration D, deploy Production, resume Formal Admin or open Web Admin Entry.

## 1. Authority and Production state

| Item                         | Verified value                                                 |
| ---------------------------- | -------------------------------------------------------------- |
| Canonical Product RC         | `f42217d913d44517b53935a68488100610bdff0f`                     |
| Production project           | `fandom-harbor` / `szfhngifsipsrxcpekti`                       |
| Migration baseline           | exactly 20; Pre-D applied; Migration D not applied             |
| `Phase2RemoteInviter`        | active; `author + super_admin`; two verified TOTP factors      |
| `akumie`                     | active; `super_admin`; two verified TOTP factors               |
| Active Super Admin count     | exactly 2                                                      |
| Commissioning result counts  | Grant 1 / Audit 1 / Ledger 1 / Consume 1 / unconsumed intent 0 |
| Additional Super Admin       | none                                                           |
| Production business mutation | none in this backup/closure task                               |

The post-commissioning retry disposition is
`NOT REPRODUCIBLE AFTER AUTHORIZED SESSION DISPOSAL`. Existing A8 exact-retry
evidence remains the authority for canonical one-result replay behavior. No
Session was restored or forged, no bypass was used, no duplicate mutation was
executed, and optional new-session replay rejection was not required for this
backup gate.

The independently authenticated `akumie` path previously passed AAL2, trusted
TOTP/session claims, Super Admin authorization and protected Search, Detail and
Audit reads. This task did not repeat those quota-heavy checks.

Result: `DUAL SUPER ADMIN REDUNDANCY = PASS`.

## 2. Backup attempts

### Attempt 1 — retained failed evidence

| Item            | Value                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Backup ID       | `20261010-002941_P1-07C-4A10D_R1_POST_COMMISSIONING`                                                       |
| Directory       | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/20261010-002941_P1-07C-4A10D_R1_POST_COMMISSIONING` |
| Result          | `INVALID / INCOMPLETE`                                                                                     |
| Cause           | local `jq` dependency missing                                                                              |
| Process exit    | `127`                                                                                                      |
| Invalid markers | `inventory.json` is 0 bytes; `MANIFEST.json`, `SHA256SUMS.txt` and `06_integrity_verification.txt` absent  |

The directory remains `0700` and its existing files remain `0600`. It was not
deleted, overwritten, resumed or completed after the fact, and must never be
used as a recovery source.

### Attempt 2 — current verified recovery source

| Item                         | Value                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Backup ID                    | `20261010-003942_P1-07C-4A10D_R1_POST_COMMISSIONING`                                                       |
| Local timestamp              | `2026-10-10T00:39:42+0800`                                                                                 |
| UTC timestamp                | `2026-10-09T16:39:42Z`                                                                                     |
| Directory                    | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/20261010-003942_P1-07C-4A10D_R1_POST_COMMISSIONING` |
| Production ref               | `szfhngifsipsrxcpekti`                                                                                     |
| Product RC recorded          | `f42217d913d44517b53935a68488100610bdff0f`                                                                 |
| PostgreSQL / dump tool       | `17.6` / `18.6`                                                                                            |
| Migration state              | 20; Pre-D applied; D absent                                                                                |
| Directory / file permissions | `0700` / `0600`                                                                                            |
| Process exit                 | `0`                                                                                                        |
| Restore performed            | NO                                                                                                         |
| Production write performed   | NO                                                                                                         |

The exact Production database password was obtained from macOS Keychain entry
`FandomHarbor Production Database CLI` / `postgres` into a temporary non-echo
shell variable. It was not printed, logged, written to a file, passed in process
arguments, committed or documented. Temporary credential variables were
cleared when the process exited.

`jq` was installed through Homebrew as the explicitly authorized local tool
dependency and verified as `jq-1.8.2`. No backup script or product code was
changed.

## 3. Backup scope and secret boundary

The verified archive set contains:

1. pre/post catalogs and recovery inventories;
2. custom-format `public` + `private` schema/data;
3. custom-format `supabase_migrations` history;
4. a data-only durable Auth subset for users, identities, instances and durable
   OAuth/SSO/SAML/WebAuthn/SCIM records;
5. sanitized MFA factor metadata for the two controlled identities;
6. an Auth schema reference and roles inventory without role passwords;
7. archive lists, `inventory.json`, `MANIFEST.json`, `SHA256SUMS.txt` and the
   integrity record.

The Auth data archive excludes raw `auth.mfa_factors`, Sessions, refresh tokens,
MFA recovery codes and managed operational state. Sanitized MFA evidence records
only registration name, factor type/status/friendly name and timestamps. No TOTP
secret, QR payload, OTP, JWT, Cookie, refresh token or plaintext password is
present in the text evidence.

Primary archives:

| Artifact                          |   Bytes | SHA-256                                                            |
| --------------------------------- | ------: | ------------------------------------------------------------------ |
| `01_business_public_private.dump` | 379,006 | `92e188e4bb015f44ddf7847c6e888534a4cf20f5352bdec0fc0d917be6c8a614` |
| `02_migration_history.dump`       |  30,350 | `eeec872a4b339b7f219b704d37efe96086f937eb7457c4f797652ce70086e233` |
| `03_auth_recovery.dump`           |  19,403 | `fcb7bbd457911da94804d6e6c26bd5dcde7ede15175eee911131a25489a93837` |
| `04_auth_schema_reference.dump`   | 102,026 | `db6bd4709de52ad4ced871d4dffe067d089e0f8a943263516563c94ae5f2d7c2` |

## 4. Integrity verification

| Verification                                       | Result |
| -------------------------------------------------- | ------ |
| Fresh timestamp and exact Production ref           | PASS   |
| `inventory.json` non-zero, valid and state-matched | PASS   |
| `MANIFEST.json` valid; 14 artifacts                | PASS   |
| `SHA256SUMS.txt` full verification                 | PASS   |
| Four custom archives `pg_restore --list`           | PASS   |
| Four custom archives offline parse to `/dev/null`  | PASS   |
| Pre/post inventory byte equality                   | PASS   |
| `06_integrity_verification.txt` complete           | PASS   |
| Raw MFA/transient Auth exclusions                  | PASS   |
| Sensitive text scan                                | PASS   |
| Directory/file permissions `0700/0600`             | PASS   |

No destructive restore was performed. Structural verification does not replace
an independently authorized isolated restore drill.

Result: `FRESH PRE-CUTOVER BACKUP = PASS`.

## 5. Final read-only Production check and release boundary

The final read-only query returned the same state as the pre-backup gate:
20 migrations, Pre-D present, D absent, the two expected active Super Admins,
two verified TOTP factors per identity, commissioning counts `1/1/1/1`, and no
unconsumed intent or third Super Admin.

Formal Admin and Web Admin Entry were not live-queried through the unavailable
external channel. Their accurate disposition is
`LIVE CHECK UNAVAILABLE / STATE UNCHANGED BY THIS TASK`; repository authority
remains Formal Admin `paused=true` and Web Admin Entry `disabled / closed`.

Product code, ADR-024, Pre-D and Migration D are unchanged. No deployment,
Admin resume, Web-entry opening, PR merge, force push, third Super Admin or
existing Super Admin revocation occurred.

Final verdict:

`OPTION B REDUNDANCY & FRESH PRE-CUTOVER BACKUP = PASS`

The only next authorization boundary is:

`P1-07C-4A FINAL RERUN`

Migration D remains blocked.
