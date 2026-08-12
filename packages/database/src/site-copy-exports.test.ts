import { describe, expect, it } from "vitest";

import {
  createAdminSiteCopyRepository,
  createPublicSiteCopyRepository,
  createSupabaseAdminSiteCopyRepository,
  createSupabasePublicSiteCopyRepository,
  parseSiteCopyBigintTransport,
} from "./index";

describe("Site Copy repository public exports", () => {
  it("exposes repository factories without exposing provider result types", () => {
    expect(createAdminSiteCopyRepository).toBeTypeOf("function");
    expect(createPublicSiteCopyRepository).toBeTypeOf("function");
    expect(createSupabaseAdminSiteCopyRepository).toBeTypeOf("function");
    expect(createSupabasePublicSiteCopyRepository).toBeTypeOf("function");
    expect(parseSiteCopyBigintTransport("9007199254740992")).toBe(
      9_007_199_254_740_992n,
    );
  });
});
