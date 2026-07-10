import type { MetadataRoute } from "next";

import { absolutePublicUrl } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      allow: "/",
      disallow: ["/access", "/auth/", "/author/invitations", "/studio/"],
      userAgent: "*",
    },
    sitemap: absolutePublicUrl("/sitemap.xml"),
  };
}
