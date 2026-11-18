import { imageItem, type MediaItem } from "@/lib/media-item";

import { STUDIO_CREDIT } from "./media-url";

/** New Signs cards carry no publication title — just the artist credit. */
export const NEW_SIGNS: MediaItem[] = [
  imageItem("", [["Thuy Anh", "Muse"]]),
  imageItem("", STUDIO_CREDIT),
  imageItem("", STUDIO_CREDIT),
  imageItem("", STUDIO_CREDIT),
];
