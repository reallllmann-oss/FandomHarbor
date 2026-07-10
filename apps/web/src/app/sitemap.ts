import { readPublicRuntimeConfig } from "@fandom-harbor/config";
import type { MetadataRoute } from "next";

import { createPublicBrowseGateway } from "../lib/public-browse";
import { buildSitemap } from "../lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const works = await createPublicBrowseGateway(
    readPublicRuntimeConfig(),
  ).listAllPublished();
  return buildSitemap(works);
}
