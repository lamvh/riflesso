import type { NextConfig } from "next";

/**
 * Uploads live in R2 and are served from the public base URL. Declaring it
 * here is what lets next/image optimise them; keep it in step with
 * `src/lib/media-src.ts`.
 */
function mediaPattern() {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!base) return [];
  try {
    const url = new URL(base);
    return [
      {
        protocol: url.protocol.replace(":", "") as "https" | "http",
        hostname: url.hostname,
        pathname: `${url.pathname.replace(/\/+$/, "")}/**`,
      },
    ];
  } catch {
    return [];
  }
}

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
      ...mediaPattern(),
    ],
  },
};

export default nextConfig;
