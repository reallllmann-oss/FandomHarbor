# Interface Category Ownership

Status: Phase 1C identity/access categories implemented; remaining operation families are proposed.

Every operation described by `API_SPECIFICATION.md` has one default interface category. Server Component data reads are internal data-access calls, not callable interfaces; their resource projections still use Contracts.

| Operation family                               | Default category | Notes                                                |
| ---------------------------------------------- | ---------------- | ---------------------------------------------------- |
| Invitation redemption                          | ServerActions    | Atomic app-owned admission mutation                  |
| Preferences and privacy workflow request       | ServerActions    | Export download later uses REST                      |
| Export file download                           | REST             | Authorized expiring file response                    |
| Invitation create/revoke                       | ServerActions    | Admin/Author app-owned mutation                      |
| Role/membership grant, revoke, suspend         | ServerActions    | Audited Admin mutation                               |
| Pen Name/Work/Chapter/Series mutations         | ServerActions    | App-owned typed mutation                             |
| File upload intent/upload/finalize/download    | REST             | Explicit HTTP/storage contract                       |
| Revision restore                               | ServerActions    | Audited transactional mutation                       |
| Revision Diff export or large retrieval        | REST             | Explicit bounded representation when needed          |
| Tag canonicalize/alias/merge                   | ServerActions    | Audited Admin mutation                               |
| Kudos/Bookmark/Recommendation/Comment mutation | ServerActions    | Typed idempotent interaction                         |
| Report create/transition/resolve               | ServerActions    | Evidence upload remains REST                         |
| Admin audit/analytics export                   | REST             | Explicit authorized export                           |
| Auth provider callback                         | REST             | Supabase/provider callback contract                  |
| Transactional email provider callback          | Webhooks         | Only after provider approval                         |
| Internal state-change facts                    | Events           | Invitation/role/publish/restore/report events        |
| Live subscriptions                             | Realtime         | None approved; future use requires separate decision |

Phase 1C keeps browser pages behind application-owned server actions. Those actions call provider-neutral auth/service/repository contracts; atomic authorization and state transitions are implemented as Supabase PostgreSQL functions behind the database adapter. No new public REST endpoint, webhook, realtime channel or provider-specific business interface was introduced.

If an operation changes category, update this file, its category registry, contract, ADR/decision when architectural and all consumers. One operation cannot be simultaneously documented as REST and Server Action without two explicitly different interfaces.
