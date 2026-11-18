"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { plural } from "@/lib/dashboard/admin-changes";
import { VIEW_HREF } from "@/lib/dashboard/admin-views";
import { listMediaLibrary } from "@/lib/dashboard/list-media-library";
import { groupAndTagOptions, inMediaScope, matchesMediaSearch, mediaCatalogue } from "@/lib/dashboard/media-library-filters";
import {
  hasReplacedTag,
  mediaUsageIndex,
  REPLACED_TAG,
  withReplaced,
  type MediaUsageState,
} from "@/lib/dashboard/media-usage";
import { formatBytes, type MediaLibraryReport } from "@/lib/media/media-library-types";

import { useAdmin } from "../admin-store";
import { MediaBulkActions } from "../media-bulk-actions";
import { MediaDragArea } from "../media-file-drag";
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
import { MediaOrganiserDialogs, type OrganiserDialog } from "../media-organiser-dialogs";
import { MediaTagList } from "../media-tag-list";
import { useDeleteMediaFiles } from "../use-delete-media-files";
import { useMediaGroups } from "../use-media-groups";
import { useMediaLabels } from "../use-media-labels";
import { Button, buttonClass, Segmented } from "../ui/controls";
import { SearchField, SelectField } from "../ui/fields";
import { UploadIcon } from "../ui/icons";
import { MediaDropZone } from "../ui/media-drop-zone";
import { Panel } from "../ui/panel";
import { SelectBox, toggleId } from "../ui/selection-controls";
import { UploadButton } from "../ui/upload-button";
import { UploadCompressionControl } from "../ui/upload-compression-control";
import type { UploadedFile } from "../ui/use-media-upload";

type UsageFilter = "all" | "used" | "replaced" | "unused";

/** Which usage filter a file falls under. */
const usageGroup = (state: MediaUsageState): Exclude<UsageFilter, "all"> =>
  state === "unused" || state === "replaced" ? state : "used";

/** Anything an album frame, portrait or slide can hold. */
const LIBRARY_TYPES = "image/*,video/mp4,video/webm";

