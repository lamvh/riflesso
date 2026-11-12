"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { trackContentView } from "@/lib/analytics/track-content-view";

import type { Artist, Territory } from "@/data/artists";
import { filterArtists } from "@/lib/filter-artists";

import { ArtistPreviewImage } from "./artist-preview-image";
import { ArtistsFilterSidebar } from "./artists-filter-sidebar";
import { ArtistsList } from "./artists-list";

type ArtistsDirectoryProps = {
  /** Published artists, already sorted. */
  artists: Artist[];
  /** Visible categories, in dashboard order. */
  categories: string[];
  /** Category preselected on first paint, when it is still listed. */
  startCategory?: string;
  /** Toggles the sticky preview column. */
  showActiveImage?: boolean;
};

export function ArtistsDirectory({
  artists: roster,
  categories,
  startCategory = "Hair",
  showActiveImage = true,
}: ArtistsDirectoryProps) {
  const [territory, setTerritory] = useState<Territory>("US");
  const [category, setCategory] = useState(() =>
    categories.includes(startCategory) ? startCategory : (categories[0] ?? ""),
  );
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const artists = useMemo(
    () => filterArtists(roster, { territory, category, query }),
    [roster, territory, category, query],
  );

  // Filters shrink the list, so the stored index can outrun it between renders.
  const activeArtist = artists[Math.min(activeIndex, artists.length - 1)];

  /* A visitor who rests on a name for a moment is looking at that artist;
     sweeping the pointer down the list is not. */
  const viewTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(viewTimer.current), []);
  const activate = (index: number) => {
    setActiveIndex(index);
    clearTimeout(viewTimer.current);
    const name = artists[index]?.name;
    if (name) viewTimer.current = setTimeout(() => trackContentView("artist", name), 800);
  };

  const resetTo = (apply: () => void) => {
    apply();
    setActiveIndex(0);
  };

  return (
    <div className="flex flex-col items-start gap-10 px-5 pt-[100px] lg:flex-row lg:gap-[43px] lg:pt-0">
      <ArtistsFilterSidebar
        territory={territory}
        onTerritoryChange={(next) => resetTo(() => setTerritory(next))}
        categories={categories}
        category={category}
        onCategoryChange={(next) => resetTo(() => setCategory(next))}
        query={query}
        onQueryChange={(next) => resetTo(() => setQuery(next))}
      />

      <ArtistsList
        artists={artists}
        activeIndex={Math.min(activeIndex, artists.length - 1)}
        onActivate={activate}
      />

      {showActiveImage && (
        <ArtistPreviewImage
          src={activeArtist?.image || null}
          alt={activeArtist ? `Work by ${activeArtist.name}` : ""}
        />
      )}
    </div>
  );
}
