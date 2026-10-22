"use server";

import {
  AuthProviderError,
  isValidRegistrationName,
  MAX_PASSWORD_LENGTH,
  MAX_REGISTRATION_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeRegistrationName,
  registrationNameEmail,
} from "@fandom-harbor/auth";
import { createServerSupabaseClient } from "@fandom-harbor/database";
import {
  invitationSecretHash,
  INVITATION_CODE_LENGTH,
} from "@fandom-harbor/services";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createWebIdentityAccess } from "../../lib/identity-access";
import {
  assertTrustedActionRequest,
  requestClientKey,
} from "../../lib/server-action-security";
import {
  createWebServerAuthSecurityBroker,
  PASSWORD_RECOVERY_GRANT_TTL_SECONDS,
  ServerAuthSecurityError,
} from "../../lib/server-auth-security";
import {
  createWebTrustedRegistrationBroker,
  TrustedRegistrationError,
} from "../../lib/server-registration";

const REGISTRATION_ATTEMPT_COOKIE = "fh_registration_attempt";
const PASSWORD_RECOVERY_COOKIE = "fh_password_recovery";

const credentialsSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  registrationName: z
    .string()
    .max(MAX_REGISTRATION_NAME_LENGTH)
    .refine(isValidRegistrationName),
});
const registrationSchema = credentialsSchema.extend({
  email: z
    .string()
    .trim()
    .pipe(z.email())
    .transform((value) => value.toLowerCase()),
  invitationCode: z.string().trim().min(INVITATION_CODE_LENGTH).max(256),
});
const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/);
const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().max(MAX_PASSWORD_LENGTH).optional(),
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    passwordConfirmation: z.string().max(MAX_PASSWORD_LENGTH),
  })
  .refine((value) => value.password === value.passwordConfirmation);

async function trustedRequestHeaders() {
  const requestHeaders = await headers();
  assertTrustedActionRequest(requestHeaders);
  return requestHeaders;
}

function secureCookie() {
  return process.env.NODE_ENV === "production";
}

type MutableCookieStore = Awaited<ReturnType<typeof cookies>>;

function clearRegistrationAttemptCookie(cookieStore: MutableCookieStore) {
  cookieStore.delete({ name: REGISTRATION_ATTEMPT_COOKIE, path: "/auth" });
}

function rethrowRedirect(error: unknown): void {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : "";
  const message = error instanceof Error ? error.message : "";
  if (digest.startsWith("NEXT_REDIRECT") || message.startsWith("REDIRECT:")) {
    throw error;
  }
}

async function enforceRateLimits(
  scope: string,
  subject: string,
  requestHeaders: Headers,
  limit: number,
  windowSeconds: number,
) {
  const broker = createWebServerAuthSecurityBroker();
  await broker.consumeRateLimit(
    `${scope}.ip`,
    requestClientKey(requestHeaders),
    limit,
    windowSeconds,
  );
  await broker.consumeRateLimit(
    `${scope}.subject`,
    subject,
    limit,
    windowSeconds,
  );
  return broker;
}

function safeNext(formData: FormData) {
  return z
    .string()
    .max(500)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"))
    .safeParse(formData.get("next"));
}

