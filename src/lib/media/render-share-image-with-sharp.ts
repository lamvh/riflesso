import "server-only";

import sharp from "sharp";

import {
  LOGO_BOX_HEIGHT,
  LOGO_BOX_WIDTH,
  SHARE_HEIGHT,
  SHARE_QUALITY,
  SHARE_WIDTH,
} from "./render-share-image";

/** Node: crop to fill 1200x630, keeping the most eye-catching region in frame. */
export async function renderShareImageWithSharp(input: Buffer): Promise<Buffer> {
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize(SHARE_WIDTH, SHARE_HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: SHARE_QUALITY, mozjpeg: true })
    .toBuffer();
}

/** Node: the logo fitted into its box, centred on white (same as scripts/generate-share-default.mjs). */
export async function renderLogoCardWithSharp(logo: Buffer): Promise<Buffer> {
  const mark = await sharp(logo, { failOn: "none" })
    .resize(LOGO_BOX_WIDTH, LOGO_BOX_HEIGHT, { fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });
  return sharp({ create: { width: SHARE_WIDTH, height: SHARE_HEIGHT, channels: 3, background: "#ffffff" } })
    .composite([
      {
        input: mark.data,
        left: Math.round((SHARE_WIDTH - mark.info.width) / 2),
        top: Math.round((SHARE_HEIGHT - mark.info.height) / 2),
      },
    ])
    .jpeg({ quality: SHARE_QUALITY, mozjpeg: true })
    .toBuffer();
}
