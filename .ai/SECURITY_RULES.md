# Security Rules

## Principles

- Default deny, least privilege, defense in depth, and auditable elevated actions.
- Treat frontend visibility checks as UX only; enforce access on trusted server and database boundaries.
- Minimize personal data collection and exposure.
- Never store secrets in source control, logs, analytics, URLs, or client bundles.

## Identity and permissions

- Unauthenticated users may access only the approved introduction experience, never work bodies.
- Invitation acceptance does not grant Author or Admin privileges.
- Author access is granted manually by Admin or Super Admin.
- Role changes, invite revocation, moderation actions, restoration, and destructive operations require audit records.
- Prevent privilege escalation and test every role against every protected operation.

## Abuse and content safety

- Invitations require revocation, expiry, usage limits, permission limits, and ancestry tracking.
- Reports require a reason; evidence uploads need strict validation and private access controls.
- Protect reporting from spam and coordinated malicious use through rate limits, history, signals, and human review—never automatic punishment from report count alone.
- Anonymous comments must still have abuse controls and privacy-conscious audit capability.
- Uploaded images, PDFs, and EPUBs require size/type validation, safe storage, access checks, and malware/content handling decisions before launch.

## Delivery gate

- Security-sensitive features require a threat review, negative authorization tests, and documented incident/rollback considerations.
- Dependency and secret scanning should be part of CI after the toolchain is selected.
- Report suspected credential exposure immediately; rotate rather than merely deleting history.

## Stack-specific rules

- Supabase publishable credentials may be used only with complete RLS; secret/service credentials are server-only.
- Server-side auth protection must validate trusted claims; cookie presence or unvalidated session data is insufficient.
- Authenticated, user-specific and gated responses must not be stored in shared CDN caches.
- TipTap documents must be schema-validated and sanitized before rendering. Raw HTML is not a trusted storage or display format.
- User uploads are private by default and served with authorization-aware signed access where appropriate.
- Security headers, CSP, CSRF posture, redirect allowlists and webhook signatures must be reviewed before release.

## Privacy boundaries

- Public pen name and private account identity are separate security domains.
- Anonymous public interaction must retain only the minimum private accountability data required for moderation.
- Reading history, report evidence, invite lineage, IP-derived abuse signals and analytics are sensitive and receive explicit retention limits.
- Admin access to private identity or evidence is logged and limited to a documented operational need.
