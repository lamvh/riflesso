import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/content/public-site-content";
import { SEO_PAGES } from "@/lib/content/site-seo";
import { isPartShown, type HideablePart } from "@/lib/content/site-visibility";
import { siteUrl } from "@/lib/seo/site-url";

/** Rebuilt at most hourly; publishing also expires the content it reads. */
export const revalidate = 3600;

const PAGE_PART: Partial<Record<string, HideablePart>> = {
  artists: "page:artists",
  about: "page:about",
  contact: "page:contact",
};

/** The public pages, minus any hidden from the site or marked noindex in SEO settings. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const origin = siteUrl().origin;
  return SEO_PAGES.filter(({ key }) => {
    const part = PAGE_PART[key];
    return (!part || isPartShown(settings, part)) && !settings.seo.pages[key].noindex;
  }).map(({ key, path }) => ({
    url: `${origin}${path}`,
    changeFrequency: key === "home" ? "weekly" : "monthly",
    priority: key === "home" ? 1 : 0.7,
  }));
}
