# Feature Flags

This file records product-blueprint feature defaults. “Enabled” means approved as a planned capability, not currently implemented. Runtime flags must never replace server authorization, RLS or migrations.

| Flag                  | Blueprint default | Phase target                                | Notes                                                                             |
| --------------------- | ----------------- | ------------------------------------------- | --------------------------------------------------------------------------------- |
| `anonymous_comments`  | enabled           | Phase 5                                     | Exact authenticated-anonymity model remains KI-002                                |
| `recommendations`     | enabled           | Unscheduled post-Beta                       | Excluded from Phase 3 Fast Launch; archive-centered and no public popularity feed |
| `ai_search`           | disabled          | Unscheduled                                 | Requires separate value, privacy and cost decision                                |
| `public_registration` | disabled          | Permanent default                           | Invitation gate remains mandatory                                                 |
| `granular_visibility` | disabled          | Post-MVP candidate                          | First version uses unified gated access                                           |
| `reading_history`     | enabled           | Phase 2 local foundation / post-Beta review | Excluded from Phase 3 Blocking; default/retention remain KI-015                   |
| `report_evidence`     | enabled           | Phase 6                                     | Private storage and retention policy required                                     |
| `analytics_dashboard` | enabled           | Phase 7                                     | Metric/privacy decisions remain KI-008                                            |
| `pdf_epub_uploads`    | disabled          | Post-text-MVP review                        | Blocked by KI-003 and file-security design                                        |
| `social_feed`         | disabled          | Prohibited                                  | Conflicts with No Social Drift                                                    |
| `private_messages`    | disabled          | Prohibited                                  | Outside product scope                                                             |

## Flag rules

- Every implementation flag has an owner, default, environment behavior, removal condition and tests for both states.
- Security-sensitive code defaults closed when flag state is missing or invalid.
- Disabled UI does not authorize disabled backend behavior; server and database enforcement remain required.
- Permanent product prohibitions are listed here for clarity but are not implemented as toggleable runtime options.
- Changes require product review; architecture-impacting changes also update `DECISIONS.md`, and experience changes update `DESIGN_DECISIONS.md`.
