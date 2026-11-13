import { getContactCards, getSiteSettings } from "@/lib/content/public-site-content";
import { DEFAULT_LOGO_URL } from "@/lib/content/site-content-types";
import { isPartShown, shownOnly } from "@/lib/content/site-visibility";
import { isPublishableSrc } from "@/lib/media-src";
import { siteUrl } from "@/lib/seo/site-url";

/**
 * schema.org JSON-LD for the homepage: the studio as an Organization (name,
 * logo, social profiles, contact emails) and the site as a WebSite. Search
 * engines use it for the knowledge panel and sitelinks. All from Site settings.
 */
export async function StructuredData() {
  const [settings, cards] = await Promise.all([getSiteSettings(), getContactCards()]);
  const origin = siteUrl();
  const absolute = (src: string) => new URL(src, origin).toString();
  const logo = isPublishableSrc(settings.logoUrl.trim()) ? settings.logoUrl.trim() : DEFAULT_LOGO_URL;

  const sameAs = isPartShown(settings, "footer:social")
    ? shownOnly(settings.socialLinks).map((link) => link.href).filter((href) => /^https?:\/\//.test(href))
    : [];
  const contactPoint = shownOnly(cards)
    .filter((card) => card.email.trim())
    .map((card) => ({ "@type": "ContactPoint", contactType: card.heading, email: card.email.trim() }));

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin.origin}/#organization`,
        name: settings.brandName,
        url: origin.origin,
        logo: absolute(logo),
        ...(sameAs.length ? { sameAs } : {}),
        ...(contactPoint.length ? { contactPoint } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${origin.origin}/#website`,
        name: settings.metaTitle,
        url: origin.origin,
        publisher: { "@id": `${origin.origin}/#organization` },
        inLanguage: settings.seo.locale.replace("_", "-"),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      /* JSON in a script tag: escape "<" so no value can close the tag. */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
