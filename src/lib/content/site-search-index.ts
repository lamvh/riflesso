import "server-only";

import { toDirectory } from "./directory-view";
import { buildHomeSections } from "./home-page-view";
import { getDirectoryContent, getHomeContent, getSiteSettings } from "./public-site-content";
import { isPartShown } from "./site-visibility";

/** What the masthead's Search can find. Only what a visitor can already reach. */
export type SiteSearchIndex = {
  artists: { name: string; category: string; image: string }[];
  /** Albums that open on the homepage, by the id the homepage deep link takes. */
  works: { id: string; title: string; credits: string; label: string; image: string }[];
  pages: { label: string; href: string }[];
};

/**
 * Built from the same cached public reads as the pages, so hidden artists,
 * draft albums and switched-off sections never appear in results.
 */
export async function buildSiteSearchIndex(): Promise<SiteSearchIndex> {
  const [settings, directory, home] = await Promise.all([
    getSiteSettings(),
    getDirectoryContent(),
    getHomeContent(),
  ]);

  const artistsShown = isPartShown(settings, "page:artists");
  const artists = artistsShown
    ? toDirectory(directory.artists, directory.cats).artists.map(({ name, category, image }) => ({
        name,
        category,
        image,
      }))
    : [];

  /* Works: every album a homepage section shows, once, under the label of the
     first section it appears in. */
  const seen = new Set<string>();
  const works: SiteSearchIndex["works"] = [];
  for (const section of buildHomeSections(home.blocks, home.albums)) {
    /* Rails without a gallery label (New Signs) open no gallery, so they are
       not linkable as work. */
    const items =
      section.layout === "rail"
        ? section.category
          ? section.items
          : []
        : section.layout === "feature"
          ? [section.item, ...section.section.items]
          : [];
    for (const item of items) {
      if (!item.albumId || seen.has(item.albumId)) continue;
      seen.add(item.albumId);
      const album = home.albums.find((entry) => entry.id === item.albumId);
      works.push({
        id: item.albumId,
        title: album?.title ?? item.title ?? section.heading,
        credits: item.credits.map((credit) => credit.name).join(", "),
        label: section.heading,
        image: item.kind === "image" ? item.src : "",
      });
    }
  }

  const pages = [
    { label: "Artists", href: "/artists", part: "page:artists" as const },
    { label: "About", href: "/about", part: "page:about" as const },
    { label: "Contact", href: "/contact", part: "page:contact" as const },
  ]
    .filter((page) => isPartShown(settings, page.part))
    .map(({ label, href }) => ({ label, href }));

  return { artists, works, pages };
}
