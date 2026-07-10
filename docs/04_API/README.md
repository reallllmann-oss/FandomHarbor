# Interface Documentation Source of Truth

Status: Proposed for Phase 0.6 freeze

Every interface belongs to exactly one transport/category and links to one reusable contract where applicable.

| Category         | Ownership                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `REST/`          | Route Handlers and explicit HTTP resources                       |
| `ServerActions/` | App-owned typed mutations invoked by Next.js UI                  |
| `Realtime/`      | Approved Supabase Realtime subscriptions/broadcast/presence only |
| `Webhooks/`      | Signed inbound/outbound provider callbacks                       |
| `Events/`        | Internal domain/audit/background event catalog                   |
| `Errors/`        | Stable safe error vocabulary                                     |
| `Contracts/`     | Shared schemas, envelopes, pagination and contract index         |

Realtime, Events and Webhooks are not REST endpoints. Server Actions are not treated as public HTTP APIs. Interfaces without category, validation, authorization, rate-limit and error documentation cannot be implemented.
