"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackContentView } from "@/lib/analytics/track-content-view";

/** Counts a view of each public page as it is shown. The dashboard is not counted. */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) trackContentView("page", pathname);
  }, [pathname]);
  return null;
}
