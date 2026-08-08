"use client";

import { useMemo, useState } from "react";

import { ARTISTS, type Category, type Territory } from "@/data/artists";
import { filterArtists } from "@/lib/filter-artists";

import { ArtistPreviewImage } from "./artist-preview-image";
import { ArtistsFilterSidebar } from "./artists-filter-sidebar";
import { ArtistsList } from "./artists-list";

type ArtistsDirectoryProps = {
  /** Category preselected on first paint. */
  startCategory?: Category;
  /** Toggles the sticky preview column. */
  showActiveImage?: boolean;
};

export function ArtistsDirectory({
  startCategory = "All",
  showActiveImage = true,
}: ArtistsDirectoryProps) {
  const [territory, setTerritory] = useState<Territory>("US");
  const [category, setCategory] = useState<Category>(startCategory);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const artists = useMemo(
    () => filterArtists(ARTISTS, { territory, category, query }),
    [territory, category, query],
  );

  // Filters shrink the list, so the stored index can outrun it between renders.
  const activeArtist = artists[Math.min(activeIndex, artists.length - 1)];

  const resetTo = (apply: () => void) => {
    apply();
    setActiveIndex(0);
  };

  return (
    <div className="flex flex-col items-start gap-10 px-5 pt-[100px] lg:flex-row lg:gap-[43px] lg:pt-0">
      <ArtistsFilterSidebar
        territory={territory}
        onTerritoryChange={(next) => resetTo(() => setTerritory(next))}
        category={category}
        onCategoryChange={(next) => resetTo(() => setCategory(next))}
        query={query}
        onQueryChange={(next) => resetTo(() => setQuery(next))}
      />

      <ArtistsList
        artists={artists}
        activeIndex={Math.min(activeIndex, artists.length - 1)}
        onActivate={setActiveIndex}
      />

      {showActiveImage && (
        <ArtistPreviewImage
          src={activeArtist?.image ?? null}
          alt={activeArtist ? `Work by ${activeArtist.name}` : ""}
        />
      )}
    </div>
  );
}
