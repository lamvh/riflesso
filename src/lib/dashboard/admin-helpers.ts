import { isVideoSrc } from "@/lib/media-src";

import type { AdminState, AlbumDraft } from "./admin-state";
import type { Album } from "./admin-types";

/** Newest first, and short — the panel it feeds shows five rows. */
const ACTIVITY_LIMIT = 8;
/** Lines one save can file in the history. */
const UNSAVED_LIMIT = 40;

/** Record what an action did: the same sentence toasts and joins the feed. */
export const note = (state: AdminState, text: string): AdminState => ({
  ...state,
  toast: text,
  toastTone: "info",
  activity: [text, ...state.activity].slice(0, ACTIVITY_LIMIT),
  unsavedActivity: [text, ...state.unsavedActivity].slice(0, UNSAVED_LIMIT),
});

export function swap<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const out = list.slice();
  [out[index], out[target]] = [out[target], out[index]];
  return out;
}

/** Take the item at `from` out and put it back at `to` (a drag-and-drop move). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const out = list.slice();
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

export const patchAt = <T,>(list: T[], index: number, patch: Partial<T>): T[] =>
  list.map((item, i) => (i === index ? { ...item, ...patch } : item));

export const dropAt = <T,>(list: T[], index: number): T[] =>
  list.filter((_, i) => i !== index);

/**
 * Collapse the drawer's frame grid back into the album. The first frame leads,
 * and it is what the rail card shows. A cover that changed is re-judged as
 * video or image by its extension.
 */
export function fromDraft(draft: AlbumDraft): Album {
  const shots = draft.shots
    .map((shot) => ({ ...shot, src: shot.src.trim() }))
    .filter((shot) => shot.src);
  const cover = shots[0]?.src ?? draft.cover;
  return {
    id: draft.id,
    title: draft.title.trim(),
    kind: draft.kind,
    frames: shots.map((shot) => shot.src),
    cover,
    pos: shots[0]?.pos ?? draft.pos,
    video: cover === draft.cover ? draft.video : isVideoSrc(cover),
    live: draft.live,
    home: draft.home,
    credits: draft.credits.filter((credit) => credit.name.trim()),
  };
}

/** Apply a patch to whichever draft the drawer currently holds. */
export function withDraft(
  state: AdminState,
  mutate: (draft: never) => object,
): AdminState {
  if (!state.drawer) return state;
  const draft = { ...state.drawer.draft, ...mutate(state.drawer.draft as never) };
  return { ...state, drawer: { ...state.drawer, draft } as AdminState["drawer"] };
}

/** How the dashboard names an album; a title is optional. */
export const albumLabel = (album: { title: string }) => album.title.trim() || "Untitled album";
