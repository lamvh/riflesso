"use client";

import { totalChanges, plural } from "@/lib/dashboard/admin-changes";

import { useAdmin } from "./admin-store";
import { Button, IconButton } from "./ui/controls";
import { PauseIcon, PlayIcon } from "./ui/icons";
import { useAutosaveStatus } from "./autosave-context";
import type { SaveStatus } from "./use-autosave";

const LOOK: Record<SaveStatus["kind"], [dot: string, headline: string]> = {
  off: ["bg-graphite", ""],
  saved: ["bg-live", "All changes saved"],
  pending: ["bg-draft", "Unsaved changes…"],
  paused: ["bg-draft", "Auto-save paused"],
  saving: ["bg-draft motion-safe:animate-pulse", "Saving…"],
  failed: ["bg-danger", "Not saved"],
};

/** Short labels for the mobile top bar. */
const SHORT: Record<SaveStatus["kind"], string> = {
  off: "Offline",
  saved: "Saved",
  pending: "Unsaved",
  paused: "Paused",
  saving: "Saving…",
  failed: "Not saved",
};

/**
 * Edits save on their own; this reports how that is going, offers a retry when
 * it is not, and can pause saving so edits can be previewed before they go live.
 */
export function SaveStatusIndicator({ compact = false }: { compact?: boolean }) {
  const { state, dispatch, changes } = useAdmin();
  const { status, retry } = useAutosaveStatus();
  const [dot, defaultHeadline] = LOOK[status.kind];
  const paused = state.autosavePaused;
  const off = status.kind === "off";

  const headline = off
    ? status.reason === "unconfigured"
      ? "Not connected"
      : "Database paused"
    : defaultHeadline;
  const detail =
    status.kind === "failed"
      ? status.message
      : status.kind === "paused"
        ? `${plural(totalChanges(changes), "change")} not on the site yet`
        : off
          ? status.reason === "unconfigured"
            ? "Add the Supabase keys to save"
            : "Edits are kept in this tab until it is back"
          : "";

  return (
    <div
      className={`flex max-w-full items-center gap-[4px] rounded-[8px] border border-line bg-paper py-[3px] pr-[3px] shadow-sheet ${
        compact ? "pl-[10px]" : "pl-[12px]"
      }`}
    >
      <p
        role="status"
        aria-live="polite"
        title={detail || undefined}
        className="flex h-[28px] min-w-0 items-center gap-[8px] pr-[6px] font-sans text-[13px] leading-none whitespace-nowrap"
      >
        <span aria-hidden="true" className={`h-[8px] w-[8px] shrink-0 rounded-full ${dot}`} />
        <span className="font-medium">{compact ? SHORT[status.kind] : headline}</span>
        {detail && !compact && (
          <span
            className={`truncate xl:max-w-[360px] ${status.kind === "failed" ? "max-w-[220px] text-danger" : "hidden text-graphite xl:inline"}`}
          >
            {detail}
          </span>
        )}
      </p>
      {(status.kind === "failed" || status.kind === "paused") && (
        <Button size="sm" variant={status.kind === "paused" ? "primary" : "secondary"} onClick={retry}>
          {status.kind === "paused" ? "Save now" : "Retry"}
        </Button>
      )}
      {!off && (
        <IconButton
          label={paused ? "Resume auto-save" : "Pause auto-save to preview edits before they go live"}
          onClick={() => dispatch({ type: "autosave/pause", paused: !paused })}
        >
          {paused ? <PlayIcon size={13} /> : <PauseIcon size={13} />}
        </IconButton>
      )}
    </div>
  );
}
