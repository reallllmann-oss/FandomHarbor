# Admin P1-07C-4A10B Production Pre-D Migration Acceptance

Status: `PASS / PRODUCTION PRE-D APPLIED AND ACCEPTED / MIGRATION D BLOCKED`

Execution date: 2026-10-02（Asia/Shanghai）

This gate applied exactly the previously accepted Pre-D migration to the exact
Production project and then stopped at 20 migrations. It did not enroll MFA,
issue a real commissioning intent, grant a Role, apply Migration D, deploy an
application or open an Admin entry point.

## 1. Authority and final pre-migration gate

| Item                     | Verified pre-state                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Canonical Product RC     | `f42217d913d44517b53935a68488100610bdff0f`                                             |
| Prior governance closure | `ad0202d9a1212ec2da358276096a14d860b12c93`                                             |
| Production               | `fandom-harbor` / `szfhngifsipsrxcpekti` / `ACTIVE_HEALTHY`                            |
| Migration count          | 19                                                                                     |
| Pre-D                    | not applied                                                                            |
| Migration D              | not applied                                                                            |
| Safety backup            | `20260929-113150_P1-07C-4A10A_PRE_D_SAFETY`; checksum and structural verification PASS |
| Formal Admin             | `fandom-harbor-admin`; `paused=true`; Production Branch `admin-production-disabled`    |
| Web Admin Entry          | `disabled` / closed                                                                    |

The Production identities remained uniquely resolvable before execution:
`Phase2RemoteInviter` had active Membership and active `author` plus
`super_admin`; `akumie` had active Membership and no Role. Both had zero TOTP
factors, and the active Super Admin count was one.

The accepted files were byte-identical to both the A8 fix and canonical Product
RC versions:

| File                                                        | SHA-256                                                            | Result    |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | --------- |
| `20260818120000_admin_p1_option_b_elevated_access_pred.sql` | `3e799a866885d3730c099b32d14eea645ce81cd04bc18985b634bf563ec137d1` | unchanged |
| `20260819225318_admin_p1_identity_access_cutover.sql`       | `b44ed44145b25cdf4524f1e7fbdec802a2bb84972ce07c467e4ff4edbc95d69e` | unchanged |

## 2. Exact migration execution

An isolated temporary Supabase workdir was built from the 19 already-applied
migrations plus exact Pre-D only. It contained exactly 20 migration files, its
maximum version was `20260818120000`, and Migration D was absent. A live
`supabase migration list` showed 19 matched local/remote versions and exactly
one pending version: Pre-D.

Supabase CLI `2.108.0` then applied only:

`20260818120000_admin_p1_option_b_elevated_access_pred.sql`

The database password was supplied from the system credential store only to the
process environment. It was not placed in the connection URL, output, Git or
documentation.

The canonical policy binding performed inside the accepted migration records
the execution timestamp as:

- UTC: `2026-10-02T09:03:57.114384Z`
- Asia/Shanghai: `2026-10-02 17:03:57.114384+08:00`

Immediate verification returned exactly 20 migration-history rows, one Pre-D
row with 53 recorded statements, and zero Migration D rows. The latest version
is `20260818120000`; Production remained `ACTIVE_HEALTHY`.

## 3. Schema and shared-ledger acceptance

Live catalog verification—not migration history alone—confirmed:

- `private.elevated_commissioning_policy` and
  `private.elevated_access_intents` exist with RLS enabled;
- the policy table has one canonical row and the intent table has zero rows;
- all expected checks, foreign keys, unique constraints and primary keys exist;
- the MFA-evidence, actor-issued and target-issued indexes exist;
- the intent and ordinary-ledger request-claim triggers exist;
- `identity_access_request_operation` now permits exact
  `grant_super_admin` alongside the three ordinary operations;
- seven private helpers and four public elevated RPCs exist with the accepted
  invoker/definer split and fixed empty `search_path`;
- the confirmation function contains the atomic Role grant, Audit, shared
  ledger and one-time intent-consumption path.

Result: `PRODUCTION PRE-D SCHEMA ACCEPTANCE = PASS`.

## 4. ACL and commissioning safety state

| Boundary                                             | Result                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------- |
| Private policy/intent table CRUD for `anon`          | denied                                                           |
| Private policy/intent table CRUD for `authenticated` | denied                                                           |
| Private policy/intent table CRUD for `service_role`  | denied                                                           |
| Private helper execute for application roles         | denied                                                           |
| Elevated public RPC execute for `anon`               | denied                                                           |
| Elevated public RPC execute for `service_role`       | denied                                                           |
| Elevated public RPC execute for `authenticated`      | granted only through the complete database policy/runtime checks |

All four public elevated RPCs are `SECURITY DEFINER` with fixed empty
`search_path`. Their live definitions require the exact bound actor, current
Super Admin authority, exact bound target, two verified TOTP factors for both
identities, AAL2, a live original Session and fresh TOTP evidence no older than
300 seconds. The legacy `grant_role`/`revoke_role` wrappers accept only
`author`, and elevated-account Membership mutation remains blocked.

The migration's canonical initialization bound and enabled the exact
`Phase2RemoteInviter` → `akumie` policy row as accepted in A7/A8. This does not
open commissioning: both identities still have zero TOTP factors, no AAL2
ceremony occurred and the runtime policy fails closed. The elevated intent,
ledger, Role and Audit counts remain zero-delta.

Read-only denial probes confirmed Reader, Author and non-actor identities cannot
read the elevated policy through the RPC. There is no active ordinary Admin in
Production; self-elevation is nevertheless blocked by the exact-actor plus live
Super Admin guard and by the author-only legacy Role wrapper.

Result: ACL/RLS/grants and commissioning safety state `PASS`.

## 5. Identity and ordinary read regression

| Identity                 | Post-migration state                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| `Phase2RemoteInviter`    | same stable identity; active Membership; `author` + `super_admin`; zero TOTP/MFA |
| `akumie`                 | same stable identity; active Membership; no Role; zero TOTP/MFA                  |
| Active Super Admin count | exactly one: `Phase2RemoteInviter`                                               |

The key business/Auth counts remained at the verified baseline: Profiles 36,
Memberships 36, Role Grants 5, Audit 81, shared Ledger 0, Auth users 37, Auth
identities 37 and MFA factors 0. No real intent, Role grant or Audit event was
created.

A read-only Production call under the existing Super Admin identity passed:

- Search for `akumie`: one item;
- Detail for `akumie`: found;
- Audit read: callable, zero matching items in the requested page.

The calls ran inside read-only transactions and were rolled back. A8/A9 remain
the authority for destructive and heavy integration coverage.

## 6. Preserved boundaries

- Production business data, Auth, Role and MFA mutation: not executed.
- Real AAL2, intent issuance and `grant_super_admin`: not executed.
- Migration D and the 21st migration: not executed.
- Product code, Pre-D source and Migration D source: unchanged.
- Production deployment: unchanged.
- Formal Admin: remains paused.
- Web Admin Entry: remains closed.
- PR merge, force push and final pre-cutover backup: not executed.

The only next authorization boundary is:

`4A10C REAL MFA ENROLLMENT & CONTROLLED COMMISSIONING`

Migration D remains blocked. After controlled commissioning and independent
second-Super-Admin acceptance, a new final Pre-Cutover Backup is still required.
