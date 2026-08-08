"use client";

import {
  CATEGORIES,
  TERRITORIES,
  type Category,
  type Territory,
} from "@/data/artists";

import { SearchIcon } from "./search-icon";

type ArtistsFilterSidebarProps = {
  territory: Territory;
  onTerritoryChange: (territory: Territory) => void;
  category: Category;
  onCategoryChange: (category: Category) => void;
  query: string;
  onQueryChange: (query: string) => void;
};

export function ArtistsFilterSidebar({
  territory,
  onTerritoryChange,
  category,
  onCategoryChange,
  query,
  onQueryChange,
}: ArtistsFilterSidebarProps) {
  return (
    <aside className="w-full lg:sticky lg:top-0 lg:left-0 lg:w-[240px] lg:min-w-[240px] lg:pt-[240px]">
      {/* Territory toggle sits above the filter stack, anchored to the sticky aside. */}
      <div className="mb-6 flex items-center pl-2 lg:absolute lg:top-[160px] lg:left-0 lg:mb-0">
        {TERRITORIES.map((option, index) => (
          <span key={option} className="flex items-center">
            <button
              type="button"
              aria-pressed={option === territory}
              onClick={() => onTerritoryChange(option)}
              className={`font-sans text-[14px] leading-[92%] font-bold tracking-[-0.5px] uppercase decoration-2 underline-offset-2 ${
                option === territory ? "underline" : "no-underline"
              }`}
            >
              {option}
            </button>
            {index < TERRITORIES.length - 1 && (
              <span className="mx-[2px] font-sans text-[14px] leading-[92%] font-bold tracking-[-0.5px]">
                /
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="mb-5 flex items-center border-b border-ink pl-2">
        <label htmlFor="artist-search" className="sr-only">
          Search artists
        </label>
        <input
          id="artist-search"
          type="text"
          placeholder="Search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="flex-1 border-none bg-paper py-[9px] pr-2 pl-0 font-sans text-[15px] leading-[94%] tracking-[-0.5px] text-ink outline-none"
        />
        <SearchIcon size={15} />
      </div>

      <nav aria-label="Artist categories">
        {CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === category}
            onClick={() => onCategoryChange(option)}
            className={`block w-full px-2 py-[9px] text-left font-sans text-[15px] leading-[94%] font-bold tracking-[-0.5px] decoration-2 underline-offset-[3px] ${
              option === category ? "underline" : "no-underline"
            }`}
          >
            {option}
          </button>
        ))}
      </nav>
    </aside>
  );
}
