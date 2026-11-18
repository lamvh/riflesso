"use server";

import { loadDashboardContent } from "@/lib/content/load-dashboard-content";
import type { LoadedSiteContent } from "@/lib/content/site-content-types";

/**
 * The content and revision the database holds right now, for a tab whose save
 * was refused as stale. Null unless it really came from the database: built-in
 * stand-in content must never be merged into a working copy.
 *
 * Like publishing, open to anyone who can reach it until the dashboard has
 * sign-in.
 */
export async function fetchLatestSiteContent(): Promise<LoadedSiteContent | null> {
  const latest = await loadDashboardContent();
  return latest.source === "database" ? latest : null;
}
