export type MembershipState = "active" | "pending" | "revoked" | "suspended";
export type ElevatedRole = "admin" | "author" | "super_admin";
export type Capability =
  "admin:operate" | "archive:read" | "super_admin:operate" | "work:author";

export interface TrustedIdentity {
  id: string;
}

export interface TrustedSession {
  expiresAt: Date;
  identity: TrustedIdentity;
}

export interface TrustedAccessContext {
  capabilities: ReadonlySet<Capability>;
  identity: TrustedIdentity;
  membershipState: MembershipState | null;
  roles: ReadonlySet<ElevatedRole>;
}

export function createTrustedAccessContext(input: {
  identity: TrustedIdentity;
  membershipState: MembershipState | null;
  roles?: Iterable<ElevatedRole>;
}): TrustedAccessContext {
  const roles = new Set(input.roles);
  const capabilities = new Set<Capability>();

  if (input.membershipState === "active") {
    capabilities.add("archive:read");

    if (roles.has("author")) capabilities.add("work:author");
    if (roles.has("admin")) capabilities.add("admin:operate");
    if (roles.has("super_admin")) {
      capabilities.add("admin:operate");
      capabilities.add("super_admin:operate");
    }
  }

  return {
    capabilities,
    identity: input.identity,
    membershipState: input.membershipState,
    roles,
  };
}
