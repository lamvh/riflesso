import { imageItem, type MediaItem } from "@/lib/media-item";

/**
 * A shoot: one team, one set of frames.
 *
 * The rails elsewhere on the home page are flat lists of unrelated frames, and
 * clicking one assembles a gallery from whatever happens to sit next to it. A
 * story is the opposite — its frames are authored together, so the work detail
 * shows the whole shoot rather than a slice of the rail around it.
 */
export type Story = {
  slug: string;
  /** Publication or brand, set in italics under the frame. */
  title: string;
  /** Label the work detail prints under the credits. */
  category: string;
  credits: readonly (readonly [name: string, roles: string])[];
  /** How many `<slug>-NN.jpg` files sit in `public/assets/stories/`. */
  frameCount: number;
  /**
   * Which frame fronts the shoot on a rail. The gallery is re-ordered to lead
   * with it, so the opened frame is always the one that was clicked.
   */
  coverIndex?: number;
};

const frameSrc = (slug: string, index: number) =>
  `/assets/stories/${slug}-${String(index + 1).padStart(2, "0")}.jpg`;

export const STORIES = {
  gildedFrame: {
    slug: "gilded-frame",
    title: "The Gilded Frame",
    category: "Editorial",
    credits: [
      ["Bincio", "Photography"],
      ["Nguyen Tan Thanh", "Styling"],
    ],
    frameCount: 6,
  },
  settingCurls: {
    slug: "setting-curls",
    title: "Setting Curls",
    category: "Editorial",
    credits: [
      ["May Truong", "Hair"],
      ["Dinh Tran", "Makeup"],
    ],
    frameCount: 7,
  },
  traces: {
    slug: "traces",
    title: "Traces of Memories",
    category: "Editorial",
    credits: [
      ["Bincio", "Photography"],
      ["Diego Nguyen", "Makeup"],
      ["Shishi", "Hair"],
      ["Nguyen Tan Thanh", "Styling"],
      ["Victor Chau", "Lighting"],
      ["Cathy Tran", "Props"],
    ],
    frameCount: 3,
    coverIndex: 1,
  },
  /**
   * One production, run as five chapters: moss and rock, the yellow spiral,
   * the orchid boot, the cloud, then the red room. The site used to carry it
   * as three separate shoots.
   */
  artTwo: {
    slug: "art-02",
    title: "Art 02",
    category: "Campaign",
    credits: [
      ["Bincio", "Photography"],
      ["Nguyen Tan Thanh", "Styling"],
      ["Dinh Tran", "Makeup"],
      ["Shishi", "Hair"],
      ["May Truong", "Hair"],
    ],
    frameCount: 23,
  },
  elle: {
    slug: "elle",
    title: "Elle Vietnam",
    category: "Beauty",
    credits: [
      ["Bincio", "Creative Direction, Photography"],
      ["Nguyen Tan Thanh", "Styling"],
      ["Dinh Tran", "Makeup"],
      ["May Truong", "Hair"],
    ],
    frameCount: 10,
  },
  dep: {
    slug: "dep",
    title: "Đẹp Magazine",
    category: "Beauty",
    credits: [
      ["Bincio", "Photography"],
      ["Dinh Tran", "Makeup"],
      ["May Truong", "Hair"],
    ],
    frameCount: 2,
  },
  /** Thuy Anh's book: the printed editorial, then the tests behind it. */
  thuyAnh: {
    slug: "thuy-anh",
    title: "The Soulful Splendor",
    category: "Portfolio",
    credits: [
      ["Thuy Anh", "Muse"],
      ["Bincio", "Photography"],
      ["Nguyen Tan Thanh", "Styling"],
      ["Dinh Tran", "Makeup"],
      ["May Truong", "Hair"],
    ],
    frameCount: 5,
  },
} as const satisfies Record<string, Story>;

/**
 * The rail card for a shoot, carrying every frame of that shoot as its gallery.
 *
 * The gallery leads with the cover and then runs the shoot in order, wrapping
 * past the cover — so the first frame the overlay shows is the card that was
 * clicked, and the sequence after it still reads as the editor laid it out.
 */
export function storyCard(story: Story): MediaItem {
  const { slug, title, category, credits, frameCount } = story;
  const cover = story.coverIndex ?? 0;

  const gallery = Array.from({ length: frameCount }, (_, step) =>
    imageItem(frameSrc(slug, (cover + step) % frameCount), credits, title),
  );

  return { ...gallery[0], category, gallery };
}

/** Every shoot as a rail card, keyed the same way as `STORIES`. */
export const STORY_CARDS = Object.fromEntries(
  Object.entries(STORIES).map(([key, story]) => [key, storyCard(story)]),
) as Record<keyof typeof STORIES, MediaItem>;

/** A single frame of a shoot, for places that want one picture and no gallery. */
export const storyFrame = (story: Pick<Story, "slug">, index: number) =>
  frameSrc(story.slug, index);
