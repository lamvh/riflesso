import type { SiteContent } from "@/lib/content/site-content-types";

/** Areas of the dashboard that hold publishable content. Each is also a View. */
export type ChangeArea = "artists" | "albums" | "cats" | "home" | "settings";

export const CHANGE_AREAS: ChangeArea[] = ["artists", "albums", "cats", "home", "settings"];

export const CHANGE_AREA_LABEL: Record<ChangeArea, string> = {
  artists: "Artists",
  albums: "Albums",
  cats: "Categories",
  home: "Homepage",
  settings: "Site settings",
};

export type ChangeCounts = Record<ChangeArea, number>;

/**
 * Records added, removed or edited since the last publish, plus one when the
 * order of the records that stayed has changed. An edit undone by hand counts
 * as no change.
 */
function listChanges<T extends { id: string }>(current: T[], baseline: T[]): number {
  const before = new Map(baseline.map((item) => [item.id, JSON.stringify(item)]));
  const currentIds = new Set(current.map((item) => item.id));

  let count = current.filter((item) => before.get(item.id) !== JSON.stringify(item)).length;
  count += baseline.filter((item) => !currentIds.has(item.id)).length;

  const keptNow = current.map((item) => item.id).filter((id) => before.has(id));
  const keptBefore = baseline.map((item) => item.id).filter((id) => currentIds.has(id));
  if (keptNow.join() !== keptBefore.join()) count += 1;

  return count;
}

export function countChanges(current: SiteContent, baseline: SiteContent): ChangeCounts {
  const settingsChanged =
    JSON.stringify(current.settings) === JSON.stringify(baseline.settings) ? 0 : 1;

  return {
    artists: listChanges(current.artists, baseline.artists),
    albums: listChanges(current.albums, baseline.albums),
    cats: listChanges(current.cats, baseline.cats),
    home:
      listChanges(current.slides, baseline.slides) + listChanges(current.blocks, baseline.blocks),
    settings: settingsChanged + listChanges(current.contacts, baseline.contacts),
  };
}

export const totalChanges = (counts: ChangeCounts) =>
  CHANGE_AREAS.reduce((total, area) => total + counts[area], 0);

export const changedAreas = (counts: ChangeCounts) =>
  CHANGE_AREAS.filter((area) => counts[area] > 0);

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;
