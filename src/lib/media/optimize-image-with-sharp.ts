import "server-only";

import sharp, { type OutputInfo } from "sharp";

import {
  KEEPABLE,
  MAX_EDGE,
  QUALITY,
  smallest,
  type OptimizeOptions,
  type OptimizedImage,
} from "./optimize-image-shared";

/*
 * Node encoder (`next dev`, `next start`). sharp is a native module, so this
 * file is only ever loaded off Workers — see optimize-image.ts.
 *
 * WebP is not always the smaller file. On grainy photographs already saved as
 * JPEG it can come out larger than what went in, so each candidate encoding is
 * measured and the smallest one wins.
 */

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

export async function optimizeImageWithSharp(
  input: Buffer,
  { animated = false }: OptimizeOptions = {},
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
  const keepable = meta.format ? KEEPABLE[`image/${meta.format}`] : undefined;
  if (keepable && !oversized) {
    candidates.push({
      body: input,
      contentType: keepable.contentType,
      extension: keepable.extension,
      width: meta.width ?? 0,
      height,
    });
  }

  return smallest(candidates);
}
