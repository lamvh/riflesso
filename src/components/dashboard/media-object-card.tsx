"use client";

import type { MediaUsage, MediaUsageState } from "@/lib/dashboard/media-usage";
import { formatBytes, type MediaObject } from "@/lib/media/media-library-types";
import { isVideoSrc } from "@/lib/media-src";

import { CoverImage } from "./cover-image";
import { Button, StatusPill, buttonClass, type Tone } from "./ui/controls";

export const USAGE_PILL: Record<MediaUsageState, [Tone, string, string]> = {
  live: ["live", "In use", "Published and still in the draft"],
  pending: ["draft", "Unpublished", "Only in unpublished changes; goes live on Publish"],
  removing: ["draft", "Removed in draft", "Still on the site; leaves it on Publish"],
  unused: ["danger", "Unused", "No record points at this file"],
};

/** How many places a card lists before it summarises the rest. */
const PLACE_LIMIT = 3;

const dateOf = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Unknown date";

/** One stored object: preview, size, upload date, and every record that uses it. */
export function MediaObjectCard({
  object,
  usage,
  onCopy,
  onDelete,
  busy,
}: {
  object: MediaObject;
  usage: MediaUsage;
  onCopy: (url: string) => void;
  /** Offered only for files nothing uses. */
  onDelete: () => void;
  busy: boolean;
}) {
  const [tone, label, hint] = USAGE_PILL[usage.state];
  const slash = object.key.lastIndexOf("/");
  const name = object.key.slice(slash + 1);
  const folder = slash > 0 ? object.key.slice(0, slash) : "";
  const extra = usage.places.length - PLACE_LIMIT;

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[2px] border border-line bg-paper">
      <div className="relative aspect-4/3 overflow-hidden bg-well">
        <CoverImage src={object.url} pos="50% 50%" video={isVideoSrc(object.url)} />
        <span className="absolute top-[8px] left-[8px]" title={hint}>
          <StatusPill tone={tone}>{label}</StatusPill>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[6px] px-[12px] pt-[10px] pb-[12px] font-sans">
        <p className="truncate text-[14px] leading-[125%] font-bold" title={object.key}>
          {name}
        </p>
        <p className="text-[13px] leading-none text-graphite tabular-nums">
          {formatBytes(object.size)} · {dateOf(object.lastModified)}
        </p>
        {folder && <p className="truncate text-[12px] leading-none text-subtle">{folder}</p>}

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

        <div className="mt-auto flex items-center gap-[6px] border-t border-line pt-[10px]">
          <a href={object.url} target="_blank" rel="noreferrer" className={buttonClass("secondary", "sm")}>
            Open
          </a>
          <Button size="sm" variant="ghost" onClick={() => onCopy(object.url)}>
            Copy URL
          </Button>
          {usage.state === "unused" && (
            <Button size="sm" variant="danger" onClick={onDelete} disabled={busy} className="ml-auto">
              Delete
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
