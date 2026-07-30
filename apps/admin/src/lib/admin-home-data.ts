import type { TrustedAccessContext } from "@fandom-harbor/auth";
import {
  SITE_COPY_FIELD_IDS,
  type AdminSiteCopySnapshot,
  type SiteCopyFieldId,
} from "@fandom-harbor/services";

import { getAdminAccessContext } from "./identity-access";
import { readAdminSiteCopy } from "./site-copy";
import { ADMIN_SITE_COPY_GROUPS } from "./site-copy-fields";

interface AdminHomeDependencies {
  getAccessContext(): Promise<TrustedAccessContext | null>;
  readSiteCopy(access: TrustedAccessContext): Promise<AdminSiteCopySnapshot>;
}

type AdminHomeData =
  | { status: "forbidden" | "unauthenticated" }
  | {
      access: TrustedAccessContext;
      snapshot: AdminSiteCopySnapshot;
      status: "ready";
    };

const defaultDependencies: AdminHomeDependencies = {
  getAccessContext: getAdminAccessContext,
  readSiteCopy: readAdminSiteCopy,
};

export async function loadAdminHomeData(
  dependencies: AdminHomeDependencies = defaultDependencies,
): Promise<AdminHomeData> {
  const access = await dependencies.getAccessContext();
  if (!access) return { status: "unauthenticated" };
  if (!access.capabilities.has("admin:operate")) {
    return { status: "forbidden" };
  }

  return {
    access,
    snapshot: await dependencies.readSiteCopy(access),
    status: "ready",
  };
}

export function formatSiteCopyVersion(version: bigint): string {
  return version.toString(10);
}

export function adminSiteCopyFieldIds(): readonly SiteCopyFieldId[] {
  const fields = ADMIN_SITE_COPY_GROUPS.flatMap((group) =>
    group.fields.map(([field]) => field),
  );

  return SITE_COPY_FIELD_IDS.filter((field) => fields.includes(field));
}
