import type { AuthCookieMutation } from "@fandom-harbor/auth";
import { createServerAuthProvider } from "@fandom-harbor/auth";
import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import {
  createSupabaseAccessContextRepository,
  createSupabaseIdentityAccessGovernanceRepository,
} from "@fandom-harbor/database";
import {
  createIdentityAccessGovernanceService,
  type IdentityAccessGovernanceService,
} from "@fandom-harbor/services";
import { cookies } from "next/headers";

export type AdminIdentityAccessGovernanceReads = Pick<
  IdentityAccessGovernanceService,
  "getSubjectDetail" | "listSubjectAudit" | "searchSubjects"
>;

export type AdminIdentityAccessGovernance = IdentityAccessGovernanceService;

export async function createAdminIdentityAccessGovernance(): Promise<AdminIdentityAccessGovernance> {
  const cookieStore = await cookies();
  const cookieAdapter = {
    getAll: () => cookieStore.getAll(),
    setAll(mutations: AuthCookieMutation[]) {
      try {
        for (const { name, options, value } of mutations) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Server Components cannot write cookies. Auth refresh remains best effort.
      }
    },
  };
  const runtime = readPublicRuntimeConfig();
  const auth = createServerAuthProvider(runtime, cookieAdapter);
  const accessRepository = createSupabaseAccessContextRepository(
    runtime,
    cookieAdapter,
  );
  const repository = createSupabaseIdentityAccessGovernanceRepository(
    runtime,
    cookieAdapter,
  );
  return createIdentityAccessGovernanceService({
    access: {
      async getCurrent() {
        const session = await auth.getSession();
        return session
          ? accessRepository.getForIdentity(session.identity)
          : null;
      },
    },
    read: repository,
    write: repository,
  });
}

export async function createAdminIdentityAccessGovernanceReads(): Promise<AdminIdentityAccessGovernanceReads> {
  const service = await createAdminIdentityAccessGovernance();
  return {
    getSubjectDetail: (input) => service.getSubjectDetail(input),
    listSubjectAudit: (input) => service.listSubjectAudit(input),
    searchSubjects: (input) => service.searchSubjects(input),
  };
}
