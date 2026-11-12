"use client";

import { useMemo, useState } from "react";

import { plural } from "@/lib/dashboard/admin-changes";

import { useAdmin } from "../admin-store";
import { CoverImage } from "../cover-image";
import { Button, Segmented, Switch } from "../ui/controls";
import { ColumnHead, SearchField, SelectField } from "../ui/fields";
import { Panel } from "../ui/panel";
import { BulkBar, BulkButton, BulkSelect, SelectBox, toggleId } from "../ui/selection-controls";

const ALL = "all";

const TERRITORY_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "US", label: "US" },
  { value: "EUROPE", label: "Europe" },
];

const STATUS_OPTIONS = [
  { value: ALL, label: "All" },
  { value: "live", label: "Visible" },
  { value: "draft", label: "Hidden" },
];

const GRID =
  "grid grid-cols-[16px_44px_minmax(0,1fr)_auto] items-center gap-x-[14px] md:grid-cols-[16px_44px_minmax(0,1fr)_80px_64px_112px]";

export function ArtistsScreen() {
  const { state, dispatch } = useAdmin();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);
  const [territory, setTerritory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  /* Only ids still on the roster count — a bulk delete empties the pick. */
  const picked = state.artists.filter((artist) => selected.has(artist.id)).map((artist) => artist.id);
  const shownIds = rows.map(({ artist }) => artist.id);
  const allShown = shownIds.length > 0 && shownIds.every((id) => selected.has(id));
  const someShown = shownIds.some((id) => selected.has(id));
  const clearSelection = () => setSelected(new Set());

  const bulkDelete = () => {
    if (!window.confirm(`Delete ${plural(picked.length, "artist")}? They leave the site right away — History can bring them back.`)) return;
    dispatch({ type: "artist/bulkDelete", ids: picked });
    clearSelection();
  };

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
        {/* On a phone the filters share one row that scrolls sideways. */}
        <div className="-mx-[16px] flex w-[calc(100%+32px)] items-center gap-[8px] overflow-x-auto px-[16px] [scrollbar-width:none] sm:contents">
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
        <p className="shrink-0 font-sans text-[13px] whitespace-nowrap text-graphite tabular-nums sm:ml-auto">
          {filtered
            ? `${rows.length} of ${plural(state.artists.length, "artist")}`
            : plural(state.artists.length, "artist")}
        </p>
        </div>
      </div>

      <Panel bodyClassName="">
        <div className={`${GRID} border-b border-line px-[16px] py-[10px]`}>
          <SelectBox
            label={allShown ? "Deselect all artists shown" : "Select all artists shown"}
            checked={allShown}
            mixed={someShown && !allShown}
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
          <span />
          <ColumnHead>Artist</ColumnHead>
          <ColumnHead className="hidden md:block">Territory</ColumnHead>
          <ColumnHead className="hidden md:block">Albums</ColumnHead>
          <ColumnHead>On site</ColumnHead>
        </div>

        {rows.map(({ artist, index }) => {
          const categories = artist.categoryIds
            .map((id) => nameById.get(id))
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={artist.id}
              className={`${GRID} relative border-b border-line px-[16px] py-[10px] transition-colors last:border-b-0 ${
                selected.has(artist.id) ? "bg-hover" : "hover:bg-hover"
              }`}
            >
              <SelectBox
                label={`Select ${artist.name}`}
                checked={selected.has(artist.id)}
                onChange={(on) => setSelected((previous) => toggleId(previous, artist.id, on))}
              />
              <div className="h-[56px] w-[44px] overflow-hidden rounded-[6px] bg-well">
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
              {/* A real switch, not a pill: hiding should not need a click into the
                  artist. It sits above the row's open-drawer hit area. */}
              <span className="flex items-center gap-[8px]">
                <Switch
                  on={artist.live}
                  label={artist.live ? `Hide ${artist.name} from the directory` : `Show ${artist.name} in the directory`}
                  onClick={() => dispatch({ type: "artist/toggleLive", index })}
                />
                <span
                  className={`font-sans text-[13px] font-medium ${artist.live ? "text-live" : "text-draft"}`}
                >
                  {artist.live ? "Visible" : "Hidden"}
                </span>
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

      {picked.length > 0 && (
        <BulkBar count={picked.length} noun="artist" onClear={clearSelection}>
          <BulkButton onClick={() => dispatch({ type: "artist/bulkLive", ids: picked, live: true })}>
            Show
          </BulkButton>
          <BulkButton onClick={() => dispatch({ type: "artist/bulkLive", ids: picked, live: false })}>
            Hide
          </BulkButton>
          <BulkSelect
            label="Add category…"
            options={state.cats.map((cat) => ({ value: cat.id, label: cat.name }))}
            onPick={(catId) => dispatch({ type: "artist/bulkCategory", ids: picked, catId, add: true })}
          />
          <BulkSelect
            label="Remove category…"
            options={state.cats.map((cat) => ({ value: cat.id, label: cat.name }))}
            onPick={(catId) => dispatch({ type: "artist/bulkCategory", ids: picked, catId, add: false })}
          />
          <BulkButton danger onClick={bulkDelete}>
            Delete
          </BulkButton>
        </BulkBar>
      )}
    </div>
  );
}
