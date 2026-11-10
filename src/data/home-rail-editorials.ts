import { imageItem, type MediaItem } from "@/lib/media-item";

import { siteAsset, STUDIO_CREDIT, STUDIO_TITLE } from "./media-url";
import { STORY_CARDS } from "./stories";

/**
 * The shoots come first — each is one card that opens its whole set — then the
 * single frames served from `public/assets/`.
 */
export const EDITORIALS: MediaItem[] = [
  STORY_CARDS.gildedFrame,
  STORY_CARDS.settingCurls,
  STORY_CARDS.traces,
  STORY_CARDS.elle,
  STORY_CARDS.thuyAnh,
  STORY_CARDS.dep,
  imageItem(
    siteAsset("hero-frame.jpg"),
    [
      ["Diego Nguyen", "Makeup"],
      ["Shishi", "Hair"],
    ],
    STUDIO_TITLE,
  ),
  imageItem(siteAsset("artist-1.jpg"), STUDIO_CREDIT, STUDIO_TITLE),
  imageItem(siteAsset("artist-2.jpg"), STUDIO_CREDIT, STUDIO_TITLE),
  imageItem(siteAsset("artist-3.jpg"), STUDIO_CREDIT, STUDIO_TITLE),
];
