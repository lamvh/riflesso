"use client";

import Link from "next/link";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { Album, Block } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { IconButton, Switch, buttonClass } from "./ui/controls";
import { ArrowDownIcon, ArrowUpIcon } from "./ui/icons";
import { Panel } from "./ui/panel";

type Thumb = { id: string; src: string; pos: string; video?: boolean };

/**
 * What a section would show: its banner image, the album a feature fronts, or
 * the first four albums of a row's kind.
 */
function thumbsFor(block: Block, albums: Album[]): Thumb[] {
  const toThumb = (album: Album): Thumb => ({
    id: album.id,
    src: album.cover,
    pos: album.pos,
    video: album.video,
  });

  if (block.kind === "Banner") {
    return block.image ? [{ id: "banner", src: block.image, pos: "50% 50%" }] : [];
  }
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
      <ul>
        {blocks.map((block, index) => (
          <li
            key={block.id}
            className={`flex items-center gap-[14px] border-b border-line px-[16px] py-[12px] last:border-b-0 ${
              block.on ? "" : "bg-[#fafaf9]"
            }`}
          >
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
              </p>
            </div>

            <div className="hidden shrink-0 gap-[4px] sm:flex">
              {thumbsFor(block, albums).map((thumb) => (
                <div key={thumb.id} className="h-[44px] w-[34px] overflow-hidden rounded-[1px] bg-well">
                  <CoverImage src={thumb.src} pos={thumb.pos} video={thumb.video} dim={block.on ? 1 : 0.4} />
                </div>
              ))}
            </div>

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
          </li>
        ))}
      </ul>
    </Panel>
  );
}
