import type { BrowseWork } from "@fandom-harbor/services";
import type { Metadata, MetadataRoute } from "next";

export const SITE_NAME = "Fandom Harbor";
export const SITE_DESCRIPTION = "阅读优先的邀请制作品归档平台。";

export function resolveSiteUrl(
  environment: Record<string, string | undefined> = process.env,
) {
  const configured = environment.NEXT_PUBLIC_SITE_URL;
  const vercelHost =
    environment.VERCEL_PROJECT_PRODUCTION_URL ?? environment.VERCEL_URL;
  const value = configured ?? (vercelHost ? `https://${vercelHost}` : null);
  return new URL(value ?? "http://localhost:3000").origin;
}

export function absolutePublicUrl(pathname: string) {
  return new URL(pathname, `${resolveSiteUrl()}/`).toString();
}

export function pageMetadata(input: {
  description: string;
  index?: boolean;
  pathname: string;
  title: string;
  type?: "article" | "website";
}): Metadata {
  const index = input.index ?? true;
  const canonical = absolutePublicUrl(input.pathname);
  return {
    alternates: { canonical },
    description: input.description,
    openGraph: {
      description: input.description,
      locale: "zh_CN",
      siteName: SITE_NAME,
      title: input.title,
      type: input.type ?? "website",
      url: canonical,
    },
    robots: { follow: index, index },
    title: input.title,
  };
}

export function privatePageMetadata(title: string): Metadata {
  return {
    robots: { follow: false, index: false },
    title,
  };
}

export function buildSitemap(
  works: BrowseWork[],
  siteUrl = resolveSiteUrl(),
): MetadataRoute.Sitemap {
  const url = (pathname: string) => new URL(pathname, `${siteUrl}/`).toString();
  const authors = new Map<string, Date>();
  for (const work of works) {
    const latest = authors.get(work.authorSlug);
    if (!latest || latest < work.publishedAt) {
      authors.set(work.authorSlug, work.publishedAt);
    }
  }

  return [
    { changeFrequency: "weekly", priority: 1, url: url("/") },
    { changeFrequency: "daily", priority: 0.9, url: url("/archive") },
    { changeFrequency: "weekly", priority: 0.6, url: url("/search") },
    ...works.map((work) => ({
      changeFrequency: "weekly" as const,
      lastModified: work.publishedAt,
      priority: 0.8,
      url: url(`/works/${encodeURIComponent(work.slug)}`),
    })),
    ...[...authors.entries()].map(([slug, lastModified]) => ({
      changeFrequency: "weekly" as const,
      lastModified,
      priority: 0.7,
      url: url(`/author/${encodeURIComponent(slug)}`),
    })),
  ];
}
