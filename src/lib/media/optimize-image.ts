import "server-only";

import type { OptimizeOptions, OptimizedImage } from "./optimize-image-shared";

export { MAX_EDGE, type OptimizedImage } from "./optimize-image-shared";

/*
 * Every uploaded picture is re-encoded before it is stored: the frames the
 * site shows are at most a page wide, and a camera original is many times the
 * bytes needed for that.
 *
 * Which encoder runs depends on the runtime. On Cloudflare Workers sharp (a
 * native module) cannot load, so the Cloudflare Images binding does the work;
 * on Node, sharp does. Both are imported lazily so neither runtime ever loads
 * the other's encoder.
 */

const onWorkers = () =>
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

export async function optimizeImage(
  input: Buffer,
  options: OptimizeOptions = {},
): Promise<OptimizedImage> {
  if (onWorkers()) {
    const { optimizeImageWithCloudflareImages } = await import(
      "./optimize-image-with-cloudflare-images"
    );
    return optimizeImageWithCloudflareImages(input, options);
  }

  const { optimizeImageWithSharp } = await import("./optimize-image-with-sharp");
  return optimizeImageWithSharp(input, options);
}
