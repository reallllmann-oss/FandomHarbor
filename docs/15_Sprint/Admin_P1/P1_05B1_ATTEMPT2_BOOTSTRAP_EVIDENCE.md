# Admin P1-05B-1R2 Clean QA Bootstrap Attempt 2 Evidence

Status: `TECHNICAL PASS / PRODUCT OWNER ACCEPTED / WAITING FOR CLOSURE COMMIT`

Date: 2026-08-20
Baseline: `4f93db9a834843da7640bdf52a31817f2ff528e1`
Branch: `codex/admin-p1-04-ordinary-mutations`

This evidence covers only clean QA reprovisioning, the complete 20-Migration
bootstrap and post-apply catalog/security inspection. It does not authorize or
record fixtures, business mutation QA, P1-05B-2, P1-06, P1-07, P1.1 or any
Production operation.

## 1. Attempt separation and retirement

| Project    | Identity                                               | Result / action                                                                                                |
| ---------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Attempt 1  | `fandom-harbor-admin-p1-qa` / `gqtchjrmpuxibxmurvfd`   | Historical 19/20 failed bootstrap evidence; emergency fail-closed; paused to `INACTIVE`; not deleted or reused |
| Attempt 2  | `fandom-harbor-admin-p1-qa-2` / `hicfnlwzmnbxhimyeviy` | New Free/Nano Project; clean 20/20 bootstrap PASS; `ACTIVE_HEALTHY`                                            |
| Production | `fandom-harbor` / `szfhngifsipsrxcpekti`               | Untouched; not linked or used as a Migration, SQL, credential or data source                                   |

Attempt 1's failure evidence remains in
[`P1_05B1_BOOTSTRAP_FAILURE_AND_FIX.md`](P1_05B1_BOOTSTRAP_FAILURE_AND_FIX.md).
It was not reset, patched, populated, resumed or deleted. Pausing released the
Free Project slot while retaining the failure state.

## 2. Attempt 2 identity and isolation

| Field                     | Attempt 2                             |
| ------------------------- | ------------------------------------- |
| Display name              | `fandom-harbor-admin-p1-qa-2`         |
| Project ref / Auth tenant | `hicfnlwzmnbxhimyeviy`                |
| Region                    | `ap-southeast-1`                      |
| API host                  | `hicfnlwzmnbxhimyeviy.supabase.co`    |
| Database host             | `db.hicfnlwzmnbxhimyeviy.supabase.co` |
| Final health              | `ACTIVE_HEALTHY`                      |

The ref, API host, database host and Auth tenant differ from both Production and
Attempt 1. No Production or Attempt 1 data, Auth users, schema, backup,
credentials or fixtures were copied. The database credential was generated for
Attempt 2, used only through controlled local secret handling and was not written
to Git, documentation, screenshots, logs or chat.

### Accepted Operational Deviation

| Classification                      | Accepted record                           |
| ----------------------------------- | ----------------------------------------- |
| Deviation type                      | `QA-ONLY OPERATIONAL CREDENTIAL RECOVERY` |
| Affected environment                | Attempt 2 only                            |
| Affected Project ref                | `hicfnlwzmnbxhimyeviy`                    |
| Production / Attempt 1 impact       | NONE / NONE                               |
| Schema / Migration / ACL impact     | NONE / NONE / NONE                        |
| Business data / Auth fixture impact | NONE / NONE                               |
| Secret exposure                     | NONE                                      |
| Product Owner decision              | `ACCEPTED OPERATIONAL SCOPE DEVIATION`    |

The Project creation itself succeeded, but the CLI prepended progress text to its
JSON response and the local parser did not retain the first generated database
password. One official database-password rotation was then performed on Attempt
2 only so the authorized Migration chain could proceed. The Product Owner accepts
this QA-only operational credential recovery. The event remains explicitly
recorded and must not be rewritten as a deviation-free execution or treated as a
precedent for expanding any future remote authorization.

## 3. Clean initial state

The pre-Migration read-only inspection returned:

- Auth users: `0`;
- Migration catalog: absent;
- `public` relations/functions: none;
- `private` schema: absent;
- profiles, Memberships, Role grants and P1 fixtures: none because the
  application schema did not yet exist;
- unexplained user-created objects: none.

No cleanup or manual schema action was needed or performed.

## 4. Complete Migration apply

The dry run listed exactly the repository's 20 Migration files in filename order.
The linked apply then executed all 20 from
`20260629210000_identity_access_foundation.sql` through
`20260819225318_admin_p1_identity_access_cutover.sql` without skipping,
repairing, copying schema or manually marking history.

