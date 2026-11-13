-- WhatsApp number on contact cards, shown on About and Contact as a wa.me link.
-- Additive: existing cards get an empty number and render as before.

alter table public.contact_cards
  add column if not exists whatsapp text not null default '';

create or replace function private.publish_contact_cards(p jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.contact_cards as t (
    id, sort_order, heading, address_lines, phone, whatsapp, lead, email, link_label,
    link_url, contact_only, is_visible
  )
  select r.id, e.ord, r.heading, coalesce(r.address_lines, '{}'), coalesce(r.phone, ''),
    coalesce(r.whatsapp, ''), coalesce(r.lead, ''), coalesce(r.email, ''),
    coalesce(r.link_label, ''), coalesce(r.link_url, ''), coalesce(r.contact_only, false),
    coalesce(r.is_visible, true)
  from jsonb_array_elements(p) with ordinality as e(item, ord)
  cross join lateral jsonb_to_record(e.item) as r(
    id uuid, heading text, address_lines text[], phone text, whatsapp text, lead text,
    email text, link_label text, link_url text, contact_only boolean, is_visible boolean
  )
  on conflict (id) do update set
    sort_order = excluded.sort_order,
    heading = excluded.heading,
    address_lines = excluded.address_lines,
    phone = excluded.phone,
    whatsapp = excluded.whatsapp,
    lead = excluded.lead,
    email = excluded.email,
    link_label = excluded.link_label,
    link_url = excluded.link_url,
    contact_only = excluded.contact_only,
    is_visible = excluded.is_visible
  where (t.sort_order, t.heading, t.address_lines, t.phone, t.whatsapp, t.lead, t.email,
         t.link_label, t.link_url, t.contact_only, t.is_visible)
    is distinct from
        (excluded.sort_order, excluded.heading, excluded.address_lines, excluded.phone,
         excluded.whatsapp, excluded.lead, excluded.email, excluded.link_label,
         excluded.link_url, excluded.contact_only, excluded.is_visible);

  delete from public.contact_cards t
  where not exists (
    select 1 from jsonb_array_elements(p) x where (x ->> 'id')::uuid = t.id
  );
end;
$$;
