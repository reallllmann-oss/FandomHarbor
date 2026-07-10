# Foundation Threat Model

Status: Proposed. Re-run per security-sensitive feature and before launch.

## Protected assets

- Gated work bodies and private file assets
- Private account-to-pen-name linkage
- Authentication sessions, invitation secrets and elevated credentials
- Drafts, revision history and deleted/hidden content
- Reading history, private bookmarks and user preferences
- Reports, evidence, reporter identity and moderation notes
- Role grants, audit logs, backups and exports

## Trust boundaries

Browser ↔ Vercel/Next.js server; Web/Admin app ↔ Supabase APIs; Supabase API ↔ PostgreSQL/RLS; server-only privileged operation ↔ service credentials; browser/server ↔ Storage; platform ↔ email/analytics/future providers; staff ↔ Admin UI.

## Primary threats and controls

| Threat                  | Example                                          | Required controls                                                                            |
| ----------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Broken access control   | Reader requests draft, Author edits another work | Membership/ownership server checks, RLS, negative tests                                      |
| Identity disclosure     | Pen-name API includes owner user ID              | Safe projections, field allowlists, privacy review                                           |
| Session/caching leak    | Auth response cached for another user            | Validated server identity, private/no-store caching                                          |
| Privilege escalation    | Invite or profile metadata grants Author/Admin   | Separate role grants, trusted grant path, audit and reauth                                   |
| Injection/XSS           | TipTap/raw HTML/pasted content executes          | Structured allowlist, Zod validation, sanitization, CSP                                      |
| Malicious upload        | PDF/image evidence carries malware               | Private buckets, type/size inspection, quarantine/processing                                 |
| Invite abuse            | Shared/bruteforced/replayed codes                | High entropy, hashes, expiry, use limits, rate limits, lineage and atomic Auth-user rollback |
| Report abuse            | Coordinated false reports expose/suppress author | Human review, rate limits, history, no count-based punishment                                |
| Admin misuse            | Staff browses private history/evidence           | Need-to-know fields, immutable audit, least privilege                                        |
| Data loss               | Faulty migration or restore                      | Backups, expand/contract migrations, restore drills                                          |
| Supply-chain compromise | Malicious/outdated dependency                    | Lockfile, minimal dependencies, scanning, reviewed upgrades                                  |
| Enumeration             | IDs/errors reveal hidden works/users             | Opaque IDs, safe `NOT_FOUND`, bounded search and rate limits                                 |

## Abuse cases to test

- Unauthenticated and suspended users request work bodies/assets directly.
- Reader changes IDs to access another user's history/bookmark/report.
- Author submits another pen name or work ID in a mutation.
- Stale Admin session retains power after role revocation.
- Invitation is redeemed concurrently beyond its use limit.
- Invalid or exhausted invitation attempts leave an Auth user, Profile or Membership behind.
- Tag aliases create a cycle or cross incompatible types.
- Comment/report/upload bypasses validation through direct API calls.
- Cached reader/admin response is served across users.
- Restore or export exposes deleted/private revision content.

## Residual decisions

Age/legal policy, data retention, anonymous-comment accountability, file formats, analytics and operational RPO/RTO remain in `KNOWN_ISSUES.md`. Affected features cannot pass security review until resolved.

## Review cadence

Update on new role, visibility mode, provider, upload type, externally callable API, major stack upgrade, security incident or material architecture change.
