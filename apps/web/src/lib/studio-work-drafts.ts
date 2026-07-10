import type {
  AuthCookieStore,
  TrustedAccessContext,
} from "@fandom-harbor/auth";
import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import {
  createSupabaseAuthorWorkDraftRepository,
  createSupabaseContentRepository,
} from "@fandom-harbor/database";
import {
  createContentService,
  createWorkDraftService,
  type CreateWorkDraftInput,
} from "@fandom-harbor/services";

export function createStudioWorkDraftGateway(
  access: TrustedAccessContext,
  runtime: PublicRuntimeConfig,
  cookies: AuthCookieStore,
) {
  const content = createContentService(
    createSupabaseContentRepository(runtime, cookies),
  );
  const drafts = createWorkDraftService(
    createSupabaseAuthorWorkDraftRepository(runtime, cookies),
  );

  return {
    createWorkDraft(input: CreateWorkDraftInput) {
      return drafts.createWorkDraft(access, input);
    },
    async listFormMetadata() {
      const [categories, tags] = await Promise.all([
        content.listCategories(access),
        content.listTags(access),
      ]);
      return { categories, tags };
    },
  };
}
