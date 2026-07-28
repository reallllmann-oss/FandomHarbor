import type { ElevatedRole, MembershipState } from "@fandom-harbor/auth";

import {
  generateInvitationCode,
  INVITATION_CODE_LENGTH,
  isStandardInvitationCode,
} from "./invitation-code";

export const INVITATION_CODE_CREATE_MAX_ATTEMPTS = 5;

export class InvitationCodeGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvitationCodeGenerationError";
  }
}

export class InvitationCodeCollisionError extends Error {
  constructor() {
    super("Invitation code collision");
    this.name = "InvitationCodeCollisionError";
  }
}

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

export async function invitationSecretHash(secret: string): Promise<string> {
  const normalized = secret.trim();
  if (normalized.length < INVITATION_CODE_LENGTH || normalized.length > 256) {
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

export function createIdentityAccessService(
  store: IdentityAccessStore,
  options: { generateInvitationCode?: () => string } = {},
) {
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

      const codeGenerator =
        options.generateInvitationCode ?? generateInvitationCode;

      for (
        let attempt = 0;
        attempt < INVITATION_CODE_CREATE_MAX_ATTEMPTS;
        attempt += 1
      ) {
        const secret = codeGenerator();
        if (!isStandardInvitationCode(secret)) {
          throw new InvitationCodeGenerationError(
            "Invitation code generator returned an invalid result",
          );
        }

        try {
          const id = await store.createInvitation({
            codeHash: await invitationSecretHash(secret),
            expiresAt: input.expiresAt,
            maxUses: input.maxUses,
          });

          return { id, secret };
        } catch (error) {
          if (error instanceof InvitationCodeCollisionError) continue;
          throw error;
        }
      }

      throw new InvitationCodeGenerationError(
        "Unable to generate a unique invitation code",
      );
    },

    async redeemInvitation(secret: string): Promise<string> {
      return store.redeemInvitation(await invitationSecretHash(secret));
    },

    revokeInvitation(input: { invitationId: string; reason: string }) {
      return store.revokeInvitation(input);
    },
  };
}
