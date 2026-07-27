import { describe, expect, it, vi } from "vitest";

import {
  createIdentityAccessService,
  INVITATION_CODE_CREATE_MAX_ATTEMPTS,
  InvitationCodeGenerationError,
  invitationSecretHash,
  type IdentityAccessStore,
} from "./identity-access";
import { INVITATION_CODE_PATTERN } from "./invitation-code";

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
    expect(invitation.secret).toMatch(INVITATION_CODE_PATTERN);
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
    const secret = "LegacyInvitationCodeThatRemainsValid123";
    await expect(invitationSecretHash(` ${secret} `)).resolves.toBe(
      await invitationSecretHash(secret),
    );
  });

  it("hashes new codes and preserves case-sensitive legacy compatibility", async () => {
    await expect(invitationSecretHash("AbC123xYz90")).resolves.toMatch(
      /^[0-9a-f]{64}$/,
    );
    await expect(
      invitationSecretHash("LegacyInvitationCodeThatRemainsValid123"),
    ).resolves.toMatch(/^[0-9a-f]{64}$/);
    await expect(invitationSecretHash("AbC123xYz90")).resolves.not.toBe(
      await invitationSecretHash("abc123xyz90"),
    );
  });

  it("retries a unique database collision and returns the next code", async () => {
    const accessStore = store();
    vi.mocked(accessStore.createInvitation)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("second-invitation-id");
    const codeGenerator = vi
      .fn()
      .mockReturnValueOnce("AbC123xYz90")
      .mockReturnValueOnce("ZyX987wVu65");
    const service = createIdentityAccessService(accessStore, {
      generateInvitationCode: codeGenerator,
    });

    await expect(
      service.createInvitation({
        expiresAt: new Date(Date.now() + 60_000),
        maxUses: 2,
      }),
    ).resolves.toEqual({
      id: "second-invitation-id",
      secret: "ZyX987wVu65",
    });
    expect(accessStore.createInvitation).toHaveBeenCalledTimes(2);
    expect(codeGenerator).toHaveBeenCalledTimes(2);
  });

  it("fails with a controlled error after the collision retry limit", async () => {
    const accessStore = store();
    vi.mocked(accessStore.createInvitation).mockResolvedValue(null);
    const service = createIdentityAccessService(accessStore, {
      generateInvitationCode: () => "AbC123xYz90",
    });

    await expect(
      service.createInvitation({
        expiresAt: new Date(Date.now() + 60_000),
        maxUses: 2,
      }),
    ).rejects.toBeInstanceOf(InvitationCodeGenerationError);
    expect(accessStore.createInvitation).toHaveBeenCalledTimes(
      INVITATION_CODE_CREATE_MAX_ATTEMPTS,
    );
  });
});
