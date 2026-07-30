import {
  createAdminSiteCopyService,
  type AdminSiteCopySaveInput,
  type AdminSiteCopySaveResult,
  type AdminSiteCopySnapshot,
} from "@fandom-harbor/services";
import type {
  AuthCookieMutation,
  TrustedAccessContext,
} from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseAdminSiteCopyRepository } from "@fandom-harbor/database";
import { cookies } from "next/headers";

async function createAdminSiteCopy() {
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
  const repository = createSupabaseAdminSiteCopyRepository(
    readPublicRuntimeConfig(),
    cookieAdapter,
  );

  return createAdminSiteCopyService(repository);
}

export async function readAdminSiteCopy(
  access: TrustedAccessContext,
): Promise<AdminSiteCopySnapshot> {
  return (await createAdminSiteCopy()).read(access);
}

export async function saveAdminSiteCopy(
  access: TrustedAccessContext,
  input: AdminSiteCopySaveInput,
): Promise<AdminSiteCopySaveResult> {
  return (await createAdminSiteCopy()).save(access, input);
}
