/*
 * Rules every image encoder follows, whichever runtime does the work: sharp on
 * Node, the Cloudflare Images binding on Workers.
 */

/** Longest edge kept. The widest the site ever paints a frame is a full-bleed hero. */
export const MAX_EDGE = 2400;

export const QUALITY = 80;

/** Formats a browser reads, so an original may be stored exactly as it arrived. Keyed by MIME type. */
export const KEEPABLE: Record<string, { contentType: string; extension: string }> = {
  "image/jpeg": { contentType: "image/jpeg", extension: "jpg" },
  "image/png": { contentType: "image/png", extension: "png" },
  "image/webp": { contentType: "image/webp", extension: "webp" },
  "image/avif": { contentType: "image/avif", extension: "avif" },
};

export type OptimizedImage = {
  body: Buffer;
  contentType: string;
  extension: string;
  width: number;
  height: number;
};

export type OptimizeOptions = { animated?: boolean };

/** WebP is not always the smaller file, so each candidate is measured and the smallest wins. */
export const smallest = (candidates: OptimizedImage[]): OptimizedImage =>
  candidates.reduce((best, candidate) =>
    candidate.body.length < best.body.length ? candidate : best,
  );
