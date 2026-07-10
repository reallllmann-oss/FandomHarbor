import type { TrustedIdentity } from "@fandom-harbor/auth";
import { describe, expect, it } from "vitest";

import { createAccessContextRepository } from "./access-context-repository";

const identity: TrustedIdentity = {
  id: "00000000-0000-4000-8000-000000000001",
};

describe("access context repository", () => {
  it("maps database state into provider-independent capabilities", async () => {
    const repository = createAccessContextRepository({
      async getActiveRoles() {
        return [{ role: "author" }];
      },
      async getMembershipState() {
        return "active";
      },
    });

    const context = await repository.getForIdentity(identity);

    expect(context.capabilities).toEqual(
      new Set(["archive:read", "work:author"]),
    );
  });

  it("fails closed when provider data is not a known state", async () => {
    const repository = createAccessContextRepository({
      async getActiveRoles() {
        return [{ role: "reader" }];
      },
      async getMembershipState() {
        return "active";
      },
    });

    await expect(repository.getForIdentity(identity)).rejects.toThrow();
  });
});
