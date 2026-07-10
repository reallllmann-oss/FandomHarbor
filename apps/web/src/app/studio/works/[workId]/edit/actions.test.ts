import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { notFound, redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebIdentityAccess } from "../../../../../lib/identity-access";
import { createStudioDraftEditorGateway } from "../../../../../lib/studio-draft-editor";
import { submitDraftEditor } from "./actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("../../../../../lib/identity-access", () => ({
  createWebIdentityAccess: vi.fn(),
}));

vi.mock("../../../../../lib/studio-draft-editor", () => ({
  createStudioDraftEditorGateway: vi.fn(),
}));

const identity = {
  id: "20000000-0000-4000-8000-000000000003",
};

function formData() {
  const data = new FormData();
  data.set("body", "第一段\n\n第二段");
  data.set("intent", "save");
  data.set("workId", "10000000-0000-4000-8000-000000000001");
  return data;
}

function mockDependencies(
  access: ReturnType<typeof createTrustedAccessContext> | null,
) {
  vi.mocked(createWebIdentityAccess).mockResolvedValue({
    accessRepository: {
      getForIdentity: vi.fn(async () => access),
    },
    auth: {
      getSession: vi.fn(async () =>
        access ? { identity, providerAccessToken: "test" } : null,
      ),
    },
    cookieAdapter: {},
    runtime: {},
  } as never);
}

describe("save draft body Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an unauthenticated request before any write call", async () => {
    mockDependencies(null);

    await expect(submitDraftEditor({}, formData())).rejects.toThrow(
      "REDIRECT:/auth/sign-in",
    );
    expect(createStudioDraftEditorGateway).not.toHaveBeenCalled();
  });

  it("redirects a non-Author before any write call", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
      }),
    );

    await expect(submitDraftEditor({}, formData())).rejects.toThrow(
      "REDIRECT:/archive",
    );
    expect(createStudioDraftEditorGateway).not.toHaveBeenCalled();
  });

  it("passes only validated body fields for an Author and redirects on success", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    const saveBody = vi.fn(async () => ({
      chapter: {
        content: { content: [], type: "doc" },
        contentSchemaVersion: 1,
        createdAt: new Date("2026-07-01T00:00:00Z"),
        id: "11000000-0000-4000-8000-000000000001",
        position: 1,
        publishedAt: null,
        slug: "chapter-1",
        status: "draft" as const,
        title: "第一章",
        updatedAt: new Date("2026-07-01T00:00:00Z"),
        workId: "10000000-0000-4000-8000-000000000001",
      },
      created: true,
    }));
    vi.mocked(createStudioDraftEditorGateway).mockReturnValue({
      getDraft: vi.fn(),
      publishDraftWork: vi.fn(async () => null),
      saveDraftBody: saveBody,
    });

    await expect(submitDraftEditor({}, formData())).rejects.toThrow(
      "REDIRECT:/studio/works/10000000-0000-4000-8000-000000000001/edit?status=saved",
    );
    expect(saveBody).toHaveBeenCalledWith({
      body: {
        content: [
          {
            content: [{ text: "第一段", type: "text" }],
            type: "paragraph",
          },
          {
            content: [{ text: "第二段", type: "text" }],
            type: "paragraph",
          },
        ],
        type: "doc",
      },
      bodyPlainText: "第一段\n\n第二段",
      workId: "10000000-0000-4000-8000-000000000001",
    });
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it("returns Not Found when the owner-scoped draft no longer exists", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    vi.mocked(createStudioDraftEditorGateway).mockReturnValue({
      getDraft: vi.fn(),
      publishDraftWork: vi.fn(async () => null),
      saveDraftBody: vi.fn(async () => null),
    });

    await expect(submitDraftEditor({}, formData())).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it("returns an accessible failure state when persistence fails", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    vi.mocked(createStudioDraftEditorGateway).mockReturnValue({
      getDraft: vi.fn(),
      publishDraftWork: vi.fn(async () => null),
      saveDraftBody: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
    });

    await expect(submitDraftEditor({}, formData())).resolves.toEqual({
      error: "正文保存失败，没有产生部分发布状态。请稍后重试。",
    });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("publishes the current body and redirects to the public chapter page", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    const publishDraftWork = vi.fn(async () => ({
      chapter: {
        content: { content: [], type: "doc" },
        contentSchemaVersion: 1,
        createdAt: new Date("2026-07-01T00:00:00Z"),
        id: "11000000-0000-4000-8000-000000000001",
        position: 1,
        publishedAt: new Date("2026-07-01T00:00:00Z"),
        slug: "chapter-1",
        status: "published" as const,
        title: "第一章",
        updatedAt: new Date("2026-07-01T00:00:00Z"),
        workId: "10000000-0000-4000-8000-000000000001",
      },
      work: {
        categoryId: null,
        createdAt: new Date("2026-07-01T00:00:00Z"),
        id: "10000000-0000-4000-8000-000000000001",
        publishedAt: new Date("2026-07-01T00:00:00Z"),
        slug: "harbor-draft",
        status: "published" as const,
        summary: "Draft summary",
        title: "Harbor Draft",
        updatedAt: new Date("2026-07-01T00:00:00Z"),
      },
    }));
    vi.mocked(createStudioDraftEditorGateway).mockReturnValue({
      getDraft: vi.fn(),
      publishDraftWork,
      saveDraftBody: vi.fn(async () => null),
    });
    const data = formData();
    data.set("intent", "publish");

    await expect(submitDraftEditor({}, data)).rejects.toThrow(
      "REDIRECT:/works/harbor-draft/chapters/chapter-1",
    );
    expect(publishDraftWork).toHaveBeenCalledWith({
      body: {
        content: [
          {
            content: [{ text: "第一段", type: "text" }],
            type: "paragraph",
          },
          {
            content: [{ text: "第二段", type: "text" }],
            type: "paragraph",
          },
        ],
        type: "doc",
      },
      bodyPlainText: "第一段\n\n第二段",
      workId: "10000000-0000-4000-8000-000000000001",
    });
  });

  it("rejects publish when the body is empty", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    const data = formData();
    data.set("body", "   ");
    data.set("intent", "publish");
    vi.mocked(createStudioDraftEditorGateway).mockReturnValue({
      getDraft: vi.fn(),
      publishDraftWork: vi.fn(async () => null),
      saveDraftBody: vi.fn(async () => null),
    });

    await expect(submitDraftEditor({}, data)).resolves.toEqual({
      error: "发布前请先填写正文内容。",
    });
  });

  it("returns an honest publish failure when the workflow cannot complete", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    const data = formData();
    data.set("intent", "publish");
    vi.mocked(createStudioDraftEditorGateway).mockReturnValue({
      getDraft: vi.fn(),
      publishDraftWork: vi.fn(async () => {
        throw new Error("publish unavailable");
      }),
      saveDraftBody: vi.fn(async () => null),
    });

    await expect(submitDraftEditor({}, data)).resolves.toEqual({
      error: "发布未完成，当前正文已保留为草稿。请稍后重试。",
    });
  });
});
