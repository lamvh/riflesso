import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores lockfiles in parent directories.
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thewallgroup.bynder.com",
        pathname: "/transform/**",
      },
      {
        protocol: "https",
        hostname: "thewallgroup.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
