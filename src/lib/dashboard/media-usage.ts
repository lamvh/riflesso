import type { SiteContent } from "@/lib/content/site-content-types";

/*
 * Which records point at which stored object. Pure: it reads two snapshots of
 * the content — what is published and what the editor is working on — and
 * never touches the bucket.
 */

/** Where one object is referenced, e.g. "Album · Vogue Italia". */
export type MediaPlace = string;

/**
 * `live` — published and still in the draft. `pending` — only in the draft, so
 * it goes live on Publish. `removing` — published, but the draft dropped it, so
 * it leaves the site on Publish. `unused` — nothing points at it.
 */
export type MediaUsageState = "live" | "pending" | "removing" | "unused";

export type MediaUsage = { state: MediaUsageState; places: MediaPlace[] };

/** Every image/video address the content holds, with the place it sits. */
function contentReferences(content: SiteContent): [string, MediaPlace][] {
  const refs: [string, MediaPlace][] = [];
  const add = (src: string, place: MediaPlace) => {
    if (src.trim()) refs.push([src.trim(), place]);
  };

  add(content.settings.logoUrl, "Site settings · Logo");
  for (const artist of content.artists) add(artist.image, `Artist · ${artist.name || "Untitled"}`);
  for (const album of content.albums) {
    const place = `Album · ${album.title || "Untitled"}`;
    add(album.cover, place);
    for (const frame of album.frames) add(frame, place);
  }
  for (const slide of content.slides) add(slide.src, `Hero slide · ${slide.pub || "Untitled"}`);
  for (const block of content.blocks) add(block.image, `Homepage section · ${block.label}`);

  return refs;
}

/**
 * Path suffixes of an absolute URL: `https://cdn/x/uploads/a.webp` gives
 * `x/uploads/a.webp`, `uploads/a.webp`, `a.webp`. Matching on suffixes keeps an
 * object recognised when the media base URL (domain or path prefix) changed
 * after the record was saved. Site-local `/assets/…` paths are not in R2.
 */
export function pathSuffixes(src: string): string[] {
  let pathname: string;
  try {
    const url = new URL(src);
    if (url.protocol !== "https:" && url.protocol !== "http:") return [];
    pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  } catch {
    return [];
  }
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((_, index) => parts.slice(index).join("/"));
}

/** Object key → the distinct places that reference it. */
export function placesByKey(content: SiteContent): Map<string, Set<MediaPlace>> {
  const index = new Map<string, Set<MediaPlace>>();
  for (const [src, place] of contentReferences(content)) {
    for (const suffix of pathSuffixes(src)) {
      const places = index.get(suffix) ?? new Set<MediaPlace>();
      places.add(place);
      index.set(suffix, places);
    }
  }
  return index;
}

/** Builds a lookup from object key to its usage across both snapshots. */
export function mediaUsageIndex(published: SiteContent, draft: SiteContent) {
  const live = placesByKey(published);
  const current = placesByKey(draft);

  return (key: string): MediaUsage => {
    const inDraft = current.get(key);
    const inPublished = live.get(key);
    if (inDraft && inPublished) return { state: "live", places: [...inDraft] };
    if (inDraft) return { state: "pending", places: [...inDraft] };
    if (inPublished) return { state: "removing", places: [...inPublished] };
    return { state: "unused", places: [] };
  };
}
