# B3-SA3-RC Preview Readiness

Status: **PASS — RC PREPARED / NOT DEPLOYED**

Date: 2026-10-21

## Frozen baseline

- Branch: `codex/v1-package-b0-auth-architecture`
- Base HEAD: `1812c8596dc3f976d2d8f6cae53c01a0cd3fd2ba`
- Preview Supabase project: `bniqsjnjqesnpcfkpqcz`
- Production Supabase project: `szfhngifsipsrxcpekti` (hard deny; never an RC target)
- SA1 migration: `20261020113458_super_admin_email_binding_operations.sql`
- Migration SHA-256: `c04c8fb2f6f2bb1ce13af419353fc1f900c641c99c7de8e571eb1193153dc655`
- Preview expected migration transition: 25 → 26.

## Runtime isolation contract

The feature is enabled only when every check below succeeds:

1. The explicit B3-SA feature flag and deployment target are enabled.
2. Vercel system identity reports both `VERCEL_ENV=preview` and `VERCEL_TARGET_ENV=preview`.
3. The actual Vercel project ID and Git branch exactly match their expected server-only configuration.
4. The configured and URL-derived Supabase project refs both equal the approved Preview ref.
5. The Production Supabase ref is rejected before any request or credential use.
6. The environment UID list contains one or two unique UUIDs and exactly matches the database P1-07C commissioning target set.
7. A service-role-only target RPC succeeds against that exact URL, proving the server key can access the same project and the database allowlist matches.
8. Every Operation and every Server Action still rechecks the exact target UID, live Session context, AAL2/TOTP evidence, immutable email HMAC, and ledger state.

Production deployments fail closed even if ordinary B3-SA variables are copied, because the Vercel environment, fixed Preview ref, Vercel project ID, Git branch, URL-derived ref, database targets, and Operation UID must all agree.

## Preview-only environment variables

Values must be scoped to the independent Admin Preview project and the approved branch. Secret values must never be copied into tickets, chat, logs, or Git.

| Variable                               | Type   | Boundary                                                                 |
| -------------------------------------- | ------ | ------------------------------------------------------------------------ |
| `B3_SA_EMAIL_BINDING_ENABLED`          | Config | `true` only during the authorized Preview window; absent/false otherwise |
| `B3_SA_DEPLOYMENT_TARGET`              | Config | Exact value `preview`                                                    |
| `B3_SA_EXPECTED_SUPABASE_PROJECT_REF`  | Config | Approved Preview ref only                                                |
| `B3_SA_EXPECTED_VERCEL_PROJECT_ID`     | Config | Exact independent Admin Preview Vercel project ID                        |
| `B3_SA_EXPECTED_GIT_BRANCH`            | Config | Exact approved RC branch                                                 |
| `B3_SA_ALLOWED_TARGET_UIDS`            | Config | Exact synthetic Preview UIDs only; must match the database policy set    |
| `B3_SA_EMAIL_HMAC_SECRET`              | Secret | Preview-only, at least 32 random bytes; distinct from Production         |
| `B3_SA_PREVIEW_SENDER_API_KEY`         | Secret | Preview-only Resend Sending Access key; not the Supabase SMTP password   |
| `SUPABASE_SECRET_KEY`                  | Secret | Existing Preview project server key only                                 |
| `NEXT_PUBLIC_SUPABASE_URL`             | Config | Existing Preview project URL                                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Config | Existing Preview project publishable key                                 |

`B3_SA_LOCAL_SENDER_URL` and `B3_SA_LOCAL_SENDER_TOKEN` remain local-only and must not be configured in Preview. No B3-SA variables are required or permitted in Production for this RC.

## Synthetic Preview identities

- Create exactly two synthetic Super Admin identities using supported GoTrue and existing P1-07C flows; never import Production users, factors, passwords, sessions, or data.
- Use independent synthetic `.invalid` current emails, unique passwords, two independently enrolled verified TOTP factors each, active Membership, and the existing exact Super Admin role contract.
- Bind the Preview commissioning policy to those exact UIDs and registration names. The server environment list must match the database result exactly.
- Run only one active binding Operation globally. Preserve ledger/audit history if recovery is required.

Cleanup order:

1. Disable the feature flag and confirm the route is inaccessible.
2. Restore/disable the Preview-only commissioning fixture without changing Production policy.
3. Globally revoke synthetic Sessions and verify sensitive RPCs reject old `session_id` claims.
4. Ban/isolate synthetic identities, revoke sender credentials, and remove B3-SA Preview secrets.
5. Keep non-sensitive Operation and audit evidence; do not reset the Preview database.

## Deployment and acceptance order

1. Reconfirm Web/Admin Preview Protection, branch tracking, project IDs, Supabase refs, and no Production deployment trigger.
2. Commit only reviewed SA1/SA2/SA3-RC files; push without merge or force push. With the feature variables absent, the new route must remain disabled.
3. Confirm the exact SHA is Ready and protected on Admin Preview; confirm Production has no deployment or variable change.
4. Apply only Migration 26 to `bniqsjnjqesnpcfkpqcz` through Migration History; verify 26/26, checksum, ACL, empty ledger, and unchanged roles/memberships.
5. Create and verify the isolated synthetic identities and exact database target set.
6. Configure the Preview-only variables, enable the gate, and redeploy the same SHA.
7. Prove the runtime boundary, then execute one controlled operation at a time: password UID, fresh AAL2/TOTP, current/new arms, Preview-only OTP, interruption recovery, global sign-out, old refresh-token rejection, old-JWT live-session rejection, elevated-intent invalidation, independent reauthentication, and final continuity checks.
8. Disable and clean up before any review concludes.

## Stop gates and failure recovery

Stop before identity mutation if any project ref, key ownership, Vercel project/branch, UID set, migration count, Protection status, sender credential, or SMTP/domain ownership is uncertain.

After current-arm confirmation or identity change, never issue uncontrolled replacement credentials and never write the email back directly. Move the ledger to `recovery_required`, authoritatively inspect Auth state, keep the feature protected, and require a separately approved recovery decision. An `identity_changed` Operation must proceed through session revocation and `awaiting_reauth`; timeout must not treat it as rolled back.

## Authorization still required

Product Owner approval remains required for each of: local commit, push, Preview deployment, Migration 26, synthetic identity/P1 fixture creation, Preview environment variables/secrets, real Preview email delivery, Hosted acceptance, and cleanup. No Merge or Production action is part of B3-SA3.
