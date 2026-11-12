import type { SiteContent, SiteSettings } from "./site-content-types";

/*
 * Hide instead of delete. Whole pages and the fixed parts of a page are
 * switched off by key in `settings.hiddenParts`; list rows (hero slides,
 * contact cards, social links) carry their own `hidden` flag. Artists, albums,
 * categories and homepage sections already had their own switches.
 *
 * Every flag reads "hidden", never "visible": content saved before these flags
 * existed has no value, and a missing value must mean shown.
 */

export const HIDEABLE_PARTS = [
  { key: "page:artists", group: "Pages", label: "Artists page", note: "/artists answers 404 and leaves the menu" },
  { key: "page:about", group: "Pages", label: "About page", note: "/about answers 404 and leaves the footer" },
  { key: "page:contact", group: "Pages", label: "Contact page", note: "/contact answers 404 and leaves the footer" },
  { key: "home:hero", group: "Homepage", label: "Hero banner", note: "The rotating slides at the top of the homepage" },
  { key: "about:copy", group: "About", label: "About copy", note: "The paragraphs at the top of the About page" },
  { key: "about:contacts", group: "About", label: "Contact grid on About", note: "Contact keeps its own grid" },
  { key: "footer:social", group: "Footer", label: "Social links column", note: "Every social link in the footer" },
] as const;

export type HideablePart = (typeof HIDEABLE_PARTS)[number]["key"];

export const isPartShown = (settings: Pick<SiteSettings, "hiddenParts">, key: HideablePart) =>
  !(settings.hiddenParts ?? []).includes(key);

/** `hiddenParts` with `key` switched to the other state. */
export const toggledParts = (settings: Pick<SiteSettings, "hiddenParts">, key: HideablePart) => {
  const parts = settings.hiddenParts ?? [];
  return parts.includes(key) ? parts.filter((part) => part !== key) : [...parts, key];
};

/** Rows a visitor sees. */
export const shownOnly = <T extends { hidden?: boolean }>(rows: T[]): T[] =>
  rows.filter((row) => !row.hidden);

/**
 * Fills the flags into content saved before they existed (a stored browser
 * draft, an older baseline), so the type's promise holds everywhere.
 */
export function withVisibilityDefaults(content: SiteContent): SiteContent {
  return {
    ...content,
    settings: {
      ...content.settings,
      hiddenParts: content.settings.hiddenParts ?? [],
      socialLinks: content.settings.socialLinks.map((link) => ({ ...link, hidden: link.hidden ?? false })),
    },
    contacts: content.contacts.map((card) => ({ ...card, hidden: card.hidden ?? false })),
    slides: content.slides.map((slide) => ({ ...slide, hidden: slide.hidden ?? false })),
  };
}
