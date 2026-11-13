"use client";

import { useEffect, useState } from "react";

import type { ContentViewReport, ViewCount } from "@/lib/analytics/content-view-types";
import { readContentViews } from "@/lib/analytics/read-content-views";
import { albumLabel } from "@/lib/dashboard/admin-helpers";

import { useAdmin } from "./admin-store";
import { Panel } from "./ui/panel";

const PAGE_LABEL: Record<string, string> = {
  "/": "Homepage",
  "/artists": "Artists",
  "/about": "About",
  "/contact": "Contact",
};

const number = (value: number) => value.toLocaleString();

/**
 * Visitors over the last 30 days: page views with the trend against the 30
 * before, a bar per day, and what people looked at most. Counts come from the
 * site's own anonymous tally (see the content_views migration).
 */
export function VisitorStatsPanel() {
  const { state } = useAdmin();
  const [report, setReport] = useState<ContentViewReport | null>(null);

  useEffect(() => {
    let live = true;
    readContentViews(30)
      .catch((error: unknown) => ({
        state: "error" as const,
        message: error instanceof Error ? error.message : "Views could not be read",
      }))
      .then((next) => live && setReport(next));
    return () => {
      live = false;
    };
  }, []);

  const albumTitle = new Map(state.albums.map((album) => [album.id, albumLabel(album)]));

  return (
    <Panel title="Visitors" description="Last 30 days" bodyClassName="">
      {!report ? (
        <p className="px-[20px] py-[18px] font-sans text-[14px] text-graphite">Counting…</p>
      ) : report.state === "missing" ? (
        <p className="px-[20px] py-[18px] font-sans text-[14px] leading-[150%] text-body">
          View counts need the migration{" "}
          <code className="rounded-[4px] bg-hover px-[4px] font-mono text-[12px]">
            20261113020000_add_content_views.sql
          </code>
          . Back up, run it, and visits are counted from then on.
        </p>
      ) : report.state === "unconfigured" ? (
        <p className="px-[20px] py-[18px] font-sans text-[14px] text-graphite">
          View counts need Supabase.
        </p>
      ) : report.state === "error" ? (
        <p className="px-[20px] py-[18px] font-sans text-[14px] text-danger">{report.message}</p>
      ) : (
        <div className="flex flex-col">
          <div className="grid gap-[18px] border-b border-line px-[20px] py-[18px] sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
            <div>
              <p className="font-serif text-[46px] leading-[0.9] tracking-[-1px] tabular-nums">
                {number(report.total)}
              </p>
              <p className="mt-[8px] font-sans text-[13px] text-graphite">
                page views <Trend now={report.total} before={report.previousTotal} />
              </p>
            </div>
            <DailyBars daily={report.daily} />
          </div>

          <div className="grid gap-px bg-line sm:grid-cols-3">
            <TopList
              title="Albums opened"
              rows={report.albums}
              label={(ref) => albumTitle.get(ref) ?? "Deleted album"}
            />
            <TopList title="Artists looked at" rows={report.artists} label={(ref) => ref} />
            <TopList title="Pages" rows={report.pages} label={(ref) => PAGE_LABEL[ref] ?? ref} />
          </div>
        </div>
      )}
    </Panel>
  );
}

function Trend({ now, before }: { now: number; before: number }) {
  if (before === 0) return now > 0 ? <span>· first month counted</span> : null;
  const change = Math.round(((now - before) / before) * 100);
  return (
    <span className={change > 0 ? "text-live" : change < 0 ? "text-danger" : ""}>
      · {change > 0 ? "+" : ""}
      {change}% on the 30 days before
    </span>
  );
}

/** One bar per day; the tallest fills the height. Hover shows the date. */
function DailyBars({ daily }: { daily: { day: string; views: number }[] }) {
  const peak = Math.max(1, ...daily.map((entry) => entry.views));
  return (
    <div className="flex h-[56px] items-end gap-[2px]" role="img" aria-label="Page views per day">
      {daily.map((entry) => (
        <span
          key={entry.day}
          title={`${new Date(entry.day).toLocaleDateString(undefined, { day: "numeric", month: "short" })}: ${number(entry.views)}`}
          className="min-h-[2px] flex-1 rounded-t-[2px] bg-ink/80 transition-colors hover:bg-ink"
          style={{ height: `${Math.max(3, (entry.views / peak) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function TopList({
  title,
  rows,
  label,
}: {
  title: string;
  rows: ViewCount[];
  label: (ref: string) => string;
}) {
  return (
    <div className="bg-paper px-[20px] py-[14px]">
      <p className="mb-[8px] font-sans text-[11px] leading-none font-bold tracking-[0.12em] text-graphite uppercase">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="font-sans text-[13px] text-graphite">Nothing yet</p>
      ) : (
        <ol className="flex flex-col gap-[6px]">
          {rows.map((row) => (
            <li key={row.ref} className="flex items-baseline gap-[8px] font-sans text-[14px]">
              <span className="min-w-0 flex-1 truncate">{label(row.ref)}</span>
              <span className="text-[13px] text-graphite tabular-nums">{number(row.views)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
