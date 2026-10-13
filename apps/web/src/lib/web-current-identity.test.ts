import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { describe, expect, it, vi } from "vitest";

import {
  createWebCurrentIdentities,
  loadWebCurrentIdentities,
} from "./web-current-identity";

const identity = { id: "20000000-0000-4000-8000-000000000011" };

function access(
  roles: ("admin" | "author" | "super_admin")[] = [],
  membershipState: "active" | "pending" | "revoked" | "suspended" = "active",
) {
  return createTrustedAccessContext({ identity, membershipState, roles });
}

describe("Web current identity", () => {
  it("uses active membership as the canonical Reader model", () => {
    expect(createWebCurrentIdentities(access(), "reader-name")).toEqual({
      author: null,
      reader: {
        displayRole: "读者",
        registrationName: "reader-name",
        surface: "reader",
      },
    });
  });

  it("shows Author on Reader and Studio without leaking Admin privilege", () => {
    expect(
      createWebCurrentIdentities(
        access(["author", "super_admin"]),
        "mixed-role-name",
      ),
    ).toEqual({
      author: {
        displayRole: "作者",
        registrationName: "mixed-role-name",
        surface: "author",
      },
      reader: {
        displayRole: "作者",
        registrationName: "mixed-role-name",
        surface: "reader",
      },
    });
  });

  it("presents an Admin-only active member as Reader on Reader Web", () => {
    expect(
      createWebCurrentIdentities(access(["super_admin"]), "admin-reader"),
    ).toEqual({
      author: null,
      reader: {
        displayRole: "读者",
        registrationName: "admin-reader",
        surface: "reader",
      },
    });
  });

  it("keys the profile lookup only from trusted access identity", async () => {
    const getRegistrationName = vi.fn(async () => "akumie");
    await expect(
      loadWebCurrentIdentities({
        getAccessContext: vi.fn(async () => access(["author", "super_admin"])),
        getRegistrationName,
      }),
    ).resolves.toEqual({
      author: {
        displayRole: "作者",
        registrationName: "akumie",
        surface: "author",
      },
      reader: {
        displayRole: "作者",
        registrationName: "akumie",
        surface: "reader",
      },
    });
    expect(getRegistrationName).toHaveBeenCalledWith(identity);
  });

  it.each([null, access([], "pending"), access(["author"], "suspended")])(
    "does not query a profile for an unavailable Reader context",
    async (currentAccess) => {
      const getRegistrationName = vi.fn(async () => "not-readable");
      await expect(
        loadWebCurrentIdentities({
          getAccessContext: vi.fn(async () => currentAccess),
          getRegistrationName,
        }),
      ).resolves.toBeNull();
      expect(getRegistrationName).not.toHaveBeenCalled();
    },
  );
});
