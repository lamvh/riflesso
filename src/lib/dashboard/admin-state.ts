import type {
  Activity,
  AdminArtist,
  Album,
  Block,
  CategoryRow,
  Credit,
  Slide,
} from "./admin-types";
import {
  seedAlbums,
  seedArtists,
  seedBlocks,
  seedCategories,
  seedSlides,
} from "./admin-seed";

/** A frame inside the album drawer's image grid. The first one is the cover. */
export type Shot = { src: string; pos: string };

export type ArtistDraft = AdminArtist & { catList: string[] };
export type AlbumDraft = Album & { shots: Shot[] };

export type Drawer =
  | { kind: "artist"; index: number; draft: ArtistDraft }
  | { kind: "album"; index: number; draft: AlbumDraft }
  | null;

export type AdminState = {
  artists: AdminArtist[];
  albums: Album[];
  cats: CategoryRow[];
  slides: Slide[];
  blocks: Block[];
  activity: Activity;
  /** Which hero slide the homepage screen is editing. */
  slide: number;
  /** Pending name in the categories screen's add field, so the page header's
      primary action can commit the same value the field holds. */
  newCat: string;
  drawer: Drawer;
  toast: string;
  /**
   * False until the stored draft has been read. The first paint has to render
   * the seed so server and client agree, which means the persist effect would
   * otherwise write that seed over the draft it is about to load.
   */
  hydrated: boolean;
};

export const initialAdminState = (): AdminState => ({
  artists: seedArtists(),
  albums: seedAlbums(),
  cats: seedCategories(),
  slides: seedSlides(),
  blocks: seedBlocks(),
  activity: [],
  slide: 0,
  newCat: "",
  drawer: null,
  toast: "",
  hydrated: false,
});

/** A blank record for the "new" case of each drawer. */
export const blankArtist = (): ArtistDraft => ({
  name: "",
  cats: "",
  territory: "US",
  image: "",
  pos: "50% 18%",
  live: false,
  bio: "",
  catList: [],
});

export const blankAlbum = (id: string): AlbumDraft => ({
  id,
  title: "",
  kind: "Editorial",
  frames: [],
  cover: "",
  pos: "50% 18%",
  live: false,
  home: false,
  credits: [{ name: "", role: "" }],
  shots: [],
});

export const toArtistDraft = (artist: AdminArtist): ArtistDraft => ({
  ...artist,
  catList: artist.cats
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean),
});

/**
 * The drawer edits the set as a grid of frames. The cover keeps the album's
 * hand-chosen crop; the rest take the default, which is all the site ever
 * applies to a frame that is not fronting anything.
 */
export const toAlbumDraft = (album: Album): AlbumDraft => ({
  ...album,
  credits: album.credits.map((credit) => ({ ...credit })),
  shots: album.frames.map((src, index) => ({
    src,
    pos: index === 0 ? album.pos : "50% 18%",
  })),
});

export const creditsLine = (credits: Credit[]) =>
  credits
    .filter((credit) => credit.name.trim())
    .map((credit) => `${credit.name} — ${credit.role}`)
    .join(", ");
