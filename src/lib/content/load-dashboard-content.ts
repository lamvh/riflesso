import "server-only";

import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import {
  DatabaseUnreachableError,
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
 *
 * When the database does not answer, the dashboard still opens — on the
 * built-in content, flagged "unreachable" so it shows a notice and refuses to
 * publish (that would overwrite the real content with the defaults).
 */
export async function loadDashboardContent(): Promise<LoadedSiteContent> {
  const client = serviceRoleClient();
  if (!client) {
    return { content: seedSiteContent(), revision: 0, source: "unconfigured" };
  }

  try {
    return await readDatabaseContent(client);
  } catch (error) {
    if (!(error instanceof DatabaseUnreachableError)) throw error;
    console.warn(`${error.message} — is the Supabase project paused? Showing built-in content.`);
    return { content: seedSiteContent(), revision: 0, source: "unreachable" };
  }
}

async function readDatabaseContent(
  client: NonNullable<ReturnType<typeof serviceRoleClient>>,
): Promise<LoadedSiteContent> {
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
