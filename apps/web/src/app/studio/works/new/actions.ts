"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createWebIdentityAccess } from "../../../../lib/identity-access";
import { createStudioWorkDraftGateway } from "../../../../lib/studio-work-drafts";

export interface CreateWorkDraftActionState {
  error?: string;
}

const createWorkDraftSchema = z
  .object({
    categoryId: z
      .union([z.literal(""), z.uuid()])
      .transform((value) => (value === "" ? null : value)),
    summary: z.string().max(5000),
    tagIds: z.array(z.uuid()).max(100),
    title: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .refine((value) => !/[\u0000-\u001f\u007f]/u.test(value)),
  })
  .strict();

export async function createWorkDraft(
  _state: CreateWorkDraftActionState,
  formData: FormData,
): Promise<CreateWorkDraftActionState> {
  const input = createWorkDraftSchema.safeParse({
    categoryId: formData.get("categoryId"),
    summary: formData.get("summary"),
    tagIds: formData.getAll("tagIds"),
    title: formData.get("title"),
  });

  if (!input.success) {
    return { error: "请检查作品标题、简介、分类和标签后重试。" };
  }

  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");

  let work;
  try {
    work = await createStudioWorkDraftGateway(
      access,
      dependencies.runtime,
      dependencies.cookieAdapter,
    ).createWorkDraft(input.data);
  } catch {
    return {
      error: "草稿保存失败，没有产生部分记录。请稍后重试。",
    };
  }

  redirect(`/studio/works/${work.id}/edit`);
}
