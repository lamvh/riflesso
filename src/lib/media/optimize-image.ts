import "server-only";

import sharp, { type OutputInfo } from "sharp";

/*
 * Every uploaded picture is re-encoded before it is stored: the frames the
 * site shows are at most a page wide, and a camera original is many times the
 * bytes needed for that.
 *
 * WebP is not always the smaller file. On grainy photographs already saved as
 * JPEG it can come out larger than what went in, so each candidate encoding is
 * measured and the smallest one wins.
 */

/** Longest edge kept. The widest the site ever paints a frame is a full-bleed hero. */
export const MAX_EDGE = 2400;

const QUALITY = 80;

/** Formats a browser reads, so an original may be stored exactly as it arrived. */
const KEEPABLE: Record<string, { contentType: string; extension: string }> = {
  jpeg: { contentType: "image/jpeg", extension: "jpg" },
  png: { contentType: "image/png", extension: "png" },
  webp: { contentType: "image/webp", extension: "webp" },
  avif: { contentType: "image/avif", extension: "avif" },
};

export type OptimizedImage = {
  body: Buffer;
  contentType: string;
  extension: string;
  width: number;
  height: number;
};

/** An animated strip reports every frame stacked; one frame is what we record. */
const frameHeight = (height: number, pages: number | undefined) =>
  pages && pages > 1 ? Math.round(height / pages) : height;

const encoded = (
  result: { data: Buffer; info: OutputInfo },
  contentType: string,
  extension: string,
): OptimizedImage => ({
  body: result.data,
  contentType,
  extension,
  width: result.info.width,
  height: frameHeight(result.info.height, result.info.pages),
});

export async function optimizeImage(
  input: Buffer,
  { animated = false }: { animated?: boolean } = {},
): Promise<OptimizedImage> {
  /* Phone pictures carry their orientation in EXIF; re-encoding applies it and
     drops the rest of the metadata with it. */
  const image = sharp(input, { animated, failOn: "none" }).rotate();
  const meta = await image.metadata();
  const height = frameHeight(meta.height ?? 0, meta.pages);
  const oversized = Math.max(meta.width ?? 0, height) > MAX_EDGE;

  const resized = image.resize({
    width: MAX_EDGE,
    height: MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });

  const candidates: OptimizedImage[] = [
    encoded(
      await resized.clone().webp({ quality: QUALITY, smartSubsample: true }).toBuffer({
        resolveWithObject: true,
      }),
      "image/webp",
      "webp",
    ),
  ];

  /* JPEG often beats WebP on grain; it carries neither alpha nor motion. */
  if (!meta.hasAlpha && !animated) {
    candidates.push(
      encoded(
        await resized.clone().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer({
          resolveWithObject: true,
        }),
        "image/jpeg",
        "jpg",
      ),
    );
  }

  /* An original that is already lean and needs no resizing is left untouched —
     the only case where its metadata survives. */
  const keepable = meta.format ? KEEPABLE[meta.format] : undefined;
  if (keepable && !oversized) {
    candidates.push({
      body: input,
      contentType: keepable.contentType,
      extension: keepable.extension,
      width: meta.width ?? 0,
      height,
    });
  }

  return candidates.reduce((best, candidate) =>
    candidate.body.length < best.body.length ? candidate : best,
  );
}
