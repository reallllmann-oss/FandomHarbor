import { describe, expect, it, vi } from "vitest";

import {
  BROWSE_PAGE_SIZE,
  createPublicBrowseService,
  isBrowseSort,
  type PublicBrowseStore,
} from "./browse-domain";

function store(total = 25): PublicBrowseStore {
  return { list: vi.fn().mockResolvedValue({ items: [], total }) };
}

describe("public browse service", () => {
  it("collects every published work for a single sitemap", async () => {
    const works = Array.from({ length: 55 }, (_, index) => ({
      authorName: "Author",
      authorSlug: "author",
      id: crypto.randomUUID(),
      publishedAt: new Date("2026-07-03T00:00:00.000Z"),
      slug: `work-${index}`,
      summary: "Summary",
      title: `Work ${index}`,
    }));
    const source: PublicBrowseStore = {
      list: vi.fn(async ({ limit, offset }) => ({
        items: works.slice(offset, offset + limit),
        total: works.length,
      })),
    };

    await expect(
      createPublicBrowseService(source).listAllPublished(),
    ).resolves.toHaveLength(55);
    expect(source.list).toHaveBeenCalledTimes(2);
  });

  it("uses stable defaults and derives pagination metadata", async () => {
    const source = store();
    const result = await createPublicBrowseService(source).list();
    expect(source.list).toHaveBeenCalledWith({
      limit: BROWSE_PAGE_SIZE,
      offset: 0,
      sort: "newest",
    });
    expect(result).toMatchObject({ page: 1, pageCount: 3, total: 25 });
  });

  it("maps page and sort to a bounded offset", async () => {
    const source = store(13);
    const result = await createPublicBrowseService(source).list({
      page: 2,
      sort: "title-asc",
    });
    expect(source.list).toHaveBeenCalledWith({
      limit: 12,
      offset: 12,
      sort: "title-asc",
    });
    expect(result.pageCount).toBe(2);
  });

  it("represents an empty catalog without a phantom page", async () => {
    await expect(
      createPublicBrowseService(store(0)).list(),
    ).resolves.toMatchObject({
      pageCount: 0,
      total: 0,
    });
  });

  it("rejects invalid pages and recognizes only approved sorts", async () => {
    const service = createPublicBrowseService(store());
    await expect(service.list({ page: 0 })).rejects.toThrow(RangeError);
    expect(isBrowseSort("oldest")).toBe(true);
    expect(isBrowseSort("trending")).toBe(false);
  });
});
