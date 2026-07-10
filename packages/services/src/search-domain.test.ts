import { describe, expect, it, vi } from "vitest";

import {
  createPublicSearchService,
  MAX_SEARCH_QUERY_LENGTH,
  normalizeSearchQuery,
  type PublicSearchStore,
} from "./search-domain";

function store(): PublicSearchStore {
  return { search: vi.fn().mockResolvedValue({ authors: [], works: [] }) };
}

describe("public search service", () => {
  it("normalizes whitespace and delegates one bounded catalog search", async () => {
    const source = store();
    const results =
      await createPublicSearchService(source).search("  Harbor   Light  ");
    expect(results.query).toBe("Harbor Light");
    expect(source.search).toHaveBeenCalledWith("Harbor Light", 20);
  });

  it("returns an empty result without querying for blank input", async () => {
    const source = store();
    await expect(
      createPublicSearchService(source).search("   "),
    ).resolves.toEqual({ authors: [], query: "", works: [] });
    expect(source.search).not.toHaveBeenCalled();
  });

  it("rejects oversized and control-character queries", async () => {
    const service = createPublicSearchService(store());
    await expect(
      service.search("a".repeat(MAX_SEARCH_QUERY_LENGTH + 1)),
    ).rejects.toThrow(RangeError);
    await expect(service.search("harbor\u0000light")).rejects.toThrow(
      TypeError,
    );
  });

  it("normalizes Unicode search text consistently", () => {
    expect(normalizeSearchQuery("  Ａｕｔｈｏｒ　港湾 ")).toBe("Author 港湾");
  });
});
