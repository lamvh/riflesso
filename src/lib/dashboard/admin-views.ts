import type { AdminState } from "./admin-state";

/** The screens the dashboard is made of, in sidebar order. */
export const VIEWS = ["overview", "artists", "albums", "cats", "home", "settings"] as const;
export type View = (typeof VIEWS)[number];

export const VIEW_HREF: Record<View, string> = {
  overview: "/dashboard",
  artists: "/dashboard/artists",
  albums: "/dashboard/albums",
  cats: "/dashboard/categories",
  home: "/dashboard/homepage",
  settings: "/dashboard/settings",
};

export const VIEW_LABEL: Record<View, string> = {
  overview: "Overview",
  artists: "Artists",
  albums: "Albums",
  cats: "Categories",
  home: "Homepage",
  settings: "Site settings",
};

export const viewFromPath = (pathname: string): View =>
  VIEWS.find((view) => VIEW_HREF[view] === pathname) ?? "overview";

/**
 * The numbers the sidebar, the page header, and the overview stats all quote.
 * Derived in one place so a count cannot disagree with itself between two
 * corners of the same screen.
 */
export function adminTotals(state: AdminState) {
  const liveArtists = state.artists.filter((artist) => artist.live).length;
  const liveAlbums = state.albums.filter((album) => album.live).length;
  const images = state.albums.reduce(
    (total, album) => total + album.frames.length,
    0,
  );
  const liveBlocks = state.blocks.filter((block) => block.on).length;

  return {
    artists: state.artists.length,
    liveArtists,
    albums: state.albums.length,
    liveAlbums,
    homeAlbums: state.albums.filter((album) => album.home).length,
    images,
    drafts:
      state.artists.length - liveArtists + (state.albums.length - liveAlbums),
    slides: state.slides.length,
    blocks: state.blocks.length,
    liveBlocks,
    cats: state.cats.length,
    contacts: state.contacts.length,
  };
}

/** Sidebar counts, only for the screens that are lists. */
export function navCount(view: View, totals: ReturnType<typeof adminTotals>) {
  switch (view) {
    case "artists":
      return totals.artists;
    case "albums":
      return totals.albums;
    case "cats":
      return totals.cats;
    default:
      return null;
  }
}

/** Title and the sentence under it, per screen. */
export function pageTitle(
  view: View,
  totals: ReturnType<typeof adminTotals>,
): [string, string] {
  switch (view) {
    case "artists":
      return [
        "Artists",
        `${totals.artists} artists, ${totals.liveArtists} visible in the directory`,
      ];
    case "albums":
      return ["Albums", `${totals.albums} albums holding ${totals.images} images`];
    case "cats":
      return ["Categories", "The disciplines that filter the directory and describe artists"];
    case "home":
      return [
        "Homepage",
        `${totals.slides} hero slides and ${totals.liveBlocks} of ${totals.blocks} sections showing`,
      ];
    case "settings":
      return ["Site settings", "Logo, search listing, About copy, contact cards and footer"];
    case "overview":
      return ["Overview", "What visitors see on the Riflesso site right now"];
  }
}
