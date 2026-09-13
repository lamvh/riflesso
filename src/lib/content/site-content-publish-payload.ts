import { isVideoSrc } from "@/lib/media-src";

import { DEFAULT_POSITION, type SiteContent } from "./site-content-types";

const trimmed = (list: string[]) => list.map((entry) => entry.trim()).filter(Boolean);

/**
 * The document `publish_site_content` expects: column names, list order as
 * sort order. See the function header in the migration for the full shape.
 */
export function toPublishPayload(content: SiteContent) {
  const { settings } = content;

  return {
    settings: {
      brand_name: settings.brandName.trim(),
      logo_url: settings.logoUrl.trim(),
      logo_alt: settings.logoAlt.trim(),
      meta_title: settings.metaTitle.trim(),
      meta_description: settings.metaDescription.trim(),
      copyright: settings.copyright.trim(),
      about_paragraphs: trimmed(settings.aboutParagraphs),
      social_links: settings.socialLinks
        .filter((link) => link.label.trim() && link.href.trim())
        .map((link) => ({ label: link.label.trim(), url: link.href.trim() })),
    },

    contacts: content.contacts.map((card) => ({
      id: card.id,
      heading: card.heading.trim(),
      address_lines: trimmed(card.address),
      phone: card.tel.trim(),
      lead: card.lead.trim(),
      email: card.email.trim(),
      link_label: card.linkLabel.trim(),
      link_url: card.linkHref.trim(),
      contact_only: card.contactOnly,
    })),

    cats: content.cats.map((cat) => ({
      id: cat.id,
      name: cat.name.trim(),
      is_visible: cat.visible,
    })),

    artists: content.artists.map((artist) => ({
      id: artist.id,
      name: artist.name.trim(),
      territory_code: artist.territory,
      portrait_url: artist.image.trim(),
      portrait_position: artist.pos,
      bio: artist.bio,
      is_published: artist.live,
      category_ids: artist.categoryIds,
    })),

    albums: content.albums.map((album) => ({
      id: album.id,
      title: album.title.trim(),
      kind: album.kind,
      is_published: album.live,
      show_on_home: album.home,
      media: trimmed(album.frames).map((url, index) => ({
        url,
        /* The cover's type is known; other frames are judged by extension. */
        media_type: (index === 0 ? album.video : isVideoSrc(url)) ? "video" : "image",
        object_position: index === 0 ? album.pos : DEFAULT_POSITION,
      })),
      credits: album.credits
        .filter((credit) => credit.name.trim())
        .map((credit) => ({ name: credit.name.trim(), role: credit.role.trim() })),
    })),

    slides: content.slides.map((slide) => ({
      id: slide.id,
      publication: slide.pub.trim(),
      credit_line: slide.credit.trim(),
      image_url: slide.src.trim(),
      object_position: slide.pos,
      caption_color: slide.ink,
    })),

    blocks: content.blocks.map((block) => ({
      id: block.id,
      label: block.label.trim(),
      layout: block.kind,
      source_kind: block.source,
      is_visible: block.on,
      album_id: block.albumId,
      image_url: block.image.trim(),
    })),
  };
}
