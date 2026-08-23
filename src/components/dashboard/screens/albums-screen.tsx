"use client";

import { useState } from "react";

import { creditsLine } from "@/lib/dashboard/admin-state";
import { ALBUM_KINDS } from "@/lib/dashboard/admin-types";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { Chip, UnderlineButton } from "../ui/controls";

const FILTERS = ["All", ...ALBUM_KINDS];

export function AlbumsScreen() {
  const { state, dispatch } = useAdmin();
  const [kind, setKind] = useState("All");

  const cards = state.albums
    .map((album, index) => ({ album, index }))
    .filter(({ album }) => kind === "All" || album.kind === kind);

  return (
    <section className="px-[28px] pt-[24px] pb-[60px]">
      <div className="flex flex-wrap gap-[6px] border-b border-ink pb-[18px]">
        {FILTERS.map((option) => (
          <Chip
            key={option}
            label={option}
            active={kind === option}
            onClick={() => setKind(option)}
          />
        ))}
      </div>

      <div className="mt-[22px] grid grid-cols-4 gap-[22px]">
        {cards.map(({ album, index }) => (
          <div key={album.id} className="flex min-w-0 flex-col gap-[10px]">
            <button
              type="button"
              onClick={() => dispatch({ type: "album/open", index })}
              className="relative block aspect-3/4 cursor-pointer overflow-hidden bg-well"
            >
              <CoverImage src={album.cover} pos={album.pos} video={album.video} />
              <span
                className={`absolute top-[8px] left-[8px] px-[7px] py-[4px] font-sans text-[10px] leading-none font-bold tracking-[0.04em] uppercase ${
                  album.live ? "bg-ink text-paper" : "bg-paper text-ink"
                }`}
              >
                {album.live ? "Live" : "Draft"}
              </span>
            </button>

            <div className="flex flex-col gap-[6px]">
              <p className="font-sans text-[15px] leading-none font-bold tracking-[-0.6px]">
                {album.title}
              </p>
              <p className="font-serif text-[14px] leading-[115%] text-dim">
                {album.kind} · {album.frames.length} image
                {album.frames.length === 1 ? "" : "s"}
              </p>
              <p className="font-serif text-[14px] leading-[115%]">
                {creditsLine(album.credits) || "No credits"}
              </p>
              <div className="mt-[2px] flex gap-[10px]">
                <UnderlineButton onClick={() => dispatch({ type: "album/open", index })}>
                  Edit
                </UnderlineButton>
                <UnderlineButton
                  muted={album.home}
                  onClick={() => dispatch({ type: "album/toggleHome", index })}
                >
                  {album.home ? "Remove from homepage" : "Feature on homepage"}
                </UnderlineButton>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => dispatch({ type: "album/open", index: -1 })}
          className="flex aspect-3/4 min-w-0 cursor-pointer flex-col items-center justify-center gap-[10px] border border-dashed border-ink bg-shell"
        >
          <span className="font-sans text-[34px] leading-none font-bold tracking-[-2px]">
            +
          </span>
          <span className="font-sans text-[13px] leading-none font-bold tracking-[-0.4px]">
            New album
          </span>
          <span className="font-serif text-[13px] leading-none text-dim">
            Add images in the drawer
          </span>
        </button>
      </div>
    </section>
  );
}
