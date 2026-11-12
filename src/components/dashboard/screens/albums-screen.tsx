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
import { BulkBar, BulkButton, SelectBox, toggleId } from "../ui/selection-controls";

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
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const picked = state.albums.filter((album) => selected.has(album.id)).map((album) => album.id);
  const shownIds = cards.map(({ album }) => album.id);
  const allShown = shownIds.length > 0 && shownIds.every((id) => selected.has(id));
  const clearSelection = () => setSelected(new Set());
  const bulkSet = (patch: { live?: boolean; home?: boolean }) =>
    dispatch({ type: "album/bulkSet", ids: picked, patch });
  const bulkDelete = () => {
    if (!window.confirm(`Delete ${plural(picked.length, "album")}? They leave the site right away — History can bring them back.`)) return;
    dispatch({ type: "album/bulkDelete", ids: picked });
    clearSelection();
  };

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
        {shownIds.length > 0 && (
          <label className="flex cursor-pointer items-center gap-[8px] font-sans text-[13px] font-medium text-body sm:ml-auto">
            <SelectBox
              label={allShown ? "Deselect all albums shown" : "Select all albums shown"}
              checked={allShown}
              mixed={!allShown && shownIds.some((id) => selected.has(id))}
              onChange={(on) =>
                setSelected((previous) => {
                  const next = new Set(previous);
                  for (const id of shownIds) {
                    if (on) next.add(id);
                    else next.delete(id);
                  }
                  return next;
                })
              }
            />
            Select all
          </label>
        )}
        <p className="font-sans text-[13px] text-graphite tabular-nums">
          {filtered
            ? `${cards.length} of ${plural(state.albums.length, "album")}`
            : plural(state.albums.length, "album")}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-start gap-[12px] rounded-[10px] border border-line bg-paper shadow-sheet px-[20px] py-[28px]">
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
              className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center gap-[8px] rounded-[10px] border border-dashed border-line-strong text-graphite transition-colors hover:border-ink hover:bg-paper hover:text-ink"
            >
              <PlusIcon size={20} />
              <span className="font-sans text-[14px] font-bold text-ink">New album</span>
              <span className="font-sans text-[13px]">Add a title, images and credits</span>
            </button>
          )}

          {cards.map(({ album, index }) => (
            <article
              key={album.id}
              className={`group/card relative flex min-w-0 flex-col overflow-hidden rounded-[10px] border bg-paper shadow-sheet transition-[border-color,box-shadow] hover:shadow-lift ${
                selected.has(album.id)
                  ? "border-ink shadow-[0_0_0_1px_var(--color-ink)]"
                  : "border-line hover:border-line-strong"
              }`}
            >
              {/* Hidden until hover or a pick is under way, so the grid stays calm. */}
              <span
                className={`absolute top-[8px] right-[8px] z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-paper/95 shadow-sheet transition-opacity ${
                  selected.size > 0 || selected.has(album.id)
                    ? "opacity-100"
                    : "opacity-0 group-hover/card:opacity-100 focus-within:opacity-100"
                }`}
              >
                <SelectBox
                  label={`Select ${album.title}`}
                  checked={selected.has(album.id)}
                  onChange={(on) => setSelected((previous) => toggleId(previous, album.id, on))}
                />
              </span>
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

      {picked.length > 0 && (
        <BulkBar count={picked.length} noun="album" onClear={clearSelection}>
          <BulkButton onClick={() => bulkSet({ live: true })}>Publish</BulkButton>
          <BulkButton onClick={() => bulkSet({ live: false })}>Move to draft</BulkButton>
          <BulkButton onClick={() => bulkSet({ home: true })}>Add to homepage</BulkButton>
          <BulkButton onClick={() => bulkSet({ home: false })}>Remove from homepage</BulkButton>
          <BulkButton danger onClick={bulkDelete}>
            Delete
          </BulkButton>
        </BulkBar>
      )}
    </div>
  );
}
