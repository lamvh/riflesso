import "server-only";

import { cookies, draftMode } from "next/headers";
import { cache } from "react";

import { pickSiteContent, type SiteContent } from "@/lib/content/site-content-types";
import { withVisibilityDefaults } from "@/lib/content/site-visibility";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

import { PREVIEW_COOKIE, isPreviewToken } from "./content-preview-cookie";

/**
 * The parked content this browser is previewing, or null for everyone else.
 * Outside Draft Mode it returns before touching cookies, so ordinary pages
 * stay static. A missing or expired preview falls back to the live content.
 */
export const readContentPreview = cache(async (): Promise<SiteContent | null> => {
  if (!(await draftMode()).isEnabled) return null;
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!isPreviewToken(token)) return null;

  const client = serviceRoleClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("content_previews")
      .select("content")
      .eq("token", token)
      .maybeSingle();
    if (error || !data) return null;
    return pickSiteContent(withVisibilityDefaults(data.content as SiteContent));
  } catch {
    return null;
  }
});
