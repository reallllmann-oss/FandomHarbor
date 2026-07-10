# Role and Permission Matrix

Status: Proposed

Roles are additive only through explicit grants. Author includes Reader capabilities; Admin includes operational Reader capabilities but should use an ordinary account flow for routine reading when practical. Super Admin is not a daily-use role.

| Capability                              | Visitor | Reader |                               Author |               Admin |                      Super Admin |
| --------------------------------------- | ------: | -----: | -----------------------------------: | ------------------: | -------------------------------: |
| View introduction / redeem invite       |     Yes |    Yes |                                  Yes |                 Yes |                              Yes |
| View published gated works              |      No |    Yes |                                  Yes |                 Yes |                              Yes |
| Search/filter archive                   |      No |    Yes |                                  Yes |                 Yes |                              Yes |
| Manage own history/preferences          |      No |    Yes |                                  Yes |                 Yes |                              Yes |
| Kudos/bookmark/recommend/comment        |      No |    Own |                                  Own |                 Own |                              Own |
| Submit report                           |      No |    Yes |                                  Yes |                 Yes |                              Yes |
| Create/manage pen names                 |      No |     No |                                  Own | Assist under policy |                              All |
| Create/manage works/chapters/series     |      No |     No |                        Own pen names |        Moderate all |                              All |
| Generate Reader invitations             |      No |     No |                   Yes, within limits |                 Yes |                              Yes |
| Grant Author role                       |      No |     No |                                   No |                 Yes |                              Yes |
| Grant/revoke Admin role                 |      No |     No |                                   No |       No by default |                              Yes |
| Grant/revoke Super Admin                |      No |     No |                                   No |                  No | Restricted Super Admin operation |
| Canonicalize/merge tags                 |      No |     No |                                   No |                 Yes |                              Yes |
| Process reports                         |      No |     No |                                   No |                 Yes |                              Yes |
| View reporter evidence/private identity |      No |     No |                                   No |        Need-to-know |                     Yes, audited |
| Hide/restore moderated content          |      No |     No |                      Own drafts only |        Yes, audited |                     Yes, audited |
| View audit log                          |      No |     No | Own relevant events only if designed |   Operational scope |                       Full scope |
| Configure system/security policy        |      No |     No |                                   No |             Limited |                              Yes |

## Rules

- “Own” is enforced by account ownership through pen-name/work relationships, never by a client-supplied owner ID.
- Invitations grant admission only. Any future permission-limited invite may reduce admission capability but cannot elevate roles.
- Admin content access does not imply unrestricted access to private reading history or private bookmark notes.
- Service credentials are not a human role and may be used only in narrow server-only jobs.
- Suspended or revoked access overrides role grants.
- Every negative case in this matrix requires an RLS or server authorization test.

## Separation of duties

- A user must not approve their own elevation to Admin/Super Admin.
- High-risk role and recovery operations require reauthentication and should require a second approver when the team size permits.
- Report assignment and final disposition should be separable for sensitive cases.
- Audit records cannot be edited by ordinary Admin workflows.
