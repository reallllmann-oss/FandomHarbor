import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import { createSupabasePublicSiteCopyRepository } from "@fandom-harbor/database";
import {
  createPublicSiteCopyService,
  type PublicSiteCopyStore,
} from "@fandom-harbor/services";
import { cache } from "react";

export function createWebPublicSiteCopyReader(store: PublicSiteCopyStore) {
  return createPublicSiteCopyService(store);
}

async function readCurrentPublicSiteCopy() {
  const repository = createSupabasePublicSiteCopyRepository(
    readPublicRuntimeConfig(),
  );
  return createWebPublicSiteCopyReader(repository).read();
}

export const readWebPublicSiteCopy = cache(readCurrentPublicSiteCopy);
