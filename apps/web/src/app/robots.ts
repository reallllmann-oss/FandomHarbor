import type { MetadataRoute } from "next";

import { absolutePublicUrl, isPreviewDeployment } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: { disallow: "/", userAgent: "*" },
    };
  }

  return {
    rules: {
      allow: "/",
      disallow: ["/access", "/auth/", "/author/invitations", "/studio/"],
      userAgent: "*",
    },
    sitemap: absolutePublicUrl("/sitemap.xml"),
  };
}
