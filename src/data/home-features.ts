import { imageItem } from "@/lib/media-item";

import { bynder, siteAsset } from "./media-url";

/**
 * Full-bleed editorial feature that sits between the campaign and couture rails.
 * Its frame is a `MediaItem` like any rail card, because clicking it opens the
 * same work detail gallery.
 */
export const FEATURE_EDITORIAL = {
  heading: "Latest Editorial",
  item: imageItem(
    bynder(
      "4ff529fa-7d1d-4e7d-b704-c21321da439c/202606_INTERVIEW_NLEECOHEN_LTW_07",
    ),
    [["Liz Taw", "Hair, Grooming"]],
    "Interview",
  ),
};

/** Anniversary banner, inset by the standard 20px page gutter. */
export const FEATURE_ANNIVERSARY = {
  heading: "TWG25",
  src: siteAsset("twg25-banner.jpg"),
};
