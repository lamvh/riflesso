"use server";

import {
  createMediaFolder,
  readCreatedFolders,
  renameMediaFolderEverywhere,
  retagMediaLibrary,
} from "@/lib/media/media-folder-tag-store";
import { changeMediaLabels, readMediaLabels } from "@/lib/media/media-label-store";
import type {
  MediaLabelChange,
  MediaLabelsReport,
  MediaLabelUpdateResult,
} from "@/lib/media/media-label-types";

/*
 * Server actions behind folders and tags on the Media screen and the library
 * picker. Labels only: none of them touch the bucket, so a file's URL never
 * changes when it is filed, tagged, or its folder or tag is renamed.
 *
 * There is no sign-in yet, so anyone who can reach the dashboard can run
 * them. The worst a stray call can do is relabel files; every input is
 * validated in the store.
 */

/** Every file's label plus the created (possibly empty) folders. */
export async function listMediaLabels(): Promise<MediaLabelsReport> {
  const report = await readMediaLabels();
  if (report.state !== "ok") return report;
  const created = await readCreatedFolders();
  return { ...report, folders: created.folders, foldersReady: created.ready };
}

export async function updateMediaLabels(keys: string[], change: MediaLabelChange): Promise<MediaLabelUpdateResult> {
  return changeMediaLabels(keys, change);
}

/** Renames a folder and its nested folders; '' removes it (files stay, unfiled). */
export async function renameMediaFolder(from: string, to: string): Promise<MediaLabelUpdateResult> {
  return renameMediaFolderEverywhere(from, to);
}

export async function addMediaFolder(path: string): Promise<MediaLabelUpdateResult> {
  return createMediaFolder(path);
}

/** Renames (or merges) a tag on every file; `to` null deletes it everywhere. */
export async function renameMediaTag(from: string, to: string | null): Promise<MediaLabelUpdateResult> {
  return retagMediaLibrary(from, to);
}
