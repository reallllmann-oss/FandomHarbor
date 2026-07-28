import { describe, expect, it, vi } from "vitest";

import {
  createIdentityAccessService,
  INVITATION_CODE_CREATE_MAX_ATTEMPTS,
  InvitationCodeCollisionError,
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

  it("retries a typed database collision and returns the next code", async () => {
    const accessStore = store();
    vi.mocked(accessStore.createInvitation)
      .mockRejectedValueOnce(new InvitationCodeCollisionError())
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
    expect(
      vi
        .mocked(accessStore.createInvitation)
        .mock.calls.map(([input]) => input.codeHash),
    ).toEqual([
      await invitationSecretHash("AbC123xYz90"),
      await invitationSecretHash("ZyX987wVu65"),
    ]);
  });

  it("retries two typed collisions before succeeding with a third code", async () => {
    const accessStore = store();
    vi.mocked(accessStore.createInvitation)
      .mockRejectedValueOnce(new InvitationCodeCollisionError())
      .mockRejectedValueOnce(new InvitationCodeCollisionError())
      .mockResolvedValueOnce("third-invitation-id");
    const codeGenerator = vi
      .fn()
      .mockReturnValueOnce("AbC123xYz90")
      .mockReturnValueOnce("ZyX987wVu65")
      .mockReturnValueOnce("QrS456tUv12");
    const service = createIdentityAccessService(accessStore, {
      generateInvitationCode: codeGenerator,
    });

    await expect(
      service.createInvitation({
        expiresAt: new Date(Date.now() + 60_000),
        maxUses: 2,
      }),
    ).resolves.toEqual({
      id: "third-invitation-id",
      secret: "QrS456tUv12",
    });
    expect(accessStore.createInvitation).toHaveBeenCalledTimes(3);
    expect(codeGenerator).toHaveBeenCalledTimes(3);
  });

  it("fails with a controlled error after five distinct collision attempts", async () => {
    const accessStore = store();
    vi.mocked(accessStore.createInvitation).mockRejectedValue(
      new InvitationCodeCollisionError(),
    );
    const secrets = [
      "AbC123xYz90",
      "ZyX987wVu65",
      "QrS456tUv12",
      "LmN789oPq34",
      "GhI012jKl56",
      "NoP345qRs78",
    ];
    const codeGenerator = vi.fn(() => secrets.shift() ?? "");
    const service = createIdentityAccessService(accessStore, {
      generateInvitationCode: codeGenerator,
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
    expect(codeGenerator).toHaveBeenCalledTimes(
      INVITATION_CODE_CREATE_MAX_ATTEMPTS,
    );
    const hashes = vi
      .mocked(accessStore.createInvitation)
      .mock.calls.map(([input]) => input.codeHash);
    expect(new Set(hashes).size).toBe(INVITATION_CODE_CREATE_MAX_ATTEMPTS);
    expect(secrets).toEqual(["NoP345qRs78"]);
  });

  it("does not retry a non-collision database error", async () => {
    const accessStore = store();
    const databaseError = new Error("controlled database failure");
    vi.mocked(accessStore.createInvitation).mockRejectedValue(databaseError);
    const codeGenerator = vi.fn(() => "AbC123xYz90");
    const service = createIdentityAccessService(accessStore, {
      generateInvitationCode: codeGenerator,
    });

    await expect(
      service.createInvitation({
        expiresAt: new Date(Date.now() + 60_000),
        maxUses: 2,
      }),
    ).rejects.toBe(databaseError);
    expect(accessStore.createInvitation).toHaveBeenCalledTimes(1);
    expect(codeGenerator).toHaveBeenCalledTimes(1);
  });
});
