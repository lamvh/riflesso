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
};

export const STORIES = {
  gildedFrame: {
    slug: "gilded-frame",
    title: "The Gilded Frame",
    category: "Editorial",
    credits: [
      ["Bincio", "Photography"],
      ["Nguyen Tan Thanh", "Styling"],
    ],
  },
  settingCurls: {
    slug: "setting-curls",
    title: "Setting Curls",
    category: "Editorial",
    credits: [
      ["May Truong", "Hair"],
      ["Dinh Tran", "Makeup"],
    ],
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
  },
} as const satisfies Record<string, Story>;

/**
 * The rail card for a shoot. The repo no longer ships imagery, so the shoot
 * keeps its title and credits but starts with no frames: its album is filled
 * by uploading from the dashboard.
 */
export function storyCard(story: Story): MediaItem {
  const { title, category, credits } = story;
  return { ...imageItem("", credits, title), category, gallery: [] };
}

/** Every shoot as a rail card, keyed the same way as `STORIES`. */
export const STORY_CARDS = Object.fromEntries(
  Object.entries(STORIES).map(([key, story]) => [key, storyCard(story)]),
) as Record<keyof typeof STORIES, MediaItem>;
