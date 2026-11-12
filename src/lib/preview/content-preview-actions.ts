"use server";

import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { isMissingTable } from "@/lib/dashboard/content-history-types";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import { PREVIEW_COOKIE, PREVIEW_MAX_AGE_S } from "./content-preview-cookie";

/**
 * Park the dashboard's current content and switch this browser into Draft
 * Mode, so the public pages render it instead of what is live. Other visitors
 * are unaffected: the switch is a cookie on this browser only.
 *
 * There is no sign-in yet, so anyone who can reach the dashboard can do this —
 * but they only ever change what their own browser shows.
 */
export async function startContentPreview(
  content: SiteContent,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = serviceRoleClient();
  if (!client) return { ok: false, error: "Preview needs Supabase — add the keys first" };

  const cutoff = new Date(Date.now() - PREVIEW_MAX_AGE_S * 1000).toISOString();
  await client.from("content_previews").delete().lt("created_at", cutoff);

  const { data, error } = await client
    .from("content_previews")
    .insert({ content: pickSiteContent(content) })
    .select("token")
    .single();
  if (error) {
    return {
      ok: false,
      error: isMissingTable(error)
        ? "Preview needs the migration 20261113013000_add_revisions_and_previews.sql — back up, run it, then try again"
        : `Preview failed: ${error.message}`,
    };
  }

  (await cookies()).set(PREVIEW_COOKIE, data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PREVIEW_MAX_AGE_S,
  });
  (await draftMode()).enable();
  return { ok: true };
}

/** Leave the preview and land back on the page that was being looked at. */
export async function endContentPreview(formData: FormData) {
  (await draftMode()).disable();
  (await cookies()).delete(PREVIEW_COOKIE);
  const path = String(formData.get("path") ?? "/");
  /* Same-site paths only: never an open redirect. */
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}
