# Services Package Boundary

Owns provider-neutral application orchestration. Phase 1C includes invitation-secret generation/hashing and the identity-access service contract, plus an `ObjectStorage` interface with no production implementation yet.

This package is not a miscellaneous business-logic bucket. Each service requires a clear owner, interface, error model and test seam; domain invariants remain with their authoritative domain/database boundary.
