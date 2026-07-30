import { describe, expect, it } from "vitest";

import {
  createAdminSiteCopyService,
  createPublicSiteCopyService,
  SITE_COPY_BASELINE_V1,
  SITE_COPY_FIELD_IDS,
  SiteCopyDomainError,
} from "./index";

describe("Site Copy service public exports", () => {
  it("exposes the provider-neutral Domain entry points", () => {
    expect(createAdminSiteCopyService).toBeTypeOf("function");
    expect(createPublicSiteCopyService).toBeTypeOf("function");
    expect(SITE_COPY_FIELD_IDS).toHaveLength(8);
    expect(SITE_COPY_BASELINE_V1.homepage_title).toBe("Fandom Harbor");
    expect(new SiteCopyDomainError("INVALID_INPUT").code).toBe("INVALID_INPUT");
  });
});
