import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";

afterEach(() => vi.unstubAllEnvs());

describe("robots metadata", () => {
  it("disallows indexing and omits the sitemap in Preview", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_BRANCH_URL", "preview.vercel.app");

    expect(robots()).toEqual({
      rules: { disallow: "/", userAgent: "*" },
    });
  });

  it("keeps the public production policy and sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.fandomharbor.com");
    vi.stubEnv("VERCEL_ENV", "production");

    expect(robots()).toEqual({
      rules: {
        allow: "/",
        disallow: ["/access", "/auth/", "/author/invitations", "/studio/"],
        userAgent: "*",
      },
      sitemap: "https://www.fandomharbor.com/sitemap.xml",
    });
  });
});
