import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildSitemap,
  pageMetadata,
  privatePageMetadata,
  resolveSiteUrl,
} from "./seo";

afterEach(() => vi.unstubAllEnvs());

describe("SEO foundation", () => {
  it("resolves an explicit canonical origin before Vercel fallbacks", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://fandom.example/path",
        VERCEL_PROJECT_PRODUCTION_URL: "ignored.vercel.app",
      }),
    ).toBe("https://fandom.example");
    expect(resolveSiteUrl({ VERCEL_URL: "preview.vercel.app" })).toBe(
      "https://preview.vercel.app",
    );
  });

  it("builds a published-only sitemap with unique author pages", () => {
    const publishedAt = new Date("2026-07-03T00:00:00.000Z");
    const sitemap = buildSitemap(
      [
        {
          authorName: "Author",
          authorSlug: "author",
          id: crypto.randomUUID(),
          publishedAt,
          slug: "published-work",
          summary: "Summary",
          title: "Published Work",
        },
        {
          authorName: "Author",
          authorSlug: "author",
          id: crypto.randomUUID(),
          publishedAt,
          slug: "second-work",
          summary: "Summary",
          title: "Second Work",
        },
      ],
      "https://fandom.example",
    );

    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://fandom.example/",
      "https://fandom.example/archive",
      "https://fandom.example/search",
      "https://fandom.example/legal",
      "https://fandom.example/works/published-work",
      "https://fandom.example/works/second-work",
      "https://fandom.example/author/author",
    ]);
    expect(sitemap.some((entry) => entry.url.includes("draft"))).toBe(false);
  });

  it("builds canonical Open Graph metadata and noindex fallbacks", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fandom.example");
    expect(
      pageMetadata({
        description: "Published work",
        pathname: "/works/published-work",
        title: "Published Work",
        type: "article",
      }),
    ).toMatchObject({
      alternates: {
        canonical: "https://fandom.example/works/published-work",
      },
      openGraph: {
        type: "article",
        url: "https://fandom.example/works/published-work",
      },
      robots: { follow: true, index: true },
    });
    expect(privatePageMetadata("Draft")).toMatchObject({
      robots: { follow: false, index: false },
    });
  });
});
