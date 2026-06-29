import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@fandom-harbor/database", "@fandom-harbor/ui"],
};

export default nextConfig;
