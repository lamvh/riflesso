"use client";

import { useState } from "react";

import { plural } from "@/lib/dashboard/admin-changes";
import { creditsLine } from "@/lib/dashboard/admin-state";
import { ALBUM_KINDS } from "@/lib/dashboard/admin-types";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { Button, Segmented, StatusPill, Switch, liveTone } from "../ui/controls";
import { SearchField } from "../ui/fields";
import { PlusIcon } from "../ui/icons";

const ALL = "all";

const KIND_OPTIONS = [
  { value: ALL, label: "All" },
  ...ALBUM_KINDS.map((kind) => ({ value: kind, label: kind })),
];

const STATUS_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
];

export function AlbumsScreen() {
  const { state, dispatch } = useAdmin();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const needle = query.trim().toLowerCase();
  const cards = state.albums
    .map((album, index) => ({ album, index }))
    .filter(
      ({ album }) =>
        (kind === ALL || album.kind === kind) &&
        (status === ALL || album.live === (status === "live")) &&
        (!needle ||
          album.title.toLowerCase().includes(needle) ||
          album.credits.some((credit) => credit.name.toLowerCase().includes(needle))),
    );

  const filtered = Boolean(needle) || kind !== ALL || status !== ALL;
  const clearFilters = () => {
    setQuery("");
    setKind(ALL);
    setStatus(ALL);
  };

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-[10px]">
        <SearchField
          label="Search albums"
          value={query}
          onChange={setQuery}
          placeholder="Search titles and credits"
        />
        <Segmented label="Album type" options={KIND_OPTIONS} value={kind} onChange={setKind} />
        <Segmented label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <p className="font-sans text-[13px] text-graphite tabular-nums sm:ml-auto">
          {filtered
            ? `${cards.length} of ${plural(state.albums.length, "album")}`
            : plural(state.albums.length, "album")}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-start gap-[12px] rounded-[2px] border border-line bg-paper px-[20px] py-[28px]">
          <p className="font-sans text-[15px] font-medium">No albums match these filters.</p>
          <Button size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[14px]">
          {!filtered && (
            <button
              type="button"
              onClick={() => dispatch({ type: "album/open", index: -1 })}
              className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[2px] border border-dashed border-[#b5b5b2] text-graphite transition-colors hover:border-ink hover:bg-paper hover:text-ink"
            >
              <PlusIcon size={20} />
              <span className="font-sans text-[14px] font-bold text-ink">New album</span>
              <span className="font-sans text-[13px]">Add a title, images and credits</span>
            </button>
          )}

          {cards.map(({ album, index }) => (
            <article
              key={album.id}
              className="relative flex min-w-0 flex-col overflow-hidden rounded-[2px] border border-line bg-paper transition-colors hover:border-[#b5b5b2]"
            >
              <div className="relative aspect-4/5 overflow-hidden bg-well">
                <CoverImage src={album.cover} pos={album.pos} video={album.video} />
                <span className="absolute top-[8px] left-[8px]">
                  <StatusPill tone={liveTone(album.live)}>{album.live ? "Live" : "Draft"}</StatusPill>
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-[5px] px-[12px] pt-[10px] pb-[12px]">
                {/* The title's hit area covers the card; the switch sits above it. */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: "album/open", index })}
                  className="cursor-pointer truncate text-left font-sans text-[15px] leading-[125%] font-bold tracking-[-0.3px] after:absolute after:inset-0 after:content-['']"
                >
                  {album.title}
                </button>
                <p className="font-sans text-[13px] leading-none text-graphite">
                  {album.kind}, {plural(album.frames.length, "image")}
                </p>
                <p className="line-clamp-2 font-serif text-[14px] leading-[130%]">
                  {creditsLine(album.credits) || "No credits yet"}
                </p>

                <div className="mt-auto flex items-center justify-between gap-[8px] border-t border-line pt-[10px]">
                  <span className="font-sans text-[13px] text-graphite">On homepage</span>
                  <Switch
                    on={album.home}
                    label={`Show ${album.title} on the homepage`}
                    onClick={() => dispatch({ type: "album/toggleHome", index })}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
