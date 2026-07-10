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
    cookieAdapter,
    identityAccess: createIdentityAccessService(
      createSupabaseIdentityAccessStore(runtime, cookieAdapter),
    ),
    runtime,
  };
}

export async function getWebAccessContext() {
  const { accessRepository, auth } = await createWebIdentityAccess();
  const session = await auth.getSession();
  return session ? accessRepository.getForIdentity(session.identity) : null;
}

export async function getWebSessionSummary() {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) return null;
  const [access, profileResult] = await Promise.all([
    dependencies.accessRepository.getForIdentity(session.identity),
    createServerSupabaseClient(dependencies.runtime, dependencies.cookieAdapter)
      .from("profiles")
      .select("registration_name")
      .eq("user_id", session.identity.id)
      .maybeSingle(),
  ]);
  return {
    access,
    displayName:
      typeof profileResult.data?.registration_name === "string"
        ? profileResult.data.registration_name
        : "已登录用户",
  };
}
