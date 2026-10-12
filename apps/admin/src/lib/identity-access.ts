import {
  createServerAuthProvider,
  type AuthCookieMutation,
} from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import {
  createSupabaseAccessContextRepository,
  createSupabaseIdentityAccessStore,
  createServerSupabaseClient,
} from "@fandom-harbor/database";
import { cookies } from "next/headers";
import { cache } from "react";

import { loadAdminCurrentIdentity } from "./admin-current-identity";

export async function createAdminIdentityAccess() {
  const cookieStore = await cookies();
  const cookieAdapter = {
    getAll: () => cookieStore.getAll(),
    setAll(mutations: AuthCookieMutation[]) {
      try {
        for (const { name, options, value } of mutations) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Server Components cannot write cookies. The action/proxy path can.
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
    identityAccessStore: createSupabaseIdentityAccessStore(
      runtime,
      cookieAdapter,
    ),
    runtime,
  };
}

const getAdminIdentityAccessForRequest = cache(createAdminIdentityAccess);

const getAdminAccessContextForRequest = cache(async () => {
  const { accessRepository, auth } = await getAdminIdentityAccessForRequest();
  const session = await auth.getSession();
  return session ? accessRepository.getForIdentity(session.identity) : null;
});

export async function getAdminAccessContext() {
  return getAdminAccessContextForRequest();
}

export async function getAdminCurrentIdentity() {
  return loadAdminCurrentIdentity({
    getAccessContext: getAdminAccessContext,
    async getRegistrationName(identity) {
      const { cookieAdapter, runtime } =
        await getAdminIdentityAccessForRequest();
      const { data, error } = await createServerSupabaseClient(
        runtime,
        cookieAdapter,
      )
        .from("profiles")
        .select("registration_name")
        .eq("user_id", identity.id)
        .maybeSingle();

      if (error) {
        throw new Error("Unable to load the current Admin profile", {
          cause: error,
        });
      }
      return typeof data?.registration_name === "string"
        ? data.registration_name
        : null;
    },
  });
}
