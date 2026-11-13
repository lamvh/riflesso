"use client";

import { useMemo } from "react";

import { pickSiteContent } from "@/lib/content/site-content-types";
import { mediaGroupIndex } from "@/lib/dashboard/media-groups";

import { useAdmin } from "./admin-store";

/**
 * Albums and artists each stored file belongs to. Follows the working draft,
 * so a frame added to an album shows under that album before it is saved.
 */
export function useMediaGroups() {
  const { settings, contacts, artists, albums, cats, slides, blocks } = useAdmin().state;
  return useMemo(
    () => mediaGroupIndex(pickSiteContent({ settings, contacts, artists, albums, cats, slides, blocks })),
    [settings, contacts, artists, albums, cats, slides, blocks],
  );
}
