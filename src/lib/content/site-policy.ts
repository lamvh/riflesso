/*
 * The /policy page: one title, a "last updated" date and a body written in
 * simple markdown (see policy-markdown.ts). Edited on the dashboard (Site →
 * Policy) and stored as one small jsonb document on site_settings (`policy`),
 * like SEO and hero autoplay.
 *
 * Nothing stored yet ('{}', an older row, a draft from before the field)
 * reads as DEFAULT_POLICY, so the page is complete from the first deploy.
 * Once saved, the editor's text is kept as is, even when emptied.
 */

export type SitePolicy = {
  /** Page heading and the <title> label. */
  title: string;
  /** "Last updated" line, as YYYY-MM-DD; empty leaves the line out. */
  updated: string;
  /** Markdown: ## headings, paragraphs, - lists, **bold**, *italic*, [links](url). */
  body: string;
};

const DEFAULT_BODY = `This page explains how Riflesso Studio handles information about the people who visit this website, and the terms that apply when you use it. We keep it short and plain on purpose. If anything is unclear, write to us.

## Privacy

Riflesso Studio represents photographers, stylists, hair and make-up artists. Visiting this website does not require an account, and we do not ask you for personal information to browse it.

We only hold personal information you choose to send us — for example when you email us about a booking, a collaboration or an application. We use it to answer you and to manage that enquiry, and we do not sell it or share it for advertising.

- **What we collect:** your name, contact details and anything you include in your message.
- **Why:** to reply, to plan the work you asked about, and to keep a record of agreed bookings.
- **How long:** for as long as the enquiry or working relationship lasts, then for the period accounting and legal duties require.
- **Who sees it:** our team and, when a booking needs it, the artist concerned. Our email and hosting providers process it on our behalf.

You can ask us at any time what we hold about you, to correct it, or to delete it.

## Cookies

The site does not use advertising or cross-site tracking cookies. We count page views anonymously to see which pages and portfolios are visited; the count does not identify you and is not shared.

Your browser may store small preferences, such as a remembered setting, on your own device. You can clear them whenever you like in your browser settings.

## Terms of use

All photographs, films and other work shown on this website belong to the artists who made them and to their clients. They are shown here to present the artists' portfolios.

- Do not copy, download, reproduce or republish any image or film without written permission.
- Sharing a link to a page is always welcome.
- Names, logos and publication titles belong to their owners.

We try to keep the site accurate and available, but it is provided as it is, and it may change without notice.

## Changes to this page

We may update this page when the way we work changes. The date at the top shows when it was last revised.

## Contact

For any question about this page or your information, write to [hello@riflesso.studio](mailto:hello@riflesso.studio) or use the details on our [Contact](/contact) page.`;

export const DEFAULT_POLICY: SitePolicy = {
  title: "Policy",
  updated: "2026-11-19",
  body: DEFAULT_BODY,
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A complete policy from whatever was stored; nothing stored gives the default. */
export function withPolicyDefaults(value: unknown): SitePolicy {
  if (!value || typeof value !== "object") return { ...DEFAULT_POLICY };
  const raw = value as Partial<Record<keyof SitePolicy, unknown>>;
  if (raw.title === undefined && raw.body === undefined) return { ...DEFAULT_POLICY };
  const text = (field: unknown) => (typeof field === "string" ? field : "");
  const updated = text(raw.updated).trim();
  return {
    title: text(raw.title),
    updated: ISO_DATE.test(updated) ? updated : "",
    body: text(raw.body),
  };
}

/** "19 November 2026" from "2026-11-19"; '' for an empty or odd value. */
export function formatPolicyDate(iso: string): string {
  if (!ISO_DATE.test(iso)) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
