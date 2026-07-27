"use server";

import {
  AuthProviderError,
  isValidRegistrationName,
  MAX_PASSWORD_LENGTH,
  MAX_REGISTRATION_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeRegistrationName,
} from "@fandom-harbor/auth";
import {
  invitationSecretHash,
  INVITATION_CODE_LENGTH,
} from "@fandom-harbor/services";
import { z } from "zod";
import { redirect } from "next/navigation";

import { createWebIdentityAccess } from "../../lib/identity-access";

const credentialsSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  registrationName: z
    .string()
    .max(MAX_REGISTRATION_NAME_LENGTH)
    .refine(isValidRegistrationName),
});

const registrationSchema = credentialsSchema.extend({
  invitationCode: z.string().trim().min(INVITATION_CODE_LENGTH).max(256),
});

export async function signIn(formData: FormData) {
  const requestedPath = z
    .string()
    .max(500)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"))
    .safeParse(formData.get("next"));
  const credentials = credentialsSchema.safeParse({
    password: formData.get("password"),
    registrationName: formData.get("registrationName"),
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
  redirect(
    access.capabilities.has("archive:read")
      ? (requestedPath.data ?? "/archive")
      : "/access",
  );
}

export async function signUp(formData: FormData) {
  const credentials = registrationSchema.safeParse({
    invitationCode: formData.get("invitationCode"),
    password: formData.get("password"),
    registrationName: formData.get("registrationName"),
  });

  if (!credentials.success) {
    const invalidFields = new Set(
      credentials.error.issues.map((issue) => issue.path[0]),
    );
    if (invalidFields.has("password")) {
      redirect("/auth/sign-up?error=password");
    }
    if (invalidFields.has("registrationName")) {
      redirect("/auth/sign-up?error=registration-name");
    }
    redirect("/auth/sign-up?error=invitation");
  }

  const { auth } = await createWebIdentityAccess();

  try {
    const result = await auth.signUpWithPassword({
      invitationCodeHash: await invitationSecretHash(
        credentials.data.invitationCode,
      ),
      password: credentials.data.password,
      registrationName: normalizeRegistrationName(
        credentials.data.registrationName,
      ),
    });
    if (result.session) await auth.signOut();
  } catch (error) {
    if (error instanceof AuthProviderError) {
      switch (error.code) {
        case "INVALID_INVITATION":
          redirect("/auth/sign-up?error=invitation");
        case "INVITATION_EXPIRED":
          redirect("/auth/sign-up?error=invitation-expired");
        case "INVITATION_EXHAUSTED":
          redirect("/auth/sign-up?error=invitation-exhausted");
        case "INVITATION_REVOKED":
          redirect("/auth/sign-up?error=invitation-revoked");
        case "REGISTRATION_NAME_TAKEN":
          redirect("/auth/sign-up?error=name-taken");
        case "WEAK_PASSWORD":
          redirect("/auth/sign-up?error=password");
        case "RATE_LIMITED":
          redirect("/auth/sign-up?error=rate-limited");
        case "PROVIDER_CONFIGURATION_ERROR":
          redirect("/auth/sign-up?error=configuration");
        case "SERVICE_UNAVAILABLE":
        case "PROVIDER_ERROR":
          redirect("/auth/sign-up?error=service-unavailable");
      }
    }
    redirect("/auth/sign-up?error=service-unavailable");
  }

  redirect("/auth/sign-in?status=registered");
}

export async function signOut() {
  const { auth } = await createWebIdentityAccess();
  await auth.signOut();
  redirect("/");
}

export async function redeemInvitation(formData: FormData) {
  const secret = z
    .string()
    .min(INVITATION_CODE_LENGTH)
    .max(256)
    .safeParse(formData.get("invite"));
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
