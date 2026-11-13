import { draftMode } from "next/headers";
import { connection } from "next/server";

import { getSiteSettings } from "@/lib/content/public-site-content";
import { SEO_PAGES, type SeoPageKey } from "@/lib/content/site-seo";
import { renderLogoCard, renderShareImage } from "@/lib/media/render-share-image";
import { DEFAULT_SHARE_IMAGE, LOGO_CARD_KEY, logoSource, shareSourceFor } from "@/lib/seo/share-metadata";

const PAGES = new Set<string>(SEO_PAGES.map((page) => page.key));

/* Long cache for a preview that rendered as intended; short for a fallback,
   so a picture that failed for a moment is retried soon. */
const CACHE_OK = "public, max-age=86400, s-maxage=604800";
const CACHE_FALLBACK = "public, max-age=300";

/** Header-safe one-line reason, readable with curl -I. */
const headerSafe = (reason: string) => reason.slice(0, 200).replace(/[^\x20-\x7e]/g, "?");
const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

async function fetchBytes(src: string, base: string): Promise<Buffer> {
  const response = await fetch(new URL(src, base));
  if (!response.ok) throw new Error(`${src} answered ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

/**
 * The 1200x630 JPEG a link preview shows for a page. Three tiers, each the
 * fallback of the one before — a plain preview always beats a broken one:
 *   1. cut from the page's picture (see shareSourceFor);
 *   2. the site logo centred on white, when the page has no picture or it
 *      cannot be loaded — also served directly as /og/logo;
 *   3. the stock card, public/share-default.jpg, if even the logo fails.
 * The `?v=` in the URL changes with the picture, so crawlers refetch after an edit.
 */
export async function GET(request: Request, { params }: { params: Promise<{ page: string }> }) {
  await connection();
  const { page } = await params;
  if (page !== LOGO_CARD_KEY && !PAGES.has(page)) return stockCard(request, "unknown page");

  /* An editor previewing drafts must never seed a shared cache. */
  const previewing = (await draftMode()).isEnabled;
  const jpeg = (bytes: Buffer, cache: string, reason?: string) =>
    new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": previewing ? "private, no-store" : cache,
        ...(reason ? { "X-Share-Image-Fallback": headerSafe(reason) } : {}),
      },
    });

  let reason = "";
  if (page !== LOGO_CARD_KEY) {
    try {
      const source = await shareSourceFor(page as SeoPageKey);
      if (!source) throw new Error("no picture to share");
      return jpeg(await renderShareImage(await fetchBytes(source, request.url)), CACHE_OK);
    } catch (error) {
      reason = reasonOf(error);
      console.warn(`Share image for "${page}" fell back to the logo card: ${reason}`);
    }
  }

  try {
    const logo = logoSource(await getSiteSettings());
    const card = await renderLogoCard(await fetchBytes(logo, request.url));
    /* /og/logo itself is the intended picture; for a page it is a stand-in. */
    return reason ? jpeg(card, CACHE_FALLBACK, reason) : jpeg(card, CACHE_OK);
  } catch (error) {
    const logoReason = reasonOf(error);
    console.warn(`Logo card for "${page}" fell back to the stock card: ${logoReason}`);
    return stockCard(request, reason ? `${reason}; logo: ${logoReason}` : logoReason);
  }
}

function stockCard(request: Request, reason: string) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(DEFAULT_SHARE_IMAGE, request.url).toString(),
      "X-Share-Image-Fallback": headerSafe(reason),
      "Cache-Control": CACHE_FALLBACK,
    },
  });
}
