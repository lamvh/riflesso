"use server";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { withVisibilityDefaults } from "@/lib/content/site-visibility";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import {
  isMissingTable,
  type RevisionEntry,
  type RevisionKind,
  type RevisionList,
} from "./content-history-types";

/*
 * Read side of the edit history. Read-only, and like the rest of the
 * dashboard open to anyone who can reach it until sign-in exists.
 */

const LIST_LIMIT = 100;

export async function listContentRevisions(): Promise<RevisionList> {
  const client = serviceRoleClient();
  if (!client) return { state: "unconfigured" };

  try {
    const { data, error } = await client
      .from("content_revisions")
      .select("id, revision, kind, summary, created_at, updated_at")
      .order("id", { ascending: false })
      .limit(LIST_LIMIT);
    if (error) {
      return isMissingTable(error) ? { state: "missing" } : { state: "error", message: error.message };
    }
    return {
      state: "ok",
      entries: data.map(
        (row): RevisionEntry => ({
          id: Number(row.id),
          revision: Number(row.revision),
          kind: row.kind as RevisionKind,
          summary: (row.summary as string[]) ?? [],
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
      ),
    };
  } catch (error) {
    return { state: "error", message: error instanceof Error ? error.message : "History could not be read" };
  }
}

/** The full content of one entry, ready to load into the dashboard. */
export async function loadContentRevision(
  id: number,
): Promise<{ ok: true; content: SiteContent } | { ok: false; error: string }> {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Unknown history entry" };
  const client = serviceRoleClient();
  if (!client) return { ok: false, error: "Supabase is not configured" };

  const { data, error } = await client
    .from("content_revisions")
    .select("content")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "That history entry no longer exists" };

  /* Entries written before a later schema change may lack newer fields. */
  return { ok: true, content: pickSiteContent(withVisibilityDefaults(data.content as SiteContent)) };
}