export async function signIn(formData: FormData) {
  const requestedPath = safeNext(formData);
  const credentials = credentialsSchema.safeParse({
    password: formData.get("password"),
    registrationName: formData.get("registrationName"),
  });
  if (!credentials.success) redirect("/auth/sign-in?error=invalid");

  let requestHeaders: Headers;
  try {
    requestHeaders = await trustedRequestHeaders();
  } catch {
    redirect("/auth/sign-in?error=invalid");
  }

  const registrationName = normalizeRegistrationName(
    credentials.data.registrationName,
  );
  const { accessRepository, auth } = await createWebIdentityAccess();
  let session;
  try {
    const security = await enforceRateLimits(
      "auth.login",
      registrationName,
      requestHeaders,
      10,
      300,
    );
    const resolved = await security.resolveLoginName(registrationName);
    session = resolved
      ? await auth.signInWithResolvedEmail({
          email: resolved.email,
          password: credentials.data.password,
        })
      : await auth.signInWithPassword({
          password: credentials.data.password,
          registrationName,
        });
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
    email: formData.get("email"),
    invitationCode: formData.get("invitationCode"),
    password: formData.get("password"),
    registrationName: formData.get("registrationName"),
  });
  if (!credentials.success) {
    const invalidFields = new Set(
      credentials.error.issues.map((issue) => issue.path[0]),
    );
    if (invalidFields.has("password")) redirect("/auth/sign-up?error=password");
    if (invalidFields.has("registrationName"))
      redirect("/auth/sign-up?error=registration-name");
    if (invalidFields.has("email")) redirect("/auth/sign-up?error=email");
    redirect("/auth/sign-up?error=invitation");
  }

  let requestHeaders: Headers;
  try {
    requestHeaders = await trustedRequestHeaders();
  } catch {
    redirect("/auth/sign-up?error=service-unavailable");
  }

  const registrationName = normalizeRegistrationName(
    credentials.data.registrationName,
  );
  try {
    const security = await enforceRateLimits(
      "auth.register",
      `${registrationName}\0${credentials.data.email}`,
      requestHeaders,
      5,
      3600,
    );
    const mode = await security.getRegistrationMode();
    if (mode === "legacy") {
      const { auth } = await createWebIdentityAccess();
      const result = await auth.signUpWithPassword({
        invitationCodeHash: await invitationSecretHash(
          credentials.data.invitationCode,
        ),
        password: credentials.data.password,
        registrationName,
      });
      if (result.session) await auth.signOut();
      redirect("/auth/sign-in?status=registered");
    }

    const cookieStore = await cookies();
    const existingHandle = cookieStore.get(REGISTRATION_ATTEMPT_COOKIE)?.value;
    const registrationInput = {
      email: credentials.data.email,
      invitationCode: credentials.data.invitationCode,
      password: credentials.data.password,
      registrationName,
    };
    const broker = createWebTrustedRegistrationBroker();
    let result = existingHandle
      ? await broker.resume(registrationInput, existingHandle)
      : null;
    if (!result) {
      if (existingHandle) clearRegistrationAttemptCookie(cookieStore);
      result = await broker.register(registrationInput);
    }
    if (result.status !== "verification_pending") {
      await security.consumeRateLimit(
        "auth.resend_signup.subject",
        result.attemptHandle,
        1,
        60,
      );
    }
    cookieStore.set(REGISTRATION_ATTEMPT_COOKIE, result.attemptHandle, {
      httpOnly: true,
      maxAge: Math.max(
        1,
        Math.floor((result.reservationExpiresAt.getTime() - Date.now()) / 1000),
      ),
      path: "/auth",
      sameSite: "lax",
      secure: secureCookie(),
    });
    redirect(`/auth/verify-email?status=${result.status}`);
  } catch (error) {
    rethrowRedirect(error);
    if (
      error instanceof ServerAuthSecurityError &&
      error.code === "RATE_LIMITED"
    ) {
      redirect("/auth/sign-up?error=rate-limited");
    }
    if (
      error instanceof TrustedRegistrationError &&
      error.code === "PROVIDER_CONFIGURATION_ERROR"
    ) {
      redirect("/auth/sign-up?error=configuration");
    }
    if (error instanceof AuthProviderError) {
      const mapping: Partial<Record<AuthProviderError["code"], string>> = {
        INVALID_INVITATION: "invitation",
        INVITATION_EXPIRED: "invitation-expired",
        INVITATION_EXHAUSTED: "invitation-exhausted",
        INVITATION_REVOKED: "invitation-revoked",
        REGISTRATION_NAME_TAKEN: "name-taken",
        WEAK_PASSWORD: "password",
        RATE_LIMITED: "rate-limited",
        PROVIDER_CONFIGURATION_ERROR: "configuration",
      };
      redirect(
        `/auth/sign-up?error=${mapping[error.code] ?? "service-unavailable"}`,
      );
    }
    redirect("/auth/sign-up?error=service-unavailable");
  }
}

export async function verifyRegistrationOtp(formData: FormData) {
  const token = otpSchema.safeParse(formData.get("token"));
  if (!token.success) redirect("/auth/verify-email?error=invalid-code");
  try {
    const requestHeaders = await trustedRequestHeaders();
    const cookieStore = await cookies();
    const attemptHandle = cookieStore.get(REGISTRATION_ATTEMPT_COOKIE)?.value;
    if (!attemptHandle) redirect("/auth/verify-email?error=attempt-expired");
    await enforceRateLimits(
      "auth.verify_signup",
      attemptHandle,
      requestHeaders,
      8,
      300,
    );
    const context =
      await createWebTrustedRegistrationBroker().verificationContext(
        attemptHandle,
      );
    const { cookieAdapter, runtime } = await createWebIdentityAccess();
    const client = createServerSupabaseClient(runtime, cookieAdapter);
    const { error } = await client.auth.verifyOtp({
      email: context.email,
      token: token.data,
      type: "email",
    });
    if (error) redirect("/auth/verify-email?error=invalid-code");
    clearRegistrationAttemptCookie(cookieStore);
    redirect("/access?status=email-verified");
  } catch (error) {
    rethrowRedirect(error);
    if (
      error instanceof ServerAuthSecurityError &&
      error.code === "RATE_LIMITED"
    ) {
      redirect("/auth/verify-email?error=rate-limited");
    }
    if (
      error instanceof TrustedRegistrationError &&
      error.code === "ATTEMPT_UNAVAILABLE"
    ) {
      clearRegistrationAttemptCookie(await cookies());
      redirect("/auth/verify-email?error=attempt-expired");
    }
    redirect("/auth/verify-email?error=verification-failed");
  }
}

