import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { loadDashboardContent } from "@/lib/content/load-dashboard-content";
import type { SiteContent } from "@/lib/content/site-content-types";

import type { SaveLog } from "./content-history-types";

/** Saves this close to the previous one join its entry instead of adding one. */
const COALESCE_MS = 2 * 60 * 1000;
/** Entries kept; older ones are pruned after each insert. */
const KEEP = 200;
/** Lines of activity one entry holds. */
const SUMMARY_LIMIT = 40;

const TABLE = "content_revisions";

/**
 * Before the first save of an edit session, keep the content as it stood, so
 * the very first edit can be undone too. Skipped when the revision already
 * has an entry (the usual case) or the database is not the source.
 */
export async function snapshotBeforeSave(client: SupabaseClient, expectedRevision: number) {
  const latest = await client
    .from(TABLE)
    .select("revision")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest.error) throw latest.error;
  if (latest.data?.revision === expectedRevision) return;

  const current = await loadDashboardContent();
  if (current.source !== "database" || current.revision !== expectedRevision) return;

  const inserted = await client.from(TABLE).insert({
    revision: current.revision,
    kind: "snapshot",
    content: current.content,
    summary: ["Content as it stood before these edits"],
  });
  if (inserted.error) throw inserted.error;
}

/** Record what a save wrote, joining the previous entry when it is recent. */
export async function recordSave(
  client: SupabaseClient,
  {
    content,
    revision,
    previousRevision,
    log,
  }: { content: SiteContent; revision: number; previousRevision: number; log: SaveLog },
) {
  if (!log.restore) {
    const latest = await client
      .from(TABLE)
      .select("id, revision, kind, summary, updated_at")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest.error) throw latest.error;

    const row = latest.data;
    if (
      row &&
      row.kind === "edit" &&
      row.revision === previousRevision &&
      Date.now() - new Date(row.updated_at).getTime() < COALESCE_MS
    ) {
      const updated = await client
        .from(TABLE)
        .update({
          revision,
          content,
          summary: [...log.summary, ...(row.summary as string[])].slice(0, SUMMARY_LIMIT),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (updated.error) throw updated.error;
      return;
    }
  }

  const inserted = await client.from(TABLE).insert({
    revision,
    kind: log.restore ? "restore" : "edit",
    content,
    summary: log.summary.slice(0, SUMMARY_LIMIT),
  });
  if (inserted.error) throw inserted.error;

  /* Keep the newest KEEP entries. */
  const cutoff = await client
    .from(TABLE)
    .select("id")
    .order("id", { ascending: false })
    .range(KEEP, KEEP)
    .maybeSingle();
  if (cutoff.data) await client.from(TABLE).delete().lte("id", cutoff.data.id);
}
