import type { MediaSection } from "@/lib/work-detail";

import { CAMPAIGNS } from "./home-rail-campaigns";
import { COUTURE } from "./home-rail-couture";
import { EDITORIALS } from "./home-rail-editorials";
import { FASHION_WEEKS } from "./home-rail-fashion-weeks";

/**
 * The rails whose cards open a work detail. Declared here rather than inline in
 * the page so the editorial feature can open the gallery against the very same
 * Editorials section the rail above it uses.
 *
 * New Signs is deliberately absent: those cards go to the artist directory.
 */
export const EDITORIALS_SECTION: MediaSection = {
  heading: "Latest Editorials",
  category: "Editorial",
  items: EDITORIALS,
};

export const CAMPAIGNS_SECTION: MediaSection = {
  heading: "Latest Campaigns",
  category: "Campaign",
  items: CAMPAIGNS,
};

export const COUTURE_SECTION: MediaSection = {
  heading: "Paris Haute Couture Fashion Week",
  category: "Fashion Week",
  items: COUTURE,
};

export const FASHION_WEEKS_SECTION: MediaSection = {
  heading: "Paris & Milan Fashion Weeks",
  category: "Fashion Week",
  items: FASHION_WEEKS,
};
