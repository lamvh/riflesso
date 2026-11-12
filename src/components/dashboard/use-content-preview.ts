"use client";

import { useTransition } from "react";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { startContentPreview } from "@/lib/preview/content-preview-actions";

import { useAdmin } from "./admin-store";

/**
 * Open the public site in a new tab, rendering the dashboard's working copy —
 * saved or not. The tab is opened before the server round trip so pop-up
 * blockers treat it as the click's own window.
 */
export function useContentPreview() {
  const { state, dispatch } = useAdmin();
  const [opening, startOpening] = useTransition();

  /** `load` previews other content — an earlier history entry — instead. */
  const openPreview = (path = "/", load?: () => Promise<SiteContent>) => {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      dispatch({ type: "toast", message: "Allow pop-ups for this site to open the preview", tone: "error" });
      return;
    }
    const working = pickSiteContent(state);
    startOpening(async () => {
      let result: Awaited<ReturnType<typeof startContentPreview>>;
      try {
        result = await startContentPreview(load ? await load() : working);
      } catch (error) {
        result = {
          ok: false,
          error: error instanceof Error ? error.message : "Preview failed. Check the connection.",
        };
      }
      if (!result.ok) {
        tab.close();
        dispatch({ type: "toast", message: result.error, tone: "error" });
        return;
      }
      tab.opener = null;
      tab.location.href = path;
    });
  };

  return { openPreview, opening };
}
