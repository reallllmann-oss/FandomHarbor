import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import type { IdentityAccessStore } from "@fandom-harbor/services";

import { DatabaseAccessError } from "./access-context-repository";
import { createServerSupabaseClient } from "./server-client";

export function createSupabaseIdentityAccessStore(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): IdentityAccessStore {
  const client = createServerSupabaseClient(environment, cookies);

  async function rpc<T>(
    name: string,
    parameters: Record<string, unknown>,
  ): Promise<T> {
    const { data, error } = await client.rpc(name, parameters);
    if (error) {
      throw new DatabaseAccessError(
        `Identity access operation failed: ${name}`,
        {
          cause: error,
        },
      );
    }
    return data as T;
  }

  return {
    createInvitation(input) {
      return rpc<string | null>("create_invitation", {
        p_code_hash: input.codeHash,
        p_expires_at: input.expiresAt.toISOString(),
        p_max_uses: input.maxUses,
      });
    },
    grantRole(input) {
      return rpc<string>("grant_role", {
        p_reason: input.reason,
        p_role: input.role,
        p_user_id: input.userId,
      });
    },
    redeemInvitation(codeHash) {
      return rpc<string>("redeem_invitation", { p_code_hash: codeHash });
    },
    async revokeInvitation(input) {
      await rpc("revoke_invitation", {
        p_invitation_id: input.invitationId,
        p_reason: input.reason,
      });
    },
    async revokeRole(input) {
      await rpc("revoke_role", {
        p_reason: input.reason,
        p_role: input.role,
        p_user_id: input.userId,
      });
    },
    async setMembershipState(input) {
      await rpc("set_membership_state", {
        p_reason: input.reason,
        p_state: input.state,
        p_user_id: input.userId,
      });
    },
  };
}
