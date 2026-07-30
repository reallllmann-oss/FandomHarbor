# Admin Application Boundary

Next.js App Router application for Admin and Super Admin workflows. It is a
separately gated operational surface over the same authoritative Supabase
domain and audit model.

ADMIN-01 connects the accepted Site Copy Admin Read Service and Repository to
the root Admin surface. Active Admin and Super Admin users can inspect the
current database Version and exactly eight Site Copy fields. The surface is
read-only: it has no edit controls, Site Copy save action or publish action.

The existing `/access` route and all Auth, Membership, Role, capability and
last-Super-Admin protections remain unchanged. Web does not consume Site Copy
in this Mission.
