import { siteAsset } from "./media-url";
import { STORY_CARDS } from "./stories";

/**
 * Full-bleed editorial feature that sits between the campaign and couture rails.
 * Its frame is a `MediaItem` like any rail card, because clicking it opens the
 * same work detail gallery — here the whole ten-frame shoot behind the cover.
 */
export const FEATURE_EDITORIAL = {
  heading: "Latest Editorial",
  item: STORY_CARDS.splendor,
};

/** Anniversary banner, inset by the standard 20px page gutter. */
export const FEATURE_ANNIVERSARY = {
  heading: "TWG25",
  src: siteAsset("twg25-banner.jpg"),
};
