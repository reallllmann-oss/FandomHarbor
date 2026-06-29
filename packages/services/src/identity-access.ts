import type { ElevatedRole, MembershipState } from "@fandom-harbor/auth";

export interface IdentityAccessStore {
  createInvitation(input: {
    codeHash: string;
    expiresAt: Date;
    maxUses: number;
  }): Promise<string>;
  grantRole(input: {
    reason: string;
    role: ElevatedRole;
    userId: string;
  }): Promise<string>;
  redeemInvitation(codeHash: string): Promise<string>;
  revokeInvitation(input: {
    invitationId: string;
    reason: string;
  }): Promise<void>;
  revokeRole(input: {
    reason: string;
    role: ElevatedRole;
    userId: string;
  }): Promise<void>;
  setMembershipState(input: {
    reason: string;
    state: MembershipState;
    userId: string;
  }): Promise<void>;
}

export interface CreatedInvitation {
  id: string;
  secret: string;
}

function invitationSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export async function invitationSecretHash(secret: string): Promise<string> {
  const normalized = secret.trim();
  if (normalized.length < 32 || normalized.length > 256) {
    throw new Error("Invalid invitation secret");
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalized),
  );

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function createIdentityAccessService(store: IdentityAccessStore) {
  return {
    async createInvitation(input: {
      expiresAt: Date;
      maxUses: number;
    }): Promise<CreatedInvitation> {
      if (!Number.isSafeInteger(input.maxUses) || input.maxUses <= 0) {
        throw new Error("Invitation max uses must be a positive integer");
      }
      if (input.expiresAt.getTime() <= Date.now()) {
        throw new Error("Invitation expiry must be in the future");
      }

      const secret = invitationSecret();
      const id = await store.createInvitation({
        codeHash: await invitationSecretHash(secret),
        expiresAt: input.expiresAt,
        maxUses: input.maxUses,
      });

      return { id, secret };
    },

    async redeemInvitation(secret: string): Promise<string> {
      return store.redeemInvitation(await invitationSecretHash(secret));
    },

    revokeInvitation(input: { invitationId: string; reason: string }) {
      return store.revokeInvitation(input);
    },
  };
}
