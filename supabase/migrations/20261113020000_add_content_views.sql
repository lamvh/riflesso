-- View counts for the dashboard's Overview.
--
-- One row per (kind, ref, day) holding a running count — no visitor, IP,
-- cookie or user agent is stored, so nothing here identifies anyone.
--   kind 'page'   ref = public path, e.g. '/artists'
--   kind 'album'  ref = albums.id (opening its gallery on the homepage)
--   kind 'artist' ref = artist name (lingering on it in the directory)
-- Written only through track_content_view by the server (service role).

create table public.content_views (
  kind text not null check (kind in ('page', 'album', 'artist')),
  ref text not null check (char_length(ref) between 1 and 200),
  day date not null default current_date,
  views integer not null default 0 check (views >= 0),
  primary key (kind, ref, day)
);

create index content_views_day_idx on public.content_views (day desc);

alter table public.content_views enable row level security;
grant all on public.content_views to service_role;

create or replace function public.track_content_view(p_kind text, p_ref text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.content_views (kind, ref, day, views)
  values (p_kind, p_ref, current_date, 1)
  on conflict (kind, ref, day) do update
    set views = public.content_views.views + 1;
$$;

revoke all on function public.track_content_view(text, text) from public, anon, authenticated;
grant execute on function public.track_content_view(text, text) to service_role;
