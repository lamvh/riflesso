import "server-only";

/*
 * Link previews (Facebook, Messenger, Zalo, X, Slack…) want one landscape
 * picture, ideally 1200x630, in a format every crawler reads. Site pictures
 * are stored as WebP, which not every crawler accepts, so the share picture is
 * a JPEG cropped to fill the frame.
 *
 * Same split as optimize-image.ts: Cloudflare Images on Workers, sharp on Node.
 */

export const SHARE_WIDTH = 1200;
export const SHARE_HEIGHT = 630;
export const SHARE_QUALITY = 82;

/** Box the logo is fitted into on the logo card — the proportions of public/share-default.jpg. */
export const LOGO_BOX_WIDTH = 560;
export const LOGO_BOX_HEIGHT = 300;

const onWorkers = () =>
  typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

export async function renderShareImage(input: Buffer): Promise<Buffer> {
  if (onWorkers()) {
    const { renderShareImageWithCloudflareImages } = await import(
      "./render-share-image-with-cloudflare-images"
    );
    return renderShareImageWithCloudflareImages(input);
  }
  const { renderShareImageWithSharp } = await import("./render-share-image-with-sharp");
  return renderShareImageWithSharp(input);
}

/**
 * The fallback preview: the site logo, as-is (never recoloured), centred on a
 * white 1200x630 card. Used when a page has no picture or its picture cannot
 * be loaded, so a custom logo from Site settings shows instead of the stock card.
 */
export async function renderLogoCard(logo: Buffer): Promise<Buffer> {
  if (onWorkers()) {
    const { renderLogoCardWithCloudflareImages } = await import("./render-share-image-with-cloudflare-images");
    return renderLogoCardWithCloudflareImages(logo);
  }
  const { renderLogoCardWithSharp } = await import("./render-share-image-with-sharp");
  return renderLogoCardWithSharp(logo);
}
