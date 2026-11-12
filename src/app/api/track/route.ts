import { validView } from "@/lib/analytics/content-view-types";
import { PREVIEW_COOKIE } from "@/lib/preview/content-preview-cookie";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

/** Crawlers, link unfurlers and test browsers are not visitors. */
const NOT_A_VISITOR = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom/i;

const done = () => new Response(null, { status: 204 });

/**
 * Counts one view. Always answers 204 — a visitor's page never waits on, or
 * breaks because of, analytics. Skips editors previewing drafts, visitors who
 * ask not to be tracked (GPC / DNT), and bots. Stores a daily count only.
 */
export async function POST(request: Request) {
  const headers = request.headers;
  const cookies = headers.get("cookie") ?? "";
  if (
    NOT_A_VISITOR.test(headers.get("user-agent") ?? "") ||
    headers.get("sec-gpc") === "1" ||
    headers.get("dnt") === "1" ||
    cookies.includes(PREVIEW_COOKIE) ||
    cookies.includes("__prerender_bypass")
  ) {
    return done();
  }

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done();
  }
  const view = validView((body as { kind?: unknown })?.kind, (body as { ref?: unknown })?.ref);
  const client = serviceRoleClient();
  if (!view || !client) return done();

  try {
    const { error } = await client.rpc("track_content_view", { p_kind: view.kind, p_ref: view.ref });
    if (error) console.warn(`View not counted: ${error.message}`);
  } catch (error) {
    console.warn(`View not counted: ${error instanceof Error ? error.message : error}`);
  }
  return done();
}
