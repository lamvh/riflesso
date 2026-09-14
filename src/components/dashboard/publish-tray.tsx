"use client";

import { useTransition } from "react";

import { pickSiteContent } from "@/lib/content/site-content-types";
import {
  CHANGE_AREA_LABEL,
  changedAreas,
  plural,
  totalChanges,
} from "@/lib/dashboard/admin-changes";
import { serializeContent } from "@/lib/dashboard/admin-state";
import { publishSiteContent } from "@/lib/dashboard/publish-site-content";

import { useAdmin } from "./admin-store";
import { Button } from "./ui/controls";

/**
 * The one place the dashboard spends colour: how much is waiting to go live,
 * where it is, and the button that sends it.
 */
export function PublishTray() {
  const { state, dispatch, changes, dirty } = useAdmin();
  const [publishing, startPublishing] = useTransition();
  const total = totalChanges(changes);
  const areas = changedAreas(changes).map((area) => CHANGE_AREA_LABEL[area]);

  const unconfigured = state.source === "unconfigured";
  /* The first publish is allowed with no edits: it seeds the database. */
  const canPublish = !unconfigured && !publishing && (dirty || state.source === "seed");

  const [dot, headline, detail] = unconfigured
    ? ["bg-graphite", "Not connected", "Add the Supabase keys to publish"]
    : publishing
      ? ["bg-draft motion-safe:animate-pulse", "Publishing…", ""]
      : dirty
        ? ["bg-draft", `${plural(total, "unpublished change")}`, `in ${areas.join(", ")}`]
        : state.source === "seed"
          ? ["bg-draft", "Not published yet", "Publish to store this content"]
          : ["bg-live", "All changes live", ""];

  const publish = () =>
    startPublishing(async () => {
      const content = pickSiteContent(state);
      try {
        const result = await publishSiteContent(content, state.revision);
        dispatch(
          result.ok
            ? { type: "published", revision: result.revision, baseline: serializeContent(content) }
            : { type: "toast", message: result.error, tone: "error" },
        );
      } catch {
        dispatch({
          type: "toast",
          message: "Publishing failed. Check the connection and try again.",
          tone: "error",
        });
      }
    });

  const discard = () => {
    if (window.confirm(`Discard ${plural(total, "unpublished change")}? This can't be undone.`)) {
      dispatch({ type: "discard" });
    }
  };

  return (
    <div className="flex items-center gap-[4px] rounded-[2px] border border-line bg-paper py-[3px] pr-[3px] pl-[12px]">
      <p
        role="status"
        aria-live="polite"
        className="flex min-w-0 items-center gap-[8px] pr-[6px] font-sans text-[13px] leading-none whitespace-nowrap"
      >
        <span aria-hidden="true" className={`h-[8px] w-[8px] shrink-0 rounded-full ${dot}`} />
        <span className="font-medium">{headline}</span>
        {detail && <span className="hidden truncate text-graphite xl:inline">{detail}</span>}
      </p>
      {dirty && !publishing && (
        <Button size="sm" variant="ghost" onClick={discard}>
          Discard
        </Button>
      )}
      <Button size="sm" variant="primary" onClick={publish} disabled={!canPublish}>
        Publish
      </Button>
    </div>
  );
}
