import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo/site-url";

/**
 * Crawl everything public. The dashboard and the API stay out of search; the
 * share pictures under /og stay open, because Facebook's crawler honours
 * robots.txt when it fetches a preview image.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl().origin;
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/"] }],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
