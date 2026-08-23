/** Album kinds, the vocabulary the homepage sections source their rows from. */
export const ALBUM_KINDS = [
  "Editorial",
  "Campaign",
  "Couture",
  "Fashion Week",
  "New Signing",
] as const;

export type AlbumKind = (typeof ALBUM_KINDS)[number];

export type Credit = { name: string; role: string };

/**
 * One published set of images. Every card on a homepage row is an album: a
 * publication or brand, the frames behind it, and who worked on them.
 */
export type Album = {
  id: string;
  title: string;
  kind: AlbumKind;
  /** Every frame of the set, cover first. A standalone frame has just the one. */
  frames: string[];
  cover: string;
  /** CSS object-position for the cover crop. */
  pos: string;
  /** Video covers are previewed with a <video>, not an <img>. */
  video?: boolean;
  live: boolean;
  /** Whether the album is eligible for a homepage row. */
  home: boolean;
  credits: Credit[];
};

export type AdminArtist = {
  name: string;
  /** Comma-separated disciplines. */
  cats: string;
  territory: "US" | "EUROPE";
  image: string;
  pos: string;
  live: boolean;
  bio: string;
};

export type CategoryRow = { name: string; visible: boolean };

export type Slide = {
  pub: string;
  /** Rendered as one running line under the banner. */
  credit: string;
  src: string;
  pos: string;
  /** Caption colour, flipped to black over light imagery. */
  ink: string;
};

export const BLOCK_KINDS = ["Scroll row", "Full-bleed", "Banner"] as const;
export type BlockKind = (typeof BLOCK_KINDS)[number];

/** A homepage section, in the order it appears down the page. */
export type Block = {
  label: string;
  kind: BlockKind;
  source: AlbumKind;
  on: boolean;
};

/**
 * The activity feed, newest first. It records what this session actually did —
 * there is no edit history behind the dashboard to read, and a feed of invented
 * events would be worse than a short honest one.
 */
export type Activity = string[];
