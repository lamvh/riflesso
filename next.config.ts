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
    remotePatterns: mediaPattern(),
    /* AVIF first (smallest), WebP for browsers without it. */
    formats: ["image/avif", "image/webp"],
    /* Uploads get a fresh key every time, so a resized copy never goes stale. */
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
