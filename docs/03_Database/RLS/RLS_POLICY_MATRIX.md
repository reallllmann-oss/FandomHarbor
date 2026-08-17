# Row Level Security Policy Matrix

Status: Phase 1C identity/access and Phase 2 / Sprint 002A content policies implemented locally; later-domain rows remain proposed.

Legend: `own` means derived from `auth.uid()` through trusted ownership relations; `active` means active membership. Admin checks use authoritative role grants, not user-editable metadata.

| Data                     | Visitor                    | Active Reader                          | Author                                                   | Admin                       | Super Admin                          |
| ------------------------ | -------------------------- | -------------------------------------- | -------------------------------------------------------- | --------------------------- | ------------------------------------ |
| Membership/profile       | None                       | Own limited fields                     | Own                                                      | Operational fields          | All, audited                         |
| Role grants              | None                       | Own read                               | Own read                                                 | Author grants manage        | All elevated grants manage           |
| Pen names                | None                       | Published public fields                | Own CRUD                                                 | Moderate                    | All                                  |
| Invitations              | None                       | Own redeemed summary                   | Own created invites                                      | Manage                      | All                                  |
| Published works/chapters | None                       | Read                                   | Read + own mutate                                        | Read/moderate               | All                                  |
| Draft/hidden works       | None                       | None                                   | Own                                                      | Moderation need             | All                                  |
| Revisions                | None                       | Current published only if exposed      | Own full                                                 | Moderation need             | All                                  |
| Tags/ratings/warnings    | None                       | Read active                            | Read active                                              | Govern                      | All                                  |
| Kudos                    | None                       | Read aggregate; own row                | Same                                                     | Aggregate/abuse view        | All                                  |
| Bookmarks                | None                       | Own; public recommendations as allowed | Same                                                     | No private notes by default | Exceptional audited access           |
| Comments                 | None                       | Read visible/create own                | Same + own work context                                  | Moderate                    | All                                  |
| Reading progress/history | None                       | Own only                               | Own only                                                 | None by default             | Exceptional audited access           |
| Reports                  | None                       | Own submitted status                   | Own + reports about own works only per disclosure policy | Assigned/operational        | All                                  |
| Report evidence          | None                       | Own submission only if policy allows   | Never merely as reported author                          | Need-to-know                | All audited                          |
| P0 site copy             | Public projection RPC only | Public projection RPC only             | Public projection RPC only                               | Admin read/save RPC only    | Same eight-field Admin read/save RPC |
| Audit logs               | None                       | None                                   | Own relevant subset only if designed                     | Operational scope           | Full                                 |
| Analytics                | None                       | None/private own insights              | Own aggregate                                            | Aggregate                   | Aggregate/system                     |

## Policy composition

- Membership-active is a prerequisite policy/helper for archive access.
- Author mutation joins work authorship → pen name ownership → current user.
- Admin permission checks active `role_grants` and membership state.
- Suspended/revoked membership denies archive access even if a stale session/role exists.
- Inserts use `WITH CHECK`; updates use both `USING` and `WITH CHECK`; update paths also need appropriate select policies.
- Public/exposed views must honor invoker RLS or remain outside exposed schemas.

## Phase 1C enforced policies

- `anon` has no direct privileges on the six identity/access tables.
- Authenticated identities may select only their own profile, membership, grants and redemption; invitation creators may select their own invitations.
- Active Admin/Super Admin grants expand operational reads; audit logs are readable only by those active administrative roles.
- Direct table mutation is not granted to application roles. Invitation, membership and role mutations pass through narrow audited functions that recheck authorization.
- A suspended or revoked membership causes the role helper to fail closed, even while a role grant remains historically active.
- `supabase/tests/phase_1c_identity_access.sql` covers catalog/RLS assertions and a transactional invite/role/membership path for execution against a disposable Supabase/PostgreSQL environment.
- Phase 2 Auth registration does not add a second permission model: the signup trigger may create only Profile, active Membership, Redemption and audit state. It cannot create Author/Admin/Super Admin grants. `phase_2_auth_registration.sql` verifies success and rollback paths.

## Admin P1 target（P1-00 frozen; not implemented）

- P1 复用现有 `profiles`、`memberships`、`role_grants`、`audit_logs` 与 role helpers；不新增 role/capability 或第二套权限事实。
- 目录/详情读模型必须字段最小化，优先使用 `security invoker` + RLS；不得暴露内部 Auth email-shaped identifier、password、Session、Token 或 invitation secret。
- Mutation 目标合同包括 UUID requestId、expected-state、Saved/Unchanged/Conflict、单一成功 Audit 与 stale/重复请求零部分写入。
- 必要 privileged Mutation function 才可使用 `security definer`；必须空 `search_path`、全限定对象名、撤销 PUBLIC、最小 execute grant，并在函数内复核 `auth.uid()`、active Membership、live Role Grant、target boundary 与 final active Super Admin。
- 旧 `grant_role`、`revoke_role`、`set_membership_state` execute path 在 P1 cutover 后不得绕过 Review/idempotency/conflict；具体迁移设计属于 P1-01。
- 远程写入验证只允许专用 non-Production Supabase QA；P1 不使用 Production 数据库进行写入测试。

## Admin P0 site-copy foundation

