"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { plural } from "@/lib/dashboard/admin-changes";
import { VIEW_HREF } from "@/lib/dashboard/admin-views";
import { listMediaLibrary } from "@/lib/dashboard/list-media-library";
import { groupAndTagOptions, inMediaScope, matchesMediaSearch, mediaCatalogue } from "@/lib/dashboard/media-library-filters";
import { mediaUsageIndex } from "@/lib/dashboard/media-usage";
import { formatBytes, type MediaLibraryReport } from "@/lib/media/media-library-types";

import { useAdmin } from "../admin-store";
import { MediaBulkActions } from "../media-bulk-actions";
import {
  ALL_FOLDERS,
  folderPathOf,
  MediaFolderList,
  MediaFolderSelect,
  UNFILED,
  type FolderFilter,
} from "../media-folder-list";
import { MediaLibraryStats } from "../media-library-stats";
import { MediaObjectCard } from "../media-object-card";
import { useDeleteMediaFiles } from "../use-delete-media-files";
import { useMediaGroups } from "../use-media-groups";
import { useMediaLabels } from "../use-media-labels";
import { Button, buttonClass, Segmented } from "../ui/controls";
import { SearchField, SelectField } from "../ui/fields";
import { UploadIcon } from "../ui/icons";
import { MediaDropZone } from "../ui/media-drop-zone";
import { Panel } from "../ui/panel";
import { SelectBox, toggleId } from "../ui/selection-controls";
import { TextPromptDialog } from "../ui/text-prompt-dialog";
import { UploadButton } from "../ui/upload-button";
import type { UploadedFile } from "../ui/use-media-upload";

type UsageFilter = "all" | "used" | "unused";

