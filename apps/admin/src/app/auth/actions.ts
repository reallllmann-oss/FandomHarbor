"use server";

import {
  isValidRegistrationName,
  MAX_PASSWORD_LENGTH,
  MAX_REGISTRATION_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@fandom-harbor/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAdminIdentityAccess } from "../../lib/identity-access";

const credentialsSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  registrationName: z
    .string()
    .max(MAX_REGISTRATION_NAME_LENGTH)
    .refine(isValidRegistrationName),
});

export async function signIn(formData: FormData) {
  const credentials = credentialsSchema.safeParse({
    password: formData.get("password"),
    registrationName: formData.get("registrationName"),
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
