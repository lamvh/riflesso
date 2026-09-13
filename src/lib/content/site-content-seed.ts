import "server-only";

import { CONTACT_CARDS } from "@/data/contact-offices";
import {
  seedAlbums,
  seedArtists,
  seedBlocks,
  seedCategories,
  seedSlides,
} from "@/lib/dashboard/admin-seed";

import { stableSeedId } from "./stable-seed-id";
import {
  DEFAULT_LOGO_URL,
  type ContactCardRecord,
  type SiteContent,
  type SiteSettings,
} from "./site-content-types";

/** The About copy as it shipped in the repo. */
const ABOUT_PARAGRAPHS = [
  "Riflesso Studio is a creative production house and artist management company working across fashion, beauty and portraiture. From studios in Ho Chi Minh City and Hanoi, our team represents photographers, stylists, hairstylists, makeup artists and set designers, and produces the editorial, campaign and runway work they are commissioned for. Services spanning casting, production, post and brand consulting let us carry a shoot from the first reference through to the printed page.",
  "The studio takes its name from the Italian for reflection. Every commission starts with the same question — what is this image reflecting back? We build our work around long collaborations with a small roster of artists, and we invest in the next generation of Vietnamese talent through assisting placements, mentorship and open studio days.",
];

const seedSettings = (): SiteSettings => ({
  brandName: "Riflesso Studio",
  logoUrl: DEFAULT_LOGO_URL,
  logoAlt: "Riflesso",
  metaTitle: "Riflesso",
  metaDescription:
    "Riflesso represents hair, makeup, styling, grooming and manicure artists across the US and UK.",
  aboutParagraphs: ABOUT_PARAGRAPHS,
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com/riflesso.studio" },
    { label: "TikTok", href: "https://www.tiktok.com/@riflesso.studio" },
  ],
  copyright: "Riflesso Studio ©2026",
});

const seedContacts = (): ContactCardRecord[] =>
  CONTACT_CARDS.map((card) => ({
    id: stableSeedId("contact", card.heading),
    heading: card.heading,
    address: card.address ?? [],
    tel: card.tel ?? "",
    lead: card.lead ?? "",
    email: card.email ?? "",
    linkLabel: card.link?.label ?? "",
    linkHref: card.link?.href ?? "",
    contactOnly: card.contactOnly ?? false,
  }));

let memo: SiteContent | null = null;

/**
 * The repo's built-in content as one publishable document. Built once per
 * server process; callers must treat it as read-only.
 */
export function seedSiteContent(): SiteContent {
  if (!memo) {
    const cats = seedCategories();
    const albums = seedAlbums();
    memo = {
      settings: seedSettings(),
      contacts: seedContacts(),
      artists: seedArtists(cats),
      albums,
      cats,
      slides: seedSlides(),
      blocks: seedBlocks(albums),
    };
  }
  return memo;
}
