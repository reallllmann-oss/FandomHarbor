import {
  createTrustedAccessContext,
  type ElevatedRole,
  type MembershipState,
  type TrustedAccessContext,
  type TrustedIdentity,
} from "@fandom-harbor/auth";
import type { AuthCookieStore } from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { z } from "zod";

import { createServerSupabaseClient } from "./server-client";

const membershipStateSchema = z
  .enum(["active", "pending", "revoked", "suspended"])
  .nullable();
const elevatedRolesSchema = z.array(
  z.object({ role: z.enum(["admin", "author", "super_admin"]) }),
);

export interface AccessContextRepository {
  getForIdentity(identity: TrustedIdentity): Promise<TrustedAccessContext>;
}

interface AccessContextDataSource {
  getActiveRoles(userId: string): Promise<unknown>;
  getMembershipState(userId: string): Promise<unknown>;
}

export class DatabaseAccessError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DatabaseAccessError";
  }
}

export function createAccessContextRepository(
  source: AccessContextDataSource,
): AccessContextRepository {
  return {
    async getForIdentity(identity) {
      const [rawMembershipState, rawRoles] = await Promise.all([
        source.getMembershipState(identity.id),
        source.getActiveRoles(identity.id),
      ]);

      const membershipState: MembershipState | null =
        membershipStateSchema.parse(rawMembershipState);
      const roles: ElevatedRole[] = elevatedRolesSchema
        .parse(rawRoles)
        .map(({ role }) => role);

      return createTrustedAccessContext({
        identity,
        membershipState,
        roles,
      });
    },
  };
}

export function createSupabaseAccessContextRepository(
  environment: PublicRuntimeConfig | Record<string, string | undefined>,
  cookies: AuthCookieStore,
): AccessContextRepository {
  const client = createServerSupabaseClient(environment, cookies);

  return createAccessContextRepository({
    async getActiveRoles(userId) {
      const { data, error } = await client
        .from("role_grants")
        .select("role")
        .eq("user_id", userId)
        .is("revoked_at", null);

      if (error) {
        throw new DatabaseAccessError("Unable to load active roles", {
          cause: error,
        });
      }

      return data;
    },

    async getMembershipState(userId) {
      const { data, error } = await client
        .from("memberships")
        .select("state")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        throw new DatabaseAccessError("Unable to load membership", {
          cause: error,
        });
      }

      return data?.state ?? null;
    },
  });
}
