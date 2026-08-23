"use client";

import Link from "next/link";

import type { AdminAction } from "@/lib/dashboard/admin-reducer";
import type { Album, Block } from "@/lib/dashboard/admin-types";

import { CoverImage } from "./cover-image";
import { OutlineButton, Switch } from "./ui/controls";

/**
 * A section shows what it would pull: the first four albums of its kind. If no
 * album carries that kind yet, the row falls back to the head of the library so
 * the strip never renders as four empty wells.
 */
const coversFor = (albums: Album[], source: Block["source"]) => {
  const matching = albums.filter((album) => album.kind === source);
  return (matching.length ? matching : albums).slice(0, 4);
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
    <div>
      <div className="flex items-end justify-between gap-5 border-b border-ink pb-[12px]">
        <div>
          <h2 className="font-sans text-[22px] leading-[95%] font-bold tracking-[-1.1px]">
            Page sections
          </h2>
          <p className="mt-[7px] font-serif text-[15px] leading-none text-dim">
            {live} of {blocks.length} sections live, top to bottom
          </p>
        </div>
        <Link
          href="/dashboard/albums"
          className="border-b border-ink font-sans text-[12px] leading-none font-bold tracking-[-0.3px]"
        >
          Manage albums
        </Link>
      </div>

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {blocks.map((block, index) => (
          <div
            key={block.label}
            className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[18px] border px-[16px] py-[14px] ${
              block.on ? "border-ink bg-paper" : "border-[#d9d9d9] bg-shell"
            }`}
          >
            <Switch
              on={block.on}
              label={`Toggle ${block.label}`}
              onClick={() => dispatch({ type: "block/toggle", index })}
            />

            <div className="flex min-w-0 items-center gap-[18px]">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`font-sans text-[17px] leading-none font-bold tracking-[-0.8px] ${
                      block.on ? "text-ink" : "text-[#8c8c8c]"
                    }`}
                  >
                    {block.label}
                  </p>
                  <span
                    className={`border px-[6px] py-[3px] font-sans text-[10px] leading-none font-bold tracking-[0.04em] uppercase ${
                      block.on
                        ? "border-ink text-ink"
                        : "border-[#c9c9c9] text-[#8c8c8c]"
                    }`}
                  >
                    {block.kind}
                  </span>
                </div>
                <p className="mt-[7px] font-serif text-[14px] leading-none text-dim">
                  {block.on
                    ? `Live · sourced from ${block.source} albums`
                    : "Hidden from the homepage"}
                </p>
              </div>

              <div className="flex shrink-0 gap-[5px]">
                {coversFor(albums, block.source).map((album) => (
                  <div key={album.id} className="h-[46px] w-[36px] overflow-hidden bg-well">
                    <CoverImage
                      src={album.cover}
                      pos={album.pos}
                      video={album.video}
                      dim={block.on ? 1 : 0.4}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-[6px]">
              <OutlineButton small onClick={() => dispatch({ type: "block/move", index, delta: -1 })}>
                ↑
              </OutlineButton>
              <OutlineButton small onClick={() => dispatch({ type: "block/move", index, delta: 1 })}>
                ↓
              </OutlineButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
