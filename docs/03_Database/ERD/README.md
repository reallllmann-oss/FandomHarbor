# ERD Registry

Every table belongs to exactly one primary ERD. Cross-domain relations are referenced, not duplicated.

## ERD-CORE-001 — Fandom Harbor Core

Authoritative files: `DATA_MODEL.md` and `SUPABASE_SCHEMA.md`.

| Domain          | Tables owned by ERD-CORE-001                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Identity/access | profiles, memberships, role_grants, pen_names, invitations, invitation_redemptions                                     |
| Archive         | works, work_authors, chapters, work_revisions, chapter_revisions, series, series_works, assets                         |
| Metadata        | ratings, warnings, work_warnings, tags, work_tags                                                                      |
| Interaction     | kudos, bookmarks, comments, reading_progress, reading_events (only if approved)                                        |
| Trust/admin     | reports, report_evidence, report_events, audit_logs, notifications, analytics_events (only if approved), daily_metrics |

New tables require an ERD owner, purpose, primary/foreign keys, lifecycle, RLS owner and query/index plan before migration review.
