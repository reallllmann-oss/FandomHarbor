# Architecture Risk Analysis

Status: Proposed

Scale: Likelihood (L) and Impact (I) from 1–5. Score = L × I. Scores 15+ require mitigation before affected implementation.

| ID | Risk | L | I | Score | Primary mitigation |
|---|---|---:|---:|---:|---|
| R-01 | RLS gap exposes gated works or private identity | 3 | 5 | 15 | Default deny, policy matrix tests, separate public/private models |
| R-02 | Admin/service credential reaches browser | 2 | 5 | 10 | Server-only modules, secret scanning, bundle review |
| R-03 | Rich text or uploads enable XSS/malware | 3 | 5 | 15 | Validated TipTap schema, sanitization, private storage, file pipeline |
| R-04 | Feature scope creates an unshippable platform | 4 | 4 | 16 | Thin vertical slices and explicit MVP deferrals |
| R-05 | `apps/shared`/generic packages become dependency dumping grounds | 4 | 3 | 12 | Two deployable apps only; purpose-specific package ownership |
| R-06 | Invitation chains enable coordinated abuse | 3 | 4 | 12 | Limits, expiry, revocation, lineage and non-automatic sanctions |
| R-07 | Malicious reports punish authors through volume | 4 | 4 | 16 | Human review, rate limits, reporter history, no count-based punishment |
| R-08 | Tag freedom produces unusable discovery | 4 | 3 | 12 | Typed tags, canonical aliases, merge redirects, governance queue |
| R-09 | Immutable revisions grow cost and leak deleted content | 3 | 4 | 12 | Retention/access policy, compressed snapshots, privileged restore |
| R-10 | Analytics conflicts with private-community expectations | 3 | 5 | 15 | Minimize events, aggregate early, retention/consent review |
| R-11 | Auth/session caching leaks one user's state to another | 2 | 5 | 10 | No shared caching of auth responses; server claim validation |
| R-12 | Single modular monolith grows tight coupling | 3 | 3 | 9 | Domain boundaries, dependency checks, extraction only with evidence |
| R-13 | Platform lock-in complicates recovery | 2 | 4 | 8 | PostgreSQL migrations, portable exports, restore drills |
| R-14 | No agreed legal/age/takedown policy blocks launch | 4 | 5 | 20 | Resolve KI-004/KI-012 before public launch |
| R-15 | Restore/backups exist on paper but fail | 3 | 5 | 15 | Define RPO/RTO and rehearse restoration |
| R-16 | Expanded documentation drifts across indexes, ADRs and Phase packages | 3 | 4 | 12 | Frozen ownership, reference checks and same-task updates |
| R-17 | Unresolved Identity decisions leak into schema/code as assumptions | 4 | 5 | 20 | Phase 1 blocked until authentication/invitation/email choices are approved |

## Review triggers

- New content format or upload type
- New role, visibility mode or public surface
- External search, analytics, email or file-processing provider
- Raw HTML support
- Major dependency or hosting change
- Data residency, legal jurisdiction or audience-age change
- Measured performance beyond documented thresholds

Risks are reviewed during Sprint planning and before merge for security-sensitive work. Realized risks become incidents/known issues with owner and remediation date.
