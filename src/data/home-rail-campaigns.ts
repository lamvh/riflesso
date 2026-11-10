import { imageItem, type MediaItem } from "@/lib/media-item";

import { siteAsset } from "./media-url";
import { STORY_CARDS } from "./stories";

export const CAMPAIGNS: MediaItem[] = [
  STORY_CARDS.artTwo,
  imageItem(
    siteAsset("elle-porsche.jpg"),
    [["Nguyen Tan Thanh", "Styling"]],
    "Elle × Porsche",
  ),
];
