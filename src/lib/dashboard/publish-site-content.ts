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

/** Whether anything is switched off with a flag the visibility migration added. */
const usesHideFlags = (content: SiteContent) =>
  (content.settings.hiddenParts ?? []).length > 0 ||
  content.settings.socialLinks.some((link) => link.hidden) ||
  content.contacts.some((card) => card.hidden) ||
  content.slides.some((slide) => slide.hidden);

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

  /* Before the visibility migration, the publish function ignores the hide
     flags: the site would keep showing what the editor switched off. Refuse
     rather than publish something that silently differs from the dashboard. */
  if (usesHideFlags(content)) {
    const probe = await client.from("hero_slides").select("is_visible").limit(1);
    if (probe.error) {
      return {
        ok: false,
        error:
          "Hiding needs the database migration 20261113003000_add_visibility_flags.sql — back up, run it, then publish again",
      };
    }
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
