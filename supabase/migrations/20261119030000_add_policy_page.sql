-- The /policy page (Site → Policy in the dashboard): title, "last updated"
-- date and a body in simple markdown, as one jsonb document on site_settings:
-- { "title": text, "updated": "YYYY-MM-DD", "body": text }.
-- '{}' means "not set" and reads as the built-in policy text (see
-- src/lib/content/site-policy.ts). Additive: the site behaves as before.

alter table public.site_settings
  add column if not exists policy jsonb not null default '{}'::jsonb;

create or replace function private.publish_settings(p jsonb, p_revision bigint)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.site_settings (
    id, revision, brand_name, logo_asset_id, logo_alt, meta_title,
    meta_description, copyright, hidden_parts, seo, hero_autoplay, policy, published_at
  )
  values (
    1, p_revision, p ->> 'brand_name', private.media_asset_id(p ->> 'logo_url'),
    coalesce(p ->> 'logo_alt', ''), p ->> 'meta_title',
    coalesce(p ->> 'meta_description', ''), coalesce(p ->> 'copyright', ''),
    coalesce(array(select jsonb_array_elements_text(p -> 'hidden_parts')), '{}'),
    coalesce(p -> 'seo', '{}'::jsonb),
    coalesce(p -> 'hero_autoplay', '{}'::jsonb),
    coalesce(p -> 'policy', '{}'::jsonb),
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
    seo = excluded.seo,
    hero_autoplay = excluded.hero_autoplay,
    policy = excluded.policy,
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
