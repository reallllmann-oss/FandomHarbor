# RLS Documentation Registry

All tables in exposed schemas enable RLS explicitly. Each operation and role has a documented policy or an intentional default denial.

`RLS_POLICY_MATRIX.md` is the cross-role overview. Every implemented table additionally receives a policy specification using `RLS_POLICY_TEMPLATE.md` with SELECT/INSERT/UPDATE/DELETE, field-projection and storage-access behavior.

Required test identities: unauthenticated, pending/inactive, Reader, unrelated Author, owning Author, Admin, Super Admin, revoked role and suspended member.

RLS is authoritative for row access; safe views/server projections handle forbidden fields inside otherwise visible rows.
