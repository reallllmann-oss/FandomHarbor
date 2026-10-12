import {
  isValidRegistrationName,
  type ElevatedRole,
  type TrustedAccessContext,
  type TrustedIdentity,
} from "@fandom-harbor/auth";

export type AdminDisplayRole = "管理员" | "超级管理员";

export interface AdminCurrentIdentity {
  displayRole: AdminDisplayRole;
  registrationName: string;
}

interface AdminCurrentIdentityDependencies {
  getAccessContext(): Promise<TrustedAccessContext | null>;
  getRegistrationName(identity: TrustedIdentity): Promise<string | null>;
}

export function adminAccountRoleLabel(
  roles: ReadonlySet<ElevatedRole>,
): AdminDisplayRole | null {
  if (roles.has("super_admin")) return "超级管理员";
  if (roles.has("admin")) return "管理员";
  return null;
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

  const displayRole = adminAccountRoleLabel(access.roles);
  if (displayRole === null) return null;

  return { displayRole, registrationName };
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
