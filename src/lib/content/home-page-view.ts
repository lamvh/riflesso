import type { HeroSlide } from "@/data/home-hero-slides";
import type { Album, AlbumKind, Block, Slide } from "@/lib/dashboard/admin-types";
import type { MediaItem } from "@/lib/media-item";
import { isVideoSrc } from "@/lib/media-src";
import type { MediaSection } from "@/lib/work-detail";

/**
 * The label a work detail prints under the credits, per album kind. New
 * Signings have none, which is what makes their cards link to the directory
 * instead of opening a gallery.
 */
const GALLERY_LABEL: Record<AlbumKind, string | undefined> = {
  Editorial: "Editorial",
  Campaign: "Campaign",
  Couture: "Fashion Week",
  "Fashion Week": "Fashion Week",
  "New Signing": undefined,
};

export function albumToMediaItem(album: Album): MediaItem {
  const credits = album.credits.map((credit) => ({ name: credit.name, roles: credit.role }));
  /* New Signs cards print the credit alone; the album title is dashboard-only. */
  const title = album.kind === "New Signing" ? undefined : album.title;
  const item: MediaItem = {
    src: album.cover,
    kind: album.video ? "video" : "image",
    credits,
    title,
  };
  if (album.frames.length > 1) {
    item.gallery = album.frames.map((src, index) => ({
      src,
      kind: (index === 0 ? album.video : isVideoSrc(src)) ? "video" : "image",
      credits,
      title,
    }));
  }
  return item;
}

export type HomeSectionView =
  | { layout: "rail"; key: string; heading: string; items: MediaItem[]; category?: string }
  | { layout: "feature"; key: string; heading: string; item: MediaItem; section: MediaSection }
  | { layout: "banner"; key: string; heading: string; src: string };

/** Switched-on sections, top to bottom, with the albums each one shows. */
export function buildHomeSections(blocks: Block[], albums: Album[]): HomeSectionView[] {
  const shown = albums.filter((album) => album.live && album.home && album.cover);
  const railItems = new Map<AlbumKind, MediaItem[]>();
  const itemsOf = (kind: AlbumKind) => {
    if (!railItems.has(kind)) {
      railItems.set(kind, shown.filter((album) => album.kind === kind).map(albumToMediaItem));
    }
    return railItems.get(kind)!;
  };

  return blocks.flatMap((block): HomeSectionView[] => {
    if (!block.on) return [];
    const key = block.id;

    if (block.kind === "Banner") {
      return block.image ? [{ layout: "banner", key, heading: block.label, src: block.image }] : [];
    }

    if (block.kind === "Full-bleed") {
      const album =
        shown.find((candidate) => candidate.id === block.albumId) ??
        shown.find((candidate) => candidate.kind === block.source);
      if (!album) return [];
      const section: MediaSection = {
        heading: block.label,
        category: GALLERY_LABEL[block.source] ?? block.source,
        items: itemsOf(block.source),
      };
      return [
        { layout: "feature", key, heading: block.label, item: albumToMediaItem(album), section },
      ];
    }

    const items = itemsOf(block.source);
    if (!items.length) return [];
    return [
      {
        layout: "rail",
        key,
        heading: block.label,
        items,
        category: GALLERY_LABEL[block.source],
      },
    ];
  });
}

/**
 * The credit line is stored as "Name — Role, Name — Role". Roles may carry
 * their own commas ("Hair, Grooming"), so a comma only separates two credits
 * when the text after it names someone with an em dash.
 */
const CREDIT_SEPARATOR = /,\s*(?=[^,]*—)/;

export function toHeroSlides(slides: Slide[]): HeroSlide[] {
  return slides
    .filter((slide) => slide.src)
    .map((slide) => ({
      src: slide.src,
      position: slide.pos,
      captionColor: slide.ink,
      publication: slide.pub,
      credits: slide.credit
        .split(CREDIT_SEPARATOR)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const [name, ...role] = part.split("—");
          const roleText = role.join("—").trim();
          return { name: name.trim(), role: roleText ? ` ${roleText}, ` : ", " };
        }),
    }));
}
