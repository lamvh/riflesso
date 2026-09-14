"use client";

import { useMemo, useState } from "react";

import { plural } from "@/lib/dashboard/admin-changes";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { Button, Segmented, StatusPill, liveTone } from "../ui/controls";
import { ColumnHead, SearchField, SelectField } from "../ui/fields";
import { Panel } from "../ui/panel";

const ALL = "all";

const TERRITORY_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "US", label: "US" },
  { value: "EUROPE", label: "Europe" },
];

const STATUS_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "live", label: "Live" },
  { value: "draft", label: "Draft" },
];

const GRID =
  "grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-[16px] md:grid-cols-[44px_minmax(0,1fr)_80px_64px_88px]";

export function ArtistsScreen() {
  const { state, dispatch } = useAdmin();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);
  const [territory, setTerritory] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const nameById = useMemo(
    () => new Map(state.cats.map((category) => [category.id, category.name])),
    [state.cats],
  );

  /* Albums an artist is credited on, so it moves when a credit is edited
     rather than being a number kept by hand. */
  const works = useMemo(() => {
    const counts = new Map<string, number>();
    for (const album of state.albums) {
      for (const credit of album.credits) {
        counts.set(credit.name, (counts.get(credit.name) ?? 0) + 1);
      }
    }
    return counts;
  }, [state.albums]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.artists
      .map((artist, index) => ({ artist, index }))
      .filter(
        ({ artist }) =>
          (!needle || artist.name.toLowerCase().includes(needle)) &&
          (cat === ALL || artist.categoryIds.includes(cat)) &&
          (territory === ALL || artist.territory === territory) &&
          (status === ALL || artist.live === (status === "live")),
      );
  }, [state.artists, query, cat, territory, status]);

  const filtered = Boolean(query.trim()) || cat !== ALL || territory !== ALL || status !== ALL;
  const clearFilters = () => {
    setQuery("");
    setCat(ALL);
    setTerritory(ALL);
    setStatus(ALL);
  };

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="flex flex-wrap items-center gap-[10px]">
        <SearchField
          label="Search artists"
          value={query}
          onChange={setQuery}
          placeholder="Search by name"
        />
        <SelectField
          label="Category"
          value={cat}
          onChange={setCat}
          options={[
            { value: ALL, label: "All categories" },
            ...state.cats.map((category) => ({ value: category.id, label: category.name })),
          ]}
        />
        <Segmented label="Territory" options={TERRITORY_OPTIONS} value={territory} onChange={setTerritory} />
        <Segmented label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <p className="font-sans text-[13px] text-graphite tabular-nums sm:ml-auto">
          {filtered
            ? `${rows.length} of ${plural(state.artists.length, "artist")}`
            : plural(state.artists.length, "artist")}
        </p>
      </div>

      <Panel bodyClassName="">
        <div className={`${GRID} border-b border-line px-[16px] py-[10px]`}>
          <span />
          <ColumnHead>Artist</ColumnHead>
          <ColumnHead className="hidden md:block">Territory</ColumnHead>
          <ColumnHead className="hidden md:block">Albums</ColumnHead>
          <ColumnHead>Status</ColumnHead>
        </div>

        {rows.map(({ artist, index }) => {
          const categories = artist.categoryIds
            .map((id) => nameById.get(id))
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={artist.id}
              className={`${GRID} relative border-b border-line px-[16px] py-[10px] transition-colors last:border-b-0 hover:bg-hover`}
            >
              <div className="h-[56px] w-[44px] overflow-hidden rounded-[2px] bg-well">
                <CoverImage src={artist.image} pos={artist.pos} />
              </div>

              <div className="min-w-0">
                {/* The name's hit area stretches over the whole row. */}
                <button
                  type="button"
                  onClick={() => dispatch({ type: "artist/open", index })}
                  className="block max-w-full cursor-pointer truncate text-left font-sans text-[15px] leading-[125%] font-bold tracking-[-0.3px] after:absolute after:inset-0 after:content-['']"
                >
                  {artist.name}
                </button>
                <p className="mt-[3px] truncate font-serif text-[14px] leading-[130%] text-graphite">
                  {categories || "No categories"}
                </p>
              </div>

              <span className="hidden font-sans text-[13px] font-medium md:block">
                {artist.territory === "EUROPE" ? "Europe" : "US"}
              </span>
              <span className="hidden font-sans text-[13px] text-graphite tabular-nums md:block">
                {works.get(artist.name) ?? 0}
              </span>
              <span>
                <StatusPill
                  tone={liveTone(artist.live)}
                  title={artist.live ? "Move to draft" : "Show in the directory"}
                  onClick={() => dispatch({ type: "artist/toggleLive", index })}
                >
                  {artist.live ? "Live" : "Draft"}
                </StatusPill>
              </span>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div className="flex flex-col items-start gap-[12px] px-[20px] py-[28px]">
            <p className="font-sans text-[15px] font-medium">No artists match these filters.</p>
            <Button size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
