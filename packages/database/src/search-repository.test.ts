import { describe, expect, it } from "vitest";

import { createSearchRepository } from "./search-repository";

describe("search repository", () => {
  it("maps the narrow published work and public author response", async () => {
    const repository = createSearchRepository({
      search: async () => ({
        authors: [
          {
            bio: "Writes harbor stories.",
            display_name: "Harbor Author",
            published_work_count: 1,
            slug: "harbor-author",
          },
        ],
        works: [
          {
            author_name: "Harbor Author",
            author_slug: "harbor-author",
            id: "51000000-0000-4000-8000-000000000001",
            published_at: "2026-07-03T08:00:00.000Z",
            slug: "harbor-light",
            summary: "A light at the edge.",
            title: "Harbor Light",
          },
        ],
      }),
    });

    const results = await repository.search("harbor", 20);
    expect(results.authors[0]?.displayName).toBe("Harbor Author");
    expect(results.works[0]?.publishedAt).toEqual(
      new Date("2026-07-03T08:00:00.000Z"),
    );
  });

  it("rejects an invalid query or result contract", async () => {
    const repository = createSearchRepository({ search: async () => ({}) });
    await expect(repository.search("", 20)).rejects.toThrow();
    await expect(repository.search("harbor", 20)).rejects.toThrow();
  });
});
