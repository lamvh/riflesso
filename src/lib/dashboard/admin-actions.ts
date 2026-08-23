import type { AdminState, AlbumDraft, ArtistDraft } from "./admin-state";
import type { Credit, Slide } from "./admin-types";

/** Edits to an artist or an album, including everything the drawer touches. */
export type RecordAction =
  | { type: "artist/open"; index: number }
  | { type: "artist/toggleLive"; index: number }
  | { type: "artist/save" }
  | { type: "artist/delete" }
  | { type: "album/open"; index: number }
  | { type: "album/toggleHome"; index: number }
  | { type: "album/save" }
  | { type: "album/delete" }
  | { type: "draft/set"; patch: Partial<ArtistDraft & AlbumDraft> }
  | { type: "draft/toggleCat"; cat: string }
  | { type: "draft/addCredit" }
  | { type: "draft/setCredit"; index: number; patch: Partial<Credit> }
  | { type: "draft/removeCredit"; index: number }
  | { type: "draft/addShot" }
  | { type: "draft/removeShot"; index: number }
  | { type: "drawer/close" };

/** Edits to how the site is arranged rather than to what it holds. */
export type SiteAction =
  | { type: "cat/setNew"; name: string }
  | { type: "cat/add" }
  | { type: "cat/rename"; index: number; name: string }
  | { type: "cat/toggle"; index: number }
  | { type: "cat/move"; index: number; delta: number }
  | { type: "cat/remove"; index: number }
  | { type: "slide/add" }
  | { type: "slide/select"; index: number }
  | { type: "slide/set"; patch: Partial<Slide> }
  | { type: "slide/move"; delta: number }
  | { type: "slide/remove" }
  | { type: "block/toggle"; index: number }
  | { type: "block/move"; index: number; delta: number };

/** Session furniture: the toast, and getting the stored draft back. */
export type SessionAction =
  | { type: "toast"; message: string }
  | { type: "restore"; state: Omit<AdminState, "drawer" | "toast" | "hydrated"> }
  | { type: "hydrated" }
  | { type: "reset" };

export type AdminAction = RecordAction | SiteAction | SessionAction;

const RECORD_PREFIXES = ["artist/", "album/", "draft/", "drawer/"];

export const isRecordAction = (action: AdminAction): action is RecordAction =>
  RECORD_PREFIXES.some((prefix) => action.type.startsWith(prefix));
