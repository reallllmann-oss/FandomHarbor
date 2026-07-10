import { createTrustedAccessContext } from "@fandom-harbor/auth";
import { ContentAuthorizationError } from "@fandom-harbor/services";
import { describe, expect, it } from "vitest";

import { createStudioContentGateway } from "./studio-content";

const identity = {
  id: "30000000-0000-4000-8000-000000000002",
};

describe("studio content gateway", () => {
  it("lists author fixture works and articles in most-recent order", async () => {
    const access = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });
    const gateway = createStudioContentGateway(access);

    const works = await gateway.listWorks();
    expect(works).toHaveLength(4);
    expect(works.slice(0, 3)).toMatchObject([
      { slug: "paper-moons", status: "draft" },
      { slug: "unlit-margins", status: "draft" },
      { slug: "glass-harbor", status: "published" },
    ]);
    await expect(gateway.listArticles()).resolves.toMatchObject([
      { slug: "notes-from-the-breakwater", status: "draft" },
      { slug: "why-an-archive-needs-quiet", status: "published" },
    ]);
  });

  it("reuses the existing author capability instead of a Studio role", async () => {
    const reader = createTrustedAccessContext({
      identity,
      membershipState: "active",
    });

    await expect(
      createStudioContentGateway(reader).listWorks(),
    ).rejects.toBeInstanceOf(ContentAuthorizationError);
  });

  it("loads an owner-scoped work detail with published and draft chapters", async () => {
    const access = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });
    const gateway = createStudioContentGateway(access);

    await expect(
      gateway.getWork("33000000-0000-4000-8000-000000000001"),
    ).resolves.toMatchObject({
      chapters: [
        { position: 1, status: "published" },
        { position: 2, status: "published" },
        { position: 3, status: "draft" },
      ],
      work: { slug: "glass-harbor", status: "published" },
    });
    await expect(
      gateway.getWork("33000000-0000-4000-8000-000000000003"),
    ).resolves.toMatchObject({
      chapters: [],
      work: { slug: "paper-moons", status: "draft" },
    });
    await expect(
      gateway.getWork("33000000-0000-4000-8000-000000000004"),
    ).resolves.toMatchObject({
      chapters: [{ position: 1, status: "draft" }],
      work: { slug: "unlit-margins", status: "draft" },
    });
  });

  it("loads owner-scoped published and draft article details", async () => {
    const access = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });
    const gateway = createStudioContentGateway(access);

    await expect(
      gateway.getArticle("35000000-0000-4000-8000-000000000001"),
    ).resolves.toMatchObject({
      article: { slug: "why-an-archive-needs-quiet", status: "published" },
      categoryName: "创作随笔",
      relatedWorkTitle: null,
      tagNames: [],
    });
    await expect(
      gateway.getArticle("35000000-0000-4000-8000-000000000002"),
    ).resolves.toMatchObject({
      article: { slug: "notes-from-the-breakwater", status: "draft" },
      categoryName: null,
      relatedWorkTitle: null,
      tagNames: [],
    });
  });

  it("returns no Studio content for a different trusted author", async () => {
    const otherAuthor = createTrustedAccessContext({
      identity: { ...identity, id: "30000000-0000-4000-8000-000000000099" },
      membershipState: "active",
      roles: ["author"],
    });
    const gateway = createStudioContentGateway(otherAuthor);

    await expect(
      gateway.getArticle("35000000-0000-4000-8000-000000000001"),
    ).resolves.toBeNull();
    await expect(
      gateway.getWork("33000000-0000-4000-8000-000000000001"),
    ).resolves.toBeNull();
    await expect(gateway.listWorks()).resolves.toEqual([]);
    await expect(gateway.listArticles()).resolves.toEqual([]);
  });

  it("returns null for an unknown owner-scoped work ID", async () => {
    const access = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });

    await expect(
      createStudioContentGateway(access).getWork("missing-work"),
    ).resolves.toBeNull();
  });

  it("returns null for an unknown owner-scoped article ID", async () => {
    const access = createTrustedAccessContext({
      identity,
      membershipState: "active",
      roles: ["author"],
    });

    await expect(
      createStudioContentGateway(access).getArticle("missing-article"),
    ).resolves.toBeNull();
  });
});
