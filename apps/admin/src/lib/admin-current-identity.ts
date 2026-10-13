import {
  createCurrentAccountIdentity,
  isValidRegistrationName,
  resolveSurfaceDisplayRole,
  type CurrentAccountIdentityFor,
  type ElevatedRole,
  type TrustedAccessContext,
  type TrustedIdentity,
} from "@fandom-harbor/auth";

export type AdminDisplayRole = "管理员" | "超级管理员";

export type AdminCurrentIdentity = CurrentAccountIdentityFor<"admin">;

interface AdminCurrentIdentityDependencies {
  getAccessContext(): Promise<TrustedAccessContext | null>;
  getRegistrationName(identity: TrustedIdentity): Promise<string | null>;
}

export function adminAccountRoleLabel(
  roles: ReadonlySet<ElevatedRole>,
): AdminDisplayRole | null {
  const displayRole = resolveSurfaceDisplayRole(
    { membershipState: "active", roles },
    "admin",
  );
  return displayRole === "管理员" || displayRole === "超级管理员"
    ? displayRole
    : null;
}

export function createAdminCurrentIdentity(
  access: TrustedAccessContext,
  registrationName: string | null,
): AdminCurrentIdentity | null {
  if (
    access.membershipState !== "active" ||
    !access.capabilities.has("admin:operate") ||
    registrationName === null ||
    !isValidRegistrationName(registrationName)
  ) {
    return null;
  }

  const identity = createCurrentAccountIdentity(
    access,
    registrationName,
    "admin",
  );
  return identity?.displayRole === "管理员" ||
    identity?.displayRole === "超级管理员"
    ? { ...identity, displayRole: identity.displayRole, surface: "admin" }
    : null;
}

export async function loadAdminCurrentIdentity(
  dependencies: AdminCurrentIdentityDependencies,
): Promise<AdminCurrentIdentity | null> {
  const access = await dependencies.getAccessContext();
  if (
    access === null ||
    access.membershipState !== "active" ||
    !access.capabilities.has("admin:operate") ||
    adminAccountRoleLabel(access.roles) === null
  ) {
    return null;
  }

  const registrationName = await dependencies.getRegistrationName(
    access.identity,
  );
  return createAdminCurrentIdentity(access, registrationName);
}
