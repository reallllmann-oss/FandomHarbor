import { describe, expect, it, vi } from "vitest";

import {
  createIdentityAccessService,
  invitationSecretHash,
  type IdentityAccessStore,
} from "./identity-access";

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

describe("identity access service", () => {
  it("returns a raw invitation secret once and stores only its hash", async () => {
    const accessStore = store();
    const service = createIdentityAccessService(accessStore);

    const invitation = await service.createInvitation({
      expiresAt: new Date(Date.now() + 60_000),
      maxUses: 2,
    });

    expect(invitation.id).toBe("invitation-id");
    expect(invitation.secret.length).toBeGreaterThanOrEqual(32);
    expect(accessStore.createInvitation).toHaveBeenCalledWith(
      expect.objectContaining({
        codeHash: expect.stringMatching(/^[0-9a-f]{64}$/),
      }),
    );
    expect(accessStore.createInvitation).not.toHaveBeenCalledWith(
      expect.objectContaining({ codeHash: invitation.secret }),
    );
  });

  it("hashes the same normalized secret deterministically", async () => {
    const secret = "a".repeat(43);
    await expect(invitationSecretHash(` ${secret} `)).resolves.toBe(
      await invitationSecretHash(secret),
    );
  });
});
