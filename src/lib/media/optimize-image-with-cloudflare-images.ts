import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  KEEPABLE,
  MAX_EDGE,
  QUALITY,
  smallest,
  type OptimizeOptions,
  type OptimizedImage,
} from "./optimize-image-shared";

/*
 * Workers encoder. sharp cannot run on Workers, so pictures go through the
 * Cloudflare Images binding (`IMAGES` in wrangler.jsonc) instead, following the
 * same rules: fit inside MAX_EDGE, try WebP and JPEG, keep a lean original,
 * store whichever is smallest.
 *
 * Only the slice of the binding this file uses is typed here, so the project
 * does not need @cloudflare/workers-types.
 * https://developers.cloudflare.com/images/transform-images/bindings/
 */

type ImageInfo = { format: string; fileSize?: number; width?: number; height?: number };

type ImagesBinding = {
  info(stream: ReadableStream<Uint8Array>): Promise<ImageInfo>;
  input(stream: ReadableStream<Uint8Array>): {
    transform(options: { width?: number; height?: number; fit?: "scale-down" }): {
      output(options: { format: string; quality?: number }): Promise<{ response(): Response }>;
    };
  };
};

const streamOf = (input: Buffer) => new Blob([new Uint8Array(input)]).stream();

async function imagesBinding(): Promise<ImagesBinding> {
  const { env } = await getCloudflareContext({ async: true });
  const binding = (env as unknown as { IMAGES?: ImagesBinding }).IMAGES;
  if (!binding) throw new Error("The IMAGES binding is missing from wrangler.jsonc");
  return binding;
}

/** Size after fitting inside MAX_EDGE without enlarging — what scale-down produces. */
function fitted(width: number, height: number) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height, 1));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function optimizeImageWithCloudflareImages(
  input: Buffer,
  { animated = false }: OptimizeOptions = {},
): Promise<OptimizedImage> {
  const images = await imagesBinding();
  const info = await images.info(streamOf(input));
  const width = info.width ?? 0;
  const height = info.height ?? 0;
  const keepable = KEEPABLE[info.format];

  /* GIFs are stored as they arrive: re-encoding through the binding would keep
     only the first frame. */
  if (animated || info.format === "image/gif") {
    return { body: input, contentType: "image/gif", extension: "gif", width, height };
  }

  const size = fitted(width, height);
  const encode = async (format: string, extension: string): Promise<OptimizedImage> => {
    const result = await images
      .input(streamOf(input))
      .transform({ width: MAX_EDGE, height: MAX_EDGE, fit: "scale-down" })
      .output({ format, quality: QUALITY });
    const body = Buffer.from(await result.response().arrayBuffer());
    return { body, contentType: format, extension, ...size };
  };

  const candidates = [await encode("image/webp", "webp")];

  /* JPEG often beats WebP on grain; PNG sources may carry alpha, so they skip it. */
  if (info.format === "image/jpeg") candidates.push(await encode("image/jpeg", "jpg"));

  /* An original that is already lean and needs no resizing is left untouched. */
  if (keepable && Math.max(width, height) <= MAX_EDGE) {
    candidates.push({ body: input, ...keepable, width, height });
  }

  return smallest(candidates);
}
