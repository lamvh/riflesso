import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminArtist,
  Album,
  AlbumKind,
  Block,
  CategoryRow,
  Slide,
  Territory,
} from "@/lib/dashboard/admin-types";

import {
  DEFAULT_POSITION,
  type ContactCardRecord,
  type SiteSettings,
} from "./site-content-types";

/*
 * Reads from the relational schema in supabase/migrations, mapped back into
 * the records the dashboard and the public site work with. The same queries
 * serve both: the service role sees drafts, the anon key sees what RLS lets
 * through (published rows only).
 */

/** Supabase caps a response at 1000 rows by default; read in pages of that. */
const PAGE_SIZE = 1000;

type PageResult<T> = { data: T[] | null; error: { message: string } | null };

async function selectAll<T>(
  page: (from: number, to: number) => PromiseLike<unknown>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = (await page(from, from + PAGE_SIZE - 1)) as PageResult<T>;
    if (error) throw new Error(`Supabase read failed: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}

type AssetRef = { url: string; media_type?: "image" | "video" } | null;
const urlOf = (asset: AssetRef) => asset?.url ?? "";
const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

/**
 * The tables do not exist yet: Supabase is configured but the migration has
 * not been run. The site keeps serving its built-in content rather than
 * failing every page.
 */
function isMissingSchema(error: { code?: string; message: string }) {
  if (error.code !== "PGRST205" && error.code !== "42P01") return false;
  console.warn(
    `Supabase tables missing (${error.message}) — run supabase/migrations. Serving built-in content.`,
  );
  return true;
}

/** Null until the first publish has written the settings row. */
export async function queryRevision(client: SupabaseClient): Promise<number | null> {
  const { data, error } = await client
    .from("site_settings")
    .select("revision")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    if (isMissingSchema(error)) return null;
    throw new Error(`Supabase read failed: ${error.message}`);
  }
  return data ? Number(data.revision) : null;
}

type SettingsRow = {
  revision: number;
  brand_name: string;
  logo_alt: string;
  meta_title: string;
  meta_description: string;
  copyright: string;
  logo: AssetRef;
};

export async function querySettings(
  client: SupabaseClient,
): Promise<{ settings: SiteSettings; revision: number } | null> {
  const row = await client
    .from("site_settings")
    .select("revision, brand_name, logo_alt, meta_title, meta_description, copyright, logo:media_assets(url)")
    .eq("id", 1)
    .maybeSingle();
  if (row.error) {
    if (isMissingSchema(row.error)) return null;
    throw new Error(`Supabase read failed: ${row.error.message}`);
  }
  const settings = row.data as SettingsRow | null;
  if (!settings) return null;

  const [links, paragraphs] = await Promise.all([
    selectAll<{ label: string; url: string }>((from, to) =>
      client.from("social_links").select("label, url").order("sort_order").range(from, to),
    ),
    selectAll<{ body: string }>((from, to) =>
      client
        .from("page_paragraphs")
        .select("body")
        .eq("page_slug", "about")
        .order("sort_order")
        .range(from, to),
    ),
  ]);

  return {
    revision: Number(settings.revision),
    settings: {
      brandName: settings.brand_name,
      logoUrl: urlOf(settings.logo),
      logoAlt: settings.logo_alt,
      metaTitle: settings.meta_title,
      metaDescription: settings.meta_description,
      aboutParagraphs: paragraphs.map((paragraph) => paragraph.body),
      socialLinks: links.map((link) => ({ label: link.label, href: link.url })),
      copyright: settings.copyright,
    },
  };
}

export async function queryContactCards(client: SupabaseClient): Promise<ContactCardRecord[]> {
  const rows = await selectAll<{
    id: string;
    heading: string;
    address_lines: string[];
    phone: string;
    lead: string;
    email: string;
    link_label: string;
    link_url: string;
    contact_only: boolean;
  }>((from, to) =>
    client
      .from("contact_cards")
      .select("id, heading, address_lines, phone, lead, email, link_label, link_url, contact_only")
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map((row) => ({
    id: row.id,
    heading: row.heading,
    address: row.address_lines,
    tel: row.phone,
    lead: row.lead,
    email: row.email,
    linkLabel: row.link_label,
    linkHref: row.link_url,
    contactOnly: row.contact_only,
  }));
}

export async function queryCategories(client: SupabaseClient): Promise<CategoryRow[]> {
  const rows = await selectAll<{ id: string; name: string; is_visible: boolean }>(
    (from, to) =>
      client
        .from("categories")
        .select("id, name, is_visible")
        .order("sort_order")
        .order("id")
        .range(from, to),
  );
  return rows.map((row) => ({ id: row.id, name: row.name, visible: row.is_visible }));
}

export async function queryArtists(client: SupabaseClient): Promise<AdminArtist[]> {
  const rows = await selectAll<{
    id: string;
    name: string;
    territory_code: Territory;
    portrait_position: string;
    bio: string;
    is_published: boolean;
    portrait: AssetRef;
    artist_categories: { category_id: string; sort_order: number }[];
  }>((from, to) =>
    client
      .from("artists")
      .select(
        "id, name, territory_code, portrait_position, bio, is_published, portrait:media_assets(url), artist_categories(category_id, sort_order)",
      )
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    categoryIds: [...row.artist_categories].sort(bySortOrder).map((link) => link.category_id),
    territory: row.territory_code,
    image: urlOf(row.portrait),
    pos: row.portrait_position,
    live: row.is_published,
    bio: row.bio,
  }));
}

export async function queryAlbums(
  client: SupabaseClient,
  { homeOnly = false }: { homeOnly?: boolean } = {},
): Promise<Album[]> {
  const rows = await selectAll<{
    id: string;
    title: string;
    kind: AlbumKind;
    is_published: boolean;
    show_on_home: boolean;
    album_media: { sort_order: number; object_position: string; asset: AssetRef }[];
    album_credits: { sort_order: number; name: string; role: string }[];
  }>((from, to) => {
    let query = client
      .from("albums")
      .select(
        "id, title, kind, is_published, show_on_home, album_media(sort_order, object_position, asset:media_assets(url, media_type)), album_credits(sort_order, name, role)",
      );
    if (homeOnly) query = query.eq("show_on_home", true);
    return query.order("sort_order").order("id").range(from, to);
  });

  return rows.map((row) => {
    const media = [...row.album_media].sort(bySortOrder);
    const cover = media[0];
    return {
      id: row.id,
      title: row.title,
      kind: row.kind,
      frames: media.map((frame) => urlOf(frame.asset)),
      cover: urlOf(cover?.asset ?? null),
      pos: cover?.object_position ?? DEFAULT_POSITION,
      video: cover?.asset?.media_type === "video",
      live: row.is_published,
      home: row.show_on_home,
      credits: [...row.album_credits]
        .sort(bySortOrder)
        .map((credit) => ({ name: credit.name, role: credit.role })),
    };
  });
}

export async function queryHeroSlides(client: SupabaseClient): Promise<Slide[]> {
  const rows = await selectAll<{
    id: string;
    publication: string;
    credit_line: string;
    object_position: string;
    caption_color: string;
    image: AssetRef;
  }>((from, to) =>
    client
      .from("hero_slides")
      .select("id, publication, credit_line, object_position, caption_color, image:media_assets(url)")
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map((row) => ({
    id: row.id,
    pub: row.publication,
    credit: row.credit_line,
    src: urlOf(row.image),
    pos: row.object_position,
    ink: row.caption_color,
  }));
}

export async function queryHomeSections(client: SupabaseClient): Promise<Block[]> {
  const rows = await selectAll<{
    id: string;
    label: string;
    layout: Block["kind"];
    source_kind: AlbumKind;
    is_visible: boolean;
    album_id: string | null;
    image: AssetRef;
  }>((from, to) =>
    client
      .from("home_sections")
      .select("id, label, layout, source_kind, is_visible, album_id, image:media_assets(url)")
      .order("sort_order")
      .order("id")
      .range(from, to),
  );
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    kind: row.layout,
    source: row.source_kind,
    on: row.is_visible,
    albumId: row.album_id,
    image: urlOf(row.image),
  }));
}
