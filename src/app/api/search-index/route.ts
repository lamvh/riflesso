import { connection } from "next/server";

import { buildSiteSearchIndex } from "@/lib/content/site-search-index";

/**
 * The masthead Search loads this once, on first open. Reads go through the
 * cached public getters, so this is cheap, and a failed read still answers
 * with the built-in content rather than an error.
 */
export async function GET() {
  await connection();
  try {
    return Response.json(await buildSiteSearchIndex(), {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch {
    return Response.json({ artists: [], works: [], pages: [] }, { status: 200 });
  }
}
