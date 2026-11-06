"use server";

import { redirect } from "next/navigation";

import { getAdminAccessContext } from "../../../../lib/identity-access";
import {
  BindingOrchestratorError,
  type BindingOrchestratorErrorCode,
} from "../../../../lib/super-admin-email-binding-orchestrator";
import {
  createB3Sa2Runtime,
  isB3SaEmailBindingFeatureEnabled,
  parseOperationId,
} from "../../../../lib/super-admin-email-binding-runtime";

function value(form: FormData, name: string): string {
  const entry = form.get(name);
  return typeof entry === "string" ? entry : "";
}

function status(error: unknown): BindingOrchestratorErrorCode {
  return error instanceof BindingOrchestratorError
    ? error.code
    : "AUTH_STATE_UNAVAILABLE";
}

function destination(operationId: string, result: string) {
  return `/b3-sa/email-binding/${operationId}?status=${encodeURIComponent(result)}`;
}

function requireLocalFeature() {
  if (!isB3SaEmailBindingFeatureEnabled()) {
    throw new BindingOrchestratorError("AUTH_STATE_UNAVAILABLE");
  }
}

export async function verifyFreshTotpAction(
  operationIdInput: string,
  formData: FormData,
) {
  requireLocalFeature();
  const operationId = parseOperationId(operationIdInput);
  const factorId = value(formData, "factorId");
  const code = value(formData, "code");
  try {
    const runtime = await createB3Sa2Runtime();
    const operation = await runtime.binding.get(operationId);
    const evidence = await runtime.serverAuth.getTrustedAuthEvidence();
    if (evidence?.actorUserId !== operation.targetUserId) {
      throw new BindingOrchestratorError("IDENTITY_MISMATCH");
    }
    const { data: factorsData, error: factorsError } =
      await runtime.supabase.auth.mfa.listFactors();
    const allowed = factorsData?.totp.some(
      (factor) => factor.id === factorId && factor.status === "verified",
    );
    if (factorsError || !allowed || !/^\d{6}$/u.test(code)) {
      throw new BindingOrchestratorError("INVALID_REQUEST");
    }
    const { error } = await runtime.supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    if (error) throw new BindingOrchestratorError("AUTH_STATE_UNAVAILABLE");
  } catch (error) {
    redirect(destination(operationId, status(error)));
  }
  redirect(destination(operationId, "totp_verified"));
}

export async function startBindingAction(
  operationIdInput: string,
  formData: FormData,
) {
  requireLocalFeature();
  const operationId = parseOperationId(operationIdInput);
  try {
    const runtime = await createB3Sa2Runtime();
    await runtime.orchestrator.start({
      operationId,
      password: value(formData, "password"),
      targetEmail: value(formData, "targetEmail"),
    });
  } catch (error) {
    redirect(destination(operationId, status(error)));
  }
  redirect(destination(operationId, "new_email_sent"));
}

export async function verifyNewEmailAction(
  operationIdInput: string,
  formData: FormData,
) {
  requireLocalFeature();
  const operationId = parseOperationId(operationIdInput);
  try {
    const runtime = await createB3Sa2Runtime();
    await runtime.orchestrator.verifyNewEmail({
      operationId,
      otp: value(formData, "otp"),
      targetEmail: value(formData, "targetEmail"),
    });
    await runtime.supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    redirect(destination(operationId, status(error)));
  }
  redirect(
    `/auth/sign-in?next=${encodeURIComponent(`/b3-sa/email-binding/${operationId}`)}`,
  );
}

export async function completeBindingAction(
  operationIdInput: string,
  formData: FormData,
) {
  requireLocalFeature();
  const operationId = parseOperationId(operationIdInput);
  try {
    const access = await getAdminAccessContext();
    const protectedAdminReadVerified = Boolean(
      access?.capabilities.has("super_admin:operate"),
    );
    const runtime = await createB3Sa2Runtime();
    await runtime.orchestrator.complete({
      operationId,
      password: value(formData, "password"),
      protectedAdminReadVerified,
      targetEmail: value(formData, "targetEmail"),
    });
  } catch (error) {
    redirect(destination(operationId, status(error)));
  }
  redirect(destination(operationId, "completed"));
}
