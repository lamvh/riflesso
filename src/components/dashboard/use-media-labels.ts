"use client";

import { useCallback, useEffect, useState, useTransition, type Dispatch } from "react";

import type { AdminAction } from "@/lib/dashboard/admin-actions";
import { plural } from "@/lib/dashboard/admin-changes";
import {
  addMediaFolder,
  listMediaLabels,
  renameMediaFolder,
  renameMediaTag,
  updateMediaLabels,
} from "@/lib/dashboard/media-label-actions";
import {
  EMPTY_LABEL,
  type MediaLabel,
  type MediaLabelChange,
  type MediaLabelsReport,
  type MediaLabelUpdateResult,
} from "@/lib/media/media-label-types";

/**
 * Folders and tags of every stored file, plus folders created while empty,
 * loaded once and patched in place after each change. While the table is missing or Supabase is down the
 * report says so and `ready` is false; files still list, just unorganised.
 * Outcomes of changes are reported as toasts.
 */
export function useMediaLabels(dispatch: Dispatch<AdminAction>) {
  const [report, setReport] = useState<MediaLabelsReport | null>(null);
  const [saving, startSaving] = useTransition();
  const [, startLoading] = useTransition();

  const reload = useCallback(
    () =>
      startLoading(async () => {
        try {
          setReport(await listMediaLabels());
        } catch (error) {
          setReport({ state: "error", message: error instanceof Error ? error.message : "Folders and tags could not be read" });
        }
      }),
    [],
  );

  /* Read once when the screen opens. */
  useEffect(reload, [reload]);

  const labels = report?.state === "ok" ? report.labels : null;
  const labelOf = useCallback((key: string): MediaLabel => labels?.[key] ?? EMPTY_LABEL, [labels]);
  const createdFolders = report?.state === "ok" ? report.folders : [];
  /** Whether empty folders can be created (the migration has run). */
  const foldersReady = report?.state === "ok" && report.foldersReady;

  /** Runs one change and merges what the server saved. */
  const run = (
    work: () => Promise<MediaLabelUpdateResult>,
    done: (count: number) => string,
    after?: () => void,
  ) =>
    startSaving(async () => {
      let result: MediaLabelUpdateResult;
      try {
        result = await work();
      } catch (error) {
        result = { ok: false, error: error instanceof Error ? error.message : "The change could not be saved" };
      }
      if (!result.ok) {
        dispatch({ type: "toast", message: result.error, tone: "error" });
        return;
      }
      const { labels: saved, folders } = result;
      setReport((current) =>
        current?.state === "ok"
          ? { ...current, labels: { ...current.labels, ...saved }, folders: folders ?? current.folders }
          : current,
      );
      dispatch({ type: "toast", message: done(Object.keys(saved).length) });
      after?.();
    });

  const update = (keys: string[], change: MediaLabelChange, message: string) =>
    run(
      () => updateMediaLabels(keys, change),
      (count) => `${message} · ${plural(count, "file")}`,
    );

  const rename = (from: string, to: string, after?: () => void) =>
    run(
      () => renameMediaFolder(from, to),
      (count) => (to ? `Folder renamed · ${plural(count, "file")}` : `Folder removed · ${plural(count, "file")} unfiled`),
      after,
    );

  const createFolder = (path: string, after?: () => void) =>
    run(() => addMediaFolder(path), () => `Folder ${path.trim()} created`, after);

  /** Renames or merges a tag on every file; `to` null deletes it everywhere. */
  const retag = (from: string, to: string | null, after?: () => void) =>
    run(
      () => renameMediaTag(from, to),
      (count) => (to ? `#${from} → #${to} · ${plural(count, "file")}` : `#${from} deleted · ${plural(count, "file")}`),
      after,
    );

  return {
    report,
    ready: labels !== null,
    labelOf,
    createdFolders,
    foldersReady,
    saving,
    update,
    rename,
    createFolder,
    retag,
    reload,
  };
}
