import type { MediaItem } from "@/lib/media-item";

import { CAMPAIGNS } from "@/data/home-rail-campaigns";
import { COUTURE } from "@/data/home-rail-couture";
import { EDITORIALS } from "@/data/home-rail-editorials";
import { FASHION_WEEKS } from "@/data/home-rail-fashion-weeks";
import { NEW_SIGNS } from "@/data/home-rail-new-signs";

/**
 * The five home rails, in the order they appear on the page.
 *
 * `category` is the label a card's work detail prints; New Signs carries none,
 * which is exactly why its cards navigate to the artist directory instead of
 * opening a gallery. The dashboard surfaces that difference rather than hiding
 * it, so an editor can see why one rail behaves unlike the other four.
 */
export type RailSlug =
  | "editorials"
  | "campaigns"
  | "couture"
  | "fashion-weeks"
  | "new-signs";

export type RailDefinition = {
  slug: RailSlug;
  /** Heading printed above the rail on the home page. */
  heading: string;
  /** Shorter label for the dashboard sidebar. */
  label: string;
  category: string | null;
  seed: MediaItem[];
};

export const RAIL_DEFINITIONS: RailDefinition[] = [
  {
    slug: "editorials",
    heading: "Latest Editorials",
    label: "Editorials",
    category: "Editorial",
    seed: EDITORIALS,
  },
  {
    slug: "campaigns",
    heading: "Latest Campaigns",
    label: "Campaigns",
    category: "Campaign",
    seed: CAMPAIGNS,
  },
  {
    slug: "couture",
    heading: "Paris Haute Couture Fashion Week",
    label: "Couture",
    category: "Fashion Week",
    seed: COUTURE,
  },
  {
    slug: "fashion-weeks",
    heading: "Paris & Milan Fashion Weeks",
    label: "Fashion Weeks",
    category: "Fashion Week",
    seed: FASHION_WEEKS,
  },
  {
    slug: "new-signs",
    heading: "New Signs",
    label: "New Signs",
    category: null,
    seed: NEW_SIGNS,
  },
];

export const RAIL_SLUGS = RAIL_DEFINITIONS.map((rail) => rail.slug);

export const findRail = (slug: string) =>
  RAIL_DEFINITIONS.find((rail) => rail.slug === slug);
