# Admin Documentation

Admin access remains least-privilege, server-enforced, database-enforced and audited.

Current implemented baseline:

- independent Admin sign-in for active Admin / Super Admin;
- P0 Site Copy exact-eight-field Read / Review / Save / Conflict;
- `/access` Role Grant / Revoke and Membership state operations;
- final active Super Admin protection.

Current approved next contract:

- [Admin Identity & Access Governance](IDENTITY_ACCESS_GOVERNANCE.md) — Admin P1-01 design closed under ADR-022 Option 3; ordinary governance is eligible for future P1-02 planning and elevated mutations are deferred.
- [P1-01 Data, Permission and Reauth Design](../15_Sprint/Admin_P1/P1_01_DATA_PERMISSION_REAUTH_DESIGN.md) — read models, private request ledger, RPC/permission matrix, expected-state, Audit and cutover authority.
- [ADR-022](../17_Architecture_Decisions/ADR-022.md) — accepted Option 3 boundary; step-up remains technically unresolved and elevated writes stay closed.

Invitation, content, tag, report and analytics administration remain separate future scopes unless explicitly approved.
