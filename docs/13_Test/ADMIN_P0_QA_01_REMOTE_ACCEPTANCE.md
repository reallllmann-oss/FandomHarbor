# Admin P0 QA-01 Remote Acceptance

Date: 2026-07-31

Mission: `Fandom Harbor Admin P0 QA-01 — Remote Supabase and Browser Acceptance`

Status: `PASS`

## Safety and target

- Worktree: `/Users/liuzyzy/Documents/FandomHarbor-Admin-P0-DB01`
- Branch: `feature/admin-p0-site-copy-db-01`
- Starting HEAD: `cb7b44b53930ccedf8c9dc26d17887f48e638e7c`
- Remote project: `fandom-harbor` / `szfhngifsipsrxcpekti` / `ap-southeast-1`
- Remote state before work: `ACTIVE_HEALTHY`, fourteen applied Migrations and no Site Copy objects.
- Admin and Web were started from the accepted Worktree against the same remote host and the same publishable-key fingerprint. No Service Role Key entered either browser process.
- The release Worktree retained its four pre-existing Admin/document changes with zero staged files. No protected file was changed, staged or cleaned.

## Backup and migration gate

A fresh repository-external logical export was created before migration at:

`/Users/liuzyzy/Documents/FandomHarbor-QA01-Backups/20260731T113716Z`

The directory is mode `0700`; export files are mode `0600`. Schema, data and role exports completed and contained the required `public`, `auth` and `storage` markers.

| Export       | Bytes  | SHA-256                                                            |
| ------------ | ------ | ------------------------------------------------------------------ |
| `schema.sql` | 175178 | `c4f0ecac0aeefe16ca249ea5937ac7573428fb5a4107b68ae3d042f54143e47b` |
| `data.sql`   | 295131 | `4cc7f5d3f7affd4236478bbb5f1d6bf8effaff44996a84a23ee8030ce615e836` |
| `roles.sql`  | 297    | `25873cec56a2cc6514e204f420231777f85c03da818caa7090cdcdfa89776ecd` |

The migration dry-run contained only the two accepted pending files and no destructive `DROP`, `TRUNCATE`, business `DELETE`, Auth/Role/Membership/content/storage mutation or unknown migration:

1. `20260730110000_admin_p0_site_copy_foundation.sql`
2. `20260730120000_admin_p0_site_copy_baseline.sql`

The linked push applied exactly those files. Final local/remote migration history is 16/16 aligned.

## Remote database acceptance

- `site_copy_revisions` and `site_copy_state` exist with RLS enabled. Direct table access remains denied to `anon` and `authenticated` application roles.
- `get_public_site_copy`, `get_admin_site_copy` and `save_site_copy` are `SECURITY DEFINER` with an empty `search_path` and the accepted minimal grants.
- Public projection returns only Version and the exact eight public fields. It does not return Revision, Audit, actor, reason or time.
- Anonymous Public Read returned Version 1 and the exact DATA-01 baseline. Anonymous Admin Read/Save and direct table access were denied.
- Existing active Super Admin strict read/save succeeded. Existing Reader and Author Admin read/save attempts returned stable `FORBIDDEN`; no role, membership or account state was changed.
- Same-request retry returned the original Saved Version, Revision and Audit. Reusing the request ID with a different normalized reason returned `INVALID_INPUT`. Both checks produced zero writes.
- Unchanged and stale-base Conflict produced no Revision, Audit or Pointer movement. The stale browser session retained all eight inputs and reason and did not auto-retry.
- Every Site Copy Revision has exactly one immutable Audit and every Site Copy Audit has exactly one Revision. Request IDs and Audit IDs are unique.

## Browser acceptance

The local applications used production builds on `127.0.0.1:3001` and `127.0.0.1:3000`. The Product Owner entered credentials manually; no password, token, cookie or complete credential was recorded.

