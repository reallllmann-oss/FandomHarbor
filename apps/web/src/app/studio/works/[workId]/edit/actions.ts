"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { plainTextToContentDocument } from "../../../../../lib/content-document-text";
import { createWebIdentityAccess } from "../../../../../lib/identity-access";
import { createStudioDraftEditorGateway } from "../../../../../lib/studio-draft-editor";
import { normalizeWorkTagNames } from "../../../../../lib/work-tag-input";

export interface SaveDraftBodyActionState {
  error?: string;
}

export type StudioEditorActionState = SaveDraftBodyActionState;

const submitDraftEditorSchema = z
  .object({
    body: z.string(),
    intent: z.enum(["publish", "save"]),
    workId: z.uuid(),
  })
  .strict();

export async function submitDraftEditor(
  _state: SaveDraftBodyActionState,
  formData: FormData,
): Promise<SaveDraftBodyActionState> {
  const input = submitDraftEditorSchema.safeParse({
    body: formData.get("body"),
    intent: formData.get("intent"),
    workId: formData.get("workId"),
  });

  if (!input.success) {
    return { error: "正文保存失败。请刷新页面后重试。" };
  }

  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");

  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");

  let result;
  const body = plainTextToContentDocument(input.data.body);
  const gateway = createStudioDraftEditorGateway(
    access,
    dependencies.runtime,
    dependencies.cookieAdapter,
  );
  if (input.data.intent === "publish") {
    if (input.data.body.trim().length === 0) {
      return { error: "发布前请先填写正文内容。" };
    }

    let published;
    try {
      published = await gateway.publishDraftWork({
        body,
        bodyPlainText: input.data.body,
        workId: input.data.workId,
      });
    } catch {
      return {
        error: "发布未完成，当前正文已保留为草稿。请稍后重试。",
      };
    }
    if (published === null) notFound();

    revalidatePath(`/studio/works/${input.data.workId}/edit`);
    redirect(
      `/works/${published.work.slug}/chapters/${published.chapter.slug}`,
    );
  }

  try {
    result = await gateway.saveDraftBody({
      body,
      bodyPlainText: input.data.body,
      workId: input.data.workId,
    });
  } catch {
    return { error: "正文保存失败，没有产生部分发布状态。请稍后重试。" };
  }
  if (result === null) notFound();

  revalidatePath(`/studio/works/${input.data.workId}/edit`);
  redirect(`/studio/works/${input.data.workId}/edit?status=saved`);
}

const saveChapterSchema = z.object({
  body: z.string().max(1_000_000),
  chapterId: z.union([z.literal(""), z.uuid()]),
  title: z.string().trim().min(1).max(300),
  workId: z.uuid(),
});

export async function saveWorkChapter(
  _state: StudioEditorActionState,
  formData: FormData,
): Promise<StudioEditorActionState> {
  const input = saveChapterSchema.safeParse({
    body: formData.get("body"),
    chapterId: formData.get("chapterId"),
    title: formData.get("title"),
    workId: formData.get("workId"),
  });
  if (!input.success) return { error: "请填写有效的章节标题与正文。" };

  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");

  try {
    const gateway = createStudioDraftEditorGateway(
      access,
      dependencies.runtime,
      dependencies.cookieAdapter,
    );
    if (!gateway.saveWorkChapter)
      throw new Error("Chapter management unavailable");
    const result = await gateway.saveWorkChapter({
      body: plainTextToContentDocument(input.data.body),
      bodyPlainText: input.data.body,
      chapterId: input.data.chapterId || null,
      title: input.data.title,
      workId: input.data.workId,
    });
    if (!result) notFound();
  } catch {
    return { error: "章节保存失败，原内容未被删除。请稍后重试。" };
  }
  revalidatePath(`/studio/works/${input.data.workId}/edit`);
  redirect(`/studio/works/${input.data.workId}/edit?status=chapter-saved`);
}

const saveTagsSchema = z.object({
  tags: z.string().max(2_000),
  workId: z.uuid(),
});

export async function saveWorkTags(
  _state: StudioEditorActionState,
  formData: FormData,
): Promise<StudioEditorActionState> {
  const input = saveTagsSchema.safeParse({
    tags: formData.get("tags"),
    workId: formData.get("workId"),
  });
  if (!input.success) return { error: "标签输入无效。" };
  let tagNames;
  try {
    tagNames = normalizeWorkTagNames(input.data.tags);
  } catch {
    return { error: "最多 20 个标签，每个标签不超过 80 个字符。" };
  }

  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");
  try {
    const gateway = createStudioDraftEditorGateway(
      access,
      dependencies.runtime,
      dependencies.cookieAdapter,
    );
    if (!gateway.saveWorkTags) throw new Error("Tag management unavailable");
    const result = await gateway.saveWorkTags({
      tagNames,
      workId: input.data.workId,
    });
    if (!result) notFound();
  } catch {
    return { error: "标签保存失败。请检查是否存在重复标签后重试。" };
  }
  revalidatePath(`/studio/works/${input.data.workId}/edit`);
  revalidatePath(`/works`);
  redirect(`/studio/works/${input.data.workId}/edit?status=tags-saved`);
}

const publishChaptersSchema = z.object({ workId: z.uuid() });

export async function publishWorkChapters(
  _state: StudioEditorActionState,
  formData: FormData,
): Promise<StudioEditorActionState> {
  const input = publishChaptersSchema.safeParse({
    workId: formData.get("workId"),
  });
  const chapterIds = formData
    .getAll("chapterIds")
    .filter((value): value is string => typeof value === "string");
  const parsedChapterIds = z
    .array(z.uuid())
    .min(1)
    .max(100)
    .safeParse(chapterIds);
  if (!input.success || !parsedChapterIds.success) {
    return { error: "请至少选择一个要发布的章节。" };
  }
  const dependencies = await createWebIdentityAccess();
  const session = await dependencies.auth.getSession();
  if (!session) redirect("/auth/sign-in");
  const access = await dependencies.accessRepository.getForIdentity(
    session.identity,
  );
  if (!access.capabilities.has("work:author")) redirect("/archive");
  try {
    const gateway = createStudioDraftEditorGateway(
      access,
      dependencies.runtime,
      dependencies.cookieAdapter,
    );
    if (!gateway.publishWorkChapters) {
      throw new Error("Chapter publication management unavailable");
    }
    const result = await gateway.publishWorkChapters({
      chapterIds: parsedChapterIds.data,
      workId: input.data.workId,
    });
    if (!result) notFound();
  } catch {
    return { error: "发布选择未能完整保存，请刷新后核对章节状态。" };
  }
  revalidatePath(`/studio/works/${input.data.workId}/edit`);
  revalidatePath(`/studio/works`);
  revalidatePath(`/works`);
  redirect(`/studio/works/${input.data.workId}/edit?status=published`);
}
