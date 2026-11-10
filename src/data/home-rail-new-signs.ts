import { imageItem, type MediaItem } from "@/lib/media-item";

import { siteAsset, STUDIO_CREDIT } from "./media-url";

/** New Signs cards carry no publication title — just the artist credit. */
export const NEW_SIGNS: MediaItem[] = [
  imageItem("/assets/stories/thuy-anh-05.jpg", [["Thuy Anh", "Muse"]]),
  imageItem(siteAsset("artist-2.jpg"), STUDIO_CREDIT),
  imageItem(siteAsset("artist-3.jpg"), STUDIO_CREDIT),
  imageItem(siteAsset("artist-4.jpg"), STUDIO_CREDIT),
];
