import { describe, expect, it } from "vitest";

import { createTrustedAccessContext, type TrustedIdentity } from "./identity";

const identity: TrustedIdentity = {
  id: "00000000-0000-4000-8000-000000000001",
};

describe("trusted access context", () => {
  it("grants Reader capability from active membership", () => {
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    expect([...context.capabilities]).toEqual(["archive:read"]);
  });

  it("does not grant capabilities to inactive memberships", () => {
    const context = createTrustedAccessContext({
      identity,
      membershipState: "suspended",
      roles: ["super_admin"],
    });

    expect(context.capabilities.size).toBe(0);
  });

  it("derives elevated capabilities only for active memberships", () => {
    const context = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author", "super_admin"],
    });

    expect(context.capabilities).toEqual(
      new Set([
        "archive:read",
        "work:author",
        "admin:operate",
        "super_admin:operate",
      ]),
    );
  });
});