/** Anything an album frame, portrait or slide can hold. */
const LIBRARY_TYPES = "image/*,video/mp4,video/webm";

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
 *
 * Files are organised two ways. Folders and tags are the editor's own labels
 * (kept in Supabase, never in the object key, so URLs don't change). Album
 * and artist groups come from the content itself and need no upkeep.
 */
export function MediaScreen() {
  const { state, dispatch } = useAdmin();
  const [report, setReport] = useState<MediaLibraryReport | null>(null);
  const [loading, startLoading] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<UsageFilter>("all");
  const [sort, setSort] = useState("newest");
  const [folder, setFolder] = useState<FolderFilter>(ALL_FOLDERS);
  /** "" = any; otherwise "tag:…", "album:…" or "artist:…". */
  const [tagFilter, setTagFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [renaming, setRenaming] = useState<string | null>(null);
  const labels = useMediaLabels(dispatch);
  const { labelOf } = labels;

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

  const refresh = () => {
    load();
    labels.reload();
  };

  const { settings, contacts, artists, albums, cats, slides, blocks, baseline } = state;
  const usageOf = useMemo(
    () =>
      mediaUsageIndex(
        JSON.parse(baseline) as SiteContent,
        pickSiteContent({ settings, contacts, artists, albums, cats, slides, blocks }),
      ),
    [baseline, settings, contacts, artists, albums, cats, slides, blocks],
  );

  const groupsOf = useMediaGroups();

  const rows = useMemo(
    () =>
      report?.state === "ok"
        ? report.objects.map((object) => ({
            key: object.key,
            object,
            usage: usageOf(object.key),
            label: labelOf(object.key),
            groups: groupsOf(object.key),
          }))
        : [],
    [report, usageOf, labelOf, groupsOf],
  );

  /* Folder tree, counts and every tag/group in use, for navigation. */
  const catalogue = useMemo(() => mediaCatalogue(rows), [rows]);

  const totals = useMemo(() => {
    const sum = (list: typeof rows) => list.reduce((total, row) => total + row.object.size, 0);
    const unused = rows.filter((row) => row.usage.state === "unused");
    const used = rows.filter((row) => row.usage.state !== "unused");
    return { all: sum(rows), used: used.length, usedBytes: sum(used), unused: unused.length, unusedBytes: sum(unused) };
  }, [rows]);

  const needle = query.trim().toLowerCase();
  const folderPath = folderPathOf(folder);
  const visible = rows
    .filter((row) => {
      if (filter !== "all" && (filter === "unused") !== (row.usage.state === "unused")) return false;
      if (folder === UNFILED && row.label.folder) return false;
      if (folderPath && !inMediaScope(row, `folder:${folderPath}`)) return false;
      return inMediaScope(row, tagFilter) && matchesMediaSearch(row, needle, row.usage.places);
    })
    .sort((a, b) => {
      if (sort === "largest") return b.object.size - a.object.size;
      if (sort === "name") return a.object.key.localeCompare(b.object.key);
      return (b.object.lastModified ?? "").localeCompare(a.object.lastModified ?? "");
    });

  /*
   * Fresh uploads: list them, clear filters that would hide them (they are
   * unused until picked somewhere), file them into the open folder and leave
   * them selected so they can be tagged or moved straight away.
   */
  const afterUpload = (files: UploadedFile[]) => {
    load();
    setQuery("");
    setTagFilter("");
    if (filter === "used") setFilter("all");
    const keys = files.map((file) => file.key).filter(Boolean);
    if (!labels.ready || keys.length === 0) return;
    setSelected(new Set(keys));
    if (folderPath) labels.update(keys, { folder: folderPath }, `Filed in ${folderPath}`);
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      dispatch({ type: "toast", message: "Address copied" });
    } catch {
      dispatch({ type: "toast", message: "Could not copy the address", tone: "error" });
    }
  };

  const [deleting, remove] = useDeleteMediaFiles(dispatch, (gone) => {
    setReport((current) =>
      current?.state === "ok"
        ? { ...current, objects: current.objects.filter((object) => !gone.has(object.key)) }
        : current,
    );
    setSelected((current) => new Set([...current].filter((key) => !gone.has(key))));
  });

  const unusedKeys = rows.filter((row) => row.usage.state === "unused").map((row) => row.object.key);

  /* Selection keeps only files still listed (a delete or refresh drops some). */
  const picked = rows.filter((row) => selected.has(row.object.key));
  const pickedKeys = picked.map((row) => row.object.key);
  const pickedUnused = picked.filter((row) => row.usage.state === "unused").map((row) => row.object.key);
  const visibleKeys = visible.map((row) => row.object.key);
  const allVisiblePicked = visibleKeys.length > 0 && visibleKeys.every((key) => selected.has(key));
  const clearSelection = () => setSelected(new Set());

  const tagOptions = [
    { value: "", label: "Any album, artist or tag" },
    ...groupAndTagOptions(catalogue),
  ];
  /* A filter set from a card chip may name something no longer listed. */
  if (tagFilter && !tagOptions.some((option) => option.value === tagFilter)) {
    tagOptions.push({ value: tagFilter, label: tagFilter.replace(/^tag:/, "#") });
  }

  const folderNav = {
    folders: catalogue.folders,
    counts: catalogue.counts,
    total: rows.length,
    unfiled: catalogue.unfiled,
    value: folder,
    onChange: (value: FolderFilter) => {
      setFolder(value);
      clearSelection();
    },
  };

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

  return (
    <div className="flex flex-col gap-[14px]">
      <MediaLibraryStats
        files={report?.state === "ok" ? rows.length : null}
        bucket={report?.state === "ok" ? report.bucket : null}
        totals={totals}
      />

      {state.source === "unreachable" && (
        <p className="font-sans text-[13px] text-draft">
          The database is not answering, so usage is judged against the built-in content and may be wrong.
        </p>
      )}

      {labels.report?.state === "missing" && (
        <p className="font-sans text-[13px] break-words text-draft">
          Folders and tags need one more table. Back up the database, then run
          <code className="break-all">supabase/migrations/20261113040000_add_media_library_labels.sql</code>. Album and artist groups work already.
        </p>
      )}
      {labels.report?.state === "error" && (
        <p className="font-sans text-[13px] text-draft">
          Folders and tags could not be read ({labels.report.message}). Album and artist groups still work.
        </p>
      )}

      <div className="grid gap-[14px] lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:sticky lg:top-[16px] lg:block">
          <MediaFolderList
            {...folderNav}
            onRename={labels.ready ? setRenaming : undefined}
            onUnfile={
              labels.ready
                ? (path) => {
                    if (window.confirm(`Remove the folder ${path}? Its files stay in the library, unfiled.`)) {
                      labels.rename(path, "");
                      setFolder(ALL_FOLDERS);
                    }
                  }
                : undefined
            }
          />
        </aside>

        <MediaDropZone
          multiple
          accept={LIBRARY_TYPES}
          label={folderPath ? `Drop to upload into ${folderPath}` : "Drop to upload to the library"}
          onUploaded={(_, files) => afterUpload(files)}
          className="flex min-w-0 flex-col gap-[14px] rounded-[10px]"
        >
          <div className="flex flex-wrap items-center gap-[10px]">
            <SearchField label="Search files" value={query} onChange={setQuery} placeholder="Search names, tags and records" />
            <div className="lg:hidden">
              <MediaFolderSelect {...folderNav} />
            </div>
            <SelectField label="Album, artist or tag" value={tagFilter} onChange={setTagFilter} options={tagOptions} />
            <Segmented label="Usage" options={USAGE_OPTIONS} value={filter} onChange={setFilter} />
            <SelectField label="Sort" value={sort} onChange={setSort} options={SORT_OPTIONS} />
            {labels.ready && visibleKeys.length > 0 && (
              <label className="flex items-center gap-[8px] font-sans text-[13px] text-graphite">
                <SelectBox
                  checked={allVisiblePicked}
                  mixed={!allVisiblePicked && visibleKeys.some((key) => selected.has(key))}
                  label="Select every file shown"
                  onChange={(on) => setSelected(on ? new Set([...selected, ...visibleKeys]) : new Set([...selected].filter((key) => !visibleKeys.includes(key))))}
                />
                Select shown
              </label>
            )}
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
            <Button size="sm" onClick={refresh} disabled={loading || deleting}>
              {loading ? "Listing…" : "Refresh"}
            </Button>
            {report?.state === "ok" && (
              <UploadButton multiple accept={LIBRARY_TYPES} onUploadedAll={afterUpload} className={buttonClass("primary", "sm")}>
                <UploadIcon size={14} />
                {folderPath ? "Upload here" : "Upload"}
              </UploadButton>
            )}
          </div>

          {report?.state === "error" && (
            <p role="alert" className="rounded-[10px] border border-line bg-paper shadow-sheet px-[20px] py-[14px] font-sans text-[13px] text-danger">
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
            <div className="rounded-[10px] border border-line bg-paper shadow-sheet px-[20px] py-[28px] font-sans text-[15px] font-medium">
              {rows.length === 0 ? "The bucket is empty." : "No files match these filters."}
            </div>
          ) : (
            <div className={`grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[14px] transition-opacity ${loading ? "opacity-60" : ""}`}>
              {visible.map(({ object, usage, label, groups }) => (
                <MediaObjectCard
                  key={object.key}
                  object={object}
                  usage={usage}
                  label={label}
                  groups={groups}
                  selected={selected.has(object.key)}
                  onSelect={labels.ready ? (on) => setSelected((current) => toggleId(current, object.key, on)) : undefined}
                  onFilter={setTagFilter}
                  onCopy={copy}
                  onDelete={() => remove([object.key], object.key.slice(object.key.lastIndexOf("/") + 1))}
                  busy={deleting}
                />
              ))}
            </div>
          )}
        </MediaDropZone>
      </div>

      {pickedKeys.length > 0 && (
        <MediaBulkActions
          keys={pickedKeys}
          labelOf={labelOf}
          folders={catalogue.folders}
          tags={catalogue.tags}
          unusedKeys={pickedUnused}
          onMove={(target) => labels.update(pickedKeys, { folder: target }, target ? `Moved to ${target}` : "Unfiled")}
          onAddTags={(tags) => labels.update(pickedKeys, { addTags: tags }, `Tagged ${tags.map((tag) => `#${tag}`).join(", ")}`)}
          onRemoveTag={(tag) => labels.update(pickedKeys, { removeTags: [tag] }, `Removed #${tag}`)}
          onDelete={() => remove(pickedUnused, plural(pickedUnused.length, "unused file"))}
          onClear={clearSelection}
        />
      )}

      {renaming !== null && (
        <TextPromptDialog
          title="Rename folder"
          description="Folders inside it move along. Use / to move it under another folder."
          label="Folder"
          initial={renaming}
          suggestions={catalogue.folders}
          confirm="Rename"
          onClose={() => setRenaming(null)}
          onSubmit={(target) => {
            const from = renaming;
            setRenaming(null);
            labels.rename(from, target);
            setFolder(ALL_FOLDERS);
          }}
        />
      )}
    </div>
  );
}
