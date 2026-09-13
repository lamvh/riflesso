import "server-only";

import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import {
  queryAlbums,
  queryArtists,
  queryCategories,
  queryContactCards,
  queryHeroSlides,
  queryHomeSections,
  querySettings,
} from "./site-content-queries";
import { seedSiteContent } from "./site-content-seed";
import type { LoadedSiteContent } from "./site-content-types";

/**
 * Everything the dashboard edits, drafts included, read fresh on every
 * request. Before the first publish it hands back the repo's built-in content
 * at revision 0, which is exactly what that first publish will write.
 */
export async function loadDashboardContent(): Promise<LoadedSiteContent> {
  const client = serviceRoleClient();
  if (!client) {
    return { content: seedSiteContent(), revision: 0, source: "unconfigured" };
  }

  const published = await querySettings(client);
  if (!published) return { content: seedSiteContent(), revision: 0, source: "seed" };

  const [contacts, cats, artists, albums, slides, blocks] = await Promise.all([
    queryContactCards(client),
    queryCategories(client),
    queryArtists(client),
    queryAlbums(client),
    queryHeroSlides(client),
    queryHomeSections(client),
  ]);

  return {
    content: { settings: published.settings, contacts, artists, albums, cats, slides, blocks },
    revision: published.revision,
    source: "database",
  };
}
