"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { listMediaLibrary } from "@/lib/dashboard/list-media-library";
import {
  folderOptions,
  groupAndTagOptions,
  inMediaScope,
  matchesMediaSearch,
  mediaCatalogue,
} from "@/lib/dashboard/media-library-filters";
import { formatBytes, type MediaLibraryReport, type MediaObject } from "@/lib/media/media-library-types";
import { isVideoSrc } from "@/lib/media-src";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { useMediaGroups } from "../use-media-groups";
import { useMediaLabels } from "../use-media-labels";
import { Button, buttonClass, IconButton } from "./controls";
import { SearchField, SelectField } from "./fields";
import { CrossIcon } from "./icons";
import { MediaDropZone } from "./media-drop-zone";
import { UploadButton } from "./upload-button";
import type { UploadedFile } from "./use-media-upload";

const IMAGE_EXT = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

/** Whether a stored file suits the field: images always, videos only when the field takes them. */
const fits = (object: MediaObject, videos: boolean) =>
  IMAGE_EXT.test(object.key) || (videos && isVideoSrc(object.url));

const nameOf = (key: string) => key.slice(key.lastIndexOf("/") + 1);

/**
 * The library listing behind "Choose from library". Narrowed by folder,
 * album, artist or tag, searchable, and a drop target: files dropped or
 * uploaded here go to R2 and show up first. In `multiple` mode clicks tick
 * files (fresh uploads arrive ticked) and the footer hands them all back;
 * otherwise a click, or uploading a single file, picks right away.
 */
