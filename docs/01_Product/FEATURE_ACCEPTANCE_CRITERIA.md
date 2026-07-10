# Feature Acceptance Criteria

Status: Proposed baseline. Each implementation Sprint must turn these into testable scenarios and add edge cases.

| Feature               | Minimum acceptance                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invitation system     | Valid invite admits one account within limits; expired/revoked/exhausted/replayed secrets fail; raw secret is not stored; lineage and audit event exist |
| Role system           | Author granted only by Admin/Super Admin; invite cannot elevate; revoked/suspended access takes effect; every allow/deny matrix case passes             |
| Reader Frontend       | Only active members reach archive; mobile navigation, loading/error/empty and accessibility pass                                                        |
| Author Dashboard      | Only Authors enter; an Author sees/mutates only works owned through their pen names                                                                     |
| Admin Dashboard       | Only Admin/Super Admin enter; sensitive fields/actions are scoped and audited                                                                           |
| Super Admin Dashboard | High-risk controls are separated, reauthenticated and unavailable to Admin                                                                              |
| Works                 | Draft, preview, publish, update and archive respect required metadata, ownership and status transitions                                                 |
| Chapters              | Ordered chapters save validated TipTap JSON; reorder is atomic; reader navigation remains correct                                                       |
| Series                | Authors manage ordered own works; unauthorized works cannot be added; reader order is stable                                                            |
| Tags                  | Free-form typed tags save; canonical aliases resolve without losing historical usage; cycles/type-invalid merges fail                                   |
| CP relationships      | Relationship tags are distinguishable/filterable and follow canonical governance                                                                        |
| Ratings/warnings      | Required publication policy is enforced; reader sees them before body content; no color-only meaning                                                    |
| Bookmarks             | One member/work bookmark state; private notes remain private; visibility updates are authorized                                                         |
| Recommendations       | Explicit opt-in bookmark state; no automatic public popularity leaderboard                                                                              |
| Kudos                 | Duplicate/replayed actions do not inflate count; removal policy is consistent; unauthorized users fail                                                  |
| Anonymous comments    | Approved anonymity model hides public attribution while preserving only authorized moderation accountability                                            |
| Reports               | Reason required; evidence private; valid state transitions only; author notice does not leak reporter identity                                          |
| Version history       | Published edits create immutable ordered revisions; unauthorized history access fails                                                                   |
| Diff                  | Correct versions and content types compare; large/unsupported cases fail safely                                                                         |
| Restore               | Restore creates a new current revision referencing the source; old history remains unchanged; audit event exists                                        |
| Analytics             | Approved metric definitions match source data; private identities/raw history are not exposed; retention works                                          |
| Audit log             | Privileged actions produce immutable actor/action/target/time/reason records; access is scoped                                                          |
| Reading history       | Default, opt-out/delete and retention match approved privacy decision; only owner can read it                                                           |

## Global criteria

Every feature also passes `.ai/ACCEPTANCE_CHECKLIST.md`, including research, documentation, RLS negative tests, responsive states, accessibility, security, tests, migration/rollback and memory updates.
