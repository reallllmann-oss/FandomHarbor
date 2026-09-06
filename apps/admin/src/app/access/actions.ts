"use server";

import { revalidatePath } from "next/cache";

import {
  executeAccessGovernanceMutation,
  type AccessGovernanceMutationActionState,
} from "../../lib/access-governance-mutation";
import { createAdminIdentityAccessGovernance } from "../../lib/identity-access-governance";

export async function governOrdinaryAccessAction(
  previousState: AccessGovernanceMutationActionState,
  formData: FormData,
): Promise<AccessGovernanceMutationActionState> {
  return executeAccessGovernanceMutation(previousState, formData, {
    createRequestId: () => crypto.randomUUID(),
    createService: createAdminIdentityAccessGovernance,
    refresh: () => revalidatePath("/access"),
  });
}