const USAGE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "used", label: "In use" },
  { value: "replaced", label: "Replaced" },
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
  const [dialog, setDialog] = useState<OrganiserDialog>(null);
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
        ? report.objects.map((object) => {
            const label = labelOf(object.key);
            return {
              key: object.key,
              object,
              usage: withReplaced(usageOf(object.key), label.tags),
              label,
              groups: groupsOf(object.key),
            };
          })
        : [],
    [report, usageOf, labelOf, groupsOf],
  );

  /* Folder tree (created empty folders too), counts and every tag/group in use. */
  const { createdFolders } = labels;
  const catalogue = useMemo(() => mediaCatalogue(rows, createdFolders), [rows, createdFolders]);

  const totals = useMemo(() => {
    const sum = (list: typeof rows) => list.reduce((total, row) => total + row.object.size, 0);
    const unused = rows.filter((row) => row.usage.state === "unused");
    /* Replaced files are neither: kept on purpose, but not on the site. */
    const used = rows.filter((row) => row.usage.state !== "unused" && row.usage.state !== "replaced");
    return { all: sum(rows), used: used.length, usedBytes: sum(used), unused: unused.length, unusedBytes: sum(unused) };
  }, [rows]);

  const needle = query.trim().toLowerCase();
  const folderPath = folderPathOf(folder);
  const visible = rows
    .filter((row) => {
      if (filter !== "all" && usageGroup(row.usage.state) !== filter) return false;
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

  /*
   * A new version of a file: it is stored under a new key (the old address is
   * cached as immutable), every record using the old one switches to it, and
   * it inherits the old file's folder and tags. The old file stays, tagged
   * "replaced" so it is not mistaken for (or bulk-deleted with) unused files,
   * and history restores keep working; delete it when ready.
   */
  const replace = (old: string, file: UploadedFile) => {
    const name = old.slice(old.lastIndexOf("/") + 1);
    const { places } = usageOf(old);
    dispatch({ type: "media/replace", key: old, url: file.url, name });
    const label = labelOf(old);
    /* The new version is current: it never inherits the old one's replaced tag. */
    const carried = label.tags.filter((tag) => !hasReplacedTag([tag]));
    if (labels.ready && file.key && (label.folder || carried.length)) {
      labels.update([file.key], { folder: label.folder, addTags: carried }, "Folder and tags carried over");
    }
    if (labels.ready) labels.update([old], { addTags: [REPLACED_TAG] }, `${name} tagged #${REPLACED_TAG}`);
    load();
    setSelected(new Set(file.key ? [file.key] : []));
    dispatch({
      type: "toast",
      message: places.length
        ? `Replaced in ${plural(places.length, "place")}. The old file is kept as replaced; delete it once the change is saved.`
        : "New version uploaded. The old file was not used anywhere.",
    });
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

  const activeTag = tagFilter.startsWith("tag:") ? tagFilter.slice("tag:".length) : null;

  /* Folder and tag management; each confirms anything that touches many files. */
  const organise = {
    newFolder: () => setDialog({ kind: "new-folder", parent: folderPath ?? "" }),
    renameFolder: (path: string) => setDialog({ kind: "rename-folder", path }),
    removeFolder: (path: string) => {
      if (!window.confirm(`Remove the folder ${path} and the folders inside it? Their files stay in the library, unfiled.`)) return;
      labels.rename(path, "", () => setFolder(ALL_FOLDERS));
    },
    renameTag: (tag: string) => setDialog({ kind: "rename-tag", tag }),
    deleteTag: (tag: string) => {
      const count = catalogue.tagCounts.get(tag) ?? 0;
      if (!window.confirm(`Delete #${tag} from ${plural(count, "file")}? The files themselves stay.`)) return;
      labels.retag(tag, null, () => setTagFilter(""));
    },
  };

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

      {labels.ready && !labels.foldersReady && (
        <p className="font-sans text-[13px] break-words text-draft">
          To keep empty folders, back up the database, then run
          <code className="break-all">supabase/migrations/20261118000000_add_media_library_folders.sql</code>. Everything else works already.
        </p>
      )}

      <MediaDragArea
        onDrop={(keys, target) => {
          const moving = keys.filter((key) => labelOf(key).folder !== target);
          if (moving.length) labels.update(moving, { folder: target }, target ? `Moved to ${target}` : "Unfiled");
        }}
      >
      <div className="grid gap-[14px] lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:sticky lg:top-[16px] lg:flex lg:max-h-[calc(100vh-32px)] lg:flex-col lg:gap-[18px] lg:overflow-y-auto">
          <MediaFolderList
            {...folderNav}
            onRename={labels.ready ? organise.renameFolder : undefined}
            onUnfile={labels.ready ? organise.removeFolder : undefined}
            onCreate={labels.foldersReady ? organise.newFolder : undefined}
          />
          {labels.ready && (
            <MediaTagList
              tags={catalogue.tags}
              counts={catalogue.tagCounts}
              active={activeTag}
              onPick={(tag) => setTagFilter(tag ? `tag:${tag}` : "")}
              onRename={organise.renameTag}
              onDelete={organise.deleteTag}
            />
          )}
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
            {report?.state === "ok" && <UploadCompressionControl align="right" />}
            {report?.state === "ok" && (
              <UploadButton multiple accept={LIBRARY_TYPES} onUploadedAll={afterUpload} className={buttonClass("primary", "sm")}>
                <UploadIcon size={14} />
                {folderPath ? "Upload here" : "Upload"}
              </UploadButton>
            )}
          </div>

          {labels.ready && (labels.foldersReady || folderPath || activeTag) && (
            <div className="flex flex-wrap gap-[6px] lg:hidden">
              {labels.foldersReady && (
                <Button size="sm" variant="ghost" onClick={organise.newFolder}>
                  New folder
                </Button>
              )}
              {folderPath && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => organise.renameFolder(folderPath)}>
                    Rename folder
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => organise.removeFolder(folderPath)}>
                    Remove folder
                  </Button>
                </>
              )}
              {activeTag && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => organise.renameTag(activeTag)}>
                    Rename #{activeTag}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => organise.deleteTag(activeTag)}>
                    Delete #{activeTag}
                  </Button>
                </>
              )}
            </div>
          )}

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
                  onEdit={labels.ready ? () => setDialog({ kind: "edit", key: object.key }) : undefined}
                  onReplace={(file) => replace(object.key, file)}
                  dragKeys={selected.has(object.key) ? pickedKeys : [object.key]}
                  busy={deleting}
                />
              ))}
            </div>
          )}
        </MediaDropZone>
      </div>
      </MediaDragArea>

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

      <MediaOrganiserDialogs
        dialog={dialog}
        folders={catalogue.folders}
        tags={catalogue.tags}
        labelOf={labelOf}
        onClose={() => setDialog(null)}
        onCreateFolder={(path) => labels.createFolder(path)}
        onRenameFolder={(from, to) => labels.rename(from, to, () => setFolder(ALL_FOLDERS))}
        onRenameTag={(from, to) =>
          labels.retag(from, to, () => {
            if (activeTag) setTagFilter(`tag:${to.trim().replace(/^#+/, "")}`);
          })
        }
        onEditFile={(key, change) => labels.update([key], change, "Folder and tags saved")}
      />
    </div>
  );
}
