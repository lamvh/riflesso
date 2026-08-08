import type { Artist, Category, Territory } from "@/data/artists";

export type ArtistFilters = {
  territory: Territory;
  category: Category;
  query: string;
};

/**
 * Artists are scoped to a single territory at a time, then narrowed by
 * discipline and a case-insensitive substring match on the name.
 *
 * `category` holds comma-separated disciplines, so matching is done against the
 * split list rather than a substring — otherwise "Color" would also match
 * artists tagged only "Colorist"-style values added later.
 */
export function filterArtists(
  artists: Artist[],
  { territory, category, query }: ArtistFilters,
): Artist[] {
  const normalizedQuery = query.trim().toLowerCase();

  return artists.filter((artist) => {
    if (artist.territory !== territory) return false;

    if (
      category !== "All" &&
      !artist.category.split(", ").includes(category)
    ) {
      return false;
    }

    if (
      normalizedQuery &&
      !artist.name.toLowerCase().includes(normalizedQuery)
    ) {
      return false;
    }

    return true;
  });
}
