"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminIdentityAccess } from "../../lib/identity-access";

const roleMutationSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
  role: z.enum(["author", "admin", "super_admin"]),
  userId: z.uuid(),
});

const membershipMutationSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
  state: z.enum(["active", "suspended", "revoked"]),
  userId: z.uuid(),
});

async function requireAdmin() {
  const dependencies = await createAdminIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("admin:operate")) {
    redirect("/auth/sign-in?error=forbidden");
  }

  return dependencies.identityAccessStore;
}

export async function grantRole(formData: FormData) {
  const input = roleMutationSchema.safeParse({
    reason: formData.get("reason"),
    role: formData.get("role"),
    userId: formData.get("userId"),
  });
  if (!input.success) redirect("/access?error=invalid");

  try {
    await (await requireAdmin()).grantRole(input.data);
  } catch {
    redirect("/access?error=denied");
  }
  redirect("/access?status=role-granted");
}

export async function revokeRole(formData: FormData) {
  const input = roleMutationSchema.safeParse({
    reason: formData.get("reason"),
    role: formData.get("role"),
    userId: formData.get("userId"),
  });
  if (!input.success) redirect("/access?error=invalid");

  try {
    await (await requireAdmin()).revokeRole(input.data);
  } catch {
    redirect("/access?error=denied");
  }
  redirect("/access?status=role-revoked");
}

export async function setMembershipState(formData: FormData) {
  const input = membershipMutationSchema.safeParse({
    reason: formData.get("reason"),
    state: formData.get("state"),
    userId: formData.get("userId"),
  });
  if (!input.success) redirect("/access?error=invalid");

  try {
    await (await requireAdmin()).setMembershipState(input.data);
  } catch {
    redirect("/access?error=denied");
  }
  redirect("/access?status=membership-updated");
}
