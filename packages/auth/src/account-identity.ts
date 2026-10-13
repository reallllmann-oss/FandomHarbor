import type { TrustedAccessContext } from "./identity";
import { isValidRegistrationName } from "./registration-policy";

export type AccountSurface = "admin" | "author" | "reader";
export type SurfaceDisplayRole = "作者" | "管理员" | "超级管理员" | "读者";

export type CurrentAccountIdentity =
  | {
      displayRole: "管理员" | "超级管理员";
      registrationName: string;
      surface: "admin";
    }
  | {
      displayRole: "作者";
      registrationName: string;
      surface: "author";
    }
  | {
      displayRole: "作者" | "读者";
      registrationName: string;
      surface: "reader";
    };

export type CurrentAccountIdentityFor<Surface extends AccountSurface> = Extract<
  CurrentAccountIdentity,
  { surface: Surface }
>;

type SurfaceRoleInput = Pick<TrustedAccessContext, "membershipState" | "roles">;

/**
 * Presentation-only mapping. Callers must continue to authorize with their
 * existing trusted capability checks rather than this display label.
 */
export function resolveSurfaceDisplayRole(
  access: SurfaceRoleInput,
  surface: AccountSurface,
): SurfaceDisplayRole | null {
  if (access.membershipState !== "active") return null;

  switch (surface) {
    case "reader":
      return access.roles.has("author") ? "作者" : "读者";
    case "author":
      return access.roles.has("author") ? "作者" : null;
    case "admin":
      if (access.roles.has("super_admin")) return "超级管理员";
      if (access.roles.has("admin")) return "管理员";
      return null;
    default: {
      const exhaustiveSurface: never = surface;
      void exhaustiveSurface;
      return null;
    }
  }
}

export function createCurrentAccountIdentity<Surface extends AccountSurface>(
  access: TrustedAccessContext,
  registrationName: string | null,
  surface: Surface,
): CurrentAccountIdentityFor<Surface> | null {
  if (registrationName === null || !isValidRegistrationName(registrationName)) {
    return null;
  }

  const displayRole = resolveSurfaceDisplayRole(access, surface);
  if (displayRole === null) return null;

  return {
    displayRole,
    registrationName,
    surface,
  } as CurrentAccountIdentityFor<Surface>;
}
