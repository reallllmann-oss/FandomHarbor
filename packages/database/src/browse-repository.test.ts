import { describe, expect, it } from "vitest";

import { createBrowseRepository } from "./browse-repository";

describe("browse repository", () => {
  it("maps a published browse page and total", async () => {
    const repository = createBrowseRepository({
      list: async () => ({
        items: [
          {
            author_name: "Harbor Author",
            author_slug: "harbor-author",
            id: "61000000-0000-4000-8000-000000000001",
            published_at: "2026-07-03T08:00:00.000Z",
            slug: "harbor-light",
            summary: "A light at the edge.",
            title: "Harbor Light",
          },
        ],
        total: 1,
      }),
    });

    const result = await repository.list({
      limit: 12,
      offset: 0,
      sort: "newest",
    });
    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      authorName: "Harbor Author",
      publishedAt: new Date("2026-07-03T08:00:00.000Z"),
    });
  });

  it("rejects invalid paging input or response data", async () => {
    const repository = createBrowseRepository({ list: async () => ({}) });
    await expect(
      repository.list({ limit: 0, offset: 0, sort: "newest" }),
    ).rejects.toThrow();
    await expect(
      repository.list({ limit: 12, offset: 0, sort: "newest" }),
    ).rejects.toThrow();
  });
});
