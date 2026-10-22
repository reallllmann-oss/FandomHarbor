import type { BrowseWork } from "@fandom-harbor/services";
import type { Metadata, MetadataRoute } from "next";

export const SITE_NAME = "Fandom Harbor";
export const SITE_DESCRIPTION = "阅读优先的邀请制作品归档平台。";

function httpsVercelOrigin(host: string) {
  if (
    host.includes("://") ||
    host.includes("/") ||
    host.includes("@") ||
    host.includes("?") ||
    host.includes("#")
  ) {
    throw new Error("Invalid Vercel deployment host");
  }
  const url = new URL(`https://${host}`);
  if (!url.hostname || url.host !== host) {
    throw new Error("Invalid Vercel deployment host");
  }
  return url.origin;
}

function configuredSiteOrigin(value: string, requireHttps: boolean) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    (requireHttps && url.protocol !== "https:")
  ) {
    throw new Error("Invalid site URL");
  }
  return url.origin;
}

export function isPreviewDeployment(
  environment: Record<string, string | undefined> = process.env,
) {
  return (
    environment.VERCEL_TARGET_ENV === "preview" ||
    environment.VERCEL_ENV === "preview"
  );
}

export function resolveSiteUrl(
  environment: Record<string, string | undefined> = process.env,
) {
  const configured = environment.NEXT_PUBLIC_SITE_URL;
  const target = environment.VERCEL_TARGET_ENV ?? environment.VERCEL_ENV;

  if (configured) {
    return configuredSiteOrigin(
      configured,
      target === "preview" || target === "production",
    );
  }

  if (target === "preview") {
    const previewHost = environment.VERCEL_BRANCH_URL ?? environment.VERCEL_URL;
    if (!previewHost) {
      throw new Error("Preview site URL is unavailable");
    }
    return httpsVercelOrigin(previewHost);
  }

  if (target === "production") {
    const productionHost =
      environment.VERCEL_PROJECT_PRODUCTION_URL ?? environment.VERCEL_URL;
    if (!productionHost) {
      throw new Error("Production site URL is unavailable");
    }
    return httpsVercelOrigin(productionHost);
  }

  if (environment.VERCEL === "1") {
    throw new Error("Vercel deployment environment is unavailable");
  }

  return "http://localhost:3000";
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
  const index = (input.index ?? true) && !isPreviewDeployment();
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
    { changeFrequency: "monthly", priority: 0.4, url: url("/privacy") },
    { changeFrequency: "monthly", priority: 0.4, url: url("/terms") },
    {
      changeFrequency: "monthly",
      priority: 0.4,
      url: url("/content-policy"),
    },
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
