import type { PublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabaseBrowseRepository } from "@fandom-harbor/database";
import { createPublicBrowseService } from "@fandom-harbor/services";

export function createPublicBrowseGateway(runtime: PublicRuntimeConfig) {
  return createPublicBrowseService(createSupabaseBrowseRepository(runtime));
}
