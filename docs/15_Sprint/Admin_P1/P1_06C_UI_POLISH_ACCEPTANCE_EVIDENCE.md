# Admin P1-06C UI Polish Acceptance Evidence

Status: `PASS / COMPLETE / COMMITTED BY P1-06C CLOSURE`

- Date: 2026-09-06
- Branch: `codex/admin-p1-04-ordinary-mutations`
- Closure parent: `c9643d387c1216d40260882e6055b423576362ee`

## 1. Closure authority

| Item                    | Accepted result                                                            |
| ----------------------- | -------------------------------------------------------------------------- |
| P1-06B manual Preview   | PASS                                                                       |
| P1-06C UI polish        | PASS                                                                       |
| Final accepted Preview  | `dpl_HiF87dWBe54kXCMum3yN29nWHCxa`                                         |
| Target / build          | `preview` / READY                                                          |
| Protection              | Vercel Authentication enabled / bypass `0`                                 |
| QA runtime              | QA2 `hicfnlwzmnbxhimyeviy` / `ACTIVE_HEALTHY` / 20 of 20 Migrations        |
| Formal Admin Production | unchanged / `paused=true`                                                  |
| Web Admin entry         | closed                                                                     |
| Next gate               | P1-07 requires separate Product Owner authorization and has not started    |
| P1.1                    | `DEFERRED / NOT AUTHORIZED`; KI-033 is not treated as technically resolved |

The Product Owner accepted the complete P1-06C implementation, automated
verification, protected Preview and human runtime verification. The final
accepted Preview is QA-only and must not be promoted or treated as Production.
P1-06C completion does not authorize P1-07, P1.1, Production deployment, Admin
resume or Web Admin entry enablement.

## 2. Accepted UI closure

### UI-01 — Admin localization

User-visible Admin copy is localized across sign-in, overview, identity search,
detail, Membership, Author role, Review, Saved, Unchanged, Conflict, Audit,
protected-account, deferred-capability, state, select, empty and safe-error
surfaces. Brand names and immutable technical values remain unchanged.

### UI-02 — Review and responsive behavior

The accepted implementation uses shrink-safe grid/flex children, zero-minimum
tracks, safe wrapping for long registration names and user identifiers, and
single-column fallback where available width is insufficient. Product Owner
human verification passed at 1440, 1024, 768, 480 and 390 pixels with no card,
badge, Header or horizontal-overflow defect.

### UI-03 — Global sign-out

Every authenticated Admin page mounts the global Header action. Active Admin and
Super Admin users receive a directly visible `退出登录` action; the mobile label is
`退出`. The action reuses the existing server-side sign-out contract and returns
the user to Admin sign-in. Reader, Author and failed-access contexts do not receive
the Admin Header action.

### UI-04 — Beijing time

All user-visible Admin timestamps use the shared `formatAdminTimestamp` formatter
with locale `zh-CN`, explicit IANA timezone `Asia/Shanghai` and `hour12: false`.
The presentation format is `YYYY-MM-DD HH:mm（北京时间）`; for example,
`2026-08-25T13:57:00Z` renders as `2026-08-25 21:57（北京时间）`.

The formatter does not depend on browser, device, Vercel, macOS or process local
timezone. Database timestamps, API payloads, Audit `created_at`, Ledger
`created_at` and Supabase timezone contracts are unchanged. User-visible `UTC`,
`GMT` and `协调世界时` labels have zero expected runtime occurrences.

## 3. Implementation scope

P1-06C contains exactly these eighteen implementation and test files before the
Closure documentation update:

- `apps/admin/src/app/access/loading.tsx`
- `apps/admin/src/app/access/mutation-panel.tsx`
- `apps/admin/src/app/access/page-contract.test.ts`
- `apps/admin/src/app/access/page.tsx`
- `apps/admin/src/app/admin-header-actions.test.ts`
- `apps/admin/src/app/admin-header-actions.tsx`
- `apps/admin/src/app/auth/actions.test.ts`
- `apps/admin/src/app/auth/sign-in/page.tsx`
- `apps/admin/src/app/layout.tsx`
- `apps/admin/src/app/page.tsx`
- `apps/admin/src/app/site-copy-editor-contract.test.ts`
- `apps/admin/src/app/site-copy-editor.tsx`
- `apps/admin/src/lib/access-governance-mutation.ts`
- `apps/admin/src/lib/admin-presentation.ts`
- `apps/admin/src/lib/site-copy-editor-state.ts`
- `apps/admin/src/lib/site-copy-fields.ts`
- `packages/ui/src/components/layouts.tsx`
- `packages/ui/src/styles.css`

No Service, Repository, Domain, database, Migration, SQL, RPC, RLS, Grant, ACL,
Auth provider, dependency, lockfile or Production configuration file changed.

## 4. Regression and security boundary

- P1-06B Manual Preview Acceptance remains PASS.
- Admin and Super Admin authorization remains live and unchanged.
- Reader and Author denial remains unchanged.
- Membership and Author-role mutation semantics remain unchanged.
- `Saved | Unchanged | Conflict`, expected-state, requestId idempotency, Ledger
  and Audit semantics remain unchanged.
- Elevated governance remains deferred; no KI-033 workaround or new mutation path
  was introduced.
- QA2 received no business, fixture, Audit, Ledger, Auth, ACL, RLS or Migration
  change during P1-06C Preview acceptance.
- Formal Admin Production remains `paused=true`; Production Supabase, Site Copy
  Version 7 and the closed Web Admin entry remain unchanged.

## 5. Closure validation

| Gate                   | Result                      |
| ---------------------- | --------------------------- |
| Workspace TypeScript   | PASS                        |
| Workspace ESLint       | PASS                        |
| Admin tests            | 105 of 105 PASS             |
| UI package tests       | 5 of 5 PASS                 |
| Admin production build | PASS / dynamic Admin routes |
| Targeted Prettier      | PASS                        |
| `git diff --check`     | PASS                        |
| Sensitive scan         | PASS                        |
| Exact scope            | PASS                        |

## 6. Closure decision

P1-06C is complete and committed by the Closure commit containing this evidence.
P1-07 is `READY FOR PRODUCT OWNER AUTHORIZATION / NOT STARTED`. P1.1 remains
deferred and unauthorized. No Push, PR, Merge, Production deployment, Admin
resume, Web Admin entry enablement or remote Supabase mutation is authorized by
this closure.
