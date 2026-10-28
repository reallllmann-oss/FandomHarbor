"use server";

import { redirect } from "next/navigation";
import { PreviewSessionError } from "../../../lib/preview-session-acceptance";
import { createPreviewSessionRuntime } from "../../../lib/preview-session-runtime";

export async function verifyPreviewSessionTotp(
  sessionId: string,
  form: FormData,
) {
  const factorId = form.get("factorId");
  const code = form.get("code");
  try {
    const service = await createPreviewSessionRuntime();
    if (typeof factorId !== "string" || typeof code !== "string")
      throw new PreviewSessionError("MFA_REJECTED");
    await service.verify(sessionId, factorId, code);
  } catch {
    redirect("/auth/preview-session?status=MFA_REJECTED");
  }
  redirect("/auth/preview-session");
}

export async function endPreviewSession(sessionId: string) {
  try {
    await (await createPreviewSessionRuntime()).logout(sessionId);
  } catch {
    redirect("/auth/sign-in?session_status=logout-unconfirmed");
  }
  redirect("/auth/sign-in?session_status=ended");
}
