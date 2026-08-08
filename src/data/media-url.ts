/**
 * The two asset origins used across the site.
 *
 * `bynder` hits the DAM's transform endpoint (quality pinned at 85); `bynderAsset`
 * serves untransformed originals, which is where the MP4s live. `wpUpload` covers
 * legacy WordPress media.
 *
 * Hosts must also be listed in next.config.ts → images.remotePatterns for
 * anything rendered through next/image.
 */

export const bynder = (id: string) =>
  `https://thewallgroup.bynder.com/transform/${id}?quality=85`;

export const bynderAsset = (path: string) =>
  `https://thewallgroup.bynder.com/asset/${path}`;

export const wpUpload = (path: string) =>
  `https://thewallgroup.com/wp-content/uploads/${path}`;
