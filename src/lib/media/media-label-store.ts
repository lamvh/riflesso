import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isMissingTable } from "@/lib/dashboard/content-history-types";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import {
  applyLabelChange,
  EMPTY_LABEL,
  isInFolder,
  LABEL_LIMITS,
  normalizeFolder,
  normalizeTag,
  type MediaLabel,
  type MediaLabelChange,
  type MediaLabelMap,
  type MediaLabelsReport,
  type MediaLabelUpdateResult,
} from "./media-label-types";

/*
 * Reads and writes media_library_labels with the service role. Every entry
 * point returns a result instead of throwing, so a missing table or a paused
 * project only switches organising off — the Media screen keeps working.
 */

const TABLE = "media_library_labels";
/** Supabase caps a response at 1000 rows by default. */
const PAGE_SIZE = 1000;
/** `.in()` filters travel in the URL; keep each request comfortably short. */
const KEY_CHUNK = 100;

type Row = { object_key: string; folder: string; tags: string[] | null };

const MIGRATION_HINT =
  "Folders and tags need the media_library_labels table. Back up the database, then run supabase/migrations/20261113040000_add_media_library_labels.sql.";

/** A key the bucket could hold: no whitespace, control characters or "..". */
const isObjectKey = (key: unknown): key is string =>
  typeof key === "string" &&
  key.length > 0 &&
  key.length <= 1024 &&
  !key.includes("..") &&
  !/[\s\u0000-\u001f\u007f]/.test(key);

const toLabel = (row: Row): MediaLabel => ({ folder: row.folder ?? "", tags: row.tags ?? [] });

const chunks = <T>(list: T[], size: number) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, index) => list.slice(index * size, (index + 1) * size));

const failure = (error: { code?: string; message: string }): MediaLabelUpdateResult => ({
  ok: false,
  error: isMissingTable(error) ? MIGRATION_HINT : error.message,
});

/**
 * Every row a query returns, page by page. `query` must be rebuilt per page
 * (supabase-js builders are single-use) and carry a stable order.
 */
async function selectAllRows(query: (from: number, to: number) => PromiseLike<{ data: unknown; error: { code?: string; message: string } | null }>) {
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await query(from, from + PAGE_SIZE - 1);
    if (error) return { error };
    const page = (data ?? []) as Row[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return { rows };
  }
}

const COLUMNS = "object_key, folder, tags";

export async function readMediaLabels(): Promise<MediaLabelsReport> {
  const client = serviceRoleClient();
  if (!client) return { state: "unconfigured" };
  try {
    const result = await selectAllRows((from, to) =>
      client.from(TABLE).select(COLUMNS).order("object_key").range(from, to),
    );
    if ("error" in result) {
      const { error } = result;
      return isMissingTable(error!) ? { state: "missing" } : { state: "error", message: error!.message };
    }
    const labels: MediaLabelMap = {};
    for (const row of result.rows) labels[row.object_key] = toLabel(row);
    return { state: "ok", labels };
  } catch (error) {
    return { state: "error", message: error instanceof Error ? error.message : "Folders and tags could not be read" };
  }
}

/** Current labels of the given keys; keys without a row are left out. */
async function readLabelsOf(client: SupabaseClient, keys: string[]) {
  const labels: MediaLabelMap = {};
  for (const part of chunks(keys, KEY_CHUNK)) {
    const { data, error } = await client.from(TABLE).select(COLUMNS).in("object_key", part);
    if (error) return { error };
    for (const row of data as Row[]) labels[row.object_key] = toLabel(row);
  }
  return { labels };
}

/**
 * Writes the final label of each key: rows that still carry a folder or a tag
 * are upserted, rows left empty are deleted.
 */
async function writeLabels(client: SupabaseClient, next: MediaLabelMap) {
  const now = new Date().toISOString();
  const entries = Object.entries(next);
  const kept = entries.filter(([, label]) => label.folder || label.tags.length);
  const emptied = entries.filter(([, label]) => !label.folder && !label.tags.length).map(([key]) => key);

  for (const part of chunks(kept, PAGE_SIZE)) {
    const { error } = await client
      .from(TABLE)
      .upsert(part.map(([key, label]) => ({ object_key: key, folder: label.folder, tags: label.tags, updated_at: now })));
    if (error) return error;
  }
  for (const part of chunks(emptied, KEY_CHUNK)) {
    const { error } = await client.from(TABLE).delete().in("object_key", part);
    if (error) return error;
  }
  return null;
}

