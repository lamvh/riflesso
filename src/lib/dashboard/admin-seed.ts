import { CATEGORIES, deriveArtists } from "@/data/artists";
import { HERO_SLIDES } from "@/data/home-hero-slides";
import type { MediaItem } from "@/lib/media-item";

import type {
  AdminArtist,
  Album,
  AlbumKind,
  Block,
  CategoryRow,
  Slide,
} from "./admin-types";
import { RAIL_DEFINITIONS, type RailSlug } from "./rails";

/** Default crop for a cover the site has no hand-authored position for. */
const DEFAULT_POS = "50% 18%";

/** The rail a card sits on is what gives it its kind. */
const KIND_BY_RAIL: Record<RailSlug, AlbumKind> = {
  editorials: "Editorial",
  campaigns: "Campaign",
  couture: "Couture",
  "fashion-weeks": "Fashion Week",
  "new-signs": "New Signing",
};

/**
 * New Signs cards carry no publication — the rail prints the credit alone — so
 * the album takes its name from the artist it introduces.
 */
const albumTitle = (item: MediaItem, kind: AlbumKind) => {
  if (item.title) return item.title;
  const lead = item.credits[0]?.name;
  if (!lead) return "Untitled";
  return kind === "New Signing" ? `${lead} — Debut` : lead;
};

export function seedAlbums(): Album[] {
  return RAIL_DEFINITIONS.flatMap((rail) =>
    rail.seed.map((item, index): Album => {
      const kind = item.category === "Beauty" ? "Editorial" : KIND_BY_RAIL[rail.slug];
      /* A card that fronts a shoot already carries its frames; a standalone
         frame is a set of one. */
      const frames = item.gallery?.map((frame) => frame.src) ?? [item.src];
      return {
        id: `${rail.slug}-${index}`,
        title: albumTitle(item, kind),
        kind,
        frames,
        cover: item.src,
        pos: DEFAULT_POS,
        video: item.kind === "video",
        live: true,
        home: true,
        credits: item.credits.map((credit) => ({
          name: credit.name,
          role: credit.roles,
        })),
      };
    }),
  );
}

export function seedArtists(): AdminArtist[] {
  const rails = RAIL_DEFINITIONS.map((rail) => rail.seed);
  return deriveArtists(rails).map((artist) => ({
    name: artist.name,
    cats: artist.category,
    territory: artist.territory,
    image: artist.image,
    pos: DEFAULT_POS,
    /* Everyone the rails credit is already on the live site. */
    live: true,
    bio: "",
  }));
}

/** The directory prints every discipline; the toggle is what hides one. */
export const seedCategories = (): CategoryRow[] =>
  CATEGORIES.map((name) => ({ name, visible: true }));

/**
 * The banner prints credits as one running line with its own separators, so the
 * stored roles carry stray spaces and commas. The dashboard edits that line as
 * a single string and hands it back the same way.
 */
export const seedSlides = (): Slide[] =>
  HERO_SLIDES.map((slide) => ({
    pub: slide.publication,
    credit: slide.credits
      .map((credit) => `${credit.name} — ${credit.role.trim().replace(/,$/, "")}`)
      .join(", "),
    src: slide.src,
    pos: slide.position,
    ink: slide.captionColor,
  }));

/** The homepage, top to bottom, exactly as `src/app/page.tsx` renders it. */
export const seedBlocks = (): Block[] => [
  { label: "Latest Editorials", kind: "Scroll row", source: "Editorial", on: true },
  { label: "Latest Campaigns", kind: "Scroll row", source: "Campaign", on: true },
  { label: "Latest Editorial", kind: "Full-bleed", source: "Editorial", on: true },
  {
    label: "Paris Haute Couture Fashion Week",
    kind: "Scroll row",
    source: "Couture",
    on: true,
  },
  {
    label: "Paris & Milan Fashion Weeks",
    kind: "Scroll row",
    source: "Fashion Week",
    on: true,
  },
  { label: "Traces of Memories", kind: "Banner", source: "Editorial", on: true },
  { label: "New Signs", kind: "Scroll row", source: "New Signing", on: true },
];
