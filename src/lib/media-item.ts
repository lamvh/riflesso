/** A credit line under a rail card: who worked on the shoot, and in what role. */
export type ArtistCredit = {
  name: string;
  roles: string;
};

export type MediaItem = {
  src: string;
  kind: "image" | "video";
  credits: ArtistCredit[];
  /** Publication or brand, set in italics. Omitted on the New Signs rail. */
  title?: string;
};

/** Credits are authored as `[name, roles]` tuples to keep the data files scannable. */
type CreditTuple = readonly [name: string, roles: string];

const toCredits = (tuples: readonly CreditTuple[]): ArtistCredit[] =>
  tuples.map(([name, roles]) => ({ name, roles }));

export const imageItem = (
  src: string,
  credits: readonly CreditTuple[],
  title?: string,
): MediaItem => ({ src, kind: "image", credits: toCredits(credits), title });

export const videoItem = (
  src: string,
  credits: readonly CreditTuple[],
  title?: string,
): MediaItem => ({ src, kind: "video", credits: toCredits(credits), title });
