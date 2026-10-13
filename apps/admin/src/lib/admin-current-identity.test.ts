import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { describe, expect, it, vi } from "vitest";

import {
  adminAccountRoleLabel,
  createAdminCurrentIdentity,
  loadAdminCurrentIdentity,
} from "./admin-current-identity";

const identity = {
  id: "20000000-0000-4000-8000-000000000011",
};

function accessFor(
  roles: ("admin" | "author" | "super_admin")[],
  membershipState: "active" | "revoked" | "suspended" = "active",
) {
  return createTrustedAccessContext({
    identity,
    membershipState,
    roles,
  });
}

describe("Admin current identity presentation", () => {
  it("resolves the canonical registration name using only the trusted identity", async () => {
    const getRegistrationName = vi.fn(async () => "akumie");

    await expect(
      loadAdminCurrentIdentity({
        getAccessContext: vi.fn(async () => accessFor(["super_admin"])),
        getRegistrationName,
      }),
    ).resolves.toEqual({
      displayRole: "超级管理员",
      registrationName: "akumie",
      surface: "admin",
    });

    expect(getRegistrationName).toHaveBeenCalledTimes(1);
    expect(getRegistrationName).toHaveBeenCalledWith(identity);
  });

  it.each([
    { roles: ["super_admin"] as const, expected: "超级管理员" },
    { roles: ["admin"] as const, expected: "管理员" },
    {
      roles: ["author", "super_admin"] as const,
      expected: "超级管理员",
    },
    { roles: ["admin", "author"] as const, expected: "管理员" },
  ])("uses Admin-only precedence for $roles", ({ expected, roles }) => {
    expect(adminAccountRoleLabel(new Set(roles))).toBe(expected);
  });

  it("does not synthesize a reader role from an empty or author-only role set", () => {
    expect(adminAccountRoleLabel(new Set())).toBeNull();
    expect(adminAccountRoleLabel(new Set(["author"]))).toBeNull();
  });

  it("fails closed when the canonical profile has no registration name", async () => {
    await expect(
      loadAdminCurrentIdentity({
        getAccessContext: vi.fn(async () => accessFor(["admin"])),
        getRegistrationName: vi.fn(async () => null),
      }),
    ).resolves.toBeNull();
  });

  it("rejects an invalid display value without exposing an identity fallback", () => {
    expect(
      createAdminCurrentIdentity(accessFor(["admin"]), "\u0000invalid"),
    ).toBeNull();
  });

  it.each([
    null,
    accessFor([]),
    accessFor(["author"]),
    accessFor(["admin"], "suspended"),
    accessFor(["super_admin"], "revoked"),
  ])("does not query a profile for an unauthorized context", async (access) => {
    const getRegistrationName = vi.fn(async () => "not-readable");

    await expect(
      loadAdminCurrentIdentity({
        getAccessContext: vi.fn(async () => access),
        getRegistrationName,
      }),
    ).resolves.toBeNull();
    expect(getRegistrationName).not.toHaveBeenCalled();
  });
});
