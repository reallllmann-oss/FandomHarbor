import {
  createServerAuthProvider,
  type AuthCookieMutation,
  type TrustedIdentity,
} from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import {
  createSupabaseAccessContextRepository,
  createSupabaseIdentityAccessStore,
  createServerSupabaseClient,
} from "@fandom-harbor/database";
import { createIdentityAccessService } from "@fandom-harbor/services";
import { cookies } from "next/headers";
import { cache } from "react";

import { loadWebCurrentIdentities } from "./web-current-identity";

export async function createWebIdentityAccess() {
  const cookieStore = await cookies();
  const cookieAdapter = {
    getAll: () => cookieStore.getAll(),
    setAll(mutations: AuthCookieMutation[]) {
      try {
        for (const { name, options, value } of mutations) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Server Components cannot write cookies. The proxy/action refresh path can.
      }
    },
  };
  const runtime = readPublicRuntimeConfig();
  const auth = createServerAuthProvider(runtime, cookieAdapter);
  const accessRepository = createSupabaseAccessContextRepository(
    runtime,
    cookieAdapter,
  );

  return {
    accessRepository,
    auth,
    cookieAdapter,
    identityAccess: createIdentityAccessService(
      createSupabaseIdentityAccessStore(runtime, cookieAdapter),
    ),
    runtime,
  };
}

const getWebIdentityAccessForRequest = cache(createWebIdentityAccess);

const getWebAccessContextForRequest = cache(async () => {
  const { accessRepository, auth } = await getWebIdentityAccessForRequest();
  const session = await auth.getSession();
  return session ? accessRepository.getForIdentity(session.identity) : null;
});

const getWebRegistrationNameForRequest = cache(
  async (identity: TrustedIdentity) => {
    const { cookieAdapter, runtime } = await getWebIdentityAccessForRequest();
    const { data, error } = await createServerSupabaseClient(
      runtime,
      cookieAdapter,
    )
      .from("profiles")
      .select("registration_name")
      .eq("user_id", identity.id)
      .maybeSingle();

    if (error) {
      throw new Error("Unable to load the current Web profile", {
        cause: error,
      });
    }
    return typeof data?.registration_name === "string"
      ? data.registration_name
      : null;
  },
);

export async function getWebAccessContext() {
  return getWebAccessContextForRequest();
}

export async function getWebSessionSummary() {
  const access = await getWebAccessContext();
  if (!access) return null;
  return {
    access,
    identities: await loadWebCurrentIdentities({
      getAccessContext: async () => access,
      getRegistrationName: getWebRegistrationNameForRequest,
    }),
  };
}
