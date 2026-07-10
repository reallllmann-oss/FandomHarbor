# Event Registry

Events describe facts after successful state changes; they do not silently replace transactional invariants.

Candidate families: invitation redeemed/revoked, role granted/revoked, work published/restored, tag canonicalized, report transitioned, membership suspended and export completed.

Each approved event documents name/version, producer, transaction boundary, payload contract, sensitive fields, consumers, delivery semantics, idempotency and retention. No event bus is selected in Phase 0.6.
