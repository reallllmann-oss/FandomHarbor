"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminIdentityAccess } from "../../lib/identity-access";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(12).max(128),
});

export async function signIn(formData: FormData) {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!credentials.success) redirect("/auth/sign-in?error=invalid");

  const { accessRepository, auth } = await createAdminIdentityAccess();
  let session;

  try {
    session = await auth.signInWithPassword(credentials.data);
  } catch {
    redirect("/auth/sign-in?error=invalid");
  }

  const access = await accessRepository.getForIdentity(session.identity);
  if (!access.capabilities.has("admin:operate")) {
    await auth.signOut();
    redirect("/auth/sign-in?error=forbidden");
  }

  redirect("/");
}

export async function signOut() {
  const { auth } = await createAdminIdentityAccess();
  await auth.signOut();
  redirect("/auth/sign-in");
}
