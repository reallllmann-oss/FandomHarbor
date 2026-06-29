# Research Protocol

Status: Approved process proposal

## When research is required

- New dependency, provider, content format or external integration
- Security/auth/privacy behavior
- Framework/library APIs or major upgrades
- Accessibility pattern or rich-text behavior
- Search/analytics/storage performance choice
- Legal/content policy questions

## Evidence hierarchy

1. Official specifications and provider documentation
2. Primary-source repositories, changelogs and migration guides
3. Standards bodies and peer-reviewed/authoritative security guidance
4. Reproducible local prototypes/measurements
5. Secondary sources only for discovery, never as sole architecture evidence

## Research record

Each record includes question, date, decision deadline, sources, tested versions, options, constraints, findings, uncertainty, recommendation, rejected alternatives and review trigger. Link the resulting Decision; research itself does not authorize implementation.

## Time-boxing

Research ends when the decision has enough evidence for its reversibility/risk. High-risk irreversible choices require more evidence; reversible UI details require less. Unknowns become `KNOWN_ISSUES.md`, not invented certainty.

