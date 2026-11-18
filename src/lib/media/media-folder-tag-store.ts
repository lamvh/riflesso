import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingTable } from "@/lib/dashboard/content-history-types";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import {
  COLUMNS,
  chunks,
  failure,
  moveMediaFolder,
  selectAllRows,
  TABLE as LABEL_TABLE,
  toLabel,
  writeLabels,
} from "./media-label-store";
import {
  isInFolder,
  LABEL_LIMITS,
  normalizeFolder,
  normalizeTag,
  replaceTag,
  sameTag,
  type MediaLabelMap,
  type MediaLabelUpdateResult,
} from "./media-label-types";

/*
 * Library-wide organising on the Media screen: folders created before any
 * file is in them (table media_library_folders), renaming or removing a
 * folder in both tables, and renaming / merging / deleting a tag on every
 * file that carries it. Like the label store, nothing here throws and
 * nothing touches the bucket.
 */

const FOLDER_TABLE = "media_library_folders";
const KEY_CHUNK = 100;

const FOLDER_HINT =
  "Empty folders need the media_library_folders table. Back up the database, then run supabase/migrations/20261118000000_add_media_library_folders.sql.";
const UNCONFIGURED = "Supabase is not configured, so folders and tags can't be saved.";
const FOLDER_RULES = `Folder names go at most ${LABEL_LIMITS.folderDepth} levels deep, ${LABEL_LIMITS.folderSegment} characters a level.`;

type FolderRow = { path: string };
type DbError = { code?: string; message: string };

const byPath = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });

async function selectFolders(client: SupabaseClient): Promise<{ error: DbError } | { folders: string[] }> {
  const result = await selectAllRows<FolderRow>((from, to) =>
    client.from(FOLDER_TABLE).select("path").order("path").range(from, to),
  );
  if ("error" in result) return { error: result.error! };
  return { folders: result.rows.map((row) => row.path).sort(byPath) };
}

/** Created folders, or `ready: false` while the table is missing or unreadable. */
export async function readCreatedFolders(): Promise<{ folders: string[]; ready: boolean }> {
  const client = serviceRoleClient();
  if (!client) return { folders: [], ready: false };
  try {
    const result = await selectFolders(client);
    return "error" in result ? { folders: [], ready: false } : { folders: result.folders, ready: true };
  } catch {
    return { folders: [], ready: false };
  }
}

const folderFailure = (error: DbError): MediaLabelUpdateResult => ({
  ok: false,
  error: isMissingTable(error) ? FOLDER_HINT : error.message,
});

/** Saves a folder so it shows even while empty (its parent levels list through folderTree). */
export async function createMediaFolder(path: unknown): Promise<MediaLabelUpdateResult> {
  const folder = typeof path === "string" ? normalizeFolder(path) : null;
  if (folder === null) return { ok: false, error: FOLDER_RULES };
  if (!folder) return { ok: false, error: "Name the folder." };

  const client = serviceRoleClient();
  if (!client) return { ok: false, error: UNCONFIGURED };
  try {
    const { error } = await client.from(FOLDER_TABLE).upsert({ path: folder }, { ignoreDuplicates: true });
    if (error) return folderFailure(error);
    const list = await selectFolders(client);
    return "error" in list ? folderFailure(list.error) : { ok: true, labels: {}, folders: list.folders };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The folder could not be created" };
  }
}

/**
 * Moves created-folder rows under `source` to `target` (or deletes them when
 * `target` is ''). A missing table is fine: there is nothing to move.
 */
async function moveCreatedFolders(client: SupabaseClient, source: string, target: string) {
  const current = await selectFolders(client);
  if ("error" in current) return isMissingTable(current.error) ? { folders: undefined } : { error: current.error };

  const moving = current.folders.filter((path) => isInFolder(path, source));
  if (moving.length === 0) return { folders: current.folders };

  const renamed = target
    ? moving.map((path) => normalizeFolder([target, path.slice(source.length).replace(/^\//, "")].filter(Boolean).join("/")))
    : [];
  if (renamed.some((path) => path === null)) return { error: { message: "That would nest some folders too deep." } };

  for (const part of chunks(moving, KEY_CHUNK)) {
    const { error } = await client.from(FOLDER_TABLE).delete().in("path", part);
    if (error) return { error };
  }
  if (renamed.length) {
    const { error } = await client
      .from(FOLDER_TABLE)
      .upsert(renamed.map((path) => ({ path: path! })), { ignoreDuplicates: true });
    if (error) return { error };
  }
  const after = await selectFolders(client);
  return "error" in after ? { error: after.error } : { folders: after.folders };
}

/**
 * Renames (or, with '', removes) a folder in both places: the files filed in
 * it and the created-folder list. Nested folders move along.
 */
export async function renameMediaFolderEverywhere(from: unknown, to: unknown): Promise<MediaLabelUpdateResult> {
  const moved = await moveMediaFolder(from, to);
  if (!moved.ok) return moved;

  /* moveMediaFolder validated both names, so these normalise cleanly. */
  const source = normalizeFolder(String(from))!;
  const target = normalizeFolder(String(to))!;
  const client = serviceRoleClient();
  if (!client) return moved;
  try {
    const result = await moveCreatedFolders(client, source, target);
    if ("error" in result) return { ok: false, error: `Files moved, but the folder list was not updated: ${result.error!.message}` };
    return { ...moved, folders: result.folders };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The folder could not be renamed" };
  }
}

/**
 * Renames a tag on every file (`to` a tag) or deletes it everywhere (`to`
 * null). Renaming onto an existing tag merges the two. Case-insensitive,
 * like every tag comparison.
 */
export async function retagMediaLibrary(from: unknown, to: unknown): Promise<MediaLabelUpdateResult> {
  const source = typeof from === "string" ? normalizeTag(from) : null;
  if (!source) return { ok: false, error: "Choose a tag." };
  const target = to === null ? null : typeof to === "string" ? normalizeTag(to) : undefined;
  if (target === undefined || (to !== null && target === null)) {
    return { ok: false, error: `A tag is empty or longer than ${LABEL_LIMITS.tag} characters.` };
  }
  if (target !== null && target === source) return { ok: true, labels: {} };

  const client = serviceRoleClient();
  if (!client) return { ok: false, error: UNCONFIGURED };
  try {
    /* Tags match without case, which an array filter can't do: read every
       tagged row and pick in code. The table holds one row per organised file. */
    const result = await selectAllRows((start, end) =>
      client.from(LABEL_TABLE).select(COLUMNS).order("object_key").range(start, end),
    );
    if ("error" in result) return failure(result.error!);

    const next: MediaLabelMap = {};
    for (const row of result.rows) {
      const label = toLabel(row);
      if (label.tags.some((tag) => sameTag(tag, source))) next[row.object_key] = replaceTag(label, source, target);
    }
    if (Object.keys(next).length === 0) return { ok: true, labels: {} };

    const error = await writeLabels(client, next);
    return error ? failure(error) : { ok: true, labels: next };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The tag could not be changed" };
  }
}
