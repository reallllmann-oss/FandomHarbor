import type { TrustedAccessContext } from "@fandom-harbor/auth";
import {
  SITE_COPY_FIELD_IDS,
  type AdminSiteCopySnapshot,
  type SiteCopyFieldId,
} from "@fandom-harbor/services";

import { getAdminAccessContext } from "./identity-access";
import { readAdminSiteCopy } from "./site-copy";

export const ADMIN_SITE_COPY_GROUPS = [
  {
    description: "首页访客可见的标题、介绍与两个入口标签。",
    fields: [
      ["homepage_title", "可见主标题"],
      ["homepage_introduction", "介绍文字"],
      ["homepage_primary_cta_label", "主 CTA 显示文案"],
      ["homepage_secondary_cta_label", "次 CTA 显示文案"],
    ],
    title: "Homepage",
  },
  {
    description:
      "仅展示名称。顺序固定为 Archive → Search → Studio，路径与可见性规则保持锁定。",
    fields: [
      ["navigation_archive_label", "Archive 显示名称"],
      ["navigation_search_label", "Search 显示名称"],
      ["navigation_studio_label", "Studio 显示名称"],
    ],
    title: "Navigation",
  },
  {
    description:
      "只包含品牌说明；Footer 法务链接、路径和存在性不在可编辑范围。",
    fields: [["footer_brand_note", "品牌说明"]],
    title: "Footer",
  },
] as const satisfies readonly {
  description: string;
  fields: readonly (readonly [SiteCopyFieldId, string])[];
  title: string;
}[];

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
