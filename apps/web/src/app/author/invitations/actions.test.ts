import { createTrustedAccessContext } from "@fandom-harbor/auth";
import {
  createIdentityAccessService,
  type IdentityAccessStore,
} from "@fandom-harbor/services";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebIdentityAccess } from "../../../lib/identity-access";
import { createInvitation } from "./actions";

vi.mock("../../../lib/identity-access", () => ({
  createWebIdentityAccess: vi.fn(),
}));

const identity = {
  id: "20000000-0000-4000-8000-000000000020",
};

function store(): IdentityAccessStore {
  return {
    createInvitation: vi.fn(async () => "invitation-id"),
    grantRole: vi.fn(async () => "role-id"),
    redeemInvitation: vi.fn(async () => "redemption-id"),
    revokeInvitation: vi.fn(async () => undefined),
    revokeRole: vi.fn(async () => undefined),
    setMembershipState: vi.fn(async () => undefined),
  };
}

describe("author invitation action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a standardized invitation through the shared service", async () => {
    vi.mocked(createWebIdentityAccess).mockResolvedValue({
      accessRepository: {
        getForIdentity: vi.fn(async () =>
          createTrustedAccessContext({
            identity,
            membershipState: "active",
            roles: ["author"],
          }),
        ),
      },
      auth: {
        getSession: vi.fn(async () => ({ identity })),
      },
      identityAccess: createIdentityAccessService(store()),
    } as never);
    const formData = new FormData();
    formData.set("expiresAt", new Date(Date.now() + 60_000).toISOString());
    formData.set("maxUses", "2");

    const result = await createInvitation({}, formData);

    expect(result.error).toBeUndefined();
    expect(result.invitation).toEqual({
      id: "invitation-id",
      secret: expect.stringMatching(/^[A-Za-z0-9]{11}$/),
    });
  });
});
