"use client";

import { useCallback, useEffect, useState, useTransition, type Dispatch } from "react";

import type { AdminAction } from "@/lib/dashboard/admin-actions";
import { plural } from "@/lib/dashboard/admin-changes";
import { listMediaLabels, renameMediaFolder, updateMediaLabels } from "@/lib/dashboard/media-label-actions";
import {
  EMPTY_LABEL,
  type MediaLabel,
  type MediaLabelChange,
  type MediaLabelsReport,
  type MediaLabelUpdateResult,
} from "@/lib/media/media-label-types";

/**
 * Folders and tags of every stored file, loaded once and patched in place
 * after each change. While the table is missing or Supabase is down the
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

  /** Runs one change and merges what the server saved. */
  const run = (work: () => Promise<MediaLabelUpdateResult>, done: (count: number) => string) =>
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
      const saved = result.labels;
      setReport((current) =>
        current?.state === "ok" ? { state: "ok", labels: { ...current.labels, ...saved } } : current,
      );
      dispatch({ type: "toast", message: done(Object.keys(saved).length) });
    });

  const update = (keys: string[], change: MediaLabelChange, message: string) =>
    run(
      () => updateMediaLabels(keys, change),
      (count) => `${message} · ${plural(count, "file")}`,
    );

  const rename = (from: string, to: string) =>
    run(
      () => renameMediaFolder(from, to),
      (count) => (to ? `Folder renamed · ${plural(count, "file")}` : `Folder removed · ${plural(count, "file")} unfiled`),
    );

  return { report, ready: labels !== null, labelOf, saving, update, rename, reload };
}
