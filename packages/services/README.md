# Services Package Boundary

Owns provider-neutral application orchestration. Phase 1C includes invitation-secret generation/hashing and the identity-access service contract, plus an `ObjectStorage` interface with no production implementation yet. Phase 2 / Sprint 002A adds provider-neutral work/chapter/article/category/tag contracts and a content service that checks trusted capabilities before calling its store port. Sprint 002D-Step02 adds `createWorkDraftService`, which requires `work:author` before calling the provider-neutral draft store.

Sprint 002E-Step01 adds `createDraftWorkEditorService` and `DraftWorkEditorStore` for Author-gated, owner-RLS-backed draft reads. Sprint 002E-Step02 extends the same service boundary with `saveDraftWorkBody`, which still requires `work:author`, updates only Chapter body data and does not publish content. Sprint 002F extends that boundary again with `publishDraftWork`, which publishes the current Work plus its first readable Chapter without adding a new RPC.

This package is not a miscellaneous business-logic bucket. Each service requires a clear owner, interface, error model and test seam; domain invariants remain with their authoritative domain/database boundary.

Admin P0 DOMAIN-01 adds the exact eight-field Site Copy content and Baseline, NFC/code-point validation, normalized diff, Public field-level fallback, active Admin/Super Admin capability entry point, strict Admin Read/Save services and closed Saved/Unchanged/Conflict results. The public contract is provider-neutral and contains no Supabase or PostgREST types.
