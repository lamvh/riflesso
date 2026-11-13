"use client";

import Link from "next/link";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { Album, Block } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { IconButton, Switch, buttonClass } from "./ui/controls";
import { ArrowDownIcon, ArrowUpIcon } from "./ui/icons";
import { MediaDropZone } from "./ui/media-drop-zone";
import { MediaLibraryButton } from "./ui/media-library-picker";
import { Panel } from "./ui/panel";
import { DragHandle, SortableItem, SortableList } from "./ui/sortable-list";
import { UploadButton } from "./ui/upload-button";

/** Small text buttons under a banner's name. */
const IMAGE_ACTION = "cursor-pointer font-sans text-[12px] font-medium text-graphite underline-offset-2 hover:text-ink hover:underline";

type Thumb = { id: string; src: string; pos: string; video?: boolean };

/**
 * What an album-fed section would show: the album a feature fronts, or the
 * first four albums of a row's kind. Banners show their own image instead.
 */
function thumbsFor(block: Block, albums: Album[]): Thumb[] {
  const toThumb = (album: Album): Thumb => ({
    id: album.id,
    src: album.cover,
    pos: album.pos,
    video: album.video,
  });

  const matching = albums.filter((album) => album.kind === block.source);
  if (block.kind === "Full-bleed") {
    const featured = albums.find((album) => album.id === block.albumId) ?? matching[0];
    return featured ? [toThumb(featured)] : [];
  }
  return matching.slice(0, 4).map(toThumb);
}

const describe = (block: Block) => {
  switch (block.kind) {
    case "Banner":
      return "Banner image";
    case "Full-bleed":
      return `Full-width feature from ${block.source} albums`;
    case "Scroll row":
      return `Scrolling row of ${block.source} albums`;
  }
};

export function SectionList({
  blocks,
  albums,
  dispatch,
}: {
  blocks: Block[];
  albums: Album[];
  dispatch: (action: AdminAction) => void;
}) {
  const live = blocks.filter((block) => block.on).length;
  const setImage = (index: number, image: string) => dispatch({ type: "block/setImage", index, image });

  return (
    <Panel
      title="Page sections"
      description={`${live} of ${blocks.length} showing, in page order`}
      action={
        <Link href="/dashboard/albums" className={buttonClass("ghost", "sm")}>
          Manage albums
        </Link>
      }
      bodyClassName=""
    >
      <SortableList
        ids={blocks.map((block) => block.id)}
        onReorder={(from, to) => dispatch({ type: "list/reorder", list: "blocks", from, to })}
      >
      <ul>
        {blocks.map((block, index) => (
          <SortableItem
            key={block.id}
            id={block.id}
            className={`flex items-center gap-[12px] border-b border-line px-[12px] py-[12px] last:border-b-0 ${
              block.on ? "bg-paper" : "bg-hover"
            }`}
          >
            {({ handleProps }) => (
            <>
            <DragHandle label={`Drag ${block.label} to reorder`} handleProps={handleProps} />
            <Switch
              on={block.on}
              label={`Show ${block.label} on the homepage`}
              onClick={() => dispatch({ type: "block/toggle", index })}
            />

            <div className="min-w-0 flex-1">
              <p
                className={`truncate font-sans text-[15px] leading-[125%] font-bold tracking-[-0.3px] ${
                  block.on ? "text-ink" : "text-graphite"
                }`}
              >
                {block.label}
              </p>
              <p className="mt-[3px] truncate font-sans text-[13px] leading-[130%] text-graphite">
                {block.on ? describe(block) : "Hidden from the homepage"}
                {block.kind === "Banner" && !block.image && " · no image yet, so it is left off the page"}
              </p>
              {block.kind === "Banner" && (
                <div className="mt-[6px] flex flex-wrap gap-x-[12px] gap-y-[4px]">
                  <UploadButton onUploaded={(image) => setImage(index, image)} className={IMAGE_ACTION}>
                    {block.image ? "Replace image" : "Upload image"}
                  </UploadButton>
                  <MediaLibraryButton onPick={(image) => setImage(index, image)} className={IMAGE_ACTION}>
                    Choose from library
                  </MediaLibraryButton>
                  {block.image && (
                    <button type="button" className={IMAGE_ACTION} onClick={() => setImage(index, "")}>
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {block.kind === "Banner" ? (
              /* The banner's picture doubles as a drop target for a new one. */
              <MediaDropZone
                label="Drop"
                onUploaded={([image]) => setImage(index, image)}
                className="h-[44px] w-[78px] shrink-0 overflow-hidden rounded-[4px] bg-well"
              >
                {block.image && <CoverImage src={block.image} pos="50% 50%" dim={block.on ? 1 : 0.4} />}
              </MediaDropZone>
            ) : (
              <div className="hidden shrink-0 gap-[4px] sm:flex">
                {thumbsFor(block, albums).map((thumb) => (
                  <div key={thumb.id} className="h-[44px] w-[34px] overflow-hidden rounded-[4px] bg-well">
                    <CoverImage src={thumb.src} pos={thumb.pos} video={thumb.video} dim={block.on ? 1 : 0.4} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex shrink-0">
              <IconButton
                label={`Move ${block.label} up`}
                disabled={index === 0}
                onClick={() => dispatch({ type: "block/move", index, delta: -1 })}
              >
                <ArrowUpIcon />
              </IconButton>
              <IconButton
                label={`Move ${block.label} down`}
                disabled={index === blocks.length - 1}
                onClick={() => dispatch({ type: "block/move", index, delta: 1 })}
              >
                <ArrowDownIcon />
              </IconButton>
            </div>
            </>
            )}
          </SortableItem>
        ))}
      </ul>
      </SortableList>
    </Panel>
  );
}
