"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { findPublishProblem } from "@/lib/content/site-content-validation";
import { withVisibilityDefaults } from "@/lib/content/site-visibility";
import { CHANGE_AREA_LABEL, changedAreas } from "@/lib/dashboard/admin-changes";
import { serializeContent } from "@/lib/dashboard/admin-state";
import { fetchLatestSiteContent } from "@/lib/dashboard/fetch-latest-site-content";
import { publishSiteContent } from "@/lib/dashboard/publish-site-content";
import { rebaseSiteContent } from "@/lib/dashboard/rebase-site-content";

import { useAdmin } from "./admin-store";

/** Quiet time after the last edit before saving, so typing is one save, not one per key. */
const DEBOUNCE_MS = 800;

export type SaveStatus =
  | { kind: "off"; reason: "unconfigured" | "unreachable" }
  | { kind: "saved" }
  | { kind: "pending" }
  | { kind: "paused" }
  | { kind: "saving" }
  | { kind: "failed"; message: string };

/** Normalised so content saved by older builds compares field for field. */
const normal = (content: SiteContent) => pickSiteContent(withVisibilityDefaults(content));

/** Merges this tab's edits (since `baseline`) onto what the database holds now. */
async function rebaseOntoLatest(
  baseline: string,
  ours: SiteContent,
): Promise<
  | { ok: true; next: { base: SiteContent; theirs: SiteContent; revision: number } }
  | { ok: false; message?: string }
> {
  const latest = await fetchLatestSiteContent().catch(() => null);
  if (!latest) return { ok: false };
  const theirs = normal(latest.content);
  const base = normal(JSON.parse(baseline) as SiteContent);
  /* Checked here against the failed snapshot for the message; the reducer
     merges again against the live state. */
  const merged = rebaseSiteContent(base, normal(ours), theirs);
  if (!merged.ok) {
    return {
      ok: false,
      message: `Someone else changed the same ${merged.conflicts.join(", ")} in the meantime — reload the dashboard to pick up their version`,
    };
  }
  return {
    ok: true,
    next: { base, theirs, revision: latest.revision },
  };
}

/**
 * Every edit is written to the live site on its own: there is no Publish step.
 * It goes through the same transactional publish as before, so a save is still
 * all-or-nothing and still refused when another tab saved in the meantime.
 *
 * One save runs at a time. Edits made while it runs are picked up by the next
 * one. Content that failed (invalid, or rejected by the server) is not resent
 * until it changes, so a broken field cannot hammer the database; `retry`
 * forces it.
 *
 * A save refused as stale (another tab or editor published first) is merged
 * onto the latest publish when the two touched different things, and the
 * next save goes out on top of it. Only a real clash asks for a reload.
 *
 * The browser draft keeps unsaved edits through a reload.
 */
export function useAutosave(): { status: SaveStatus; retry: () => void } {
  const { state, dispatch, dirty, changes } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<{ content: string; message: string } | null>(null);
  const inFlight = useRef(false);

  const off = state.source === "unconfigured" || state.source === "unreachable";
  const content = pickSiteContent(state);
  const serialized = serializeContent(content);
  const failedThis = failure?.content === serialized;

  const save = useCallback(async () => {
    if (inFlight.current) return;
    const snapshot = pickSiteContent(state);
    const snapshotText = serializeContent(snapshot);

    const problem = findPublishProblem(snapshot);
    if (problem) {
      setFailure({ content: snapshotText, message: problem });
      return;
    }

    inFlight.current = true;
    setSaving(true);
    try {
      /* Typed edits (copy, settings) log no line of their own; name the
         areas they touched so the history entry is never blank. */
      const summary = state.unsavedActivity.length
        ? state.unsavedActivity
        : changedAreas(changes).map((area) => `Edited ${CHANGE_AREA_LABEL[area]}`);
      const result = await publishSiteContent(snapshot, state.revision, {
        summary,
        restore: state.restoring,
      });
      if (result.ok) {
        setFailure(null);
        dispatch({
          type: "saved",
          revision: result.revision,
          baseline: snapshotText,
          sentActivity: state.unsavedActivity.length,
        });
      } else if (result.stale) {
        const rebased = await rebaseOntoLatest(state.baseline, snapshot);
        if (rebased.ok) {
          setFailure(null);
          dispatch({ type: "rebased", ...rebased.next });
        } else {
          setFailure({ content: snapshotText, message: rebased.message ?? result.error });
        }
      } else {
        setFailure({ content: snapshotText, message: result.error });
      }
    } catch {
      setFailure({ content: snapshotText, message: "Saving failed. Check the connection." });
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }, [state, dispatch, changes]);

  useEffect(() => {
    if (!state.hydrated || off || !dirty || saving || failedThis || state.autosavePaused) return;
    const timer = setTimeout(save, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.hydrated, off, dirty, saving, failedThis, save, state.autosavePaused]);

  const retry = () => {
    setFailure(null);
    void save();
  };

  const status: SaveStatus = off
    ? { kind: "off", reason: state.source as "unconfigured" | "unreachable" }
    : saving
      ? { kind: "saving" }
      : failedThis
        ? { kind: "failed", message: failure.message }
        : dirty && state.autosavePaused
          ? { kind: "paused" }
          : dirty
            ? { kind: "pending" }
          : { kind: "saved" };

  return { status, retry };
}
