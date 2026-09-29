# Admin P1-07C-4A10A Production Pre-D Readiness and Safety Backup

Status: `PASS / PRODUCTION PRE-D READY / FRESH SAFETY BACKUP VERIFIED`

Evidence date: 2026-09-29（Asia/Shanghai）

This gate verifies the live Production state and creates a new recovery point
before the first authorized Production application of Pre-D. It does not apply
Pre-D, enroll real MFA, issue a commissioning intent or grant a role.

## 1. Authority and target

| Item                                     | Verified value                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Canonical Product RC                     | `f42217d913d44517b53935a68488100610bdff0f`                              |
| Prior docs closure                       | `975cae85d6779954481b4680f54523bfd1952189`                              |
| Production project                       | `fandom-harbor` / `szfhngifsipsrxcpekti`                                |
| Production region                        | `ap-southeast-1`                                                        |
| Production health                        | `ACTIVE_HEALTHY` before and after backup                                |
| QA project, excluded from this operation | `gqtchjrmpuxibxmurvfd`                                                  |
| Formal Admin                             | `fandom-harbor-admin`; paused; visitors receive `503 DEPLOYMENT_PAUSED` |
| Web Admin Entry                          | `disabled` / closed                                                     |

The exact Production ref and project name were verified through the read-only
Supabase management endpoint. All database inspection and dump connections used
the Production ref explicitly and enabled PostgreSQL read-only transaction mode.

## 2. Live migration and schema gate

The live `supabase_migrations.schema_migrations` inventory contains exactly 19
rows. It contains neither:

- `20260818120000_admin_p1_option_b_elevated_access_pred`; nor
- `20260819225318_admin_p1_identity_access_cutover`.

The necessary Pre-D prerequisites are present without unknown drift:

- identity access baseline tables `profiles`, `memberships` and `role_grants`;
- `audit_logs` and the private request ledger;
- required Auth user, identity, Session and MFA-factor tables;
- all expected ordinary/private helper functions, ledger constraint, RLS and
  grants used by the reviewed Pre-D contract.

Pre-D policy/intent objects and the narrow commissioning RPCs are correctly
absent at the 19-migration baseline. Therefore ordinary Admin cannot commission
an elevated role in the current Production state.

Result: `PRODUCTION PRE-D PREREQUISITES = PASS`.

## 3. Real identity and Super Admin baseline

Only non-secret existence, uniqueness, Membership, role and MFA-factor metadata
were inspected. No password, token, Cookie, OTP, TOTP secret, QR code or recovery
credential was read or recorded.

| Identity              | Unique Auth mapping                  | Membership | Current roles           | Verified TOTP/MFA factor |
| --------------------- | ------------------------------------ | ---------- | ----------------------- | ------------------------ |
| `Phase2RemoteInviter` | YES — one Auth user and one identity | active     | `author`, `super_admin` | NO                       |
| `akumie`              | YES — one Auth user and one identity | active     | none                    | NO                       |

The active Production Super Admin count is exactly one. The only active Super
Admin is `Phase2RemoteInviter`; no unknown additional Super Admin was detected,
and `akumie` is not yet a Super Admin.

The future commissioning inputs are unambiguous:

- actor: `Phase2RemoteInviter`;
- target: `akumie`;
- operation: `grant_super_admin`.

No policy binding was created. Result:
`PRODUCTION COMMISSIONING IDENTITIES RESOLVABLE = YES` and
`PRODUCTION SUPER ADMIN BASELINE = PASS`.

## 4. Fresh Production safety backup

| Item                           | Value                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Backup identifier              | `20260929-113150_P1-07C-4A10A_PRE_D_SAFETY`                                                       |
| Timestamp                      | `2026-09-29T03:31:50.358Z` / `2026-09-29 11:31:50+08:00`                                          |
| External directory             | `/Users/liuzyzy/Documents/FandomHarbor-Private-Backups/20260929-113150_P1-07C-4A10A_PRE_D_SAFETY` |
| PostgreSQL server / dump tools | `17.6` / `18.6`                                                                                   |
| Migration baseline             | `19/21`; Pre-D absent; D absent                                                                   |
| Directory / file permissions   | `0700` / `0600`                                                                                   |
| Host disk encryption           | FileVault on                                                                                      |
| Restore performed              | NO                                                                                                |
| Production write performed     | NO                                                                                                |

The existing repository-approved warehouse-external logical backup pattern was
reused. The archive set contains:

1. baseline and post-backup inventories;
2. a custom-format `public` + `private` business archive;
3. a custom-format `supabase_migrations` archive;
4. a data-only custom-format recovery subset for durable Auth identity,
   provider, MFA and SSO tables;
5. an Auth schema reference archive;
6. a non-secret roles inventory, manifest, archive lists and checksums.

Transient Auth state is intentionally excluded: Sessions, refresh tokens,
one-time/challenge/flow state and managed Auth audit/migration records. A
recovery using this archive set requires every user to reauthenticate. Managed
role passwords were not exported. Storage contained zero buckets and zero
objects, so no object payload archive was required.

### Primary archive checksums

| Artifact                          |   Bytes | SHA-256                                                            |
| --------------------------------- | ------: | ------------------------------------------------------------------ |
| `01_business_public_private.dump` | 325,994 | `dd8a220e429b65cd8dd148f01c7cfc2b2a7f7adeef4650ee91e2ab72aaa6e16d` |
| `02_migration_history.dump`       |  24,358 | `979a6d3869e9feb47ea4fb029fc0a7ebe4f408814cb9782be637811ec81158c3` |
| `03_auth_recovery.dump`           |  20,445 | `e91c8c001401258650fcf693347990939d569ceb22f0f30ddbbb3b376ac9965c` |
| `04_auth_schema_reference.dump`   | 102,026 | `3b154d083c4e7191cfc82979d428ce5b24a7b9dc85b052ce36c1eb1417a32a9f` |

`SHA256SUMS.txt` covers every non-circular evidence artifact. Independent
verification passed for every checksum. Each custom archive passed
`pg_restore --list` and a complete offline parse to `/dev/null`.

The baseline and post-backup catalogs are equal, durable row counts are equal,
and the migration count remained 19. Production health remained
`ACTIVE_HEALTHY`. Result: `FRESH PRODUCTION SAFETY BACKUP = PASS`.

This is structural backup verification, not a restore drill. The four archives
were created as separate consistent dump snapshots; no shared snapshot across
archives is asserted. Full end-to-end recovery, managed Auth compatibility,
external extensions and destination role compatibility remain separate restore
validation concerns.

## 5. Preserved boundaries

- Production data, Auth, Membership and Role mutation: not executed.
- Production Migration, Pre-D and Migration D: not executed.
- `Phase2RemoteInviter` and `akumie` MFA enrollment: not executed.
- Commissioning intent and `grant_super_admin`: not executed.
- Product code, ADR-024, Pre-D and Migration D: unchanged.
- Formal Admin: remains paused.
- Web Admin Entry: remains closed.
- Deployment, PR merge and force push: not executed.

The only next authorization boundary is:

`PRODUCTION PRE-D MIGRATION 19 → 20`

Nothing in this evidence authorizes that migration automatically. Migration D,
real MFA and commissioning remain blocked behind later explicit gates.