export async function resendRegistrationOtp() {
  try {
    const requestHeaders = await trustedRequestHeaders();
    const cookieStore = await cookies();
    const attemptHandle = cookieStore.get(REGISTRATION_ATTEMPT_COOKIE)?.value;
    if (!attemptHandle) redirect("/auth/verify-email?error=attempt-expired");
    await enforceRateLimits(
      "auth.resend_signup",
      attemptHandle,
      requestHeaders,
      1,
      60,
    );
    const result =
      await createWebTrustedRegistrationBroker().resend(attemptHandle);
    redirect(`/auth/verify-email?status=${result.status}`);
  } catch (error) {
    rethrowRedirect(error);
    if (
      error instanceof ServerAuthSecurityError &&
      error.code === "RATE_LIMITED"
    ) {
      redirect("/auth/verify-email?error=resend-cooldown");
    }
    if (
      error instanceof TrustedRegistrationError &&
      error.code === "ATTEMPT_UNAVAILABLE"
    ) {
      clearRegistrationAttemptCookie(await cookies());
      redirect("/auth/verify-email?error=attempt-expired");
    }
    redirect("/auth/verify-email?error=resend-failed");
  }
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = z
    .string()
    .max(MAX_REGISTRATION_NAME_LENGTH)
    .safeParse(formData.get("registrationName"));
  if (parsed.success) {
    const registrationName = normalizeRegistrationName(parsed.data);
    try {
      const requestHeaders = await trustedRequestHeaders();
      const security = await enforceRateLimits(
        "auth.recovery_request",
        registrationName,
        requestHeaders,
        3,
        3600,
      );
      const resolved = await security.resolveLoginName(registrationName);
      const email =
        resolved && !resolved.isLegacyEmail
          ? resolved.email
          : await registrationNameEmail(registrationName);
      const { cookieAdapter, runtime } = await createWebIdentityAccess();
      await createServerSupabaseClient(
        runtime,
        cookieAdapter,
      ).auth.resetPasswordForEmail(email);
    } catch {
      // Keep unknown, legacy, provider-failed, and limited requests indistinguishable.
    }
  }
  redirect("/auth/reset-password?status=sent");
}

export async function verifyPasswordRecovery(formData: FormData) {
  const parsed = z
    .object({
      registrationName: z.string().max(MAX_REGISTRATION_NAME_LENGTH),
      token: otpSchema,
    })
    .safeParse({
      registrationName: formData.get("registrationName"),
      token: formData.get("token"),
    });
  if (!parsed.success) redirect("/auth/reset-password?error=invalid");
  const registrationName = normalizeRegistrationName(
    parsed.data.registrationName,
  );
  try {
    const requestHeaders = await trustedRequestHeaders();
    const security = await enforceRateLimits(
      "auth.recovery_verify",
      registrationName,
      requestHeaders,
      8,
      300,
    );
    const resolved = await security.resolveLoginName(registrationName);
    const email =
      resolved && !resolved.isLegacyEmail
        ? resolved.email
        : await registrationNameEmail(registrationName);
    const { cookieAdapter, runtime } = await createWebIdentityAccess();
    const { data, error } = await createServerSupabaseClient(
      runtime,
      cookieAdapter,
    ).auth.verifyOtp({
      email,
      token: parsed.data.token,
      type: "recovery",
    });
    if (error || !data.user || !resolved || resolved.isLegacyEmail)
      redirect("/auth/reset-password?error=invalid");
    (await cookies()).set(
      PASSWORD_RECOVERY_COOKIE,
      security.issuePasswordRecoveryGrant(data.user.id),
      {
        httpOnly: true,
        maxAge: PASSWORD_RECOVERY_GRANT_TTL_SECONDS,
        path: "/account/security",
        sameSite: "lax",
        secure: secureCookie(),
      },
    );
    redirect("/account/security?status=recovery");
  } catch (error) {
    rethrowRedirect(error);
    redirect("/auth/reset-password?error=invalid");
  }
}

