"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { plural } from "@/lib/dashboard/admin-changes";
import { VIEW_HREF } from "@/lib/dashboard/admin-views";
import { listMediaLibrary } from "@/lib/dashboard/list-media-library";
import { mediaUsageIndex } from "@/lib/dashboard/media-usage";
import { formatBytes, type MediaLibraryReport } from "@/lib/media/media-library-types";

import { useAdmin } from "../admin-store";
import { MediaObjectCard } from "../media-object-card";
import { useDeleteMediaFiles } from "../use-delete-media-files";
import { Button, Segmented } from "../ui/controls";
import { SearchField, SelectField } from "../ui/fields";
import { Panel } from "../ui/panel";

type UsageFilter = "all" | "used" | "unused";

const USAGE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "used", label: "In use" },
  { value: "unused", label: "Unused" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "largest", label: "Largest first" },
  { value: "name", label: "Name" },
];

/**
 * Everything stored in the R2 bucket in one place: how much space each file
 * takes and which records use it, so files nothing points at can be found.
 * Usage is judged against both the published content and the working draft.
 */
export function MediaScreen() {
  const { state, dispatch } = useAdmin();
  const [report, setReport] = useState<MediaLibraryReport | null>(null);
  const [loading, startLoading] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UsageFilter>("all");
  const [sort, setSort] = useState("newest");

  const load = () =>
    startLoading(async () => {
      try {
        setReport(await listMediaLibrary());
      } catch (error) {
        setReport({ state: "error", message: error instanceof Error ? error.message : "The listing could not run" });
      }
    });

  /* List once when the screen opens. */
  useEffect(load, []);

  const { settings, contacts, artists, albums, cats, slides, blocks, baseline } = state;
  const usageOf = useMemo(
    () =>
      mediaUsageIndex(
        JSON.parse(baseline) as SiteContent,
        pickSiteContent({ settings, contacts, artists, albums, cats, slides, blocks }),
      ),
    [baseline, settings, contacts, artists, albums, cats, slides, blocks],
  );

  const rows = useMemo(
    () =>
      report?.state === "ok"
        ? report.objects.map((object) => ({ object, usage: usageOf(object.key) }))
        : [],
    [report, usageOf],
  );

  const totals = useMemo(() => {
    const sum = (list: typeof rows) => list.reduce((total, row) => total + row.object.size, 0);
    const unused = rows.filter((row) => row.usage.state === "unused");
    const used = rows.filter((row) => row.usage.state !== "unused");
    return { all: sum(rows), used: used.length, usedBytes: sum(used), unused: unused.length, unusedBytes: sum(unused) };
  }, [rows]);

  const needle = query.trim().toLowerCase();
  const visible = rows
    .filter(
      ({ object, usage }) =>
        (filter === "all" || (filter === "unused") === (usage.state === "unused")) &&
        (!needle ||
          object.key.toLowerCase().includes(needle) ||
          usage.places.some((place) => place.toLowerCase().includes(needle))),
    )
    .sort((a, b) => {
      if (sort === "largest") return b.object.size - a.object.size;
      if (sort === "name") return a.object.key.localeCompare(b.object.key);
      return (b.object.lastModified ?? "").localeCompare(a.object.lastModified ?? "");
    });

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      dispatch({ type: "toast", message: "Address copied" });
    } catch {
      dispatch({ type: "toast", message: "Could not copy the address", tone: "error" });
    }
  };

  const [deleting, remove] = useDeleteMediaFiles(dispatch, (gone) =>
    setReport((current) =>
      current?.state === "ok"
        ? { ...current, objects: current.objects.filter((object) => !gone.has(object.key)) }
        : current,
    ),
  );

  const unusedKeys = rows.filter((row) => row.usage.state === "unused").map((row) => row.object.key);

  if (report?.state === "unconfigured") {
    return (
      <Panel title="Storage is not configured">
        <p className="font-sans text-[14px] leading-[150%] text-graphite">
          Set the R2 environment variables to list stored files. The{" "}
          <Link href={VIEW_HREF.settings} className="text-ink underline">
            Connections
          </Link>{" "}
          panel in Site settings shows which ones are missing.
        </p>
      </Panel>
    );
  }

  const stats = [
    { label: "Files", value: report?.state === "ok" ? String(rows.length) : "—", note: report?.state === "ok" ? `In bucket ${report.bucket}` : "Listing…" },
    { label: "Total size", value: formatBytes(totals.all), note: "Everything stored" },
    { label: "In use", value: String(totals.used), note: formatBytes(totals.usedBytes) },
    { label: "Unused", value: String(totals.unused), note: totals.unused ? `${formatBytes(totals.unusedBytes)} could be freed` : "Nothing wasted" },
  ];

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="grid grid-cols-2 gap-[14px] lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[2px] border border-line bg-paper px-[16px] py-[14px] font-sans">
            <p className="text-[13px] leading-none text-graphite">{stat.label}</p>
            <p className="mt-[10px] text-[26px] leading-none font-bold tracking-[-0.8px] tabular-nums">{stat.value}</p>
            <p className="mt-[8px] truncate text-[12px] leading-none text-graphite">{stat.note}</p>
          </div>
        ))}
      </div>

      {state.source === "unreachable" && (
        <p className="font-sans text-[13px] text-draft">
          The database is not answering, so usage is judged against the built-in content and may be wrong.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-[10px]">
        <SearchField label="Search files" value={query} onChange={setQuery} placeholder="Search names and records" />
        <Segmented label="Usage" options={USAGE_OPTIONS} value={filter} onChange={setFilter} />
        <SelectField label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
        <p className="font-sans text-[13px] text-graphite tabular-nums sm:ml-auto">
          {visible.length === rows.length ? plural(rows.length, "file") : `${visible.length} of ${plural(rows.length, "file")}`}
        </p>
        {unusedKeys.length > 0 && (
          <Button
            size="sm"
            variant="danger"
            disabled={deleting || loading}
            onClick={() =>
              remove(unusedKeys, `${plural(unusedKeys.length, "unused file")} (${formatBytes(totals.unusedBytes)})`)
            }
          >
            {deleting ? "Deleting…" : `Delete ${unusedKeys.length} unused`}
          </Button>
        )}
        <Button size="sm" onClick={load} disabled={loading || deleting}>
          {loading ? "Listing…" : "Refresh"}
        </Button>
      </div>

      {report?.state === "error" && (
        <p role="alert" className="rounded-[2px] border border-line bg-paper px-[20px] py-[14px] font-sans text-[13px] text-danger">
          {report.message}
        </p>
      )}
      {report?.state === "ok" && report.truncated && (
        <p className="font-sans text-[13px] text-draft">
          The bucket holds more files than one listing returns; only the first {rows.length} are shown.
        </p>
      )}

      {!report ? (
        <p className="font-sans text-[14px] text-graphite">Listing the bucket…</p>
      ) : report.state === "ok" && visible.length === 0 ? (
        <div className="rounded-[2px] border border-line bg-paper px-[20px] py-[28px] font-sans text-[15px] font-medium">
          {rows.length === 0 ? "The bucket is empty." : "No files match these filters."}
        </div>
      ) : (
        <div className={`grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[14px] transition-opacity ${loading ? "opacity-60" : ""}`}>
          {visible.map(({ object, usage }) => (
            <MediaObjectCard
              key={object.key}
              object={object}
              usage={usage}
              onCopy={copy}
              onDelete={() => remove([object.key], object.key.slice(object.key.lastIndexOf("/") + 1))}
              busy={deleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
