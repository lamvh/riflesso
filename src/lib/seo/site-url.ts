/** Production origin, used when NEXT_PUBLIC_SITE_URL is not set. */
export const PRODUCTION_SITE_URL = "https://riflesso.vn";

/**
 * The site's public origin. Link previews need absolute URLs for the page and
 * its picture, and the public pages are prerendered at build time, so this is
 * resolved at build: NEXT_PUBLIC_SITE_URL wins when set (e.g. a staging
 * domain); otherwise production builds use riflesso.vn and `next dev` uses
 * localhost, so previews and sitemaps never point at the wrong host.
 */
export function siteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured);
    } catch {
      console.warn(`NEXT_PUBLIC_SITE_URL is not a URL: "${configured}"`);
    }
  }
  return new URL(process.env.NODE_ENV === "production" ? PRODUCTION_SITE_URL : "http://localhost:3000");
}
