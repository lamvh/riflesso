import "server-only";

import type { Metadata } from "next";

import { toDirectory } from "@/lib/content/directory-view";
import {
  getContactCards,
  getDirectoryContent,
  getHomeContent,
  getSiteSettings,
} from "@/lib/content/public-site-content";
import { DEFAULT_LOGO_URL, type SiteSettings } from "@/lib/content/site-content-types";
import { SEO_PAGES, twitterHandleOf, type SeoPageKey } from "@/lib/content/site-seo";
import { isPartShown } from "@/lib/content/site-visibility";
import { isPublishableSrc, isVideoSrc } from "@/lib/media-src";

/*
 * Search and link-preview metadata for the public pages. Values typed in
 * Site settings → SEO win; anything left empty is derived, so every page
 * always has a title, a description, a canonical URL and a 1200x630 preview.
 * Facebook, Messenger and Zalo read og:*; X reads twitter:*.
 */

export const DEFAULT_SHARE_IMAGE = "/share-default.jpg";

/** The `/og/logo` card: the site logo on white, the last resort before the stock card. */
export const LOGO_CARD_KEY = "logo";

/** The logo the masthead shows: the one set in Site settings, else the built-in wordmark. */
export function logoSource(settings: SiteSettings): string {
  const logo = settings.logoUrl.trim();
  return logo && isPublishableSrc(logo) ? logo : DEFAULT_LOGO_URL;
}

const usable = (src: string) => (src.trim() && isPublishableSrc(src.trim()) && !isVideoSrc(src) ? src.trim() : null);

/** A photograph the page itself shows, for pages that have one. */
async function pagePhoto(page: SeoPageKey, settings: SiteSettings): Promise<string | null> {
  if (page === "home") {
    const home = await getHomeContent();
    const slide = isPartShown(settings, "home:hero")
      ? home.slides.find((entry) => usable(entry.src))
      : undefined;
    if (slide) return slide.src;
    return home.albums.find((entry) => entry.live && entry.home && !entry.video && usable(entry.cover))?.cover ?? null;
  }
  if (page === "artists") {
    const directory = await getDirectoryContent();
    return toDirectory(directory.artists, directory.cats).artists.find((artist) => usable(artist.image))?.image ?? null;
  }
  return null;
}

/**
 * The picture a page's preview is cut from: the one set for the page in SEO
 * settings, else its own photo, else the site's default share picture. Null
 * means the built-in wordmark card.
 */
export async function shareSourceFor(page: SeoPageKey): Promise<string | null> {
  const settings = await getSiteSettings();
  return (
    usable(settings.seo.pages[page].image) ??
    (await pagePhoto(page, settings).catch(() => null)) ??
    usable(settings.seo.shareImage)
  );
}

/** Short stable hash, so a new picture gets a new URL and crawlers refetch it. */
function version(text: string) {
  let hash = 5381;
  for (let index = 0; index < text.length; index++) hash = (hash * 33) ^ text.charCodeAt(index);
  return (hash >>> 0).toString(36);
}

/**
 * Preview address for a page with no picture: the stock wordmark card while
 * the logo is the built-in one (a static file, nothing to render), else the
 * site logo rendered on white.
 */
export function logoCardUrl(settings: SiteSettings): string {
  const logo = logoSource(settings);
  return logo === DEFAULT_LOGO_URL ? DEFAULT_SHARE_IMAGE : `/og/${LOGO_CARD_KEY}?v=${version(logo)}`;
}

/** Titles and descriptions a page gets when SEO settings leave them empty. */
async function derived(page: SeoPageKey, settings: SiteSettings) {
  const label = SEO_PAGES.find((entry) => entry.key === page)!.label;
  let description = settings.metaDescription;
  if (page === "about") description = settings.aboutParagraphs[0] || description;
  if (page === "contact") {
    const cards = await getContactCards();
    if (cards.length) description = `Offices and enquiries: ${cards.map((card) => card.heading).join(", ")}.`;
  }
  return {
    title: page === "home" ? settings.metaTitle : `${settings.metaTitle} — ${label}`,
    description,
  };
}

/** Collapse whitespace and cut at a word boundary, for descriptions from prose. */
function clip(text: string, max = 300) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, flat.lastIndexOf(" ", max - 1) || max)}…`;
}

export async function pageMetadata(page: SeoPageKey): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.seo;
  const custom = seo.pages[page];
  const auto = await derived(page, settings);
  const title = custom.title.trim() || auto.title;
  const description = clip(custom.description.trim() || auto.description);
  const path = SEO_PAGES.find((entry) => entry.key === page)!.path;

  const source = await shareSourceFor(page).catch(() => null);
  const image = {
    url: source ? `/og/${page}?v=${version(source)}` : logoCardUrl(settings),
    width: 1200,
    height: 630,
    alt: title,
    type: "image/jpeg",
  };

  return {
    title,
    description,
    keywords: seo.keywords.split(",").map((word) => word.trim()).filter(Boolean),
    alternates: { canonical: path },
    robots: custom.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: settings.brandName || "Riflesso",
      locale: seo.locale,
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandleOf(seo.twitterHandle),
      creator: twitterHandleOf(seo.twitterHandle),
      title,
      description,
      images: [image.url],
    },
  };
}
