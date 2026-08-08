import type { ArtistCredit, MediaItem } from "./media-item";

/** A home rail plus the singular label its work detail shows under the credits. */
export type MediaSection = {
  heading: string;
  /** "Editorial" for the "Latest Editorials" rail, "Fashion Week", and so on. */
  category: string;
  items: MediaItem[];
};

/** What the gallery overlay renders for one opened card. */
export type WorkDetail = {
  title: string;
  credits: ArtistCredit[];
  category: string;
  /** The clicked frame first, then its neighbours from the same rail. */
  media: MediaItem[];
};

/** Frames a gallery holds at most: the clicked card plus five neighbours. */
const GALLERY_SIZE = 6;

/**
 * The design has no per-work asset set — a gallery is assembled on the fly from
 * the rail the card was clicked in, wrapping past the end so cards near the tail
 * still fill out. Items an editor could not have clicked (the Latest Editorial
 * feature is not itself in the rail) fall back to starting at the rail head.
 */
export function buildWorkDetail(
  item: MediaItem,
  section: MediaSection,
): WorkDetail {
  const { items } = section;
  const start = Math.max(0, items.indexOf(item));
  const media = [item];

  for (let step = 1; media.length < GALLERY_SIZE && step <= items.length; step++) {
    const next = items[(start + step) % items.length];
    if (next && next !== item) media.push(next);
  }

  return {
    title: item.title ?? section.heading,
    credits: item.credits,
    category: section.category,
    media,
  };
}
