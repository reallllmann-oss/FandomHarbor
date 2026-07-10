# Row Level Security Policy Matrix

Status: Phase 1C identity/access and Phase 2 / Sprint 002A content policies implemented locally; later-domain rows remain proposed.

Legend: `own` means derived from `auth.uid()` through trusted ownership relations; `active` means active membership. Admin checks use authoritative role grants, not user-editable metadata.

| Data                     | Visitor | Active Reader                          | Author                                                   | Admin                       | Super Admin                |
| ------------------------ | ------- | -------------------------------------- | -------------------------------------------------------- | --------------------------- | -------------------------- |
| Membership/profile       | None    | Own limited fields                     | Own                                                      | Operational fields          | All, audited               |
| Role grants              | None    | Own read                               | Own read                                                 | Author grants manage        | All elevated grants manage |
| Pen names                | None    | Published public fields                | Own CRUD                                                 | Moderate                    | All                        |
| Invitations              | None    | Own redeemed summary                   | Own created invites                                      | Manage                      | All                        |
| Published works/chapters | None    | Read                                   | Read + own mutate                                        | Read/moderate               | All                        |
| Draft/hidden works       | None    | None                                   | Own                                                      | Moderation need             | All                        |
| Revisions                | None    | Current published only if exposed      | Own full                                                 | Moderation need             | All                        |
| Tags/ratings/warnings    | None    | Read active                            | Read active                                              | Govern                      | All                        |
| Kudos                    | None    | Read aggregate; own row                | Same                                                     | Aggregate/abuse view        | All                        |
| Bookmarks                | None    | Own; public recommendations as allowed | Same                                                     | No private notes by default | Exceptional audited access |
| Comments                 | None    | Read visible/create own                | Same + own work context                                  | Moderate                    | All                        |
| Reading progress/history | None    | Own only                               | Own only                                                 | None by default             | Exceptional audited access |
| Reports                  | None    | Own submitted status                   | Own + reports about own works only per disclosure policy | Assigned/operational        | All                        |
| Report evidence          | None    | Own submission only if policy allows   | Never merely as reported author                          | Need-to-know                | All audited                |
| Audit logs               | None    | None                                   | Own relevant subset only if designed                     | Operational scope           | Full                       |
| Analytics                | None    | None/private own insights              | Own aggregate                                            | Aggregate                   | Aggregate/system           |

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
