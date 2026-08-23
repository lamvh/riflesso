import type { AdminState, AlbumDraft } from "./admin-state";
import type { Album } from "./admin-types";

/** Newest first, and short — the panel it feeds shows five rows. */
const ACTIVITY_LIMIT = 8;

/** Record what an action did: the same sentence toasts and joins the feed. */
export const note = (state: AdminState, text: string): AdminState => ({
  ...state,
  toast: text,
  activity: [text, ...state.activity].slice(0, ACTIVITY_LIMIT),
});

export function swap<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const out = list.slice();
  [out[index], out[target]] = [out[target], out[index]];
  return out;
}

export const patchAt = <T,>(list: T[], index: number, patch: Partial<T>): T[] =>
  list.map((item, i) => (i === index ? { ...item, ...patch } : item));

export const dropAt = <T,>(list: T[], index: number): T[] =>
  list.filter((_, i) => i !== index);

/**
 * Collapse the drawer's frame grid back into the album. The first frame leads,
 * and it is what the rail card shows.
 */
export function fromDraft(draft: AlbumDraft): Album {
  const shots = draft.shots.filter((shot) => shot.src.trim());
  return {
    id: draft.id,
    title: draft.title.trim(),
    kind: draft.kind,
    frames: shots.map((shot) => shot.src),
    cover: shots[0]?.src ?? draft.cover,
    pos: shots[0]?.pos ?? draft.pos,
    video: draft.video,
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
