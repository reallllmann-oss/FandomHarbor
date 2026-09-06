# Super Admin Documentation

Super Admin is not a routine daily-use role. Current implementation permits active Super Admin to manage Admin/Super Admin Role Grants and elevated-account Membership while protecting the final active Super Admin.

Admin P1-00 freezes the next high-risk workflow contract:

- normalized reason and independent Review/confirm for every Mutation;
- single-use registration-name/password reauthentication for elevated role and elevated Membership changes;
- no dual approval in P1, with residual risk explicitly accepted by the Product Owner;
- no batch elevated operation, new role or new capability.

See [Admin Identity & Access Governance](../11_Admin/IDENTITY_ACCESS_GOVERNANCE.md) and [ADR-021](../17_Architecture_Decisions/ADR-021.md). Implementation has not started.
