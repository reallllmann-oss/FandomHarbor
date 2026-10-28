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
import { createAdminLoginResolver } from "../../lib/admin-login-resolver";
import {
  AdminLoginStageError,
  reportAdminLoginDiagnostic,
  safeAdminLoginCode,
  type AdminLoginStage,
} from "../../lib/admin-login-diagnostics";

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
  if (!credentials.success) {
    reportAdminLoginDiagnostic({
      stage: "REGISTRATION_VALIDATION",
      http_status: null,
      error_code: "INVALID_INPUT",
    });
    redirect("/auth/sign-in?error=invalid");
  }
  reportAdminLoginDiagnostic({
    stage: "REGISTRATION_VALIDATION",
    http_status: null,
    error_code: "OK",
  });

  let stage: AdminLoginStage = "SERVER_CONFIGURATION";
  try {
    const { accessRepository, auth } = await createAdminIdentityAccess();
    const resolved = await createAdminLoginResolver().resolve(
      credentials.data.registrationName,
    );
    if (!resolved)
      throw new AdminLoginStageError(
        "RESOLVED_UID_CHECK",
        null,
        "UNKNOWN_NAME",
      );
    stage = "PASSWORD_AUTHENTICATION";
    const session = await auth.signInWithResolvedEmail({
      email: resolved.email,
      password: credentials.data.password,
    });
    reportAdminLoginDiagnostic({ stage, http_status: null, error_code: "OK" });
    stage = "SESSION_UID_CHECK";
    if (session.identity.id !== resolved.userId) {
      await auth.signOut();
      throw new AdminLoginStageError(stage, null, "UID_MISMATCH");
    }
    reportAdminLoginDiagnostic({ stage, http_status: null, error_code: "OK" });
    stage = "ADMIN_ACCESS_CHECK";
    const access = await accessRepository.getForIdentity(session.identity);
    if (!access.capabilities.has("admin:operate")) {
      await auth.signOut();
      throw new AdminLoginStageError(stage, null, "FORBIDDEN");
    }
    reportAdminLoginDiagnostic({ stage, http_status: null, error_code: "OK" });
  } catch (error) {
    const diagnostic =
      error instanceof AdminLoginStageError
        ? error.diagnostic
        : {
            stage,
            http_status: null,
            error_code: safeAdminLoginCode(
              error && typeof error === "object" && "code" in error
                ? error.code
                : undefined,
            ),
          };
    reportAdminLoginDiagnostic(diagnostic);
    redirect(
      diagnostic.stage === "ADMIN_ACCESS_CHECK" &&
        diagnostic.error_code === "FORBIDDEN"
        ? "/auth/sign-in?error=forbidden"
        : "/auth/sign-in?error=invalid",
    );
  }

  redirect("/");
}

export async function signOut() {
  const { auth } = await createAdminIdentityAccess();
  await auth.signOut();
  redirect("/auth/sign-in");
}
