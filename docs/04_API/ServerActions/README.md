# Server Action Registry

Server Actions are typed application-internal mutation boundaries. They validate Zod input, re-check trusted identity/capability, rely on RLS/transactions, return safe results and define cache/query invalidation.

Each action documents owning app/domain, input/output contract, authorization, concurrency/idempotency, audit, invalidation and allow/deny tests. A Server Action is not automatically reusable by another app.

No Server Actions exist in Phase 0.6.

