"use server";

import { revalidatePath, updateTag } from "next/cache";

import { toPublishPayload } from "@/lib/content/site-content-publish-payload";
import {
  SITE_CONTENT_TAG,
  type PublishResult,
  type SiteContent,
} from "@/lib/content/site-content-types";
import { findPublishProblem } from "@/lib/content/site-content-validation";
import { serviceRoleClient } from "@/lib/supabase/supabase-clients";

/**
 * Writes the dashboard's content to Supabase in one transaction.
 *
 * There is no sign-in yet, so anyone who can reach this action can publish.
 * Put an auth check here before the dashboard is deployed anywhere public.
 */
export async function publishSiteContent(
  content: SiteContent,
  expectedRevision: number,
): Promise<PublishResult> {
  const problem = findPublishProblem(content);
  if (problem) return { ok: false, error: problem };
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
    return { ok: false, error: "Malformed revision — reload the dashboard" };
  }

  const client = serviceRoleClient();
  if (!client) {
    return {
      ok: false,
      error: "Supabase is not configured — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    };
  }

  const { data, error } = await client.rpc("publish_site_content", {
    p_content: toPublishPayload(content),
    p_expected_revision: expectedRevision,
  });

  if (error) {
    return {
      ok: false,
      error: error.message.startsWith("stale_revision")
        ? "Someone published in the meantime — reload the dashboard to pick up their changes"
        : `Publish failed: ${error.message}`,
    };
  }

  /* Expire cached reads, then every prerendered page: the logo and footer
     sit on all of them. */
  updateTag(SITE_CONTENT_TAG);
  revalidatePath("/", "layout");
  return { ok: true, revision: Number(data) };
}
