import { CATEGORIES, deriveArtists } from "@/data/artists";
import { FEATURE_ANNIVERSARY, FEATURE_EDITORIAL } from "@/data/home-features";
import { HERO_SLIDES } from "@/data/home-hero-slides";
import { stableSeedId } from "@/lib/content/stable-seed-id";
import { DEFAULT_POSITION } from "@/lib/content/site-content-types";
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

/*
 * The site's built-in content, shaped as dashboard records. It is what the
 * site renders until the first publish, and what that publish writes to the
 * database. Server-only: ids are hashed with node:crypto.
 */

/** The rail a card sits on is what gives it its kind. */
const KIND_BY_RAIL: Record<RailSlug, AlbumKind> = {
  editorials: "Editorial",
  campaigns: "Campaign",
  couture: "Couture",
  "fashion-weeks": "Fashion Week",
  "new-signs": "New Signing",
};

const RAIL_ITEMS = RAIL_DEFINITIONS.map((rail) => rail.seed);

const splitDisciplines = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

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
        id: stableSeedId("album", rail.slug, String(index)),
        title: albumTitle(item, kind),
        kind,
        frames,
        cover: item.src,
        pos: DEFAULT_POSITION,
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

/**
 * The directory's disciplines, visible, then every other discipline a credit
 * names (Photography, Lighting…) kept on the artist but hidden from the filter.
 */
export function seedCategories(): CategoryRow[] {
  const directory: readonly string[] = CATEGORIES;
  const names = [...directory];
  for (const artist of deriveArtists(RAIL_ITEMS)) {
    for (const discipline of splitDisciplines(artist.category)) {
      if (!names.includes(discipline)) names.push(discipline);
    }
  }
  return names.map((name) => ({
    id: stableSeedId("category", name),
    name,
    visible: directory.includes(name),
  }));
}

export function seedArtists(categories: CategoryRow[]): AdminArtist[] {
  const idByName = new Map(categories.map((category) => [category.name, category.id]));
  return deriveArtists(RAIL_ITEMS).map((artist) => ({
    id: stableSeedId("artist", artist.name),
    name: artist.name,
    categoryIds: splitDisciplines(artist.category)
      .map((name) => idByName.get(name))
      .filter((id): id is string => Boolean(id)),
    territory: artist.territory,
    image: artist.image,
    pos: DEFAULT_POSITION,
    /* Everyone the rails credit is already on the live site. */
    live: true,
    bio: "",
  }));
}

/**
 * The banner prints credits as one running line with its own separators, so the
 * stored roles carry stray spaces and commas. The dashboard edits that line as
 * a single string and hands it back the same way.
 */
export const seedSlides = (): Slide[] =>
  HERO_SLIDES.map((slide, index) => ({
    id: stableSeedId("slide", String(index), slide.src),
    pub: slide.publication,
    credit: slide.credits
      .map((credit) => `${credit.name} — ${credit.role.trim().replace(/,$/, "")}`)
      .join(", "),
    src: slide.src,
    pos: slide.position,
    ink: slide.captionColor,
  }));

/** The homepage, top to bottom, exactly as it rendered before the database. */
export function seedBlocks(albums: Album[]): Block[] {
  const featured =
    albums.find((album) => album.cover === FEATURE_EDITORIAL.item.src)?.id ?? null;

  const block = (
    label: string,
    kind: Block["kind"],
    source: AlbumKind,
    extra: Partial<Pick<Block, "albumId" | "image">> = {},
  ): Block => ({
    id: stableSeedId("section", label),
    label,
    kind,
    source,
    on: true,
    albumId: extra.albumId ?? null,
    image: extra.image ?? "",
  });

  return [
    block("Latest Editorials", "Scroll row", "Editorial"),
    block("Latest Campaigns", "Scroll row", "Campaign"),
    block(FEATURE_EDITORIAL.heading, "Full-bleed", "Editorial", { albumId: featured }),
    block("Paris Haute Couture Fashion Week", "Scroll row", "Couture"),
    block("Paris & Milan Fashion Weeks", "Scroll row", "Fashion Week"),
    block(FEATURE_ANNIVERSARY.heading, "Banner", "Editorial", {
      image: FEATURE_ANNIVERSARY.src,
    }),
    block("New Signs", "Scroll row", "New Signing"),
  ];
}
