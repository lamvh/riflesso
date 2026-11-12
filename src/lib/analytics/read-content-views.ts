"use server";

import { isMissingTable } from "@/lib/dashboard/content-history-types";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import type { ContentViewReport, ViewCount } from "./content-view-types";

const TOP = 5;

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

function top(rows: { ref: string; views: number }[]): ViewCount[] {
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.ref, (totals.get(row.ref) ?? 0) + row.views);
  return [...totals]
    .map(([ref, views]) => ({ ref, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, TOP);
}

/**
 * View counts for the Overview: page views per day over the window, the same
 * stretch before it for the trend, and the most viewed pages, albums and
 * artists. Days are UTC, as the database counts them.
 */
export async function readContentViews(days = 30): Promise<ContentViewReport> {
  const client = serviceRoleClient();
  if (!client) return { state: "unconfigured" };
  const span = Math.min(Math.max(Math.round(days), 7), 90);

  const today = new Date();
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (span - 1));
  const previousStart = new Date(start);
  previousStart.setUTCDate(previousStart.getUTCDate() - span);

  try {
    const { data, error } = await client
      .from("content_views")
      .select("kind, ref, day, views")
      .gte("day", isoDay(previousStart))
      .limit(20000);
    if (error) {
      return isMissingTable(error) ? { state: "missing" } : { state: "error", message: error.message };
    }

    const from = isoDay(start);
    const current = data.filter((row) => row.day >= from);
    const pages = current.filter((row) => row.kind === "page");

    const perDay = new Map<string, number>();
    for (const row of pages) perDay.set(row.day, (perDay.get(row.day) ?? 0) + row.views);
    const daily = Array.from({ length: span }, (_, index) => {
      const day = new Date(start);
      day.setUTCDate(day.getUTCDate() + index);
      const key = isoDay(day);
      return { day: key, views: perDay.get(key) ?? 0 };
    });

    return {
      state: "ok",
      days: span,
      daily,
      total: daily.reduce((sum, entry) => sum + entry.views, 0),
      previousTotal: data
        .filter((row) => row.kind === "page" && row.day < from)
        .reduce((sum, row) => sum + row.views, 0),
      pages: top(pages),
      albums: top(current.filter((row) => row.kind === "album")),
      artists: top(current.filter((row) => row.kind === "artist")),
    };
  } catch (error) {
    return { state: "error", message: error instanceof Error ? error.message : "Views could not be read" };
  }
}
