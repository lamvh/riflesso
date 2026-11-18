import { imageItem, type MediaItem } from "@/lib/media-item";

import { STUDIO_CREDIT, STUDIO_TITLE } from "./media-url";
import { STORY_CARDS } from "./stories";

/**
 * The shoots come first — each is one card that opens its whole set — then the
 * single frames, each waiting for its picture to be uploaded.
 */
export const EDITORIALS: MediaItem[] = [
  STORY_CARDS.gildedFrame,
  STORY_CARDS.settingCurls,
  STORY_CARDS.traces,
  STORY_CARDS.elle,
  STORY_CARDS.thuyAnh,
  STORY_CARDS.dep,
  imageItem(
    "",
    [
      ["Diego Nguyen", "Makeup"],
      ["Shishi", "Hair"],
    ],
    STUDIO_TITLE,
  ),
  imageItem("", STUDIO_CREDIT, STUDIO_TITLE),
  imageItem("", STUDIO_CREDIT, STUDIO_TITLE),
  imageItem("", STUDIO_CREDIT, STUDIO_TITLE),
];