export function MediaLibraryDialog({
  onPick,
  onClose,
  videos,
  multiple,
}: {
  onPick: (urls: string[]) => void;
  onClose: () => void;
  videos: boolean;
  multiple: boolean;
}) {
  const [report, setReport] = useState<MediaLibraryReport | null>(null);
  const [loading, startLoading] = useTransition();
  const [query, setQuery] = useState("");
  /** "" = everything; "folder:…", "album:…", "artist:…" or "tag:…". */
  const [scope, setScope] = useState("");
  /** Ticked URLs, in the order they were ticked. */
  const [picked, setPicked] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const { labelOf } = useMediaLabels(useAdmin().dispatch);
  const groupsOf = useMediaGroups();

  const load = useCallback(
    () =>
      startLoading(async () => {
        try {
          setReport(await listMediaLibrary());
        } catch (error) {
          setReport({ state: "error", message: error instanceof Error ? error.message : "The listing could not run" });
        }
      }),
    [],
  );
  useEffect(load, [load]);

  /* Escape closes; focus moves in; the page behind stays put. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    /* Capture phase, so Escape closes this dialog and not a drawer underneath. */
    window.addEventListener("keydown", onKeyDown, true);
    panelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const accept = videos ? "image/*,video/mp4,video/webm" : "image/*";

  /* New files sort first once the filters are cleared; tick them, or take a lone one. */
  const uploaded = (files: UploadedFile[]) => {
    if (!multiple && files.length === 1) {
      onPick([files[0].url]);
      return;
    }
    setQuery("");
    setScope("");
    if (multiple) setPicked((current) => [...current, ...files.map((file) => file.url).filter((url) => !current.includes(url))]);
    load();
  };

  const toggle = (url: string) =>
    setPicked((current) => (current.includes(url) ? current.filter((item) => item !== url) : [...current, url]));

  const needle = query.trim().toLowerCase();
  /* Files this field can take, joined with their folder, tags and groups. */
  const usable = useMemo(
    () =>
      report?.state === "ok"
        ? report.objects
            .filter((object) => fits(object, videos))
            .map((object) => ({ key: object.key, object, label: labelOf(object.key), groups: groupsOf(object.key) }))
        : [],
    [report, videos, labelOf, groupsOf],
  );

  const scopeOptions = useMemo(() => {
    const catalogue = mediaCatalogue(usable);
    return [{ value: "", label: "All files" }, ...folderOptions(catalogue), ...groupAndTagOptions(catalogue)];
  }, [usable]);

  const files = useMemo(
    () =>
      usable
        .filter((file) => inMediaScope(file, scope) && matchesMediaSearch(file, needle))
        .map((file) => file.object)
        .sort((a, b) => (b.lastModified ?? "").localeCompare(a.lastModified ?? "")),
    [usable, scope, needle],
  );

  let body: React.ReactNode;
  if (!report) body = <p className="text-graphite">Listing the library…</p>;
  else if (report.state === "unconfigured")
    body = <p className="text-graphite">Storage is not configured, so there is no library to choose from.</p>;
  else if (report.state === "error")
    body = (
      <p role="alert" className="text-danger">
        {report.message}
      </p>
    );
  else if (files.length === 0)
    body = (
      <p className="text-graphite">
        {needle || scope ? "No files match this search." : "The library has no pictures yet. Drop files here to add some."}
      </p>
    );
  else
    body = (
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-[10px]">
        {files.map((object) => {
          const order = picked.indexOf(object.url);
          const ticked = order >= 0;
          return (
            <li key={object.key}>
              <button
                type="button"
                onClick={() => (multiple ? toggle(object.url) : onPick([object.url]))}
                title={object.key}
                aria-pressed={multiple ? ticked : undefined}
                className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-[8px] border bg-paper text-left transition-colors focus-visible:border-ink ${
                  ticked ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink"
                }`}
              >
                <span className="relative block aspect-4/3 overflow-hidden bg-well">
                  <CoverImage src={object.url} pos="50% 50%" video={isVideoSrc(object.url)} />
                  {ticked && (
                    <span className="absolute top-[6px] left-[6px] flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-ink px-[6px] text-[11px] font-bold text-paper tabular-nums">
                      {order + 1}
                    </span>
                  )}
                </span>
                <span className="block truncate px-[8px] pt-[6px] text-[12px] font-bold">{nameOf(object.key)}</span>
                <span className="block px-[8px] pb-[7px] text-[11px] text-graphite tabular-nums">
                  {formatBytes(object.size)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );

  const canUpload = report?.state === "ok";
  const truncated = report?.state === "ok" && report.truncated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px]">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1c1810]/35 backdrop-blur-[2px] motion-safe:animate-scrim-in"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose from library"
        tabIndex={-1}
        className="relative flex max-h-full w-[760px] max-w-full flex-col overflow-hidden rounded-[12px] bg-paper font-sans shadow-[0_16px_48px_rgba(28,24,16,0.22)] outline-none"
      >
        <header className="relative flex flex-wrap items-center gap-[10px] border-b border-line py-[14px] pr-[56px] pl-[20px]">
          <h2 className="mr-auto font-serif text-[22px] leading-[115%] tracking-[-0.3px]">Choose from library</h2>
          {scopeOptions.length > 1 && (
            <SelectField label="Folder, album, artist or tag" value={scope} onChange={setScope} options={scopeOptions} />
          )}
          <SearchField label="Search files" value={query} onChange={setQuery} placeholder="Search names and tags" />
          {canUpload && (
            <UploadButton multiple accept={accept} onUploadedAll={uploaded} className={buttonClass("secondary", "sm")}>
              Upload
            </UploadButton>
          )}
          <span className="absolute top-[14px] right-[14px]">
            <IconButton label="Close" onClick={onClose}>
              <CrossIcon size={16} />
            </IconButton>
          </span>
        </header>
        <MediaDropZone
          multiple
          accept={accept}
          label="Drop to add to the library"
          onUploaded={(_, stored) => uploaded(stored)}
          className="flex min-h-[160px] flex-1 flex-col overflow-hidden"
        >
          <div className={`flex-1 overflow-y-auto px-[20px] py-[16px] text-[14px] ${loading ? "opacity-60" : ""}`}>
            {body}
          </div>
        </MediaDropZone>
        {(multiple || truncated) && (
          <footer className="flex flex-wrap items-center gap-[10px] border-t border-line bg-hover px-[20px] py-[10px] text-[12px]">
            {truncated && (
              <span className="text-draft">
                The bucket holds more files than one listing returns; only the first ones are shown.
              </span>
            )}
            {multiple && (
              <>
                <span className="text-graphite tabular-nums">
                  {picked.length ? `${picked.length} selected` : "Click files to select them"}
                </span>
                {picked.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setPicked([])}>
                    Clear
                  </Button>
                )}
              </>
            )}
            <Button size="sm" variant="ghost" onClick={onClose} className="ml-auto">
              Cancel
            </Button>
            {multiple && (
              <Button size="sm" variant="primary" disabled={picked.length === 0} onClick={() => onPick(picked)}>
                {picked.length > 1 ? `Add ${picked.length} files` : "Add file"}
              </Button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}
