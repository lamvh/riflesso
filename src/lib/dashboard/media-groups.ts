import type { SiteContent } from "@/lib/content/site-content-types";

import { pathSuffixes } from "./media-usage";

/*
 * Automatic groupings of stored files, read off the content rather than
 * typed in: the album (bộ ảnh) a file belongs to and the artists behind it.
 * An album's frames also count for every roster artist credited on it, so
 * filtering by an artist shows their portrait and the work they shot.
 * Pure — it never touches the bucket or the labels table.
 */

export type MediaGroupKind = "album" | "artist";

export type MediaGroup = { kind: MediaGroupKind; name: string };

/** Stable filter value for a group, e.g. "album:Vogue Italia". */
export const groupId = (group: MediaGroup) => `${group.kind}:${group.name}`;

export const GROUP_LABEL: Record<MediaGroupKind, string> = { album: "Album", artist: "Artist" };

/** Object key (and every path suffix of it) → the groups it belongs to. */
export function mediaGroupIndex(content: SiteContent): (key: string) => MediaGroup[] {
  const index = new Map<string, Map<string, MediaGroup>>();
  const add = (src: string, group: MediaGroup) => {
    if (!src.trim() || !group.name.trim()) return;
    for (const suffix of pathSuffixes(src.trim())) {
      const groups = index.get(suffix) ?? new Map<string, MediaGroup>();
      groups.set(groupId(group), group);
      index.set(suffix, groups);
    }
  };

  const roster = new Map(content.artists.map((artist) => [artist.name.trim().toLowerCase(), artist.name.trim()]));

  for (const artist of content.artists) add(artist.image, { kind: "artist", name: artist.name.trim() });
  for (const album of content.albums) {
    const title = album.title.trim() || "Untitled";
    const credited = album.credits
      .map((credit) => roster.get(credit.name.trim().toLowerCase()))
      .filter((name): name is string => Boolean(name));
    for (const src of [album.cover, ...album.frames]) {
      add(src, { kind: "album", name: title });
      for (const name of credited) add(src, { kind: "artist", name });
    }
  }

  return (key) => [...(index.get(key)?.values() ?? [])];
}
