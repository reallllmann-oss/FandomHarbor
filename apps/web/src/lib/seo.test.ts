import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildSitemap,
  pageMetadata,
  privatePageMetadata,
  resolveSiteUrl,
} from "./seo";

afterEach(() => vi.unstubAllEnvs());

describe("SEO foundation", () => {
  it("uses the formal site URL for production", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://www.fandomharbor.com/path",
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "fandom-harbor-web.vercel.app",
      }),
    ).toBe("https://www.fandomharbor.com");
  });

  it("uses an explicit Preview-only site URL first", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://preview.fandom.example/path",
        VERCEL_BRANCH_URL: "branch.vercel.app",
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "www.fandomharbor.com",
      }),
    ).toBe("https://preview.fandom.example");
  });

  it("uses the Vercel branch URL for a first Preview deployment", () => {
    expect(
      resolveSiteUrl({
        VERCEL_BRANCH_URL: "fandom-harbor-web-git-auth.vercel.app",
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "www.fandomharbor.com",
        VERCEL_URL: "fandom-harbor-web-commit.vercel.app",
      }),
    ).toBe("https://fandom-harbor-web-git-auth.vercel.app");
  });

  it("never falls back from Preview to the production URL", () => {
    expect(() =>
      resolveSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "www.fandomharbor.com",
      }),
    ).toThrow("Preview site URL is unavailable");
  });

  it("fails closed when required Vercel URL state is missing or invalid", () => {
    expect(() => resolveSiteUrl({ VERCEL: "1" })).toThrow(
      "Vercel deployment environment is unavailable",
    );
    expect(() =>
      resolveSiteUrl({
        VERCEL_BRANCH_URL: "https://malformed.vercel.app/path",
        VERCEL_ENV: "preview",
      }),
    ).toThrow("Invalid Vercel deployment host");
    expect(() =>
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "http://preview.example",
        VERCEL_ENV: "preview",
      }),
    ).toThrow("Invalid site URL");
  });

  it("uses localhost outside Vercel for local development", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
    expect(
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:4000" }),
    ).toBe("http://localhost:4000");
  });

  it("marks public Preview metadata as noindex", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_BRANCH_URL", "preview.vercel.app");
    expect(
      pageMetadata({
        description: "Preview",
        pathname: "/archive",
        title: "Preview",
      }),
    ).toMatchObject({ robots: { follow: false, index: false } });
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
      "https://fandom.example/privacy",
      "https://fandom.example/terms",
      "https://fandom.example/content-policy",
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
