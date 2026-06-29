"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { createWebIdentityAccess } from "../../lib/identity-access";

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

  const { accessRepository, auth } = await createWebIdentityAccess();

  let session;
  try {
    session = await auth.signInWithPassword(credentials.data);
  } catch {
    redirect("/auth/sign-in?error=invalid");
  }

  const access = await accessRepository.getForIdentity(session.identity);
  redirect(access.capabilities.has("archive:read") ? "/archive" : "/access");
}

export async function signUp(formData: FormData) {
  const credentials = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!credentials.success) redirect("/auth/sign-up?error=invalid");

  const { auth } = await createWebIdentityAccess();

  try {
    const result = await auth.signUpWithPassword(credentials.data);
    if (result.session) await auth.signOut();
  } catch {
    redirect("/auth/sign-up?error=provider");
  }

  redirect("/auth/sign-in?status=verify-email");
}

export async function signOut() {
  const { auth } = await createWebIdentityAccess();
  await auth.signOut();
  redirect("/");
}

export async function redeemInvitation(formData: FormData) {
  const secret = z.string().min(32).max(256).safeParse(formData.get("invite"));
  if (!secret.success) redirect("/access?error=invalid");

  const { auth, identityAccess } = await createWebIdentityAccess();
  const session = await auth.getSession();
  if (!session) redirect("/auth/sign-in");

  try {
    await identityAccess.redeemInvitation(secret.data);
  } catch {
    redirect("/access?error=rejected");
  }

  redirect("/archive");
}
