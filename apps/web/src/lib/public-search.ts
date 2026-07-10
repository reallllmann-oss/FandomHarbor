import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseSearchRepository } from "@fandom-harbor/database";
import { createPublicSearchService } from "@fandom-harbor/services";

export function createPublicSearchGateway(runtime: PublicRuntimeConfig) {
  return createPublicSearchService(createSupabaseSearchRepository(runtime));
}
