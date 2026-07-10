# Data Lifecycle and Retention

Status: Proposed; durations require product/legal approval under KI-005, KI-008, KI-012 and KI-015.

## Principles

- Collect the minimum data required for archive operation, safety and user-requested features.
- Classify data before collection: public/gated content, private user data, sensitive moderation data, security/audit data, derived analytics.
- Deletion from user view, archival retention and irreversible purge are distinct states.
- Retention exceptions must have a documented safety/legal reason and restricted access.

## Proposed lifecycle

| Data                | Active use              | On user/content deletion                                   | Final handling                                              |
| ------------------- | ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Account/profile     | Membership and settings | Disable access; queue policy-based deletion                | Remove/anonymize after approved hold                        |
| Pen names/works     | Archive publishing      | Unpublish/archive; preserve link behavior as policy allows | Purge or tombstone after retention decision                 |
| Articles/chapters   | Archive publishing      | Unpublish/archive with parent visibility                   | Purge or tombstone after retention decision                 |
| Revisions           | Diff/restore/audit      | Restrict with parent content                               | Retain only per approved author/moderation policy           |
| Bookmarks/history   | Personal reading        | User-controllable deletion                                 | Prompt purge; backups age out                               |
| Kudos/comments      | Archive interaction     | Delete/anonymize by policy                                 | Preserve referential integrity without private identity     |
| Invitations/lineage | Access safety           | Revoke; retain minimum audit link                          | Hash/anonymize after abuse window                           |
| Reports/evidence    | Moderation              | Close and restrict                                         | Evidence expires sooner than decision record where possible |
| Audit logs          | Security/accountability | Not user-editable                                          | Append-only until security retention expires                |
| Raw analytics       | Product measurement     | No direct user UI dependency                               | Aggregate early, delete raw events quickly                  |
| Backups             | Recovery                | Not selectively editable                                   | Age out under backup schedule                               |

## User rights workflows

Export, correction, account deletion, content deletion and appeal requests need authenticated workflows, identity verification, audit events and documented response ownership. Export files are private, expiring and excluded from analytics/search.

## Backup caveat

Deletion documentation must disclose backup aging: deleted data may remain inaccessible in encrypted backups until scheduled expiry and must not be restored into active service except through incident recovery controls.

## Phase 2 / Sprint 002A boundary

`works`, `chapters` and `articles` implement `draft → published → archived`. Application roles receive no direct DELETE privilege; archive is the only current removal path. This intentionally leaves purge, tombstone, restore and retention duration unresolved until KI-005 is approved.
