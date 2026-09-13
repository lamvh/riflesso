"use client";

import { useMemo, useState } from "react";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { Chip } from "../ui/controls";
import { ColumnHead } from "../ui/fields";

const ALL = "All";
const TERRITORIES = [ALL, "US", "EUROPE"];

/** The design shows the first six disciplines as chips; the rest live in the drawer. */
const CHIP_COUNT = 6;

const GRID = "grid grid-cols-[64px_1.4fr_1.5fr_100px_90px_110px_80px] gap-[16px]";

export function ArtistsScreen() {
  const { state, dispatch } = useAdmin();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);
  const [terr, setTerr] = useState(ALL);

  const nameById = useMemo(
    () => new Map(state.cats.map((category) => [category.id, category.name])),
    [state.cats],
  );

  /* Works is the count of albums an artist is credited on, so it moves when a
     credit is edited rather than being a number kept by hand. */
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
          (terr === ALL || artist.territory === terr),
      );
  }, [state.artists, query, cat, terr]);

  const chips = [{ id: ALL, name: ALL }, ...state.cats.slice(0, CHIP_COUNT)];

  return (
    <section className="px-[28px] pt-[24px] pb-[60px]">
      <div className="flex flex-wrap items-center gap-[16px] border-b border-ink pb-[16px]">
        <div className="flex basis-[300px] items-center gap-2 border border-ink px-[11px] py-[9px]">
          <label htmlFor="artist-query" className="sr-only">
            Search by name
          </label>
          <input
            id="artist-query"
            type="text"
            value={query}
            placeholder="Search by name..."
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 border-none bg-paper font-serif text-[15px] leading-none"
          />
        </div>

        <div className="flex flex-wrap gap-[6px]">
          {chips.map((option) => (
            <Chip
              key={option.id}
              label={option.name}
              active={cat === option.id}
              onClick={() => setCat(option.id)}
            />
          ))}
        </div>

        <div className="ml-auto flex gap-[6px]">
          {TERRITORIES.map((option) => (
            <Chip
              key={option}
              label={option}
              active={terr === option}
              onClick={() => setTerr(option)}
            />
          ))}
        </div>
      </div>

      <div className={`${GRID} border-b border-ink px-[2px] py-[12px]`}>
        <ColumnHead>Photo</ColumnHead>
        <ColumnHead>Artist</ColumnHead>
        <ColumnHead>Categories</ColumnHead>
        <ColumnHead>Territory</ColumnHead>
        <ColumnHead>Works</ColumnHead>
        <ColumnHead>Status</ColumnHead>
        <ColumnHead align="right">Edit</ColumnHead>
      </div>

      {rows.map(({ artist, index }) => (
        <div
          key={artist.id}
          className={`${GRID} items-center border-b border-rule px-[2px] py-[10px] hover:bg-[#f7f7f7]`}
        >
          <div className="h-[60px] w-[48px] overflow-hidden bg-well">
            <CoverImage src={artist.image} pos={artist.pos} />
          </div>

          <span className="font-sans text-[16px] leading-none font-bold tracking-[-0.7px]">
            {artist.name}
          </span>

          <span className="font-serif text-[15px] leading-[115%] text-[#333]">
            {artist.categoryIds
              .map((id) => nameById.get(id))
              .filter(Boolean)
              .join(", ") || "—"}
          </span>

          <span className="font-sans text-[12px] leading-none font-bold">
            {artist.territory}
          </span>

          <span className="font-serif text-[15px] leading-none">
            {works.get(artist.name) ?? 0}
          </span>

          <button
            type="button"
            onClick={() => dispatch({ type: "artist/toggleLive", index })}
            className={`cursor-pointer justify-self-start border border-ink px-[9px] py-[5px] font-sans text-[11px] leading-none font-bold ${
              artist.live ? "bg-ink text-paper" : "bg-paper text-ink"
            }`}
          >
            {artist.live ? "Live" : "Draft"}
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: "artist/open", index })}
            className="cursor-pointer justify-self-end border-b border-ink font-sans text-[12px] leading-none font-bold tracking-[-0.3px]"
          >
            Edit
          </button>
        </div>
      ))}

      {rows.length === 0 && (
        <p className="px-[2px] py-[40px] font-serif text-[24px] leading-none text-subtle">
          No artists found.
        </p>
      )}
    </section>
  );
}
