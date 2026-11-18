"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { trackContentView } from "@/lib/analytics/track-content-view";
import type { MediaItem } from "@/lib/media-item";
import {
  buildWorkDetail,
  type MediaSection,
  type WorkDetail,
} from "@/lib/work-detail";

/*
 * The gallery is only needed once a card is clicked, so its code stays out of
 * the first load. It is fetched in the background after the page settles, so
 * the first click opens it without a wait.
 */
const loadOverlay = () => import("./work-detail-overlay");
const WorkDetailOverlay = dynamic(() => loadOverlay().then((module) => module.WorkDetailOverlay), {
  ssr: false,
});

type OpenWork = (item: MediaItem, section: MediaSection) => void;

const WorkDetailContext = createContext<OpenWork | null>(null);

/** Raises the gallery for a card. Home-only — every caller sits in the provider. */
export function useOpenWork(): OpenWork {
  const openWork = useContext(WorkDetailContext);
  if (!openWork) {
    throw new Error("useOpenWork must be used inside a WorkDetailProvider");
  }
  return openWork;
}

/**
 * Owns the gallery that rails and the editorial feature open.
 *
 * The design scrolls the window to the top on open; that is invisible under the
 * fixed overlay and only shows up as a lost scroll position once it closes, so
 * the page is left where it was.
 */
export function WorkDetailProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [work, setWork] = useState<WorkDetail | null>(null);

  const openWork = useCallback<OpenWork>(
    (item, section) => {
      if (item.albumId) trackContentView("album", item.albumId);
      setWork(buildWorkDetail(item, section));
    },
    [],
  );

  const closeWork = useCallback(() => setWork(null), []);

  useEffect(() => {
    const warm = () => void loadOverlay();
    if (document.readyState === "complete") {
      const timer = window.setTimeout(warm, 1500);
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("load", warm, { once: true });
    return () => window.removeEventListener("load", warm);
  }, []);

  return (
    <WorkDetailContext value={openWork}>
      {children}
      {work && <WorkDetailOverlay work={work} onClose={closeWork} />}
    </WorkDetailContext>
  );
}
