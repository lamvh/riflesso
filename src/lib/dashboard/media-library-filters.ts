import { folderTree, isInFolder, sameTag, type MediaLabel } from "@/lib/media/media-label-types";

import { GROUP_LABEL, groupId, type MediaGroup } from "./media-groups";

/*
 * Narrowing the library by folder, album, artist or tag. Shared by the Media
 * screen and the "Choose from library" picker so both read the same way.
 * Pure: it works on files already joined with their label and groups.
 */

export type OrganisedFile = { key: string; label: MediaLabel; groups: MediaGroup[] };

export type MediaCatalogue = {
  /** Every folder level in use, sorted. */
  folders: string[];
  /** Files in each folder, nested folders included. */
  counts: Map<string, number>;
  unfiled: number;
  tags: string[];
  /** Files carrying each tag (keyed by the spelling listed in `tags`). */
  tagCounts: Map<string, number>;
  groups: MediaGroup[];
};

const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });

/**
 * Folders, tags and groups in use among `files`, for navigation and filters.
 * `extraFolders` are folders created while empty; they list with a 0 count.
 */
export function mediaCatalogue(files: OrganisedFile[], extraFolders: string[] = []): MediaCatalogue {
  const folders = folderTree([...files.map((file) => file.label.folder).filter(Boolean), ...extraFolders]);
  const counts = new Map(folders.map((path) => [path, 0]));
  const tags: string[] = [];
  const tagCounts = new Map<string, number>();
  const groups = new Map<string, MediaGroup>();
  let unfiled = 0;

  for (const file of files) {
    if (!file.label.folder) unfiled += 1;
    for (const path of folders) if (isInFolder(file.label.folder, path)) counts.set(path, counts.get(path)! + 1);
    for (const tag of file.label.tags) {
      const known = tags.find((name) => sameTag(name, tag));
      if (!known) tags.push(tag);
      tagCounts.set(known ?? tag, (tagCounts.get(known ?? tag) ?? 0) + 1);
    }
    for (const group of file.groups) groups.set(groupId(group), group);
  }

  return {
    folders,
    counts,
    unfiled,
    tags: tags.sort(byName),
    tagCounts,
    groups: [...groups.values()].sort((a, b) => a.kind.localeCompare(b.kind) || byName(a.name, b.name)),
  };
}

/** Select options for the albums, artists and tags of a catalogue. */
export const groupAndTagOptions = (catalogue: MediaCatalogue) => [
  ...catalogue.groups.map((group) => ({ value: groupId(group), label: `${GROUP_LABEL[group.kind]} · ${group.name}` })),
  ...catalogue.tags.map((tag) => ({ value: `tag:${tag}`, label: `#${tag}` })),
];

/** Select options for the folders of a catalogue ("folder:…"). */
export const folderOptions = (catalogue: MediaCatalogue) =>
  catalogue.folders.map((path) => ({ value: `folder:${path}`, label: `Folder · ${path.replaceAll("/", " / ")}` }));

/**
 * Whether a file falls in a scope: "" (everything), "folder:…" (nested
 * folders included), "tag:…" (any case), or a group id ("album:…", "artist:…").
 */
export function inMediaScope(file: OrganisedFile, scope: string): boolean {
  if (!scope) return true;
  if (scope.startsWith("folder:")) return isInFolder(file.label.folder, scope.slice("folder:".length));
  if (scope.startsWith("tag:")) return file.label.tags.some((tag) => sameTag(tag, scope.slice("tag:".length)));
  return file.groups.some((group) => groupId(group) === scope);
}

/** Search across name, folder, tags, group names and any extra text. */
export function matchesMediaSearch(file: OrganisedFile, needle: string, extra: string[] = []): boolean {
  if (!needle) return true;
  return [file.key, file.label.folder, ...file.label.tags, ...file.groups.map((group) => group.name), ...extra].some(
    (text) => text.toLowerCase().includes(needle),
  );
}
