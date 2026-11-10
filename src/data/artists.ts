import type { MediaItem } from "@/lib/media-item";

import { CAMPAIGNS } from "./home-rail-campaigns";
import { COUTURE } from "./home-rail-couture";
import { EDITORIALS } from "./home-rail-editorials";
import { FASHION_WEEKS } from "./home-rail-fashion-weeks";
import { NEW_SIGNS } from "./home-rail-new-signs";

import type { Territory } from "@/lib/territories";

export { TERRITORIES, type Territory } from "@/lib/territories";

export const CATEGORIES = [
  "Styling",
  "Hair",
  "Makeup",
  "Grooming",
  "Color",
  "Manicure",
  "Creative Direction",
  "Digital Creators",
  "Set Design",
  "Special Bookings",
  "Development",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Artist = {
  name: string;
  /** Comma-separated disciplines, e.g. "Hair, Grooming". */
  category: string;
  /** Empty when the artist is only ever credited on video frames. */
  image: string;
  territory: Territory;
};

/**
 * Represented out of the European offices; everyone else falls to US.
 * Add a credited name here to file them under Europe.
 */
const EUROPE = new Set<string>();

/**
 * Scan order for the derivation below. It decides both which credit names an
 * artist's disciplines and which frame becomes their preview image, so it has
 * to stay the rails' on-page order.
 */
const RAILS: MediaItem[][] = [
  EDITORIALS,
  CAMPAIGNS,
  COUTURE,
  FASHION_WEEKS,
  NEW_SIGNS,
];

/**
 * The directory is derived from the rails rather than kept as a list of its
 * own: an artist exists because they are credited on a frame, their
 * disciplines come from the first credit that names them, and their preview is
 * the first *image* frame they appear on. Editing a rail therefore keeps the
 * directory correct without a second edit here.
 *
 * Images are collected in a pass of their own, so an artist first credited on
 * a video still picks up a later image frame.
 */
export function deriveArtists(rails: MediaItem[][] = RAILS): Artist[] {
  const images = new Map<string, string>();
  for (const rail of rails) {
    for (const item of rail) {
      if (item.kind !== "image") continue;
      for (const credit of item.credits) {
        if (!images.has(credit.name)) images.set(credit.name, item.src);
      }
    }
  }

  const byName = new Map<string, Artist>();
  for (const rail of rails) {
    for (const item of rail) {
      for (const credit of item.credits) {
        if (byName.has(credit.name)) continue;
        byName.set(credit.name, {
          name: credit.name,
          category: credit.roles,
          image: images.get(credit.name) ?? "",
          territory: EUROPE.has(credit.name) ? "EUROPE" : "US",
        });
      }
    }
  }

  return [...byName.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, artist]) => artist);
}
