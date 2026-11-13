import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  LOGO_BOX_HEIGHT,
  LOGO_BOX_WIDTH,
  SHARE_HEIGHT,
  SHARE_QUALITY,
  SHARE_WIDTH,
} from "./render-share-image";

/*
 * Workers: the same crop through the Cloudflare Images binding. `gravity:
 * "auto"` picks the focal region the way sharp's attention strategy does.
 * Only the slice of the binding used here is typed.
 */

type ShareImagesBinding = {
  info(stream: ReadableStream<Uint8Array>): Promise<{ width?: number; height?: number }>;
  input(stream: ReadableStream<Uint8Array>): {
    transform(options: {
      width: number;
      height: number;
      fit: "cover" | "contain";
      gravity?: "auto";
      background: string;
      /** Added after resizing — used to pad the logo out to the full card. */
      border?: { color: string; top: number; right: number; bottom: number; left: number };
    }): {
      output(options: { format: "image/jpeg"; quality: number }): Promise<{ response(): Response }>;
    };
  };
};

async function imagesBinding(): Promise<ShareImagesBinding> {
  const { env } = await getCloudflareContext({ async: true });
  const images = (env as unknown as { IMAGES?: ShareImagesBinding }).IMAGES;
  if (!images) throw new Error("The IMAGES binding is missing from wrangler.jsonc");
  return images;
}

const streamOf = (input: Buffer) => new Blob([new Uint8Array(input)]).stream();

export async function renderShareImageWithCloudflareImages(input: Buffer): Promise<Buffer> {
  const images = await imagesBinding();

  const result = await images
    .input(streamOf(input))
    .transform({ width: SHARE_WIDTH, height: SHARE_HEIGHT, fit: "cover", gravity: "auto", background: "#ffffff" })
    .output({ format: "image/jpeg", quality: SHARE_QUALITY });
  return Buffer.from(await result.response().arrayBuffer());
}

/**
 * Workers: the logo fitted into its box, then padded with white out to
 * 1200x630. The binding has no blank canvas, so the padding is a border
 * sized from the logo's own dimensions.
 */
export async function renderLogoCardWithCloudflareImages(logo: Buffer): Promise<Buffer> {
  const images = await imagesBinding();
  const { width, height } = await images.info(streamOf(logo));
  if (!width || !height) throw new Error("The logo's size could not be read");

  const scale = Math.min(LOGO_BOX_WIDTH / width, LOGO_BOX_HEIGHT / height, 1);
  const markWidth = Math.round(width * scale);
  const markHeight = Math.round(height * scale);
  const left = Math.floor((SHARE_WIDTH - markWidth) / 2);
  const top = Math.floor((SHARE_HEIGHT - markHeight) / 2);

  const result = await images
    .input(streamOf(logo))
    .transform({
      width: markWidth,
      height: markHeight,
      fit: "contain",
      background: "#ffffff",
      border: {
        color: "#ffffff",
        top,
        bottom: SHARE_HEIGHT - markHeight - top,
        left,
        right: SHARE_WIDTH - markWidth - left,
      },
    })
    .output({ format: "image/jpeg", quality: SHARE_QUALITY });
  return Buffer.from(await result.response().arrayBuffer());
}
