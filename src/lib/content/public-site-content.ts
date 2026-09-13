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
import { SITE_CONTENT_TAG, type SiteContent } from "./site-content-types";

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
  return cache(
    unstable_cache(
      async (): Promise<T> => {
        const client = publicReadClient();
        if (!client || (await queryRevision(client)) === null) {
          return fromSeed(seedSiteContent());
        }
        return fromDatabase(client);
      },
      ["site-content", key],
      { tags: [SITE_CONTENT_TAG] },
    ),
  );
}

export const getSiteSettings = publicQuery(
  "settings",
  async (client) =>
    (await querySettings(client))?.settings ?? seedSiteContent().settings,
  (seed) => seed.settings,
);

export const getContactCards = publicQuery("contacts", queryContactCards, (seed) => seed.contacts);

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
    return { slides, blocks, albums };
  },
  (seed) => ({ slides: seed.slides, blocks: seed.blocks, albums: seed.albums }),
);

/** The 404 numeral only needs frame URLs. */
export const getHeroFrames = publicQuery(
  "hero-frames",
  async (client) => (await queryHeroSlides(client)).map((slide) => slide.src),
  (seed) => seed.slides.map((slide) => slide.src),
);
