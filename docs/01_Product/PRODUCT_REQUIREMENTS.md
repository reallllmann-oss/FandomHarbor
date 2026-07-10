# Product Requirement Document

Status: Proposed  
Product: Fandom Harbor  
Phase: Foundation / pre-development

## 1. Product statement

Fandom Harbor is a modern, invitation-only archive for original and fan works. It combines durable publishing, expressive metadata and discoverability with a reading-first interface and strong owner governance. It is not a social network, forum, blog or generic commercial novel platform.

## 2. Product principles

1. Improve reading, publishing or maintainability—or do not build it.
2. Archive integrity beats engagement loops.
3. Mobile reading is a primary experience.
4. Public pen names and private account identities stay separate.
5. Access and authority are explicit, least-privilege and auditable.
6. Free expression in tagging coexists with administrator canonicalization.
7. Reports initiate human review; report volume never equals guilt.

## 3. Users and jobs

| Persona     | Primary jobs                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Visitor     | Understand the archive, sign in or redeem an invitation; never read gated works                                    |
| Reader      | Discover, filter, read, bookmark, recommend, give Kudos, comment and manage private history                        |
| Author      | Do everything a Reader can; publish through pen names, maintain works/chapters/series and review work interactions |
| Admin       | Govern users, Author grants, invitations, works, canonical tags, reports and operational analytics                 |
| Super Admin | Perform all Admin duties plus highest-risk role, system, policy and recovery operations                            |

## 4. Product surfaces

- `apps/web`: introduction, access gate, Reader Frontend and Author Dashboard.
- `apps/admin`: Admin and Super Admin Dashboard.
- `apps/docs`: future read-only browser for approved project documentation; it is an auxiliary project surface, not a user-facing archive feature.
- Supabase: identity, relational archive data, authorization policies, private file storage and audit data.

## 5. Functional requirements

### Access and identity

- Visitors can see only the introduction, sign-in and invitation-redemption experiences.
- Valid invitation redemption admits a Reader; it never grants Author/Admin authority.
- Author role is granted manually by Admin or Super Admin.
- Admin elevation is restricted; Super Admin changes require Super Admin authority.
- Authors can create multiple public pen names. Reader-facing pages never expose the linked private account.
- Invitations support hashed secrets, expiry, revocation, use limits and invitation ancestry.

### Archive content

- Works support title, summary, language, completion/publication state, rating, warnings, tags, relationships, authorship and timestamps.
- Works contain ordered chapters and may belong to ordered series.
- Authors can draft, preview, publish, update, archive and, subject to policy, delete their own works.
- Every published content change creates immutable version history.
- Authorized users can compare versions; administrators can restore an earlier version without deleting history.
- Text content uses TipTap structured documents. Image, external-link, PDF and EPUB support is planned but its MVP boundary remains KI-003.

### Metadata and discovery

- Authors can enter free-form fandom, character, relationship/CP and additional tags.
- Admins can mark canonical tags, merge synonyms and redirect free-form tags without rewriting historical author intent.
- Readers can search and filter by text, fandom, relationship, character, rating, warning, status, language, tags and update date.
- Search results must not reveal gated content to unauthenticated users.

### Reading

- Work and chapter pages prioritize readable measure, typography, contrast and distraction-free navigation.
- Readers can move between chapters, return to a saved position and adjust reading preferences.
- Reading history is private and controllable; its default/retention require KI-015 resolution.
- Warnings and rating are visible before content; the exact conceal/reveal interaction is part of UI review.

### Archive-centered interaction

- One account can give at most one active Kudos per work unless a later decision changes semantics.
- Readers can create private/public bookmarks; a recommendation is an explicit bookmark state, not a popularity feed.
- Comments support replies with bounded nesting or a documented flat-thread alternative.
- “Anonymous comment” behavior is blocked on KI-002; recommended baseline is authenticated but publicly unattributed.
- No follows, private messages, fan pages, reposts, social feed or public competitive ranking.

### Moderation and governance

- Reports require category and reason; optional evidence uploads are private.
- Report workflow: Pending → In Progress → Rejected or Resolved, with append-only status history.
- Admin/Super Admin receive reports; authors receive policy-safe notice without reporter identity leakage.
- Rate limits, report history and human review resist spam and malicious reporting.
- Content hiding, role changes, invite revocation, restoration and report decisions create audit events.

### Administration and analytics

- Admin areas cover overview, users, roles, invites, works, tags, reports, audit log and analytics.
- Analytics include unique readers, reads, bookmarks, Kudos, comments, recommendations, sources, popular tags/relationships, active authors and new works.
- Metric definitions, consent and retention must be approved before implementation (KI-008).
- Super Admin has narrowly separated high-risk operations and no routine workflow should require Super Admin.

## 6. Non-functional requirements

| Area            | Requirement                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Accessibility   | Target WCAG 2.2 AA; keyboard, focus, contrast, semantic structure and reduced motion           |
| Responsive      | Reader experience mobile-first; Admin desktop-optimized with safe small-screen fallback        |
| Security        | Default deny, database RLS, server checks, audit logs, sanitized rich text and private uploads |
| Privacy         | Data minimization, identity separation, explicit retention and user controls                   |
| Performance     | Define budgets during implementation; prioritize fast chapter render and stable reading layout |
| Reliability     | Migrations, backups, recovery and rollback tested against approved RPO/RTO                     |
| Maintainability | Strict TypeScript, documented boundaries, tests, review gates and no duplicated domain logic   |
| Observability   | Structured errors, correlation IDs, security events and privacy-safe operational metrics       |

## 7. MVP recommendation

The first shippable slice should include gated Reader access, manual Author grants, pen names, text works/chapters, core metadata, reading, search/filter basics, bookmarks/Kudos/comments, essential Admin moderation, audit log and backups. File formats, advanced analytics, sophisticated recommendations and high-cost canonicalization tooling should follow only after core archive reliability.

## 8. Success measures

- Reading completion/return behavior without public ranking incentives.
- Mobile reading performance and accessibility pass rate.
- Author publish success and recovery from drafts/versions.
- Search/filter success and canonical-tag coverage.
- Moderation response time, reversal rate and malicious-report detection signals.
- Authorization incidents: target zero.

## 9. Explicit non-goals

Social feeds, follows, DMs, fan/follower counts, repost mechanics, public competitive leaderboards, ad-tech profiling, algorithmic virality and engagement-maximizing notifications.

## 10. Approval blockers

All Open items in `.ai/KNOWN_ISSUES.md` must be triaged. Only issues affecting a given implementation slice must be resolved before that slice, but KI-001, KI-002, KI-003, KI-004, KI-005 and KI-006 affect foundational schema or access behavior.
