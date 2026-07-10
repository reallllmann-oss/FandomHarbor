import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebIdentityAccess } from "../../../../lib/identity-access";
import { createStudioWorkDraftGateway } from "../../../../lib/studio-work-drafts";
import { createWorkDraft } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("../../../../lib/identity-access", () => ({
  createWebIdentityAccess: vi.fn(),
}));

vi.mock("../../../../lib/studio-work-drafts", () => ({
  createStudioWorkDraftGateway: vi.fn(),
}));

const identity = {
  id: "20000000-0000-4000-8000-000000000003",
};

function formData() {
  const data = new FormData();
  data.set("categoryId", "21000000-0000-4000-8000-000000000001");
  data.set("summary", "Draft summary");
  data.append("tagIds", "22000000-0000-4000-8000-000000000001");
  data.set("title", "Harbor Draft");
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

describe("create Work draft Server Action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an unauthenticated request before creating a gateway", async () => {
    mockDependencies(null);

    await expect(createWorkDraft({}, formData())).rejects.toThrow(
      "REDIRECT:/auth/sign-in",
    );
    expect(createStudioWorkDraftGateway).not.toHaveBeenCalled();
  });

  it("redirects a non-Author before any write call", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
      }),
    );

    await expect(createWorkDraft({}, formData())).rejects.toThrow(
      "REDIRECT:/archive",
    );
    expect(createStudioWorkDraftGateway).not.toHaveBeenCalled();
  });

  it("passes only validated draft fields for an Author and redirects on success", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    const createDraft = vi.fn(async () => ({
      categoryId: "21000000-0000-4000-8000-000000000001",
      createdAt: new Date("2026-07-01T00:00:00Z"),
      id: "10000000-0000-4000-8000-000000000001",
      publishedAt: null,
      slug: "work-10000000-0000-4000-8000-000000000001",
      status: "draft" as const,
      summary: "Draft summary",
      title: "Harbor Draft",
      updatedAt: new Date("2026-07-01T00:00:00Z"),
    }));
    vi.mocked(createStudioWorkDraftGateway).mockReturnValue({
      createWorkDraft: createDraft,
      listFormMetadata: vi.fn(),
    });

    await expect(createWorkDraft({}, formData())).rejects.toThrow(
      "REDIRECT:/studio/works/10000000-0000-4000-8000-000000000001/edit",
    );
    expect(createDraft).toHaveBeenCalledWith({
      categoryId: "21000000-0000-4000-8000-000000000001",
      summary: "Draft summary",
      tagIds: ["22000000-0000-4000-8000-000000000001"],
      title: "Harbor Draft",
    });
    expect(redirect).toHaveBeenCalledTimes(1);
  });

  it("returns an accessible failure state when persistence fails", async () => {
    mockDependencies(
      createTrustedAccessContext({
        identity,
        membershipState: "active",
        roles: ["author"],
      }),
    );
    vi.mocked(createStudioWorkDraftGateway).mockReturnValue({
      createWorkDraft: vi.fn(async () => {
        throw new Error("database unavailable");
      }),
      listFormMetadata: vi.fn(),
    });

    await expect(createWorkDraft({}, formData())).resolves.toEqual({
      error: "草稿保存失败，没有产生部分记录。请稍后重试。",
    });
    expect(redirect).not.toHaveBeenCalled();
  });
});