- `site_copy_revisions` and `site_copy_state` have RLS enabled and grant no direct table privilege to `anon` or `authenticated`.
- `get_public_site_copy()` is the only Visitor projection. It returns the fixed eight copy fields and a non-sensitive version, with no actor, reason, request ID, audit ID or internal pointer.
- `get_admin_site_copy()` and `save_site_copy(...)` require an active `admin` or `super_admin` role through the existing identity helpers. Reader, Author, suspended Admin and revoked Admin fail closed.
- `save_site_copy(...)` serializes the global scope, checks the current pointer, rejects stale bases without writes and atomically creates one immutable full revision, one audit event and one pointer update.
- Admin save reasons are normalized to NFC, trimmed, counted as Unicode code points and constrained to 4–200 with control characters rejected. Audit and idempotency comparison use the normalized reason.
- The revision tables cannot store navigation paths/order/visibility, Studio capability rules, CTA targets or Footer legal links.
- DATA-01 creates exactly one formal global Version 1 graph: an actor-null `site_copy.initialized` Audit, one immutable full Revision and one Current Pointer. It is separate from the Admin save RPC, reserves the nil UUID outside the normal v4 request-ID namespace and fails closed if any site-copy State, Revision or Audit already exists.
- Application roles cannot execute the owner-only initializer; they retain only the existing public projection and active Admin/Super Admin RPC boundaries.
- `supabase/tests/admin_p0_site_copy_data_01.sql` verifies the exact eight baseline values, public projection, initialization permissions, rerun rejection, incomplete-state rejection and atomic rollback. `admin_p0_site_copy_db_01.sql` covers catalog, grants, role matrix, normalization, validation, idempotency, rollback, audit and pointer contracts. `admin_p0_site_copy_db_01_concurrency.sql` proves that two simultaneous requests using one base produce one save and one conflict while preserving Version 1.

### DATA-01 Version 1 baseline

| Field                          | Version 1 value                                                                                                                                | Current rendered source                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `homepage_title`               | `Fandom Harbor`                                                                                                                                | `apps/web/src/app/page.tsx:22`                                |
| `homepage_introduction`        | `一座为公开故事发现与长久阅读保留安静位置的文学港湾。作品在这里以清楚的作者身份被认真归档，读者可以从一部故事开始，按自己的节奏停留，再回来。` | `apps/web/src/app/page.tsx:25`                                |
| `homepage_primary_cta_label`   | `浏览公开作品`                                                                                                                                 | `apps/web/src/app/page.tsx:32`                                |
| `homepage_secondary_cta_label` | `查找作品与作者`                                                                                                                               | `apps/web/src/app/page.tsx:35`                                |
| `navigation_archive_label`     | `Archive`                                                                                                                                      | `apps/web/src/lib/global-shell-navigation.ts:4`               |
| `navigation_search_label`      | `Search`                                                                                                                                       | `apps/web/src/lib/global-shell-navigation.ts:5`               |
| `navigation_studio_label`      | `Studio`                                                                                                                                       | `apps/web/src/lib/global-shell-navigation.ts:10`              |
| `footer_brand_note`            | `Fandom Harbor · 私域作品归档`                                                                                                                 | `packages/ui/src/components/layouts.tsx:106`, rendered by Web |

The initializer records actor `null` because DATA-01 is a system Migration, not an Admin or Product Owner action. Its Audit action is `site_copy.initialized`, and metadata contains exactly the eight fields above as `{ before: null, after: value }`.

Before writing, the initializer acquires the global site-copy transaction lock and proves that no site-copy State, Revision or related Audit exists. Any prior or incomplete state returns `SITE_COPY_ALREADY_INITIALIZED`; the Migration never deletes, repairs, overwrites or renumbers existing data. Audit, Revision and Pointer are one transaction, so a failure in any step rolls back all three.

After DATA-01, Public Read returns Version 1 plus only these eight fields. Existing active Admin/Super Admin Read and Save permissions continue unchanged; all other Admin RPC and direct-table denials remain in force. Admin and Web product code do not yet consume this baseline, and no remote Migration or deployment is part of DATA-01.

## Phase 2 / Sprint 002A enforced policies

- `anon` receives no table privileges; Visitor cannot read titles, metadata or正文.
- Active Membership may read only `published` works/articles and `published` chapters whose parent work is also published.
- Owning active Author may read and mutate their own work/article rows and derived chapters/tag links, including drafts. An unrelated Author cannot access drafts or mutate another owner’s content.
- Active Admin/Super Admin may read and mutate all content rows. All checks use Phase 1 Membership and active `role_grants`; user metadata/JWT role claims are not authorization truth.
- Authenticated read grants omit `works.owner_user_id` and `articles.owner_user_id`; RLS row visibility does not expose private account identity.
- Categories are Admin/Super Admin governed. Authors may create only `pending` non-alias tags and may attach/detach tags only on owned content.
- Core content has no application DELETE grant; association rows may be removed. Retention/deletion remains blocked by KI-005.
- `supabase/tests/phase_2_content_domain.sql` covers catalog, constraints, Visitor/inactive/Reader/owning Author/unrelated Author/Admin paths.

## Test matrix baseline

For each operation: unauthenticated, inactive member, active Reader, unrelated Author, owning Author, Admin, Super Admin, revoked role, suspended member, malformed owner ID, cross-tenant/resource ID and service-only path. Tests verify rows and fields, not merely HTTP status.

## Field-level protection

RLS is row-level. Private identity, notes, evidence and operational fields may require safe views, selected columns or server-only projections so an allowed row does not expose forbidden fields.