export async function updatePassword(formData: FormData) {
  const parsed = passwordUpdateSchema.safeParse({
    currentPassword: formData.get("currentPassword") || undefined,
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });
  if (!parsed.success) redirect("/account/security?error=password");
  try {
    const requestHeaders = await trustedRequestHeaders();
    const security = await enforceRateLimits(
      "auth.password_change",
      requestClientKey(requestHeaders),
      requestHeaders,
      5,
      900,
    );
    const cookieStore = await cookies();
    const { cookieAdapter, runtime } = await createWebIdentityAccess();
    const client = createServerSupabaseClient(runtime, cookieAdapter);
    const { data, error: userError } = await client.auth.getUser();
    if (userError || !data.user?.email) redirect("/auth/sign-in");
    const recovery = security.verifyPasswordRecoveryGrant(
      cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value,
      data.user.id,
    );
    if (!recovery) {
      if (!parsed.data.currentPassword)
        redirect("/account/security?error=current-password");
      const { error } = await client.auth.signInWithPassword({
        email: data.user.email,
        password: parsed.data.currentPassword,
      });
      if (error) redirect("/account/security?error=current-password");
    }
    const { error } = await client.auth.updateUser({
      password: parsed.data.password,
    });
    if (error) redirect("/account/security?error=password-update");
    await client.auth.signOut({ scope: "others" });
    cookieStore.delete(PASSWORD_RECOVERY_COOKIE);
    redirect("/account/security?status=password-updated");
  } catch (error) {
    rethrowRedirect(error);
    redirect("/account/security?error=password-update");
  }
}

export async function requestEmailChange(formData: FormData) {
  const parsed = z
    .object({
      currentPassword: z
        .string()
        .min(MIN_PASSWORD_LENGTH)
        .max(MAX_PASSWORD_LENGTH),
      email: z
        .string()
        .trim()
        .pipe(z.email())
        .transform((value) => value.toLowerCase()),
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      email: formData.get("email"),
    });
  if (!parsed.success) redirect("/account/security?error=email");
  try {
    const requestHeaders = await trustedRequestHeaders();
    await enforceRateLimits(
      "auth.email_change",
      parsed.data.email,
      requestHeaders,
      3,
      3600,
    );
    const { cookieAdapter, runtime } = await createWebIdentityAccess();
    const client = createServerSupabaseClient(runtime, cookieAdapter);
    const { data, error: userError } = await client.auth.getUser();
    if (userError || !data.user?.email) redirect("/auth/sign-in");
    if (data.user.email.endsWith("@accounts.fandom-harbor.invalid"))
      redirect("/account/security?error=legacy-email");
    const { error: passwordError } = await client.auth.signInWithPassword({
      email: data.user.email,
      password: parsed.data.currentPassword,
    });
    if (passwordError) redirect("/account/security?error=current-password");
    const { error } = await client.auth.updateUser({
      email: parsed.data.email,
    });
    if (error) redirect("/account/security?error=email-update");
    redirect("/account/security?status=email-change-sent");
  } catch (error) {
    rethrowRedirect(error);
    redirect("/account/security?error=email-update");
  }
}

export async function confirmEmailChange(formData: FormData) {
  const parsed = z
    .object({
      email: z
        .string()
        .trim()
        .pipe(z.email())
        .transform((value) => value.toLowerCase()),
      token: otpSchema,
    })
    .safeParse({ email: formData.get("email"), token: formData.get("token") });
  if (!parsed.success) redirect("/account/security?error=email-code");
  try {
    const requestHeaders = await trustedRequestHeaders();
    await enforceRateLimits(
      "auth.email_change_verify",
      parsed.data.email,
      requestHeaders,
      8,
      300,
    );
    const { cookieAdapter, runtime } = await createWebIdentityAccess();
    const client = createServerSupabaseClient(runtime, cookieAdapter);
    const { data: current, error: currentUserError } =
      await client.auth.getUser();
    if (currentUserError || !current.user) redirect("/auth/sign-in");
    const { data: verified, error } = await client.auth.verifyOtp({
      email: parsed.data.email,
      token: parsed.data.token,
      type: "email_change",
    });
    if (error) redirect("/account/security?error=email-code");
    // Secure email change may return no user for the first-side confirmation.
    // A returned user is still required to match the already authenticated UID.
    if (verified.user && verified.user.id !== current.user.id) {
      redirect("/account/security?status=email-change-status-unknown");
    }

    const { data: refreshed, error: refreshedUserError } =
      await client.auth.getUser();
    if (
      refreshedUserError ||
      !refreshed.user ||
      refreshed.user.id !== current.user.id
    ) {
      redirect("/account/security?status=email-change-status-unknown");
    }

    const previousEmail = current.user.email?.trim().toLowerCase();
    const currentEmail = refreshed.user.email?.trim().toLowerCase();
    redirect(
      previousEmail && currentEmail && previousEmail !== currentEmail
        ? "/account/security?status=email-change-complete"
        : "/account/security?status=email-change-pending",
    );
  } catch (error) {
    rethrowRedirect(error);
    redirect("/account/security?error=email-code");
  }
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
