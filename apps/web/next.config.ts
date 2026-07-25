import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: "/terms",
      permanent: true,
      source: "/legal",
    },
  ],
  transpilePackages: ["@fandom-harbor/database", "@fandom-harbor/ui"],
};

export default nextConfig;
