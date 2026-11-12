"use client";

import { Button } from "./ui/controls";
import { useAutosave, type SaveStatus } from "./use-autosave";

const LOOK: Record<SaveStatus["kind"], [dot: string, headline: string]> = {
  off: ["bg-graphite", ""],
  saved: ["bg-live", "All changes saved"],
  pending: ["bg-draft", "Unsaved changes…"],
  saving: ["bg-draft motion-safe:animate-pulse", "Saving…"],
  failed: ["bg-danger", "Not saved"],
};

/**
 * Where the header used to hold Publish: edits now save on their own, so this
 * only reports how that is going, and offers a retry when it is not.
 */
export function SaveStatusIndicator() {
  const { status, retry } = useAutosave();
  const [dot, defaultHeadline] = LOOK[status.kind];

  const headline =
    status.kind === "off"
      ? status.reason === "unconfigured"
        ? "Not connected"
        : "Database paused"
      : defaultHeadline;
  const detail =
    status.kind === "failed"
      ? status.message
      : status.kind === "off"
        ? status.reason === "unconfigured"
          ? "Add the Supabase keys to save"
          : "Edits are kept in this tab until it is back"
        : "";

  return (
    <div className="flex max-w-full items-center gap-[4px] rounded-[2px] border border-line bg-paper py-[3px] pr-[3px] pl-[12px]">
      <p
        role="status"
        aria-live="polite"
        title={detail || undefined}
        className="flex h-[28px] min-w-0 items-center gap-[8px] pr-[6px] font-sans text-[13px] leading-none whitespace-nowrap"
      >
        <span aria-hidden="true" className={`h-[8px] w-[8px] shrink-0 rounded-full ${dot}`} />
        <span className="font-medium">{headline}</span>
        {detail && (
          <span
            className={`truncate xl:max-w-[360px] ${status.kind === "failed" ? "max-w-[220px] text-danger" : "hidden text-graphite xl:inline"}`}
          >
            {detail}
          </span>
        )}
      </p>
      {status.kind === "failed" && (
        <Button size="sm" onClick={retry}>
          Retry
        </Button>
      )}
    </div>
  );
}
