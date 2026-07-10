import type {
  AuthCookieStore,
  TrustedAccessContext,
} from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseDraftWorkEditorRepository } from "@fandom-harbor/database";
import {
  createDraftWorkEditorService,
  type ContentTag,
  type DraftWorkEditorData,
  type PublishDraftWorkInput,
  type PublishDraftWorkResult,
  type PublishWorkChaptersInput,
  type SaveDraftWorkBodyInput,
  type SaveDraftWorkBodyResult,
  type SaveWorkChapterInput,
  type SaveWorkTagsInput,
} from "@fandom-harbor/services";

export interface StudioDraftEditorGateway {
  getDraft(workId: string): Promise<DraftWorkEditorData | null>;
  publishDraftWork(
    input: PublishDraftWorkInput,
  ): Promise<PublishDraftWorkResult | null>;
  publishWorkChapters?(
    input: PublishWorkChaptersInput,
  ): Promise<DraftWorkEditorData | null>;
  saveDraftBody(
    input: SaveDraftWorkBodyInput,
  ): Promise<SaveDraftWorkBodyResult | null>;
  saveWorkChapter?(
    input: SaveWorkChapterInput,
  ): Promise<SaveDraftWorkBodyResult | null>;
  saveWorkTags?(input: SaveWorkTagsInput): Promise<ContentTag[] | null>;
}

export function createStudioDraftEditorGateway(
  access: TrustedAccessContext,
  runtime: PublicRuntimeConfig,
  cookies: AuthCookieStore,
): StudioDraftEditorGateway {
  const service = createDraftWorkEditorService(
    createSupabaseDraftWorkEditorRepository(runtime, cookies),
  );

  return {
    getDraft(workId: string) {
      return service.getDraftWorkEditor(access, workId);
    },
    saveDraftBody(input: SaveDraftWorkBodyInput) {
      return service.saveDraftWorkBody(access, input);
    },
    publishDraftWork(input: PublishDraftWorkInput) {
      return service.publishDraftWork(access, input);
    },
    publishWorkChapters(input: PublishWorkChaptersInput) {
      return service.publishWorkChapters(access, input);
    },
    saveWorkChapter(input: SaveWorkChapterInput) {
      return service.saveWorkChapter(access, input);
    },
    saveWorkTags(input: SaveWorkTagsInput) {
      return service.saveWorkTags(access, input);
    },
  };
}
