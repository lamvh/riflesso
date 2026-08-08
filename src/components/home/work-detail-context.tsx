"use client";

import { createContext, useCallback, useContext, useState } from "react";

import type { MediaItem } from "@/lib/media-item";
import {
  buildWorkDetail,
  type MediaSection,
  type WorkDetail,
} from "@/lib/work-detail";

import { WorkDetailOverlay } from "./work-detail-overlay";

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
    (item, section) => setWork(buildWorkDetail(item, section)),
    [],
  );

  const closeWork = useCallback(() => setWork(null), []);

  return (
    <WorkDetailContext value={openWork}>
      {children}
      {work && <WorkDetailOverlay work={work} onClose={closeWork} />}
    </WorkDetailContext>
  );
}
