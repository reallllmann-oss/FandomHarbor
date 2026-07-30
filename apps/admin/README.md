# Admin Application Boundary

Next.js App Router application for Admin and Super Admin workflows. It is a
separately gated operational surface over the same authoritative Supabase
domain and audit model.

ADMIN-01 connects the accepted Site Copy Admin Read Service and Repository to
the root Admin surface. ADMIN-02 adds a controlled edit → review → save flow
for active Admin and Super Admin users. The surface remains limited to the
current database Version and exactly eight Site Copy fields.

Every new review intent receives one non-nil request UUID. A safe retry of the
same reviewed payload keeps that request ID; returning to edit and creating a
new review creates a new request ID. The Server Action derives the trusted
access context again and calls the accepted Domain Save Service and Repository.
The database RPC owns optimistic concurrency, immutable Revision, Audit and
Current Pointer atomicity.

Saved updates the local Version and Revision baseline without a page refresh.
Unchanged never fabricates an Audit. Conflict preserves local input, does not
retry or overwrite, and requires an explicitly confirmed reload before the old
base can be submitted again. Stable failed-save states preserve all local input
and do not expose database errors.

The existing `/access` route and all Auth, Membership, Role, capability and
last-Super-Admin protections remain unchanged. Web does not consume Site Copy
in this Mission.
