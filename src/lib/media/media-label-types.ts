/*
 * Folders and tags the editor gives stored files (table media_library_labels).
 * Pure and free of server imports: the server action validates with the same
 * rules the dashboard uses to suggest and display them.
 */

export type MediaLabel = {
  /** '' = unfiled. Nested folders are a path, e.g. "Albums/Vogue Italia". */
  folder: string;
  tags: string[];
};

/** Object key → its label. Keys without a row are unfiled and untagged. */
export type MediaLabelMap = Record<string, MediaLabel>;

export type MediaLabelsReport =
  | { state: "ok"; labels: MediaLabelMap }
  /** Supabase is not configured. */
  | { state: "unconfigured" }
  /** Configured, but the media_library_labels migration has not been run. */
  | { state: "missing" }
  | { state: "error"; message: string };

/** One change applied to every chosen file. Fields left out stay as they are. */
export type MediaLabelChange = {
  /** New folder; '' moves the files out of any folder. */
  folder?: string;
  addTags?: string[];
  removeTags?: string[];
};

export type MediaLabelUpdateResult =
  | { ok: true; labels: MediaLabelMap }
  | { ok: false; error: string };

export const EMPTY_LABEL: MediaLabel = { folder: "", tags: [] };

export const LABEL_LIMITS = {
  /** Files one change may touch. */
  keys: 500,
  folderDepth: 4,
  folderSegment: 60,
  tag: 40,
  tagsPerFile: 20,
} as const;

/* Control characters never belong in a name; "/" splits folder levels. */
const CONTROL = /[\u0000-\u001f\u007f]/g;
const collapse = (value: string) => value.replace(CONTROL, "").replace(/\s+/g, " ").trim();

/**
 * " Albums / Vogue  Italia/ " → "Albums/Vogue Italia". Returns null when the
 * folder is too deep or a level is too long, so the caller can say why.
 */
export function normalizeFolder(input: string): string | null {
  const segments = input
    .split("/")
    .map(collapse)
    .filter(Boolean);
  if (segments.length > LABEL_LIMITS.folderDepth) return null;
  if (segments.some((segment) => segment.length > LABEL_LIMITS.folderSegment)) return null;
  return segments.join("/");
}

/** Trimmed, single-spaced tag, or null when empty or too long. */
export function normalizeTag(input: string): string | null {
  const tag = collapse(input).replace(/^#+/, "");
  return tag && tag.length <= LABEL_LIMITS.tag ? tag : null;
}

/** Tags compare without case: "BTS" and "bts" are the same tag. */
export const sameTag = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

/** Applies a change to one file's label. Tag order is kept; duplicates dropped. */
export function applyLabelChange(current: MediaLabel, change: MediaLabelChange): MediaLabel {
  const folder = change.folder ?? current.folder;
  const removed = change.removeTags ?? [];
  const tags: string[] = [];
  for (const tag of [...current.tags, ...(change.addTags ?? [])]) {
    if (removed.some((gone) => sameTag(gone, tag))) continue;
    if (!tags.some((kept) => sameTag(kept, tag))) tags.push(tag);
  }
  return { folder, tags: tags.slice(0, LABEL_LIMITS.tagsPerFile) };
}

/** Whether `folder` is `parent` or sits somewhere inside it. */
export const isInFolder = (folder: string, parent: string) =>
  folder === parent || folder.startsWith(`${parent}/`);

/** Every folder level in use: "A/B/C" also yields "A" and "A/B". Sorted. */
export function folderTree(folders: Iterable<string>): string[] {
  const all = new Set<string>();
  for (const folder of folders) {
    const parts = folder.split("/").filter(Boolean);
    parts.forEach((_, index) => all.add(parts.slice(0, index + 1).join("/")));
  }
  return [...all].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
}
