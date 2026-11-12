-- Hide instead of delete.
--
-- Pages and fixed page parts (the hero banner, the About copy…) are switched
-- off by key in site_settings.hidden_parts; list rows (hero slides, contact
-- cards, social links) carry their own is_visible flag. Hidden content stays
-- in the database and the dashboard, and comes back with one switch.
--
-- Hidden is not secret, so RLS is unchanged: the site filters in code.
-- Back up the database before running this.

alter table public.site_settings
  add column if not exists hidden_parts text[] not null default '{}';

alter table public.social_links
  add column if not exists is_visible boolean not null default true;

alter table public.contact_cards
  add column if not exists is_visible boolean not null default true;

alter table public.hero_slides
  add column if not exists is_visible boolean not null default true;

-- The three publish helpers below are the originals plus the new columns.

create or replace function private.publish_settings(p jsonb, p_revision bigint)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.site_settings (
    id, revision, brand_name, logo_asset_id, logo_alt, meta_title,
    meta_description, copyright, hidden_parts, published_at
  )
  values (
    1, p_revision, p ->> 'brand_name', private.media_asset_id(p ->> 'logo_url'),
    coalesce(p ->> 'logo_alt', ''), p ->> 'meta_title',
    coalesce(p ->> 'meta_description', ''), coalesce(p ->> 'copyright', ''),
    coalesce(array(select jsonb_array_elements_text(p -> 'hidden_parts')), '{}'),
    now()
  )
  on conflict (id) do update set
    revision = excluded.revision,
    brand_name = excluded.brand_name,
    logo_asset_id = excluded.logo_asset_id,
    logo_alt = excluded.logo_alt,
    meta_title = excluded.meta_title,
    meta_description = excluded.meta_description,
    copyright = excluded.copyright,
    hidden_parts = excluded.hidden_parts,
    published_at = excluded.published_at;

  -- Footer links and page copy are short value lists with nothing pointing at
  -- them, so they are replaced rather than diffed.
  delete from public.social_links where true;
  insert into public.social_links (sort_order, label, url, is_visible)
  select e.ord, e.item ->> 'label', e.item ->> 'url',
    coalesce((e.item ->> 'is_visible')::boolean, true)
  from jsonb_array_elements(coalesce(p -> 'social_links', '[]')) with ordinality as e(item, ord);

  delete from public.page_paragraphs where page_slug = 'about';
  insert into public.page_paragraphs (page_slug, sort_order, body)
  select 'about', e.ord, e.body
  from jsonb_array_elements_text(coalesce(p -> 'about_paragraphs', '[]')) with ordinality as e(body, ord);
end;
$$;

create or replace function private.publish_contact_cards(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.contact_cards as t (
    id, sort_order, heading, address_lines, phone, lead, email, link_label,
    link_url, contact_only, is_visible
  )
  select r.id, e.ord, r.heading, coalesce(r.address_lines, '{}'), coalesce(r.phone, ''),
    coalesce(r.lead, ''), coalesce(r.email, ''), coalesce(r.link_label, ''),
    coalesce(r.link_url, ''), coalesce(r.contact_only, false), coalesce(r.is_visible, true)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, heading text, address_lines text[], phone text, lead text,
    email text, link_label text, link_url text, contact_only boolean, is_visible boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    heading = excluded.heading,
    address_lines = excluded.address_lines,
    phone = excluded.phone,
    lead = excluded.lead,
    email = excluded.email,
    link_label = excluded.link_label,
    link_url = excluded.link_url,
    contact_only = excluded.contact_only,
    is_visible = excluded.is_visible
  where (t.sort_order, t.heading, t.address_lines, t.phone, t.lead, t.email,
         t.link_label, t.link_url, t.contact_only, t.is_visible)
    is distinct from
        (excluded.sort_order, excluded.heading, excluded.address_lines, excluded.phone,
         excluded.lead, excluded.email, excluded.link_label, excluded.link_url,
         excluded.contact_only, excluded.is_visible);

  delete from public.contact_cards t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;

create or replace function private.publish_hero_slides(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.hero_slides as t (
    id, sort_order, publication, credit_line, asset_id, object_position, caption_color,
    is_visible
  )
  select r.id, e.ord, r.publication, coalesce(r.credit_line, ''),
    private.media_asset_id(r.image_url), coalesce(r.object_position, '50% 18%'),
    coalesce(r.caption_color, '#fff'), coalesce(r.is_visible, true)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, publication text, credit_line text, image_url text,
    object_position text, caption_color text, is_visible boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    publication = excluded.publication,
    credit_line = excluded.credit_line,
    asset_id = excluded.asset_id,
    object_position = excluded.object_position,
    caption_color = excluded.caption_color,
    is_visible = excluded.is_visible
  where (t.sort_order, t.publication, t.credit_line, t.asset_id, t.object_position,
         t.caption_color, t.is_visible)
    is distinct from
        (excluded.sort_order, excluded.publication, excluded.credit_line,
         excluded.asset_id, excluded.object_position, excluded.caption_color,
         excluded.is_visible);

  delete from public.hero_slides t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;