- Admin strict read showed database Version 1, the exact eight fields, active Super Admin and `admin:operate`.
- `/access` loaded its existing role, membership and invitation controls. No `/access` operation was submitted.
- Review normalized the draft and displayed exactly eight changed fields plus a valid 4–200 code-point reason.
- Saved returned real database Version 2, Audit 76, eight changed-field names and database time. A fresh Admin request read the saved eight fields.
- A no-diff review returned Unchanged at Version 2 and created no Revision or Audit.
- A second browser session kept Version 1 as its base. Its later save returned Conflict against Version 2, preserved draft and reason, performed no overwrite and created no write.
- A new Web request rendered all temporary Homepage, CTA, Navigation and Footer labels. CTA targets remained `/archive` and `/search`; navigation remained Archive → Search → Studio; legal links remained `/privacy`, `/terms` and `/content-policy`.
- Guest Web rendered Archive and Search but not Studio; direct guest `/studio` redirected to `/auth/sign-in`. The authenticated elevated session retained its existing Studio access.
- On 2026-08-03, an existing Reader completed manual sign-in. A direct browser request to `/studio` ended at the exact `/archive` URL with no Studio workspace, confirming the existing Reader boundary.
- Web HTML contained no Site Copy Version, Revision, Audit, actor, reason or transport detail. Client bundles contained no Site Copy RPC, table or internal field identifiers.

## Restore and final remote state

The temporary content was restored through the normal Admin Review and Save path with reason `QA-01 restoration to pre-QA site copy`; there was no direct Pointer update and no Audit deletion.

- Current Site Copy is Version 3 and all eight values equal the QA-before Version 1 content.
- A fresh Admin request and a fresh Guest Web request both rendered the restored baseline; no QA marker remained.
- QA created two legitimate update Revisions and two legitimate update Audits: one temporary save and one restoration. Together with DATA-01 initialization, the final totals are three Revisions and three Site Copy Audits.
- Initialization Audit is actor-null with the exact initialization reason and eight metadata keys. Both update Audits have a real actor, exact normalized reason and eight changed-field metadata keys.

| Data set        | Before QA | After QA |
| --------------- | --------: | -------: |
| Auth users      |        37 |       37 |
| Profiles        |        36 |       36 |
| Memberships     |        36 |       36 |
| Role grants     |         5 |        5 |
| Works           |        10 |       10 |
| Chapters        |        32 |       32 |
| Articles        |         0 |        0 |
| Invitations     |        35 |       35 |
| Storage objects |         0 |        0 |
| Audit logs      |        74 |       77 |

The only three new Audit rows are DATA-01 initialization, QA temporary save and QA restoration. No non-Site-Copy Audit appeared after initialization.

## Regression evidence

- Workspace lint: PASS.
- Workspace typecheck: PASS.
- Workspace test: PASS, 335 tests total. Web 93, Admin 54, Services 70 and Database 96 all pass.
- Web, Admin and Docs production builds: PASS.
- Local clean rebuild: PASS, all sixteen Migrations applied from empty state.
- DATA-01, DB-01, double-connection concurrency and Identity/Access SQL suites: PASS.
- Database lint: exit 0 with two existing assignment-cast warnings in `private.initialize_site_copy_baseline`; no error was reported.
- Client boundary scan: PASS; HTML and client bundles contain no Site Copy RPC/table/internal metadata identifiers.
- Public fallback was not fault-injected remotely. WEB-01 isolated field/full fallback tests remain the evidence; normal remote browser reads did not return 500.
- Repository-wide Prettier check remains blocked only by the two pre-existing protected Release documents `V1-ADMIN-PUBLIC-ALIAS-RETIREMENT.md` and `V1.0.2-RELEASE-CLOSURE.md`. Authorized files, lint, typecheck, tests and builds were validated separately; neither protected file was modified.

## Stop boundary

- Production Web received no deployment and continues to use its previously deployed code. QA markers never appeared on the production homepage.
- Admin Production was not resumed and remains Paused.
- No Push, PR, Preview, Production Deployment, Vercel change, DNS change, Auth/Role/Membership change or remote business-data cleanup was performed.
- QA evidence is eligible for one local documentation-only commit. No product code, Migration, dependency or lockfile belongs in that commit.
