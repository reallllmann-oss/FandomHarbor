# API Rules

## Contracts

- Define request, response, error, authentication, and authorization contracts before implementation.
- Validate all inputs at runtime and reject unknown or unsafe values deliberately.
- Use consistent resource naming, pagination, filtering, sorting, and error shapes.
- Do not expose database internals, private account identities, secrets, stack traces, or moderation-only fields.
- Make compatibility-breaking changes explicit and versioned.

## Behavior

- Mutations must enforce authorization server-side and be safe against duplicate submission where relevant.
- List endpoints must be bounded and paginated.
- File access must verify type, size, ownership, visibility, and authorization.
- Rate limits and abuse controls are required for authentication, invites, comments, Kudos, reports, search, and uploads.
- Logs must include useful request correlation without recording secrets or unnecessary personal data.

## Documentation and tests

- Document every public or cross-application endpoint in `docs/04_API/`.
- Include success, invalid-input, unauthenticated, unauthorized, not-found, conflict, and rate-limit tests as applicable.
- Update API documentation in the same task as the contract change.

## Next.js boundary strategy

- Server Components query approved server data-access modules for page reads.
- Server Actions handle typed mutations used only by the owning Next.js application.
- Route Handlers provide explicit HTTP contracts for uploads, webhooks, cross-app endpoints, exports, and integrations.
- Supabase-generated APIs are never treated as authorization-free public contracts; RLS and grants remain mandatory.
- TanStack Query is used for client-managed server state, not as a second default data layer.

The canonical contract catalog is `docs/04_API/Contracts/API_SPECIFICATION.md`. Every interface also belongs to exactly one REST, ServerActions, Realtime, Webhooks or Events category; Errors and Contracts remain shared registries.
