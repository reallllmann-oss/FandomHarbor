import {
  createServerAuthProvider,
  type AuthCookieMutation,
} from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import {
  createSupabaseAccessContextRepository,
  createSupabaseIdentityAccessStore,
} from "@fandom-harbor/database";
import { cookies } from "next/headers";

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
    identityAccessStore: createSupabaseIdentityAccessStore(
      runtime,
      cookieAdapter,
    ),
  };
}

export async function getAdminAccessContext() {
  const { accessRepository, auth } = await createAdminIdentityAccess();
  const session = await auth.getSession();
  return session ? accessRepository.getForIdentity(session.identity) : null;
}
