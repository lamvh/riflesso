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
 * Two kinds of card open a gallery.
 *
 * A card that fronts a shoot carries that shoot's frames and shows all of them.
 * A standalone frame has no set of its own, so the gallery is assembled from the
 * rail it was clicked in, wrapping past the end so cards near the tail still
 * fill out. Items an editor could not have clicked (a feature block that is not
 * itself in the rail) fall back to starting at the rail head.
 */
export function buildWorkDetail(
  item: MediaItem,
  section: MediaSection,
): WorkDetail {
  /*
   * A card that fronts a shoot already knows its own frames — show the whole
   * shoot, however long, rather than truncating it to the neighbour count.
   */
  if (item.gallery?.length) {
    return {
      title: item.title ?? section.heading,
      credits: item.credits,
      category: item.category ?? section.category,
      media: item.gallery,
    };
  }

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