/** Validates and cleans a change; returns a message when it can't be applied. */
function cleanChange(change: MediaLabelChange): MediaLabelChange | string {
  const clean: MediaLabelChange = {};
  if (change.folder !== undefined) {
    const folder = typeof change.folder === "string" ? normalizeFolder(change.folder) : null;
    if (folder === null) {
      return `Folder names go at most ${LABEL_LIMITS.folderDepth} levels deep, ${LABEL_LIMITS.folderSegment} characters a level.`;
    }
    clean.folder = folder;
  }
  for (const field of ["addTags", "removeTags"] as const) {
    const list = change[field];
    if (list === undefined) continue;
    if (!Array.isArray(list)) return "Tags must be a list.";
    const tags = list.map((tag) => (typeof tag === "string" ? normalizeTag(tag) : null));
    if (tags.some((tag) => tag === null)) return `A tag is empty or longer than ${LABEL_LIMITS.tag} characters.`;
    clean[field] = tags as string[];
  }
  return clean;
}

export async function changeMediaLabels(keys: unknown, change: MediaLabelChange): Promise<MediaLabelUpdateResult> {
  if (!Array.isArray(keys) || keys.length === 0) return { ok: false, error: "Choose at least one file." };
  if (keys.length > LABEL_LIMITS.keys) return { ok: false, error: `Change at most ${LABEL_LIMITS.keys} files at a time.` };
  if (!keys.every(isObjectKey)) return { ok: false, error: "That is not a stored file." };

  const clean = cleanChange(change ?? {});
  if (typeof clean === "string") return { ok: false, error: clean };

  const client = serviceRoleClient();
  if (!client) return { ok: false, error: "Supabase is not configured, so folders and tags can't be saved." };

  try {
    const unique = [...new Set(keys)];
    const current = await readLabelsOf(client, unique);
    if ("error" in current) return failure(current.error!);

    const next: MediaLabelMap = {};
    for (const key of unique) next[key] = applyLabelChange(current.labels[key] ?? EMPTY_LABEL, clean);

    const error = await writeLabels(client, next);
    return error ? failure(error) : { ok: true, labels: next };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Folders and tags could not be saved" };
  }
}

/**
 * Renames a folder and everything nested in it: "Albums/Old" → "Albums/New"
 * also moves "Albums/Old/BTS". Renaming to '' moves the files out of folders.
 */
export async function moveMediaFolder(from: unknown, to: unknown): Promise<MediaLabelUpdateResult> {
  const source = typeof from === "string" ? normalizeFolder(from) : null;
  const target = typeof to === "string" ? normalizeFolder(to) : null;
  if (!source) return { ok: false, error: "Choose a folder to rename." };
  if (target === null) {
    return { ok: false, error: `Folder names go at most ${LABEL_LIMITS.folderDepth} levels deep, ${LABEL_LIMITS.folderSegment} characters a level.` };
  }
  if (target && isInFolder(target, source) && target !== source) {
    return { ok: false, error: "A folder can't be moved inside itself." };
  }

  const client = serviceRoleClient();
  if (!client) return { ok: false, error: "Supabase is not configured, so folders and tags can't be saved." };

  try {
    /* The folder itself, then anything nested under it. LIKE wildcards in the
       name are escaped so "50%_off" matches only itself. */
    const exact = await selectAllRows((start, end) =>
      client.from(TABLE).select(COLUMNS).eq("folder", source).order("object_key").range(start, end),
    );
    if ("error" in exact) return failure(exact.error!);
    const nested = await selectAllRows((start, end) =>
      client
        .from(TABLE)
        .select(COLUMNS)
        .like("folder", `${source.replace(/[%_\\]/g, "\\$&")}/%`)
        .order("object_key")
        .range(start, end),
    );
    if ("error" in nested) return failure(nested.error!);

    const next: MediaLabelMap = {};
    for (const row of [...exact.rows, ...nested.rows]) {
      const rest = row.folder.slice(source.length).replace(/^\//, "");
      const folder = normalizeFolder([target, rest].filter(Boolean).join("/"));
      if (folder === null) return { ok: false, error: "That would nest some folders too deep." };
      next[row.object_key] = { ...toLabel(row), folder };
    }

    const writeError = await writeLabels(client, next);
    return writeError ? failure(writeError) : { ok: true, labels: next };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The folder could not be renamed" };
  }
}

/** Drops the rows of files that left the bucket. Best effort: a failure only leaves stale rows. */
export async function forgetMediaLabels(keys: string[]) {
  const client = serviceRoleClient();
  if (!client || keys.length === 0) return;
  try {
    for (const part of chunks(keys, KEY_CHUNK)) await client.from(TABLE).delete().in("object_key", part);
  } catch {
    /* Stale rows are harmless: nothing lists a label without its file. */
  }
}
