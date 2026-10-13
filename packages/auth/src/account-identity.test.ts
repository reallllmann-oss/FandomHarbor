import { describe, expect, it } from "vitest";

import {
  createCurrentAccountIdentity,
  resolveSurfaceDisplayRole,
} from "./account-identity";
import { createTrustedAccessContext } from "./identity";

const identity = { id: "20000000-0000-4000-8000-000000000011" };

function access(
  roles: ("admin" | "author" | "super_admin")[] = [],
  membershipState: "active" | "pending" | "revoked" | "suspended" = "active",
) {
  return createTrustedAccessContext({ identity, membershipState, roles });
}

describe("surface account identity presentation", () => {
  it.each([
    { expected: "读者", roles: [], surface: "reader" },
    { expected: "作者", roles: ["author"], surface: "reader" },
    {
      expected: "作者",
      roles: ["author", "super_admin"],
      surface: "reader",
    },
    {
      expected: "读者",
      roles: ["super_admin"],
      surface: "reader",
    },
    { expected: "作者", roles: ["author"], surface: "author" },
    {
      expected: "作者",
      roles: ["author", "super_admin"],
      surface: "author",
    },
    {
      expected: "超级管理员",
      roles: ["author", "super_admin"],
      surface: "admin",
    },
    { expected: "管理员", roles: ["admin", "author"], surface: "admin" },
  ] as const)(
    "maps $roles to $expected on $surface",
    ({ expected, roles, surface }) => {
      expect(resolveSurfaceDisplayRole(access([...roles]), surface)).toBe(
        expected,
      );
    },
  );

  it("fails closed for a role that is not valid on the current surface", () => {
    expect(resolveSurfaceDisplayRole(access([]), "author")).toBeNull();
    expect(resolveSurfaceDisplayRole(access(["author"]), "admin")).toBeNull();
  });

  it.each(["pending", "revoked", "suspended"] as const)(
    "does not present a role for %s membership",
    (membershipState) => {
      expect(
        resolveSurfaceDisplayRole(
          access(["author", "super_admin"], membershipState),
          "reader",
        ),
      ).toBeNull();
    },
  );

  it("creates only a display-safe account model", () => {
    expect(
      createCurrentAccountIdentity(
        access(["author", "super_admin"]),
        "akumie",
        "admin",
      ),
    ).toEqual({
      displayRole: "超级管理员",
      registrationName: "akumie",
      surface: "admin",
    });
  });

  it("rejects missing or invalid canonical registration names", () => {
    expect(createCurrentAccountIdentity(access(), null, "reader")).toBeNull();
    expect(
      createCurrentAccountIdentity(access(), "\u0000invalid", "reader"),
    ).toBeNull();
  });
});
