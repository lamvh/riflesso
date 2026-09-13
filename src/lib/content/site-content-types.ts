import type {
  AdminArtist,
  Album,
  Block,
  CategoryRow,
  Slide,
} from "@/lib/dashboard/admin-types";

export type SocialLink = { label: string; href: string };

/** The site-wide facts: brand, SEO, About copy and footer. */
export type SiteSettings = {
  brandName: string;
  /** Path under public/ or an absolute URL. Empty falls back to /riflesso.png. */
  logoUrl: string;
  logoAlt: string;
  metaTitle: string;
  metaDescription: string;
  aboutParagraphs: string[];
  socialLinks: SocialLink[];
  copyright: string;
};

/**
 * One card of the About/Contact grid. Every field is present so the dashboard
 * can bind inputs directly; an empty string means the card leaves it out.
 */
export type ContactCardRecord = {
  id: string;
  heading: string;
  /** Postal address, one entry per line. */
  address: string[];
  tel: string;
  /** Sentence that runs into the email address. */
  lead: string;
  email: string;
  linkLabel: string;
  linkHref: string;
  /** About omits this card; only Contact lists it. */
  contactOnly: boolean;
};

/** Everything the dashboard edits and publishes. */
export type SiteContent = {
  settings: SiteSettings;
  contacts: ContactCardRecord[];
  artists: AdminArtist[];
  albums: Album[];
  cats: CategoryRow[];
  slides: Slide[];
  blocks: Block[];
};

/**
 * Where content came from: the database, the repo's built-in content because
 * nothing has been published yet, or the built-in content because Supabase is
 * not configured.
 */
export type SiteContentSource = "database" | "seed" | "unconfigured";

export type LoadedSiteContent = {
  content: SiteContent;
  /** Publish counter in the database; 0 before the first publish. */
  revision: number;
  source: SiteContentSource;
};

export type PublishResult =
  | { ok: true; revision: number }
  | { ok: false; error: string };

/** Cache tag every public read carries; publishing expires it. */
export const SITE_CONTENT_TAG = "site-content";

export const DEFAULT_LOGO_URL = "/riflesso.png";

/** Default crop for a frame nobody has positioned by hand. */
export const DEFAULT_POSITION = "50% 18%";

/** Only the content keys, in a fixed order so two snapshots compare as JSON. */
export const pickSiteContent = (source: SiteContent): SiteContent => ({
  settings: source.settings,
  contacts: source.contacts,
  artists: source.artists,
  albums: source.albums,
  cats: source.cats,
  slides: source.slides,
  blocks: source.blocks,
});
