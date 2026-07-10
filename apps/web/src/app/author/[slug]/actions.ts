"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createWebIdentityAccess } from "../../../lib/identity-access";
import { createAuthorizedSocialRelationshipGateway } from "../../../lib/social-relationships";

export interface FollowAuthorActionState {
  error?: string;
}

export async function setAuthorFollowState(
  authorUserId: string,
  authorSlug: string,
  _state: FollowAuthorActionState,
  formData: FormData,
): Promise<FollowAuthorActionState> {
  const input = z
    .object({
      authorSlug: z.string().min(3).max(80),
      authorUserId: z.uuid(),
      intent: z.enum(["follow", "unfollow"]),
    })
    .safeParse({
      authorSlug,
      authorUserId,
      intent: formData.get("intent"),
    });
  if (!input.success) return { error: "关注请求无效，请刷新页面后重试。" };

  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect(`/auth/sign-in?next=/author/${input.data.authorSlug}`);

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("archive:read")) redirect("/access");

  const gateway = createAuthorizedSocialRelationshipGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  );
  try {
    if (input.data.intent === "follow") {
      await gateway.followAuthor(input.data.authorUserId);
    } else {
      await gateway.unfollowAuthor(input.data.authorUserId);
    }
  } catch {
    return { error: "关注状态更新失败，请稍后重试。" };
  }

  revalidatePath(`/author/${input.data.authorSlug}`);
  return {};
}
