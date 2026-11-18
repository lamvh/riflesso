import { getImageProps } from "next/image";

import { canOptimizeImage } from "./media-src";

/*
 * Resized, re-encoded sources for a plain <img> whose box comes from CSS
 * (rail cards at a fixed height, width from the asset's own ratio), where
 * next/image can't be used because no width/height is known.
 *
 * getImageProps builds the same srcSet next/image would; the placeholder
 * dimensions only seed it and are dropped, so the browser still lays the
 * image out from its intrinsic ratio. URLs next/image may not fetch (any
 * host outside images.remotePatterns) pass through untouched.
 */
const SEED = 1920;

/* `alt` stays on the <img> itself, where reviewers and lint can see it. */
export function optimizedImgProps(src: string, sizes: string) {
  if (!canOptimizeImage(src)) return { src, decoding: "async" as const };
  const {
    props: { srcSet, src: fallback, sizes: chosen },
  } = getImageProps({ src, alt: "", width: SEED, height: SEED, sizes });
  return { src: fallback, srcSet, sizes: chosen, decoding: "async" as const };
}
