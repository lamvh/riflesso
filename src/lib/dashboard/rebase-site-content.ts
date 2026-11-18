import type { SiteContent } from "@/lib/content/site-content-types";

/*
 * Three-way merge for a save refused as stale ("someone published in the
 * meantime"). `base` is what this tab last loaded or saved, `ours` the tab's
 * working copy, `theirs` what the database holds now. Whatever only one side
 * changed is taken from that side; the save then retries on top of theirs.
 *
 * Granularity: each settings field on its own, and each record of a list by
 * id (plus the list's order). Two sides changing the same field or record
 * differently is a conflict, and nothing is merged: the editor reloads.
 */

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Area names as the dashboard labels them, for the conflict message. */
const AREA_LABEL: Record<keyof SiteContent, string> = {
  settings: "Site settings",
  contacts: "contact cards",
  artists: "artists",
  albums: "albums",
  cats: "categories",
  slides: "hero slides",
  blocks: "homepage sections",
};

type Merge<T> = { ok: true; value: T } | { ok: false };

/** One value: whichever side moved away from the base wins; both moving differently conflicts. */
function mergeValue<T>(base: T, ours: T, theirs: T): Merge<T> {
  if (same(ours, base)) return { ok: true, value: theirs };
  if (same(theirs, base) || same(ours, theirs)) return { ok: true, value: ours };
  return { ok: false };
}

/** An object field by field (used for settings). */
function mergeFields<T extends object>(base: T, ours: T, theirs: T): Merge<T> {
  const keys = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)]) as Set<keyof T>;
  const value = {} as T;
  for (const key of keys) {
    const merged = mergeValue(base[key], ours[key], theirs[key]);
    if (!merged.ok) return merged;
    if (merged.value !== undefined) value[key] = merged.value;
  }
  return { ok: true, value };
}

type WithId = { id: string };
const hasIds = (list: unknown[]): list is WithId[] =>
  list.every((item) => typeof (item as Partial<WithId>)?.id === "string");

/** A list of records by id: additions, removals and edits from either side, plus order. */
function mergeList<T extends WithId>(base: T[], ours: T[], theirs: T[]): Merge<T[]> {
  const ids = (list: T[]) => list.map((item) => item.id);
  const byId = (list: T[]) => new Map(list.map((item) => [item.id, item]));
  const [b, o, t] = [byId(base), byId(ours), byId(theirs)];

  /* Each record, missing meaning "removed" (or "not there yet"). */
  const records = new Map<string, T>();
  for (const id of new Set([...b.keys(), ...o.keys(), ...t.keys()])) {
    const merged = mergeValue(b.get(id), o.get(id), t.get(id));
    if (!merged.ok) return { ok: false };
    if (merged.value) records.set(id, merged.value);
  }

  /* Order: judged on the records the base already had, so adding one is not
     a reorder. Take the side that reordered, then append what either added. */
  const baseOrder = (list: T[]) => ids(list).filter((id) => b.has(id));
  const order = mergeValue(ids(base), baseOrder(ours), baseOrder(theirs));
  if (!order.ok) {
    /* Both reordered differently: only safe when they agree on the records both still have. */
    const shared = (list: T[]) => ids(list).filter((id) => o.has(id) && t.has(id));
    if (!same(shared(ours), shared(theirs))) return { ok: false };
  }
  const primary = order.ok ? order.value : ids(ours);
  const seen = new Set<string>();
  const value: T[] = [];
  for (const id of [...primary, ...ids(ours), ...ids(theirs)]) {
    const record = records.get(id);
    if (!record || seen.has(id)) continue;
    seen.add(id);
    value.push(record);
  }
  return { ok: true, value };
}

export type RebaseResult =
  | { ok: true; content: SiteContent }
  | { ok: false; conflicts: string[] };

export function rebaseSiteContent(base: SiteContent, ours: SiteContent, theirs: SiteContent): RebaseResult {
  const conflicts: string[] = [];
  const content = { ...theirs };

  const settings = mergeFields(base.settings, ours.settings, theirs.settings);
  if (settings.ok) content.settings = settings.value;
  else conflicts.push(AREA_LABEL.settings);

  const lists = ["contacts", "artists", "albums", "cats", "slides", "blocks"] as const;
  for (const area of lists) {
    const [b, o, t] = [base[area], ours[area], theirs[area]] as WithId[][];
    const merged = hasIds(b) && hasIds(o) && hasIds(t) ? mergeList(b, o, t) : mergeValue(b, o, t);
    if (merged.ok) (content as Record<string, unknown>)[area] = merged.value;
    else conflicts.push(AREA_LABEL[area]);
  }

  return conflicts.length ? { ok: false, conflicts } : { ok: true, content };
}
