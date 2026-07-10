import { describe, expect, it } from "vitest";

import { normalizeWorkTagNames } from "./work-tag-input";

describe("normalizeWorkTagNames", () => {
  it("trims, removes empty values and deduplicates case-insensitively", () => {
    expect(normalizeWorkTagNames(" 剧情，Drama, drama, ,治愈 ")).toEqual([
      "剧情",
      "drama",
      "治愈",
    ]);
  });

  it("rejects overlong tags", () => {
    expect(() => normalizeWorkTagNames("a".repeat(81))).toThrow(RangeError);
  });
});
