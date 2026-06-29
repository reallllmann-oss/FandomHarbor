"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createWebIdentityAccess } from "../../../lib/identity-access";

export interface InvitationActionState {
  error?: string;
  invitation?: { id: string; secret: string };
}

async function requireAuthor() {
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");
  return dependencies.identityAccess;
}

export async function createInvitation(
  _state: InvitationActionState,
  formData: FormData,
): Promise<InvitationActionState> {
  const input = z
    .object({
      expiresAt: z.coerce.date(),
      maxUses: z.coerce.number().int().positive(),
    })
    .safeParse({
      expiresAt: formData.get("expiresAt"),
      maxUses: formData.get("maxUses"),
    });

  if (!input.success || input.data.expiresAt.getTime() <= Date.now()) {
    return { error: "请输入有效的次数和未来过期时间。" };
  }

  try {
    const invitation = await (
      await requireAuthor()
    ).createInvitation(input.data);
    return { invitation };
  } catch {
    return { error: "邀请码创建失败，未产生部分记录。" };
  }
}

export async function revokeInvitation(formData: FormData) {
  const input = z
    .object({
      invitationId: z.uuid(),
      reason: z.string().trim().min(1).max(1000),
    })
    .safeParse({
      invitationId: formData.get("invitationId"),
      reason: formData.get("reason"),
    });
  if (!input.success) redirect("/author/invitations?error=invalid");

  try {
    await (await requireAuthor()).revokeInvitation(input.data);
  } catch {
    redirect("/author/invitations?error=denied");
  }
  redirect("/author/invitations?status=revoked");
}
