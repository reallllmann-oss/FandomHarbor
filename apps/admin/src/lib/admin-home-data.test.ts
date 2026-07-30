import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { SITE_COPY_FIELD_IDS } from "@fandom-harbor/services";
import { describe, expect, it, vi } from "vitest";

import {
  ADMIN_SITE_COPY_GROUPS,
  adminSiteCopyFieldIds,
  formatSiteCopyVersion,
  loadAdminHomeData,
} from "./admin-home-data";

const identity = {
  id: "20000000-0000-4000-8000-000000000011",
};

const snapshot = {
  auditLogId: 9007199254740993n,
  content: {
    footer_brand_note: "Fandom Harbor · 私域作品归档",
    homepage_introduction:
      "一座为公开故事发现与长久阅读保留安静位置的文学港湾。",
    homepage_primary_cta_label: "浏览公开作品",
    homepage_secondary_cta_label: "查找作品与作者",
    homepage_title: "Fandom Harbor",
    navigation_archive_label: "Archive",
    navigation_search_label: "Search",
    navigation_studio_label: "Studio",
  },
  lastActorUserId: null,
  lastChangeReason: "DATA-01 site copy baseline initialization",
  revisionId: "30000000-0000-4000-8000-000000000011",
  updatedAt: new Date("2026-07-30T08:00:00.000Z"),
  version: 9007199254740993n,
};

describe("Admin read-only Site Copy data", () => {
  it("stops an anonymous visitor before the Site Copy read", async () => {
    const readSiteCopy = vi.fn();

    await expect(
      loadAdminHomeData({
        getAccessContext: vi.fn(async () => null),
        readSiteCopy,
      }),
    ).resolves.toEqual({ status: "unauthenticated" });
    expect(readSiteCopy).not.toHaveBeenCalled();
  });

  it.each([
    { membershipState: "active", role: undefined },
    { membershipState: "active", role: "author" },
    { membershipState: "suspended", role: "admin" },
    { membershipState: "revoked", role: "super_admin" },
  ] as const)(
    "stops $membershipState $role before the Site Copy read",
    async ({ membershipState, role }) => {
      const deniedAccess = createTrustedAccessContext({
        identity,
        membershipState,
        roles: role ? [role] : [],
      });
      const readSiteCopy = vi.fn();

      await expect(
        loadAdminHomeData({
          getAccessContext: vi.fn(async () => deniedAccess),
          readSiteCopy,
        }),
      ).resolves.toEqual({ status: "forbidden" });
      expect(readSiteCopy).not.toHaveBeenCalled();
    },
  );

  it.each(["admin", "super_admin"] as const)(
    "reads the strict Admin snapshot for an active %s",
    async (role) => {
      const access = createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: [role],
      });
      const readSiteCopy = vi.fn(async () => snapshot);

      await expect(
        loadAdminHomeData({
          getAccessContext: vi.fn(async () => access),
          readSiteCopy,
        }),
      ).resolves.toEqual({
        access,
        snapshot,
        status: "ready",
      });
      expect(readSiteCopy).toHaveBeenCalledWith(access);
    },
  );

  it("defines each of the exact eight fields once", () => {
    const groupedFields = ADMIN_SITE_COPY_GROUPS.flatMap((group) =>
      group.fields.map(([field]) => field),
    );

    expect(groupedFields).toHaveLength(8);
    expect(new Set(groupedFields).size).toBe(8);
    expect(adminSiteCopyFieldIds()).toEqual(SITE_COPY_FIELD_IDS);
  });

  it("formats a bigint Version without a JavaScript number conversion", () => {
    expect(formatSiteCopyVersion(9007199254740993n)).toBe("9007199254740993");
  });
});
