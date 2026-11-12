import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { publicReadClient } from "@/lib/supabase/supabase-clients";

import {
  queryAlbums,
  queryArtists,
  queryCategories,
  queryContactCards,
  queryHeroSlides,
  queryHomeSections,
  queryRevision,
  querySettings,
} from "./site-content-queries";
import { seedSiteContent } from "./site-content-seed";
import { shownOnly } from "./site-visibility";
import { SITE_CONTENT_TAG, type SiteContent, type SiteSettings } from "./site-content-types";

/*
 * Public reads, scoped per page so the directory never loads albums and the
 * contact page never loads artists. Each is cached across requests under one
 * tag that publishing expires, and deduplicated within a render by React.
 *
 * Until Supabase is configured and something has been published, every read
 * returns the repo's built-in content.
 */
function publicQuery<T>(
  key: string,
  fromDatabase: (client: SupabaseClient) => Promise<T>,
  fromSeed: (seed: SiteContent) => T,
) {
  const cached = unstable_cache(
    async (): Promise<T> => {
      const client = publicReadClient();
      if (!client || (await queryRevision(client)) === null) {
        return fromSeed(seedSiteContent());
      }
      return fromDatabase(client);
    },
    ["site-content", key],
    { tags: [SITE_CONTENT_TAG] },
  );

  /* A failed read (paused project, missing schema, network) never takes a
     public page down: it renders the built-in content. The fallback sits
     outside the cache so it is not stored — the next request tries again. */
  return cache(async (): Promise<T> => {
    try {
      return await cached();
    } catch (error) {
      console.warn(
        `Public read "${key}" failed, showing built-in content: ${error instanceof Error ? error.message : error}`,
      );
      return fromSeed(seedSiteContent());
    }
  });
}

/*
 * Hidden rows are dropped here, once, so no public page can render them. The
 * dashboard reads through its own loader and still sees everything.
 */

const visibleSettings = (settings: SiteSettings): SiteSettings => ({
  ...settings,
  socialLinks: shownOnly(settings.socialLinks),
});

export const getSiteSettings = publicQuery(
  "settings",
  async (client) =>
    visibleSettings((await querySettings(client))?.settings ?? seedSiteContent().settings),
  (seed) => visibleSettings(seed.settings),
);

export const getContactCards = publicQuery(
  "contacts",
  async (client) => shownOnly(await queryContactCards(client)),
  (seed) => shownOnly(seed.contacts),
);

export const getDirectoryContent = publicQuery(
  "directory",
  async (client) => {
    const [artists, cats] = await Promise.all([queryArtists(client), queryCategories(client)]);
    return { artists, cats };
  },
  (seed) => ({ artists: seed.artists, cats: seed.cats }),
);

export const getHomeContent = publicQuery(
  "home",
  async (client) => {
    const [slides, blocks, albums] = await Promise.all([
      queryHeroSlides(client),
      queryHomeSections(client),
      queryAlbums(client, { homeOnly: true }),
    ]);
    return { slides: shownOnly(slides), blocks, albums };
  },
  (seed) => ({ slides: shownOnly(seed.slides), blocks: seed.blocks, albums: seed.albums }),
);

/** The 404 numeral only needs frame URLs. */
export const getHeroFrames = publicQuery(
  "hero-frames",
  async (client) => shownOnly(await queryHeroSlides(client)).map((slide) => slide.src),
  (seed) => shownOnly(seed.slides).map((slide) => slide.src),
);
