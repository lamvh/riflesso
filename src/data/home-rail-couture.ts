import { imageItem, type MediaItem } from "@/lib/media-item";

import { siteAsset, STUDIO_CREDIT, STUDIO_TITLE } from "./media-url";

export const COUTURE: MediaItem[] = [
  imageItem(siteAsset("artist-1.jpg"), STUDIO_CREDIT, STUDIO_TITLE),
  imageItem(siteAsset("artist-4.jpg"), STUDIO_CREDIT, STUDIO_TITLE),
];
