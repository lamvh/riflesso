import type { Artist } from "@/data/artists";
import type { AdminArtist, CategoryRow } from "@/lib/dashboard/admin-types";

/**
 * The public directory: published artists alphabetically, each with every
 * discipline they carry, and the visible categories as the filter.
 */
export function toDirectory(artists: AdminArtist[], cats: CategoryRow[]) {
  const nameById = new Map(cats.map((cat) => [cat.id, cat.name]));

  return {
    artists: artists
      .filter((artist) => artist.live)
      .map(
        (artist): Artist => ({
          name: artist.name,
          category: artist.categoryIds
            .map((id) => nameById.get(id))
            .filter(Boolean)
            .join(", "),
          image: artist.image,
          territory: artist.territory,
        }),
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
    categories: cats.filter((cat) => cat.visible).map((cat) => cat.name),
  };
}
