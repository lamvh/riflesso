"use client";

import { GROUP_LABEL, groupId, type MediaGroup } from "@/lib/dashboard/media-groups";
import type { MediaUsage, MediaUsageState } from "@/lib/dashboard/media-usage";
import type { MediaLabel } from "@/lib/media/media-label-types";
import { formatBytes, type MediaObject } from "@/lib/media/media-library-types";
import { isVideoSrc } from "@/lib/media-src";

import { CoverImage } from "./cover-image";
import { useMediaCardDrag } from "./media-file-drag";
import { Button, StatusPill, buttonClass, type Tone } from "./ui/controls";
import { SelectBox } from "./ui/selection-controls";
import { UploadButton } from "./ui/upload-button";
import type { UploadedFile } from "./ui/use-media-upload";

export const USAGE_PILL: Record<MediaUsageState, [Tone, string, string]> = {
  live: ["live", "In use", "Saved and on the site"],
  pending: ["draft", "Saving", "Used by an edit that is not saved yet"],
  removing: ["draft", "Being removed", "Still on the site until the latest edit saves"],
  replaced: ["neutral", "Replaced", "A newer version took its place; kept so history restores still work"],
  unused: ["danger", "Unused", "No record points at this file"],
};

/** How many places a card lists before it summarises the rest. */
const PLACE_LIMIT = 3;

const dateOf = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Unknown date";

const CHIP =
  "max-w-full cursor-pointer truncate rounded-[5px] px-[6px] py-[3px] text-[11px] leading-none font-medium transition-colors";

/**
 * One stored object: preview, size, upload date, its folder and tags, and
 * every record that uses it. Tag and group chips set the screen's filter.
 * While labels can be edited the card can be dragged onto a folder, and
 * Edit opens its folder and tags.
 */
export function MediaObjectCard({
  object,
  usage,
  label,
  groups,
  selected,
  onSelect,
  onFilter,
  onCopy,
  onDelete,
  onEdit,
  onReplace,
  dragKeys,
  busy,
}: {
  object: MediaObject;
  usage: MediaUsage;
  label: MediaLabel;
  /** Albums and artists the file belongs to, read off the content. */
  groups: MediaGroup[];
  selected: boolean;
  /** Absent while folders and tags are unavailable. */
  onSelect?: (on: boolean) => void;
  /** Filter the screen by a tag ("tag:…") or group ("album:…", "artist:…"). */
  onFilter: (value: string) => void;
  onCopy: (url: string) => void;
  /** Offered only for files nothing uses. */
  onDelete: () => void;
  /** Absent while folders and tags are unavailable; also turns dragging off. */
  onEdit?: () => void;
  /** Re-upload: the new file takes this one's place everywhere it is used. */
  onReplace: (file: UploadedFile) => void;
  /** What a drag of this card carries (the selection, or just this file). */
  dragKeys: string[];
  busy: boolean;
}) {
  const { setNodeRef, dragProps, isDragging } = useMediaCardDrag(object.key, dragKeys, !onEdit);
  const [tone, pill, hint] = USAGE_PILL[usage.state];
  const name = object.key.slice(object.key.lastIndexOf("/") + 1);
  const extra = usage.places.length - PLACE_LIMIT;
  const video = isVideoSrc(object.url);

  return (
    <article
      ref={setNodeRef}
      {...dragProps}
      className={`flex min-w-0 flex-col overflow-hidden rounded-[10px] border bg-paper shadow-sheet transition-opacity ${
        selected ? "border-ink ring-1 ring-ink" : "border-line"
      } ${isDragging ? "opacity-50" : ""} ${onEdit ? "touch-manipulation" : ""}`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-well">
        <CoverImage src={object.url} pos="50% 50%" video={video} />
        <span className="absolute top-[8px] left-[8px]" title={hint}>
          <StatusPill tone={tone}>{pill}</StatusPill>
        </span>
        {onSelect && (
          <span className="absolute top-[6px] right-[6px] flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-paper/90 shadow-sheet">
            <SelectBox checked={selected} label={`Select ${name}`} onChange={onSelect} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[6px] px-[12px] pt-[10px] pb-[12px] font-sans">
        <p className="truncate text-[14px] leading-[125%] font-bold" title={object.key}>
          {name}
        </p>
        <p className="text-[13px] leading-none text-graphite tabular-nums">
          {formatBytes(object.size)} · {dateOf(object.lastModified)}
        </p>
        <p className="truncate text-[12px] leading-none text-subtle" title={object.key}>
          {label.folder ? `Folder · ${label.folder.replaceAll("/", " / ")}` : "Unfiled"}
        </p>

        {(label.tags.length > 0 || groups.length > 0) && (
          <div className="flex flex-wrap gap-[4px]">
            {groups.map((group) => (
              <button
                key={groupId(group)}
                type="button"
                onClick={() => onFilter(groupId(group))}
                title={`Show every file of ${GROUP_LABEL[group.kind].toLowerCase()} ${group.name}`}
                className={`${CHIP} bg-sink text-graphite hover:text-ink`}
              >
                {GROUP_LABEL[group.kind]} · {group.name}
              </button>
            ))}
            {label.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onFilter(`tag:${tag}`)}
                title={`Show every file tagged ${tag}`}
                className={`${CHIP} bg-ink/8 text-ink hover:bg-ink/15`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="mt-[4px] text-[13px] leading-[135%]">
          {usage.places.length === 0 ? (
            <p className="text-graphite">Not used by any record</p>
          ) : (
            <ul>
              {usage.places.slice(0, PLACE_LIMIT).map((place) => (
                <li key={place} className="truncate" title={place}>
                  {place}
                </li>
              ))}
              {extra > 0 && <li className="text-graphite">and {extra} more</li>}
            </ul>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-[6px] border-t border-line pt-[10px]">
          <a href={object.url} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
            Open
          </a>
          <Button size="sm" variant="ghost" onClick={() => onCopy(object.url)}>
            Copy URL
          </Button>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          )}
          <UploadButton
            accept={video ? "video/mp4,video/webm" : "image/*"}
            onUploadedAll={([file]) => file && onReplace(file)}
            className={buttonClass("ghost", "sm")}
          >
            <span title="Upload a new version; every record using this file switches to it">Replace</span>
          </UploadButton>
          {(usage.state === "unused" || usage.state === "replaced") && (
            <Button size="sm" variant="danger" onClick={onDelete} disabled={busy} className="ml-auto">
              Delete
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
