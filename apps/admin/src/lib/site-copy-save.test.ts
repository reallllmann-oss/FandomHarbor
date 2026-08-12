import {
  createTrustedAccessContext,
  type ElevatedRole,
  type MembershipState,
  type TrustedAccessContext,
} from "@fandom-harbor/auth";
import {
  SITE_COPY_BASELINE_V1,
  SiteCopyDomainError,
  type AdminSiteCopySaveInput,
  type AdminSiteCopySaveResult,
} from "@fandom-harbor/services";
import { describe, expect, it, vi } from "vitest";

import { executeSiteCopySave } from "./site-copy-save";

const identity = {
  id: "20000000-0000-4000-8000-000000000011",
};
const requestId = "40000000-0000-4000-8000-000000000011";
const baseRevisionId = "30000000-0000-4000-8000-000000000011";

function access(membershipState: MembershipState, roles: ElevatedRole[]) {
  return createTrustedAccessContext({ identity, membershipState, roles });
}

function saveForm(overrides: Record<string, string> = {}) {
  const values = {
    ...SITE_COPY_BASELINE_V1,
    baseRevisionId,
    baseVersion: "9007199254740993",
    reason: "更新站点文案",
    requestId,
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

describe("ADMIN-02 Site Copy Server Action contract", () => {
  it("rejects anon before the save dependency", async () => {
    const save = vi.fn();

    await expect(
      executeSiteCopySave(saveForm(), {
        getAccessContext: vi.fn(async () => null),
        save,
      }),
    ).resolves.toMatchObject({
      code: "UNAUTHENTICATED",
      status: "error",
    });
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    ["Reader", "active", []],
    ["Author", "active", ["author"]],
    ["Suspended Admin", "suspended", ["admin"]],
    ["Revoked Admin", "revoked", ["admin"]],
    ["Revoked Super Admin", "revoked", ["super_admin"]],
  ] as const)(
    "rejects %s before the save dependency",
    async (_label, membershipState, roles) => {
      const save = vi.fn();

      await expect(
        executeSiteCopySave(saveForm(), {
          getAccessContext: vi.fn(async () =>
            access(membershipState, [...roles]),
          ),
          save,
        }),
      ).resolves.toMatchObject({
        code: "FORBIDDEN",
        status: "error",
      });
      expect(save).not.toHaveBeenCalled();
    },
  );

  it.each(["admin", "super_admin"] as const)(
    "allows active %s and passes a strict normalized input",
    async (role) => {
      const currentAccess = access("active", [role]);
      const save = vi.fn(async () => ({
        auditLogId: 9007199254740994n,
        changedFields: ["homepage_title" as const],
        revisionId: "30000000-0000-4000-8000-000000000012",
        status: "saved" as const,
        updatedAt: new Date("2026-07-31T00:00:00.000Z"),
        version: 9007199254740994n,
      }));

      await expect(
        executeSiteCopySave(
          saveForm({
            homepage_title: "  Fandom Harbor Library  ",
            reason: "  更新首页标题  ",
          }),
          {
            getAccessContext: vi.fn(async () => currentAccess),
            save,
          },
        ),
      ).resolves.toEqual({
        auditLogId: "9007199254740994",
        changedFields: ["homepage_title"],
        requestId,
        revisionId: "30000000-0000-4000-8000-000000000012",
        status: "saved",
        updatedAt: "2026-07-31T00:00:00.000Z",
        version: "9007199254740994",
      });
      expect(save).toHaveBeenCalledWith(currentAccess, {
        baseRevisionId,
        baseVersion: 9007199254740993n,
        content: {
          ...SITE_COPY_BASELINE_V1,
          homepage_title: "Fandom Harbor Library",
        },
        reason: "更新首页标题",
        requestId,
      });
    },
  );

  it("maps Unchanged without fabricating an Audit ID", async () => {
    const result = await executeSiteCopySave(saveForm(), {
      getAccessContext: vi.fn(async () => access("active", ["admin"])),
      save: vi.fn(async () => ({
        revisionId: baseRevisionId,
        status: "unchanged" as const,
        version: 9007199254740993n,
      })),
    });

    expect(result).toEqual({
      requestId,
      revisionId: baseRevisionId,
      status: "unchanged",
      version: "9007199254740993",
    });
    expect(result).not.toHaveProperty("auditLogId");
  });

  it("maps Conflict without retrying or converting it to success", async () => {
    const save = vi.fn(async () => ({
      currentRevisionId: "30000000-0000-4000-8000-000000000099",
      currentVersion: 9007199254740099n,
      status: "conflict" as const,
    }));

    await expect(
      executeSiteCopySave(saveForm(), {
        getAccessContext: vi.fn(async () => access("active", ["admin"])),
        save,
      }),
    ).resolves.toEqual({
      currentRevisionId: "30000000-0000-4000-8000-000000000099",
      currentVersion: "9007199254740099",
      requestId,
      status: "conflict",
    });
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("keeps the same request identity and payload on a safe retry", async () => {
    const save = vi.fn(
      async (
        currentAccess: TrustedAccessContext,
        input: AdminSiteCopySaveInput,
      ): Promise<AdminSiteCopySaveResult> => {
        void currentAccess;
        void input;
        return {
          auditLogId: 2n,
          changedFields: ["homepage_title"],
          revisionId: "30000000-0000-4000-8000-000000000012",
          status: "saved",
          updatedAt: new Date("2026-07-31T00:00:00.000Z"),
          version: 2n,
        };
      },
    );
    const dependencies = {
      getAccessContext: vi.fn(async () => access("active", ["admin"])),
      save,
    };
    const form = saveForm({ homepage_title: "Fandom Harbor Library" });

    await executeSiteCopySave(form, dependencies);
    await executeSiteCopySave(form, dependencies);

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[0]?.[1]).toEqual(save.mock.calls[1]?.[1]);
    expect(save.mock.calls[1]?.[1].requestId).toBe(requestId);
  });

  it("preserves stable INVALID_INPUT for a reused request with different payload", async () => {
    const save = vi
      .fn()
      .mockResolvedValueOnce({
        auditLogId: 2n,
        changedFields: ["homepage_title"],
        revisionId: "30000000-0000-4000-8000-000000000012",
        status: "saved",
        updatedAt: new Date("2026-07-31T00:00:00.000Z"),
        version: 2n,
      })
      .mockRejectedValueOnce(
        new SiteCopyDomainError("INVALID_INPUT", "database detail"),
      );
    const dependencies = {
      getAccessContext: vi.fn(async () => access("active", ["admin"])),
      save,
    };

    await executeSiteCopySave(
      saveForm({ homepage_title: "Harbor One" }),
      dependencies,
    );
    const second = await executeSiteCopySave(
      saveForm({ homepage_title: "Harbor Two" }),
      dependencies,
    );

    expect(second).toMatchObject({
      code: "INVALID_INPUT",
      requestId,
      status: "error",
    });
    expect(JSON.stringify(second)).not.toContain("database detail");
  });

  it.each([
    ["reason length 3", { reason: "理由短" }],
    ["reason length 201", { reason: "理".repeat(201) }],
    ["reason newline", { reason: "有效\n原因" }],
    ["invalid UUID", { requestId: "not-a-uuid" }],
    ["nil request UUID", { requestId: "00000000-0000-0000-0000-000000000000" }],
    ["negative Version", { baseVersion: "-1" }],
    ["fractional Version", { baseVersion: "1.5" }],
    ["noncanonical Version", { baseVersion: "01" }],
    ["field newline", { homepage_title: "Harbor\nTitle" }],
    ["field too long", { navigation_search_label: "文".repeat(13) }],
  ])("rejects %s before save", async (_label, overrides) => {
    const save = vi.fn();

    await expect(
      executeSiteCopySave(saveForm(overrides), {
        getAccessContext: vi.fn(async () => access("active", ["admin"])),
        save,
      }),
    ).resolves.toMatchObject({
      code: "INVALID_INPUT",
      status: "error",
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("accepts reason 4 and 200 and an arbitrarily large bigint Version", async () => {
    const save = vi.fn(
      async (
        _currentAccess: TrustedAccessContext,
        input: AdminSiteCopySaveInput,
      ): Promise<AdminSiteCopySaveResult> => ({
        revisionId: input.baseRevisionId,
        status: "unchanged",
        version: input.baseVersion,
      }),
    );
    const dependencies = {
      getAccessContext: vi.fn(async () => access("active", ["admin"])),
      save,
    };

    await executeSiteCopySave(
      saveForm({
        baseVersion: "9007199254740993123456789",
        reason: "四字原因",
      }),
      dependencies,
    );
    await executeSiteCopySave(
      saveForm({ reason: "理".repeat(200) }),
      dependencies,
    );

    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[0]?.[1].baseVersion).toBe(
      9007199254740993123456789n,
    );
  });

  it("never leaks raw repository errors or internal metadata", async () => {
    const result = await executeSiteCopySave(saveForm(), {
      getAccessContext: vi.fn(async () => access("active", ["admin"])),
      save: vi.fn(async () => {
        throw new Error(
          "postgres://secret@internal hint=site_copy_revisions token=abc",
        );
      }),
    });

    expect(result).toMatchObject({
      code: "UNKNOWN_REPOSITORY_ERROR",
      status: "error",
    });
    expect(JSON.stringify(result)).not.toMatch(
      /postgres|secret|hint|revision|token/iu,
    );
  });

  it("ignores unknown locked-boundary fields instead of passing them to Domain save", async () => {
    const save = vi.fn(
      async (
        _currentAccess: TrustedAccessContext,
        input: AdminSiteCopySaveInput,
      ): Promise<AdminSiteCopySaveResult> => ({
        revisionId: input.baseRevisionId,
        status: "unchanged",
        version: input.baseVersion,
      }),
    );
    const form = saveForm();
    form.set("navigation_order", "Studio,Archive,Search");
    form.set("primary_cta_path", "/unsafe");
    form.set("studio_visible", "false");
    form.set("footer_legal_links", "removed");

    await executeSiteCopySave(form, {
      getAccessContext: vi.fn(async () => access("active", ["admin"])),
      save,
    });

    expect(save).toHaveBeenCalledTimes(1);
    expect(Object.keys(save.mock.calls[0]?.[1].content ?? {}).sort()).toEqual(
      Object.keys(SITE_COPY_BASELINE_V1).sort(),
    );
    expect(save.mock.calls[0]?.[1]).not.toHaveProperty("navigation_order");
    expect(save.mock.calls[0]?.[1]).not.toHaveProperty("primary_cta_path");
  });
});
