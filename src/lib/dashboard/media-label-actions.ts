"use server";

import { changeMediaLabels, moveMediaFolder, readMediaLabels } from "@/lib/media/media-label-store";
import type {
  MediaLabelChange,
  MediaLabelsReport,
  MediaLabelUpdateResult,
} from "@/lib/media/media-label-types";

/*
 * Server actions behind folders and tags on the Media screen and the library
 * picker. Labels only: none of them touch the bucket, so a file's URL never
 * changes when it is filed or tagged.
 *
 * There is no sign-in yet, so anyone who can reach the dashboard can run
 * them. The worst a stray call can do is relabel files; every input is
 * validated in the store.
 */

export async function listMediaLabels(): Promise<MediaLabelsReport> {
  return readMediaLabels();
}

export async function updateMediaLabels(keys: string[], change: MediaLabelChange): Promise<MediaLabelUpdateResult> {
  return changeMediaLabels(keys, change);
}

export async function renameMediaFolder(from: string, to: string): Promise<MediaLabelUpdateResult> {
  return moveMediaFolder(from, to);
}
