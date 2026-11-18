-- Separate crop for a hero slide's tile in the thumbnail strip under the
-- banner. The tile is small and wide (177 x 110), so it often needs a
-- different focus than the full-screen frame. '' means "same as desktop"
-- (object_position). Additive: existing slides get '' and their tiles follow
-- the desktop crop.

alter table public.hero_slides
  add column if not exists object_position_thumb text not null default '';

create or replace function private.publish_hero_slides(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.hero_slides as t (
    id, sort_order, publication, credit_line, asset_id, object_position,
    object_position_tablet, object_position_mobile, object_position_thumb,
    caption_color, is_visible
  )
  select r.id, e.ord, r.publication, coalesce(r.credit_line, ''),
    private.media_asset_id(r.image_url), coalesce(r.object_position, '50% 18%'),
    coalesce(r.object_position_tablet, ''), coalesce(r.object_position_mobile, ''),
    coalesce(r.object_position_thumb, ''),
    coalesce(r.caption_color, '#fff'), coalesce(r.is_visible, true)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, publication text, credit_line text, image_url text,
    object_position text, object_position_tablet text, object_position_mobile text,
    object_position_thumb text, caption_color text, is_visible boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    publication = excluded.publication,
    credit_line = excluded.credit_line,
    asset_id = excluded.asset_id,
    object_position = excluded.object_position,
    object_position_tablet = excluded.object_position_tablet,
    object_position_mobile = excluded.object_position_mobile,
    object_position_thumb = excluded.object_position_thumb,
    caption_color = excluded.caption_color,
    is_visible = excluded.is_visible
  where (t.sort_order, t.publication, t.credit_line, t.asset_id, t.object_position,
         t.object_position_tablet, t.object_position_mobile, t.object_position_thumb,
         t.caption_color, t.is_visible)
    is distinct from
        (excluded.sort_order, excluded.publication, excluded.credit_line,
         excluded.asset_id, excluded.object_position, excluded.object_position_tablet,
         excluded.object_position_mobile, excluded.object_position_thumb,
         excluded.caption_color, excluded.is_visible);

  delete from public.hero_slides t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;