| Gate                                                      | Result      |
| --------------------------------------------------------- | ----------- |
| Repository Migration count                                | `20`        |
| Remote catalog count                                      | `20`        |
| Exact order                                               | YES         |
| Unknown / missing Migration                               | NONE / NONE |
| A — `20260817104616_admin_p1_identity_access_ledger.sql`  | APPLIED     |
| B — `20260817121610_admin_p1_identity_access_reads.sql`   | APPLIED     |
| C — `20260817125140_admin_p1_identity_access_writes.sql`  | APPLIED     |
| D — `20260819225318_admin_p1_identity_access_cutover.sql` | APPLIED     |

The CLI emitted a local post-apply pg-delta catalog-cache certificate warning
after reporting `Finished supabase db push`. The independent remote read-only
catalog query then returned the exact 20 versions and names, so the warning did
not represent a Migration or remote catalog failure.

## 5. Hosted ACL normalization and final matrix

Hosted initial privilege difference observed: **YES**. The fresh Hosted catalog's
default function ACLs grant `EXECUTE` to `anon`, `authenticated` and
`service_role`, unlike the local assumption that caused Attempt 1 to fail. The R1
version of D accepted that normalizable starting state, validated hard catalog
contracts, revoked legacy `PUBLIC/anon/authenticated/service_role` execute,
proved deny, granted only the exact v2 signatures to `authenticated`, and
completed atomically.

| Function group                    |             Direct execute | Effective execute including `PUBLIC` inheritance | Result |
| --------------------------------- | -------------------------: | -----------------------------------------------: | ------ |
| Three legacy Membership/Role RPCs |                     `0/12` |                                           `0/12` | PASS   |
| Three ordinary v2 write RPCs      | `3/12`, authenticated only |                       `3/12`, authenticated only | PASS   |
| Three read RPCs                   | `3/12`, authenticated only |                       `3/12`, authenticated only | PASS   |
| Nine P1 private helpers/executor  |                     `0/36` |                                           `0/36` | PASS   |

All 18 expected signatures resolved and no overload was found. The focused
Role/Membership/Identity Access inventory exposes only the three read and three
ordinary v2 signatures to `authenticated`; the three legacy RPCs expose none.
Migration D contains no `ALL FUNCTIONS`, schema-wide execute or elevated write
grant. Hosted platform defaults remain observable as the normalized starting
condition, but final per-function ACLs are exact. Emergency close-writes was not
needed.

## 6. Read, private, Ledger and Audit security

| Contract                        | Remote result                                                                                 |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| Search                          | `STABLE SECURITY INVOKER`, owner `postgres`, `search_path=""`                                 |
| Audit                           | `STABLE SECURITY INVOKER`, owner `postgres`, `search_path=""`                                 |
| Detail                          | controlled `STABLE SECURITY DEFINER`, owner `postgres`, `search_path=""`                      |
| Data API schemas                | `public,graphql_public`; `private` is not exposed                                             |
| Private helper/executor execute | application roles `0/36`                                                                      |
| Ledger                          | RLS enabled; no application-role table privilege; immutable UPDATE/DELETE trigger present     |
| Audit                           | RLS enabled; immutable UPDATE/DELETE trigger present; existing read/insert contract unchanged |

The foundation's existing `authenticated` schema usage does not expose private
tables or functions: it has no Ledger privilege and all nine P1 private function
execute checks remain false. Direct and effective function checks included
`PUBLIC` inheritance rather than relying on a single surface ACL field.

## 7. P0 seed and zero-fixture boundary

The formal P0 bootstrap is present as exactly one QA Site Copy state/revision at
Migration seed Version `1`, with its single initialization Audit row. Production
Version 7 was not copied or queried.

Post-apply application counts remain Auth users `0`, profiles `0`, Memberships
`0`, Role grants `0`, P1 request Ledger `0` and non-Site-Copy Audit `0`. No Auth,
Admin, Super Admin, Reader, Author, Membership, Role, elevated target or requestId
fixture was created. No Search functional case, Saved/Unchanged/Conflict,
grant/revoke, idempotency, concurrency, elevated denial, forced rollback or
cleanup QA was executed.

## 8. Completion boundary

The clean bootstrap, catalog, ACL and security result is `PASS`, and the Product
Owner has accepted the disclosed operational deviation. P1-05B-2 is `READY FOR
PRODUCT OWNER AUTHORIZATION` but was not authorized or started. P1 remains not
ready for Closure. There was no Production credential/data use or Production side
effect; Admin Production remains `paused=true`, Web Admin entry remains closed,
and P0 Production Site Copy remains Version 7. No Push, PR, Merge, Deployment,
P1-05B-2, P1-06, P1-07 or P1.1 occurred.
