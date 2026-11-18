import type { SiteContent } from "@/lib/content/site-content-types";

import type { Drawer } from "./admin-state";
import { pathSuffixes } from "./media-usage";

/*
 * Swapping one stored file for another everywhere the content uses it. A
 * replacement is uploaded under a new key (objects are cached as immutable,
 * so overwriting the old key would leave visitors on the old picture for a
 * year); this rewrites every address that points at the old key to the new
 * URL. Pure: it returns new objects and counts the fields it changed.
 */

/** True when `src` addresses the object `key`, under any media base URL. */
export const pointsAt = (src: string, key: string) => pathSuffixes(src.trim()).includes(key);

type Swap = <T extends string>(src: T) => T;

function swapper(key: string, url: string) {
  let count = 0;
  const swap = ((src: string) => {
    if (!src || !pointsAt(src, key)) return src;
    count += 1;
    return url;
  }) as Swap;
  return { swap, count: () => count };
}

/** Every image or video field of the content, with `swap` applied. */
function rewriteContent(content: SiteContent, swap: Swap): SiteContent {
  const { settings } = content;
  const pages = Object.fromEntries(
    Object.entries(settings.seo.pages).map(([page, seo]) => [page, { ...seo, image: swap(seo.image) }]),
  ) as typeof settings.seo.pages;

  return {
    ...content,
    settings: {
      ...settings,
      logoUrl: swap(settings.logoUrl),
      seo: { ...settings.seo, shareImage: swap(settings.seo.shareImage), pages },
    },
    artists: content.artists.map((artist) => ({ ...artist, image: swap(artist.image) })),
    albums: content.albums.map((album) => ({
      ...album,
      cover: swap(album.cover),
      frames: album.frames.map(swap),
    })),
    slides: content.slides.map((slide) => ({ ...slide, src: swap(slide.src) })),
    blocks: content.blocks.map((block) => ({ ...block, image: swap(block.image) })),
  };
}

/** The open drawer's unsaved record, so a later Save there doesn't bring the old file back. */
function rewriteDrawer(drawer: Drawer, swap: Swap): Drawer {
  if (!drawer) return drawer;
  if (drawer.kind === "artist") {
    return { ...drawer, draft: { ...drawer.draft, image: swap(drawer.draft.image) } };
  }
  const { draft } = drawer;
  return {
    ...drawer,
    draft: {
      ...draft,
      cover: swap(draft.cover),
      frames: draft.frames.map(swap),
      shots: draft.shots.map((shot) => ({ ...shot, src: swap(shot.src) })),
    },
  };
}

/**
 * Points every use of `key` at `url`. `count` is the number of content fields
 * rewritten (the open drawer is updated too but not counted: it is the same
 * record).
 */
export function replaceMediaReferences(
  content: SiteContent,
  drawer: Drawer,
  key: string,
  url: string,
): { content: SiteContent; drawer: Drawer; count: number } {
  const inContent = swapper(key, url);
  const next = rewriteContent(content, inContent.swap);
  const inDrawer = swapper(key, url);
  return { content: next, drawer: rewriteDrawer(drawer, inDrawer.swap), count: inContent.count() };
}
