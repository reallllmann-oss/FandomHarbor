import type { SiteCopyFieldId } from "@fandom-harbor/services";

export const ADMIN_SITE_COPY_GROUPS = [
  {
    description: "首页访客可见的标题、介绍与两个入口标签。",
    fields: [
      ["homepage_title", "可见主标题"],
      ["homepage_introduction", "介绍文字"],
      ["homepage_primary_cta_label", "主要按钮显示文案"],
      ["homepage_secondary_cta_label", "次要按钮显示文案"],
    ],
    title: "首页",
  },
  {
    description:
      "仅编辑名称。顺序固定为归档 → 搜索 → 创作中心，路径与可见性规则保持锁定。",
    fields: [
      ["navigation_archive_label", "归档入口显示名称"],
      ["navigation_search_label", "搜索入口显示名称"],
      ["navigation_studio_label", "创作中心入口显示名称"],
    ],
    title: "导航",
  },
  {
    description: "只编辑品牌说明；页脚法务链接、路径和存在性不在可编辑范围。",
    fields: [["footer_brand_note", "品牌说明"]],
    title: "页脚",
  },
] as const satisfies readonly {
  description: string;
  fields: readonly (readonly [SiteCopyFieldId, string])[];
  title: string;
}[];
