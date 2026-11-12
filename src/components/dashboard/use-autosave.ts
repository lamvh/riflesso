"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { pickSiteContent } from "@/lib/content/site-content-types";
import { findPublishProblem } from "@/lib/content/site-content-validation";
import { serializeContent } from "@/lib/dashboard/admin-state";
import { publishSiteContent } from "@/lib/dashboard/publish-site-content";

import { useAdmin } from "./admin-store";

/** Quiet time after the last edit before saving, so typing is one save, not one per key. */
const DEBOUNCE_MS = 800;

export type SaveStatus =
  | { kind: "off"; reason: "unconfigured" | "unreachable" }
  | { kind: "saved" }
  | { kind: "pending" }
  | { kind: "saving" }
  | { kind: "failed"; message: string };

/**
 * Every edit is written to the live site on its own: there is no Publish step.
 * It goes through the same transactional publish as before, so a save is still
 * all-or-nothing and still refused when another tab saved in the meantime.
 *
 * One save runs at a time. Edits made while it runs are picked up by the next
 * one. Content that failed (invalid, or rejected by the server) is not resent
 * until it changes, so a broken field cannot hammer the database; `retry`
 * forces it. The browser draft keeps unsaved edits through a reload.
 */
export function useAutosave(): { status: SaveStatus; retry: () => void } {
  const { state, dispatch, dirty } = useAdmin();
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
      const result = await publishSiteContent(snapshot, state.revision);
      if (result.ok) {
        setFailure(null);
        dispatch({ type: "saved", revision: result.revision, baseline: snapshotText });
      } else {
        setFailure({ content: snapshotText, message: result.error });
      }
    } catch {
      setFailure({ content: snapshotText, message: "Saving failed. Check the connection." });
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }, [state, dispatch]);

  useEffect(() => {
    if (!state.hydrated || off || !dirty || saving || failedThis) return;
    const timer = setTimeout(save, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state.hydrated, off, dirty, saving, failedThis, save]);

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
        : dirty
          ? { kind: "pending" }
          : { kind: "saved" };

  return { status, retry };
}
