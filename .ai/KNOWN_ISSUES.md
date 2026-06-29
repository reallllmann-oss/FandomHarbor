# Known Issues and Open Questions

This is the authoritative queue for unresolved foundation questions. “Open” means implementation depending on that answer is blocked; it is not permission to assume.

| ID     | Topic                                                      | Why it matters                                                                                        | Blocks                        | Status                                                                              |
| ------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- |
| KI-001 | Authentication method: email/password, magic link, or both | Recovery, abuse controls and email delivery differ                                                    | Auth implementation           | Resolved for Phase 1 by D-033: email/password + verified email; Magic Link deferred |
| KI-002 | Meaning of “anonymous comment”                             | Recommended model is authenticated member with public identity hidden but moderator identity retained | Comment schema and policy     | Open                                                                                |
| KI-003 | MVP content formats                                        | Text is core; image, external link, PDF and EPUB add distinct security and reader work                | Upload/storage implementation | Open                                                                                |
| KI-004 | Age policy and adult-content compliance                    | Ratings/warnings alone may not satisfy jurisdiction or hosting requirements                           | Launch policy                 | Open                                                                                |
| KI-005 | Deletion, export and retention policy                      | Revisions, reports, audit logs and analytics have conflicting retention needs                         | Final schema                  | Open                                                                                |
| KI-006 | Invitation permission limits                               | Invite redemption must not bypass manual Author/Admin role grants                                     | Invite schema and UX          | Resolved by D-005/D-033: active membership only; no elevated role                   |
| KI-007 | Moderation appeal and author disclosure rules              | Reporter privacy and author transparency can conflict                                                 | Report workflow               | Open                                                                                |
| KI-008 | Analytics consent, retention and metric definitions        | Reading analytics can undermine private-community expectations                                        | Analytics implementation      | Open                                                                                |
| KI-009 | Launch scale, budget, uptime target, RPO and RTO           | Determines indexes, backup plan, observability and Vercel/Supabase tiers                              | Production readiness          | Open                                                                                |
| KI-010 | Languages and localization                                 | Affects schema, routes, search, typography and content metadata                                       | IA and search refinement      | Open                                                                                |
| KI-011 | Transactional email provider and notification scope        | Required for auth, invites and moderation communication                                               | Email implementation          | Resolved for Phase 1 by D-033: Resend through Supabase Custom SMTP; no app SDK      |
| KI-012 | Domain, legal identity, policies and takedown process      | Needed before public launch and user-generated uploads                                                | Launch                        | Open                                                                                |
| KI-013 | Recommendation semantics and visibility                    | Must not become a public popularity ranking                                                           | Interaction design            | Open                                                                                |
| KI-014 | Invite-chain enforcement                                   | Whether sanctions propagate to descendants must be a deliberate moderation rule                       | Invite moderation             | Open                                                                                |
| KI-015 | Reading-history default and privacy controls               | History is sensitive behavioral data                                                                  | Reading history               | Open                                                                                |

## Foundation limitations

- Dependency versions are intentionally not pinned because package installation remains prohibited in Phase 0.6.
- Schema documentation is conceptual and must become reviewed SQL migrations with RLS tests during implementation.
- Design-token values are a documented starting point and still require contrast, typography and device validation.
- No Git repository, CI, deployment project or Supabase project has been initialized.

## Resolution protocol

1. Research the question and document options/trade-offs.
2. Obtain product-owner approval when product behavior or cost changes.
3. Record the accepted answer in `DECISIONS.md`.
4. Update affected detailed documents.
5. Mark the issue Resolved with a link; do not delete its history.
