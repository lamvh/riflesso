/**
 * Hosts next/image is allowed to optimise. Keep in sync with
 * next.config.ts → images.remotePatterns; anything else renders unoptimised
 * rather than throwing, since editors can paste any URL into the dashboard.
 */
const OPTIMIZABLE_REMOTES = [
  { hostname: "thewallgroup.bynder.com", pathname: "/transform/" },
  { hostname: "thewallgroup.com", pathname: "/wp-content/uploads/" },
];

export function canOptimizeImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      OPTIMIZABLE_REMOTES.some(
        (remote) =>
          url.hostname === remote.hostname && url.pathname.startsWith(remote.pathname),
      )
    );
  } catch {
    return false;
  }
}

/**
 * A source the site can store and render: a path under public/ or an http(s)
 * URL. A `blob:` preview of an unstored upload is not one.
 */
export function isPublishableSrc(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v)$/i;

/** Whether a frame URL points at a video file, judged by its extension. */
export function isVideoSrc(src: string): boolean {
  try {
    return VIDEO_EXTENSION.test(new URL(src, "https://local.invalid").pathname);
  } catch {
    return false;
  }
}
