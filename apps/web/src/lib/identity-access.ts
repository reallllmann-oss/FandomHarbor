import {
  createServerAuthProvider,
  type AuthCookieMutation,
} from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import {
  createSupabaseAccessContextRepository,
  createSupabaseIdentityAccessStore,
} from "@fandom-harbor/database";
import { createIdentityAccessService } from "@fandom-harbor/services";
import { cookies } from "next/headers";

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
    identityAccess: createIdentityAccessService(
      createSupabaseIdentityAccessStore(runtime, cookieAdapter),
    ),
  };
}

export async function getWebAccessContext() {
  const { accessRepository, auth } = await createWebIdentityAccess();
  const session = await auth.getSession();
  return session ? accessRepository.getForIdentity(session.identity) : null;
}
