# Technical Debt Strategy

Status: Proposed

## Definition

Technical debt is an intentional or discovered gap that increases future change cost, operational risk or correctness risk. Missing product scope is not technical debt; it belongs in `KNOWN_ISSUES.md` or the roadmap.

## Rules

- Debt is never hidden in TODO comments alone.
- Each item records ID, context, impact, affected area, owner, target/trigger and remediation approach.
- Security, data-integrity and authorization debt cannot be accepted as routine roadmap debt.
- Temporary duplication must state why abstraction is premature and when consolidation becomes justified.
- Dependency upgrades are scheduled from risk/evidence, not automatic churn.

## Classification

| Class | Examples | Treatment |
|---|---|---|
| Critical | Permission bypass, data loss, secret exposure | Block release; remediate immediately |
| High | Unsupported dependency, broken restore, inaccessible core flow | Planned in current/next Sprint |
| Medium | Costly duplication, weak test seams, slow operational flow | Assign trigger and review quarterly |
| Low | Naming or local cleanup with no behavior risk | Fix opportunistically without scope pollution |

## Budget and review

- Reserve explicit capacity after feature foundations exist; do not invent a fixed percentage before team cadence is known.
- Review debt at Sprint planning, major release and architecture review.
- Close debt only after verification and documentation update.
- If a workaround becomes permanent, write an accepted architecture decision rather than leaving a fiction of temporariness.

## Prevention

Small vertical slices, migration discipline, permission tests, component governance, dependency direction, observability and the acceptance checklist are the primary prevention mechanisms.

