/*
 * Search and link-preview settings, edited in Site settings → SEO. Every field
 * is optional in effect: an empty value falls back to what the site derives on
 * its own (page titles from the site title, previews cut from page photos),
 * so a site with nothing filled in is already complete.
 */

export const SEO_PAGES = [
  { key: "home", label: "Homepage", path: "/" },
  { key: "artists", label: "Artists", path: "/artists" },
  { key: "about", label: "About", path: "/about" },
  { key: "contact", label: "Contact", path: "/contact" },
] as const;

export type SeoPageKey = (typeof SEO_PAGES)[number]["key"];

export type PageSeo = {
  /** <title> and og:title. Empty: derived from the site title. */
  title: string;
  /** Meta and og:description. Empty: the site description (About: its first paragraph). */
  description: string;
  /** Preview picture. Empty: cut from the page's photo, else the default card. */
  image: string;
  /** Ask search engines not to list the page (it stays reachable). */
  noindex: boolean;
};

export type SiteSeo = {
  pages: Record<SeoPageKey, PageSeo>;
  /** Preview picture for pages with no photo of their own. Empty: the wordmark card. */
  shareImage: string;
  /** og:locale, e.g. en_US or vi_VN. */
  locale: string;
  /** Comma-separated; Google ignores them, Bing and others still read them. */
  keywords: string;
  /** X / Twitter account, with or without the @. */
  twitterHandle: string;
  /** Facebook app id, for Insights on shared links. Digits only. */
  facebookAppId: string;
  /** Content of Google Search Console's HTML-tag verification. */
  googleVerification: string;
  /** Content of Bing Webmaster Tools' msvalidate.01 tag. */
  bingVerification: string;
};

export const SEO_LOCALES = [
  { value: "en_US", label: "English (US)" },
  { value: "en_GB", label: "English (UK)" },
  { value: "vi_VN", label: "Vietnamese" },
] as const;

const blankPage = (): PageSeo => ({ title: "", description: "", image: "", noindex: false });

export const blankSeo = (): SiteSeo => ({
  pages: { home: blankPage(), artists: blankPage(), about: blankPage(), contact: blankPage() },
  shareImage: "",
  locale: "en_US",
  keywords: "",
  twitterHandle: "",
  facebookAppId: "",
  googleVerification: "",
  bingVerification: "",
});

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

/**
 * Whatever is stored — nothing, an older shape, a partial object — becomes a
 * complete SiteSeo, so readers never check field by field.
 */
export function withSeoDefaults(input: unknown): SiteSeo {
  const base = blankSeo();
  if (!input || typeof input !== "object") return base;
  const raw = input as Record<string, unknown>;
  const rawPages = (raw.pages && typeof raw.pages === "object" ? raw.pages : {}) as Record<string, unknown>;

  const pages = Object.fromEntries(
    SEO_PAGES.map(({ key }) => {
      const page = (rawPages[key] && typeof rawPages[key] === "object" ? rawPages[key] : {}) as Record<string, unknown>;
      return [
        key,
        {
          title: str(page.title),
          description: str(page.description),
          image: str(page.image),
          noindex: page.noindex === true,
        },
      ];
    }),
  ) as Record<SeoPageKey, PageSeo>;

  return {
    pages,
    shareImage: str(raw.shareImage),
    locale: str(raw.locale, base.locale) || base.locale,
    keywords: str(raw.keywords),
    twitterHandle: str(raw.twitterHandle),
    facebookAppId: str(raw.facebookAppId),
    googleVerification: str(raw.googleVerification),
    bingVerification: str(raw.bingVerification),
  };
}

/** Anything set at all — publishing that needs the SEO migration. */
export const seoIsUsed = (seo: SiteSeo) => JSON.stringify(withSeoDefaults(seo)) !== JSON.stringify(blankSeo());

/** "@riflesso" from "riflesso", "@riflesso" or a profile URL. */
export function twitterHandleOf(value: string): string | undefined {
  const handle = value.trim().replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? `@${handle}` : undefined;
}

/** Limits search engines show before truncating. */
export const TITLE_TARGET = 60;
export const DESCRIPTION_TARGET = 155;
